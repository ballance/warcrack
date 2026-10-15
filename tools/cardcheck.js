/* Every command-card label the game can print, and whether it gets the smaller
   long-label size. The overlap bug was a label running under an absolutely
   positioned icon, so what matters is that every button has exactly one icon
   row and one label box, and that nothing long is left at the full size. */
'use strict';
const H = require('./harness.js');
const { A, G } = H.load();
A.startGame('CARD', 'normal');
const card = global.document.getElementById('card');

const seen = new Map();
let buttons = 0, bad = [];

function sweep(tag) {
  A.buildCard();
  const html = card.innerHTML || '';
  const cmds = html.split('<div class="cmd').slice(1);
  for (const c of cmds) {
    if (c.startsWith(' empty')) continue;
    buttons++;
    const ic = (c.match(/<span class="ic">/g) || []).length;
    const lb = c.match(/<span class="lb( lng)?">([^<]*)<\/span>/);
    if (ic !== 1 || !lb) { bad.push(tag + ': ' + c.slice(0, 70)); continue; }
    const label = lb[2], lng = !!lb[1];
    if (!seen.has(label)) seen.set(label, lng);
  }
}

const p = G.g.players[0];
sweep('root-empty');
for (const u of A.playerUnits(p)) { G.g.sel = [u]; A.afterSelect(); sweep('unit ' + u.type); }
for (const b of A.playerBuildings(p)) { G.g.sel = [b]; A.afterSelect(); sweep('bld ' + b.type); }
// the sub-menus, which hold the longest labels of all
G.g.sel = [A.playerUnits(p).find(u => u.type === 'laborer')].filter(Boolean);
A.afterSelect(); A.setCardMode('build'); sweep('build menu');
// every building the player can ever queue, plus upgrades and the keep upgrade
for (const t of ['hall', 'barracks', 'smith', 'altar', 'workshop', 'tower', 'farm']) {
  const b = A.spawnBuilding(t, 0, 40, 40, true);
  b.built = true; G.g.sel = [b]; A.afterSelect(); A.setCardMode('root'); sweep('bld ' + t);
  A.killEntity(b);
}

const longs = [...seen.entries()].filter(([l]) => l.length > 9);
const mis = longs.filter(([, lng]) => !lng);
console.log('buttons rendered: ' + buttons + '   distinct labels: ' + seen.size);
console.log('malformed buttons: ' + bad.length);
bad.slice(0, 5).forEach(b => console.log('   ' + b));
console.log('\nlabels over 9 chars (these must all be marked lng):');
for (const [l, lng] of longs.sort((a, b2) => b2[0].length - a[0].length)) {
  console.log('  ' + String(l.length).padStart(2) + '  ' + (lng ? 'lng ' : 'FULL') + '  "' + l + '"');
}
console.log('\nlongest label overall: ' +
  Math.max(...[...seen.keys()].map(l => l.length)) + ' chars');
console.log(bad.length === 0 && mis.length === 0
  ? '\nPASS: every button has one icon row and one label box; all long labels stepped down'
  : '\nFAIL');
