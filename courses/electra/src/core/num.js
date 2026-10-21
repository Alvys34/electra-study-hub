// num.js - engineering-number formatting and forgiving answer parsing

const PREFIXES = [
  { p: 'T', e: 12 }, { p: 'G', e: 9 }, { p: 'M', e: 6 }, { p: 'k', e: 3 },
  { p: '', e: 0 }, { p: 'm', e: -3 }, { p: 'µ', e: -6 }, { p: 'n', e: -9 }, { p: 'p', e: -12 }
];

const PREFIX_MULT = { T: 1e12, G: 1e9, M: 1e6, k: 1e3, K: 1e3, m: 1e-3, u: 1e-6, 'µ': 1e-6, 'μ': 1e-6, n: 1e-9, p: 1e-12 };

/** Round to `sig` significant figures and strip trailing zeros. */
export function sig(x, s = 3) {
  if (x === 0 || !isFinite(x)) return String(x);
  const v = Number(x.toPrecision(s));
  // avoid exponent strings for normal magnitudes
  if (Math.abs(v) >= 1e-4 && Math.abs(v) < 1e15) {
    return String(parseFloat(v.toFixed(12)));
  }
  return String(v);
}

/** Format with an engineering prefix: 4700, 'Ω' -> '4.7 kΩ' */
export function eng(x, unit = '', s = 3) {
  if (x === 0) return `0 ${unit}`.trim();
  if (!isFinite(x)) return '∞ ' + unit;
  const a = Math.abs(x);
  let chosen = PREFIXES[PREFIXES.length - 1];
  for (const pr of PREFIXES) {
    if (a >= Math.pow(10, pr.e) * 0.9995) { chosen = pr; break; }
  }
  const m = x / Math.pow(10, chosen.e);
  return `${sig(m, s)} ${chosen.p}${unit}`.trim();
}

/** Plain number with thousands separators (for Ω values like 12,000) */
export function plain(x, s = 4) {
  const v = Number(sig(x, s));
  return v.toLocaleString('en-US', { maximumFractionDigits: 10 });
}

/** Superscript an integer exponent: -3 -> ⁻³ */
export function sup(n) {
  const map = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' };
  return String(n).split('').map(c => map[c] ?? c).join('');
}

const UNIT_TOKENS = ['ohms', 'ohm', 'Ω', 'Ω', 'volts', 'volt', 'amps', 'amp', 'watts', 'watt', 'joules', 'joule',
  'siemens', 'coulombs', 'coulomb', 'hours', 'hour', 'hrs', 'hr', 'Wh', 'CM', 'cmil', 'mils', 'V', 'A', 'W', 'J', 'S', 'C', 'h', '%', 'F', 'H', 's', 'N'];

/**
 * Parse what a student typed into a number.
 * Accepts: 4700, 4.7k, 4.7 kΩ, 4.7e3, 4.7x10^3, 4,700, 600mA, 1/4, .5
 * If fixedUnit is given (e.g. 'kΩ' or 'kWh'), it's stripped and NO prefix scaling is applied.
 * Returns NaN if it can't make sense of it.
 */
export function parseAnswer(raw, fixedUnit = null) {
  if (raw == null) return NaN;
  let s = String(raw).trim().replace(/\s+/g, ' ');
  if (!s) return NaN;
  s = s.replace(/−/g, '-').replace(/×/g, 'x');
  // remove thousands separators like 12,000 (but keep decimals)
  if (/^\-?\d{1,3}(,\d{3})+(\.\d+)?/.test(s)) s = s.replace(/,/g, '');
  else s = s.replace(',', '.');

  if (fixedUnit) {
    const fu = fixedUnit.toLowerCase();
    if (s.toLowerCase().endsWith(fu)) s = s.slice(0, s.length - fu.length).trim();
  }
  // strip a trailing unit word
  for (const t of UNIT_TOKENS) {
    if (s.endsWith(t) && s.length > t.length) {
      const before = s.slice(0, s.length - t.length);
      // don't strip if it would leave nothing numeric
      if (/[\d.]\s*[a-zA-Zµμ]?\s*$/.test(before)) { s = before.trim(); break; }
    }
  }
  // fractions like 1/4
  const frac = s.match(/^(-?\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)$/);
  if (frac) return parseFloat(frac[1]) / parseFloat(frac[2]);

  const m = s.match(/^([-+]?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?)\s*(?:(?:x|\*)\s*10\s*\^?\s*\(?\s*([-+]?\d+)\s*\)?)?\s*([TGMkKmuµμnp])?$/);
  if (!m) return NaN;
  let v = parseFloat(m[1]);
  if (m[2] !== undefined) v *= Math.pow(10, parseInt(m[2], 10));
  if (m[3]) {
    if (fixedUnit) return NaN; // prefix not allowed when the unit is fixed
    v *= PREFIX_MULT[m[3]];
  }
  return v;
}

/** Is `got` within relative tolerance of `want`? */
export function close(got, want, tol = 0.02) {
  if (!isFinite(got)) return false;
  if (want === 0) return Math.abs(got) < 1e-9;
  return Math.abs(got - want) / Math.abs(want) <= tol;
}

// ---------- random helpers ----------
export const rnd = (a, b) => a + Math.random() * (b - a);
export const rint = (a, b) => Math.floor(rnd(a, b + 1));
export const pick = arr => arr[Math.floor(Math.random() * arr.length)];
export function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
export const E12 = [10, 12, 15, 18, 22, 27, 33, 39, 47, 56, 68, 82];
/** A standard resistor value between lo and hi decades, e.g. stdR(1,3) -> 10Ω .. 82kΩ */
export function stdR(minExp = 1, maxExp = 3) {
  const e = rint(minExp, maxExp);
  return pick(E12) * Math.pow(10, e - 1);
}
