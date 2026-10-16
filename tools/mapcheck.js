/* The map must be exactly invariant under a quarter turn, or one corner is
   quietly better than another. A 30/70 self-play skew was once traced to a
   placement helper drifting north-west, so this is checked rather than assumed. */
'use strict';
const H = require('./harness.js');
const { A, G } = H.load();
let bad = 0;
for (const seed of ['FFA-A', 'FFA-B', 'FFA-C', 'FFA-D', 'FFA-E']) {
  A.startGame(seed, 'normal');
  const g = G.g, M = Math.round(Math.sqrt(g.terr.length));
  const ti = (x, y) => y * M + x;
  let mismatch = 0;
  for (let y = 0; y < M; y++) for (let x = 0; x < M; x++) {
    // rot90: (x,y) -> (M-1-y, x)
    if (g.terr[ti(x, y)] !== g.terr[ti(M - 1 - y, x)]) mismatch++;
  }
  // every seat must see the same local world
  const near = (b, pred) => {
    let n = 0;
    for (let y = -14; y <= 14; y++) for (let x = -14; x <= 14; x++) {
      const tx = b.x + x, ty = b.y + y;
      if (tx < 0 || ty < 0 || tx >= M || ty >= M) continue;
      if (pred(g.terr[ti(tx, ty)])) n++;
    }
    return n;
  };
  const forests = g.bases.map(b => near(b, t => t === 4));
  const mines = g.bases.map(b => g.ents.filter(e => e.kind === 'mine' &&
    Math.hypot(e.x / 32 - b.x, e.y / 32 - b.y) < 16).length);
  const camps = g.camps.length;
  const ok = mismatch === 0 &&
    new Set(forests).size === 1 && new Set(mines).size === 1;
  if (!ok) bad++;
  console.log(seed + '  rot-mismatch ' + String(mismatch).padStart(6) +
    '   forest/base ' + forests.join('/') +
    '   mines/base ' + mines.join('/') +
    '   camps ' + camps + (ok ? '   ok' : '   <-- ASYMMETRIC'));
}
console.log(bad ? '\nFAIL: ' + bad + ' seed(s) asymmetric' : '\nPASS: map is invariant under a quarter turn on every seed');
