// generators.js - endless practice problems with fresh numbers, hints and worked solutions.
// Every generator returns a problem object:
//   { kind: 'num'|'mcq'|'multi', q, fig?, answer?, unit?, fixed?, tol?, options?, correct?, parts?, hints[], solution[], tip? }
import { eng, sig, sup, rint, pick, shuffle, stdR, E12, plain } from '../core/num.js';
import { seriesSVG, parallelSVG, comboSVG, seriesInBranchSVG, dividerSVG, resistorBandsSVG } from '../core/schematic.js';

const f = (x, u, s = 3) => `<b class="val">${eng(x, u, s)}</b>`;
const n3 = x => Number(sig(x, 4));

// ---------- builders ----------
function num(q, answer, unit, o = {}) {
  return { kind: 'num', q, answer, unit, fixed: !!o.fixed, tol: o.tol ?? 0.02, hints: o.hints || [], solution: o.solution || [], fig: o.fig, tip: o.tip };
}
function mcq(q, correctHtml, wrongs, o = {}) {
  const opts = shuffle([correctHtml, ...wrongs.filter((w, i, a) => w !== correctHtml && a.indexOf(w) === i)].slice(0, 4));
  return { kind: 'mcq', q, options: opts, correct: opts.indexOf(correctHtml), hints: o.hints || [], solution: o.solution || [], fig: o.fig, tip: o.tip };
}
function multi(q, parts, o = {}) {
  return { kind: 'multi', q, parts: parts.map(p => ({ tol: 0.02, ...p })), hints: o.hints || [], solution: o.solution || [], fig: o.fig, tip: o.tip };
}
/** Pick one item from a bank of [question, correct, [wrongs], why] */
function bank(items) {
  const [q, c, w, why, tip] = pick(items);
  return mcq(q, c, w, { solution: why ? [why] : [], tip });
}

// =====================================================================
// UNIT 1A — Quantities & Units
// =====================================================================
const PFX = [['G', 9], ['M', 6], ['k', 3], ['', 0], ['m', -3], ['µ', -6], ['n', -9], ['p', -12]];
const UNITS = ['Ω', 'A', 'V', 'W', 'F', 'Hz'];

function decimalString(x) {
  // turn 0.00056 or 47000000 into a readable fixed string
  if (Math.abs(x) >= 1) return Number(sig(x, 6)).toLocaleString('en-US', { maximumFractionDigits: 8 });
  const s = Number(sig(x, 6)).toFixed(14).replace(/0+$/, '');
  return s.endsWith('.') ? s.slice(0, -1) : s;
}

const G1A = {
  prefix() {
    const u = pick(UNITS);
    let i = rint(0, PFX.length - 1), j;
    do { j = i + pick([-2, -1, 1, 2]); } while (j < 0 || j >= PFX.length);
    const [p1, e1] = PFX[i], [p2, e2] = PFX[j];
    const v = pick([0.47, 2.2, 10, 47, 150, 3.3, 0.068, 680, 1.5, 22, 0.01, 4.7, 10000, 330]);
    const ans = Number(sig(v * Math.pow(10, e1 - e2), 6));
    const bigger = e2 > e1; // converting to a larger unit -> smaller number
    const steps = Math.abs(e1 - e2);
    return num(`Convert: <b class="val">${plain(v, 6)} ${p1}${u}</b> = <b>?</b> ${p2}${u}`, ans, `${p2}${u}`, {
      fixed: true, tol: 0.001,
      hints: [
        bigger ? 'You\'re going to a <b>larger</b> unit → the number gets <b>smaller</b> → decimal moves <b>left</b>.'
               : 'You\'re going to a <b>smaller</b> unit → the number gets <b>bigger</b> → decimal moves <b>right</b>.',
        `${p1 || 'base'} = 10${sup(e1)}, ${p2 || 'base'} = 10${sup(e2)}. That's a jump of ${steps} places.`,
      ],
      solution: [`${plain(v, 6)} × 10${sup(e1)} ÷ 10${sup(e2)} = ${plain(v, 6)} × 10${sup(e1 - e2)} = <b>${plain(ans, 6)} ${p2}${u}</b>`],
      tip: 'Smaller unit → bigger number. Bigger unit → smaller number.',
    });
  },

  toPrefix() {
    const u = pick(['A', 'V', 'Ω', 'F', 'W']);
    const m = pick([4.5, 7.89, 27, 470, 1.2, 33, 560, 6.8, 82, 150]);
    const e = pick([-12, -9, -6, -3, 3, 6]);
    const x = m * Math.pow(10, e);
    const pfx = PFX.find(p => p[1] === e)[0];
    return num(`Write <b class="val">${decimalString(x)} ${u}</b> using a metric prefix: <b>?</b> ${pfx}${u}`, m, `${pfx}${u}`, {
      fixed: true, tol: 0.001,
      hints: ['Count how far the decimal must move to leave a number between 1 and 999.', `You want a power of ten that's a multiple of 3. Here that's 10${sup(e)} = ${pfx}.`],
      solution: [`${decimalString(x)} = ${m} × 10${sup(e)} → 10${sup(e)} is "${pfx}" → <b>${m} ${pfx}${u}</b>`],
    });
  },

  sci() {
    const m = pick([7.25, 5.6, 2.468, 6.05, 4.7, 2.7, 6.38, 5.3, 1.5, 3.9]);
    let e = rint(-7, 7); if (e === 0) e = 3;
    const x = m * Math.pow(10, e);
    const correct = `${m} × 10${sup(e)}`;
    return mcq(`Which is <b>${decimalString(x)}</b> in <b>scientific notation</b>?`, correct, [
      `${sig(m * 10, 4)} × 10${sup(e - 1)}`,
      `${m} × 10${sup(-e)}`,
      `${m} × 10${sup(e + 1)}`,
    ], {
      hints: ['Scientific notation = exactly <b>one</b> non-zero digit before the decimal point.', e > 0 ? 'Big number → positive exponent.' : 'Number smaller than 1 → negative exponent.'],
      solution: [`Move the decimal ${Math.abs(e)} place${Math.abs(e) > 1 ? 's' : ''} ${e > 0 ? 'left' : 'right'} to get ${m} → exponent ${e > 0 ? '+' : ''}${e}.`, `Watch out: ${sig(m * 10, 4)} × 10${sup(e - 1)} is the same value, but it is not scientific notation because ${sig(m * 10, 4)} is bigger than 10.`],
    });
  },

  eng() {
    const m = pick([4.5, 7.89, 47, 27, 560, 5.6, 330, 1.2, 82]);
    const e3 = pick([-9, -6, -3, 3, 6, 9]);
    const x = m * Math.pow(10, e3);
    const correct = `${m} × 10${sup(e3)}`;
    // scientific version as a trap
    const exp = Math.floor(Math.log10(m));
    const sciM = sig(m / Math.pow(10, exp), 4), sciE = e3 + exp;
    const wr = [`${sig(m / 1000, 4)} × 10${sup(e3 + 3)}`, `${m} × 10${sup(-e3)}`];
    if (sciE !== e3) wr.unshift(`${sciM} × 10${sup(sciE)}`); else wr.push(`${sig(m * 1000, 4)} × 10${sup(e3 - 3)}`);
    return mcq(`Which is <b>${decimalString(x)}</b> in <b>engineering notation</b>?`, correct, wr, {
      hints: ['Engineering notation: exponent must be a <b>multiple of 3</b>, and the number in front is 1 to 999.'],
      solution: [`${decimalString(x)} = ${m} × 10${sup(e3)}. The exponent ${e3} is a multiple of 3, and ${m} is between 1 and 999. ✔`],
      tip: 'Engineering notation = powers of 3 = prefixes (k, M, m, µ…).',
    });
  },

  arith() {
    const kind = pick(['A', 'Ω', 'V']);
    if (kind === 'Ω') {
      const a = pick([10000, 4700, 3300, 1500, 22000]), b = pick([22, 10, 4.7, 1.2, 33]);
      const ans = a / 1000 + b;
      return num(`<b class="val">${plain(a)} Ω</b> + <b class="val">${b} kΩ</b> = <b>?</b> kΩ`, ans, 'kΩ', { fixed: true, tol: 0.001,
        hints: ['Convert both to the <b>same prefix</b> first.', `${plain(a)} Ω = ${a / 1000} kΩ`],
        solution: [`${plain(a)} Ω = ${a / 1000} kΩ`, `${a / 1000} kΩ + ${b} kΩ = <b>${sig(ans, 5)} kΩ</b>`] });
    }
    const p = kind === 'A' ? ['µ', 'm'] : ['m', ''];
    const a = pick([200, 350, 500, 750, 120, 900]), b = pick([1.0, 2.5, 0.8, 1.2, 3.3]);
    const ans = a / 1000 + b;
    return num(`<b class="val">${a} ${p[0]}${kind}</b> + <b class="val">${b} ${p[1]}${kind}</b> = <b>?</b> ${p[1]}${kind}`, ans, `${p[1]}${kind}`, { fixed: true, tol: 0.001,
      hints: ['Add only when both numbers have the <b>same prefix</b>.', `${a} ${p[0]}${kind} = ${a / 1000} ${p[1]}${kind}`],
      solution: [`${a} ${p[0]}${kind} = ${a / 1000} ${p[1]}${kind}`, `${a / 1000} + ${b} = <b>${sig(ans, 5)} ${p[1]}${kind}</b>`],
      tip: kind === 'A' ? 'Heads up: one slide says 200 µA + 1.0 mA = 12,000 µA. That\'s a typo. The right answer is 1,200 µA (= 1.2 mA).' : undefined });
  },

  multdiv() {
    const mult = Math.random() < 0.5;
    const a = rint(2, 9), b = rint(2, 9);
    const p = rint(-6, 12), q = rint(-6, 8);
    if (mult) {
      const m = a * b, e = p + q;
      return num(`(${a} × 10${sup(p)}) × (${b} × 10${sup(q)}) = ?<div class="hintline">Type like <code>${m}e${e}</code> or <code>${m}x10^${e}</code></div>`, m * Math.pow(10, e), '', {
        tol: 0.001,
        hints: ['<b>Multiply</b> the front numbers, <b>add</b> the exponents.', `${a} × ${b} = ${m}`],
        solution: [`${a} × ${b} = ${m}`, `${p} + (${q}) = ${e}`, `<b>${m} × 10${sup(e)}</b>`] });
    }
    const top = a * b; // make it divide nicely
    const e = p - q;
    return num(`(${top} × 10${sup(p)}) ÷ (${b} × 10${sup(q)}) = ?<div class="hintline">Type like <code>${a}e${e}</code> or <code>${a}x10^${e}</code></div>`, a * Math.pow(10, e), '', {
      tol: 0.001,
      hints: ['<b>Divide</b> the front numbers, <b>subtract</b> the exponents (top − bottom).', `${top} ÷ ${b} = ${a}`],
      solution: [`${top} ÷ ${b} = ${a}`, `${p} − (${q}) = ${e}`, `<b>${a} × 10${sup(e)}</b>`] });
  },

  sigcount() {
    const items = [
      ['1.22', 3, 'Every non-zero digit counts.'], ['9456', 4, 'Every non-zero digit counts.'], ['8.2', 2, 'Every non-zero digit counts.'],
      ['0.005', 1, 'Zeros in front of the first non-zero digit never count.'], ['0.00000506', 3, 'Leading zeros never count, but the 0 between 5 and 6 does.'],
      ['2005', 4, 'Zeros sandwiched between non-zero digits always count.'], ['3.06', 3, 'Sandwiched zero counts.'], ['900.0035', 7, 'All the zeros are sandwiched → all count.'],
      ['4.00', 3, 'Trailing zeros after a decimal point count.'], ['300.000', 6, 'Decimal point present → every trailing zero counts.'],
      ['3.45 × 10³', 3, 'In scientific notation only the front number counts.'], ['2.000 × 10²³', 4, 'Only the front number: 2.000 → 4.'],
      ['1.5600 × 10²', 5, 'Front number 1.5600 → 5 digits.'], ['0.0450', 3, 'Leading zeros no; the trailing zero after the decimal yes.'],
      ['10.50', 4, 'Sandwiched 0 counts, trailing 0 after decimal counts.'], ['0.000300', 3, 'Leading zeros no, trailing zeros after decimal yes.'], ['5.020', 4, 'Both zeros count.'],
    ];
    const [s, ans, why] = pick(items);
    return num(`How many <b>significant digits</b> in <b class="val big">${s}</b> ?`, ans, 'SD', { fixed: true, tol: 0,
      hints: ['Rules: non-zero ✔ · sandwiched zeros ✔ · leading zeros ✘ · trailing zeros after a decimal ✔'],
      solution: [why, `Answer: <b>${ans}</b>`] });
  },

  round() {
    let digits, cut;
    // random 6-digit number, avoid exact .5 ties
    do { digits = String(rint(100000, 999999)); } while (digits[3] === '5' && /^0*$/.test(digits.slice(4)));
    const intLen = rint(1, 3);
    const str = digits.slice(0, intLen) + '.' + digits.slice(intLen);
    const x = parseFloat(str);
    const ans = Number(x.toPrecision(3));
    cut = digits[3];
    return num(`Round <b class="val big">${str}</b> to <b>3 significant figures</b>.`, ans, '', { tol: 1e-9,
      hints: ['Keep the first 3 digits. Look at the 4th digit only.', `The 4th digit is <b>${cut}</b>. ${+cut >= 5 ? '≥ 5 → round up.' : '< 5 → leave it.'}`],
      solution: [`First three: ${digits.slice(0, 3)}, next digit ${cut} → ${+cut >= 5 ? 'round up' : 'keep'} → <b>${ans}</b>`] });
  },

  quiz() {
    return bank([
      ['A resistor is an example of…', 'a passive component', ['an active component', 'an electrical circuit', 'a voltage source'], 'Resistors only absorb energy — they can\'t amplify. That\'s passive.'],
      ['The fundamental (SI) unit of electrical current is the…', 'ampere', ['volt', 'ohm', 'coulomb'], 'Ampere is one of the 7 fundamental SI units. Volt and ohm are derived.'],
      ['The metric prefix <b>nano</b> means…', '10⁻⁹', ['10⁻³', '10⁻⁶', '10⁻¹²'], 'milli ⁻³ → micro ⁻⁶ → nano ⁻⁹ → pico ⁻¹²'],
      ['The metric prefix <b>pico</b> means…', '10⁻¹²', ['10⁻³', '10⁻⁶', '10⁻⁹'], 'milli ⁻³ → micro ⁻⁶ → nano ⁻⁹ → pico ⁻¹²'],
      ['2700 MW can be written as…', '2.7 GW', ['2.7 TW', '2.7 kW', '2.7 mW'], '2700 M = 2.7 × 1000 M = 2.7 G'],
      ['200 mV is the same as…', '0.2 V', ['0.000 200 V', '20 mV', '2 V'], 'milli = ÷1000 → 200 ÷ 1000 = 0.2'],
      ['Which of these is an <b>active</b> component?', 'transistor', ['resistor', 'capacitor', 'inductor'], 'Active parts need a power source and can amplify (transistors, vacuum tubes, tunnel diodes).'],
      ['Capacitance is measured in…', 'farads (F)', ['henrys (H)', 'ohms (Ω)', 'siemens (S)'], 'Capacitor → stores charge → farad.'],
      ['Inductance is measured in…', 'henrys (H)', ['farads (F)', 'teslas (T)', 'webers (Wb)'], 'Inductor (coil) → opposes change of current → henry.'],
      ['Conductance (G) is measured in…', 'siemens (S)', ['ohms (Ω)', 'mhos per meter', 'coulombs (C)'], 'Conductance = 1/R, unit siemens.'],
      ['Which is <b>not</b> one of the 7 fundamental SI units?', 'volt', ['ampere', 'kelvin', 'candela'], 'Volt is derived (J/C). The 7: m, kg, s, A, K, mol, cd.'],
      ['Engineering notation exponents must be…', 'multiples of 3', ['between 1 and 10', 'negative', 'even numbers'], 'So they line up with the prefixes (k, M, m, µ…).'],
    ]);
  },
};

// =====================================================================
// UNIT 1B — Resistors
// =====================================================================
export const BANDS = [
  { n: 'Black', d: 0, hex: '#111827' }, { n: 'Brown', d: 1, hex: '#7c4a1e', tol: 1 }, { n: 'Red', d: 2, hex: '#dc2626', tol: 2 },
  { n: 'Orange', d: 3, hex: '#f97316' }, { n: 'Yellow', d: 4, hex: '#facc15' }, { n: 'Green', d: 5, hex: '#16a34a', tol: 0.5 },
  { n: 'Blue', d: 6, hex: '#2563eb', tol: 0.25 }, { n: 'Violet', d: 7, hex: '#8b5cf6', tol: 0.1 }, { n: 'Gray', d: 8, hex: '#6b7280', tol: 0.05 },
  { n: 'White', d: 9, hex: '#f8fafc' },
];
export const GOLD = { n: 'Gold', hex: '#d4a017', tol: 5, mult: -1 }, SILVER = { n: 'Silver', hex: '#c0c7d1', tol: 10, mult: -2 };
const multBand = e => (e === -1 ? GOLD : e === -2 ? SILVER : BANDS[e]);
const chip = b => `<span class="chip-band" style="--c:${b.hex}">${b.n}</span>`;

function rand4band() {
  const d1 = rint(1, 9), d2 = rint(0, 9), e = rint(-1, 5);
  const tolB = pick([GOLD, GOLD, SILVER, BANDS[1], BANDS[2]]);
  const R = (d1 * 10 + d2) * Math.pow(10, e);
  return { bands: [BANDS[d1], BANDS[d2], multBand(e), tolB], R: n3(R), tol: tolB.tol, d1, d2, e };
}

const G1B = {
  decode() {
    const r = rand4band();
    return num(`What is this resistor's value?<div class="bandrow">${r.bands.map(chip).join('')}</div>`, r.R, 'Ω', {
      fig: resistorBandsSVG(r.bands.map(b => b.hex)),
      hints: ['<b>B</b>ig <b>B</b>oys <b>R</b>ace <b>O</b>ur <b>Y</b>oung <b>G</b>irls <b>B</b>ut <b>V</b>iolet <b>G</b>enerally <b>W</b>ins → 0 1 2 3 4 5 6 7 8 9',
        `Digits: ${r.bands[0].n} = ${r.d1}, ${r.bands[1].n} = ${r.d2} → "${r.d1}${r.d2}"`,
        `3rd band is the multiplier: ${r.bands[2].n} = × 10${sup(r.e)}`],
      solution: [`${r.d1}${r.d2} × 10${sup(r.e)} = <b>${plain(r.R)} Ω</b> = ${eng(r.R, 'Ω')}`, `Tolerance (${r.bands[3].n}) = ±${r.tol}%`],
      tip: 'You can type answers like 4.7k or 4700.',
    });
  },

  five() {
    const d = [rint(1, 9), rint(0, 9), rint(0, 9)], e = rint(-1, 3);
    const tolB = pick([BANDS[1], BANDS[2], BANDS[5]]);
    const bands = [BANDS[d[0]], BANDS[d[1]], BANDS[d[2]], multBand(e), tolB];
    const R = n3((d[0] * 100 + d[1] * 10 + d[2]) * Math.pow(10, e));
    return num(`<b>5-band</b> (precision) resistor. Value?<div class="bandrow">${bands.map(chip).join('')}</div>`, R, 'Ω', {
      fig: resistorBandsSVG(bands.map(b => b.hex)),
      hints: ['5-band = <b>3 digits</b>, then multiplier, then tolerance.', `Digits: ${d.join('')}. Multiplier: ${bands[3].n} = ×10${sup(e)}`],
      solution: [`${d.join('')} × 10${sup(e)} = <b>${plain(R)} Ω</b> (±${tolB.tol}%)`] });
  },

  range() {
    const r = rand4band();
    const lo = r.R * (1 - r.tol / 100), hi = r.R * (1 + r.tol / 100);
    return multi(`Find the acceptable range for this resistor.<div class="bandrow">${r.bands.map(chip).join('')}</div>`, [
      { label: 'Nominal value', answer: r.R, unit: 'Ω' },
      { label: 'Lowest OK value', answer: n3(lo), unit: 'Ω' },
      { label: 'Highest OK value', answer: n3(hi), unit: 'Ω' },
    ], {
      fig: resistorBandsSVG(r.bands.map(b => b.hex)),
      hints: ['Decode the value first, then the 4th band gives ±%.', `±${r.tol}% of ${plain(r.R)} = ${plain(r.R * r.tol / 100)} Ω`],
      solution: [`Value = ${plain(r.R)} Ω, tolerance ±${r.tol}%`, `${r.tol}% × ${plain(r.R)} = ${plain(r.R * r.tol / 100)}`, `Range: <b>${plain(lo)} Ω</b> to <b>${plain(hi)} Ω</b>`] });
  },

  toBands() {
    const r = rand4band();
    const t = r.bands[3];
    const show = bs => `<span class="bandrow inline">${bs.map(chip).join('')}</span>`;
    const correct = show(r.bands);
    const wrongMult = show([r.bands[0], r.bands[1], multBand(r.e === 5 ? 4 : r.e + 1), t]);
    const swapped = r.d1 !== r.d2 && r.d2 !== 0 ? show([r.bands[1], r.bands[0], r.bands[2], t]) : show([BANDS[(r.d1 % 9) + 1], r.bands[1], r.bands[2], t]);
    const wrongMult2 = show([r.bands[0], r.bands[1], multBand(r.e <= -1 ? 1 : r.e - 1), t]);
    return mcq(`Which colour code is <b class="val">${eng(r.R, 'Ω')} ±${r.tol}%</b>?`, correct, [wrongMult, swapped, wrongMult2], {
      hints: ['Write it as two digits × a power of 10 first.', `${eng(r.R, 'Ω')} = ${r.d1}${r.d2} × 10${sup(r.e)}`],
      solution: [`${r.d1} → ${r.bands[0].n}, ${r.d2} → ${r.bands[1].n}, ×10${sup(r.e)} → ${r.bands[2].n}, ±${r.tol}% → ${t.n}`] });
  },

  conduct() {
    if (Math.random() < 0.6) {
      const R = stdR(2, 5);
      return num(`A resistor is ${f(R, 'Ω')}. What is its <b>conductance</b> G?`, 1 / R, 'S', {
        hints: ['Conductance is the flip of resistance: G = 1 / R', 'Unit: siemens (S). Small answers → use mS or µS.'],
        solution: [`G = 1 / ${eng(R, 'Ω')} = <b>${eng(1 / R, 'S')}</b>`] });
    }
    const G = pick([2, 5, 10, 20, 0.5, 4]) * 1e-3;
    return num(`A conductor has a conductance of ${f(G, 'S')}. What is its <b>resistance</b>?`, 1 / G, 'Ω', {
      hints: ['R = 1 / G'], solution: [`R = 1 / ${eng(G, 'S')} = <b>${eng(1 / G, 'Ω')}</b>`] });
  },

  wire() {
    const mats = [['Silver', 9.9], ['Copper', 10.37], ['Gold', 14.7], ['Aluminum', 17], ['Nickel', 47], ['Iron', 74]];
    const [mat, rho] = pick(mats);
    const L = pick([10, 20, 50, 100, 200, 500, 1000]);
    const d = pick([1.5, 5, 10, 20.1, 25.3, 32, 40.3, 50.8]);
    const A = d * d, R = rho * L / A;
    return multi(`A <b>${mat}</b> wire is <b class="val">${L} ft</b> long with a diameter of <b class="val">${d} mils</b>. (ρ = ${rho} CM·Ω/ft)`, [
      { label: 'Area A (circular mils)', answer: n3(A), unit: 'CM', fixed: true },
      { label: 'Resistance R', answer: n3(R), unit: 'Ω' },
    ], {
      hints: ['Area in circular mils is just the diameter squared: A = d²', 'R = ρ × L / A'],
      solution: [`A = ${d}² = ${sig(A, 5)} CM`, `R = ${rho} × ${L} / ${sig(A, 5)} = <b>${sig(R, 3)} Ω</b>`],
      tip: 'Longer → more R. Thicker → less R. Hotter → more R (for conductors).' });
  },

  quiz() {
    return bank([
      ['The unit of conductance is the…', 'siemens', ['ohm', 'coulomb', 'ampere'], 'G = 1/R, measured in siemens (old name: mho).'],
      ['A 4-band resistor gray-red-black-gold is…', '82 Ω', ['73 Ω', '680 Ω', '820 Ω'], 'Gray 8, Red 2, Black ×1 → 82 Ω ±5%.'],
      ['A 330 kΩ ±5% resistor has the bands…', 'orange-orange-yellow-gold', ['red-red-brown-gold', 'yellow-yellow-red-gold', 'orange-orange-orange-gold'], '33 × 10⁴ = 330,000 → orange orange yellow, gold = 5%.'],
      ['The circular mil is a unit of…', 'area', ['length', 'volume', 'resistance'], 'CM = area of a circle 1 mil across. A = d².'],
      ['In most conductors, as temperature increases, resistance…', 'increases', ['decreases', 'stays the same', 'drops to zero'], 'Conductors have a positive temperature coefficient (PTC).'],
      ['As the AWG gauge number gets bigger, the wire gets…', 'thinner', ['thicker', 'longer', 'more conductive'], 'Bigger gauge number = smaller diameter = more resistance.'],
      ['A potentiometer has how many terminals?', '3', ['2', '4', '1'], 'Pot = 3 terminals (used as a voltage divider). Rheostat = 2 terminals (controls current).'],
      ['Which resistor type does <b>not</b> drift with age and has better tolerance?', 'metal film', ['carbon composition', 'wire-wound', 'rheostat'], 'Metal film: stable and precise, but pricier than carbon.'],
      ['Which resistor type is chosen for <b>high power</b>?', 'wire-wound', ['metal film', 'carbon composition', 'SMD chip'], 'Resistive wire around a ceramic core handles lots of heat.'],
      ['If a 4-band resistor has no tolerance band, the tolerance is…', '±20%', ['±5%', '±10%', '±1%'], 'No 4th band → ±20%.'],
      ['Double a wire\'s length (same material & thickness). Its resistance…', 'doubles', ['halves', 'stays the same', 'quadruples'], 'R = ρL/A → R is directly proportional to L.'],
      ['Double a wire\'s cross-sectional area. Its resistance…', 'halves', ['doubles', 'stays the same', 'quadruples'], 'R = ρL/A → R is inversely proportional to A.'],
      ['Most semiconductors have a ___ temperature coefficient.', 'negative (NTC)', ['positive (PTC)', 'zero', 'infinite'], 'NTC: resistance goes DOWN as temperature goes UP.'],
      ['Which is the best conductor (lowest resistivity)?', 'silver', ['copper', 'gold', 'aluminum'], 'Silver 9.9 < Copper 10.37 < Gold 14.7 < Aluminum 17 CM·Ω/ft.'],
    ]);
  },
};

// =====================================================================
// UNIT 1C — Voltage & Current
// =====================================================================
const G1C = {
  charge() {
    if (Math.random() < 0.6) {
      const m = pick([93.8, 12.5, 3.125, 50, 18.75, 6.25, 31.25]), k = rint(16, 19);
      const n = m * Math.pow(10, k), Q = n / 6.25e18;
      return num(`How much charge do <b class="val">${m} × 10${sup(k)} electrons</b> carry?`, Q, 'C', {
        hints: ['1 coulomb = 6.25 × 10¹⁸ electrons.', 'Q = (number of electrons) ÷ (6.25 × 10¹⁸)'],
        solution: [`Q = ${m} × 10${sup(k)} ÷ 6.25 × 10¹⁸ = <b>${eng(Q, 'C')}</b>`] });
    }
    const Q = pick([1, 2, 0.5, 3, 10]);
    return num(`How many electrons are in <b class="val">${Q} C</b> of charge?<div class="hintline">Type like 6.25e18</div>`, Q * 6.25e18, 'electrons', {
      fixed: true,
      hints: ['1 C = 6.25 × 10¹⁸ electrons'],
      solution: [`${Q} × 6.25 × 10¹⁸ = <b>${sig(Q * 6.25, 4)} × 10¹⁸</b> electrons`] });
  },

  vwq() {
    const which = pick(['V', 'W', 'Q']);
    const Q = pick([2, 5, 10, 0.5, 20, 4]), V = pick([1.5, 5, 9, 12, 3, 24]);
    const W = V * Q;
    if (which === 'V') return num(`It takes ${f(W, 'J')} of energy to move ${f(Q, 'C')} of charge. What is the voltage?`, V, 'V', {
      hints: ['Voltage = energy per charge: V = W / Q'], solution: [`V = ${W} J / ${Q} C = <b>${V} V</b>`], tip: '1 volt = 1 joule per coulomb.' });
    if (which === 'W') return num(`How much energy moves ${f(Q, 'C')} through ${f(V, 'V')}?`, W, 'J', {
      hints: ['W = V × Q'], solution: [`W = ${V} × ${Q} = <b>${sig(W, 4)} J</b>`] });
    return num(`A ${f(V, 'V')} source uses ${f(W, 'J')} of energy. How much charge moved?`, Q, 'C', {
      hints: ['Q = W / V'], solution: [`Q = ${W} / ${V} = <b>${Q} C</b>`] });
  },

  iqt() {
    const which = pick(['I', 'Q', 't']);
    const t = pick([2, 5, 10, 0.5, 60, 4]), I = pick([0.4, 2, 0.25, 1.5, 3, 0.1]);
    const Q = n3(I * t);
    if (which === 'I') return num(`${f(Q, 'C')} of charge passes a point in ${t} s. What is the current?`, I, 'A', {
      hints: ['Current = charge per second: I = Q / t'], solution: [`I = ${Q} / ${t} = <b>${eng(I, 'A')}</b>`], tip: '1 amp = 1 coulomb per second.' });
    if (which === 'Q') return num(`A current of ${f(I, 'A')} flows for ${t} s. How much charge passed?`, Q, 'C', {
      hints: ['Q = I × t'], solution: [`Q = ${I} × ${t} = <b>${Q} C</b>`] });
    return num(`How long does it take ${f(Q, 'C')} to flow at ${f(I, 'A')}?`, t, 's', {
      hints: ['t = Q / I'], solution: [`t = ${Q} / ${I} = <b>${t} s</b>`] });
  },

  quiz() {
    return bank([
      ['<b>Electron flow</b> goes from…', 'negative (−) to positive (+)', ['positive (+) to negative (−)', 'ground to the source', 'it doesn\'t move'], 'Electrons are negative, so they\'re pushed away from − and pulled toward +.'],
      ['<b>Conventional current</b> goes from…', 'positive (+) to negative (−)', ['negative (−) to positive (+)', 'ground to positive', 'both ways at once'], 'Conventional current is the older "positive charge" model: out of + into −.'],
      ['Two negative charges placed close together will…', 'repel', ['attract', 'cancel out', 'become neutral'], 'Like charges repel; unlike charges attract.'],
      ['If the distance between two charges <b>doubles</b>, the force becomes…', '¼ as strong', ['½ as strong', 'twice as strong', 'unchanged'], 'Coulomb\'s law: F ∝ 1/d². (2)² = 4 → ¼.'],
      ['If one of the two charges <b>doubles</b>, the force…', 'doubles', ['halves', 'quadruples', 'stays the same'], 'F ∝ Q₁ × Q₂ — directly proportional to the product.'],
      ['A battery that <b>can be recharged</b> is a…', 'secondary cell', ['primary cell', 'fuel cell', 'solar cell'], 'Secondary = reversible chemistry. Primary = single use.'],
      ['Which is <b>not</b> one of the 4 parts of a cell?', 'filament', ['cathode', 'electrolyte', 'porous separator'], 'Cell = cathode (+), anode (−), electrolyte, separator (salt bridge).'],
      ['In a cell, the <b>positive</b> electrode is called the…', 'cathode', ['anode', 'electrolyte', 'separator'], 'Per the slides: cathode = positive, anode = negative.'],
      ['One volt is…', '1 joule per coulomb', ['1 coulomb per second', '1 joule per second', '1 ohm per amp'], 'V = W/Q.'],
      ['One ampere is…', '1 coulomb per second', ['1 joule per coulomb', '1 volt per ohm squared', '1 watt per second'], 'I = Q/t.'],
      ['The charge of a single electron is…', '1.6 × 10⁻¹⁹ C', ['6.25 × 10¹⁸ C', '1 C', '9 × 10⁹ C'], 'And 6.25 × 10¹⁸ electrons make 1 C.'],
      ['Voltage is also called…', 'electromotive force (emf)', ['electric current', 'resistance', 'conductance'], 'It\'s the "push" that sets electrons in motion.'],
      ['A solar cell converts ___ energy into electrical energy.', 'light', ['chemical', 'magnetic', 'heat'], 'Batteries = chemical, generators = magnetic + motion, solar = light.'],
    ]);
  },
};

// =====================================================================
// UNIT 2A — Basic circuit
// =====================================================================
const G2A = {
  quiz() {
    return bank([
      ['A circuit where current has a <b>complete path</b> is…', 'a closed circuit', ['an open circuit', 'a short circuit', 'a grounded circuit'], 'Closed = complete loop = current flows.'],
      ['A switch is opened in a series circuit. The current becomes…', 'zero', ['maximum', 'unchanged', 'negative'], 'Open circuit = broken path = no current.'],
      ['The bare minimum parts of a circuit are…', 'source, load, and a path', ['a fuse, switch, and meter', 'a ground and a switch', 'only a battery'], 'Source + load + complete path. Switches and fuses are for control and protection.'],
      ['In a switch, the <b>pole</b> is…', 'the movable arm', ['the number of contacts', 'the plastic case', 'the screw terminal'], 'Pole = movable arm. Throw = how many contacts one switch action affects.'],
      ['An <b>SPDT</b> switch connects one input to…', 'either of two outputs', ['two inputs at once', 'only one output', 'ground'], 'Single Pole, Double Throw: one arm, two positions.'],
      ['A <b>DPST</b> switch has…', 'two poles, one throw', ['one pole, two throws', 'two poles, two throws', 'one pole, one throw'], 'Double Pole = 2 arms moving together. Single Throw = on/off.'],
      ['A <b>fuse</b> protects a circuit by…', 'melting and opening the circuit', ['storing extra current', 'resetting itself', 'increasing voltage'], 'Too much current → fuse wire heats → melts → circuit opens. Must be replaced.'],
      ['What\'s the advantage of a circuit <b>breaker</b> over a fuse?', 'it can be reset and reused', ['it never trips', 'it\'s faster than any fuse', 'it raises the voltage'], 'Breakers trip (thermal or magnetic) and can be reset. Fuses must be replaced.'],
      ['Ground is the reference point with a potential of…', '0 V', ['the source voltage', '120 V', 'infinite volts'], 'Everything else is measured relative to ground.'],
      ['A <b>voltmeter</b> is connected…', 'in parallel with the component', ['in series with the component', 'only to ground', 'with the power off'], 'Voltage is measured ACROSS something → parallel.'],
      ['An <b>ammeter</b> is connected…', 'in series (break the circuit)', ['in parallel', 'across the battery', 'after removing the load'], 'Current must flow THROUGH the meter → series.'],
      ['Before measuring resistance with an ohmmeter, you must…', 'remove power from the circuit', ['connect it in series', 'set it to the amps range', 'short the resistor'], 'An ohmmeter supplies its own small voltage. External power gives a wrong reading and can damage it.'],
      ['When measuring an unknown voltage, set the meter range…', 'higher than the expected voltage', ['to the lowest range', 'to the current setting', 'to ohms'], 'Start high and work down so you don\'t overload the meter.'],
      ['A "normally open" push button…', 'only conducts while pressed', ['only conducts when released', 'always conducts', 'never conducts'], 'NO = open at rest; pressing closes it. NC is the opposite.'],
      ['A short circuit causes…', 'very high current', ['zero current', 'zero voltage at the source', 'the load to work better'], 'Short = near-zero resistance path → I = V/R shoots up → fuse blows (hopefully!).'],
      ['A multimeter combines…', 'voltmeter, ammeter and ohmmeter', ['fuse and breaker', 'battery and switch', 'only a voltmeter and ohmmeter'], 'Hence "multi".'],
    ]);
  },
};

// =====================================================================
// UNIT 2B — Ohm's Law
// =====================================================================
function ohmTriple() {
  const R = stdR(1, 5); // 10 Ω .. 82 kΩ
  const V = pick([1.5, 3, 5, 6, 9, 12, 15, 24, 48, 120]);
  return { R, V, I: V / R };
}
const tri = (cover) => `<span class="ohm-tri"><span class="${cover === 'V' ? 'hl' : ''}">V</span><span class="${cover === 'I' ? 'hl' : ''}">I</span><span>×</span><span class="${cover === 'R' ? 'hl' : ''}">R</span></span>`;

const G2B = {
  solve() {
    const { V, I, R } = ohmTriple();
    const which = pick(['V', 'I', 'R']);
    if (which === 'I') return num(`${f(V, 'V')} is applied across ${f(R, 'Ω')}. Find the current.`, I, 'A', {
      fig: seriesSVG({ Vs: V, Rs: [{ label: 'R', value: R }] }),
      hints: [`Cover I in the triangle ${tri('I')} → I = V / R`, `Tip: V ÷ kΩ gives mA directly.`],
      solution: [`I = ${eng(V, 'V')} / ${eng(R, 'Ω')} = <b>${eng(I, 'A')}</b>`] });
    if (which === 'V') return num(`${f(I, 'A')} flows through ${f(R, 'Ω')}. Find the voltage across it.`, V, 'V', {
      fig: seriesSVG({ Vs: '?', Rs: [{ label: 'R', value: R }] }),
      hints: [`Cover V ${tri('V')} → V = I × R`, 'mA × kΩ = V (the prefixes cancel!)'],
      solution: [`V = ${eng(I, 'A')} × ${eng(R, 'Ω')} = <b>${eng(V, 'V')}</b>`] });
    return num(`A ${f(V, 'V')} source pushes ${f(I, 'A')} through a resistor. Find R.`, R, 'Ω', {
      fig: seriesSVG({ Vs: V, Rs: [{ label: 'R', value: '?' }] }),
      hints: [`Cover R ${tri('R')} → R = V / I`, 'V ÷ mA = kΩ'],
      solution: [`R = ${eng(V, 'V')} / ${eng(I, 'A')} = <b>${eng(R, 'Ω')}</b>`] });
  },

  word() {
    const t = pick([
      () => { const I = pick([0.5, 0.25, 0.4]), V = 120; return num(`An alarm clock draws ${f(I, 'A')} from a ${V} V outlet. What's its resistance?`, V / I, 'Ω', { hints: ['R = V / I'], solution: [`R = ${V} / ${I} = <b>${eng(V / I, 'Ω')}</b>`] }); },
      () => { const V = 110, I = pick([5.5, 2.2, 11]); return num(`A subwoofer needs ${V} V to push ${f(I, 'A')} through its coil. Resistance?`, V / I, 'Ω', { hints: ['R = V / I'], solution: [`R = ${V} / ${I} = <b>${eng(V / I, 'Ω')}</b>`] }); },
      () => { const V = 1.5, I = pick([0.01, 0.005, 0.03]); return num(`A Walkman runs on a ${V} V battery and draws ${f(I, 'A')}. Resistance?`, V / I, 'Ω', { hints: ['R = V / I'], solution: [`R = ${V} / ${I} = <b>${eng(V / I, 'Ω')}</b>`] }); },
      () => { const R = pick([12, 10, 15, 24]), V = 120; return num(`A toaster has ${R} Ω of resistance on a ${V} V circuit. Current?`, V / R, 'A', { hints: ['I = V / R'], solution: [`I = ${V} / ${R} = <b>${eng(V / R, 'A')}</b>`] }); },
      () => { const R = pick([10, 6, 4, 8]), V = 12; return num(`A 12 V car battery runs a headlight circuit of ${R} Ω. Current?`, V / R, 'A', { hints: ['I = V / R'], solution: [`I = 12 / ${R} = <b>${eng(V / R, 'A')}</b>`] }); },
      () => { const I = pick([100, 50, 20]), R = pick([1.1, 2.4, 0.5]); return num(`A heater coil carries ${I} A and has ${R} Ω. What voltage is applied?`, I * R, 'V', { hints: ['V = I × R'], solution: [`V = ${I} × ${R} = <b>${sig(I * R, 4)} V</b>`] }); },
      () => { const R = pick([5, 4, 8]), I = pick([10, 2, 3]); return num(`A bulb has ${R} Ω and a max current of ${I} A. Max voltage before it breaks?`, R * I, 'V', { hints: ['V = I × R'], solution: [`V = ${I} × ${R} = <b>${R * I} V</b>`] }); },
    ]);
    const p = t(); p.tip = 'Those are the exact word problems from the Ohm\'s Law practice slide, with new numbers.'; return p;
  },

  ratio() {
    if (Math.random() < 0.5) {
      const k = pick([2, 3, 4]);
      const what = pick(['V', 'R']);
      if (what === 'V') return mcq(`Resistance stays the same and the voltage is <b>multiplied by ${k}</b>. The current…`, `× ${k}`, [`÷ ${k}`, 'stays the same', `× ${k * k}`],
        { solution: ['V and I are <b>directly</b> proportional (straight-line graph). V × ' + k + ' → I × ' + k + '.'] });
      return mcq(`Voltage stays the same and the resistance is <b>multiplied by ${k}</b>. The current…`, `÷ ${k}`, [`× ${k}`, 'stays the same', `÷ ${k * k}`],
        { solution: ['I and R are <b>inversely</b> proportional. R × ' + k + ' → I ÷ ' + k + '.'] });
    }
    const I1 = pick([2, 3, 4, 5]), V1 = pick([6, 5, 9, 12]), V2 = V1 * pick([2, 3, 0.5]);
    const I2 = I1 * V2 / V1;
    return num(`A resistor draws <b class="val">${I1} mA</b> at <b class="val">${V1} V</b>. Same resistor at <b class="val">${V2} V</b> draws ? mA`, I2, 'mA', {
      fixed: true, hints: ['Same R → current scales exactly with voltage.', `Voltage changed by × ${sig(V2 / V1, 3)}`],
      solution: [`${I1} mA × (${V2}/${V1}) = <b>${sig(I2, 4)} mA</b>`] });
  },

  color() {
    const r = rand4band();
    while (r.R < 100 || r.R > 1e5) { Object.assign(r, rand4band()); }
    const V = pick([5, 9, 12, 24]);
    const I = V / r.R;
    return num(`A <b>${r.bands.slice(0, 3).map(b => b.n).join('-')}</b> resistor is connected to ${f(V, 'V')}. What should the ammeter read?`, I, 'A', {
      fig: resistorBandsSVG(r.bands.map(b => b.hex), 220),
      hints: ['Step 1: decode the colours to get R.', `R = ${eng(r.R, 'Ω')}. Step 2: I = V / R`],
      solution: [`R = ${r.d1}${r.d2} × 10${sup(r.e)} = ${eng(r.R, 'Ω')}`, `I = ${V} / ${eng(r.R, 'Ω')} = <b>${eng(I, 'A')}</b>`] });
  },
};

// =====================================================================
// UNIT 3A — Series & KVL
// =====================================================================
function seriesSet(n = rint(2, 4)) {
  const dec = rint(2, 3);
  return Array.from({ length: n }, () => pick(E12) * Math.pow(10, dec - 1 + rint(0, 1)));
}
const Rlab = (arr, hide = -1) => arr.map((v, i) => ({ label: `R${i + 1}`, value: v, hide: i === hide }));

const G3A = {
  rt() {
    const Rs = seriesSet();
    const RT = Rs.reduce((a, b) => a + b, 0);
    return num('Find the <b>total resistance</b> R<sub>T</sub>.', RT, 'Ω', {
      fig: seriesSVG({ Vs: '', Rs: Rlab(Rs) }),
      hints: ['Series → just add them all up.', `Convert everything to the same prefix first (e.g. all in Ω).`],
      solution: [`R<sub>T</sub> = ${Rs.map(r => eng(r, 'Ω')).join(' + ')} = <b>${eng(RT, 'Ω')}</b>`],
      tip: 'Adding a resistor in series ALWAYS increases R_T.' });
  },

  current() {
    const Rs = seriesSet(rint(2, 3));
    const Vs = pick([5, 9, 10, 12, 15, 24]);
    const RT = Rs.reduce((a, b) => a + b, 0);
    return num('Find the <b>current</b> in this series circuit.', Vs / RT, 'A', {
      fig: seriesSVG({ Vs, Rs: Rlab(Rs) }),
      hints: ['One path → one current. First find R<sub>T</sub> = R1 + R2 + …', `R<sub>T</sub> = ${eng(RT, 'Ω')}. Now I = V<sub>S</sub> / R<sub>T</sub>`],
      solution: [`R<sub>T</sub> = ${eng(RT, 'Ω')}`, `I = ${Vs} V / ${eng(RT, 'Ω')} = <b>${eng(Vs / RT, 'A')}</b>`] });
  },

  divider() {
    const Rs = seriesSet(rint(2, 3));
    const Vs = pick([9, 10, 12, 15, 20, 24]);
    const RT = Rs.reduce((a, b) => a + b, 0);
    const x = rint(0, Rs.length - 1);
    const Vx = Vs * Rs[x] / RT;
    return num(`Use the <b>voltage divider rule</b>: find the voltage across <b>R${x + 1}</b>.`, Vx, 'V', {
      fig: seriesSVG({ Vs, Rs: Rlab(Rs) }),
      hints: ['V<sub>x</sub> = V<sub>S</sub> × (R<sub>x</sub> / R<sub>T</sub>)', `R<sub>T</sub> = ${eng(RT, 'Ω')}`],
      solution: [`V<sub>${x + 1}</sub> = ${Vs} × (${eng(Rs[x], 'Ω')} / ${eng(RT, 'Ω')}) = <b>${eng(Vx, 'V')}</b>`],
      tip: 'Biggest resistor gets the biggest share of the voltage.' });
  },

  kvl() {
    const n = rint(3, 4);
    const Vs = pick([12, 15, 20, 24, 30]);
    // split Vs into n-1 known drops + 1 unknown
    const drops = [];
    let left = Vs;
    for (let i = 0; i < n - 1; i++) { const d = n3(rnd1(0.12, 0.28) * Vs); drops.push(d); left -= d; }
    const miss = rint(0, n - 1);
    drops.splice(miss, 0, n3(left));
    const Rs = drops.map((d, i) => ({ label: `R${i + 1}`, value: i === miss ? '? V' : `${sig(d, 3)} V` }));
    return num(`KVL: the drops are shown on each resistor. Find the <b>missing drop across R${miss + 1}</b>.`, n3(left), 'V', {
      fig: seriesSVG({ Vs, Rs }),
      hints: ['Kirchhoff\'s Voltage Law: the drops add up to the source voltage.', `V<sub>S</sub> = ${drops.map((d, i) => i === miss ? '?' : sig(d, 3)).join(' + ')}`],
      solution: [`? = ${Vs} − ${drops.filter((_, i) => i !== miss).map(d => sig(d, 3)).join(' − ')} = <b>${sig(left, 3)} V</b>`] });
  },

  table() {
    const I = pick([0.2, 0.3, 0.4, 0.5, 0.6, 0.8, 1, 1.5, 2]);
    const R1 = pick([10, 15, 20, 25, 30, 40]), R2 = pick([10, 20, 30, 40, 50, 60]);
    const V1 = n3(I * R1), V2 = n3(I * R2), Vs = n3(V1 + V2);
    return multi(`Complete the table, like the lecture example. You know <b>E = ${Vs} V</b>, <b>V<sub>R1</sub> = ${V1} V</b>, <b>R1 = ${R1} Ω</b>.`, [
      { label: 'Current I', answer: I, unit: 'A' },
      { label: 'V<sub>R2</sub>', answer: V2, unit: 'V' },
      { label: 'R2', answer: R2, unit: 'Ω' },
      { label: 'R<sub>T</sub>', answer: R1 + R2, unit: 'Ω' },
    ], {
      fig: seriesSVG({ Vs, Rs: [{ label: 'R1', value: R1, note: `${V1} V` }, { label: 'R2', value: '?' }] }),
      hints: ['You know V and R for R1 → that gives the current, and it\'s the same everywhere.', 'KVL gives V<sub>R2</sub>. Then R2 = V<sub>R2</sub> / I.'],
      solution: [`I = V<sub>R1</sub>/R1 = ${V1}/${R1} = ${I} A`, `V<sub>R2</sub> = ${Vs} − ${V1} = ${V2} V`, `R2 = ${V2}/${I} = ${R2} Ω`, `R<sub>T</sub> = ${R1} + ${R2} = ${R1 + R2} Ω  (check: ${Vs}/${I} = ${sig(Vs / I, 4)} Ω ✔)`] });
  },

  batteries() {
    const n = rint(3, 6), k = rint(1, Math.floor((n - 1) / 2)), v = pick([1.5, 1.5, 1.2, 9]);
    const tot = v * (n - 2 * k);
    return num(`<b>${n}</b> cells of <b>${v} V</b> are in series, but <b>${k}</b> ${k > 1 ? 'are' : 'is'} put in backwards. Total voltage?`, tot, 'V', {
      hints: ['Series sources add <b>algebraically</b>. A reversed cell subtracts.', `${n - k} forward, ${k} reversed.`],
      solution: [`(${n - k} − ${k}) × ${v} = <b>${sig(tot, 4)} V</b>`, 'Notice: one backwards cell costs you TWO cells\' worth (it stops adding and starts subtracting).'] });
  },

  ground() {
    const R1 = pick([1, 2, 3, 4.7, 5.6]) * 1000, R2 = pick([1, 2, 3.3, 4, 6.8]) * 1000;
    const Vs = pick([10, 12, 15, 20, 24]);
    const I = Vs / (R1 + R2), V1 = I * R1, V2 = I * R2;
    return multi(`Point <b>C</b> (bottom) is ground. <b>A</b> is the top of R1, <b>B</b> is between R1 and R2. Find:`, [
      { label: 'V<sub>A</sub>', answer: Vs, unit: 'V' },
      { label: 'V<sub>B</sub>', answer: n3(V2), unit: 'V' },
      { label: 'V<sub>AB</sub>', answer: n3(V1), unit: 'V' },
    ], {
      fig: `<svg class="sch" viewBox="0 0 300 250"><path class="w" d="M60,30 L180,30 M180,190 L60,190"/>
        <path class="w" d="M60,30 L60,102 M60,118 L60,190"/><line class="bat" x1="44" y1="102" x2="76" y2="102"/><line class="bat thick" x1="51" y1="118" x2="69" y2="118"/>
        <text x="26" y="114" class="tv" text-anchor="end">${Vs} V</text>
        <path class="r" d="M180,30 L180,46 L187,50 L173,58 L187,66 L173,74 L187,82 L173,90 L180,94 L180,110"/><text x="196" y="68" class="tl" text-anchor="start">R1 ${eng(R1, 'Ω')}</text>
        <path class="r" d="M180,110 L180,126 L187,130 L173,138 L187,146 L173,154 L187,162 L173,170 L180,174 L180,190"/><text x="196" y="150" class="tl" text-anchor="start">R2 ${eng(R2, 'Ω')}</text>
        <circle class="node" cx="180" cy="30" r="4"/><text x="166" y="22" class="tp">A</text><circle class="node" cx="180" cy="110" r="4"/><text x="160" y="114" class="tp">B</text>
        <circle class="node" cx="180" cy="190" r="4"/><text x="160" y="206" class="tp">C</text>
        <path class="w" d="M180,190 L180,210 M168,210 L192,210 M172,216 L188,216 M176,222 L184,222"/></svg>`,
      hints: ['Single subscript = voltage measured from that point <b>to ground</b>.', 'V<sub>A</sub> is the whole source. V<sub>B</sub> is just the drop across R2. V<sub>AB</sub> = V<sub>A</sub> − V<sub>B</sub>.'],
      solution: [`I = ${Vs} / ${eng(R1 + R2, 'Ω')} = ${eng(I, 'A')}`, `V<sub>A</sub> = ${Vs} V`, `V<sub>B</sub> = V<sub>R2</sub> = ${eng(V2, 'V')}`, `V<sub>AB</sub> = ${Vs} − ${sig(V2, 3)} = ${eng(V1, 'V')}`] });
  },

  quiz() {
    return bank([
      ['A third resistor is added in series with two others. R<sub>T</sub>…', 'increases', ['decreases', 'stays the same', 'increases by one-third'], 'Series resistors add, so more resistors → more R_T.'],
      ['Four 1.5 V cells go in a flashlight, one backwards. Voltage across the bulb?', '3 V', ['6 V', '4.5 V', '0 V'], '3 forward − 1 reversed = 2 × 1.5 = 3 V.'],
      ['Six series resistors each drop 5 V. The source voltage is…', '30 V', ['5 V', '6 V', '0 V'], 'KVL: 6 × 5 = 30 V.'],
      ['9 V across 68 Ω, 33 Ω, 100 Ω and 47 Ω in series. Current?', '36.3 mA', ['27.6 A', '22.3 mA', '363 mA'], 'R_T = 248 Ω → 9/248 = 36.3 mA.'],
      ['In a series circuit the current is higher than it should be. Look for…', 'a short or a low resistor value', ['an open circuit', 'a dead battery', 'a meter in parallel'], 'Higher current = lower total resistance = something shorted or undersized.'],
      ['A series circuit has an <b>open</b>. Where does the full source voltage appear?', 'across the open', ['across the biggest resistor', 'nowhere — it\'s 0 V everywhere', 'across every resistor equally'], 'With I = 0, the good resistors drop 0 V, so all of V_S appears across the break.'],
      ['In a series circuit the current is…', 'the same through every resistor', ['biggest through the biggest resistor', 'split between the resistors', 'zero at ground'], 'One path → one current.'],
      ['A short across one series resistor makes the total current…', 'increase', ['decrease', 'drop to zero', 'stay the same'], 'Part of R_T is bypassed → R_T drops → I rises.'],
      ['An <b>ideal</b> voltage source has an internal resistance of…', 'zero', ['infinity', '50 Ω', '10 MΩ'], 'Real sources have a small internal R (usually ≤ 50 Ω) in series.'],
      ['Moving the ground point in a circuit changes…', 'the voltages measured relative to ground, but not the current or drops', ['the current', 'the voltage drops across resistors', 'the total resistance'], 'Ground is just the 0 V reference — like choosing where "sea level" is.'],
      ['A potentiometer used as a voltage divider is often found in…', 'a volume control', ['a fuse', 'a battery', 'an ammeter shunt'], 'Turning the wiper changes the division ratio.'],
    ]);
  },
};
function rnd1(a, b) { return a + Math.random() * (b - a); }

// =====================================================================
// UNIT 4A — Energy & Power
// =====================================================================
const RATINGS = [0.125, 0.25, 0.5, 1, 2, 3, 5, 7, 10, 15];
const ratingName = r => ({ 0.125: '1/8 W', 0.25: '1/4 W', 0.5: '1/2 W' }[r] || `${r} W`);

const G4A = {
  power() {
    const form = pick(['VI', 'I2R', 'V2R']);
    if (form === 'VI') { const I = pick([12, 5, 0.5, 2, 8]), V = pick([120, 12, 240, 9]); return num(`A device draws ${f(I, 'A')} from ${f(V, 'V')}. Power?`, V * I, 'W', { hints: ['You have V and I → P = V × I'], solution: [`P = ${V} × ${I} = <b>${eng(V * I, 'W')}</b>`] }); }
    if (form === 'I2R') { const R = pick([27, 10, 100, 47, 4.7]), I = pick([0.135, 0.2, 0.05, 1.5, 0.3]); return num(`${f(I, 'A')} flows through a ${f(R, 'Ω')} resistor. Power dissipated?`, I * I * R, 'W', { hints: ['You have I and R → P = I² × R', 'Square the current FIRST.'], solution: [`P = ${I}² × ${R} = ${sig(I * I, 4)} × ${R} = <b>${eng(I * I * R, 'W')}</b>`], tip: 'Slide decoder: on the slides "27 W resistor" means 27 Ω — the Ω symbol turned into a W.' }); }
    const R = pick([100, 47, 1000, 220, 10]), V = pick([5, 10, 12, 9, 3]);
    return num(`A ${f(R, 'Ω')} resistor has ${f(V, 'V')} across it. Power dissipated?`, V * V / R, 'W', { hints: ['You have V and R → P = V² / R'], solution: [`P = ${V}² / ${R} = ${V * V} / ${R} = <b>${eng(V * V / R, 'W')}</b>`] });
  },

  kwh() {
    const P = pick([1200, 1500, 60, 100, 2000, 800]), mins = pick([20, 30, 45, 60, 90, 120, 15]);
    const E = P / 1000 * mins / 60;
    return num(`How much energy does a ${f(P, 'W')} appliance use in <b class="val">${mins} min</b>?`, E, 'kWh', {
      fixed: true, tol: 0.01,
      hints: ['W = P × t. For kWh: power in kW, time in hours.', `${P} W = ${P / 1000} kW, ${mins} min = ${sig(mins / 60, 3)} h`],
      solution: [`${P / 1000} kW × ${sig(mins / 60, 3)} h = <b>${sig(E, 3)} kWh</b>`] });
  },

  joules() {
    if (Math.random() < 0.5) {
      const kwh = pick([1, 2, 0.5, 0.4, 3]);
      return num(`Convert <b class="val">${kwh} kWh</b> into joules.<div class="hintline">Type like 3.6e6</div>`, kwh * 3.6e6, 'J', {
        hints: ['1 kWh = 3.6 × 10⁶ J (1000 W × 3600 s)'], solution: [`${kwh} × 3.6 × 10⁶ = <b>${sig(kwh * 3.6, 4)} × 10⁶ J</b>`] });
    }
    const P = pick([60, 100, 5, 40]), t = pick([10, 30, 60, 120]);
    return num(`A ${P} W lamp runs for ${t} seconds. Energy used?`, P * t, 'J', {
      hints: ['W = P × t (watts × seconds = joules)'], solution: [`${P} × ${t} = <b>${eng(P * t, 'J')}</b>`] });
  },

  rating() {
    let P, desc;
    do {
      if (Math.random() < 0.5) { const R = stdR(2, 3), V = pick([5, 9, 12, 15, 24]); P = V * V / R; desc = `${eng(R, 'Ω')} resistor with ${V} V across it`; }
      else { const R = stdR(2, 3), I = pick([10, 20, 50, 30, 100]) * 1e-3; P = I * I * R; desc = `${eng(R, 'Ω')} resistor carrying ${eng(I, 'A')}`; }
    } while (P < 0.02 || P > 14 || RATINGS.includes(n3(P)));
    const ok = RATINGS.find(r => r > P);
    const idx = RATINGS.indexOf(ok);
    const wrongs = RATINGS.map((r, i) => [r, Math.abs(i - idx)]).filter(x => x[0] !== ok).sort((a, b) => a[1] - b[1]).slice(0, 3).map(x => ratingName(x[0]));
    return mcq(`A ${desc}. What's the <b>smallest standard power rating</b> that's safe?`, ratingName(ok), wrongs, {
      hints: ['Find the power first.', `P ≈ ${eng(P, 'W')}. Standard: 1/8, 1/4, 1/2, 1, 2, 3, 5 W…`],
      solution: [`P = ${eng(P, 'W')}`, `The rating must be <b>more</b> than that → next standard value up = <b>${ratingName(ok)}</b>`, '(Ideally ~2× the real power for a safety margin.)'],
      tip: 'Power rating depends on physical size/surface area — NOT on the ohm value.' });
  },

  ah() {
    const Ah = pick([10, 20, 5, 70, 2.5, 1.2]), I = pick([0.5, 0.25, 2, 1, 0.1, 5]);
    return num(`A battery rated <b class="val">${Ah} Ah</b> powers a ${f(I, 'A')} load. How many hours will it last?`, Ah / I, 'h', {
      fixed: true, hints: ['Ah ÷ A = hours'], solution: [`${Ah} Ah / ${I} A = <b>${sig(Ah / I, 4)} h</b>`] });
  },

  eff() {
    if (Math.random() < 0.6) {
      const Pin = pick([100, 50, 200, 25, 120]), eff = pick([80, 85, 90, 75, 60]);
      const Pout = Pin * eff / 100;
      return num(`A power supply takes in ${f(Pin, 'W')} and delivers ${f(Pout, 'W')} to the load. Efficiency?`, eff, '%', {
        fixed: true, hints: ['Efficiency = (P<sub>OUT</sub> / P<sub>IN</sub>) × 100%'], solution: [`${Pout} / ${Pin} × 100 = <b>${eff}%</b>`, `The other ${Pin - Pout} W is wasted as heat.`] });
    }
    const Pin = pick([100, 50, 200]), eff = pick([80, 85, 90, 75]);
    return num(`A ${eff}% efficient supply draws ${f(Pin, 'W')}. Output power?`, Pin * eff / 100, 'W', {
      hints: ['P<sub>OUT</sub> = efficiency × P<sub>IN</sub>'], solution: [`${eff / 100} × ${Pin} = <b>${Pin * eff / 100} W</b>`] });
  },

  quiz() {
    return bank([
      ['A resistor\'s power rating mostly depends on its…', 'physical size (surface area)', ['ohm value', 'colour bands', 'tolerance'], 'Bigger surface → sheds more heat → higher rating.'],
      ['1 kWh equals…', '3.6 × 10⁶ J', ['1000 J', '3600 J', '60 J'], '1000 W × 3600 s = 3,600,000 J.'],
      ['One watt is…', 'one joule per second', ['one volt per amp', 'one coulomb per second', 'one joule per coulomb'], 'P = W / t.'],
      ['Energy is measured in…', 'joules', ['watts', 'volts', 'amps'], 'Watts are for POWER (the rate). Joules are the energy itself.'],
      ['If you know V and R, the most direct power formula is…', 'P = V² / R', ['P = I² R', 'P = V I', 'P = W t'], 'Pick the formula that uses what you already have.'],
      ['A resistor must dissipate 0.75 W. Minimum standard rating?', '1 W', ['1/2 W', '3/4 W', '0.75 W'], 'Rating must exceed the actual power → next standard value = 1 W.'],
      ['Doubling the current through a resistor makes its power…', '4× bigger', ['2× bigger', 'stay the same', '½'], 'P = I²R → (2)² = 4.'],
      ['Where does "lost" power in a power supply go?', 'heat', ['back into the outlet', 'the ground wire', 'it is stored'], 'That\'s why efficiency is always below 100%.'],
    ]);
  },
};

// =====================================================================
// UNIT 4B — Atomic structure
// =====================================================================
const ELEMENTS = [
  ['Hydrogen', 1], ['Helium', 2], ['Lithium', 3], ['Carbon', 6], ['Nitrogen', 7], ['Oxygen', 8], ['Neon', 10], ['Sodium', 11],
  ['Magnesium', 12], ['Aluminum', 13], ['Silicon', 14], ['Phosphorus', 15], ['Sulfur', 16], ['Chlorine', 17], ['Argon', 18],
];
export function shells(Z) {
  if (Z === 29) return [2, 8, 18, 1];
  if (Z === 32) return [2, 8, 18, 4];
  if (Z === 47) return [2, 8, 18, 18, 1];
  const out = []; let left = Z;
  for (const cap of [2, 8, 8]) { if (left <= 0) break; out.push(Math.min(cap, left)); left -= cap; }
  return out;
}
const G4B = {
  shell() {
    const n = rint(1, 4);
    return num(`What is the <b>maximum</b> number of electrons shell <b>n = ${n}</b> can hold?`, 2 * n * n, 'electrons', {
      fixed: true, tol: 0, hints: ['Use N<sub>e</sub> = 2n²'], solution: [`2 × ${n}² = 2 × ${n * n} = <b>${2 * n * n}</b>`],
      tip: 'Exception: the outer (valence) shell holds at most 8.' });
  },
  valence() {
    const [name, Z] = pick([...ELEMENTS, ['Copper', 29], ['Germanium', 32]]);
    const sh = shells(Z);
    return num(`<b>${name}</b> has atomic number <b>${Z}</b>. How many <b>valence</b> electrons?`, sh[sh.length - 1], 'electrons', {
      fixed: true, tol: 0,
      hints: ['Atomic number = protons = electrons (neutral atom).', 'Fill shells: 2, then 8, then the rest. (Copper and germanium have an 18-electron third shell.)'],
      solution: [`Shells: ${sh.join(', ')} → valence = <b>${sh[sh.length - 1]}</b>`] });
  },
  classify() {
    const [name, v] = pick([['Copper', 1], ['Silver', 1], ['Gold', 1], ['Aluminum', 3], ['Silicon', 4], ['Germanium', 4], ['Neon', 8], ['Argon', 8]]);
    const ans = v <= 3 ? 'Conductor' : v === 4 ? 'Semiconductor' : 'Insulator';
    return mcq(`<b>${name}</b> has <b>${v}</b> valence electron${v > 1 ? 's' : ''}. It behaves like a…`, ans, ['Conductor', 'Semiconductor', 'Insulator'].filter(x => x !== ans), {
      solution: ['1–3 valence → conductor (1 is best). 4 → semiconductor. 8 → insulator.'] });
  },
  quiz() {
    return bank([
      ['The atomic number tells you the number of…', 'protons', ['neutrons', 'shells', 'valence electrons'], 'It also equals the electrons in a neutral atom.'],
      ['An atom that <b>loses</b> an electron becomes a…', 'positive ion', ['negative ion', 'neutral atom', 'neutron'], 'Fewer electrons than protons → net positive.'],
      ['An atom that <b>gains</b> an electron becomes a…', 'negative ion', ['positive ion', 'proton', 'semiconductor'], 'Extra electron → net negative.'],
      ['The nucleus contains…', 'protons and neutrons', ['protons and electrons', 'only electrons', 'valence electrons'], 'Electrons orbit outside the nucleus.'],
      ['Electrons in the outermost shell are called…', 'valence electrons', ['core electrons', 'free protons', 'neutrons'], 'They\'re the loosely held ones that decide how a material conducts.'],
      ['The "energy gap" is the energy needed to move an electron from…', 'the valence band to the conduction band', ['the nucleus to shell 1', 'one atom to a neutron', 'positive to negative'], 'Once in the conduction band, it\'s a free electron.'],
      ['The best conductors have how many valence electrons?', '1', ['4', '8', '0'], 'Copper, silver and gold all have 1.'],
      ['Silicon (atomic number 14) has how many valence electrons?', '4', ['2', '8', '14'], 'Shells 2, 8, 4 → 4 valence → semiconductor.'],
      ['Electrons farther from the nucleus have…', 'more energy', ['less energy', 'no charge', 'positive charge'], 'Outer shells = higher energy levels.'],
      ['A neutral carbon atom has a net charge of…', '0', ['+6', '−6', '+12'], '6 protons (+6) and 6 electrons (−6) cancel.'],
    ]);
  },
};

// =====================================================================
// UNIT 5 — Parallel & KCL
// =====================================================================
const par = (...rs) => 1 / rs.reduce((a, r) => a + 1 / r, 0);
const G5 = {
  rt2() {
    const R1 = stdR(2, 4), R2 = stdR(2, 4);
    const RT = par(R1, R2);
    return num('Two resistors in parallel. Find R<sub>T</sub>.', RT, 'Ω', {
      fig: parallelSVG({ Vs: '', Rs: [{ label: 'R1', value: R1 }, { label: 'R2', value: R2 }] }),
      hints: ['For exactly two: <b>product over sum</b>  R<sub>T</sub> = (R1 × R2) / (R1 + R2)', 'Sanity check: the answer must be <b>smaller</b> than the smallest resistor.'],
      solution: [`(${eng(R1, 'Ω')} × ${eng(R2, 'Ω')}) / (${eng(R1, 'Ω')} + ${eng(R2, 'Ω')}) = <b>${eng(RT, 'Ω')}</b>`] });
  },
  rtn() {
    const R = stdR(2, 4), n = rint(2, 5);
    return num(`<b>${n}</b> equal resistors of ${f(R, 'Ω')} are in parallel. R<sub>T</sub>?`, R / n, 'Ω', {
      fig: parallelSVG({ Vs: '', Rs: Array.from({ length: n }, (_, i) => ({ label: `R${i + 1}`, value: R })) }),
      hints: ['Equal values: R<sub>T</sub> = R / n'], solution: [`${eng(R, 'Ω')} / ${n} = <b>${eng(R / n, 'Ω')}</b>`] });
  },
  rt3() {
    const Rs = [stdR(2, 3), stdR(2, 3), stdR(2, 3)];
    const RT = par(...Rs);
    return num('Three resistors in parallel. Find R<sub>T</sub>.', RT, 'Ω', {
      fig: parallelSVG({ Vs: '', Rs: Rlab(Rs) }),
      hints: ['1/R<sub>T</sub> = 1/R1 + 1/R2 + 1/R3  (add the conductances)', 'Don\'t forget to flip at the end!'],
      solution: [`1/R<sub>T</sub> = ${Rs.map(r => sig(1 / r, 3)).join(' + ')} = ${sig(1 / RT, 4)} S`, `R<sub>T</sub> = 1 / ${sig(1 / RT, 4)} = <b>${eng(RT, 'Ω')}</b>`] });
  },
  branch() {
    const Rs = [stdR(2, 4), stdR(2, 4), stdR(2, 4)].slice(0, rint(2, 3));
    const Vs = pick([5, 9, 10, 12, 20, 24]);
    const Is = Rs.map(r => Vs / r);
    const IT = Is.reduce((a, b) => a + b, 0);
    return multi('Find each branch current and the total current.', [
      ...Is.map((I, i) => ({ label: `I<sub>${i + 1}</sub>`, answer: I, unit: 'A' })),
      { label: 'I<sub>T</sub>', answer: IT, unit: 'A' },
    ], {
      fig: parallelSVG({ Vs, Rs: Rlab(Rs) }),
      hints: ['In parallel, <b>every branch gets the full source voltage</b>.', 'So I<sub>x</sub> = V<sub>S</sub> / R<sub>x</sub>. Then KCL: I<sub>T</sub> = sum of branches.'],
      solution: [...Is.map((I, i) => `I<sub>${i + 1}</sub> = ${Vs} / ${eng(Rs[i], 'Ω')} = ${eng(I, 'A')}`), `I<sub>T</sub> = <b>${eng(IT, 'A')}</b>`] });
  },
  kcl() {
    const n = rint(3, 4);
    const Is = Array.from({ length: n }, () => pick([5, 10, 15, 20, 25, 30, 40, 12, 8]));
    const IT = Is.reduce((a, b) => a + b, 0), miss = rint(0, n - 1);
    return num(`A parallel circuit has <b class="val">I<sub>T</sub> = ${IT} mA</b> and ${n} branches. Known branches: ${Is.map((I, i) => i === miss ? '' : `<b>${I} mA</b>`).filter(Boolean).join(', ')}. The missing branch current?`, Is[miss], 'mA', {
      fixed: true, hints: ['KCL: current into a node = current out.', `I<sub>T</sub> = sum of all branches.`],
      solution: [`${IT} − ${Is.filter((_, i) => i !== miss).join(' − ')} = <b>${Is[miss]} mA</b>`] });
  },
  cdr() {
    const R1 = stdR(2, 3), R2 = stdR(2, 3), IT = pick([10, 20, 50, 100, 30]) * 1e-3;
    const I1 = IT * R2 / (R1 + R2);
    return num(`Current divider: I<sub>T</sub> = ${f(IT, 'A')} splits between R1 and R2. Find <b>I<sub>1</sub></b>.`, I1, 'A', {
      fig: parallelSVG({ Vs: '', Rs: [{ label: 'R1', value: R1 }, { label: 'R2', value: R2 }] }),
      hints: ['I<sub>x</sub> = (R<sub>T</sub> / R<sub>x</sub>) × I<sub>T</sub>', 'For two resistors: I<sub>1</sub> = I<sub>T</sub> × R2 / (R1 + R2) — note it\'s the <b>other</b> resistor on top!'],
      solution: [`I<sub>1</sub> = ${eng(IT, 'A')} × ${eng(R2, 'Ω')} / (${eng(R1, 'Ω')} + ${eng(R2, 'Ω')}) = <b>${eng(I1, 'A')}</b>`],
      tip: 'Current takes the easy road: the SMALLER resistor gets the BIGGER current.' });
  },
  table() {
    const I1 = pick([0.1, 0.2, 0.05, 0.25]), R1 = pick([100, 200, 150, 300, 400]);
    const E = I1 * R1;
    const R2 = pick([20, 25, 40, 50, 60, 80]);
    const I2 = E / R2, IT = I1 + I2, RT = E / IT;
    return multi(`Complete the table (lecture style). You know <b>I<sub>R1</sub> = ${I1} A</b>, <b>I<sub>R2</sub> = ${sig(I2, 3)} A</b>, <b>R1 = ${R1} Ω</b>.`, [
      { label: 'E (supply)', answer: E, unit: 'V' },
      { label: 'R2', answer: R2, unit: 'Ω' },
      { label: 'I<sub>T</sub>', answer: IT, unit: 'A' },
      { label: 'R<sub>T</sub>', answer: RT, unit: 'Ω' },
    ], {
      fig: parallelSVG({ Vs: 'E = ?', Rs: [{ label: 'R1', value: R1, note: `${I1} A` }, { label: 'R2', value: '?', note: `${sig(I2, 3)} A` }] }),
      hints: ['Parallel → E = V<sub>R1</sub> = V<sub>R2</sub>. Get E from R1\'s I and R.', 'Then R2 = E/I<sub>2</sub>, I<sub>T</sub> = I<sub>1</sub> + I<sub>2</sub>, R<sub>T</sub> = E/I<sub>T</sub>.'],
      solution: [`E = ${I1} × ${R1} = ${E} V`, `R2 = ${E} / ${sig(I2, 3)} = ${R2} Ω`, `I<sub>T</sub> = ${I1} + ${sig(I2, 3)} = ${sig(IT, 3)} A`, `R<sub>T</sub> = ${E} / ${sig(IT, 3)} = ${sig(RT, 3)} Ω`] });
  },
  power() {
    const n = rint(2, 4), Vs = pick([5, 10, 12]);
    const Rs = Array.from({ length: n }, () => stdR(2, 3));
    const Ps = Rs.map(r => Vs * Vs / r), PT = Ps.reduce((a, b) => a + b, 0);
    return num('Find the <b>total power</b> dissipated.', PT, 'W', {
      fig: parallelSVG({ Vs, Rs: Rlab(Rs) }),
      hints: ['Every branch has the full voltage → P<sub>x</sub> = V² / R<sub>x</sub>', 'P<sub>T</sub> = P<sub>1</sub> + P<sub>2</sub> + … (same rule as series!)'],
      solution: [...Ps.map((p, i) => `P<sub>${i + 1}</sub> = ${Vs}² / ${eng(Rs[i], 'Ω')} = ${eng(p, 'W')}`), `P<sub>T</sub> = <b>${eng(PT, 'W')}</b>`] });
  },
  quiz() {
    return bank([
      ['In a parallel circuit, each resistor has the same…', 'voltage', ['current', 'power', 'all of these'], 'Parallel = same voltage across every branch.'],
      ['If one resistor is <b>removed</b> from a parallel circuit, R<sub>T</sub>…', 'increases', ['decreases', 'remains the same', 'doubles'], 'Fewer paths for current → harder for it to flow → R_T goes up.'],
      ['I<sub>T</sub> = 100 mA in a 3-branch parallel circuit. Two branches are 40 mA and 20 mA. The third?', '40 mA', ['60 mA', '20 mA', '160 mA'], 'KCL: 100 − 40 − 20 = 40 mA.'],
      ['Each of four parallel branches dissipates 1 W. Total power?', '4 W', ['1 W', '0.25 W', '16 W'], 'Power always adds: P_T = sum.'],
      ['A sudden <b>decrease</b> in total current in a parallel circuit may mean…', 'an open branch or a drop in source voltage', ['a short', 'a new branch was added', 'nothing'], 'Open branch → fewer paths → less current. Or the source sagged.'],
      ['R<sub>T</sub> of a parallel circuit is always…', 'less than the smallest resistor', ['more than the largest', 'equal to the average', 'the sum of all'], 'Every extra path makes it easier for current.'],
      ['One bulb in a parallel lighting circuit burns out. The others…', 'stay lit', ['all go out', 'get dimmer', 'get much brighter'], 'Each has its own path. That\'s why houses are wired in parallel.'],
      ['A short in one parallel branch will…', 'draw huge current and blow the fuse', ['only affect that branch', 'lower the current', 'have no effect'], 'A short across the whole parallel group shorts the source.'],
      ['Two current sources can NOT be connected in…', 'series', ['parallel', 'the same direction', 'opposite directions'], 'Current sources add in parallel (algebraically). Series is not allowed.'],
      ['An ideal current source has an internal resistance of…', 'infinity', ['zero', '50 Ω', '1 Ω'], 'Opposite of the ideal voltage source (zero).'],
      ['Household lights and outlets are wired in…', 'parallel', ['series', 'series-parallel', 'neither'], 'So each gets the full 120 V.'],
      ['Total conductance in parallel is…', 'G<sub>T</sub> = G<sub>1</sub> + G<sub>2</sub> + …', ['G<sub>T</sub> = 1/(G<sub>1</sub> + G<sub>2</sub>)', 'G<sub>T</sub> = G<sub>1</sub> × G<sub>2</sub>', 'the smallest G'], 'Conductances add in parallel — that\'s where 1/R_T = 1/R1 + 1/R2 comes from.'],
    ]);
  },
};

// =====================================================================
// UNIT 6 — Combination circuits
// =====================================================================
const G6 = {
  combo() {
    let R1, R2, R3, Vs;
    if (Math.random() < 0.25) { R1 = 100; R2 = 270; R3 = 390; Vs = 52; }
    else { R1 = stdR(2, 3); R2 = stdR(2, 3); R3 = stdR(2, 3); Vs = pick([10, 12, 15, 20, 24]); }
    const Rp = par(R2, R3), RT = R1 + Rp, IT = Vs / RT, V1 = IT * R1, Vp = Vs - V1;
    return multi('Solve the whole circuit, step by step.', [
      { label: 'R2 ∥ R3', answer: Rp, unit: 'Ω' },
      { label: 'R<sub>T</sub>', answer: RT, unit: 'Ω' },
      { label: 'I<sub>T</sub>', answer: IT, unit: 'A' },
      { label: 'V<sub>R1</sub>', answer: V1, unit: 'V' },
      { label: 'V<sub>R2</sub> = V<sub>R3</sub>', answer: Vp, unit: 'V' },
      { label: 'I<sub>R2</sub>', answer: Vp / R2, unit: 'A' },
      { label: 'I<sub>R3</sub>', answer: Vp / R3, unit: 'A' },
    ], {
      fig: comboSVG({ Vs, R1: { label: 'R1', value: R1 }, R2: { label: 'R2', value: R2 }, R3: { label: 'R3', value: R3 } }),
      hints: ['Follow the current: all of I<sub>T</sub> goes through R1, then splits into R2 and R3. So R2 ∥ R3, in series with R1.',
        'Shrink it: R2 ∥ R3 → one resistor. Add R1. Then Ohm\'s law for I<sub>T</sub>.', 'Work back out: V<sub>R1</sub> = I<sub>T</sub>R1, KVL gives the parallel voltage, then Ohm\'s law for each branch.'],
      solution: [`R2 ∥ R3 = (${R2}·${R3})/(${R2}+${R3}) = ${eng(Rp, 'Ω')}`, `R<sub>T</sub> = ${eng(R1, 'Ω')} + ${eng(Rp, 'Ω')} = ${eng(RT, 'Ω')}`,
        `I<sub>T</sub> = ${Vs}/${eng(RT, 'Ω')} = ${eng(IT, 'A')}`, `V<sub>R1</sub> = ${eng(IT, 'A')} × ${eng(R1, 'Ω')} = ${eng(V1, 'V')}`,
        `V<sub>par</sub> = ${Vs} − ${sig(V1, 3)} = ${eng(Vp, 'V')}`, `I<sub>R2</sub> = ${eng(Vp / R2, 'A')}, I<sub>R3</sub> = ${eng(Vp / R3, 'A')}  (they add to I<sub>T</sub> ✔)`],
      tip: 'Shrink the circuit down, then expand it back out.' });
  },

  rt() {
    const R1 = stdR(2, 3), R2 = stdR(2, 3), R3 = stdR(2, 3);
    if (Math.random() < 0.5) {
      const RT = R1 + par(R2, R3);
      return num('Find R<sub>T</sub>.', RT, 'Ω', { fig: comboSVG({ Vs: '', R1: { label: 'R1', value: R1 }, R2: { label: 'R2', value: R2 }, R3: { label: 'R3', value: R3 } }),
        hints: ['R2 and R3 share both ends → parallel. R1 carries all the current → series.'], solution: [`R<sub>T</sub> = R1 + (R2 ∥ R3) = ${eng(R1, 'Ω')} + ${eng(par(R2, R3), 'Ω')} = <b>${eng(RT, 'Ω')}</b>`] });
    }
    const RT = par(R1 + R2, R3);
    return num('Find R<sub>T</sub>.', RT, 'Ω', { fig: seriesInBranchSVG({ Vs: '', R1: { label: 'R1', value: R1 }, R2: { label: 'R2', value: R2 }, R3: { label: 'R3', value: R3 } }),
      hints: ['R1 and R2 are stacked in the same branch → series first.', 'That pair is in parallel with R3.'],
      solution: [`R1 + R2 = ${eng(R1 + R2, 'Ω')}`, `(${eng(R1 + R2, 'Ω')}) ∥ ${eng(R3, 'Ω')} = <b>${eng(RT, 'Ω')}</b>`] });
  },

  identify() {
    if (Math.random() < 0.5) {
      return mcq('Which statement is true for this circuit?', 'R2 is in parallel with R3', ['R1 is in parallel with R2', 'R1, R2 and R3 are all in series', 'R1 is in parallel with R3'], {
        fig: comboSVG({ Vs: '', R1: { label: 'R1', value: '' }, R2: { label: 'R2', value: '' }, R3: { label: 'R3', value: '' } }),
        solution: ['R2 and R3 connect to the same two nodes → parallel. R1 carries the total current → in series with that pair.'] });
    }
    return mcq('Which statement is true for this circuit?', 'R1 is in series with R2, and that pair is in parallel with R3', ['R1 is in parallel with R2', 'All three are in parallel', 'R3 is in series with R1'], {
      fig: seriesInBranchSVG({ Vs: '', R1: { label: 'R1', value: '' }, R2: { label: 'R2', value: '' }, R3: { label: 'R3', value: '' } }),
      solution: ['R1 and R2 are in the same branch (one path) → series. That branch and R3 share the top and bottom rails → parallel.'] });
  },

  loaded() {
    const R = pick([1, 2.2, 4.7, 10]) * 1000, Vs = pick([10, 12, 20]);
    const RL = R * pick([1, 2, 10, 100]);
    const unl = Vs / 2, Rp = par(R, RL), ld = Vs * Rp / (R + Rp);
    return multi(`A voltage divider with R1 = R2 = ${f(R, 'Ω')} and V<sub>S</sub> = ${Vs} V. A load R<sub>L</sub> = ${f(RL, 'Ω')} is connected across R2.`, [
      { label: 'V<sub>OUT</sub> with no load', answer: unl, unit: 'V' },
      { label: 'R2 ∥ R<sub>L</sub>', answer: Rp, unit: 'Ω' },
      { label: 'V<sub>OUT</sub> with the load', answer: ld, unit: 'V' },
    ], {
      fig: dividerSVG({ Vs, R1: { label: 'R1', value: R }, R2: { label: 'R2', value: R }, RL: { label: 'RL', value: RL } }),
      hints: ['No load: equal resistors split the voltage in half.', 'The load is in parallel with R2, so it lowers the bottom resistance.', 'Divider again: V<sub>OUT</sub> = V<sub>S</sub> × (R2∥R<sub>L</sub>) / (R1 + R2∥R<sub>L</sub>)'],
      solution: [`Unloaded: ${Vs}/2 = ${unl} V`, `R2 ∥ R<sub>L</sub> = ${eng(Rp, 'Ω')}`, `Loaded: ${Vs} × ${eng(Rp, 'Ω')}/(${eng(R, 'Ω')} + ${eng(Rp, 'Ω')}) = <b>${eng(ld, 'V')}</b>`,
        RL >= 10 * R ? 'R<sub>L</sub> is much bigger than R2, so the loading effect is small.' : 'R<sub>L</sub> is close to R2, so the output drops a lot.'],
      tip: 'The no-load voltage is ALWAYS the higher one.' });
  },

  quiz() {
    return bank([
      ['A series equivalent of a complex circuit can be analyzed with…', 'both the voltage divider rule and KVL', ['only the voltage divider rule', 'only KVL', 'neither'], 'Once it\'s a simple series circuit, all the series tools work.'],
      ['Changing a measured value just by connecting an instrument is called…', 'loading', ['clipping', 'distortion', 'loss of precision'], 'A meter adds its own resistance to the circuit.'],
      ['A DMM voltmeter usually has an internal resistance of about…', '10 MΩ or more', ['0 Ω', '50 Ω', '1 kΩ'], 'High resistance → very little loading (unless the circuit is very high-resistance too).'],
      ['Connecting a load to a voltage divider makes V<sub>OUT</sub>…', 'drop', ['rise', 'stay the same', 'go to zero'], 'The load in parallel with R2 lowers the bottom resistance.'],
      ['Which load causes the LEAST loading on a divider?', 'a load much bigger than R2', ['a load equal to R2', 'a load much smaller than R2', 'a short circuit'], 'Big R_L barely changes R2 ∥ R_L.'],
      ['In a combination circuit, the resistor carrying the total current is…', 'in series with the rest', ['in parallel with the rest', 'shorted', 'open'], 'If ALL the current goes through it, it\'s in series with the source path.'],
      ['First step to find R<sub>T</sub> of a series-parallel circuit?', 'identify what\'s in series and what\'s in parallel', ['add all resistors', 'use product-over-sum on all of them', 'measure the current'], 'Follow the current paths, then reduce piece by piece.'],
    ]);
  },
};

// =====================================================================
export const UNIT_GENERATORS = {
  unit1a: { prefix: ['Prefix conversion', G1A.prefix], toPrefix: ['Add a prefix', G1A.toPrefix], sci: ['Scientific notation', G1A.sci], eng: ['Engineering notation', G1A.eng], arith: ['Metric arithmetic', G1A.arith], multdiv: ['× and ÷ with powers of 10', G1A.multdiv], sigcount: ['Significant digits', G1A.sigcount], round: ['Rounding', G1A.round], quiz: ['Slide quiz', G1A.quiz] },
  unit1b: { decode: ['Colour code → value', G1B.decode], five: ['5-band codes', G1B.five], range: ['Tolerance range', G1B.range], toBands: ['Value → colours', G1B.toBands], conduct: ['Conductance', G1B.conduct], wire: ['Wire resistance', G1B.wire], quiz: ['Slide quiz', G1B.quiz] },
  unit1c: { charge: ['Charge & electrons', G1C.charge], vwq: ['V = W/Q', G1C.vwq], iqt: ['I = Q/t', G1C.iqt], quiz: ['Concepts', G1C.quiz] },
  unit2a: { quiz: ['Circuits, switches & meters', G2A.quiz] },
  unit2b: { solve: ['Ohm\'s law', G2B.solve], word: ['Word problems', G2B.word], ratio: ['Proportions', G2B.ratio], color: ['Colour code + Ohm', G2B.color] },
  unit3a: { rt: ['Series R_T', G3A.rt], current: ['Series current', G3A.current], divider: ['Voltage divider', G3A.divider], kvl: ['KVL', G3A.kvl], table: ['Complete the table', G3A.table], batteries: ['Batteries in series', G3A.batteries], ground: ['Ground reference', G3A.ground], quiz: ['Troubleshooting', G3A.quiz] },
  unit4a: { power: ['Power formulas', G4A.power], kwh: ['kWh', G4A.kwh], joules: ['Joules', G4A.joules], rating: ['Power rating', G4A.rating], ah: ['Battery Ah', G4A.ah], eff: ['Efficiency', G4A.eff], quiz: ['Concepts', G4A.quiz] },
  unit4b: { shell: ['2n² rule', G4B.shell], valence: ['Valence electrons', G4B.valence], classify: ['Conductor or not?', G4B.classify], quiz: ['Concepts', G4B.quiz] },
  unit5: { rt2: ['Product over sum', G5.rt2], rtn: ['Equal resistors', G5.rtn], rt3: ['Three in parallel', G5.rt3], branch: ['Branch currents', G5.branch], kcl: ['KCL', G5.kcl], cdr: ['Current divider', G5.cdr], table: ['Complete the table', G5.table], power: ['Parallel power', G5.power], quiz: ['Concepts & faults', G5.quiz] },
  unit6: { combo: ['Full analysis', G6.combo], rt: ['Combination R_T', G6.rt], identify: ['Spot series vs parallel', G6.identify], loaded: ['Loaded divider', G6.loaded], quiz: ['Concepts', G6.quiz] },
};

/** Build a problem for unit+gen key, tagging it for tracking. */
export function makeProblem(unit, gen) {
  const entry = UNIT_GENERATORS[unit]?.[gen];
  if (!entry) return null;
  const p = entry[1]();
  p.unitId = unit; p.gen = gen; p.skill = entry[0];
  return p;
}

/** Random generator key for a unit; mixes types so it never feels repetitive. */
export function randomGen(unit, avoid) {
  const keys = Object.keys(UNIT_GENERATORS[unit]);
  if (keys.length === 1) return keys[0];
  let k; do { k = pick(keys); } while (k === avoid);
  return k;
}
