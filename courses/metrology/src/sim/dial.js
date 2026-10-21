// dial.js - dial caliper (inch): tenths from the bar, thousandths from the dial (one turn = .100").
import { line, rect, text, svg, r } from './svg.js';
import { fmtIn, parseNum, near } from '../core/answer.js';

const PPU = 160, EDGE = 360, MAX = 6, CX = 560, CY = 330, R = 112;
const idxOf = s => Math.round(s.value * 1000);

function draw(s, { reveal }) {
  const idx = idxOf(s), value = idx / 1000, last = Math.floor(idx / 100);
  const u = v => EDGE + (v - value) * PPU;
  let b = rect(Math.max(0, u(0)), 20, 1000, 90, 'sv-face');
  const i0 = Math.max(0, Math.ceil((value - EDGE / PPU) * 10)), i1 = Math.min(MAX * 10, Math.floor((value + (1000 - EDGE) / PPU) * 10));
  for (let i = i0; i <= i1; i++) {
    const x = u(i / 10), len = i % 10 === 0 ? 50 : i % 5 === 0 ? 38 : 28;
    b += line(x, 110, x, 110 - len, reveal && i === last ? 'sv-tick sv-hi' : 'sv-tick');
    b += text(x, 110 - len - 8, i % 10 === 0 ? String(i / 10) : String(i % 10), i % 10 === 0 ? 'sv-lbl sv-lbl-big' : 'sv-lbl');
  }
  b += rect(EDGE - 30, 110, 430, 90, 'sv-face2') + line(EDGE, 64, EDGE, 200, 'sv-edge');
  b += `<circle cx="${CX}" cy="${CY}" r="${R + 14}" class="sv-face2"/><circle cx="${CX}" cy="${CY}" r="${R}" class="sv-face"/>`;
  for (let k = 0; k < 100; k++) {
    const a = (k / 100) * 2 * Math.PI, sn = Math.sin(a), cs = -Math.cos(a), len = k % 10 === 0 ? 22 : k % 5 === 0 ? 15 : 9;
    b += line(CX + sn * R, CY + cs * R, CX + sn * (R - len), CY + cs * (R - len), 'sv-tick');
    if (k % 10 === 0) b += text(CX + sn * (R - 38), CY + cs * (R - 38) + 7, String(k), 'sv-lbl');
  }
  const a = ((idx % 100) / 100) * 2 * Math.PI;
  b += `<line x1="${CX}" y1="${CY}" x2="${r(CX + Math.sin(a) * (R - 6))}" y2="${r(CY - Math.cos(a) * (R - 6))}" class="${reveal ? 'sv-needle sv-needle-hi' : 'sv-needle'}"/>`;
  b += `<circle cx="${CX}" cy="${CY}" r="7" class="sv-hub"/>`;
  return svg(1000, 460, b, 'Dial caliper');
}

export const dial = {
  id: 'dial-in',
  name: 'Dial caliper',
  short: 'Dial caliper',
  unit: 'in',
  base: { value: 2.368 },
  random: rng => ({ value: rng.int(150, 5800) / 1000 }),
  range: () => [0, MAX],
  step: () => 0.001,
  snap: s => ({ ...s, value: idxOf(s) / 1000 }),
  drag: () => ({ axis: 'x', perPx: -1 / PPU }),
  draw,
  steps(s) {
    const idx = idxOf(s), t = Math.floor(idx / 100) / 10, n = idx % 100;
    return [
      `Bar: the last line before the slider edge is <b>${fmtIn(t, 1)}</b>, so ${fmtIn(t, 3)}. (Big numbers are inches, small ones tenths.)`,
      `Dial: the needle points at <b>${n}</b>. Each dial mark is .001", so add <b>${fmtIn(n / 1000, 3)}</b>.`,
      `Add them: ${fmtIn(t, 3)} + ${fmtIn(n / 1000, 3)} = <b>${fmtIn(idx / 1000, 3)}"</b>.`,
    ];
  },
  answer: s => `${fmtIn(idxOf(s) / 1000, 3)}"`,
  question: () => 'Read the dial caliper in inches (3 places).',
  placeholder: () => 'e.g. 2.368',
  check: (input, s) => near(parseNum(input), idxOf(s) / 1000, 0.0004),
};
