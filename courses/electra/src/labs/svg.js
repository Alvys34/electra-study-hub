// svg.js - small, clean schematic symbols for the lab diagrams. Every symbol is drawn on a plain grid
// with axis-aligned leads, coloured only through CSS classes, so the same drawing works in light and dark.
// `t` on any symbol is a list of highlight tags ('ga', 'gb', 'gc', 'gd'); a figure lights a tag up by
// setting data-show on its wrapper.

const BODY = 44;   // resistor body length
const AMP = 7;     // zigzag half height

const cls = (base, t) => `${base}${t ? ' ' + t : ''}`;
export const sub = s => String(s)
  .replace(/_\{([^}]+)\}/g, '<tspan class="sb" dy="4">$1</tspan><tspan dy="-4">&#8203;</tspan>')
  .replace(/_(\w)/g, '<tspan class="sb" dy="4">$1</tspan><tspan dy="-4">&#8203;</tspan>');

function lead(x1, y1, x2, y2, t) { return `<path class="${cls('w', t)}" d="M${x1},${y1} L${x2},${y2}"/>`; }

export function wire(pts, t = '') {
  const d = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0]},${p[1]}`).join(' ');
  return `<path class="${cls('w', t)}" d="${d}"/>`;
}
export function probe(pts, pol = '+') {
  const d = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0]},${p[1]}`).join(' ');
  return `<path class="probe ${pol === '+' ? 'pos' : 'neg'}" d="${d}"/>`;
}
export const dot = (x, y, t = '') => `<circle class="${cls('nd', t)}" cx="${x}" cy="${y}" r="3.6"/>`;
export const node = (x, y, name, dx = -10, dy = -8, anchor = 'end') =>
  `<circle class="nd" cx="${x}" cy="${y}" r="3.6"/><text class="nl" x="${x + dx}" y="${y + dy}" text-anchor="${anchor}">${name}</text>`;
export const text = (x, y, s, c = 'lb', anchor = 'middle') => `<text class="${c}" x="${x}" y="${y}" text-anchor="${anchor}">${sub(s)}</text>`;

/** Resistor between two points on one axis. o: { name, val, side: 'a'|'b' (label side), t } */
export function res(x1, y1, x2, y2, o = {}) {
  const t = o.t || '';
  const horiz = y1 === y2;
  const len = horiz ? x2 - x1 : y2 - y1;
  const s0 = (len - BODY) / 2;
  let d;
  if (horiz) {
    d = `M${x1 + s0},${y1}`;
    for (let i = 0; i < 6; i++) d += ` L${x1 + s0 + (BODY / 6) * (i + 0.5)},${y1 + (i % 2 ? AMP : -AMP)}`;
    d += ` L${x1 + s0 + BODY},${y1}`;
  } else {
    d = `M${x1},${y1 + s0}`;
    for (let i = 0; i < 6; i++) d += ` L${x1 + (i % 2 ? AMP : -AMP)},${y1 + s0 + (BODY / 6) * (i + 0.5)}`;
    d += ` L${x1},${y1 + s0 + BODY}`;
  }
  const leads = horiz
    ? lead(x1, y1, x1 + s0, y1, t) + lead(x1 + s0 + BODY, y1, x2, y2, t)
    : lead(x1, y1, x1, y1 + s0, t) + lead(x1, y1 + s0 + BODY, x2, y2, t);
  let labels = '';
  if (horiz) {
    const cx = (x1 + x2) / 2;
    const up = o.side !== 'b';
    labels = text(cx, up ? y1 - 15 : y1 + 26, o.name || '', 'lb') + (o.val ? text(cx, up ? y1 + 26 : y1 + 43, o.val, 'lv') : '');
  } else {
    const cy = (y1 + y2) / 2;
    const left = o.side === 'a';
    const x = left ? x1 - 14 : x1 + 14;
    const an = left ? 'end' : 'start';
    labels = text(x, cy - 3, o.name || '', 'lb', an) + (o.val ? text(x, cy + 15, o.val, 'lv', an) : '');
  }
  return `<g class="${cls('el', t)}">${leads}<path class="${cls('rz', t)}" d="${d}"/>${labels}</g>`;
}

/** Resistor at any angle (for wye and delta drawings). Labels are placed by the caller. */
export function rres(x1, y1, x2, y2, t = '') {
  const len = Math.hypot(x2 - x1, y2 - y1), ang = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
  const s0 = (len - BODY) / 2;
  let d = `M0,0 L${s0},0`;
  for (let i = 0; i < 6; i++) d += ` L${s0 + (BODY / 6) * (i + 0.5)},${i % 2 ? AMP : -AMP}`;
  d += ` L${s0 + BODY},0 L${len},0`;
  return `<g class="${cls('el', t)}" transform="translate(${x1},${y1}) rotate(${ang})"><path class="${cls('rz', t)}" d="${d}"/></g>`;
}

/** Capacitor. Plates sit at the middle of the segment. o: { name, val, polar, plus: 'start'|'end', side, t } */
export function cap(x1, y1, x2, y2, o = {}) {
  const t = o.t || '';
  const horiz = y1 === y2;
  const gap = 5, w = 15;
  let g = '';
  if (horiz) {
    const cx = (x1 + x2) / 2;
    g += lead(x1, y1, cx - gap, y1, t) + lead(cx + gap, y1, x2, y2, t);
    g += `<path class="${cls('pl', t)}" d="M${cx - gap},${y1 - w} L${cx - gap},${y1 + w}"/>`;
    g += o.polar
      ? `<path class="${cls('pl', t)}" d="M${cx + gap + 5},${y1 - w} Q${cx + gap - 2},${y1} ${cx + gap + 5},${y1 + w}"/>`
      : `<path class="${cls('pl', t)}" d="M${cx + gap},${y1 - w} L${cx + gap},${y1 + w}"/>`;
    if (o.polar) g += text(o.plus === 'end' ? cx + 16 : cx - 16, y1 - 10, '+', 'pm');
    g += text(cx, y1 - 24, o.name || '', 'lb') + (o.val ? text(cx, y1 + 34, o.val, 'lv') : '');
  } else {
    const cy = (y1 + y2) / 2;
    const plusTop = o.plus !== 'end';
    const yA = cy - gap, yB = cy + gap;
    g += lead(x1, y1, x1, yA, t) + lead(x1, yB, x2, y2, t);
    const flat = plusTop ? yA : yB, curved = plusTop ? yB : yA;
    g += `<path class="${cls('pl', t)}" d="M${x1 - w},${flat} L${x1 + w},${flat}"/>`;
    g += o.polar
      ? `<path class="${cls('pl', t)}" d="M${x1 - w},${curved + (plusTop ? 5 : -5)} Q${x1},${curved + (plusTop ? -2 : 2)} ${x1 + w},${curved + (plusTop ? 5 : -5)}"/>`
      : `<path class="${cls('pl', t)}" d="M${x1 - w},${curved} L${x1 + w},${curved}"/>`;
    if (o.polar) g += text(x1 - 22, plusTop ? yA - 6 : yB + 16, '+', 'pm');
    const left = o.side === 'a';
    const x = left ? x1 - 24 : x1 + 22, an = left ? 'end' : 'start';
    g += text(x, cy - 3, o.name || '', 'lb', an) + (o.val ? text(x, cy + 15, o.val, 'lv', an) : '');
  }
  return `<g class="${cls('el', t)}">${g}</g>`;
}

/** DC source, vertical, + at the top. */
export function battery(x, yTop, yBot, o = {}) {
  const cy = (yTop + yBot) / 2;
  const t = o.t || '';
  let g = lead(x, yTop, x, cy - 9, t) + lead(x, cy + 9, x, yBot, t);
  g += `<path class="pl" d="M${x - 17},${cy - 9} L${x + 17},${cy - 9}"/><path class="pl thick" d="M${x - 9},${cy - 3} L${x + 9},${cy - 3}"/>`;
  g += `<path class="pl" d="M${x - 17},${cy + 3} L${x + 17},${cy + 3}"/><path class="pl thick" d="M${x - 9},${cy + 9} L${x + 9},${cy + 9}"/>`;
  g += text(x + 24, cy - 12, '+', 'pm', 'start') + text(x + 24, cy + 22, '−', 'pm', 'start');
  const an = o.side === 'b' ? 'start' : 'end', lx = o.side === 'b' ? x + 40 : x - 26;
  g += text(lx, cy - 2, o.name || 'V_s', 'lb', an) + (o.val ? text(lx, cy + 16, o.val, 'lv', an) : '');
  return `<g class="el src">${g}</g>`;
}

/** AC source (function generator), vertical. */
export function acsrc(x, yTop, yBot, o = {}) {
  const cy = (yTop + yBot) / 2, r = 17;
  let g = lead(x, yTop, x, cy - r) + lead(x, cy + r, x, yBot);
  g += `<circle class="pl" cx="${x}" cy="${cy}" r="${r}" fill="none"/>`;
  g += `<path class="pl" d="M${x - 10},${cy + 2} C${x - 5},${cy - 10} ${x},${cy - 10} ${x},${cy + 2} S${x + 5},${cy + 14} ${x + 10},${cy + 2}"/>`;
  g += text(x - 6, cy - r - 4, '+', 'pm', 'end');
  g += text(x - 26, cy - 2, o.name || 'V_s', 'lb', 'end') + (o.val ? text(x - 26, cy + 16, o.val, 'lv', 'end') : '');
  return `<g class="el src">${g}</g>`;
}

/** Push-button / toggle switch, horizontal. */
export function sw(x1, y, x2, o = {}) {
  const cx = (x1 + x2) / 2, a = cx - 16, b = cx + 16;
  let g = lead(x1, y, a - 3, y) + lead(b + 3, y, x2, y);
  g += `<circle class="sw-c" cx="${a}" cy="${y}" r="3.5"/><circle class="sw-c" cx="${b}" cy="${y}" r="3.5"/>`;
  g += o.closed
    ? `<path class="pl sw-l" d="M${a},${y} L${b},${y - 1}"/>`
    : `<path class="pl sw-l" d="M${a + 2},${y - 2} L${b + 1},${y - 15}"/>`;
  g += text(cx, y - 24, o.name || 'S', 'lb');
  return `<g class="el ${o.closed ? 'is-closed' : ''}" data-sw="${o.id || ''}">${g}</g>`;
}

/** LED. dir: 'r' | 'l' | 'd' | 'u' = direction conventional current flows (anode to cathode). */
export function led(x1, y1, x2, y2, o = {}) {
  const horiz = y1 === y2;
  const cx = (x1 + x2) / 2, cy = (y1 + y2) / 2, s = 11;
  let g = '';
  let tri, bar, rays;
  if (horiz) {
    const r = o.dir !== 'l';
    g += lead(x1, y1, cx - s, cy) + lead(cx + s, cy, x2, y2);
    tri = r ? `M${cx - s},${cy - s} L${cx - s},${cy + s} L${cx + s},${cy} Z` : `M${cx + s},${cy - s} L${cx + s},${cy + s} L${cx - s},${cy} Z`;
    bar = r ? `M${cx + s},${cy - s} L${cx + s},${cy + s}` : `M${cx - s},${cy - s} L${cx - s},${cy + s}`;
    rays = `M${cx - 2},${cy - 14} l9,-11 m-5,0 l5,0 l0,5 M${cx + 6},${cy - 12} l9,-11 m-5,0 l5,0 l0,5`;
    g += text(cx, cy - 32, o.name || 'LED', 'lb');
  } else {
    const d = o.dir !== 'u';
    g += lead(x1, y1, cx, cy - s) + lead(cx, cy + s, x2, y2);
    tri = d ? `M${cx - s},${cy - s} L${cx + s},${cy - s} L${cx},${cy + s} Z` : `M${cx - s},${cy + s} L${cx + s},${cy + s} L${cx},${cy - s} Z`;
    bar = d ? `M${cx - s},${cy + s} L${cx + s},${cy + s}` : `M${cx - s},${cy - s} L${cx + s},${cy - s}`;
    rays = `M${cx + 14},${cy - 2} l11,-9 m-5,0 l5,0 l0,5 M${cx + 14},${cy + 7} l11,-9 m-5,0 l5,0 l0,5`;
    g += text(cx + 30, cy + 22, o.name || 'LED', 'lb', 'start');
  }
  g += `<path class="led-glow" d="${tri}"/><path class="led-b" d="${tri}"/><path class="pl" d="${bar}"/><path class="led-r" d="${rays}"/>`;
  return `<g class="el led" data-led="${o.id || ''}">${g}</g>`;
}

export function ground(x, y) {
  return `<g class="el"><path class="w" d="M${x},${y} L${x},${y + 8}"/><path class="pl" d="M${x - 13},${y + 8} L${x + 13},${y + 8} M${x - 8},${y + 13} L${x + 8},${y + 13} M${x - 3},${y + 18} L${x + 3},${y + 18}"/></g>`;
}

/** Meter face (V, A, Ω) with + and − terminals at its bottom. */
export function meter(x, y, letter, name = 'DMM') {
  return `<g class="el meter"><rect class="mtr" x="${x - 28}" y="${y - 22}" width="56" height="44" rx="8"/>
    <text class="mtr-l" x="${x}" y="${y + 6}" text-anchor="middle">${letter}</text>
    <text class="lv" x="${x}" y="${y - 28}" text-anchor="middle">${name}</text>
    <circle class="term pos" cx="${x - 14}" cy="${y + 22}" r="4"/><circle class="term neg" cx="${x + 14}" cy="${y + 22}" r="4"/>
    <text class="pm" x="${x - 14}" y="${y + 40}" text-anchor="middle">+</text><text class="pm" x="${x + 14}" y="${y + 40}" text-anchor="middle">−</text></g>`;
}

/** Current arrow on a wire. dir: r l u d. */
export function arrow(x, y, dir, label = '', t = '') {
  const s = 7;
  const p = {
    r: `M${x - s},${y - s} L${x + s},${y} L${x - s},${y + s} Z`,
    l: `M${x + s},${y - s} L${x - s},${y} L${x + s},${y + s} Z`,
    d: `M${x - s},${y - s} L${x},${y + s} L${x + s},${y - s} Z`,
    u: `M${x - s},${y + s} L${x},${y - s} L${x + s},${y + s} Z`,
  }[dir];
  const lp = { r: [x, y - 12, 'middle'], l: [x, y - 12, 'middle'], d: [x + 12, y + 4, 'start'], u: [x + 12, y + 4, 'start'] }[dir];
  return `<g class="cur ${t}"><path class="ia" d="${p}"/>${label ? text(lp[0], lp[1], label, 'il', lp[2]) : ''}</g>`;
}

/** Animated current path (shown only when motion is on and the figure asks for it). */
export const flow = (pts, t = '') => `<path class="flow ${t}" d="${pts.map((p, i) => `${i ? 'L' : 'M'}${p[0]},${p[1]}`).join(' ')}"/>`;

/** Wrap a drawing. */
export function svg(w, h, body, label) {
  return `<svg class="sch" viewBox="0 0 ${w} ${h}" role="img" aria-label="${label}" preserveAspectRatio="xMidYMid meet">${body}</svg>`;
}
