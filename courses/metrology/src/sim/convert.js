// convert.js - unit conversion drills: fraction to decimal, decimal to fraction, inch to mm and mm to inch.
import { svg, text } from './svg.js';
import { fmtIn, fmtMm, fmtFrac, simplify, parseNum, isFraction, near } from '../core/answer.js';

const KINDS = {
  f2d: { label: 'Fraction → decimal', ask: 'Write it as a decimal inch (4 places).' },
  d2f: { label: 'Decimal → fraction', ask: 'Write it as a fraction in lowest terms.' },
  in2mm: { label: 'Inch → mm', ask: 'Convert to millimetres (2 places).' },
  mm2in: { label: 'mm → inch', ask: 'Convert to inches (3 places).' },
};

// `value` is always a count of 64ths for f2d/d2f, thousandths of an inch for in2mm, hundredths of a mm for mm2in.
function given(s) {
  if (s.kind === 'f2d') { const f = simplify(s.value, 64); return fmtFrac(f.whole, f.num, f.den); }
  if (s.kind === 'd2f') return `${fmtIn(s.value / 64, 4)}"`;
  if (s.kind === 'in2mm') return `${fmtIn(s.value / 1000, 3)}"`;
  return `${fmtMm(s.value / 100)} mm`;
}

const target = s => (s.kind === 'f2d' || s.kind === 'd2f' ? s.value / 64 : s.kind === 'in2mm' ? (s.value / 1000) * 25.4 : s.value / 100 / 25.4);

export const convert = {
  id: 'convert',
  name: 'Unit conversions',
  short: 'Conversions',
  unit: 'in',
  noSim: true,
  variants: Object.entries(KINDS).map(([kind, k]) => ({ label: k.label, spec: { kind } })),
  base: { kind: 'f2d', value: 20 },
  random(rng, spec = {}) {
    const kind = spec.kind || rng.pick(Object.keys(KINDS));
    if (kind === 'f2d' || kind === 'd2f') {
      let v; do v = rng.int(1, 63); while (v % 2 === 0 && rng.bool()); // favour 64ths and 32nds a little
      return { kind, value: v };
    }
    if (kind === 'in2mm') return { kind, value: rng.pick([rng.int(1, 40) * 25, rng.int(10, 3000)]) };
    return { kind, value: rng.pick([rng.int(1, 60) * 50, rng.int(50, 7500)]) };
  },
  draw: s => svg(1000, 150, text(500, 98, given(s), 'sv-given') + text(500, 136, KINDS[s.kind].label, 'sv-lbl'), KINDS[s.kind].label),
  steps(s) {
    const t = target(s);
    if (s.kind === 'f2d') {
      const f = simplify(s.value, 64), top = f.whole * f.den + f.num;
      return [
        f.whole ? `Keep the whole inch aside: ${f.whole}, then work on ${f.num}/${f.den}.` : `A fraction is a division: top ÷ bottom.`,
        `${f.num} ÷ ${f.den} = <b>${fmtIn(f.num / f.den, 4)}</b>.${top !== f.num ? '' : ''}`,
        f.whole ? `Put the whole inch back: ${f.whole} + ${fmtIn(f.num / f.den, 4)} = <b>${fmtIn(t, 4)}"</b>.` : `Answer: <b>${fmtIn(t, 4)}"</b>.`,
      ];
    }
    if (s.kind === 'd2f') {
      const f = simplify(s.value, 64);
      const out = [`Multiply the decimal by 64 to count 64ths: ${fmtIn(t, 4)} × 64 = <b>${s.value}</b>, so ${s.value}/64.`];
      out.push(f.g > 1 && f.num ? `Simplify by dividing top and bottom by ${f.g}: <b>${fmtFrac(f.whole, f.num, f.den)}</b>.` : `${s.value}/64 can't be simplified: <b>${fmtFrac(f.whole, f.num, f.den)}</b>.`);
      return out;
    }
    if (s.kind === 'in2mm') return [
      `One inch is exactly 25.4 mm, so multiply: ${fmtIn(s.value / 1000, 3)} × 25.4.`,
      `= <b>${fmtMm(t)} mm</b>.`,
    ];
    return [
      `One inch is 25.4 mm, so divide: ${fmtMm(s.value / 100)} ÷ 25.4.`,
      `= ${(s.value / 100 / 25.4).toFixed(5)}, rounded to 3 places: <b>${fmtIn(t, 3)}"</b>.`,
    ];
  },
  answer(s) {
    const t = target(s);
    if (s.kind === 'f2d') return `${fmtIn(t, 4)}"`;
    if (s.kind === 'd2f') { const f = simplify(s.value, 64); return fmtFrac(f.whole, f.num, f.den); }
    return s.kind === 'in2mm' ? `${fmtMm(t)} mm` : `${fmtIn(t, 3)}"`;
  },
  question: s => KINDS[s.kind].ask,
  placeholder: s => ({ f2d: 'e.g. .3125', d2f: 'e.g. 7/16', in2mm: 'e.g. 31.75', mm2in: 'e.g. .500' }[s.kind]),
  check(input, s) {
    const x = parseNum(input), t = target(s);
    if (s.kind === 'd2f') {
      if (!isFraction(input)) return { ok: false, msg: 'Write it as a fraction, like 7/16 or 1-3/8.' };
      const f = simplify(s.value, 64);
      if (!near(x, t, 1e-9)) return false;
      const m = String(input).match(/(\d+)\s*\/\s*(\d+)\s*["”″]?\s*$/);
      return m && +m[2] !== f.den ? { ok: false, msg: 'Right value, but simplify it to lowest terms.' } : true;
    }
    return near(x, t, s.kind === 'in2mm' ? 0.006 : 0.0006);
  },
};
