// widgets.js - small hands-on simulations used inside Learn cards.
// Each widget: (host, api) => cleanup?   api.done() marks the card's mission complete.
import { eng, sig, sup, plain } from '../core/num.js';
import { BANDS, GOLD, SILVER, shells } from '../practice/generators.js';
import { resistorBandsSVG, comboSVG } from '../core/schematic.js';
import { sfx } from '../core/fx.js';

const $ = (root, sel) => root.querySelector(sel);

/** Animate dots along an SVG path. speed = path-lengths per second (0 = stopped, negative = reverse). */
function flow(svg, path, { count = 14, r = 4, cls = 'e-dot' } = {}) {
  const ns = 'http://www.w3.org/2000/svg';
  const len = path.getTotalLength();
  const dots = Array.from({ length: count }, () => { const c = document.createElementNS(ns, 'circle'); c.setAttribute('r', r); c.setAttribute('class', cls); svg.appendChild(c); return c; });
  let speed = 0.15, off = 0, last = performance.now(), raf = 0, alive = true;
  const tick = (t) => {
    if (!alive) return;
    const dt = Math.min(0.05, (t - last) / 1000); last = t;
    off = (off + speed * dt + 1) % 1;
    dots.forEach((d, i) => {
      const p = path.getPointAtLength(((i / count + off) % 1) * len);
      d.setAttribute('cx', p.x); d.setAttribute('cy', p.y);
    });
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);
  return {
    set speed(v) { speed = v; },
    show(v) { dots.forEach(d => d.style.opacity = v ? 1 : 0); },
    stop() { alive = false; cancelAnimationFrame(raf); },
  };
}

function slider(label, min, max, step, val, fmt) {
  return `<label class="sl"><span class="sl-l">${label}</span><input type="range" min="${min}" max="${max}" step="${step}" value="${val}"><output>${fmt(val)}</output></label>`;
}
function bindSlider(el, fmt, on) {
  const inp = $(el, 'input'), out = $(el, 'output');
  inp.addEventListener('input', () => { out.textContent = fmt(+inp.value); on(+inp.value); });
  return inp;
}

export const WIDGETS = {
  // ------------------------------------------------------------------ 1A
  prefixSlider(host, api) {
    const examples = [[4700, 'Ω'], [0.000047, 'F'], [2_400_000_000, 'Hz'], [0.0035, 'A'], [150000, 'W'], [0.00000000022, 'F']];
    let i = 0, cur = 0;
    const P = [['G', 9], ['M', 6], ['k', 3], ['', 0], ['m', -3], ['µ', -6], ['n', -9], ['p', -12]];
    host.innerHTML = `<div class="wg">
      <div class="wg-big"><span id="pv"></span></div>
      <div class="wg-sub" id="ps"></div>
      <div class="chips" id="pc">${P.map(([p, e], k) => `<button class="pchip" data-k="${k}">${p || '—'}<small>10${sup(e)}</small></button>`).join('')}</div>
      <div class="row-c"><button class="btn ghost sm" id="pn">↻ New number</button></div></div>`;
    const render = () => {
      const [v, u] = examples[i]; const [p, e] = P[cur];
      const m = v / Math.pow(10, e);
      const good = Math.abs(m) >= 1 && Math.abs(m) < 1000;
      $(host, '#pv').innerHTML = `${Math.abs(m) >= 1e6 || Math.abs(m) < 1e-4 ? sig(m, 3).replace(/e\+?(-?\d+)/, (_, x) => ` × 10${sup(x)}`) : plain(m, 4)} <b>${p}${u}</b>`;
      $(host, '#pv').className = good ? 'ok' : '';
      $(host, '#ps').innerHTML = good ? '✔ Number is between 1 and 999 — that\'s the sweet spot.' : 'Tap prefixes until the number lands between 1 and 999.';
      host.querySelectorAll('.pchip').forEach((b, k) => b.classList.toggle('on', k === cur));
      if (good && cur !== 3) api.done();
    };
    $(host, '#pc').addEventListener('click', e => { const b = e.target.closest('.pchip'); if (!b) return; cur = +b.dataset.k; sfx.tap(); render(); });
    $(host, '#pn').addEventListener('click', () => { i = (i + 1) % examples.length; cur = 3; render(); });
    cur = 3; render();
  },

  notationMachine(host, api) {
    host.innerHTML = `<div class="wg">
      <label class="inp-l">Type any number <input class="inp" id="nm" value="0.00056" inputmode="decimal"></label>
      <div class="cmp2"><div class="cmpc"><div class="k">Scientific</div><div class="v" id="ns"></div><div class="n">1 digit before the point</div></div>
      <div class="cmpc eng"><div class="k">Engineering</div><div class="v" id="ne"></div><div class="n">exponent is a multiple of 3</div></div></div>
      <div class="wg-sub" id="nh"></div></div>`;
    const inp = $(host, '#nm');
    const upd = () => {
      const x = parseFloat(inp.value.replace(/,/g, ''));
      if (!isFinite(x) || x === 0) { $(host, '#ns').textContent = '—'; $(host, '#ne').textContent = '—'; return; }
      const e = Math.floor(Math.log10(Math.abs(x)));
      const m = x / Math.pow(10, e);
      const e3 = Math.floor(e / 3) * 3, m3 = x / Math.pow(10, e3);
      $(host, '#ns').innerHTML = `${sig(m, 4)} × 10${sup(e)}`;
      $(host, '#ne').innerHTML = `${sig(m3, 4)} × 10${sup(e3)} <small>${eng(x, '', 4).replace(/^[-\d.]+\s*/, '') || '(no prefix)'}</small>`;
      $(host, '#nh').innerHTML = `Decimal hops ${Math.abs(e)} place${Math.abs(e) === 1 ? '' : 's'} ${e >= 0 ? 'left → positive exponent' : 'right → negative exponent'}.`;
      if (Math.abs(x) < 0.001 || Math.abs(x) >= 1e6) api.done();
    };
    inp.addEventListener('input', upd); upd();
  },

  // ------------------------------------------------------------------ 1B
  resistorBuilder(host, api) {
    const targets = [[4700, 5], [220, 5], [10000, 10], [330000, 5], [56, 5], [1200, 5], [6.8, 5]];
    let t = 0;
    const sel = [1, 0, 0, 1]; // start at brown-black-black-silver (10 Ω ±10%) so the target takes real work
    const MULT = [...BANDS.slice(0, 7), GOLD, SILVER];
    const multExp = k => (k <= 6 ? k : k === 7 ? -1 : -2);
    const TOL = [GOLD, SILVER, BANDS[1], BANDS[2]];
    let active = 0;
    host.innerHTML = `<div class="wg">
      <div class="wg-target" id="rt"></div>
      <div class="res-hold" id="rs"></div>
      <div class="band-tabs" id="rbt">${['1st digit', '2nd digit', 'Multiplier', 'Tolerance'].map((l, k) => `<button data-k="${k}">${l}</button>`).join('')}</div>
      <div class="palette" id="rp"></div>
      <div class="wg-read" id="rv"></div></div>`;
    const bandObjs = () => [BANDS[sel[0]], BANDS[sel[1]], MULT[sel[2]], TOL[sel[3]]];
    const value = () => (sel[0] * 10 + sel[1]) * Math.pow(10, multExp(sel[2]));
    const render = () => {
      const [tv, tt] = targets[t];
      $(host, '#rt').innerHTML = `🎯 Build: <b>${eng(tv, 'Ω')} ±${tt}%</b> <button class="btn ghost xs" id="rnx">next target</button>`;
      $(host, '#rs').innerHTML = resistorBandsSVG(bandObjs().map(b => b.hex), 320);
      host.querySelectorAll('#rbt button').forEach((b, k) => b.classList.toggle('on', k === active));
      const opts = active < 2 ? BANDS.map((b, k) => [b, k, `${b.d}`]) : active === 2 ? MULT.map((b, k) => [b, k, `×10${sup(multExp(k))}`]) : TOL.map((b, k) => [b, k, `±${b.tol}%`]);
      $(host, '#rp').innerHTML = opts.map(([b, k, lab]) => `<button class="sw ${sel[active] === k ? 'on' : ''}" data-k="${k}" style="--c:${b.hex}"><i></i><span>${b.n}</span><small>${lab}</small></button>`).join('');
      const v = value(), tol = TOL[sel[3]].tol;
      $(host, '#rv').innerHTML = `<b>${eng(v, 'Ω')}</b> ±${tol}% &nbsp;→&nbsp; ${eng(v * (1 - tol / 100), 'Ω', 4)} to ${eng(v * (1 + tol / 100), 'Ω', 4)}`;
      const hit = Math.abs(v - tv) < 1e-9 * tv + 1e-12 && tol === tt;
      $(host, '#rv').classList.toggle('ok', hit);
      if (hit) { api.done(); }
      $(host, '#rnx').onclick = () => { t = (t + 1) % targets.length; render(); };
    };
    $(host, '#rbt').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; active = +b.dataset.k; render(); });
    $(host, '#rp').addEventListener('click', e => {
      const b = e.target.closest('.sw'); if (!b) return;
      const k = +b.dataset.k; if (active === 0 && k === 0) return; // first digit can't be black
      sel[active] = k; sfx.tap(); if (active < 3) active++; render();
    });
    render();
  },

  wireLab(host, api) {
    const mats = [['Silver', 9.9, '#e5e7eb'], ['Copper', 10.37, '#f59e0b'], ['Gold', 14.7, '#facc15'], ['Aluminum', 17, '#cbd5e1'], ['Nickel', 47, '#a3a3a3'], ['Iron', 74, '#78716c']];
    let L = 500, d = 10, m = 1;
    host.innerHTML = `<div class="wg">
      <svg viewBox="0 0 400 90" class="wire-svg"><rect id="wb" x="20" y="35" height="20" rx="10"/></svg>
      <div class="chips" id="wm">${mats.map(([n], k) => `<button class="pchip" data-k="${k}">${n}</button>`).join('')}</div>
      ${slider('Length', 10, 1000, 10, L, v => v + ' ft')}
      ${slider('Diameter', 2, 80, 1, d, v => v + ' mils')}
      <div class="wg-read" id="wr"></div></div>`;
    const sls = host.querySelectorAll('.sl');
    const render = () => {
      const [, rho, col] = mats[m];
      const R = rho * L / (d * d);
      const wb = $(host, '#wb');
      wb.setAttribute('width', 30 + L * 0.34); wb.setAttribute('height', 4 + d * 0.5); wb.setAttribute('y', 45 - (4 + d * 0.5) / 2); wb.style.fill = col;
      host.querySelectorAll('#wm .pchip').forEach((b, k) => b.classList.toggle('on', k === m));
      $(host, '#wr').innerHTML = `R = ρL/d² = ${rho} × ${L} / ${d}² = <b>${eng(R, 'Ω')}</b>`;
      $(host, '#wr').classList.toggle('ok', R < 1);
      if (R < 1) api.done();
    };
    bindSlider(sls[0], v => v + ' ft', v => { L = v; render(); });
    bindSlider(sls[1], v => v + ' mils', v => { d = v; render(); });
    $(host, '#wm').addEventListener('click', e => { const b = e.target.closest('.pchip'); if (!b) return; m = +b.dataset.k; render(); });
    render();
  },

  // ------------------------------------------------------------------ 1C
  flowToggle(host, api) {
    host.innerHTML = `<div class="wg">
      <svg viewBox="0 0 400 220" class="loop-svg">
        <path id="lp" class="w-thick" d="M60,110 L60,30 L340,30 L340,190 L60,190 Z"/>
        <rect x="40" y="88" width="40" height="44" rx="6" class="bat-box"/><text x="60" y="84" class="tp" text-anchor="middle">+</text><text x="60" y="148" class="tp" text-anchor="middle">−</text>
        <circle cx="340" cy="110" r="22" class="bulb" id="bb"/>
      </svg>
      <div class="seg" id="fs"><button data-m="e" class="on">⚛ Electron flow</button><button data-m="c">➜ Conventional current</button></div>
      <div class="wg-sub" id="ft"></div></div>`;
    const svg = $(host, 'svg'), path = $(host, '#lp');
    // path is drawn clockwise from the battery's + side (top). Electrons leave − (bottom) → go counter-clockwise.
    const fl = flow(svg, path, { count: 18, r: 5 });
    const seen = new Set();
    const set = mode => {
      seen.add(mode);
      host.querySelectorAll('#fs button').forEach(b => b.classList.toggle('on', b.dataset.m === mode));
      if (mode === 'e') { fl.speed = -0.12; svg.classList.remove('conv'); $(host, '#ft').innerHTML = 'Electrons (−) leave the <b>negative</b> terminal and are pulled into the <b>positive</b> one.'; }
      else { fl.speed = 0.12; svg.classList.add('conv'); $(host, '#ft').innerHTML = 'Conventional current is drawn leaving the <b>positive</b> terminal. Same circuit, just the old "positive charge" bookkeeping.'; }
      if (seen.size === 2) api.done();
    };
    $(host, '#fs').addEventListener('click', e => { const b = e.target.closest('button'); if (b) set(b.dataset.m); });
    set('e');
    return () => fl.stop();
  },

  coulomb(host, api) {
    let q1 = 1, q2 = 1, d = 2;
    host.innerHTML = `<div class="wg">
      <svg viewBox="0 0 400 140" class="coul-svg">
        <g id="c1"><circle r="26"/><text text-anchor="middle" y="9"></text></g>
        <g id="c2"><circle r="26"/><text text-anchor="middle" y="9"></text></g>
        <path id="a1" class="farrow"/><path id="a2" class="farrow"/>
      </svg>
      <div class="row-c"><button class="btn ghost sm" id="t1">flip charge A</button><button class="btn ghost sm" id="t2">flip charge B</button></div>
      ${slider('Distance', 1, 4, 0.5, d, v => v + ' units')}
      <div class="wg-read" id="cr"></div></div>`;
    const seen = new Set();
    const render = () => {
      const x1 = 200 - d * 35, x2 = 200 + d * 35;
      const g1 = $(host, '#c1'), g2 = $(host, '#c2');
      g1.setAttribute('transform', `translate(${x1},70)`); g2.setAttribute('transform', `translate(${x2},70)`);
      g1.className.baseVal = q1 > 0 ? 'pos' : 'neg'; g2.className.baseVal = q2 > 0 ? 'pos' : 'neg';
      $(g1, 'text').textContent = q1 > 0 ? '+' : '−'; $(g2, 'text').textContent = q2 > 0 ? '+' : '−';
      const F = 1 / (d * d); const len = 12 + 70 * F; const rep = q1 * q2 > 0;
      const dir = rep ? -1 : 1;
      $(host, '#a1').setAttribute('d', `M${x1 + dir * 30},70 l${dir * len},0 m${-dir * 8},-7 l${dir * 8},7 l${-dir * 8},7`);
      $(host, '#a2').setAttribute('d', `M${x2 - dir * 30},70 l${-dir * len},0 m${dir * 8},-7 l${-dir * 8},7 l${dir * 8},7`);
      seen.add(rep ? 'r' : 'a');
      $(host, '#cr').innerHTML = `${rep ? '↔ <b>Repel</b> (like charges)' : '→← <b>Attract</b> (unlike charges)'} · force = <b>${sig(F * 4, 3)}×</b> the force at distance 1 <small>(F ∝ 1/d²)</small>`;
      if (seen.size === 2 && d >= 2) api.done();
    };
    $(host, '#t1').onclick = () => { q1 *= -1; sfx.zap(); render(); };
    $(host, '#t2').onclick = () => { q2 *= -1; sfx.zap(); render(); };
    bindSlider($(host, '.sl'), v => v + ' units', v => { d = v; render(); });
    render();
  },

  // ------------------------------------------------------------------ 2A
  switchCircuit(host, api) {
    let closed = true, shorted = false, blown = false, breaker = false;
    host.innerHTML = `<div class="wg">
      <svg viewBox="0 0 420 230" class="sw-svg">
        <path id="loop" class="w-thick" d="M60,115 L60,40 L170,40 M230,40 L360,40 L360,190 L60,190 L60,115"/>
        <rect x="40" y="92" width="40" height="46" rx="6" class="bat-box"/><text x="60" y="88" class="tp" text-anchor="middle">+</text>
        <g id="swg" class="clickable"><circle cx="170" cy="40" r="5" class="node"/><circle cx="230" cy="40" r="5" class="node"/><line id="blade" x1="170" y1="40" x2="230" y2="40" class="blade"/><rect x="160" y="10" width="80" height="50" fill="transparent"/></g>
        <text x="200" y="76" class="tl">switch (tap)</text>
        <g id="fz"><rect x="250" y="30" width="60" height="20" rx="8" class="fuse"/><path id="fw" d="M252,40 L308,40" class="fusewire"/></g><text x="280" y="22" class="tl" id="fzl">fuse</text>
        <circle cx="360" cy="115" r="24" class="bulb" id="bulb"/><text x="398" y="120" class="tl">lamp</text>
        <path id="shortw" d="M340,70 C300,115 300,115 340,160" class="shortw"/>
      </svg>
      <div class="row-c"><button class="btn danger sm" id="bs">⚡ Short the lamp</button><button class="btn ghost sm" id="br">🔧 Replace fuse</button><label class="tog"><input type="checkbox" id="bk"> use breaker</label></div>
      <div class="wg-read" id="sr"></div></div>`;
    const svg = $(host, 'svg');
    const fl = flow(svg, $(host, '#loop'), { count: 16 });
    let blewOnce = false, fixedAfter = false;
    const render = () => {
      const path = closed && !blown;
      fl.show(path); fl.speed = !path ? 0 : shorted ? 0.9 : 0.15;
      $(host, '#blade').setAttribute('x2', closed ? 230 : 222); $(host, '#blade').setAttribute('y2', closed ? 40 : 6);
      $(host, '#bulb').classList.toggle('on', path && !shorted);
      $(host, '#shortw').style.opacity = shorted ? 1 : 0;
      $(host, '#fw').classList.toggle('blown', blown);
      $(host, '#fzl').textContent = breaker ? 'breaker' : 'fuse';
      $(host, '#br').textContent = breaker ? '🔁 Reset breaker' : '🔧 Replace fuse';
      $(host, '#sr').innerHTML = !closed ? '<b>OPEN circuit</b>: the path is broken → I = 0. Full source voltage sits across the open switch.'
        : blown ? `<b>${breaker ? 'Breaker tripped' : 'Fuse blown'}!</b> The short made current shoot up, so the protection opened the circuit. ${breaker ? 'Breakers just reset.' : 'A fuse must be replaced.'}`
        : shorted ? '<b>SHORT!</b>' : '<b>CLOSED circuit</b>: complete path → I = 240 mA, lamp on.';
      if (blewOnce && fixedAfter) api.done();
    };
    $(host, '#swg').addEventListener('click', () => { closed = !closed; sfx.tap(); render(); });
    $(host, '#bs').onclick = () => {
      if (!closed || blown) return; shorted = true; render(); sfx.zap();
      setTimeout(() => { blown = true; shorted = false; blewOnce = true; sfx.bad(); render(); }, 650);
    };
    $(host, '#br').onclick = () => { if (blown) { blown = false; fixedAfter = blewOnce; sfx.good(); render(); } };
    $(host, '#bk').onchange = e => { breaker = e.target.checked; render(); };
    render();
    return () => fl.stop();
  },

  // ------------------------------------------------------------------ 2B
  ohmPlayground(host, api) {
    let V = 6, R = 600;
    host.innerHTML = `<div class="wg two">
      <div><svg viewBox="0 0 260 200" class="loop-svg">
        <path id="lp" class="w-thick" d="M40,100 L40,30 L220,30 L220,170 L40,170 Z"/>
        <rect x="22" y="78" width="36" height="44" rx="6" class="bat-box"/><text x="40" y="74" class="tp" text-anchor="middle">+</text>
        <circle cx="220" cy="100" r="22" class="bulb" id="bulb"/>
      </svg></div>
      <div><svg viewBox="0 0 200 160" class="graph"><path d="M30,10 L30,140 L190,140" class="axis"/><text x="110" y="156" class="tl">V →</text><text x="44" y="18" class="tl">I ↑</text><path id="gl" class="gline"/><circle id="gp" r="5" class="gpt"/></svg></div>
      <div class="span2">${slider('Voltage V', 0, 24, 0.5, V, v => v + ' V')}${slider('Resistance R', 100, 2000, 50, R, v => eng(v, 'Ω'))}</div>
      <div class="span2 wg-read big" id="or"></div></div>`;
    const svg = $(host, '.loop-svg');
    const fl = flow(svg, $(host, '#lp'), { count: 16 });
    const render = () => {
      const I = V / R;
      fl.speed = -(I / 0.02) * 0.25; // electrons go − → +
      const P = V * I;
      $(host, '#bulb').style.setProperty('--glow', Math.min(1, P / 0.6));
      $(host, '#bulb').classList.toggle('on', P > 0.005);
      // graph: line of slope 1/R, I max 0.24 A at top
      const yOf = i => 140 - Math.min(130, (i / 0.12) * 130);
      $(host, '#gl').setAttribute('d', `M30,140 L190,${yOf(24 / R)}`);
      $(host, '#gp').setAttribute('cx', 30 + (V / 24) * 160); $(host, '#gp').setAttribute('cy', yOf(I));
      const hit = Math.abs(I - 0.02) < 0.0005;
      $(host, '#or').innerHTML = `I = V / R = ${V} / ${eng(R, 'Ω')} = <b>${eng(I, 'A')}</b>`;
      $(host, '#or').classList.toggle('ok', hit);
      if (hit) api.done();
    };
    const s = host.querySelectorAll('.sl');
    bindSlider(s[0], v => v + ' V', v => { V = v; render(); });
    bindSlider(s[1], v => eng(v, 'Ω'), v => { R = v; render(); });
    render();
    return () => fl.stop();
  },

  ohmTriangle(host, api) {
    const seen = new Set();
    host.innerHTML = `<div class="wg">
      <svg viewBox="0 0 240 200" class="tri-svg">
        <path d="M120,10 L230,190 L10,190 Z" class="tri"/><line x1="55" y1="110" x2="185" y2="110" class="tri-l"/><line x1="120" y1="110" x2="120" y2="190" class="tri-l"/>
        <g class="tk" data-k="V"><circle cx="120" cy="72" r="30"/><text x="120" y="84" text-anchor="middle">V</text></g>
        <g class="tk" data-k="I"><circle cx="78" cy="155" r="28"/><text x="78" y="167" text-anchor="middle">I</text></g>
        <g class="tk" data-k="R"><circle cx="162" cy="155" r="28"/><text x="162" y="167" text-anchor="middle">R</text></g>
      </svg>
      <div class="wg-read big" id="tf">Tap a letter to cover it with your thumb 👆</div></div>`;
    const F = { V: 'V = I × R <small>(side by side → multiply)</small>', I: 'I = V ÷ R <small>(V over R → divide)</small>', R: 'R = V ÷ I <small>(V over I → divide)</small>' };
    host.querySelectorAll('.tk').forEach(g => g.addEventListener('click', () => {
      const k = g.dataset.k; seen.add(k); sfx.tap();
      host.querySelectorAll('.tk').forEach(x => x.classList.toggle('cov', x === g));
      $(host, '#tf').innerHTML = F[k];
      if (seen.size === 3) api.done();
    }));
  },

  // ------------------------------------------------------------------ 3A
  seriesLab(host, api) {
    let Vs = 12; const R = [1000, 2200, 3300]; let fault = 'none';
    host.innerHTML = `<div class="wg">
      <div class="stack" id="stk"></div>
      <div class="wg-read" id="sr"></div>
      ${slider('Source', 0, 24, 1, Vs, v => v + ' V')}
      ${R.map((r, i) => slider(`R${i + 1}`, 100, 10000, 100, r, v => eng(v, 'Ω'))).join('')}
      <div class="seg" id="flt"><button data-f="none" class="on">Healthy</button><button data-f="open">✂ Open R2</button><button data-f="short">⚡ Short R3</button></div></div>`;
    const seen = new Set();
    const render = () => {
      const Reff = R.map((r, i) => (fault === 'short' && i === 2 ? 0 : r));
      const RT = Reff.reduce((a, b) => a + b, 0);
      const I = fault === 'open' ? 0 : Vs / RT;
      const drops = fault === 'open' ? [0, Vs, 0] : Reff.map(r => I * r);
      const cols = ['#38bdf8', '#a78bfa', '#f472b6'];
      $(host, '#stk').innerHTML = `<div class="stk-src"><span>V<sub>S</sub> ${Vs} V</span></div>` + drops.map((d, i) =>
        `<div class="stk-seg" style="flex:${Math.max(d, 0.0001)};--c:${cols[i]}"><span>${fault === 'open' && i === 1 ? 'OPEN gap' : 'R' + (i + 1)} · ${sig(d, 3)} V</span></div>`).join('');
      $(host, '#sr').innerHTML = fault === 'open' ? '✂ <b>Open:</b> I = 0, so R1 and R3 drop 0 V and <b>all</b> the source voltage appears across the break.'
        : fault === 'short' ? `⚡ <b>Short:</b> R3 drops 0 V, R<sub>T</sub> falls to ${eng(RT, 'Ω')} and current jumps to <b>${eng(I, 'A')}</b>.`
        : `Same current everywhere: <b>${eng(I, 'A')}</b> · Drops add up: ${drops.map(d => sig(d, 3)).join(' + ')} = <b>${Vs} V</b> (KVL ✔)`;
      seen.add(fault);
      if (seen.size === 3) api.done();
    };
    const sls = host.querySelectorAll('.sl');
    bindSlider(sls[0], v => v + ' V', v => { Vs = v; render(); });
    [1, 2, 3].forEach(k => bindSlider(sls[k], v => eng(v, 'Ω'), v => { R[k - 1] = v; render(); }));
    $(host, '#flt').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; fault = b.dataset.f; host.querySelectorAll('#flt button').forEach(x => x.classList.toggle('on', x === b)); sfx.tap(); render(); });
    render();
  },

  // ------------------------------------------------------------------ 4A
  powerHeat(host, api) {
    const V = 12, R = 220; let rating = 0.25;
    const P = V * V / R;
    const RAT = [0.125, 0.25, 0.5, 1, 2];
    const nm = r => ({ 0.125: '1/8 W', 0.25: '1/4 W', 0.5: '1/2 W' }[r] || r + ' W');
    host.innerHTML = `<div class="wg">
      <div class="wg-target">🎯 12 V across 220 Ω. Pick the <b>smallest</b> rating that won't cook.</div>
      <div class="heat" id="ht"><div class="hres" id="hr"></div><div class="smoke" id="sm">💨💨</div></div>
      <div class="chips" id="rc">${RAT.map(r => `<button class="pchip" data-r="${r}">${nm(r)}</button>`).join('')}</div>
      <div class="wg-read" id="hrd"></div></div>`;
    const render = () => {
      const ratio = P / rating;
      const hr = $(host, '#hr');
      hr.style.width = 60 + Math.sqrt(rating) * 120 + 'px';
      hr.style.setProperty('--heat', Math.min(1, ratio / 1.5));
      $(host, '#sm').style.opacity = ratio > 1 ? 1 : 0;
      host.querySelectorAll('#rc .pchip').forEach(b => b.classList.toggle('on', +b.dataset.r === rating));
      $(host, '#hrd').innerHTML = `P = V²/R = 144/220 = <b>${eng(P, 'W')}</b> · rating ${nm(rating)} → ${ratio > 1 ? '🔥 <b>overheats!</b>' : ratio > 0.5 ? '✅ safe (at least 1.5× margin would be nicer)' : '✅ safe'}`;
      const ok = rating === 1;
      $(host, '#hrd').classList.toggle('ok', ok);
      if (ok) api.done();
    };
    $(host, '#rc').addEventListener('click', e => { const b = e.target.closest('.pchip'); if (!b) return; rating = +b.dataset.r; (P / rating > 1 ? sfx.bad : sfx.tap)(); render(); });
    render();
  },

  // ------------------------------------------------------------------ 4B
  atomBuilder(host, api) {
    const NAMES = { 1: 'Hydrogen', 2: 'Helium', 3: 'Lithium', 4: 'Beryllium', 5: 'Boron', 6: 'Carbon', 7: 'Nitrogen', 8: 'Oxygen', 9: 'Fluorine', 10: 'Neon', 11: 'Sodium', 12: 'Magnesium', 13: 'Aluminum', 14: 'Silicon', 15: 'Phosphorus', 16: 'Sulfur', 17: 'Chlorine', 18: 'Argon', 29: 'Copper', 32: 'Germanium' };
    let Z = 11;
    host.innerHTML = `<div class="wg two">
      <div><svg viewBox="-110 -110 220 220" class="atom-svg" id="as"></svg></div>
      <div class="atom-info" id="ai"></div>
      <div class="span2">${slider('Atomic number', 1, 18, 1, Z, v => v)}<div class="row-c"><button class="btn ghost xs" data-z="29">Copper (29)</button><button class="btn ghost xs" data-z="14">Silicon (14)</button><button class="btn ghost xs" data-z="32">Germanium (32)</button></div></div></div>`;
    const render = () => {
      const sh = shells(Z), v = sh[sh.length - 1];
      let s = `<circle r="16" class="nuc"/><text y="5" text-anchor="middle" class="nuct">+${Z}</text>`;
      sh.forEach((cnt, k) => {
        const r = 30 + k * 19;
        s += `<circle r="${r}" class="orbit ${k === sh.length - 1 ? 'val' : ''}"/>`;
        for (let j = 0; j < cnt; j++) { const a = (j / cnt) * Math.PI * 2 + k; s += `<circle cx="${(Math.cos(a) * r).toFixed(1)}" cy="${(Math.sin(a) * r).toFixed(1)}" r="${k === sh.length - 1 ? 4.5 : 3}" class="el ${k === sh.length - 1 ? 'val' : ''}"/>`; }
      });
      $(host, '#as').innerHTML = `<g class="spin">${s}</g>`;
      const courseSemi = Z === 14 || Z === 32;
      const cls = courseSemi ? ['Semiconductor', 's']
        : Z === 6 ? ['4 valence e⁻, not Si/Ge', '']
        : (v <= 3 && Z > 2) ? ['Conductor', 'c']
        : (v === 8 || Z === 2) ? ['Insulator', 'i']
        : ['—', ''];
      $(host, '#ai').innerHTML = `<div class="el-name">${NAMES[Z] || 'Element ' + Z}</div>
        <div>Protons: <b>${Z}</b> · Electrons: <b>${Z}</b></div><div>Shells: <b>${sh.join(' · ')}</b></div>
        <div>Valence electrons: <b class="hl">${v}</b></div><div class="cls ${cls[1]}">${cls[0]}</div>`;
      if (courseSemi) api.done();
    };
    const inp = bindSlider($(host, '.sl'), v => v, v => { Z = v; render(); });
    host.querySelectorAll('[data-z]').forEach(b => b.onclick = () => { Z = +b.dataset.z; if (Z <= 18) inp.value = Z; $(host, '.sl output').textContent = Z; render(); });
    render();
  },

  // ------------------------------------------------------------------ 5
  parallelLab(host, api) {
    const Vs = 12; const R = [1000, 2000, 4000]; const on = [true, true, true];
    host.innerHTML = `<div class="wg">
      <div class="par-viz" id="pv"></div>
      <div class="wg-read" id="pr"></div>
      ${R.map((r, i) => `<div class="par-row">${slider(`R${i + 1}`, 200, 10000, 100, r, v => eng(v, 'Ω'))}<label class="tog"><input type="checkbox" checked data-i="${i}"> on</label></div>`).join('')}</div>`;
    let toggled = false;
    const render = () => {
      const Is = R.map((r, i) => (on[i] ? Vs / r : 0));
      const IT = Is.reduce((a, b) => a + b, 0);
      const act = R.filter((_, i) => on[i]);
      const RT = act.length ? 1 / act.reduce((a, r) => a + 1 / r, 0) : Infinity;
      const max = 0.06; // a 200 Ω branch at 12 V fills its pipe; the total pipe holds three of those
      $(host, '#pv').innerHTML = `<div class="pv-total"><span>I<sub>T</sub></span><div class="pipe" style="--w:${Math.min(1, IT / (3 * max))}"></div><b>${eng(IT, 'A')}</b></div>` +
        Is.map((I, i) => `<div class="pv-br ${on[i] ? '' : 'off'}"><span>R${i + 1}</span><div class="pipe" style="--w:${Math.min(1, I / max)}"></div><b>${on[i] ? eng(I, 'A') : 'open'}</b><small>${Vs} V</small></div>`).join('');
      $(host, '#pr').innerHTML = `KCL: I<sub>T</sub> = ${Is.map(I => sig(I * 1000, 3)).join(' + ')} mA = <b>${sig(IT * 1000, 3)} mA</b> · R<sub>T</sub> = <b>${eng(RT, 'Ω')}</b> ${act.length ? `(smaller than ${eng(Math.min(...act), 'Ω')} ✔)` : ''}`;
      if (toggled) api.done();
    };
    host.querySelectorAll('.sl').forEach((el, i) => bindSlider(el, v => eng(v, 'Ω'), v => { R[i] = v; render(); }));
    host.querySelectorAll('.tog input').forEach(inp => inp.onchange = () => { on[+inp.dataset.i] = inp.checked; if (!inp.checked) toggled = true; sfx.tap(); render(); });
    render();
  },

  // ------------------------------------------------------------------ 6
  comboReducer(host, api) {
    const Vs = 52, R1 = 100, R2 = 270, R3 = 390;
    const Rp = 1 / (1 / R2 + 1 / R3), RT = R1 + Rp, IT = Vs / RT, V1 = IT * R1, Vp = Vs - V1;
    const steps = [
      { t: 'Start: spot the pattern. All the current goes through R1, then splits into R2 and R3.', fig: () => comboSVG({ Vs, R1: { label: 'R1', value: R1 }, R2: { label: 'R2', value: R2 }, R3: { label: 'R3', value: R3 } }) },
      { t: `① Shrink R2 ∥ R3 → (270·390)/(270+390) = <b>${eng(Rp, 'Ω')}</b>`, fig: () => comboSVG({ Vs, R1: { label: 'R1', value: R1 }, R2: { label: 'R2∥R3', value: Rp } }) },
      { t: `② Now it's plain series: R<sub>T</sub> = 100 + ${sig(Rp, 4)} = <b>${eng(RT, 'Ω')}</b>, so I<sub>T</sub> = 52 / ${sig(RT, 4)} = <b>${eng(IT, 'A')}</b>`, fig: () => comboSVG({ Vs, R1: { label: 'R1', value: R1, note: `${eng(IT, 'A')}` }, R2: { label: 'R2∥R3', value: Rp } }) },
      { t: `③ Expand back: V<sub>R1</sub> = ${sig(IT, 3)} × 100 = <b>${eng(V1, 'V')}</b>. KVL → parallel part gets 52 − ${sig(V1, 3)} = <b>${eng(Vp, 'V')}</b>`, fig: () => comboSVG({ Vs, R1: { label: 'R1', value: R1, note: `${sig(V1, 3)} V` }, R2: { label: 'R2', value: R2, note: `${sig(Vp, 3)} V` }, R3: { label: 'R3', value: R3, note: `${sig(Vp, 3)} V` } }) },
      { t: `④ Branch currents: I<sub>R2</sub> = ${sig(Vp, 3)}/270 = <b>${eng(Vp / R2, 'A')}</b>, I<sub>R3</sub> = ${sig(Vp, 3)}/390 = <b>${eng(Vp / R3, 'A')}</b>. They add back up to I<sub>T</sub> ✔`, fig: () => comboSVG({ Vs, R1: { label: 'R1', value: R1, note: `${eng(IT, 'A')}` }, R2: { label: 'R2', value: R2, note: eng(Vp / R2, 'A') }, R3: { label: 'R3', value: R3, note: eng(Vp / R3, 'A') } }) },
    ];
    let k = 0;
    host.innerHTML = `<div class="wg"><div class="red-fig" id="rf"></div><div class="wg-read" id="rt"></div>
      <div class="row-c"><button class="btn ghost sm" id="rb">← back</button><button class="btn sm" id="rn">Next step →</button></div></div>`;
    const render = () => {
      $(host, '#rf').innerHTML = steps[k].fig(); $(host, '#rt').innerHTML = steps[k].t;
      $(host, '#rn').disabled = k === steps.length - 1; $(host, '#rb').disabled = k === 0;
      if (k === steps.length - 1) api.done();
    };
    $(host, '#rn').onclick = () => { k++; sfx.tap(); render(); };
    $(host, '#rb').onclick = () => { k--; render(); };
    render();
  },

  loadedDivider(host, api) {
    const Vs = 10, R = 10000; let lg = 3.5; // RL = 10^lg
    host.innerHTML = `<div class="wg">
      <div class="gauge"><div class="g-bar" id="gb"></div><div class="g-mark" title="no-load 5 V"></div></div>
      <div class="wg-read big" id="lr"></div>
      ${slider('Load R<sub>L</sub>', 2, 7.5, 0.05, lg, v => eng(Math.pow(10, v), 'Ω'))}
      <div class="wg-sub">R1 = R2 = 10 kΩ, V<sub>S</sub> = 10 V. With no load, V<sub>OUT</sub> = 5 V (the line).</div></div>`;
    const render = () => {
      const RL = Math.pow(10, lg), Rp = 1 / (1 / R + 1 / RL), Vo = Vs * Rp / (R + Rp);
      $(host, '#gb').style.width = (Vo / 6) * 100 + '%';
      const near = Vo > 4.95;
      $(host, '#lr').innerHTML = `R<sub>L</sub> = ${eng(RL, 'Ω')} → V<sub>OUT</sub> = <b>${sig(Vo, 3)} V</b> ${near ? '· barely any loading!' : `· dropped ${sig(5 - Vo, 2)} V`}`;
      $(host, '#lr').classList.toggle('ok', near);
      if (near) api.done();
    };
    bindSlider($(host, '.sl'), v => eng(Math.pow(10, v), 'Ω'), v => { lg = v; render(); });
    render();
  },
};
