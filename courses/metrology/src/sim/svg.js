// svg.js - tiny string helpers for drawing instruments. Colours come from CSS classes (sv-*) so themes apply.
let uid = 0;
export const nextId = () => `sv${++uid}`;

export const r = n => Math.round(n * 10) / 10;

export const line = (x1, y1, x2, y2, cls = 'sv-tick') =>
  `<line x1="${r(x1)}" y1="${r(y1)}" x2="${r(x2)}" y2="${r(y2)}" class="${cls}"/>`;

export const rect = (x, y, w, h, cls, extra = '') =>
  `<rect x="${r(x)}" y="${r(y)}" width="${r(Math.max(0, w))}" height="${r(Math.max(0, h))}" class="${cls}" ${extra}/>`;

// `rot` counter-rotates a label inside a group turned -90° (the height gage), so the text stays upright.
export const text = (x, y, s, cls = 'sv-lbl', anchor = 'middle', rot = false) =>
  `<text x="${r(x)}" y="${r(y)}" class="${cls}" text-anchor="${anchor}"${rot ? ` transform="rotate(90 ${r(x)} ${r(y)})" dominant-baseline="middle"` : ''}>${s}</text>`;

export const hatch = id =>
  `<pattern id="${id}" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">` +
  `<rect width="9" height="9" class="sv-part"/><line x1="0" y1="0" x2="0" y2="9" class="sv-part-line"/></pattern>`;

export const svg = (w, h, body, label) =>
  `<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="${label}" xmlns="http://www.w3.org/2000/svg">${body}</svg>`;
