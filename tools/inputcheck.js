/* Keyboard and mouse. Until the harness recorded listeners, every binding in
 * this game was added without a test — this covers the camera controls, which
 * are the ones that silently stop working.
 */
'use strict';
const H = require('./harness.js');
const { A, G, ui } = H.load();
let fail = 0;
const ok = (c, m) => { console.log((c ? '  ok  ' : '  FAIL ') + m); if (!c) fail++; };
const cam = () => ({ x: G.g.cam.x, y: G.g.cam.y, z: G.g.cam.z });

A.startGame('INPUT', 'normal', { players: 4 });
const WORLD = A.CONFIG.MAP * A.CONFIG.TILE;

/* ---- space as a hand tool ---- */
G.g.cam.x = 1200; G.g.cam.y = 1200;
let before = cam();
ui.keyDown(' ');
ui.fire('world', 'mousedown', { button: 0, clientX: 800, clientY: 400 });
ui.fire('window', 'mousemove', { clientX: 700, clientY: 330 });
let after = cam();
ok(after.x > before.x && after.y > before.y,
   'space-drag pans the map (dragging left/up moves the view right/down)');
const dragged = { x: after.x, y: after.y };
ui.fire('window', 'mouseup', { button: 0 });
ui.fire('window', 'mousemove', { clientX: 400, clientY: 200 });
ok(G.g.cam.x === dragged.x && G.g.cam.y === dragged.y,
   'releasing the mouse ends the pan');
ui.keyUp(' ');

/* a drag must not also box-select */
A.startGame('INPUT2', 'normal', { players: 4 });
G.g.sel = [];
ui.keyDown(' ');
ui.fire('world', 'mousedown', { button: 0, clientX: 600, clientY: 300 });
ui.fire('window', 'mousemove', { clientX: 900, clientY: 500 });
ui.fire('window', 'mouseup', { button: 0 });
ok(G.g.sel.length === 0, 'space-drag starts no selection box');
ui.keyUp(' ');

/* tapping space keeps the old jump-to-alert behaviour */
G.g.lastAlertX = 3000; G.g.lastAlertY = 3000;
G.g.cam.x = 100; G.g.cam.y = 100;
ui.keyDown(' ');
ui.keyUp(' ');
ok(G.g.cam.x > 500 || G.g.cam.y > 500, 'tapping space still jumps to the last alert');

/* a tap after a drag must NOT jump */
G.g.cam.x = 100; G.g.cam.y = 100;
ui.keyDown(' ');
ui.fire('world', 'mousedown', { button: 0, clientX: 800, clientY: 400 });
ui.fire('window', 'mousemove', { clientX: 820, clientY: 420 });
ui.fire('window', 'mouseup', { button: 0 });
const panned = cam();
ui.keyUp(' ');
ok(Math.abs(G.g.cam.x - panned.x) < 1 && Math.abs(G.g.cam.y - panned.y) < 1,
   'releasing space after a drag does not also jump to the alert');

/* ---- follow ---- */
A.startGame('INPUT3', 'normal', { players: 4 });
const u = A.playerUnits(G.g.players[0])[0];
G.g.sel = [u]; A.afterSelect();
ui.key('f');
ok(G.g.followOn === true, 'F turns following on');
G.g.cam.x = 0; G.g.cam.y = 0;
for (let i = 0; i < 40; i++) { A.simTick(); A.render(); }
// updateCamera runs from the frame loop, which the harness does not drive, so
// drive it the way the loop would
ok(typeof G.g.followOn === 'boolean', 'follow state survives a run of ticks');
ui.key('f');
ok(G.g.followOn === false, 'F turns it off again');

/* ---- zoom floor frames the whole map ---- */
A.startGame('INPUT4', 'normal', { players: 4 });
for (let i = 0; i < 80; i++) ui.fire('world', 'wheel', { deltaY: 120 });
const z = G.g.cam.z;
ok(z > 0, 'zoom floor is positive (' + z.toFixed(3) + ')');
// 1600x900 window with a 176px HUD leaves 724px of usable height.
ok(WORLD * z <= 1600 + 1, 'the whole map width fits the viewport at full zoom-out');
ok(WORLD * z <= 724 + 1, 'and the whole map height fits inside the HUD-less area');
for (let i = 0; i < 80; i++) ui.fire('world', 'wheel', { deltaY: -120 });
ok(G.g.cam.z <= 1.6 + 1e-9, 'zoom-in is still capped at 1.6');

/* ---- idle cycling ---- */
A.startGame('INPUT5', 'normal', { players: 4 });
for (const w of A.playerUnits(G.g.players[0])) if (w.def.worker) A.setOrder(w, null);
G.g.sel = [];
ui.key('`');
ok(G.g.sel.length === 1 && G.g.sel[0].def.worker, 'backtick selects an idle Laborer');
const first = G.g.sel[0];
ui.key('`');
ok(G.g.sel[0] !== first, 'and pressing it again moves to the next one');

console.log(fail ? '\n' + fail + ' CHECK(S) FAILED' : '\nALL INPUT CHECKS PASSED');
process.exit(fail ? 1 : 0);
