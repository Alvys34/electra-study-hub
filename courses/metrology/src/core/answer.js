// answer.js - reading what the student typed and writing numbers the way the shop does (".375", 1-3/8").
export const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));

// Accepts 1-3/8, 1 3/8, 3/8, 1.375, .375, 1,375 with an optional " / in / mm on the end. NaN if it isn't a number.
export function parseNum(raw) {
  const s = String(raw ?? '').trim().toLowerCase()
    .replace(/\s*(mm|inches|inch|in|"|”|″)$/, '').trim().replace(',', '.');
  let m = s.match(/^(\d+)\s*[- ]\s*(\d+)\s*\/\s*(\d+)$/);
  if (m) return +m[1] + m[2] / m[3];
  m = s.match(/^(\d+)\s*\/\s*(\d+)$/);
  if (m) return m[1] / m[2];
  if (/^[-+]?(\d+\.?\d*|\.\d+)$/.test(s)) return parseFloat(s);
  return NaN;
}

export const isFraction = raw => /\d\s*\/\s*\d/.test(String(raw));

// Inch decimals drop the leading zero, like the course sheets: .375, 1.375.
export function fmtIn(v, places = 3) {
  const s = Math.abs(v).toFixed(places);
  return (v < 0 ? '-' : '') + (s.startsWith('0.') ? s.slice(1) : s);
}

export const fmtMm = (v, places = 2) => v.toFixed(places);

export function fmtFrac(whole, num, den) {
  if (!num) return `${whole}"`;
  return whole ? `${whole}-${num}/${den}"` : `${num}/${den}"`;
}

// Simplest fraction for a count of 1/den: (28, 64) -> { whole: 0, num: 7, den: 16 }.
export function simplify(count, den) {
  const whole = Math.floor(count / den), rest = count % den, g = gcd(rest, den) || den;
  return { whole, num: rest / g, den: den / g, g };
}

export const fmtAngle = (deg, min) => `${deg}° ${String(min).padStart(2, '0')}′`;

export const near = (a, b, tol) => Number.isFinite(a) && Math.abs(a - b) <= tol;
