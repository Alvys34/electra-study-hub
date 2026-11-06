// widgets.js - the small interactive explainers. Each one is labelled as an illustration from ideal
// theory; none of them writes into the student's notebook.
import { l8Circuit } from './figures.js';
import { fmt } from './labkit.js';

const ILL = (t) => `<p class="ill">${t}</p>`;

/* ------------------------------------------------- Lab 6: KCL / KVL from the student's own numbers */
export function kcl(root, nb) {
  const g = k => nb.num(k);
  const row = (title, parts, total, unit) => {
    const vals = parts.map(([k]) => g(k));
    const T = g(total[0]);
    const ok = vals.every(v => v != null) && T != null;
    const sum = ok ? vals.reduce((a, b) => a + b, 0) : null;
    const d = ok && T ? ((sum - T) / T) * 100 : null;
    return `<div class="kc ${ok ? '' : 'wait'}"><b>${title}</b>
      <div class="eq">${parts.map(([k, l]) => `${l} (${fmt(g(k), unit)})`).join(' + ')} = ${ok ? `<b>${fmt(sum, unit)}</b>` : '…'}
      &nbsp;vs&nbsp; ${total[1]} = ${fmt(T, unit)}</div>
      ${ok ? `<div class="mean">Off by ${Math.abs(d).toFixed(1)}%</div>` : '<div class="mean">Fill in the measured column to see this.</div>'}</div>`;
  };
  root.innerHTML = `<div class="kcl"><h4>Your measured numbers, summed</h4>
    ${row('Figure 4 · KCL at the R₂/R₃ junction', [['p1I2m', 'I<sub>R2</sub>'], ['p1I3m', 'I<sub>R3</sub>']], ['p1ITm', 'I<sub>T</sub>'], 'mA')}
    ${row('Figure 4 · KVL round the loop', [['p1V1m', 'V<sub>R1</sub>'], ['p1V23m', 'V<sub>R2,3</sub>'], ['p1V4m', 'V<sub>R4</sub>']], ['p1Vs', 'V<sub>s</sub>'], 'V')}
    ${row('Figure 5 · KCL at the top junction', [['p2I12m', 'I<sub>R1,2</sub>'], ['p2I34m', 'I<sub>R3,4</sub>']], ['p2ITm', 'I<sub>T</sub>'], 'mA')}
    ${row('Figure 5 · KVL, left branch', [['p2V1m', 'V<sub>R1</sub>'], ['p2V2m', 'V<sub>R2</sub>']], ['p2Vs', 'V<sub>s</sub>'], 'V')}
    ${row('Figure 5 · KVL, right branch', [['p2V3m', 'V<sub>R3</sub>'], ['p2V4m', 'V<sub>R4</sub>']], ['p2Vs', 'V<sub>s</sub>'], 'V')}
    <p class="ill">These sums only use numbers you typed in the Measured column.</p></div>`;
  return { refresh: () => kcl(root, nb) };
}

/* ------------------------------------------------- Lab 7: balance explorer (ratios only) */
export function balance(root) {
  const steps = [1000, 1500, 2200, 3300, 4700, 6800, 8200, 10000, 12000, 15000, 22000];
  let i = 2;
  const draw = () => {
    const R6 = steps[i];
    const left = 470 / 1000, right = 4700 / R6;
    const fc = 1000 / 1470, fd = R6 / (4700 + R6);            // fraction of V_BE at C and at D (R2 ignored)
    const diff = fc - fd;                                       // >0: C higher than D
    const ang = Math.max(-1, Math.min(1, diff * 3)) * 60;
    const bal = Math.abs(diff) < 0.002;
    root.querySelector('.bal-r6').textContent = R6 >= 1000 ? `${R6 / 1000} kΩ` : `${R6} Ω`;
    root.querySelector('.bal-l').textContent = left.toFixed(3);
    root.querySelector('.bal-rr').textContent = right.toFixed(3);
    root.querySelector('.needle').setAttribute('transform', `rotate(${ang} 110 96)`);
    root.querySelector('.bal-msg').innerHTML = bal
      ? '<b>Balanced.</b> C and D are at the same voltage, so no current flows through R₂.'
      : diff > 0 ? 'C is higher than D, so current flows <b>C → D</b> through R₂.' : 'D is higher than C, so current flows <b>D → C</b> through R₂.';
    root.querySelector('.bal').classList.toggle('is-bal', bal);
  };
  root.innerHTML = `<div class="bal widget">
    <h4>Try it: change R₆ and watch the balance</h4>
    <svg viewBox="0 0 220 110" class="gauge" role="img" aria-label="Balance needle">
      <path class="g-arc" d="M30,96 A80,80 0 0 1 190,96"/><path class="g-mid" d="M110,14 L110,30"/>
      <text x="34" y="108" class="lv">D higher</text><text x="186" y="108" class="lv" text-anchor="end">C higher</text>
      <g class="needle"><path d="M110,96 L110,24"/><circle cx="110" cy="96" r="5"/></g></svg>
    <label class="slider">R₆ = <b class="bal-r6"></b><input type="range" min="0" max="${steps.length - 1}" value="${i}" aria-label="R6"></label>
    <div class="ratios"><span>R₃/R₄ = <b class="bal-l"></b></span><span>R₅/R₆ = <b class="bal-rr"></b></span></div>
    <p class="bal-msg"></p>
    ${ILL('Illustration with the nominal values. It shows direction only: your V<sub>R2</sub> readings come from Multisim and the DMM.')}
  </div>`;
  root.querySelector('input').oninput = e => { i = +e.target.value; draw(); };
  draw();
  return {};
}

/* ------------------------------------------------- Lab 8: ohmmeter test illustration */
export function ohmsim(root, env) {
  const caps = [100, 47, 10, 0.1, 0.01];
  const ranges = [['2 kΩ', 2e3], ['200 kΩ', 200e3], ['20 MΩ', 20e6]];
  let ci = 0, ri = 1, raf = 0, t0 = 0;
  const show = (s) => { root.querySelector('.dmm-read').textContent = s; };
  const run = () => {
    cancelAnimationFrame(raf);
    const C = caps[ci] * 1e-6, range = ranges[ri][1], Rm = range / 2, tau = Rm * C;
    const tOL = tau * Math.log(3);                            // apparent R = Rm (e^{t/τ} − 1) reaches the range at t = τ ln 3
    const msg = root.querySelector('.os-msg');
    msg.innerHTML = tOL > 120 ? `Would take about <b>${Math.round(tOL / 60)} min</b> to reach OL. Too slow: try a <b>lower</b> range.`
      : tOL < 0.05 ? `Over in about <b>${fmt(tOL, tOL < 1e-3 ? 'µs' : 'ms')}</b>: you’d only see a flicker, or nothing. Use the <b>highest</b> range.`
        : `Climbs to OL in about <b>${tOL < 1 ? fmt(tOL, 'ms') : tOL.toFixed(1) + ' s'}</b>: easy to watch.`;
    if (tOL > 120 || tOL < 0.05 || !env.motion()) { show(tOL < 0.05 ? 'OL' : tOL > 120 ? '0.000' : 'OL'); return; }
    t0 = performance.now();
    const tick = now => {
      const t = (now - t0) / 1000, R = Rm * (Math.exp(t / tau) - 1);
      if (R >= range) { show('OL'); return; }
      show(R >= 1e6 ? (R / 1e6).toFixed(2) + ' M' : R >= 1e3 ? (R / 1e3).toFixed(2) + ' k' : R.toFixed(0));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
  };
  root.innerHTML = `<div class="osim widget"><h4>Try it: what the ohmmeter test looks like</h4>
    <div class="osim-row"><div class="dmm"><span class="dmm-read">—</span><small>Ω</small></div>
    <div class="osim-ctl"><div class="seg" data-g="c">${caps.map((c, j) => `<button type="button" data-i="${j}" class="${j === ci ? 'on' : ''}">${c} µF</button>`).join('')}</div>
    <div class="seg" data-g="r">${ranges.map((r, j) => `<button type="button" data-i="${j}" class="${j === ri ? 'on' : ''}">${r[0]}</button>`).join('')}</div>
    <button type="button" class="btn sm" data-go>Connect the probes</button></div></div>
    <p class="os-msg"></p>
    ${ILL('Illustration with a simple meter model. Real meters differ, so record what <b>your</b> meter does.')}</div>`;
  root.querySelectorAll('.seg').forEach(s => s.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    s.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b));
    if (s.dataset.g === 'c') ci = +b.dataset.i; else ri = +b.dataset.i;
    show('—'); cancelAnimationFrame(raf);
  }));
  root.querySelector('[data-go]').onclick = run;
  return { unmount: () => cancelAnimationFrame(raf) };
}

/* ------------------------------------------------- Lab 8: the LED RC circuit */
export function rcsim(root, env) {
  const Vs = 12, R = 1000, Vf = 2.0;
  let variant = 'one', s1 = false, s2 = false, vc = 0, raf = 0, last = 0, slow = true;
  const C = () => ({ one: 100e-6, series: 1 / (1 / 100e-6 + 1 / 47e-6), parallel: 147e-6 })[variant];
  const draw = (i1 = 0, i2 = 0) => {
    const fig = root.querySelector('.rc-fig');
    fig.innerHTML = l8Circuit({ variant, s1, s2 });
    const glow = (id, i) => { const g = fig.querySelector(`[data-led="${id}"]`); if (g) { g.style.setProperty('--b', Math.min(1, i / 0.006).toFixed(2)); g.classList.toggle('lit', i > 2e-4); } };
    glow('led1', i1); glow('led2', i2);
    root.querySelector('.rc-v').textContent = `${vc.toFixed(2)} V`;
    root.querySelector('.rc-bar i').style.width = `${(vc / Vs) * 100}%`;
    root.querySelector('.rc-i1').textContent = `${(i1 * 1000).toFixed(1)} mA`;
    root.querySelector('.rc-i2').textContent = `${(i2 * 1000).toFixed(1)} mA`;
  };
  const step = now => {
    const dt = Math.min(0.05, (now - last) / 1000) / (slow ? 10 : 1);
    last = now;
    const i1 = s1 ? Math.max(0, (Vs - Vf - vc) / R) : 0;
    const i2 = s2 ? Math.max(0, (vc - Vf) / R) : 0;
    vc += ((i1 - i2) / C()) * dt;
    vc = Math.max(0, Math.min(Vs, vc));
    draw(i1, i2);
    raf = requestAnimationFrame(step);
  };
  root.innerHTML = `<div class="rcs widget"><h4>Try it: hold the switches</h4>
    <div class="seg" data-g="v"><button type="button" data-v="one" class="on">C₁ only</button><button type="button" data-v="series">C₁ + C₂ series</button><button type="button" data-v="parallel">C₁ ∥ C₂</button></div>
    <div class="rc-fig fig-art"></div>
    <div class="rc-ctl">
      <button type="button" class="hold" data-sw="s1">Hold S₁</button>
      <button type="button" class="hold" data-sw="s2">Hold S₂</button>
      <button type="button" class="btn sm ghost" data-dis>Discharge (short the leads)</button>
    </div>
    <div class="rc-read"><span>V<sub>C</sub> <b class="rc-v"></b></span><span class="rc-bar"><i></i></span>
      <span>LED₁ <b class="rc-i1"></b></span><span>LED₂ <b class="rc-i2"></b></span>
      <label class="chk"><input type="checkbox" data-slow checked> Slow motion ×10</label></div>
    ${ILL('Illustration: ideal parts, LEDs modelled as switching on at about 2 V. It predicts what to look for. Your observations come from the bench.')}</div>`;
  const hold = b => {
    const on = v => { if (b.dataset.sw === 's1') s1 = v; else s2 = v; b.classList.toggle('on', v); };
    b.addEventListener('pointerdown', e => { e.preventDefault(); b.setPointerCapture?.(e.pointerId); on(true); });
    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(ev => b.addEventListener(ev, () => on(false)));
    b.addEventListener('keydown', e => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); on(true); } });
    b.addEventListener('keyup', () => on(false));
  };
  root.querySelectorAll('.hold').forEach(hold);
  root.querySelector('[data-g="v"]').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    root.querySelectorAll('[data-g="v"] button').forEach(x => x.classList.toggle('on', x === b));
    variant = b.dataset.v; vc = 0;
  });
  root.querySelector('[data-dis]').onclick = () => { vc = 0; };
  root.querySelector('[data-slow]').onchange = e => { slow = e.target.checked; };
  draw();
  last = performance.now();
  raf = requestAnimationFrame(step);
  void env;
  return { unmount: () => cancelAnimationFrame(raf) };
}

/* ------------------------------------------------- Lab 9: practice oscilloscope */
const TPDS = [10e-6, 20e-6, 50e-6, 100e-6, 200e-6, 500e-6, 1e-3];
const VPDS = [0.2, 0.5, 1, 2, 5];
const tlabel = t => (t >= 1e-3 ? `${t * 1e3} ms` : `${Math.round(t * 1e6)} µs`);

export function scope(root, env, part) {
  const P = {
    1: { kind: 'sine', f: 2000, vpp: 3, ch2: false, tpd: 4, v1: 2, v2: 2, title: 'Part 1 · 2 kHz sine, 3 V<sub>pp</sub>' },
    2: { kind: 'sine', f: 1600, vpp: 5, ch2: true, tpd: 4, v1: 2, v2: 2, title: 'Part 2 · 1.6 kHz sine, 5 V<sub>pp</sub>' },
    3: { kind: 'square', f: 1000, vpp: 5, ch2: true, tpd: 4, v1: 3, v2: 3, title: 'Part 3 · 1 kHz square, 5 V<sub>pp</sub>' },
  }[part];
  const R = 1000, Cc = 0.1e-6, tau = R * Cc;
  let tpd = P.tpd, v1 = P.v1, v2 = P.v2, marks = true;
  const W = 400, H = 320, dx = W / 10, dy = H / 8;
  const w = 2 * Math.PI * P.f, Xc = 1 / (w * Cc), gain = Xc / Math.hypot(R, Xc), ph = -Math.atan(R / Xc);
  const Vp = P.vpp / 2;
  // steady-state square response: capacitor swings between ±Vm
  const Th = 0.5 / P.f, e = Math.exp(-Th / tau), Vm = Vp * (1 - e) / (1 + e);
  const ch1 = t => P.kind === 'sine' ? Vp * Math.sin(w * t) : ((t * P.f) % 1 + 1) % 1 < 0.5 ? Vp : -Vp;
  const ch2 = t => {
    if (P.kind === 'sine') return Vp * gain * Math.sin(w * t + ph);
    const ph01 = ((t * P.f) % 1 + 1) % 1, tt = (ph01 % 0.5) / P.f;
    return ph01 < 0.5 ? Vp - (Vp + Vm) * Math.exp(-tt / tau) : -Vp + (Vp + Vm) * Math.exp(-tt / tau);
  };
  const path = (fn, vpd) => {
    const T = TPDS[tpd] * 10; let d = '';
    for (let i = 0; i <= 400; i++) {
      const t = (i / 400) * T, y = H / 2 - (fn(t) / vpd) * dy;
      d += `${i ? 'L' : 'M'}${(i / 400) * W},${Math.max(-4, Math.min(H + 4, y)).toFixed(1)}`;
    }
    return d;
  };
  const draw = () => {
    const T = 1 / P.f, divT = T / TPDS[tpd], d1 = P.vpp / VPDS[v1];
    let grid = '';
    for (let i = 1; i < 10; i++) grid += `<path class="sg" d="M${i * dx},0 V${H}"/>`;
    for (let j = 1; j < 8; j++) grid += `<path class="sg" d="M0,${j * dy} H${W}"/>`;
    for (let i = 0; i <= 50; i++) grid += `<path class="sg t" d="M${i * dx / 5},${H / 2 - 4} V${H / 2 + 4}"/>`;
    for (let j = 0; j <= 40; j++) grid += `<path class="sg t" d="M${W / 2 - 4},${j * dy / 5} H${W / 2 + 4}"/>`;
    let mk = '';
    if (marks && divT <= 10) {
      const x0 = P.kind === 'sine' ? 0 : 0, x1 = divT * dx;
      mk += `<path class="mk" d="M${x0},${H - 14} H${x1}"/><text class="mkt" x="${(x0 + x1) / 2}" y="${H - 20}" text-anchor="middle">T = ${divT.toFixed(2)} div</text>`;
      if (part === 2) {
        const td = (-ph / w), dd = td / TPDS[tpd];
        if (dd < 10) mk += `<path class="mk c2" d="M0,${H / 2 + 16} H${dd * dx}"/><text class="mkt c2" x="${dd * dx + 6}" y="${H / 2 + 20}">delay ${dd.toFixed(2)} div</text>`;
      }
      if (part === 3) {
        const x = (tau / TPDS[tpd]) * dx, yb = H / 2 + (Vm / VPDS[v2]) * dy, y63 = yb - (0.632 * P.vpp / VPDS[v2]) * dy;
        if (x < W) mk += `<path class="mk c2" d="M${x},${H} V${y63} H0"/><text class="mkt c2" x="${x + 6}" y="${y63 - 6}">63.2% at τ = ${(tau / TPDS[tpd]).toFixed(2)} div</text>`;
      }
    }
    root.querySelector('.scr').innerHTML = `<rect class="sbg" width="${W}" height="${H}"/>${grid}
      <path class="tr1" d="${path(ch1, VPDS[v1])}"/>${P.ch2 ? `<path class="tr2" d="${path(ch2, VPDS[v2])}"/>` : ''}${mk}`;
    root.querySelector('.sc-read').innerHTML = `
      <div><b>Time:</b> one period = ${divT.toFixed(2)} div × ${tlabel(TPDS[tpd])}/div = ${fmt(divT * TPDS[tpd], 'µs')} → f = ${fmt(1 / (divT * TPDS[tpd]), 'Hz')}</div>
      <div><b class="c1">CH1:</b> ${d1.toFixed(2)} div pk-pk × ${VPDS[v1]} V/div ÷ 2 = ${fmt(d1 * VPDS[v1] / 2, 'V')} peak${d1 > 8 ? ' <i>(off screen: raise Volt/Div)</i>' : ''}</div>
      ${P.ch2 ? `<div><b class="c2">CH2:</b> ${(P.kind === 'sine' ? P.vpp * gain : 2 * Vm) / VPDS[v2] > 8 ? 'off screen: raise Volt/Div' : `${((P.kind === 'sine' ? P.vpp * gain : 2 * Vm) / VPDS[v2]).toFixed(2)} div pk-pk at ${VPDS[v2]} V/div`}</div>` : ''}`;
    root.querySelector('.sc-tpd').textContent = `${tlabel(TPDS[tpd])}/div`;
    root.querySelector('.sc-v1').textContent = `${VPDS[v1]} V/div`;
    if (P.ch2) root.querySelector('.sc-v2').textContent = `${VPDS[v2]} V/div`;
  };
  const knob = (cls, label) => `<div class="knob"><span>${label}</span><button type="button" data-k="${cls}" data-d="-1" aria-label="${label} down">−</button><b class="${cls}"></b><button type="button" data-k="${cls}" data-d="1" aria-label="${label} up">+</button></div>`;
  root.innerHTML = `<div class="scope widget"><h4>Practice screen · ${P.title}</h4>
    <div class="sc-wrap"><svg class="scr" viewBox="-2 -2 ${W + 4} ${H + 4}" role="img" aria-label="Oscilloscope practice screen"></svg>
      <div class="sc-ctl">${knob('sc-tpd', 'Time/Div')}${knob('sc-v1', 'CH1 Volt/Div')}${P.ch2 ? knob('sc-v2', 'CH2 Volt/Div') : ''}
        <label class="chk"><input type="checkbox" data-mk checked> Show reading guides</label></div></div>
    <div class="sc-read"></div>
    ${ILL('Ideal theory for practice reading the grid. Your table values must come from the real oscilloscope.')}</div>`;
  root.querySelectorAll('[data-k]').forEach(b => b.onclick = () => {
    const d = +b.dataset.d;
    if (b.dataset.k === 'sc-tpd') tpd = Math.max(0, Math.min(TPDS.length - 1, tpd + d));
    if (b.dataset.k === 'sc-v1') v1 = Math.max(0, Math.min(VPDS.length - 1, v1 + d));
    if (b.dataset.k === 'sc-v2') v2 = Math.max(0, Math.min(VPDS.length - 1, v2 + d));
    draw();
  });
  root.querySelector('[data-mk]').onchange = e => { marks = e.target.checked; draw(); };
  draw();
  void env;
  return {};
}
