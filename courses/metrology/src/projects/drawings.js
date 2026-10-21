// drawings.js - shop drawings of the random parts, in the style of the class project sheets: views of the
// part with named dimensions (L1, H2, ØD3 …). The dimension being measured is drawn in the accent colour, and
// a recorded one shows its value. Drawn to scale so a bigger step really looks bigger.
import { r } from '../sim/svg.js';

let uid = 0;

const ln = (x1, y1, x2, y2, cls = 'dw-line') => `<line x1="${r(x1)}" y1="${r(y1)}" x2="${r(x2)}" y2="${r(y2)}" class="${cls}"/>`;
const poly = (pts, cls, extra = '') => `<polygon points="${pts.map(([x, y]) => `${r(x)},${r(y)}`).join(' ')}" class="${cls}" ${extra}/>`;
const arrow = (x, y, dx, dy, cls) => {
  const n = Math.hypot(dx, dy) || 1, ux = dx / n, uy = dy / n, L = 11, W = 4;
  return poly([[x, y], [x - ux * L - uy * W, y - uy * L + ux * W], [x - ux * L + uy * W, y - uy * L - ux * W]], `dw-arrow ${cls}`);
};
const label = (x, y, s, cls, rot = false) =>
  `<text x="${r(x)}" y="${r(y)}" class="dw-lbl ${cls}" text-anchor="middle"${rot ? ` transform="rotate(-90 ${r(x)} ${r(y)})"` : ''}>${s}</text>`;

// What a dimension says and how it looks: "L3", or "L3 = 1.250"" once recorded; accent when it's the one being measured.
function tag(key, st, prefix = '') {
  const cls = st.active === key ? 'on' : st.done[key] ? 'done' : '';
  return { cls, text: prefix + key + (st.done[key] ? ` = ${st.done[key]}` : '') };
}

// Horizontal dimension between x1 and x2 at height y; extension lines start at yFrom1 / yFrom2.
function hdim(x1, x2, y, t, yFrom1, yFrom2) {
  const g = y > yFrom1 ? 1 : -1;
  return `<g class="dim ${t.cls}">${ln(x1, yFrom1 + g * 4, x1, y + g * 8, 'dw-ext')}${ln(x2, yFrom2 + g * 4, x2, y + g * 8, 'dw-ext')}`
    + `${ln(x1, y, x2, y, 'dw-dim')}${arrow(x1, y, x1 - x2, 0, '')}${arrow(x2, y, x2 - x1, 0, '')}${label((x1 + x2) / 2, y - 6, t.text, '')}</g>`;
}

// Vertical dimension between y1 and y2 at x; extension lines start at xFrom1 / xFrom2.
function vdim(y1, y2, x, t, xFrom1, xFrom2) {
  const g = x > xFrom1 ? 1 : -1;
  return `<g class="dim ${t.cls}">${ln(xFrom1 + g * 4, y1, x + g * 8, y1, 'dw-ext')}${ln(xFrom2 + g * 4, y2, x + g * 8, y2, 'dw-ext')}`
    + `${ln(x, y1, x, y2, 'dw-dim')}${arrow(x, y1, 0, y1 - y2, '')}${arrow(x, y2, 0, y2 - y1, '')}${label(x - 7, (y1 + y2) / 2, t.text, '', true)}</g>`;
}

const hatchDef = id => `<pattern id="${id}" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="10" class="dw-hatch"/></pattern>`;
const wrap = (h, body, name) => `<svg viewBox="0 0 1000 ${Math.ceil(h)}" role="img" aria-label="${name} drawing" xmlns="http://www.w3.org/2000/svg">${body}</svg>`;

function stepBlock(p, st) {
  const { L, H, W, A } = p, L5 = L[4], H5 = H[4];
  const s = Math.min(520 / L5, 330 / (W + H5));
  const x0 = 90, xR = x0 + L5 * s, xs = x => xR - x * s, slope = (H5 * s) / Math.tan((A * Math.PI) / 180);
  let b = '';
  // Top view.
  const yT = 40;
  b += `<rect x="${r(x0)}" y="${yT}" width="${r(L5 * s)}" height="${r(W * s)}" class="dw-body"/>`;
  for (let i = 0; i < 4; i++) b += ln(xs(L[i]), yT, xs(L[i]), yT + W * s, 'dw-thin');
  b += ln(x0 + slope, yT, x0 + slope, yT + W * s, 'dw-thin');
  b += vdim(yT, yT + W * s, xR + 46, tag('W', st), xR, xR);
  // Front view.
  const y0 = yT + W * s + 70 + H5 * s, y = h => y0 - h * s;
  // Walk the stairs: each step i spans from L[i] to L[i-1] (measured from the right end) at height H[i].
  const prof = [[x0, y0], [x0 + slope, y(H5)]];
  for (let i = 4; i >= 0; i--) {
    const left = i === 4 ? x0 + slope : xs(L[i]), right = i === 0 ? xR : xs(L[i - 1]);
    if (i !== 4) prof.push([left, y(H[i])]);
    prof.push([right, y(H[i])]);
  }
  prof.push([xR, y0]);
  b += poly(prof, 'dw-body');
  for (let i = 0; i < 5; i++) b += hdim(xR, xs(L[i]), y0 + 32 * (i + 1), tag(`L${i + 1}`, st), y0, y0);
  for (let i = 0; i < 5; i++) {
    const xd = xR + 34 * (i + 1), stepRight = i === 0 ? xR : xs(L[i - 1]);
    b += vdim(y0, y(H[i]), xd, tag(`H${i + 1}`, st), xR, stepRight);
  }
  // Angle A at the sloped end.
  const t = tag('A', st), a = (A * Math.PI) / 180, R = 54;
  b += `<g class="dim ${t.cls}"><path d="M${r(x0 + R)} ${r(y0)} A${R} ${R} 0 0 0 ${r(x0 + R * Math.cos(a))} ${r(y0 - R * Math.sin(a))}" class="dw-dim" fill="none"/>`
    + `${label(x0 + (R + 26) * Math.cos(a / 2), y0 - (R + 14) * Math.sin(a / 2) + 6, t.text, '')}</g>`;
  return wrap(y0 + 32 * 5 + 30, b, 'Step block');
}

function stepPlate(p, st) {
  const { L, D, sw, W1, W2 } = p, L6 = L[5];
  const s = Math.min(640 / L6, 330 / (W1 + W2));
  const x0 = 110, xR = x0 + L6 * s, xs = x => xR - x * s;
  let b = '';
  const yT = 40;
  b += `<rect x="${r(x0)}" y="${yT}" width="${r(L6 * s)}" height="${r(W1 * s)}" class="dw-body"/>`;
  for (let i = 0; i < 5; i++) { b += ln(xs(L[i]), yT, xs(L[i]), yT + W1 * s, 'dw-thin') + ln(xs(L[i] + sw[i]), yT, xs(L[i] + sw[i]), yT + W1 * s, 'dw-thin'); }
  b += vdim(yT, yT + W1 * s, xR + 46, tag('W1', st), xR, xR);
  // Front view with the slots cut from the top.
  const top = yT + W1 * s + 80, bot = top + W2 * s;
  const prof = [[x0, bot], [x0, top]];
  for (let i = 4; i >= 0; i--) {
    const xl = xs(L[i] + sw[i]), xr = xs(L[i]);
    prof.push([xl, top], [xl, top + D[i] * s], [xr, top + D[i] * s], [xr, top]);
  }
  prof.push([xR, top], [xR, bot]);
  b += poly(prof, 'dw-body');
  for (let i = 0; i < 5; i++) {
    const t = tag(`D${i + 1}`, st), xm = xs(L[i] + sw[i] / 2), yb = top + D[i] * s;
    b += `<g class="dim ${t.cls}">${ln(xm, top - 26, xm, top, 'dw-dim')}${arrow(xm, top, 0, 1, '')}${ln(xm, yb + 26, xm, yb, 'dw-dim')}${arrow(xm, yb, 0, -1, '')}${label(xm, top - 32 - (i % 2) * 20, t.text, '')}</g>`;
  }
  b += vdim(top, bot, x0 - 40, tag('W2', st), x0, x0);
  for (let i = 0; i < 6; i++) b += hdim(xR, i === 5 ? x0 : xs(L[i]), bot + 32 * (i + 1), tag(`L${i + 1}`, st), bot, i === 5 ? bot : top + D[i] * s);
  return wrap(bot + 32 * 6 + 30, b, 'Step plate');
}

function stepShaft(p, st) {
  const { L, D, total } = p;
  const s = Math.min(780 / total, 200 / D[0]);
  const x0 = 110, xs = x => x0 + x * s, edges = [0, ...L, total];
  const yC = 40 + 6 * 30 + 30 + (D[0] * s) / 2;
  let b = ln(x0 - 24, yC, xs(total) + 24, yC, 'dw-center');
  for (let i = 0; i < 7; i++) b += `<rect x="${r(xs(edges[i]))}" y="${r(yC - (D[i] * s) / 2)}" width="${r((edges[i + 1] - edges[i]) * s)}" height="${r(D[i] * s)}" class="dw-body"/>`;
  for (let i = 0; i < 6; i++) b += hdim(x0, xs(L[i]), yC - (D[0] * s) / 2 - 30 * (i + 1), tag(`L${i + 1}`, st), yC - (D[0] * s) / 2, yC - (D[i] * s) / 2);
  for (let i = 0; i < 7; i++) {
    const t = tag(`D${i + 1}`, st, 'Ø'), xm = xs((edges[i] + edges[i + 1]) / 2), h = (D[i] * s) / 2;
    const yl = yC + (D[0] * s) / 2 + 30 + (i % 2) * 26;
    b += `<g class="dim ${t.cls}">${ln(xm, yC - h, xm, yC + h, 'dw-dim')}${arrow(xm, yC - h, 0, -1, '')}${arrow(xm, yC + h, 0, 1, '')}${ln(xm, yC + h, xm, yl - 16, 'dw-ext')}${label(xm, yl, t.text, '')}</g>`;
  }
  return wrap(yC + (D[0] * s) / 2 + 80, b, 'Step shaft');
}

function stepBushing(p, st) {
  const [L1, L2, L3] = p.L, [D1, D2, D3, D4] = p.D;
  const s = Math.min(340 / D1, 320 / L1), xc = 380, hid = `h${++uid}`;
  const yT = 40 + 2 * 32 + 20, yB = yT + L1 * s, y1 = yT + L2 * s, y2 = yB - L3 * s, x = d => (d * s) / 2;
  let b = `<defs>${hatchDef(hid)}</defs>`;
  const half = sgn => [[xc + sgn * x(D1), yT], [xc + sgn * x(D2), yT], [xc + sgn * x(D2), y1], [xc + sgn * x(D3), y1], [xc + sgn * x(D3), y2], [xc + sgn * x(D4), y2], [xc + sgn * x(D4), yB], [xc + sgn * x(D1), yB]];
  b += poly(half(-1), 'dw-body', `style="fill:url(#${hid})"`) + poly(half(1), 'dw-body', `style="fill:url(#${hid})"`);
  b += ln(xc - x(D2), y1, xc + x(D2), y1) + ln(xc - x(D4), y2, xc + x(D4), y2);
  b += ln(xc, yT - 90, xc, yB + 100, 'dw-center');
  b += hdim(xc - x(D1), xc + x(D1), yT - 64, tag('D1', st, 'Ø'), yT, yT);
  b += hdim(xc - x(D2), xc + x(D2), yT - 32, tag('D2', st, 'Ø'), yT, yT);
  b += hdim(xc - x(D4), xc + x(D4), yB + 32, tag('D4', st, 'Ø'), yB, yB);
  b += hdim(xc - x(D3), xc + x(D3), yB + 64, tag('D3', st, 'Ø'), y2, y2);
  const xr = xc + x(D1);
  b += vdim(yT, y1, xr + 40, tag('L2', st), xc + x(D2), xc + x(D2));
  b += vdim(y2, yB, xr + 40, tag('L3', st), xc + x(D4), xr);
  b += vdim(yT, yB, xr + 84, tag('L1', st), xr, xr);
  return wrap(yB + 100, b, 'Step bushing');
}

export const DRAW = { stepBlock, stepPlate, stepShaft, stepBushing };
