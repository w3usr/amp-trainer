// ACOM 1010 trainer: physics model and simulator state. No DOM code here.
// Every parameter carries its source, per .claude/rules/simulator-fidelity.md.
const AmpModel = (() => {
  // ---- complex arithmetic ----
  const cx = (re, im = 0) => ({ re, im });
  const add = (a, b) => cx(a.re + b.re, a.im + b.im);
  const sub = (a, b) => cx(a.re - b.re, a.im - b.im);
  const mul = (a, b) => cx(a.re * b.re - a.im * b.im, a.re * b.im + a.im * b.re);
  const div = (a, b) => {
    const d = b.re * b.re + b.im * b.im;
    return cx((a.re * b.re + a.im * b.im) / d, (a.im * b.re - a.re * b.im) / d);
  };
  const inv = (a) => div(cx(1), a);
  const mag = (a) => Math.hypot(a.re, a.im);

  // ---- parameters ----
  const P = {
    HV:       { v: 2200,   unit: 'V',  src: 'placeholder', note: 'Plate supply. The datasheet\'s typical operation uses 2.2 kV; ACOM does not publish the 1010\'s value.' },
    Vmin:     { v: 350,    unit: 'V',  src: 'placeholder', note: 'Lowest plate voltage before screen current rises; near the screen voltage (Manual §5.6: 210–330 V).' },
    Ropt:     { v: 2300,   unit: 'Ω',  src: 'derived',     note: 'Optimum plate load ≈ (HV − Vmin)² / (2 × 750 W), from the two placeholders above.' },
    Gt:       { v: 0.0105, unit: 'S',  src: 'placeholder', note: 'Grid-to-plate RF transconductance, chosen so about 60 W of drive gives rated output (Manual §1.3, §6.1g).' },
    Rin:      { v: 50,     unit: 'Ω',  src: 'manual',      note: 'Broadband 50 Ω input with swamping resistor (Manual §5.5, §6.1f).' },
    Iq:       { v: 0.160,  unit: 'A',  src: 'datasheet',   note: 'Zero-signal plate current, grid-driven with cathode resistance (Datasheet p. 2).' },
    kdc:      { v: 0.52,   unit: '',   src: 'derived',     note: 'DC plate current per amp of RF plate current: 550 mA DC at 750 W out with 160 mA idle (Datasheet p. 2).' },
    kg2:      { v: 0.032,  unit: '',   src: 'derived',     note: 'Screen current per amp of RF plate current: 24 mA at 750 W out (Datasheet p. 2).' },
    kg2sat:   { v: 0.15,   unit: 'A',  src: 'placeholder', note: 'Rise in screen current when the plate swing saturates (light loading or overdrive).' },
    Vgth:     { v: 85,     unit: 'V',  src: 'placeholder', note: 'Peak drive voltage at which grid current starts. The datasheet shows none at 75 V drive.' },
    kg1:      { v: 0.004,  unit: 'A',  src: 'placeholder', note: 'Grid-current scale above onset.' },
    Cout:     { v: 11e-12, unit: 'F',  src: 'datasheet',   note: 'Tube output capacitance, 11 ± 2 pF (Datasheet p. 1). Part of the TUNE-side capacitance.' },
    Qu:       { v: 300,    unit: '',   src: 'placeholder', note: 'Unloaded Q of the tank inductors (sets network loss).' },
    Qd:       { v: 12,     unit: '',   src: 'placeholder', note: 'Design loaded Q of the pi section, used to choose the placeholder inductances.' },
    Rm:       { v: 300,    unit: 'Ω',  src: 'placeholder', note: 'Intermediate resistance between the pi section and the L section of the Pi-L network.' },
    RFLtrip:  { v: 250,    unit: 'W',  src: 'manual',      note: 'Safe-operation rule "REFLECTED POWER < 250 W" (Manual §4.5a).' },
    G1warn:   { v: 0.005,  unit: 'A',  src: 'placeholder', note: 'Control-grid warning (G1 LED).' },
    G1trip:   { v: 0.015,  unit: 'A',  src: 'placeholder', note: 'Control-grid trip.' },
    G2warn:   { v: 0.030,  unit: 'A',  src: 'placeholder', note: 'Screen-grid warning (G2 LED).' },
    G2trip:   { v: 0.045,  unit: 'A',  src: 'placeholder', note: 'Screen-grid trip, near the 15 W screen rating at 350 V (Datasheet p. 1).' },
    IPwarn:   { v: 0.62,   unit: 'A',  src: 'placeholder', note: 'Plate + screen current warning (IP LED). Manual §5.6 expects ≤ 600 mA for SSB/CW.' },
    IPtrip:   { v: 0.72,   unit: 'A',  src: 'placeholder', note: 'Plate + screen current trip.' },
    PDtrip:   { v: 850,    unit: 'W',  src: 'placeholder', note: 'Plate dissipation treated as mistuning; tube rating is 800 W (Datasheet p. 1).' },
    mistuneW: { v: 25,     unit: 'W',  src: 'placeholder', note: 'Drive above which badly-off tuning trips (TRI flashing). Below it you can search for the TRI light, as Manual Fig. 4-1 describes.' },
    tripHold: { v: 4,      unit: 's',  src: 'placeholder', note: 'Time in STANDBY after a trip; the manual says "several seconds" (Manual §4.6).' },
    warmup:   { v: 150,    unit: 's',  src: 'manual',      note: 'Warm-up period (Manual §4.1).' },
    duty:     { v: 60,     unit: 's',  src: 'manual',      note: 'Longest continuous drive while tuning, then pause one minute (Manual §4.5).' },
    triMin:   { v: 20,     unit: 'W',  src: 'manual',      note: 'TRI does not light below 20 W forward power (Manual §4.5b).' },
    rttyMax:  { v: 500,    unit: 'W',  src: 'manual',      note: 'RTTY mode limits output to 500 W, no retune needed (Manual §4.3).' },
  };
  const V = (k) => P[k].v;
  const Vmax = () => V('HV') - V('Vmin');

  // ---- bands, switch positions, Manual Table 4-1 presets ----
  // Table entries are [value at lower band edge, value at upper band edge].
  const BANDS = [
    { id: '160', lo: 1800,  hi: 2000,  pos: 0, load: [47, 71], tune: [54, 32] },
    { id: '80',  lo: 3500,  hi: 4000,  pos: 1, load: [34, 56], tune: [51, 33] },
    { id: '40',  lo: 7000,  hi: 7300,  pos: 2, load: [32, 39], tune: [36, 30] },
    { id: '30',  lo: 10100, hi: 10150, pos: 3, load: [62, 63], tune: [50, 48] },
    { id: '20',  lo: 14000, hi: 14350, pos: 4, load: [37, 41], tune: [38, 31] },
    { id: '17',  lo: 18068, hi: 18168, pos: 5, load: [41, 43], tune: [50, 48] },
    { id: '15',  lo: 21000, hi: 21450, pos: 5, load: [59, 62], tune: [16, 10] },
    { id: '12',  lo: 24890, hi: 24990, pos: 6, load: [50, 52], tune: [49, 46] },
    { id: '10',  lo: 28000, hi: 29700, pos: 6, load: [63, 69], tune: [23, 10] },
  ];
  const POSITIONS = ['1.8', '3.5', '7', '10', '14', '18-21', '24-28'].map((label, i) => ({ label, i }));

  const bandOf = (kHz) => BANDS.find((b) => kHz >= b.lo && kHz <= b.hi) || null;
  const lerp = (a, b, x) => a + (b - a) * x;
  function preset(kHz) {
    const b = bandOf(kHz);
    if (!b) return null;
    const x = (kHz - b.lo) / (b.hi - b.lo);
    return { pos: b.pos, tune: lerp(b.tune[0], b.tune[1], x), load: lerp(b.load[0], b.load[1], x) };
  }

  // ---- Pi-L network ----
  function network(pos, f, Cp, CL, ZL) {
    const w = 2 * Math.PI * f;
    const Qu = V('Qu');
    const Z1 = add(ZL, cx(w * pos.LL / Qu, w * pos.LL));
    const Z2 = inv(add(inv(Z1), cx(0, w * CL)));
    const Z3 = add(Z2, cx(w * pos.Lp / Qu, w * pos.Lp));
    const Yp = add(inv(Z3), cx(0, w * Cp));
    return { Z1, Z2, Z3, Yp, Zp: inv(Yp) };
  }

  // Placeholder inductances: a textbook Pi-L design at each position's design frequency.
  function designInductors(pos, fd) {
    const w = 2 * Math.PI * fd, Q = V('Qd'), R1 = V('Ropt'), R2 = V('Rm');
    const Xc2 = R2 / Math.sqrt((R2 / R1) * (Q * Q + 1) - 1);
    const XL = (Q * R1 + (R1 * R2) / Xc2) / (Q * Q + 1);
    const Q2 = Math.sqrt(R2 / 50 - 1);
    pos.Lp = XL / w;
    pos.LL = (50 * Q2) / w;
    pos.fd = fd;
    pos.CLest = (1 / Xc2 + Q2 / R2) / w;
  }

  // Capacitances that present exactly Ropt to the plate, for load ZL at f.
  function optimumC(pos, f, ZL = cx(50)) {
    const w = 2 * Math.PI * f, R = V('Ropt'), Qu = V('Qu');
    const z3 = (CL) => {
      const Z1 = add(ZL, cx(w * pos.LL / Qu, w * pos.LL));
      const Z2 = inv(add(inv(Z1), cx(0, w * CL)));
      return add(Z2, cx(w * pos.Lp / Qu, w * pos.Lp));
    };
    const g = (CL) => inv(z3(CL)).re * R - 1;
    const roots = [];
    let prev = 1e-12, gp = g(prev);
    for (let i = 1; i <= 600; i++) {
      const c = 1e-12 * Math.pow(1e5, i / 600);
      const gc = g(c);
      if (Math.sign(gc) !== Math.sign(gp)) {
        let a = prev, b = c, ga = gp;
        for (let k = 0; k < 60; k++) {
          const m = Math.sqrt(a * b), gm = g(m);
          if (Math.sign(gm) === Math.sign(ga)) { a = m; ga = gm; } else b = m;
        }
        const CL = Math.sqrt(a * b);
        const Cpt = -inv(z3(CL)).im / w;
        if (Cpt > V('Cout')) roots.push({ CL, Ct: Cpt - V('Cout') });
      }
      prev = c; gp = gc;
    }
    if (!roots.length) return null;
    const est = pos.CLest * Math.pow(pos.fd / f, 1);
    roots.sort((a, b) => Math.abs(Math.log(a.CL / est)) - Math.abs(Math.log(b.CL / est)));
    return roots[0];
  }

  // Placeholder dial law: ln C linear in dial reading, fitted per switch position so that
  // the optimum into 50 Ω falls on Manual Table 4-1's presets.
  function fitLine(pts) {
    const n = pts.length, mx = pts.reduce((s, p) => s + p[0], 0) / n, my = pts.reduce((s, p) => s + p[1], 0) / n;
    let sxx = 0, sxy = 0;
    for (const [x, y] of pts) { sxx += (x - mx) ** 2; sxy += (x - mx) * (y - my); }
    return { mx, my, span: Math.max(...pts.map((p) => p[0])) - Math.min(...pts.map((p) => p[0])), b: sxx ? sxy / sxx : 0 };
  }
  function buildPositions() {
    for (const pos of POSITIONS) {
      const bands = BANDS.filter((b) => b.pos === pos.i);
      const lo = Math.min(...bands.map((b) => b.lo)), hi = Math.max(...bands.map((b) => b.hi));
      designInductors(pos, Math.sqrt(lo * hi) * 1e3);
      const tp = [], lp = [];
      for (const b of bands) for (const e of [0, 1]) {
        const f = (e ? b.hi : b.lo) * 1e3, o = optimumC(pos, f);
        tp.push([b.tune[e], Math.log(o.Ct)]);
        lp.push([b.load[e], Math.log(o.CL)]);
      }
      pos.tuneFit = fitLine(tp);
      pos.loadFit = fitLine(lp);
    }
    // Positions whose presets barely move across the band cannot fix a slope; borrow the median.
    const med = (xs) => xs.sort((a, b) => a - b)[Math.floor(xs.length / 2)];
    const goodT = POSITIONS.filter((p) => p.tuneFit.span >= 6).map((p) => p.tuneFit.b);
    const goodL = POSITIONS.filter((p) => p.loadFit.span >= 6).map((p) => p.loadFit.b);
    const mT = med(goodT), mL = med(goodL);
    for (const pos of POSITIONS) {
      for (const [fit, m, key] of [[pos.tuneFit, mT, 'tuneLaw'], [pos.loadFit, mL, 'loadLaw']]) {
        const b = fit.span >= 6 ? fit.b : m;
        pos[key] = { a: fit.my - b * fit.mx, b };
      }
    }
  }
  buildPositions();
  const tuneC = (pos, d) => Math.exp(pos.tuneLaw.a + pos.tuneLaw.b * d);
  const loadC = (pos, d) => Math.exp(pos.loadLaw.a + pos.loadLaw.b * d);
  const tuneDial = (pos, C) => (Math.log(C) - pos.tuneLaw.a) / pos.tuneLaw.b;
  const loadDial = (pos, C) => (Math.log(C) - pos.loadLaw.a) / pos.loadLaw.b;

  // ---- loads ----
  const resonant = (res) => (f) => {
    let best = res[0];
    for (const r of res) if (Math.abs(Math.log(f / r.f0)) < Math.abs(Math.log(f / best.f0))) best = r;
    return cx(best.R, best.Q * best.R * (f / best.f0 - best.f0 / f));
  };
  const LOADS = {
    yagi:   { name: 'Station Yagi, 10/15/20 m', src: 'placeholder', note: 'Synthetic resonances at 14.175, 21.225 and 28.5 MHz until the DXE-3X10 is swept at ANT1.', z: resonant([{ f0: 14.175e6, R: 45, Q: 16 }, { f0: 21.225e6, R: 45, Q: 14 }, { f0: 28.5e6, R: 45, Q: 8 }]) },
    dipole: { name: 'Station fan dipole, 40/80 m', src: 'placeholder', note: 'Synthetic resonances at 3.75 and 7.15 MHz until the dipole is swept at ANT2.', z: resonant([{ f0: 3.75e6, R: 60, Q: 12 }, { f0: 7.15e6, R: 60, Q: 12 }]) },
    dummy:  { name: 'Dummy load, 50 Ω', src: 'ideal', z: () => cx(50) },
    swr25:  { name: 'Test load, SWR 2.5:1 (125 Ω)', src: 'ideal', z: () => cx(125) },
    swr3:   { name: 'Test load, SWR 3:1 (30 + j40 Ω)', src: 'ideal', z: () => cx(30, 40) },
    swr5:   { name: 'Test load, SWR 5:1 (250 Ω)', src: 'ideal', z: () => cx(250) },
    open:   { name: 'Nothing connected (open coax)', src: 'ideal', open: true, z: () => cx(0.5, -35) },
  };

  // Touchstone .s1p (S or Z parameters; RI, MA or DB; Hz to GHz).
  function parseS1P(text, name) {
    let unit = 1e9, param = 'S', fmt = 'MA', z0 = 50;
    const pts = [];
    for (let line of text.split(/\r?\n/)) {
      line = line.replace(/!.*/, '').trim();
      if (!line) continue;
      if (line.startsWith('#')) {
        const t = line.slice(1).trim().toUpperCase().split(/\s+/);
        for (let i = 0; i < t.length; i++) {
          if (t[i] in { HZ: 1, KHZ: 1, MHZ: 1, GHZ: 1 }) unit = { HZ: 1, KHZ: 1e3, MHZ: 1e6, GHZ: 1e9 }[t[i]];
          else if (['S', 'Z', 'Y'].includes(t[i])) param = t[i];
          else if (['RI', 'MA', 'DB'].includes(t[i])) fmt = t[i];
          else if (t[i] === 'R') z0 = parseFloat(t[++i]);
        }
        continue;
      }
      const n = line.split(/[\s,]+/).map(Number);
      if (n.length < 3 || n.some(isNaN)) continue;
      let v;
      if (fmt === 'RI') v = cx(n[1], n[2]);
      else {
        const m = fmt === 'DB' ? Math.pow(10, n[1] / 20) : n[1], a = (n[2] * Math.PI) / 180;
        v = cx(m * Math.cos(a), m * Math.sin(a));
      }
      let g;
      if (param === 'S') g = v;
      else {
        const z = param === 'Z' ? v : inv(v); // normalized to z0
        g = div(sub(z, cx(1)), add(z, cx(1)));
      }
      pts.push({ f: n[0] * unit, g });
    }
    if (pts.length < 2) throw new Error('No data lines found. Expected a one-port Touchstone file (.s1p).');
    pts.sort((a, b) => a.f - b.f);
    const z = (f) => {
      let i = pts.findIndex((p) => p.f >= f);
      if (i <= 0) i = i === 0 ? 1 : pts.length - 1;
      const a = pts[i - 1], b = pts[i];
      const x = Math.min(1, Math.max(0, (f - a.f) / (b.f - a.f)));
      const g = cx(lerp(a.g.re, b.g.re, x), lerp(a.g.im, b.g.im, x));
      const zn = div(add(cx(1), g), sub(cx(1), g));
      return cx(zn.re * z0, zn.im * z0);
    };
    return { name: 'Measured: ' + name, src: 'measured', note: `${pts.length} points, ${(pts[0].f / 1e6).toFixed(3)}–${(pts[pts.length - 1].f / 1e6).toFixed(3)} MHz, Z0 ${z0} Ω.`, z, fmin: pts[0].f, fmax: pts[pts.length - 1].f };
  }

  const gammaOf = (Z) => div(sub(Z, cx(50)), add(Z, cx(50)));
  const swrOf = (Z) => { const g = Math.min(mag(gammaOf(Z)), 0.9999); return (1 + g) / (1 - g); };

  // ---- the amplifier at one instant ----
  // Returns every reading the panel or the X-ray views need.
  function solve({ pos, f, tune, load, ZL, drive, rtty }) {
    const p = POSITIONS[pos];
    const Ct = tuneC(p, tune), CL = loadC(p, load);
    const n = network(p, f, Ct + V('Cout'), CL, ZL);
    const s = rtty ? Math.sqrt(V('rttyMax') / 744) : 1; // 744 W: the model's saturated output
    const vmax = Vmax() * s, Gt = V('Gt') * s;
    const Vg = Math.sqrt(2 * drive * V('Rin'));
    const Zm = mag(n.Zp);
    let I = Gt * Vg, sat = 0;
    if (I * Zm > vmax) { sat = (I * Zm) / vmax - 1; I = vmax / Zm; }
    const Vp = I * Zm;
    const Prf = 0.5 * I * I * n.Zp.re;
    // Currents through the network to the output connector.
    const I3 = div(cx(Vp), n.Z3), V2 = mul(I3, n.Z2), Iout = div(V2, n.Z1), Vout = mul(Iout, ZL);
    const Vf = mul(add(Vout, mul(Iout, cx(50))), cx(0.5)), Vr = mul(sub(Vout, mul(Iout, cx(50))), cx(0.5));
    const Pfwd = (mag(Vf) ** 2) / 100, Prfl = (mag(Vr) ** 2) / 100, Pdel = Pfwd - Prfl;
    const Ip = V('Iq') + V('kdc') * I;
    const Ig2 = V('kg2') * I + V('kg2sat') * sat;
    const Ig1 = Vg > V('Vgth') ? V('kg1') * Math.pow((Vg - V('Vgth')) / 10, 1.5) : 0;
    const Pdc = V('HV') * Ip, Pdiss = Pdc - Prf;
    // TRI: parallel plate-load resistance against the optimum, and how far TUNE is off.
    const q = 1 / (n.Yp.re * V('Ropt'));
    const tdet = n.Yp.im * V('Ropt');
    let tri = 'off';
    if (Pfwd >= V('triMin') && Math.abs(tdet) < 1.2 && q > 0.5 && q < 2) {
      tri = q > 1.2 ? 'L' : q > 1.07 ? 'LC' : q >= 0.935 ? 'C' : q >= 0.83 ? 'CR' : 'R';
    }
    return {
      Ct, CL, Lp: p.Lp, LL: p.LL, Zp: n.Zp, Yp: n.Yp, ZL, Vg, Vp, vmax, I, sat, Prf, Pfwd, Prfl, Pdel,
      Ip, Ig1, Ig2, Pdc, Pdiss, eff: Prf / Pdc, q, tdet, tri, loss: Prf - Pfwd, swr: swrOf(ZL),
    };
  }

  // Dial settings that present Ropt to the plate (used for hints, tests and sprint starts).
  function bestDials(pos, f, ZL) {
    const p = POSITIONS[pos];
    const o = optimumC(p, f, ZL);
    if (!o) return null;
    return { tune: tuneDial(p, o.Ct), load: loadDial(p, o.CL) };
  }

  // ---- simulator state and protection ----
  const MSG = {
    'hot-band': ['Band switch turned while transmitting. Hot switching eventually destroys the band switch.', 'Manual §3.2h'],
    'hot-ant':  ['Antenna changed while transmitting. Never press A1-A2 when transmitting.', 'Manual §4.1, §4.4'],
    'hot-rtty': ['RTTY mode changed while transmitting. Change modes only between transmissions.', 'Manual §4.3'],
    duty:       ['More than one minute of continuous drive. When tuning, pause at least a minute after each minute of drive so the tube cools.', 'Manual §4.5'],
    open:       ['Transmitting into an output with no antenna or dummy load connected.', 'Manual §4.4'],
    RFL: ['Protection trip: reflected power reached 250 W. Reduce drive or improve the antenna SWR.', 'Manual §4.5a, §4.6'],
    G1:  ['Protection trip: control-grid overload (G1). Reduce drive.', 'Manual §3.2j, §4.6'],
    G2:  ['Protection trip: screen-grid overload (G2). Reduce drive and/or retune.', 'Manual §3.2j, §4.6'],
    IP:  ['Protection trip: plate-current overload (IP). Reduce drive and/or retune.', 'Manual §3.2j, §4.6'],
    TRI: ['Protection trip: TRI flashing. The tuning is off or the antenna impedance changed; retune.', 'Manual §4.6'],
  };

  class Sim {
    constructor(onEvent) {
      this.onEvent = onEvent || (() => {});
      this.loads = Object.assign({}, LOADS);
      this.reset();
    }
    reset() {
      Object.assign(this, {
        t: 0, power: false, powerT: 0, warm: false, oper: true, rtty: false, ant: 1, pos: 4,
        tune: 50, load: 50, tripUntil: -1, tripReason: null, trips: [], freq: 14175, drive: 0,
        keyHeld: false, latch: false, keyStart: null, dutyFlag: false, openFlag: false,
        mistuneT: 0, conn: { 1: 'yagi', 2: 'dipole' }, unsafeCount: 0, tripCount: 0,
      });
      this.r = this.evaluate();
    }
    emit(kind, text, cite, code) { this.onEvent({ t: this.t, kind, text, cite, code }); }
    get keyed() { return this.keyHeld || this.latch; }
    get selfTest() { return this.power && this.powerT < 2; }
    get tripped() { return this.power && this.t < this.tripUntil; }
    get operating() { return this.power && this.warm && this.oper && !this.tripped; }
    get warmLeft() { return Math.max(0, V('warmup') + 2 - this.powerT); }
    get keyDur() { return this.keyStart == null ? 0 : this.t - this.keyStart; }
    connected(a = this.ant) { return this.loads[this.conn[a]]; }
    ZL(a = this.ant) { return this.connected(a).z(this.freq * 1e3); }

    unsafe(code) {
      this.unsafeCount++;
      this.emit('unsafe', MSG[code][0], MSG[code][1], code);
    }
    trip(code) {
      this.tripUntil = this.t + V('tripHold');
      this.tripReason = code;
      this.tripCount++;
      this.trips = this.trips.filter((x) => this.t - x < 60).concat(this.t);
      this.emit('trip', MSG[code][0], MSG[code][1], code);
      if (this.trips.length >= 3) this.emit('warn', 'Repeated protection trips. Stop and find the cause: usually too much drive or an antenna mismatch.', 'Manual §4.6');
    }

    setPower(on) {
      if (on === this.power) return;
      this.power = on;
      this.powerT = 0;
      this.warm = false;
      this.oper = true;
      this.tripUntil = -1;
      this.emit('info', on ? 'Power on. Self-test, then a 150-second warm-up in STANDBY (OPER LED flashing).' : 'Power off. The amplifier is now a passive path from RF INPUT to ANT1.', on ? 'Manual §4.1' : 'Manual §4.1');
    }
    skipWarmup() { if (this.power && !this.warm) { this.powerT = V('warmup') + 2; this.warm = true; this.emit('info', 'Warm-up skipped (practice only; the real amplifier always takes 150 s).'); } }
    pressOper() {
      if (!this.power) return;
      if (!this.warm) { this.emit('info', 'OPER works only after the 150-second warm-up.', 'Manual §3.2d'); return; }
      this.oper = !this.oper;
    }
    pressRtty() {
      if (!this.power) return;
      if (this.keyed) this.unsafe('hot-rtty');
      this.rtty = !this.rtty;
    }
    pressAnt() {
      if (!this.power) return;
      if (this.keyed) this.unsafe('hot-ant');
      this.ant = 3 - this.ant;
    }
    setPos(i) {
      i = Math.max(0, Math.min(6, i));
      if (i === this.pos) return;
      if (this.operating && this.keyed) this.unsafe('hot-band');
      this.pos = i;
    }

    evaluate() {
      const zero = { Pfwd: 0, Prfl: 0, Pdel: 0, Ip: 0, Ig1: 0, Ig2: 0, Pdiss: 0, tri: 'off', bypass: false };
      const base = solve({ pos: this.pos, f: this.freq * 1e3, tune: this.tune, load: this.load, ZL: this.ZL(), drive: Math.max(this.drive, 1e-6), rtty: this.rtty });
      if (!(this.keyed && this.drive > 0)) {
        const idle = Object.assign({}, base, zero);
        idle.Ip = 0; idle.Pdiss = 0; // bias cut off between transmissions (placeholder for ACOM's bias optimizer)
        return idle;
      }
      if (!this.operating) {
        const a = this.power ? this.ant : 1;
        const g = mag(gammaOf(this.ZL(a)));
        return Object.assign({}, base, zero, { bypass: true, bypassFwd: this.drive, bypassRfl: this.drive * g * g, bypassAnt: a });
      }
      return Object.assign(base, { bypass: false });
    }

    tick(dt) {
      this.t += dt;
      if (this.power) {
        this.powerT += dt;
        if (!this.warm && this.powerT >= V('warmup') + 2) { this.warm = true; this.emit('info', 'Warm-up complete. The OPER LED is steady: the amplifier is in OPERATE.', 'Manual §4.1'); }
      }
      const tx = this.keyed && this.drive > 0;
      if (tx && this.power) {
        if (this.keyStart == null) this.keyStart = this.t;
        if (this.operating && this.keyDur > V('duty') && !this.dutyFlag) { this.dutyFlag = true; this.unsafe('duty'); }
      } else { this.keyStart = null; this.dutyFlag = false; }
      if (tx) {
        const a = this.power ? this.ant : 1;
        if (this.connected(a).open && !this.openFlag) { this.openFlag = true; this.unsafe('open'); }
      } else this.openFlag = false;

      const r = (this.r = this.evaluate());
      if (this.operating && tx) {
        const off = r.Pdiss > V('PDtrip') || (this.drive > V('mistuneW') && (r.tri === 'off' || r.q < 0.6 || r.q > 1.7));
        this.mistuneT = off ? this.mistuneT + dt : 0;
        if (r.Prfl >= V('RFLtrip')) this.trip('RFL');
        else if (r.Ig1 >= V('G1trip')) this.trip('G1');
        else if (r.Ig2 >= V('G2trip')) this.trip('G2');
        else if (r.Ip + r.Ig2 >= V('IPtrip')) this.trip('IP');
        else if (this.mistuneT > 0.5) { this.mistuneT = 0; this.trip('TRI'); }
      } else this.mistuneT = 0;
      if (this.tripped) this.r = this.evaluate();
      return this.r;
    }

    // Warnings shown by the yellow LEDs at this instant.
    warnings() {
      const r = this.r, on = this.operating && this.keyed && this.drive > 0;
      const w = { g1: on && r.Ig1 >= V('G1warn'), g2: on && r.Ig2 >= V('G2warn'), ip: on && r.Ip + r.Ig2 >= V('IPwarn') };
      if (this.tripped) { w.g1 = this.tripReason === 'G1'; w.g2 = this.tripReason === 'G2'; w.ip = this.tripReason === 'IP'; }
      return w;
    }
  }

  return { P, V, BANDS, POSITIONS, LOADS, MSG, bandOf, preset, solve, bestDials, optimumC, tuneC, loadC, parseS1P, swrOf, gammaOf, Sim, cx, mag, inv };
})();
if (typeof module !== 'undefined') module.exports = AmpModel;
