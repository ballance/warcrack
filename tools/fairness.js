/* Four-way fairness. Identical AI in every seat, so any persistent skew is the
   map, the start, or order-dependent code -- never strategy.
 *
 * Counts winners ONLY from games that actually resolved. An earlier version of
 * this script padded the death order with the seats still alive at the time
 * cap, in index order, which handed every unresolved game to the highest seat
 * and invented a bias that was not there.
 */
'use strict';
const H = require('./harness.js');
const { A, G } = H.load();
const MAX = 30 * 60 * 30;
function run(seed, swap) {
  A.startGame(seed, 'normal', { selfPlay: true, swapBases: swap });
  const order = [];
  for (let t = 0; t < MAX; t++) {
    A.simTick();
    const g = G.g;
    if (t % 30 === 0) for (let i = 0; i < g.np; i++)
      if (g.players[i].eliminated && order.indexOf(i) < 0) order.push(i);
    if (g.state === 'over') break;
  }
  const g = G.g;
  const alive = [];
  for (let i = 0; i < g.np; i++) if (!g.players[i].eliminated) alive.push(i);
  return {
    resolved: g.state === 'over' && alive.length === 1,
    winner: alive.length === 1 ? alive[0] : -1,
    order: order, alive: alive, time: g.time,
    corner: (i) => g.seatBase[i].x + ',' + g.seatBase[i].y
  };
}
const firstIdx = {}, winIdx = {}, winCorner = {};
let resolved = 0, unresolved = 0;
for (let n = 1; n <= 12; n++) {
  for (const swap of [false, true]) {
    const r = run('FAIR-' + n, swap);
    if (r.order.length) firstIdx[r.order[0]] = (firstIdx[r.order[0]] || 0) + 1;
    if (r.resolved) {
      resolved++;
      winIdx[r.winner] = (winIdx[r.winner] || 0) + 1;
      winCorner[r.corner(r.winner)] = (winCorner[r.corner(r.winner)] || 0) + 1;
    } else unresolved++;
    console.log('FAIR-' + n + (swap ? ' swap' : '     ') +
      (r.resolved ? '  p' + r.winner + ' wins ' : '  UNRESOLVED (' + r.alive.length + ' alive) ') +
      ' @' + A.fmtTime(r.time) + '   died ' + (r.order.join(' < ') || '-'));
  }
}
console.log('\nresolved ' + resolved + '   unresolved ' + unresolved);
console.log('first to die, by index : ' + JSON.stringify(firstIdx));
console.log('winner, by player index: ' + JSON.stringify(winIdx));
console.log('winner, by map corner  : ' + JSON.stringify(winCorner));
if (resolved >= 8) {
  const exp = resolved / 4, se = Math.sqrt(exp * (1 - 1 / 4));
  const worst = Math.max(...[0, 1, 2, 3].map(i => Math.abs((winIdx[i] || 0) - exp)));
  console.log('expected ' + exp.toFixed(1) + ' wins per seat, 2sd = ' + (2 * se).toFixed(1) +
    ', largest deviation ' + worst.toFixed(1) +
    (worst > 2 * se ? '   >> SKEWED' : '   >> within chance'));
}
