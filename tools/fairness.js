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
const argv = process.argv.slice(2);
const argOf = (n, d) => { const i = argv.indexOf('--' + n); return i >= 0 && argv[i + 1] !== undefined ? argv[i + 1] : d; };
const SEEDS = parseInt(argOf('seeds', '12'), 10);   // each seed is played twice, swapped
const PREFIX = argOf('prefix', 'FAIR');            // change it to draw a fresh sample
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
for (let n = 1; n <= SEEDS; n++) {
  for (const swap of [false, true]) {
    const r = run(PREFIX + '-' + n, swap);
    if (r.order.length) firstIdx[r.order[0]] = (firstIdx[r.order[0]] || 0) + 1;
    if (r.resolved) {
      resolved++;
      winIdx[r.winner] = (winIdx[r.winner] || 0) + 1;
      winCorner[r.corner(r.winner)] = (winCorner[r.corner(r.winner)] || 0) + 1;
    } else unresolved++;
    console.log(PREFIX + '-' + n + (swap ? ' swap' : '     ') +
      (r.resolved ? '  p' + r.winner + ' wins ' : '  UNRESOLVED (' + r.alive.length + ' alive) ') +
      ' @' + A.fmtTime(r.time) + '   died ' + (r.order.join(' < ') || '-'));
  }
}
console.log('\nresolved ' + resolved + '   unresolved ' + unresolved);
console.log('first to die, by index : ' + JSON.stringify(firstIdx));
console.log('winner, by player index: ' + JSON.stringify(winIdx));
console.log('winner, by map corner  : ' + JSON.stringify(winCorner));
/* Two different questions, and they need testing separately.
   Seat skew means order-dependent code — tie-breaks, iteration order, who
   thinks first. Corner skew means the map, and would survive the swap that
   rotates seats through corners. A result can be clean on one and not the
   other, so reporting only the seat test hides half of it. */
/* Four buckets are tested at once, so a plain 2sd threshold on "the largest of
   four deviations" fires by chance about one run in five. That is not a
   hypothetical: across four 80-game samples it flagged a corner twice, on two
   DIFFERENT corners, while the seat test stayed clean throughout — which is
   what noise looks like, not a bias. The threshold is corrected for the four
   comparisons (family-wise 0.05 => z 2.5), so a flag here means something. */
const Z = 2.5;
function chi(counts, n, label) {
  if (n < 8) { console.log('  (' + label + ': too few resolved games to judge)'); return; }
  const exp = n / 4, se = Math.sqrt(exp * (1 - 1 / 4));
  const vals = Object.values(counts);
  while (vals.length < 4) vals.push(0);
  const worst = Math.max(...vals.map(v => Math.abs(v - exp)));
  console.log('  ' + label + ': expected ' + exp.toFixed(1) + ' each, threshold = ' + (Z * se).toFixed(1) +
    ' (2.5sd, corrected for testing four buckets), largest deviation ' + worst.toFixed(1) +
    (worst > Z * se ? '   >> SKEWED' : '   >> within chance'));
}
chi(winIdx, resolved, 'by seat  ');
chi(winCorner, resolved, 'by corner');
