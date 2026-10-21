// schematic.js - tiny SVG circuit-diagram builder (series, parallel, combination)
import { eng } from './num.js';

const lbl = r => (typeof r === 'object' ? r : { label: '', value: r });

function zigH(x0, x1, y) {
  const lead = (x1 - x0 - 48) / 2;
  let d = `M${x0},${y} L${x0 + lead},${y}`;
  const step = 48 / 6;
  for (let i = 0; i < 6; i++) d += ` L${x0 + lead + step * (i + 0.5)},${y + (i % 2 ? 7 : -7)}`;
  d += ` L${x0 + lead + 48},${y} L${x1},${y}`;
  return d;
}
function zigV(x, y0, y1) {
  const lead = (y1 - y0 - 48) / 2;
  let d = `M${x},${y0} L${x},${y0 + lead}`;
  const step = 48 / 6;
  for (let i = 0; i < 6; i++) d += ` L${x + (i % 2 ? 7 : -7)},${y0 + lead + step * (i + 0.5)}`;
  d += ` L${x},${y0 + lead + 48} L${x},${y1}`;
  return d;
}

function resH(x0, x1, y, r, cls = '') {
  const { label, value, hide, note } = lbl(r);
  const v = hide ? '?' : (typeof value === 'number' ? eng(value, 'Ω') : value ?? '');
  return `<path class="r ${cls}" d="${zigH(x0, x1, y)}"/>
    <text x="${(x0 + x1) / 2}" y="${y - 14}" class="tl">${label}</text>
    <text x="${(x0 + x1) / 2}" y="${y + 24}" class="tv">${v}</text>${note ? `<text x="${(x0 + x1) / 2}" y="${y + 41}" class="tn">${note}</text>` : ''}`;
}
function resV(x, y0, y1, r, cls = '') {
  const { label, value, hide, note } = lbl(r);
  const v = hide ? '?' : (typeof value === 'number' ? eng(value, 'Ω') : value ?? '');
  return `<path class="r ${cls}" d="${zigV(x, y0, y1)}"/>
    <text x="${x + 13}" y="${(y0 + y1) / 2 - 6}" class="tl" text-anchor="start">${label}</text>
    <text x="${x + 13}" y="${(y0 + y1) / 2 + 14}" class="tv" text-anchor="start">${v}</text>${note ? `<text x="${x + 13}" y="${(y0 + y1) / 2 + 31}" class="tn" text-anchor="start">${note}</text>` : ''}`;
}
function battery(x, yTop, yBot, vs) {
  const mid = (yTop + yBot) / 2;
  const v = typeof vs === 'number' ? eng(vs, 'V') : (vs ?? '');
  return `<path class="w" d="M${x},${yTop} L${x},${mid - 8} M${x},${mid + 8} L${x},${yBot}"/>
    <line class="bat" x1="${x - 16}" y1="${mid - 8}" x2="${x + 16}" y2="${mid - 8}"/>
    <line class="bat thick" x1="${x - 9}" y1="${mid + 8}" x2="${x + 9}" y2="${mid + 8}"/>
    <text x="${x + 22}" y="${mid - 10}" class="tp">+</text>
    <text x="${x - 30}" y="${mid + 5}" class="tv" text-anchor="end">${v}</text>`;
}
const wrap = (w, h, inner) => `<svg class="sch" viewBox="0 0 ${w} ${h}" role="img" aria-label="circuit diagram">${inner}</svg>`;

/** Series loop: up to 3 on top, 1 on the right, rest on the bottom. */
export function seriesSVG({ Vs, Rs, ground = false }) {
  const W = 440, H = 230, L = 70, R = 400, T = 50, B = 190;
  let s = battery(L, T, B, Vs);
  const top = Rs.slice(0, 3), right = Rs[3], bottom = Rs.slice(4);
  const seg = (R - L) / top.length;
  top.forEach((r, i) => {
    const x0 = L + seg * i, x1 = L + seg * (i + 1);
    const pad = Math.max(0, (seg - 90) / 2);
    s += `<path class="w" d="M${x0},${T} L${x0 + pad},${T} M${x1 - pad},${T} L${x1},${T}"/>`;
    s += resH(x0 + pad, x1 - pad, T, r);
  });
  if (right) s += resV(R, T, B, right);
  else s += `<path class="w" d="M${R},${T} L${R},${B}"/>`;
  if (bottom.length) {
    const bs = (R - L) / bottom.length;
    bottom.forEach((r, i) => {
      const x0 = R - bs * i, x1 = R - bs * (i + 1);
      const pad = Math.max(0, (bs - 90) / 2);
      s += `<path class="w" d="M${x0},${B} L${x0 - pad},${B} M${x1 + pad},${B} L${x1},${B}"/>`;
      s += resH(x1 + pad, x0 - pad, B, r);
    });
  } else s += `<path class="w" d="M${L},${B} L${R},${B}"/>`;
  if (ground) s += `<path class="w" d="M${L},${B} L${L},${B + 12} M${L - 12},${B + 12} L${L + 12},${B + 12} M${L - 7},${B + 17} L${L + 7},${B + 17} M${L - 3},${B + 22} L${L + 3},${B + 22}"/>`;
  return wrap(W, H + (ground ? 10 : 0), s);
}

/** Parallel branches between a top and bottom rail. open = index of a broken branch */
export function parallelSVG({ Vs, Rs, open = -1 }) {
  const n = Rs.length;
  const L = 70, T = 40, B = 200, gap = 105;
  const W = L + 60 + gap * n;
  const R = L + gap * n;
  let s = battery(L, T, B, Vs);
  s += `<path class="w" d="M${L},${T} L${R},${T} M${L},${B} L${R},${B}"/>`;
  Rs.forEach((r, i) => {
    const x = L + gap * (i + 1);
    s += `<circle class="node" cx="${x}" cy="${T}" r="3"/><circle class="node" cx="${x}" cy="${B}" r="3"/>`;
    if (i === open) {
      s += `<path class="w" d="M${x},${T} L${x},${T + 30}"/>${resV(x, T + 30, B - 30, r, 'dead')}<path class="w" d="M${x},${B - 30} L${x},${B - 12}"/>
        <text x="${x}" y="${B - 2}" class="tx" text-anchor="middle">✕ open</text>`;
    } else {
      s += `<path class="w" d="M${x},${T} L${x},${T + 30} M${x},${B - 30} L${x},${B}"/>${resV(x, T + 30, B - 30, r)}`;
    }
  });
  return wrap(W, 240, s);
}

/** R1 in series with (R2 || R3)  — the classic combination circuit */
export function comboSVG({ Vs, R1, R2, R3, RL }) {
  const L = 70, T = 40, B = 200, xa = 250, xb = 360, xc = 460;
  let s = battery(L, T, B, Vs);
  s += `<path class="w" d="M${L},${T} L${100},${T}"/>` + resH(100, 210, T, R1) + `<path class="w" d="M210,${T} L${RL ? xc : (R3 !== undefined ? xb : xa)},${T}"/>`;
  s += `<circle class="node" cx="${xa}" cy="${T}" r="3"/><circle class="node" cx="${xa}" cy="${B}" r="3"/>`;
  s += `<path class="w" d="M${xa},${T} L${xa},${T + 30} M${xa},${B - 30} L${xa},${B}"/>` + resV(xa, T + 30, B - 30, R2);
  if (R3 !== undefined) s += `<path class="w" d="M${xb},${T} L${xb},${T + 30} M${xb},${B - 30} L${xb},${B}"/>` + resV(xb, T + 30, B - 30, R3, R3?.load ? 'load' : '');
  if (RL) s += `<path class="w" d="M${xc},${T} L${xc},${T + 30} M${xc},${B - 30} L${xc},${B}"/>` + resV(xc, T + 30, B - 30, RL, 'load');
  s += `<path class="w" d="M${L},${B} L${RL ? xc : (R3 !== undefined ? xb : xa)},${B}"/>`;
  return wrap(RL ? 560 : (R3 !== undefined ? 460 : 360), 240, s);
}

/** (R1 + R2) in one branch, R3 in the other */
export function seriesInBranchSVG({ Vs, R1, R2, R3 }) {
  const L = 70, T = 40, B = 210, xa = 200, xb = 330;
  let s = battery(L, T, B, Vs);
  s += `<path class="w" d="M${L},${T} L${xb},${T} M${L},${B} L${xb},${B}"/>`;
  s += `<path class="w" d="M${xa},${T} L${xa},${T + 10}"/>` + resV(xa, T + 10, (T + B) / 2, R1) + resV(xa, (T + B) / 2, B - 10, R2) + `<path class="w" d="M${xa},${B - 10} L${xa},${B}"/>`;
  s += `<path class="w" d="M${xb},${T} L${xb},${T + 40} M${xb},${B - 40} L${xb},${B}"/>` + resV(xb, T + 40, B - 40, R3);
  return wrap(420, 250, s);
}

/** Voltage divider with optional load across R2 (output at node A) */
export function dividerSVG({ Vs, R1, R2, RL }) {
  const load = RL === undefined ? undefined : (typeof RL === 'object' ? { ...RL, load: true } : { label: 'R<tspan dy="3" font-size="10">L</tspan>', value: RL, load: true });
  return comboSVG({ Vs, R1, R2, R3: load }).replace('</svg>',
    `<text x="250" y="28" class="tl" text-anchor="middle">A (Vout)</text></svg>`);
}

/** Simple resistor drawing with colour bands */
export function resistorBandsSVG(bandHexes, width = 300) {
  const n = bandHexes.length;
  const body = { x: 70, w: 160 };
  const xs = n === 4 ? [92, 120, 148, 205] : [88, 110, 132, 154, 205];
  const bands = bandHexes.map((hex, i) => `<rect x="${xs[i]}" y="22" width="13" height="56" rx="2" fill="${hex}" stroke="rgba(0,0,0,.35)"/>`).join('');
  return `<svg class="res-svg" viewBox="0 0 300 100" width="${width}">
    <line x1="0" y1="50" x2="300" y2="50" stroke="#94a3b8" stroke-width="5" stroke-linecap="round"/>
    <rect x="${body.x}" y="18" width="${body.w}" height="64" rx="26" fill="#e9d8a6" stroke="#b08d57" stroke-width="2"/>
    ${bands}
  </svg>`;
}
