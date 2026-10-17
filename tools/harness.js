/* Headless harness for Emberfall.
 *
 * Loads index.html, extracts the inline script, and runs it against stubs for
 * the browser APIs the game touches. Everything the game does except painting
 * pixels and making noise happens for real: simulation, pathfinding, AI,
 * rendering calls, HUD updates.
 *
 * The stubs are deliberately strict rather than permissive. A stub that accepts
 * anything lets bugs through — a BiquadFilterNode whose `Q` could be assigned
 * directly hid a crash that froze the game on the first sword blow. Where the
 * real API refuses something, these refuse it too.
 *
 *   const H = require('./harness');
 *   const { A, G } = H.load();
 *   A.startGame('SEED', 'normal', { selfPlay: true });
 *   for (let i = 0; i < 1000; i++) A.simTick();
 */
'use strict';
const fs = require('fs');
const path = require('path');

/* ---------- canvas ---------- */
function fakeCtx(w, h) {
  const grad = { addColorStop() { } };
  return {
    canvas: { width: w, height: h },
    fillStyle: '', strokeStyle: '', lineWidth: 1, font: '', textAlign: '',
    globalAlpha: 1, lineCap: 'butt', lineJoin: 'miter',
    imageSmoothingEnabled: false, globalCompositeOperation: 'source-over',
    setTransform() { }, resetTransform() { }, save() { }, restore() { },
    translate() { }, scale() { }, rotate() { }, clip() { },
    clearRect() { }, fillRect() { }, strokeRect() { },
    beginPath() { }, closePath() { }, moveTo() { }, lineTo() { },
    arc() { }, arcTo() { }, ellipse() { }, rect() { },
    quadraticCurveTo() { }, bezierCurveTo() { }, fill() { }, stroke() { },
    fillText() { }, strokeText() { }, measureText: () => ({ width: 10 }),
    drawImage() { }, createLinearGradient: () => grad, createRadialGradient: () => grad,
    createPattern: () => null,
    createImageData(a, b) {
      const W = a.width || a, H2 = b || a.height;
      return { width: W, height: H2, data: new Uint8ClampedArray(W * H2 * 4) };
    },
    getImageData: (x, y, a, b) => ({ width: a, height: b, data: new Uint8ClampedArray(a * b * 4) }),
    putImageData() { }
  };
}

/* ---------- Web Audio ----------
   Q / gain / frequency are AudioParam objects behind getters in the real API,
   so `node.Q = 1.2` throws. Reproduced here on purpose. */
function audioParam(v) {
  const p = {
    value: v,
    setValueAtTime: () => p, linearRampToValueAtTime: () => p,
    exponentialRampToValueAtTime: () => p, setTargetAtTime: () => p,
    cancelScheduledValues: () => p
  };
  return p;
}
function withParams(obj, names) {
  for (const n of names) {
    const param = audioParam(1);
    Object.defineProperty(obj, n, { get: () => param, enumerable: true, configurable: false });
  }
  return obj;
}
class FakeAudioContext {
  constructor() {
    this.currentTime = 0; this.sampleRate = 48000; this.state = 'running';
    this.destination = { connect() { }, disconnect() { } };
  }
  resume() { this.state = 'running'; return Promise.resolve(); }
  createGain() { return withParams({ connect() { }, disconnect() { } }, ['gain']); }
  createOscillator() {
    return withParams({ type: 'sine', connect() { }, disconnect() { }, start() { }, stop() { } },
      ['frequency', 'detune']);
  }
  createBiquadFilter() {
    return withParams({ type: 'lowpass', connect() { }, disconnect() { } },
      ['Q', 'frequency', 'gain', 'detune']);
  }
  createBufferSource() {
    return withParams({ buffer: null, connect() { }, disconnect() { }, start() { }, stop() { } },
      ['playbackRate', 'detune']);
  }
  createBuffer(ch, len) {
    return { numberOfChannels: ch, length: len, getChannelData: () => new Float32Array(len) };
  }
}

/* ---------- DOM ---------- */
function makeEl(tag, id) {
  const el = {
    tagName: (tag || 'div').toUpperCase(), id: id || '', width: 300, height: 150,
    style: {}, dataset: {}, value: '', textContent: '', innerHTML: '', title: '',
    childNodes: [], parentNode: null, offsetWidth: 120, offsetHeight: 60,
    classList: {
      _s: new Set(),
      add(c) { this._s.add(c); }, remove(c) { this._s.delete(c); },
      contains(c) { return this._s.has(c); },
      toggle(c, on) {
        if (on === undefined) { this._s.has(c) ? this._s.delete(c) : this._s.add(c); }
        else if (on) this._s.add(c); else this._s.delete(c);
      }
    },
    _ev: null,
    addEventListener(type, fn) { if (!this._ev) this._ev = {}; (this._ev[type] = this._ev[type] || []).push(fn); },
    removeEventListener(type, fn) {
      if (!this._ev || !this._ev[type]) return;
      const i = this._ev[type].indexOf(fn);
      if (i >= 0) this._ev[type].splice(i, 1);
    },
    focus() { }, blur() { },
    appendChild(c) { this.childNodes.push(c); c.parentNode = this; return c; },
    removeChild(c) {
      const i = this.childNodes.indexOf(c);
      if (i >= 0) this.childNodes.splice(i, 1);
      c.parentNode = null; return c;
    },
    getContext() { if (!this._ctx) this._ctx = fakeCtx(this.width, this.height); return this._ctx; },
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 156, height: 156, right: 156, bottom: 156 }),
    closest: () => null, querySelectorAll: () => [],
    get firstChild() { return this.childNodes[0] || null; }
  };
  return el;
}

/* Input was the one part of the game with no test coverage, because the stubs
   swallowed every listener. These record them instead, so a test can press a
   key or drag the mouse and assert on what happened. */
function listenerHub() {
  const ev = {};
  return {
    _ev: ev,
    addEventListener(type, fn) { (ev[type] = ev[type] || []).push(fn); },
    removeEventListener(type, fn) {
      if (!ev[type]) return;
      const i = ev[type].indexOf(fn);
      if (i >= 0) ev[type].splice(i, 1);
    }
  };
}
function fireOn(target, type, props) {
  const bag = target && target._ev;
  if (!bag || !bag[type]) return 0;
  const e = Object.assign({
    type: type, preventDefault() { }, stopPropagation() { },
    shiftKey: false, ctrlKey: false, metaKey: false, altKey: false,
    button: 0, clientX: 0, clientY: 0, deltaY: 0,
    target: { closest: () => null }
  }, props || {});
  for (const fn of bag[type].slice()) fn(e);
  return bag[type].length;
}

const EXPORTS = `
;globalThis.__emberfall = {
  startGame, simTick, render, drawMinimap, refreshTop, refreshInfo, buildCard, afterSelect,
  playerUnits, playerBuildings, countUnits, countBuildings, fmtTime, helpHTML, endGame,
  spawnUnit, spawnBuilding, startConstruction, queueUnit, cancelConstruction, canPlaceAt,
  setOrder, cmdMove, cmdAttackMove, smartCommand, cmdGatherGold, cmdGatherLumber,
  startCast, learnAbility, canLearn, heroLevelUp, useItem, startRevive, startKeepUpgrade,
  startUpgradeResearch, killEntity, dealDamage, nearestMine, findTree, pickEntity,
  runCheat, sfx, sfxAt, sfxInit, upkeepTier,
  UNITS, BUILDINGS, CONFIG, ABIL, DIFF, CHEATS,
  getG: () => G, getCARD: () => CARD, getSND: () => SND,
  setCardMode: (m) => { cardMode = m; }
};
`;

function load(opts) {
  const root = (opts && opts.root) || path.join(__dirname, '..');
  const els = {};
  const docHub = listenerHub();
  global.document = {
    getElementById(id) { if (!els[id]) els[id] = makeEl(id.match(/world|portrait|minimap/) ? 'canvas' : 'div', id); return els[id]; },
    createElement: (tag) => makeEl(tag),
    querySelectorAll: () => [],
    activeElement: null,
    addEventListener(type, fn) { (docHub._ev[type] = docHub._ev[type] || []).push(fn); },
    removeEventListener(type, fn) { docHub.removeEventListener(type, fn); },
    _ev: null
  };
  global.document._ev = docHub._ev;
  const winHub = listenerHub();
  global.window = Object.assign(winHub, {
    innerWidth: 1600, innerHeight: 900, devicePixelRatio: 1,
    matchMedia: () => ({ matches: false }),
    AudioContext: FakeAudioContext, webkitAudioContext: FakeAudioContext
  });
  global.performance = { now: () => Date.now() };
  global.requestAnimationFrame = () => 0;
  // navigator is a read-only getter on globalThis in modern Node; the game never
  // reads it, so define it only where that is actually permitted.
  if (!global.navigator) {
    try { Object.defineProperty(global, 'navigator', { value: { userAgent: 'node' }, configurable: true }); }
    catch (e) { /* fine — unused */ }
  }

  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const a = html.indexOf('<script>') + '<script>'.length;
  const b = html.lastIndexOf('</script>');
  if (a < 8 || b < a) throw new Error('could not find the inline script in index.html');

  const world = document.getElementById('world');
  world.width = 1600; world.height = 900;
  // The HUD's real height comes from CSS (176px). The generic element stub
  // reports 60, which quietly made every hudH() calculation wrong headlessly —
  // including the zoom floor, which is derived from the usable view height.
  document.getElementById('hud').offsetHeight = 176;
  document.getElementById('portrait').width = 76;
  document.getElementById('portrait').height = 76;
  document.getElementById('minimap').width = 96;
  document.getElementById('minimap').height = 96;

  // eslint-disable-next-line no-eval
  eval(html.slice(a, b) + EXPORTS);
  const A = globalThis.__emberfall;
  const ui = {
    /* fire('world', 'mousedown', {clientX: 10}) etc. 'window' and 'document'
       are valid target names too. */
    fire(target, type, props) {
      const t = target === 'window' ? global.window
              : target === 'document' ? global.document
              : document.getElementById(target);
      return fireOn(t, type, props);
    },
    key(k, props) {
      fireOn(global.window, 'keydown', Object.assign({ key: k }, props || {}));
      fireOn(global.window, 'keyup', Object.assign({ key: k }, props || {}));
    },
    keyDown(k, props) { fireOn(global.window, 'keydown', Object.assign({ key: k }, props || {})); },
    keyUp(k, props) { fireOn(global.window, 'keyup', Object.assign({ key: k }, props || {})); }
  };
  return { A, G: { get g() { return A.getG(); } }, ui };
}

module.exports = { load, makeEl, fakeCtx, FakeAudioContext };
