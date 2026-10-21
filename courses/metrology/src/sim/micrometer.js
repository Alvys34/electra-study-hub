// micrometer.js - outside micrometer (inch .001, metric 0.01 mm) and the inch depth micrometer.
// The thimble is drawn as a turning cylinder: only the lines on its front face show.
import { line, rect, text, svg, r } from './svg.js';
import { fmtIn, fmtMm, parseNum, near } from '../core/answer.js';

const CFG = {
  in: { unit: 'in', max: 1, ppu: 500, least: 0.001, divs: 25, step: 0.025, tol: 0.0004 },
  mm: { unit: 'mm', max: 25, ppu: 20, least: 0.01, divs: 50, step: 0.5, tol: 0.004 },
  depth: { unit: 'in', max: 1, ppu: 500, least: 0.001, divs: 25, step: 0.025, tol: 0.0004 },
};
const REF = 160, XS = 90, R = 120, TH = 240;

const idxOf = s => Math.round(s.value / CFG[s.sys].least);

function draw(s, { reveal }) {
  const c = CFG[s.sys], idx = idxOf(s), depth = s.sys === 'depth';
  const len = c.max * c.ppu, x0 = depth ? XS + len : XS; // where the 0 line is
  const dir = depth ? -1 : 1, edge = x0 + dir * idx * c.least * c.ppu;
  const lastLine = Math.floor((idx * c.least + 1e-9) / c.step);
  let b = rect(10, REF - 80, 46, 160, 'sv-face2') + rect(56, REF - 38, XS + len + 40 - 56, 76, 'sv-face');
  const sleeve = ghost => {
    let t = line(XS - 20, REF, XS + len + 30, REF, ghost ? 'sv-tick sv-ghost' : 'sv-tick');
    const n = Math.round(c.max / c.step);
    for (let k = 0; k <= n; k++) {
      const x = x0 + dir * k * c.step * c.ppu;
      if (!ghost && x > edge + 0.5) continue; // under the thimble
      const hi = reveal && k === lastLine ? ' sv-hi' : '', g = ghost ? ' sv-ghost' : '';
      if (s.sys === 'mm') {
        const upper = k % 2 === 0, l = upper ? (k % 10 === 0 ? 34 : 24) : 18;
        t += line(x, REF, x, upper ? REF - l : REF + l, `sv-tick${hi}${g}`);
        if (upper && k % 10 === 0) t += text(x, REF - l - 8, String(k / 2), `sv-lbl${g}`);
      } else {
        const l = k % 4 === 0 ? 34 : 20;
        t += line(x, REF, x, REF - l, `sv-tick${hi}${g}`);
        if (k % 4 === 0) t += text(x, REF - l - 8, String(k / 4), `sv-lbl${g}`);
      }
    }
    return t;
  };
  b += sleeve(false);

  // Thimble: from the edge outwards, with its bevelled edge carrying the graduations.
  const tx = edge, tw = depth ? x0 - edge + TH : TH;
  b += `<rect x="${r(tx)}" y="${REF - R}" width="${r(tw)}" height="${2 * R}" rx="10" class="sv-thimble"/>`;
  b += rect(tx, REF - R, 22, 2 * R, 'sv-bevel');
  if (depth && (s.xray || reveal)) b += sleeve(true);
  const turn = idx % c.divs;
  for (let k = 0; k < c.divs; k++) {
    const phi = ((k - turn) / c.divs) * 2 * Math.PI, cs = Math.cos(phi);
    if (cs < 0.12) continue;
    const y = REF - dir * R * 0.94 * Math.sin(phi), l = k % 5 === 0 ? 34 : 20;
    const cls = reveal && k === turn ? 'sv-tick sv-ans' : 'sv-tick';
    b += `<g opacity="${r(Math.min(1, cs * 1.3))}">${line(tx, y, tx + l, y, cls)}`;
    if (k % 5 === 0) b += text(tx + l + 8, y + 7, String(k), 'sv-lbl', 'start');
    b += '</g>';
  }
  return svg(depth ? 1000 : 900, 320, b, depth ? 'Depth micrometer' : 'Micrometer');
}

function steps(s) {
  const idx = idxOf(s);
  if (s.sys === 'mm') {
    const half = Math.floor(idx / 50), mm = Math.floor(half / 2), h = half % 2, t = idx % 50;
    return [
      `Sleeve, top lines: the last whole millimetre showing is <b>${mm} mm</b>.`,
      h ? `Sleeve, bottom lines: a half-millimetre line shows past it, so add <b>0.50 mm</b>.` : `Sleeve, bottom lines: no half-millimetre line shows past it, so add nothing.`,
      `Thimble: line <b>${t}</b> is on the reference line. Each line is 0.01 mm, so add <b>${fmtMm(t / 100)} mm</b>.`,
      `Add them: ${mm} + ${h ? '0.50' : '0.00'} + ${fmtMm(t / 100)} = <b>${fmtMm(idx / 100)} mm</b>.`,
    ];
  }
  const m = Math.floor(idx / 25), tenths = Math.floor(m / 4), k = m % 4, t = idx % 25;
  const depth = s.sys === 'depth', where = depth ? 'hidden under the thimble' : 'showing';
  return [
    `Sleeve: the last number ${where} is <b>${tenths}</b>, so ${fmtIn(tenths / 10, 3)}.${depth ? ' On a depth micrometer the numbers run backwards: count what the thimble covers, not what you can see.' : ''}`,
    `Small .025 lines ${where} after it: ${k} × .025 = <b>${fmtIn(k * 0.025, 3)}</b>.`,
    `Thimble: line <b>${t}</b> is on the reference line, so add <b>${fmtIn(t / 1000, 3)}</b>.`,
    `Add them: ${fmtIn(tenths / 10, 3)} + ${fmtIn(k * 0.025, 3)} + ${fmtIn(t / 1000, 3)} = <b>${fmtIn(idx / 1000, 3)}"</b>.`,
  ];
}

export function makeMic(sys) {
  const c = CFG[sys];
  return {
    id: sys === 'depth' ? 'depth-in' : `mic-${sys}`,
    name: { in: 'Micrometer (inch)', mm: 'Micrometer (metric)', depth: 'Depth micrometer' }[sys],
    short: { in: 'Micrometer .001"', mm: 'Micrometer 0.01 mm', depth: 'Depth mic' }[sys],
    unit: c.unit,
    toggles: sys === 'depth' ? [{ key: 'xray', label: 'See through the thimble' }] : [],
    base: { sys, value: sys === 'mm' ? 7.83 : sys === 'depth' ? 0.314 : 0.587 },
    random: rng => ({ sys, value: rng.int(sys === 'mm' ? 60 : 30, Math.round(c.max / c.least) - 5) * c.least }),
    range: () => [0, c.max],
    step: () => c.least,
    snap: s => ({ ...s, value: idxOf(s) * c.least }),
    drag: () => ({ axis: 'x', perPx: (sys === 'depth' ? -1 : 1) / c.ppu }),
    draw,
    steps,
    answer: s => (sys === 'mm' ? `${fmtMm(idxOf(s) / 100)} mm` : `${fmtIn(idxOf(s) / 1000, 3)}"`),
    question: () => (sys === 'mm' ? 'Read the micrometer in millimetres (2 places).' : sys === 'depth' ? 'Read the depth micrometer in inches (3 places).' : 'Read the micrometer in inches (3 places).'),
    placeholder: () => (sys === 'mm' ? 'e.g. 7.83' : 'e.g. .587'),
    check: (input, s) => near(parseNum(input), idxOf(s) * c.least, c.tol),
  };
}
