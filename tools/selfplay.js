/* Self-play: run the AI against itself and report what the games reveal.
 *
 *   node tools/selfplay.js                  # 20 games on normal
 *   node tools/selfplay.js --games 40 --diff hard
 *   node tools/selfplay.js --minutes 25     # raise the per-game time cap
 *
 * Why self-play specifically: both sides run identical code, so a persistent
 * win-rate skew cannot be strategy. It is the map, the start positions, or the
 * order the two AIs are stepped in. That is a fairness check nothing else in
 * the test suite can make.
 *
 * The simulation uses Math.random() in a few places (steering jitter, spawn
 * offsets), so repeated runs on one seed differ. That is wanted here — it turns
 * each seed into a sample rather than a single fixed answer.
 */
'use strict';
const H = require('./harness.js');
const { A, G } = H.load();

const argv = process.argv.slice(2);
const arg = (name, dflt) => {
  const i = argv.indexOf('--' + name);
  return i >= 0 && argv[i + 1] !== undefined ? argv[i + 1] : dflt;
};
const GAMES = parseInt(arg('games', '20'), 10);
const DIFF = arg('diff', 'normal');
const MINUTES = parseFloat(arg('minutes', '20'));
const MAX_TICKS = Math.round(MINUTES * 60 * 30);

const UNIT_TYPES = ['laborer', 'footman', 'archer', 'siege'];
const BUILD_TYPES = ['hall', 'keep', 'farm', 'barracks', 'workshop', 'altar', 'tower', 'smith'];

/* Counts are sampled during play and kept at their peak, never read from the
   final state. End-state counts answer the wrong question: the loser has no
   buildings at all by definition of the win condition, and a Town Hall that was
   upgraded has become a Keep, so "halls at the end" reads as near zero however
   many were built. */
function sample(g, peaks) {
  for (const id of [0, 1]) {
    const p = g.players[id];
    if (p.foodUsed > peaks[id].foodPeak) peaks[id].foodPeak = p.foodUsed;
    for (const t of UNIT_TYPES) {
      const n = A.countUnits(p, t);
      if (n > peaks[id].units[t]) peaks[id].units[t] = n;
    }
    for (const t of BUILD_TYPES) {
      const n = A.countBuildings(p, t, false);
      if (n > peaks[id].builds[t]) peaks[id].builds[t] = n;
    }
    const h = p.hero ? p.hero.level : (p.heroSave ? p.heroSave.level : 0);
    if (h > peaks[id].hero) peaks[id].hero = h;
    const u = p.upg.melee + p.upg.ranged + p.upg.armor;
    if (u > peaks[id].upgrades) peaks[id].upgrades = u;
    if (p.hasKeep) peaks[id].keep = 1;
  }
}
function freshPeaks() {
  return [0, 1].map(() => {
    const units = {}, builds = {};
    for (const t of UNIT_TYPES) units[t] = 0;
    for (const t of BUILD_TYPES) builds[t] = 0;
    return { units, builds, foodPeak: 0, hero: 0, upgrades: 0, keep: 0 };
  });
}

function snapshotSide(g, id, peak) {
  const p = g.players[id];
  const units = peak.units, builds = peak.builds;
  return {
    gold: Math.round(p.stats.gold), lumber: Math.round(p.stats.lumber),
    trained: p.stats.trained, kills: p.stats.kills, lost: p.stats.lost, razed: p.stats.razed,
    hero: peak.hero, keep: peak.keep, upgrades: peak.upgrades, foodPeak: peak.foodPeak,
    units, builds
  };
}

const games = [];
process.stdout.write('running ' + GAMES + ' self-play games on ' + DIFF +
  ' (cap ' + MINUTES + ' game-minutes each)\n');

for (let n = 0; n < GAMES; n++) {
  const seed = 'SELFPLAY-' + String(n + 1).padStart(3, '0');
  A.startGame(seed, DIFF, { selfPlay: true });
  const g = G.g;
  const peaks = freshPeaks();
  let firstBlood = null, firstAttackWave = [null, null];

  let t = 0;
  for (; t < MAX_TICKS; t++) {
    A.simTick();
    const gg = G.g;
    if (gg.state === 'over') break;
    if (t % 30 === 0) sample(gg, peaks);          // once a game-second is plenty
    for (const id of [0, 1]) {
      if (firstAttackWave[id] === null && gg.ais[id] && gg.ais[id].attacking) firstAttackWave[id] = gg.time;
    }
    if (firstBlood === null && (gg.players[0].stats.lost || gg.players[1].stats.lost)) firstBlood = gg.time;
  }
  const g2 = G.g;
  const finished = g2.state === 'over';
  // `over` is from player 0's point of view: true means player 0 won
  const winner = !finished ? null : (g2.over ? 0 : 1);
  games.push({
    seed, finished, winner, time: g2.time,
    firstBlood, firstAttackWave,
    sides: [snapshotSide(g2, 0, peaks[0]), snapshotSide(g2, 1, peaks[1])]
  });
  process.stdout.write('  ' + seed + '  ' +
    (finished ? ('P' + winner + ' win @' + A.fmtTime(g2.time)) : ('UNRESOLVED @' + A.fmtTime(g2.time))) + '\n');
}

/* ---------------- aggregate ---------------- */
const fin = games.filter(g => g.finished);
const wins = [games.filter(g => g.winner === 0).length, games.filter(g => g.winner === 1).length];
const unresolved = games.length - fin.length;
const times = fin.map(g => g.time).sort((a, b) => a - b);
const median = times.length ? times[Math.floor(times.length / 2)] : 0;
const mean = (xs) => xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0;

const line = (s) => console.log(s);
line('\n' + '='.repeat(66));
line('SELF-PLAY REPORT   ' + games.length + ' games, difficulty ' + DIFF);
line('='.repeat(66));

line('\n-- Fairness (identical AI both sides; expect a coin flip) --');
const total = wins[0] + wins[1];
const pct = total ? (wins[0] / total * 100) : 0;
line('  bottom-left (P0) ' + wins[0] + '   top-right (P1) ' + wins[1] +
     '   unresolved ' + unresolved);
if (total >= 8) {
  // 95% binomial interval, normal approximation
  const se = Math.sqrt(0.25 / total) * 100;
  const lo = 50 - 1.96 * se, hi = 50 + 1.96 * se;
  line('  P0 win rate ' + pct.toFixed(0) + '%  (a fair map gives ' +
       lo.toFixed(0) + '-' + hi.toFixed(0) + '% at this sample size)');
  line(pct < lo || pct > hi
    ? '  >> SKEWED: one start position is winning more than chance explains.'
    : '  >> within chance — no detectable start-position bias.');
} else {
  line('  (too few resolved games to judge; run more)');
}

line('\n-- Game length --');
if (times.length) {
  line('  median ' + A.fmtTime(median) + '   shortest ' + A.fmtTime(times[0]) +
       '   longest ' + A.fmtTime(times[times.length - 1]));
  line('  first blood (median) ' + A.fmtTime(mean(games.map(g => g.firstBlood || 0))));
}
if (unresolved) line('  ' + unresolved + ' game(s) hit the ' + MINUTES + '-minute cap without resolving.');

line('\n-- What the AI actually builds (mean per side per game) --');
const allSides = [].concat(...games.map(g => g.sides));
for (const t of UNIT_TYPES) {
  const built = allSides.map(s => s.units[t]);
  const everAny = allSides.filter(s => s.units[t] > 0).length / allSides.length * 100;
  line('  ' + t.padEnd(9) + ' peak alive ' + mean(built).toFixed(1).padStart(5) +
       '   built at all by ' + everAny.toFixed(0).padStart(3) + '% of sides');
}
line('');
for (const t of BUILD_TYPES) {
  const everAny = allSides.filter(s => s.builds[t] > 0).length / allSides.length * 100;
  const flag = everAny < 25 ? '   <-- rarely built' : '';
  line('  ' + t.padEnd(9) + ' ever built by ' + everAny.toFixed(0).padStart(3) + '% of sides' + flag);
}

line('\n-- Economy and progression (mean per side) --');
line('  gold gathered   ' + Math.round(mean(allSides.map(s => s.gold))));
line('  lumber gathered ' + Math.round(mean(allSides.map(s => s.lumber))));
line('  peak food       ' + mean(allSides.map(s => s.foodPeak)).toFixed(1) + ' of 80 cap');
line('  hero level      ' + mean(allSides.map(s => s.hero)).toFixed(1) + ' of 10');
line('  reached Keep    ' + (mean(allSides.map(s => s.keep)) * 100).toFixed(0) + '% of sides');
line('  upgrades bought ' + mean(allSides.map(s => s.upgrades)).toFixed(1) + ' of 6');

line('\n-- Findings --');
const notes = [];
if (total >= 8 && (pct < 50 - 1.96 * Math.sqrt(0.25 / total) * 100 || pct > 50 + 1.96 * Math.sqrt(0.25 / total) * 100))
  notes.push('One side is winning more than chance allows. A ~30/70 split was traced once before ' +
    'to nearestPassable returning the first tile of its ring scan rather than the closest, which ' +
    'drifted every spawn, revive and A* goal-snap north-west. Check placement helpers for a fixed ' +
    'compass direction first; ruled out previously were terrain symmetry, map position (--swap), ' +
    'AI tick order, entity creation order and the fog build rule.');
if (unresolved / games.length > 0.15)
  notes.push(Math.round(unresolved / games.length * 100) + '% of games never resolve. Either sieges stall against towers, or neither AI can finish a crippled opponent.');
for (const t of UNIT_TYPES) {
  const everAny = allSides.filter(s => s.units[t] > 0).length / allSides.length;
  if (everAny < 0.25) notes.push('The ' + t + ' is built by only ' + Math.round(everAny * 100) + '% of sides — it is close to dead content as the AI plays.');
}
for (const t of BUILD_TYPES) {
  const everAny = allSides.filter(s => s.builds[t] > 0).length / allSides.length;
  if (everAny < 0.25) notes.push('The ' + t + ' is built by only ' + Math.round(everAny * 100) + '% of sides.');
}
const avgFood = mean(allSides.map(s => s.foodPeak));
if (avgFood < 45) notes.push('Peak food averages ' + avgFood.toFixed(0) + ' of 80. Games end before upkeep tiers bite, so that whole mechanic is rarely exercised.');
const avgHero = mean(allSides.map(s => s.hero));
if (avgHero < 5) notes.push('Heroes average level ' + avgHero.toFixed(1) + ' of 10. The upper half of the hero progression almost never happens.');
if (!notes.length) notes.push('Nothing stood out: fairness within chance, no dead units or buildings, economy and progression all exercised.');
notes.forEach((n, i) => line('  ' + (i + 1) + '. ' + n));
line('');
