"""Boundary-safe case replacement for index.html.

The bug that corrupted the file was using s.index("    case 'wolf': {") to find a
case in drawBust — it matched the identical label in drawUnit, which sits earlier
in the file, so the end marker landed before the start marker and the splice
duplicated everything between them. Every lookup here is scoped to one function's
byte range first, and every result is asserted before anything is written.
"""
import re

REGIONS = {
    'drawUnit': ('function drawUnit(e, x, y) {', '/* ---------- portrait busts'),
    'drawBust': ('function drawBust(e) {', '/* ---------- buildings'),
    'drawBuildingShape': ('function drawBuildingShape(b, x, y) {', 'function drawFlag('),
}


def region(src, func):
    a_mark, b_mark = REGIONS[func]
    assert src.count(a_mark) == 1, '%s start marker is not unique (%d)' % (func, src.count(a_mark))
    assert src.count(b_mark) == 1, '%s end marker is not unique (%d)' % (func, src.count(b_mark))
    a, b = src.index(a_mark), src.index(b_mark)
    assert a < b, '%s region is inverted — refusing to splice' % func
    return a, b


def case_span(src, func, key):
    """Byte span of `case '<key>':` through to the next case/default, within func."""
    a, b = region(src, func)
    body = src[a:b]
    # `default:` may or may not carry a brace — drawBuildingShape's does not, and
    # missing it made the smith span run to the end of the function.
    labels = [(m.start(), m.group(1)) for m in
              re.finditer(r"^    case '([a-z]+)':|^    default:", body, re.M)]
    starts = [(p, k) for p, k in labels]
    idx = next((i for i, (p, k) in enumerate(starts) if k == key), None)
    assert idx is not None, 'no case %r in %s' % (key, func)
    # walk back over stacked labels (case 'bandit': / case 'slinger': share a body)
    s0 = starts[idx][0]
    while idx > 0 and body[starts[idx - 1][0]:s0].strip().endswith(':'):
        idx -= 1
        s0 = starts[idx][0]
    nxt = next((p for p, k in starts if p > starts[idx][0] and
                not body[starts[idx][0]:p].strip().endswith(':')), len(body))
    return a + s0, a + nxt


def replace_case(src, func, key, new_text):
    s0, s1 = case_span(src, func, key)
    assert s0 < s1, 'inverted span for %s/%s' % (func, key)
    out = src[:s0] + new_text.rstrip('\n') + '\n\n' + src[s1:]
    # the structure must not change: same number of function definitions either way
    for f in REGIONS:
        before = src.count(REGIONS[f][0])
        after = out.count(REGIONS[f][0])
        assert before == after == 1, '%s definition count changed: %d -> %d' % (f, before, after)
    return out


def check(path):
    """Post-write sanity: one of each function, two of each case label, no leaks."""
    src = open(path).read()
    for f in REGIONS:
        assert src.count(REGIONS[f][0]) == 1, '%s defined %d times' % (f, src.count(REGIONS[f][0]))
    ua, ub = region(src, 'drawUnit')
    ba, bb = region(src, 'drawBust')
    leak = sorted(set(re.findall(r'(?<![A-Za-z0-9_.$])(yy|fx|fy|walk)(?![A-Za-z0-9_])', src[ba:bb])))
    assert not leak, 'drawUnit variables leaked into drawBust: %s' % leak
    for k in ['laborer', 'footman', 'archer', 'siege', 'hero', 'wolf', 'golem']:
        n = src.count("case '%s':" % k)
        assert n == 2, "case '%s' appears %d times, expected 2" % (k, n)
    for k in ['farm', 'barracks', 'workshop', 'altar', 'tower', 'smith']:
        n = src.count("case '%s':" % k)
        assert n == 1, "building case '%s' appears %d times, expected 1" % (k, n)
    return 'structure ok: 1 drawUnit, 1 drawBust, no leaks, %d bytes' % len(src)
