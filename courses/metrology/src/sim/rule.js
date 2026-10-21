// rule.js - the steel rule: fractional inch, decimal inch and metric. The big view is a magnifier that
// stays on the part's edge while the scale slides underneath it.
import { line, rect, text, hatch, nextId, svg } from './svg.js';
import { fmtIn, fmtMm, fmtFrac, simplify, parseNum, near } from '../core/answer.js';

const W = 1000, EDGE = 520, TOP = 110, FACE = 170;
const LEN_F = { 1: 72, 2: 56, 4: 46, 8: 38, 16: 30, 32: 23, 64: 16 };
const PPU = { frac: { 8: 220, 16: 320, 32: 460, 64: 620 }, dec: { 0.1: 230, 0.02: 430, 0.01: 640 }, mm: { 0.5: 22 } };

const minorOf = s => (s.sys === 'frac' ? 1 / s.grad : s.grad);
const maxOf = s => (s.sys === 'mm' ? 150 : 6);
const idxOf = s => Math.round(s.value / minorOf(s));

// Tick length and label for tick number i on this rule.
function tick(s, i) {
  if (s.sys === 'frac') {
    const d = s.grad / gcdI(i, s.grad);
    return { len: LEN_F[d], label: d === 1 ? String(i / s.grad) : '', big: true };
  }
  if (s.sys === 'dec') {
    const per = Math.round(1 / s.grad), tenth = Math.round(0.1 / s.grad);
    if (i % per === 0) return { len: 72, label: String(i / per), big: true };
    if (i % tenth === 0) return { len: 50, label: String((i / tenth) % 10) };
    if (s.grad === 0.01 && i % 5 === 0) return { len: 36 };
    return { len: 26 };
  }
  if (i % 20 === 0) return { len: 72, label: String(i / 2), big: true };
  if (i % 10 === 0) return { len: 52 };
  if (i % 2 === 0) return { len: 38 };
  return { len: 24 };
}
const gcdI = (a, b) => (b ? gcdI(b, a % b) : a);

// Where counting starts for the highlight: the last whole inch / numbered tenth / numbered 10 mm mark.
function countFrom(s, idx) {
  if (s.sys === 'frac') return idx - (idx % s.grad);
  if (s.sys === 'dec') { const t = Math.round(0.1 / s.grad); return idx - (idx % t); }
  return idx - (idx % 2);
}

function draw(s, { reveal }) {
  const ppu = PPU[s.sys][s.grad], minor = minorOf(s), max = maxOf(s), idx = idxOf(s), value = idx * minor;
  const u = v => EDGE + (v - value) * ppu, hid = nextId();
  const from = countFrom(s, idx);
  let b = `<defs>${hatch(hid)}</defs>`;

  // Overview: the whole rule, the part, and the window the magnifier shows.
  const ox = v => 40 + (v / max) * 920;
  b += rect(40, 30, 920, 18, 'sv-face');
  for (let v = 0; v <= max; v += s.sys === 'mm' ? 10 : 1) b += line(ox(v), 30, ox(v), 40, 'sv-tick');
  b += rect(40, 8, ox(value) - 40, 20, '', `fill="url(#${hid})"`);
  b += rect(ox(value - EDGE / ppu), 4, (W / ppu / max) * 920, 48, 'sv-window');

  // Magnifier.
  const x0 = Math.max(0, u(0)), x1 = Math.min(W, u(max));
  b += rect(x0, TOP, x1 - x0, FACE, 'sv-face');
  b += rect(Math.max(0, u(0)), 66, EDGE - Math.max(0, u(0)), TOP - 66, '', `fill="url(#${hid})"`);
  const i0 = Math.max(0, Math.ceil((value - EDGE / ppu) / minor)), i1 = Math.min(Math.round(max / minor), Math.floor((value + (W - EDGE) / ppu) / minor));
  for (let i = i0; i <= i1; i++) {
    const t = tick(s, i), x = u(i * minor);
    const counted = reveal && i > from && i <= idx;
    const cls = reveal && i === from ? 'sv-tick sv-hi' : counted ? 'sv-tick sv-count' : 'sv-tick';
    b += line(x, TOP, x, TOP + t.len, cls);
    if (t.label) b += text(x, TOP + t.len + (t.big ? 30 : 22), t.label, t.big ? 'sv-lbl sv-lbl-big' : 'sv-lbl');
  }
  b += line(EDGE, 60, EDGE, TOP + 96, 'sv-edge');
  return svg(W, 300, b, 'Steel rule');
}

function steps(s) {
  const idx = idxOf(s), minor = minorOf(s);
  if (s.sys === 'frac') {
    const w = Math.floor(idx / s.grad), rest = idx % s.grad, f = simplify(rest, s.grad);
    const out = [`Whole inches before the edge: <b>${w}</b>.`];
    if (!rest) out.push(`The edge sits right on the ${w}" line, so there is no fraction.`);
    else {
      out.push(`This edge of the rule is in 1/${s.grad}" marks. Count the marks past ${w}: <b>${rest}/${s.grad}"</b>.`);
      if (f.g > 1) out.push(`Simplify by dividing top and bottom by ${f.g}: ${rest}/${s.grad} = <b>${f.num}/${f.den}"</b>.`);
    }
    return out;
  }
  if (s.sys === 'dec') {
    const per = Math.round(1 / s.grad), tenth = Math.round(0.1 / s.grad);
    const w = Math.floor(idx / per), t = Math.floor((idx % per) / tenth), k = idx % tenth;
    const out = [`Whole inches before the edge: <b>${w}</b>.`, `Last numbered line (tenths) before the edge: <b>${t}</b>, so ${fmtIn(t / 10, 3)}.`];
    if (tenth > 1) out.push(`Small marks past it: ${k} × ${fmtIn(minor, 2)} = <b>${fmtIn(k * minor, 3)}</b>.`);
    out.push(`Add them: ${w} + ${fmtIn(t / 10, 3)}${tenth > 1 ? ` + ${fmtIn(k * minor, 3)}` : ''} = <b>${fmtIn(idx * minor, 3)}"</b>.`);
    return out;
  }
  const tens = Math.floor(idx / 20) * 10, mm = Math.floor((idx % 20) / 2), half = idx % 2;
  return [
    `Last numbered line before the edge: <b>${tens} mm</b>.`,
    `Whole millimetre lines past it: <b>${mm}</b>.`,
    half ? `There is one half-millimetre line after that: <b>+0.5 mm</b>.` : `No half-millimetre line after that.`,
    `Add them: ${tens} + ${mm}${half ? ' + 0.5' : ''} = <b>${fmtMm(idx * 0.5, 1)} mm</b>.`,
  ];
}

function answer(s) {
  const idx = idxOf(s), v = idx * minorOf(s);
  if (s.sys === 'frac') { const f = simplify(idx, s.grad); return `${fmtFrac(f.whole, f.num, f.den)} <small>= ${fmtIn(v, 4)}"</small>`; }
  if (s.sys === 'dec') return `${fmtIn(v, 3)}"`;
  return `${fmtMm(v, 1)} mm`;
}

export function makeRule(sys) {
  const variants = {
    frac: [8, 16, 32, 64].map(g => ({ label: `1/${g}"`, spec: { grad: g } })),
    dec: [[0.1, '1/10"'], [0.02, '1/50"'], [0.01, '1/100"']].map(([g, l]) => ({ label: l, spec: { grad: g } })),
    mm: [{ label: '0.5 mm', spec: { grad: 0.5 } }],
  }[sys];
  return {
    id: `rule-${sys}`,
    name: { frac: 'Fractional rule', dec: 'Decimal rule', mm: 'Metric rule' }[sys],
    short: { frac: 'Rule 1/64"', dec: 'Rule .01"', mm: 'Rule mm' }[sys],
    unit: sys === 'mm' ? 'mm' : 'in',
    variants,
    base: { sys, grad: variants[sys === 'frac' ? 1 : 0].spec.grad, value: sys === 'mm' ? 23.5 : 1.375 },
    random(rng, spec = {}) {
      const s = { ...this.base, ...spec };
      if (!spec.grad) s.grad = rng.pick(sys === 'frac' ? [16, 32, 64] : sys === 'dec' ? [0.02, 0.01] : [0.5]);
      const n = Math.round(maxOf(s) / minorOf(s));
      let i; do i = rng.int(1, n - 1); while (s.sys === 'frac' && i % s.grad === 0);
      return { ...s, value: i * minorOf(s) };
    },
    range: s => [0, maxOf(s)],
    step: s => minorOf(s),
    snap: s => ({ ...s, value: idxOf(s) * minorOf(s) }),
    drag: s => ({ axis: 'x', perPx: -1 / PPU[s.sys][s.grad] }),
    draw,
    steps,
    answer,
    question: s => (s.sys === 'frac' ? 'Read the rule at the edge of the part. Answer as a fraction, like 1-3/8.'
      : s.sys === 'dec' ? 'Read the decimal rule at the edge of the part, in inches.' : 'Read the metric rule at the edge of the part, in millimetres.'),
    placeholder: s => (s.sys === 'frac' ? 'e.g. 1-3/8' : s.sys === 'dec' ? 'e.g. 1.37' : 'e.g. 23.5'),
    check(input, s) {
      const x = parseNum(input), v = idxOf(s) * minorOf(s);
      return near(x, v, s.sys === 'mm' ? 0.1 : 0.0006);
    },
  };
}
