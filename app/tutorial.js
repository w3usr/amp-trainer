// Shared helpers for the tutorial pages: complex arithmetic, SVG, Smith-chart grids, a line plot
// with a hover readout, and the trainer's output network walked part by part. All physics comes
// from AmpModel (model.js), the same code the trainer runs.
const Tut = (() => {
  const M = AmpModel;
  const NS = 'http://www.w3.org/2000/svg';
  const $ = (id) => document.getElementById(id);
  const mk = (tag, attrs = {}, parent) => {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  };

  // ---- complex numbers ----
  const { cx, inv, mag } = M;
  const add = (a, b) => cx(a.re + b.re, a.im + b.im);
  const sub = (a, b) => cx(a.re - b.re, a.im - b.im);
  const mul = (a, b) => cx(a.re * b.re - a.im * b.im, a.re * b.im + a.im * b.re);
  const div = (a, b) => mul(a, inv(b));
  const scale = (a, k) => cx(a.re * k, a.im * k);
  // Reflection coefficient of impedance Z (ohms) against reference z0, and back.
  const gamma = (Z, z0) => { const z = scale(Z, 1 / z0); return div(sub(z, cx(1)), add(z, cx(1))); };
  const zOf = (g, z0) => scale(div(add(cx(1), g), sub(cx(1), g)), z0);
  const swrOf = (g) => { const m = Math.min(mag(g), 0.9999); return (1 + m) / (1 - m); };

  // ---- formatting ----
  const num = (v, d = 0) => v.toLocaleString('en-US', { maximumFractionDigits: d, minimumFractionDigits: d });
  const ohm = (v) => num(v, Math.abs(v) < 10 && Math.abs(v) >= 0.05 ? 1 : 0);
  const fmtZ = (Z) => `${ohm(Z.re)} ${Z.im < 0 ? '−' : '+'} j${ohm(Math.abs(Z.im))} Ω`;
  const fmtC = (C) => `${num(C * 1e12)} pF`;
  const fmtL = (L) => `${num(L * 1e6, 2)} µH`;
  const minus = (s) => String(s).replace('-', '−');

  // ---- Smith chart ----
  // Screen coordinates are Γ itself, with the imaginary axis flipped so inductive is up.
  let clipN = 0;
  const P = (g) => [g.re, -g.im];
  function smithGrid(svg, { r = [], x = [], g = [], z0 = null, target = false } = {}) {
    const id = 'unit' + ++clipN;
    mk('circle', { r: 1 }, mk('clipPath', { id }, mk('defs', {}, svg)));
    const grid = mk('g', { 'clip-path': `url(#${id})` }, svg);
    mk('line', { x1: -1, y1: 0, x2: 1, y2: 0, class: 'axis' }, grid);
    for (const v of r) mk('circle', { cx: v / (1 + v), cy: 0, r: 1 / (1 + v), class: 'rgrid' }, grid);
    for (const v of x) for (const s of [1, -1]) mk('circle', { cx: 1, cy: -s / v, r: 1 / v, class: 'rgrid' }, grid);
    for (const v of g) mk('circle', { cx: -v / (1 + v), cy: 0, r: 1 / (1 + v), class: 'ggrid' }, grid);
    if (target) mk('circle', { cx: -0.5, cy: 0, r: 0.5, class: 'target' }, grid);
    mk('circle', { r: 1, class: 'rim' }, svg);
    if (z0) {
      // Resistance circles labeled where they cross the axis; reactance arcs where they meet the rim.
      for (const v of r) {
        const t = mk('text', { x: (v - 1) / (v + 1) + 0.012, y: -0.02, class: 'lbl' }, svg);
        t.textContent = ohm(v * z0);
      }
      for (const v of x) for (const s of [1, -1]) {
        const gx = (v * v - 1) / (v * v + 1), gy = (2 * s * v) / (v * v + 1);
        const t = mk('text', { x: gx * 1.09, y: -gy * 1.09 + 0.02, class: 'lbl', 'text-anchor': gx < -0.2 ? 'end' : gx > 0.2 ? 'start' : 'middle' }, svg);
        t.textContent = `${s > 0 ? '+' : '−'}j${ohm(v * z0)}`;
      }
    }
    return mk('g', {}, svg);
  }
  // Γ under a pointer event on a Smith-chart SVG.
  function gammaAt(svg, e) {
    const pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
    const p = pt.matrixTransform(svg.getScreenCTM().inverse());
    return cx(p.x, -p.y);
  }

  // ---- the trainer's network, part by part ----
  // Mirrors AmpModel.network, but returns the impedance after each part, and the path in between
  // for drawing: from the antenna (A) through LL (1), LOAD (2), Lp (3) and TUNE to the plate (P).
  function walk(pos, f, tune, load, ZL, steps = 32) {
    const p = M.POSITIONS[pos], w = 2 * Math.PI * f, Qu = M.V('Qu');
    const Ct = M.tuneC(p, tune), Cp = Ct + M.V('Cout'), CL = M.loadC(p, load);
    const series = (Z0, L) => (t) => add(Z0, scale(cx(1 / Qu, 1), w * L * t));
    const shunt = (Z0, C) => (t) => inv(add(inv(Z0), cx(0, w * C * t)));
    const segs = [];
    const run = (kind, fn) => { const pts = []; for (let i = 0; i <= steps; i++) pts.push(fn(i / steps)); segs.push({ kind, pts }); return pts[steps]; };
    const Z1 = run('ind', series(ZL, p.LL));
    const Z2 = run('cap', shunt(Z1, CL));
    const Z3 = run('ind', series(Z2, p.Lp));
    const Zp = run('cap', shunt(Z3, Cp));
    return { segs, nodes: { A: ZL, 1: Z1, 2: Z2, 3: Z3, P: Zp }, Ct, Cp, CL, Lp: p.Lp, LL: p.LL };
  }
  // Power reaching the load at frequency f, per unit plate current, for fixed dial settings:
  // the network's filtering of whatever the tube produces at that frequency.
  function delivered(pos, f, tune, load, ZL) {
    const p = M.POSITIONS[pos];
    const n = M.network(p, f, M.tuneC(p, tune) + M.V('Cout'), M.loadC(p, load), ZL);
    const Iout = div(mul(div(n.Zp, n.Z3), n.Z2), n.Z1);
    return 0.5 * mag(Iout) ** 2 * ZL.re;
  }
  const parallelR = (Z) => 1 / inv(Z).re;

  // ---- TRI lights, as on the panel ----
  function setTri(el, tri) {
    const [l, c, r] = el.children;
    l.classList.toggle('on', tri === 'L' || tri === 'LC');
    c.classList.toggle('on', tri === 'LC' || tri === 'C' || tri === 'CR');
    r.classList.toggle('on', tri === 'R' || tri === 'CR');
  }

  // ---- line plot with a hover readout ----
  // opts: { x: {min, max, log, ticks, fmt, title}, y: {...}, series: [{cls, pts}], labels: [{x, y, text, anchor}],
  //         marks: [{x, y}], refs: [{x}], tip: (x) => html }
  let tipEl = null;
  function plot(svg, opts) {
    const W = Math.max(300, Math.round(svg.clientWidth || svg.parentElement.clientWidth || 640)), H = opts.height || 260;
    const L = 58, R = 16, T = 14, B = 40;
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.innerHTML = '';
    const tf = (a, v) => (a.log ? Math.log10(v) : v);
    const sx = (v) => L + ((tf(opts.x, v) - tf(opts.x, opts.x.min)) / (tf(opts.x, opts.x.max) - tf(opts.x, opts.x.min))) * (W - L - R);
    const sy = (v) => T + (1 - (tf(opts.y, v) - tf(opts.y, opts.y.min)) / (tf(opts.y, opts.y.max) - tf(opts.y, opts.y.min))) * (H - T - B);
    for (const v of opts.y.ticks) {
      mk('line', { x1: L, x2: W - R, y1: sy(v), y2: sy(v), class: 'gridl' }, svg);
      const t = mk('text', { x: L - 6, y: sy(v) + 4, 'text-anchor': 'end', class: 'tick' }, svg); t.textContent = opts.y.fmt(v);
    }
    for (const v of opts.x.ticks) {
      const t = mk('text', { x: sx(v), y: H - B + 18, 'text-anchor': 'middle', class: 'tick' }, svg); t.textContent = opts.x.fmt(v);
    }
    mk('line', { x1: L, x2: W - R, y1: H - B, y2: H - B, class: 'axisl' }, svg);
    const xt = mk('text', { x: W - R, y: H - 4, 'text-anchor': 'end', class: 'tick' }, svg); xt.textContent = opts.x.title;
    const yt = mk('text', { x: 4, y: T - 2 + 10, class: 'tick' }, svg); yt.textContent = opts.y.title;
    for (const r of opts.refs || []) mk('line', { x1: sx(r.x), x2: sx(r.x), y1: T, y2: H - B, class: 'ref' }, svg);
    for (const s of opts.series) mk('polyline', { class: 'ser ' + s.cls, points: s.pts.map(([x, y]) => `${sx(x).toFixed(1)},${sy(Math.min(opts.y.max, Math.max(opts.y.min, y))).toFixed(1)}`).join(' ') }, svg);
    for (const m of opts.marks || []) mk('circle', { cx: sx(m.x), cy: sy(m.y), r: 5, class: 'mark one' }, svg);
    for (const l of opts.labels || []) {
      const t = mk('text', { x: sx(l.x) + (l.dx || 0), y: sy(l.y) + (l.dy || 0), 'text-anchor': l.anchor || 'start', class: 'dlbl' }, svg); t.textContent = l.text;
    }
    // Hover: a crosshair at the pointer's x and a tooltip from opts.tip.
    const cross = mk('line', { y1: T, y2: H - B, class: 'cross', visibility: 'hidden' }, svg);
    if (!tipEl) { tipEl = document.createElement('div'); tipEl.className = 'tip'; tipEl.hidden = true; document.body.appendChild(tipEl); }
    const xOf = (px) => {
      const u = (px - L) / (W - L - R), a = tf(opts.x, opts.x.min), b = tf(opts.x, opts.x.max), v = a + u * (b - a);
      return opts.x.log ? 10 ** v : v;
    };
    svg.onpointermove = (e) => {
      const pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
      const p = pt.matrixTransform(svg.getScreenCTM().inverse());
      if (p.x < L || p.x > W - R) { svg.onpointerleave(); return; }
      cross.setAttribute('x1', p.x); cross.setAttribute('x2', p.x); cross.setAttribute('visibility', 'visible');
      tipEl.innerHTML = opts.tip(xOf(p.x)); tipEl.hidden = false;
      const tw = tipEl.offsetWidth;
      tipEl.style.left = Math.min(innerWidth - tw - 8, Math.max(8, e.clientX + 14)) + 'px';
      tipEl.style.top = Math.max(8, e.clientY - 44) + 'px';
    };
    svg.onpointerleave = () => { cross.setAttribute('visibility', 'hidden'); tipEl.hidden = true; };
  }

  return { M, $, mk, cx, add, sub, mul, div, inv, mag, scale, gamma, zOf, swrOf, num, ohm, fmtZ, fmtC, fmtL, minus, P, smithGrid, gammaAt, walk, delivered, parallelR, setTri, plot };
})();
