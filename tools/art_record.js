/* Record the canvas calls the game makes when it draws one building, so they can
 * be replayed into a real image by tools/art_replay.py.
 *
 * Without this the only way to judge procedural art is to read the drawing code
 * and picture it, which is how a reference gets misread. The first pass at the
 * Blacksmith looked fine as code and turned out to have the dividing beam drawn
 * straight through the chimney, a heat wash flattening the whole roof, and an
 * anvil that read as a cooking pot. None of that was visible until it rendered.
 *
 *   node tools/art_record.js smith 0 0.4 /tmp/smith.json
 *   python3 tools/art_replay.py /tmp/smith.json /tmp/smith.png
 *
 * Args: <type> <owner 0|1> [anim phase] [out.json]. The anim phase matters for
 * anything that pulses -- the forge glow, the Altar -- so render a couple of
 * phases before believing it.
 */
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const H = require(path.join(ROOT, 'tools', 'harness.js'));

const ops = [];
function col(v) {
  if (v && typeof v === 'object' && v.__grad) return v;
  return String(v);
}
function makeRecorder() {
  const st = { fillStyle: '#000', strokeStyle: '#000', lineWidth: 1, globalAlpha: 1 };
  const stack = [];
  let path2 = [];      // array of subpaths, each an array of [x,y]
  let cur = null;
  const push = (o) => ops.push(o);
  const r = {
    canvas: { width: 1600, height: 900 },
    font: '', textAlign: '', lineCap: 'butt', lineJoin: 'miter',
    imageSmoothingEnabled: false, globalCompositeOperation: 'source-over',
    get fillStyle() { return st.fillStyle; }, set fillStyle(v) { st.fillStyle = col(v); },
    get strokeStyle() { return st.strokeStyle; }, set strokeStyle(v) { st.strokeStyle = col(v); },
    get lineWidth() { return st.lineWidth; }, set lineWidth(v) { st.lineWidth = v; },
    get globalAlpha() { return st.globalAlpha; }, set globalAlpha(v) { st.globalAlpha = v; },
    save() { stack.push(Object.assign({}, st)); },
    restore() { const s = stack.pop(); if (s) Object.assign(st, s); },
    setTransform() { }, resetTransform() { }, translate() { }, scale() { }, rotate() { }, clip() { },
    clearRect() { }, drawImage() { }, putImageData() { },
    fillText() { }, strokeText() { }, measureText: () => ({ width: 10 }),
    createImageData(a, b) { const W = a.width || a, H = b || a.height; return { width: W, height: H, data: new Uint8ClampedArray(W * H * 4) }; },
    getImageData: (x, y, a, b) => ({ width: a, height: b, data: new Uint8ClampedArray(a * b * 4) }),
    createPattern: () => null,
    createLinearGradient(x0, y0, x1, y1) {
      const g = { __grad: 'linear', c: [x0, y0, x1, y1], stops: [], addColorStop(p, c) { g.stops.push([p, c]); } };
      return g;
    },
    createRadialGradient(x0, y0, r0, x1, y1, r1) {
      const g = { __grad: 'radial', c: [x0, y0, r0, x1, y1, r1], stops: [], addColorStop(p, c) { g.stops.push([p, c]); } };
      return g;
    },
    fillRect(x, y, w, h) { push({ op: 'rect', fill: st.fillStyle, a: st.globalAlpha, x, y, w, h }); },
    strokeRect(x, y, w, h) { push({ op: 'rectS', stroke: st.strokeStyle, lw: st.lineWidth, a: st.globalAlpha, x, y, w, h }); },
    beginPath() { path2 = []; cur = null; },
    closePath() { if (cur && cur.length > 2) cur.push(cur[0].slice()); },
    moveTo(x, y) { cur = [[x, y]]; path2.push(cur); },
    lineTo(x, y) { if (!cur) { cur = [[x, y]]; path2.push(cur); } else cur.push([x, y]); },
    quadraticCurveTo(cx, cy, x, y) {
      if (!cur) return;
      const [px, py] = cur[cur.length - 1];
      for (let i = 1; i <= 10; i++) {
        const t = i / 10, u = 1 - t;
        cur.push([u * u * px + 2 * u * t * cx + t * t * x, u * u * py + 2 * u * t * cy + t * t * y]);
      }
    },
    bezierCurveTo(c1x, c1y, c2x, c2y, x, y) {
      if (!cur) return;
      const [px, py] = cur[cur.length - 1];
      for (let i = 1; i <= 12; i++) {
        const t = i / 12, u = 1 - t;
        cur.push([u * u * u * px + 3 * u * u * t * c1x + 3 * u * t * t * c2x + t * t * t * x,
                  u * u * u * py + 3 * u * u * t * c1y + 3 * u * t * t * c2y + t * t * t * y]);
      }
    },
    arc(cx, cy, rad, a0, a1, ccw) {
      let d = a1 - a0;
      if (!ccw && d < 0) d += Math.PI * 2;
      if (ccw && d > 0) d -= Math.PI * 2;
      const n = Math.max(8, Math.ceil(Math.abs(d) / 0.18));
      const pts = [];
      for (let i = 0; i <= n; i++) {
        const a = a0 + d * i / n;
        pts.push([cx + Math.cos(a) * rad, cy + Math.sin(a) * rad]);
      }
      if (cur) { for (const p of pts) cur.push(p); }
      else { cur = pts; path2.push(cur); }
    },
    ellipse(cx, cy, rx, ry, rot, a0, a1, ccw) {
      let d = a1 - a0;
      if (!ccw && d < 0) d += Math.PI * 2;
      const n = Math.max(10, Math.ceil(Math.abs(d) / 0.18));
      const pts = [];
      for (let i = 0; i <= n; i++) {
        const a = a0 + d * i / n;
        const ex = Math.cos(a) * rx, ey = Math.sin(a) * ry;
        pts.push([cx + ex * Math.cos(rot) - ey * Math.sin(rot),
                  cy + ex * Math.sin(rot) + ey * Math.cos(rot)]);
      }
      if (cur) { for (const p of pts) cur.push(p); } else { cur = pts; path2.push(cur); }
    },
    arcTo(x1, y1, x2, y2, rad) {   // good enough: corner-cut toward the control point
      if (!cur) { cur = [[x1, y1]]; path2.push(cur); return; }
      const [x0, y0] = cur[cur.length - 1];
      const d1 = Math.hypot(x1 - x0, y1 - y0) || 1, d2 = Math.hypot(x2 - x1, y2 - y1) || 1;
      const t1 = Math.min(rad / d1, 0.5), t2 = Math.min(rad / d2, 0.5);
      const ax = x1 + (x0 - x1) * t1, ay = y1 + (y0 - y1) * t1;
      const bx = x1 + (x2 - x1) * t2, by = y1 + (y2 - y1) * t2;
      cur.push([ax, ay]);
      for (let i = 1; i <= 6; i++) {
        const t = i / 6, u = 1 - t;
        cur.push([u * u * ax + 2 * u * t * x1 + t * t * bx, u * u * ay + 2 * u * t * y1 + t * t * by]);
      }
    },
    rect(x, y, w, h) { cur = [[x, y], [x + w, y], [x + w, y + h], [x, y + h], [x, y]]; path2.push(cur); },
    fill() { if (path2.length) push({ op: 'fill', fill: st.fillStyle, a: st.globalAlpha, paths: JSON.parse(JSON.stringify(path2)) }); },
    stroke() { if (path2.length) push({ op: 'stroke', stroke: st.strokeStyle, lw: st.lineWidth, a: st.globalAlpha, paths: JSON.parse(JSON.stringify(path2)) }); }
  };
  return r;
}

const REC = makeRecorder();
function makeEl(tag, id) {
  const el = {
    tagName: (tag || 'div').toUpperCase(), id: id || '', width: 300, height: 150,
    style: {}, dataset: {}, value: '', textContent: '', innerHTML: '', title: '',
    childNodes: [], parentNode: null, offsetWidth: 120, offsetHeight: 60,
    classList: { _s: new Set(), add() { }, remove() { }, contains: () => false, toggle() { } },
    addEventListener() { }, removeEventListener() { }, focus() { }, blur() { },
    appendChild(c) { this.childNodes.push(c); return c; },
    removeChild(c) { const i = this.childNodes.indexOf(c); if (i >= 0) this.childNodes.splice(i, 1); return c; },
    getContext() { return (this.id === 'world') ? REC : H.fakeCtx(this.width, this.height); },
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 156, height: 156, right: 156, bottom: 156 }),
    closest: () => null, querySelectorAll: () => [],
    get firstChild() { return this.childNodes[0] || null; }
  };
  return el;
}
const els = {};
global.document = {
  getElementById(id) { if (!els[id]) els[id] = makeEl(id.match(/world|portrait|minimap/) ? 'canvas' : 'div', id); return els[id]; },
  createElement: (tag) => makeEl(tag), querySelectorAll: () => [], activeElement: null, addEventListener() { }
};
global.window = {
  innerWidth: 1600, innerHeight: 900, devicePixelRatio: 1,
  addEventListener() { }, removeEventListener() { }, matchMedia: () => ({ matches: false }),
  AudioContext: H.FakeAudioContext, webkitAudioContext: H.FakeAudioContext
};
global.performance = { now: () => Date.now() };
global.requestAnimationFrame = () => 0;

const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const a = html.indexOf('<script>') + 8, b = html.lastIndexOf('</script>');
const world = document.getElementById('world');
world.width = 1600; world.height = 900;
eval(html.slice(a, b) + `
;globalThis.__draw = { drawBuildingShape, spawnBuilding, startGame, BUILDINGS, TILE, getG: () => G };
`);
const D = globalThis.__draw;
const type = process.argv[2] || 'smith';
const owner = parseInt(process.argv[3] || '0', 10);
const anim = parseFloat(process.argv[4] || '0.4');

D.startGame('ART', 'normal');
const bd = D.spawnBuilding(type, owner, 30, 30, true);
bd.anim = anim; bd.built = true; bd.hp = bd.maxHp; bd.hitFlash = 0;
bd.queue = []; bd.upKind = null; bd.reviveTotal = 0;
const W = bd.tw * D.TILE, Hh = bd.th * D.TILE;
ops.length = 0;
D.drawBuildingShape(bd, W / 2 + 20, Hh / 2 + 20);
fs.writeFileSync(process.argv[5] || (type + '.json'), JSON.stringify({ w: W + 40, h: Hh + 40, ops }));
console.log('recorded ' + ops.length + ' ops for ' + type);
