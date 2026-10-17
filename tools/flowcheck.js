/* The human seat's whole loop, in a four-way free-for-all: place a building,
 * train, gather, summon and level a hero, fight, and reach both end states.
 *
 * Written when the game went from two seats to four. Most of what broke in that
 * change was not the new seats, it was code that quietly meant "the enemy" when
 * it said players[1], so this drives seat 0 exactly as a player would and
 * asserts the rest of the board behaves.
 */
'use strict';
const H = require('./harness.js');
const { A, G } = H.load();
let fail = 0;
const ok = (cond, msg) => { console.log((cond ? '  ok  ' : '  FAIL ') + msg); if (!cond) fail++; };

A.startGame('FLOW', 'normal', { players: 4 });
let g = G.g;
const p = g.players[0];

ok(g.np === 4, 'four seats are live');
ok(g.players.length === 5, 'players array has a slot for the wilds at the end');
ok(new Set(g.seatBase.map(b => b.x + ',' + b.y)).size === 4, 'every seat got its own corner');
ok(g.ais[0] === null, 'seat 0 is not AI-driven in a normal game');
ok([1, 2, 3].every(i => g.ais[i]), 'all three opponents have an AI');
ok(A.countUnits(p, 'laborer') === 5, 'player starts with laborers');
ok(A.countBuildings(p, 'hall', false) === 1, 'player starts with a hall');

// economy runs
for (let i = 0; i < 60 * 30; i++) A.simTick();
g = G.g;
ok(g.players[0].stats.gold > 0, 'player gathered gold (' + Math.round(g.players[0].stats.gold) + ')');
ok(g.players[0].stats.lumber > 0, 'player gathered lumber (' + Math.round(g.players[0].stats.lumber) + ')');
for (let i = 1; i < 4; i++) ok(g.players[i].stats.gold > 0, 'seat ' + i + ' gathered gold');

// the player can place and finish a building
const hall = A.playerBuildings(g.players[0]).find(b => b.def.dropoff);
g.players[0].gold = 2000; g.players[0].lumber = 2000;
const crew = A.playerUnits(g.players[0]).filter(u => u.type === 'laborer').slice(0, 2);
let placed = null;
for (let r = 4; r < 14 && !placed; r++) {
  for (let a = 0; a < 12 && !placed; a++) {
    const tx = Math.round(hall.x / 32 + Math.cos(a) * r), ty = Math.round(hall.y / 32 + Math.sin(a) * r);
    if (A.canPlaceAt('farm', tx, ty, 0)) placed = A.startConstruction('farm', tx, ty, crew, 0);
  }
}
ok(!!placed, 'player could place a Farm near the hall');
if (placed) { for (let i = 0; i < 90 * 30; i++) { A.simTick(); if (placed.built) break; } ok(placed.built, 'the Farm finished building'); }

// hero: summon, level, and the revive path
g = G.g;
g.players[0].gold = 4000; g.players[0].lumber = 4000;
let altar = A.playerBuildings(g.players[0]).find(b => b.type === 'altar');
if (!altar) altar = A.spawnBuilding('altar', 0, Math.round(hall.x / 32) + 6, Math.round(hall.y / 32), true);
A.startRevive(altar);
for (let i = 0; i < 120 * 30 && !g.players[0].hero; i++) { A.simTick(); g = G.g; }
ok(!!g.players[0].hero, 'hero was summoned');
if (g.players[0].hero) {
  const h = g.players[0].hero;
  for (let k = 0; k < 4; k++) A.heroLevelUp(h);
  ok(h.level >= 5, 'hero levelled to ' + h.level);
  ok(A.canLearn(h, 'flare') !== undefined, 'ability learn gate answers for the hero');
  A.killEntity(h);
  for (let i = 0; i < 30; i++) A.simTick();
  g = G.g;
  ok(!!g.players[0].heroSave, 'a fallen hero leaves a save for revival');
}

// Combat across seats: every opponent must be hostile to the player and able
// to trade blows. A fresh board per pair, so a previous fight's survivors and
// the terrain around one fixed spot cannot decide the result.
for (let i = 1; i < 4; i++) {
  A.startGame('FLOW-FIGHT-' + i, 'normal', { players: 4 });
  const gg = G.g;
  const h2 = A.playerBuildings(gg.players[0]).find(b => b.def.dropoff);
  const mine = A.spawnUnit('footman', 0, h2.x + 150, h2.y);
  const theirs = A.spawnUnit('footman', i, mine.x + 26, mine.y);
  const hp0 = mine.hp, hp1 = theirs.hp;
  for (let t = 0; t < 400; t++) A.simTick();
  ok(mine.hp < hp0 || theirs.hp < hp1 || mine.dead || theirs.dead,
    'seat 0 and seat ' + i + ' engage each other');
}

// elimination and victory
A.startGame('FLOW-WIN', 'normal', { players: 4 });
g = G.g;
// A seat that still has a laborer simply lays a new hall, and countBuildings
// counts sites under construction, so wiping a seat means its workers too.
for (let i = 1; i < 4; i++) {
  for (const e of A.playerBuildings(g.players[i]).slice()) A.killEntity(e);
  for (const e of A.playerUnits(g.players[i]).slice()) A.killEntity(e);
}
for (let i = 0; i < 60; i++) A.simTick();
g = G.g;
ok(g.state === 'over' && g.over === true, 'razing all three opponents is a victory');
ok([1, 2, 3].every(i => g.players[i].eliminated), 'all three opponents marked eliminated');

A.startGame('FLOW-LOSE', 'normal', { players: 4 });
g = G.g;
for (const e of A.playerBuildings(g.players[0]).slice()) A.killEntity(e);
for (const e of A.playerUnits(g.players[0]).slice()) A.killEntity(e);
for (let i = 0; i < 60; i++) A.simTick();
g = G.g;
ok(g.state === 'over' && g.over === false, 'losing every building is a defeat even with rivals alive');

// a seat falling to another AI must not end the game
A.startGame('FLOW-MID', 'normal', { players: 4 });
g = G.g;
for (const e of A.playerBuildings(g.players[2]).slice()) A.killEntity(e);
for (const e of A.playerUnits(g.players[2]).slice()) A.killEntity(e);
for (let i = 0; i < 60; i++) A.simTick();
g = G.g;
ok(g.state === 'play', 'one opponent being destroyed does not end the game');
ok(g.players[2].eliminated, 'that opponent is marked out');

// Refusal feedback belongs to whoever gave the command. Spectate and Watch AI
// vs AI hand seat 0 to an AI, and gating these on `owner === 0` rang the error
// chime for every purchase it tried and could not afford -- 678 of them in
// eight game-minutes. Outcome messages must survive; refusals must not.
const msgs = global.document.getElementById('msgs');
function countMsgs(fn) {
  const seen = {};
  const orig = msgs.appendChild.bind(msgs);
  msgs.appendChild = (c) => { seen[c.textContent] = (seen[c.textContent] || 0) + 1; return orig(c); };
  try { fn(); } finally { msgs.appendChild = orig; }
  return seen;
}
const isRefusal = (t) => /Not enough|Cannot build|requires a Keep|to revive|Inventory is full|recharging|not learned/.test(t);

let seen = countMsgs(() => {
  A.startGame('FLOW-QUIET', 'normal', { players: 4, selfPlay: true });
  for (let i = 0; i < 6 * 60 * 30; i++) A.simTick();
});
let refusals = Object.keys(seen).filter(isRefusal).reduce((a, k) => a + seen[k], 0);
ok(refusals === 0, 'AI-vs-AI emits no refusal messages (' + refusals + ')');
ok(Object.keys(seen).length > 0, 'AI-vs-AI still reports outcomes (' + Object.keys(seen).length + ' kinds)');

seen = countMsgs(() => {
  A.startGame('FLOW-SKINT', 'normal', { players: 4 });
  const gp = G.g.players[0];
  gp.gold = 0; gp.lumber = 0;
  const h3 = A.playerBuildings(gp).find(b => b.def.dropoff);
  A.queueUnit(h3, 'laborer');
});
ok(Object.keys(seen).some(isRefusal), 'a human seat with no gold is still told why');

// Idle counters must be silent when nothing is idle, or they are just noise.
A.startGame('FLOW-IDLE', 'normal', { players: 4 });
A.refreshTop();
const wn = global.document.getElementById('idleW');
const bn = global.document.getElementById('idleB');
ok(!wn.classList.contains('show'), 'a fresh game shows no idle-worker badge');
for (const u of A.playerUnits(G.g.players[0])) if (u.def.worker) A.setOrder(u, null);
A.refreshTop();
ok(wn.classList.contains('show'), 'stopping every Laborer raises the idle-worker badge');
// String(): a real DOM coerces textContent, the harness stub stores it raw.
ok(String(global.document.getElementById('idleWn').textContent) === '5', 'and counts all five');
const h4 = A.playerBuildings(G.g.players[0]).find(b => b.def.dropoff);
A.queueUnit(h4, 'laborer'); A.refreshTop();
ok(!bn.classList.contains('show'), 'a hall with something queued is not idle');

// Limited forces: a platoon at the start and no soldier ever again.
A.startGame('FLOW-LIM', 'normal', { players: 4, limited: true });
let lg = G.g;
const plat = (i) => A.countUnits(lg.players[i], 'footman') + A.countUnits(lg.players[i], 'archer') +
  A.countUnits(lg.players[i], 'adept');
ok([0, 1, 2, 3].every(i => plat(i) === 8), 'every seat opens with the same eight-strong platoon');
ok(lg.players[0].foodUsed <= lg.players[0].foodCap, 'the platoon does not start over the food cap');
const lh = A.playerBuildings(lg.players[0]).find(b => b.def.dropoff);
lg.players[0].gold = 9999; lg.players[0].lumber = 9999;
ok(A.queueUnit(lh, 'laborer') === false, 'training is refused even with resources to spare');
const before = plat(1);
for (let i = 0; i < 3 * 60 * 30; i++) { A.simTick(); if (G.g.state === 'over') break; }
lg = G.g;
ok(plat(1) <= before, 'an AI seat never grows its platoon');

// Hiring a wild camp: gold and food for the pack, and they must actually
// stop being creeps or they keep leashing back to a camp that no longer owns
// them.
A.startGame('FLOW-HIRE', 'normal', { players: 4 });
let hg = G.g;
const hp2 = hg.players[0];
const hcamp = hg.camps.find(c => c.tier === 1);
const hhall = A.playerBuildings(hp2).find(b => b.def.dropoff);
for (let r = 5; r < 14; r++) {
  let done = false;
  for (let a = 0; a < 12; a++) {
    const tx = Math.round(hhall.x / 32 + Math.cos(a) * r), ty = Math.round(hhall.y / 32 + Math.sin(a) * r);
    if (A.canPlaceAt('farm', tx, ty, 0)) { A.spawnBuilding('farm', 0, tx, ty, true); done = true; break; }
  }
  if (done) break;
}
A.simTick();
const scout = A.spawnUnit('footman', 0, hcamp.x + 40, hcamp.y);
hg.sel = [scout];
hp2.gold = 50;              // set the purse BEFORE the card is built from it
A.afterSelect();
let card = A.getCARD();
ok(!!card[10] && card[10].dis, 'hiring is offered but refused with no gold');
hp2.gold = 2000; A.buildCard(); card = A.getCARD();
ok(!!card[10] && !card[10].dis, 'with gold and food the pack can be hired');
const beforeN = A.playerUnits(hp2).length, beforeG = hp2.gold;
card[10].act();
ok(A.playerUnits(hp2).length === beforeN + 3, 'the three wolves changed sides');
ok(hp2.gold < beforeG, 'and were paid for');
ok(hcamp.cleared, 'the camp counts as cleared');
ok(A.playerUnits(hp2).filter(u => u.type === 'wolf').every(w => !w.creep && !w.camp),
   'hired beasts are no longer creeps leashed to a camp');

console.log(fail ? '\n' + fail + ' CHECK(S) FAILED' : '\nALL PLAYER-FLOW CHECKS PASSED');
process.exit(fail ? 1 : 0);
