"""Replay the canvas ops recorded by art_record.js into a PNG, so procedural
building art can be looked at instead of imagined.

    node tools/art_record.js farm 0 0.4 /tmp/farm.json
    python3 tools/art_replay.py /tmp/farm.json /tmp/farm.png

Draws at 8x and downsamples, which gives usable antialiasing without a real
canvas. Gradients are rendered per pixel and masked through the shape. Needs
Pillow and nothing else -- there is deliberately no node-canvas in this repo.

It is an approximation, not a browser: arcTo is a corner cut, strokes are
polylines with no mitring, and compositing modes are ignored. It is accurate
enough for layout, colour, contrast and whether a thing reads, which is what
art review actually needs.
"""
import json, sys, re, math
from PIL import Image, ImageDraw

S = 8  # supersample factor


def parse_color(c):
    if isinstance(c, dict):
        return None
    c = c.strip()
    m = re.match(r'rgba?\(([^)]+)\)', c)
    if m:
        parts = [p.strip() for p in m.group(1).split(',')]
        r, g, b = (int(float(p)) for p in parts[:3])
        a = float(parts[3]) if len(parts) > 3 else 1.0
        return (r, g, b, max(0, min(255, int(a * 255))))
    if c.startswith('#'):
        h = c[1:]
        if len(h) == 3:
            h = ''.join(ch * 2 for ch in h)
        return (int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16), 255)
    named = {'white': (255, 255, 255, 255), 'black': (0, 0, 0, 255), 'red': (255, 0, 0, 255)}
    return named.get(c.lower(), (255, 0, 255, 255))


def grad_image(g, size):
    """Render a gradient across the whole canvas; it gets masked by the shape."""
    W, H = size
    img = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    px = img.load()
    stops = [(p, parse_color(c)) for p, c in g['stops']]
    if not stops:
        return img
    stops.sort(key=lambda s: s[0])

    def at(t):
        t = max(0.0, min(1.0, t))
        if t <= stops[0][0]:
            return stops[0][1]
        if t >= stops[-1][0]:
            return stops[-1][1]
        for i in range(len(stops) - 1):
            p0, c0 = stops[i]
            p1, c1 = stops[i + 1]
            if p0 <= t <= p1:
                k = 0 if p1 == p0 else (t - p0) / (p1 - p0)
                return tuple(int(c0[j] + (c1[j] - c0[j]) * k) for j in range(4))
        return stops[-1][1]

    if g['__grad'] == 'linear':
        x0, y0, x1, y1 = [v * S for v in g['c']]
        dx, dy = x1 - x0, y1 - y0
        den = dx * dx + dy * dy
        for y in range(H):
            for x in range(W):
                t = 0.0 if den == 0 else ((x - x0) * dx + (y - y0) * dy) / den
                px[x, y] = at(t)
    else:
        x0, y0, r0, x1, y1, r1 = [v * S for v in g['c']]
        for y in range(H):
            for x in range(W):
                d = math.hypot(x - x1, y - y1)
                t = 0.0 if r1 == r0 else (d - r0) / (r1 - r0)
                px[x, y] = at(t)
    return img


def main(src, out):
    doc = json.load(open(src))
    W, H = int(doc['w'] * S), int(doc['h'] * S)
    img = Image.new('RGBA', (W, H), (110, 120, 96, 255))   # grass-ish ground

    def shapes_of(op):
        if op['op'] in ('rect', 'rectS'):
            x, y, w, h = op['x'] * S, op['y'] * S, op['w'] * S, op['h'] * S
            return [[(x, y), (x + w, y), (x + w, y + h), (x, y + h)]]
        return [[(p[0] * S, p[1] * S) for p in sp] for sp in op['paths']]

    for op in doc['ops']:
        alpha = op.get('a', 1)
        style = op.get('fill') if op['op'] in ('rect', 'fill') else op.get('stroke')
        is_fill = op['op'] in ('rect', 'fill')
        polys = shapes_of(op)
        col = parse_color(style) if not isinstance(style, dict) else None

        layer = Image.new('RGBA', (W, H), (0, 0, 0, 0))
        d = ImageDraw.Draw(layer)
        paint = col if col else (255, 255, 255, 255)
        for sp in polys:
            if len(sp) < 2:
                continue
            if is_fill:
                if len(sp) >= 3:
                    d.polygon(sp, fill=paint)
            else:
                lw = max(1, int(round(op.get('lw', 1) * S)))
                pts = sp
                if op['op'] == 'rectS':
                    pts = sp + [sp[0]]
                d.line(pts, fill=paint, width=lw, joint='curve')

        if isinstance(style, dict):
            g = grad_image(style, (W, H))
            mask = layer.split()[3]
            layer = Image.new('RGBA', (W, H), (0, 0, 0, 0))
            layer.paste(g, (0, 0), mask)

        if alpha < 1:
            a = layer.split()[3].point(lambda v: int(v * alpha))
            layer.putalpha(a)
        img = Image.alpha_composite(img, layer)

    img.resize((doc['w'] * 4, doc['h'] * 4), Image.LANCZOS).save(out)
    print('wrote', out, doc['w'] * 4, 'x', doc['h'] * 4, '(%d ops)' % len(doc['ops']))


main(sys.argv[1], sys.argv[2])
