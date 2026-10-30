const M = require('./model.js');
const { solve, bestDials, preset, BANDS, POSITIONS, cx, LOADS } = M;
let fails = 0;
const ok = (c, msg) => { console.log((c ? 'PASS ' : 'FAIL ') + msg); if (!c) fails++; };

console.log('Positions (L in uH, dial laws):');
for (const p of POSITIONS) console.log(p.label, (p.Lp * 1e6).toFixed(2), (p.LL * 1e6).toFixed(2), p.tuneLaw.b.toFixed(4), p.loadLaw.b.toFixed(4), 'Ctune(0..100)=', (M.tuneC(p, 0) * 1e12).toFixed(0), (M.tuneC(p, 100) * 1e12).toFixed(0), 'CL(0..100)=', (M.loadC(p, 0) * 1e12).toFixed(0), (M.loadC(p, 100) * 1e12).toFixed(0));

// A7 and table agreement: optimum into 50 ohm vs Table 4-1 at band edges and center.
for (const b of BANDS) for (const x of [0, 0.5, 1]) {
  const kHz = b.lo + (b.hi - b.lo) * x, pr = preset(kHz), bd = bestDials(b.pos, kHz * 1e3, cx(50));
  const dT = bd.tune - pr.tune, dL = bd.load - pr.load;
  // A7: at preset LOAD with TUNE peaked, TRI lights.
  const r = solve({ pos: b.pos, f: kHz * 1e3, tune: bd.tune, load: pr.load, ZL: cx(50), drive: 15, rtty: false });
  ok(Math.abs(dT) < 4 && Math.abs(dL) < 4 && r.tri !== 'off', `A7 ${b.id}m ${kHz.toFixed(0)} kHz: best T ${bd.tune.toFixed(1)} (preset ${pr.tune.toFixed(1)}), L ${bd.load.toFixed(1)} (preset ${pr.load.toFixed(1)}), TRI at preset LOAD: ${r.tri}`);
}

// A8: rated output at 50-70 W drive, tuned, 50 ohm, 14.175 MHz.
const bd = bestDials(4, 14.175e6, cx(50));
for (const d of [15, 50, 60, 70, 100]) {
  const r = solve({ pos: 4, f: 14.175e6, tune: bd.tune, load: bd.load, ZL: cx(50), drive: d, rtty: false });
  console.log(`drive ${d} W: Pfwd ${r.Pfwd.toFixed(0)} Prf ${r.Prf.toFixed(0)} Ip ${(r.Ip * 1e3).toFixed(0)} mA Ig2 ${(r.Ig2 * 1e3).toFixed(0)} Ig1 ${(r.Ig1 * 1e3).toFixed(1)} Pdiss ${r.Pdiss.toFixed(0)} eff ${(r.eff * 100).toFixed(0)}% gain ${(10 * Math.log10(r.Pfwd / d)).toFixed(1)} dB q ${r.q.toFixed(3)} tri ${r.tri}`);
  if (d === 60) ok(r.Pfwd > 620 && r.Pfwd < 760, 'A8 rated output near 700 W at 60 W drive');
}
// A9 RTTY
{ const r = solve({ pos: 4, f: 14.175e6, tune: bd.tune, load: bd.load, ZL: cx(50), drive: 100, rtty: true }); ok(r.Pfwd <= 505 && r.Pfwd > 420, `A9 RTTY max ${r.Pfwd.toFixed(0)} W`); }
// A1: SWR 2.5:1 ratio
{ const b = bestDials(4, 14.175e6, cx(125)); let r; for (let d = 1; d < 100; d += 0.5) { r = solve({ pos: 4, f: 14.175e6, tune: b.tune, load: b.load, ZL: cx(125), drive: d, rtty: false }); if (r.Pfwd >= 800) break; }
  ok(Math.abs(r.Prfl / r.Pfwd - 150 / 800) < 0.01, `A1 FWD ${r.Pfwd.toFixed(0)} RFL ${r.Prfl.toFixed(0)} DEL ${r.Pdel.toFixed(0)}`); }
// A2: SWR 5:1, RFL < 250 -> FWD ~ 540-560
{ const b = bestDials(4, 14.175e6, cx(250)); let r; for (let d = 1; d < 100; d += 0.25) { const n = solve({ pos: 4, f: 14.175e6, tune: b.tune, load: b.load, ZL: cx(250), drive: d, rtty: false }); if (n.Prfl >= 240) break; r = n; }
  ok(r.Pfwd > 500 && r.Pfwd < 560, `A2 FWD ${r.Pfwd.toFixed(0)} RFL ${r.Prfl.toFixed(0)} DEL ${r.Pdel.toFixed(0)} (manual: 540/240/300)`); }
// A3: RFL/FWD independent of knobs
{ const a = solve({ pos: 4, f: 14.175e6, tune: bd.tune + 5, load: bd.load - 4, ZL: cx(30, 40), drive: 30, rtty: false }), b = solve({ pos: 4, f: 14.175e6, tune: bd.tune, load: bd.load, ZL: cx(30, 40), drive: 30, rtty: false });
  ok(Math.abs(a.Prfl / a.Pfwd - b.Prfl / b.Pfwd) < 1e-9, 'A3 RFL/FWD depends on load only'); }
// A4: TRI dark below 20 W
{ const r = solve({ pos: 4, f: 14.175e6, tune: bd.tune, load: bd.load, ZL: cx(50), drive: 1.5, rtty: false }); ok(r.Pfwd < 20 && r.tri === 'off', `A4 Pfwd ${r.Pfwd.toFixed(1)} tri ${r.tri}`); }
// A5: LOAD left raises plate-load resistance; TRI shows left (turn LOAD right).
{ const a = solve({ pos: 4, f: 14.175e6, tune: bd.tune, load: bd.load - 4, ZL: cx(50), drive: 15, rtty: false }), c = solve({ pos: 4, f: 14.175e6, tune: bd.tune, load: bd.load + 4, ZL: cx(50), drive: 15, rtty: false });
  ok(a.q > 1 && c.q < 1, `A5 LOAD-4 q ${a.q.toFixed(2)} tri ${a.tri}; LOAD+4 q ${c.q.toFixed(2)} tri ${c.tri}`); }
// TUNE independence of TRI q (manual 4.5c)
{ const a = solve({ pos: 4, f: 14.175e6, tune: bd.tune + 3, load: bd.load, ZL: cx(50), drive: 15, rtty: false }); console.log('TUNE+3 q', a.q.toFixed(3), 'tdet', a.tdet.toFixed(2), 'Pfwd', a.Pfwd.toFixed(0)); }
// Sensitivity
for (const dt of [1, 2, 4, 8]) { const a = solve({ pos: 4, f: 14.175e6, tune: bd.tune + dt, load: bd.load, ZL: cx(50), drive: 60, rtty: false }); console.log(`TUNE +${dt}: Pfwd ${a.Pfwd.toFixed(0)} tdet ${a.tdet.toFixed(2)} Pdiss ${a.Pdiss.toFixed(0)} tri ${a.tri}`); }
for (const dl of [-6, -3, -1, 1, 3, 6]) { const a = solve({ pos: 4, f: 14.175e6, tune: bd.tune, load: bd.load + dl, ZL: cx(50), drive: 60, rtty: false }); console.log(`LOAD ${dl}: Pfwd ${a.Pfwd.toFixed(0)} q ${a.q.toFixed(2)} Ig2 ${(a.Ig2*1e3).toFixed(0)} Ip ${(a.Ip*1e3).toFixed(0)} tri ${a.tri}`); }
// Station antennas
for (const [k, f] of [['yagi', 14.175e6], ['yagi', 21.225e6], ['yagi', 28.5e6], ['yagi', 7.15e6], ['dipole', 3.75e6], ['dipole', 3.55e6], ['dipole', 7.15e6], ['dipole', 14.175e6]]) {
  const z = LOADS[k].z(f); console.log(k, f / 1e6, 'Z', z.re.toFixed(1), z.im.toFixed(1), 'SWR', M.swrOf(z).toFixed(2));
}
// Sim smoke test
const ev = []; const s = new M.Sim((e) => ev.push(e));
s.setPower(true); s.skipWarmup(); for (let i = 0; i < 10; i++) s.tick(0.05);
ok(s.operating, 'sim operating after warm-up skip');
s.freq = 14175; s.pos = 4; Object.assign(s, bd); s.drive = 15; s.keyHeld = true; s.tick(0.05);
console.log('sim r', s.r.Pfwd.toFixed(0), s.r.tri);
s.setPos(3); ok(ev.some((e) => e.code === 'hot-band'), 'hot band switch flagged');
s.drive = 60; for (let i = 0; i < 30; i++) s.tick(0.05); ok(ev.some((e) => e.kind === 'trip'), 'wrong band trips at 60 W: ' + (ev.find((e) => e.kind === 'trip') || {}).code);
s.keyHeld = false; s.setPos(4); for (let i = 0; i < 100; i++) s.tick(0.05); ok(s.operating, 'auto-operate after trip');
s.conn[1] = 'swr5'; s.drive = 100; s.keyHeld = true; for (let i = 0; i < 5; i++) s.tick(0.05); console.log('SWR5 100W events', ev.slice(-2).map((e) => e.code));
console.log(fails ? `${fails} FAILURES` : 'ALL PASS');
process.exitCode = fails ? 1 : 0;
