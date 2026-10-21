// protractor.js - universal bevel protractor (vernier, 5′) and plate protractor (whole degrees).
// The magnifier shows a slice of the dial: the vernier plate stays put and the dial turns under it.
import { svg, r, widen } from './svg.js';
import { fmtAngle } from '../core/answer.js';

const PPD = 18, RAD = PPD * 180 / Math.PI, CX = 500, CY = RAD + 92, VSTEP = 23 / 12;

// Point at radius `rad`, `psi` degrees right of straight up.
const pt = (rad, psi) => { const a = psi * Math.PI / 180; return [CX + rad * Math.sin(a), CY - rad * Math.cos(a)]; };
const seg = (r1, r2, psi, cls) => { const [x1, y1] = pt(r1, psi), [x2, y2] = pt(r2, psi); return `<line x1="${r(x1)}" y1="${r(y1)}" x2="${r(x2)}" y2="${r(y2)}" class="${cls}"/>`; };
const lbl = (rad, psi, s, cls = 'sv-lbl') => { const [x, y] = pt(rad, psi); return `<text x="${r(x)}" y="${r(y + 7)}" class="${cls}" text-anchor="middle">${s}</text>`; };
const band = (r1, r2, a1, a2, cls) => {
  const [x1, y1] = pt(r2, a1), [x2, y2] = pt(r2, a2), [x3, y3] = pt(r1, a2), [x4, y4] = pt(r1, a1);
  return `<path d="M${r(x1)} ${r(y1)} A${r2} ${r2} 0 0 1 ${r(x2)} ${r(y2)} L${r(x3)} ${r(y3)} A${r1} ${r1} 0 0 0 ${r(x4)} ${r(y4)}Z" class="${cls}"/>`;
};

// Bevel dial numbers go 0-90-0-90 around the dial; values here stay in 0..90 so fold anything past 90 back.
const fold = a => (a < 0 ? -a : a <= 90 ? a : 180 - a);

function draw(s, { reveal }) {
  const plate = s.mode === 'plate', mins = plate ? s.value * 60 : s.value;
  const v = mins / 60, deg = Math.floor(v), dir = s.mirror ? 1 : -1; // dir: screen side where numbers grow
  const j0 = (mins % 60) / 5;
  let b = band(RAD - 6, RAD + 70, -30, 30, 'sv-face');
  if (!plate) b += band(RAD - 60, RAD - 6, -27, 27, 'sv-face2');
  for (let a = Math.ceil(v - 30); a <= Math.floor(v + 30); a++) {
    if (plate ? a < 0 || a > 180 : a < -90 || a > 180) continue;
    const psi = (a - v) * dir, len = a % 10 === 0 ? 34 : a % 5 === 0 ? 24 : 15;
    const cls = reveal && !plate && a === deg + 2 * j0 && j0 ? 'sv-tick sv-ans' : reveal && a === deg ? 'sv-tick sv-hi' : 'sv-tick';
    b += seg(RAD, RAD + len, psi, cls);
    if (a % 10 === 0) b += lbl(RAD + len + 18, psi, String(plate ? a : fold(a)), 'sv-lbl sv-lbl-big');
  }
  if (plate) b += seg(RAD - 50, RAD + 10, 0, 'sv-edge');
  else {
    for (let j = -12; j <= 12; j++) {
      const aj = v + j * VSTEP, near = Math.round(aj), m = Math.abs(j);
      const psi = ((near - v) + widen((aj - near) * PPD, PPD / 2) / PPD) * dir;
      const cls = reveal && j === j0 && j0 ? 'sv-tick sv-ans' : j === 0 ? 'sv-tick sv-zero' : 'sv-tick';
      b += seg(RAD, RAD - (m % 3 === 0 ? 30 : 18), psi, cls);
      if (m % 3 === 0) b += lbl(RAD - 50, psi, String(m * 5));
    }
  }
  return svg(1000, plate ? 230 : 250, b, plate ? 'Plate protractor' : 'Universal bevel protractor');
}

export function makeProtractor(mode) {
  const plate = mode === 'plate';
  return {
    id: `prot-${mode}`,
    name: plate ? 'Plate protractor' : 'Bevel protractor',
    short: plate ? 'Plate protractor' : 'Bevel protractor',
    unit: plate ? 'deg' : 'angle',
    toggles: plate ? [] : [{ key: 'mirror', label: 'Dial numbers grow to the right' }],
    base: plate ? { mode, value: 47 } : { mode, value: 23 * 60 + 35, mirror: false },
    random: rng => (plate ? { mode, value: rng.int(5, 175) } : { mode, value: rng.int(1, 89) * 60 + rng.int(1, 11) * 5, mirror: rng.bool() }),
    range: () => (plate ? [0, 180] : [0, 90 * 60]),
    step: () => (plate ? 1 : 5),
    snap: s => ({ ...s, value: plate ? Math.round(s.value) : Math.round(s.value / 5) * 5 }),
    drag: s => ({ axis: 'x', perPx: (s.mirror ? -1 : 1) * (plate ? 1 : 60) / PPD }),
    draw,
    steps(s) {
      if (plate) return [
        `Find the line that meets the blade edge on the scale.`,
        `Count from the last numbered ten: that line is <b>${s.value}°</b>.`,
      ];
      const deg = Math.floor(s.value / 60), m = s.value % 60, j = m / 5, side = s.mirror ? 'right' : 'left';
      return [
        `Dial: the last whole degree before the vernier 0 is <b>${deg}°</b>.`,
        `Which side of the vernier? The dial numbers grow to the <b>${side}</b>, so read the vernier on the ${side} of its 0.`,
        `On that side, line <b>${j}</b> lines up${j % 3 === 0 ? ` (marked ${m})` : ''}. Each line is 5′, so add <b>${m}′</b>.${j ? ` (A line on the other side also lines up at ${60 - m}′: that's the trap.)` : ''}`,
        `Add them: ${deg}° + ${m}′ = <b>${fmtAngle(deg, m)}</b>.`,
      ];
    },
    answer: s => (plate ? `${s.value}°` : fmtAngle(Math.floor(s.value / 60), s.value % 60)),
    question: () => (plate ? 'Read the plate protractor in degrees.' : 'Read the bevel protractor in degrees and minutes.'),
    check(input, s) {
      if (plate) return Number(input.deg) === s.value;
      return Number(input.deg) * 60 + Number(input.min || 0) === s.value && input.deg !== '';
    },
  };
}
