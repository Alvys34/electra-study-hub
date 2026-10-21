// vernier.js - vernier caliper (inch .001 and metric 0.02 mm) and the vernier height gage.
// The magnifier keeps the vernier plate still and slides the main scale, like looking through a loupe.
import { line, rect, text, hatch, nextId, svg } from './svg.js';
import { fmtIn, fmtMm, parseNum, near } from '../core/answer.js';

const CFG = {
  in: { unit: 'in', main: 0.025, n: 25, least: 0.001, ppu: 1000, max: 6, u0: 200, tol: 0.0004 },
  mm: { unit: 'mm', main: 1, n: 50, least: 0.02, ppu: 16, max: 150, u0: 110, tol: 0.009 },
};
const B = 130, L = 1000; // boundary between main scale and vernier; loupe length

const cfgOf = s => ({ ...CFG[s.sys], ...(s.height ? { max: 12 } : {}) });
const idxOf = s => Math.round(s.value / cfgOf(s).least);

// The magnifier, drawn along u (0..1000) with the scales meeting at y = B. `rot` keeps labels upright when turned.
function loupe(s, reveal, rot) {
  const c = cfgOf(s), idx = idxOf(s), value = idx * c.least;
  const u = v => c.u0 + (v - value) * c.ppu;
  const base = Math.floor(idx / c.n), j0 = idx % c.n, span = (c.main - c.least) * c.n * c.ppu;
  const mainAnchor = rot ? 'end' : 'middle', vernAnchor = rot ? 'start' : 'middle';
  let b = rect(Math.max(0, u(0)), 20, L, B - 20, 'sv-face');
  b += rect(c.u0 - 40, B, span + 80, 110, 'sv-face2');

  const i0 = Math.max(0, Math.ceil((value - c.u0 / c.ppu) / c.main)), i1 = Math.min(Math.round(c.max / c.main), Math.floor((value + (L - c.u0) / c.ppu) / c.main));
  for (let i = i0; i <= i1; i++) {
    let len, label = '', big = false;
    if (s.sys === 'in') {
      if (i % 40 === 0) { len = 50; label = String(i / 40); big = true; }
      else if (i % 4 === 0) { len = 40; label = String((i / 4) % 10); }
      else len = i % 2 === 0 ? 30 : 22;
    } else if (i % 10 === 0) { len = 50; label = String(i); big = true; }
    else len = i % 5 === 0 ? 36 : 24;
    const cls = reveal && i === base + j0 ? 'sv-tick sv-ans' : reveal && i === base ? 'sv-tick sv-hi' : 'sv-tick';
    const x = u(i * c.main);
    b += line(x, B, x, B - len, cls);
    if (label) b += text(x, rot ? B - len - 12 : B - len - 10, label, big ? 'sv-lbl sv-lbl-big' : 'sv-lbl', mainAnchor, rot);
  }
  for (let j = 0; j <= c.n; j++) {
    const x = c.u0 + j * (c.main - c.least) * c.ppu, len = j % 5 === 0 ? 34 : 22;
    const cls = reveal && j === j0 && j0 ? 'sv-tick sv-ans' : j === 0 ? 'sv-tick sv-zero' : 'sv-tick';
    b += line(x, B, x, B + len, cls);
    if (j % 5 === 0) b += text(x, rot ? B + len + 12 : B + len + 22, String(s.sys === 'in' ? j : j / 5), 'sv-lbl', vernAnchor, rot);
  }
  return b;
}

function draw(s, { reveal }) {
  const c = cfgOf(s), hid = nextId();
  if (s.height) {
    // Height gage: loupe turned upright on the left, the gage and part on the right.
    const ys = 940 - (s.value / c.max) * 860;
    let b = `<defs>${hatch(hid)}</defs><g transform="translate(0 ${L}) rotate(-90)">${loupe(s, reveal, true)}</g>`;
    b += rect(300, 950, 270, 14, 'sv-face2') + rect(318, 56, 20, 894, 'sv-face');
    b += rect(306, ys - 14, 44, 28, 'sv-face2') + rect(350, ys - 4, 100, 8, 'sv-face2');
    b += rect(440, ys, 110, 950 - ys, '', `fill="url(#${hid})"`) + line(350, ys, 560, ys, 'sv-edge');
    return svg(590, L, b, 'Vernier height gage');
  }
  const xj = 70 + (s.value / c.max) * 870;
  let b = `<defs>${hatch(hid)}</defs>`;
  b += rect(30, 14, 940, 20, 'sv-face') + rect(52, 14, 18, 70, 'sv-face2') + rect(xj, 14, 18, 70, 'sv-face2');
  b += rect(70, 40, xj - 70, 34, '', `fill="url(#${hid})"`);
  b += `<g transform="translate(0 96)">${loupe(s, reveal, false)}</g>`;
  return svg(L, 356, b, 'Vernier caliper');
}

function parts(s) {
  const c = cfgOf(s), idx = idxOf(s);
  if (s.sys === 'in') {
    const m = Math.floor(idx / 25);
    return { tenths: Math.floor(m / 4) / 10, extra: (m % 4) * 0.025, k: m % 4, j: idx % 25 };
  }
  return { mm: Math.floor(idx / 50), j: idx % 50, v: idx * c.least };
}

function steps(s) {
  const p = parts(s), idx = idxOf(s), name = s.height ? 'the slider' : 'the vernier 0';
  if (s.sys === 'in') return [
    `Main scale: the last numbered line before ${name} is <b>${fmtIn(p.tenths, 3)}</b> (whole inch + tenths).`,
    `Small .025 lines after it: ${p.k} × .025 = <b>${fmtIn(p.extra, 3)}</b>.`,
    `Vernier: line <b>${p.j}</b> lines up best with a main-scale line, so add <b>${fmtIn(p.j / 1000, 3)}</b>.`,
    `Add them: ${fmtIn(p.tenths, 3)} + ${fmtIn(p.extra, 3)} + ${fmtIn(p.j / 1000, 3)} = <b>${fmtIn(idx / 1000, 3)}"</b>.`,
  ];
  return [
    `Main scale: whole millimetres before the vernier 0: <b>${p.mm} mm</b>.`,
    `Vernier: line <b>${p.j}</b> lines up${p.j % 5 === 0 ? ` (the one numbered ${p.j / 5})` : ''}. Each line is 0.02 mm: ${p.j} × 0.02 = <b>${fmtMm(p.j * 0.02)} mm</b>.`,
    `Add them: ${p.mm} + ${fmtMm(p.j * 0.02)} = <b>${fmtMm(p.v)} mm</b>.`,
  ];
}

export function makeVernier(sys, height = false) {
  const c = CFG[sys];
  return {
    id: height ? 'height-in' : `vernier-${sys}`,
    name: height ? 'Height gage' : sys === 'in' ? 'Vernier caliper (inch)' : 'Vernier caliper (metric)',
    short: height ? 'Height gage' : sys === 'in' ? 'Vernier .001"' : 'Vernier 0.02 mm',
    unit: c.unit,
    tall: height,
    base: { sys, height, value: sys === 'in' ? 1.437 : 41.36 },
    random(rng) {
      const s = { ...this.base };
      const max = cfgOf(s).max;
      return { ...s, value: rng.int(sys === 'in' ? 120 : 250, Math.round((max * 0.9) / c.least)) * c.least };
    },
    range: s => [0, cfgOf(s).max],
    step: () => c.least,
    snap: s => ({ ...s, value: idxOf(s) * c.least }),
    drag: () => (height ? { axis: 'y', perPx: 1 / c.ppu } : { axis: 'x', perPx: -1 / c.ppu }),
    draw,
    steps,
    answer: s => (sys === 'in' ? `${fmtIn(idxOf(s) / 1000, 3)}"` : `${fmtMm(idxOf(s) * c.least)} mm`),
    question: () => (sys === 'in' ? `Read the ${height ? 'height gage' : 'caliper'} in inches (3 places).` : 'Read the caliper in millimetres (2 places).'),
    placeholder: () => (sys === 'in' ? 'e.g. 1.437' : 'e.g. 41.36'),
    check: (input, s) => near(parseNum(input), idxOf(s) * c.least, c.tol),
  };
}
