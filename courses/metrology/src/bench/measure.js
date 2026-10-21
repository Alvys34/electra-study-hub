// measure.js - what a tool reads when it is put on the surfaces you clicked. Pure functions, no 3D.
// A pick is { s: surface, p: [x, y, z] where it was clicked, in part coordinates }. `flipped` means the part was
// turned upside down on the plate, so faces that pointed down now point up.
import { plateSurface } from './geometry.js';

export const KIND = {
  'vernier-in': 'caliper', 'vernier-mm': 'caliper', 'mic-in': 'mic', 'mic-mm': 'mic', 'depth-in': 'depthmic',
  'height-in': 'height', 'rule-frac': 'rule', 'rule-dec': 'rule', 'rule-mm': 'rule',
};

// What to do next, shown under the 3D view.
export const PROMPT = {
  caliper: ['Click a face or a diameter: the jaws snap to it.', 'Now click the face for the other jaw (parallel to the first).'],
  mic: ['Click a diameter, or the first of two outside faces.', 'Now click the opposite outside face.'],
  depthmic: ['Click the top face the base rests on.', 'Now click the lower face the rod goes down to.'],
  height: ['Click a face that points up: the scriber snaps onto it.'],
  rule: ['Click the face to put the end of the rule against.', 'Now click the face to read the rule at.'],
};

const up = (s, flipped) => s.axis === 'y' && (flipped ? -s.n : s.n) === 1;
const err = msg => ({ ok: false, msg });
const on = (p, axis, at) => p.map((v, k) => (k === 'xyz'.indexOf(axis) ? at : v));

// -> { ok: true, value, mode, A, B } with the two contact points, { ok: false, need: 2 } for a second click,
// or { ok: false, msg } when the tool can't be used that way.
export function measure(kind, picks, flipped, height) {
  const [a, b] = picks;
  if (a.s.kind === 'cyl') {
    const { r, inside } = a.s, y = a.p[1], A = [-r, y, 0], B = [r, y, 0];
    if (kind === 'caliper') return { ok: true, value: 2 * r, mode: inside ? 'inside jaws' : 'outside jaws', A, B, axis: 'x', round: inside ? 'bore' : 'outside' };
    if (kind === 'mic') return inside ? err('An outside micrometer can’t reach into a bore. Measure an outside diameter or two outside faces.') : { ok: true, value: 2 * r, mode: 'anvil and spindle', A, B, axis: 'x', round: 'outside' };
    return err(kind === 'depthmic' ? 'A depth micrometer measures down from a flat face. Click a top face.' : kind === 'height' ? 'The scriber needs a flat face that points up.' : 'Use a caliper or micrometer for diameters. Click a flat face.');
  }
  if (kind === 'height') {
    if (!up(a.s, flipped)) return err('The height gage only reaches faces that point up. Click a top face, or flip the part.');
    if (a.s.plate) return err('That’s the surface plate itself: the gage reads zero there. Click a face of the part.');
    return { ok: true, value: flipped ? height - a.s.at : a.s.at, mode: 'scriber', A: a.p, B: a.p, axis: 'y' };
  }
  if (kind === 'depthmic' && !up(a.s, flipped)) return err('The base has to sit on a face that points up. Click a top face, or flip the part.');
  if (!b) return { ok: false, need: 2 };
  if (b.s.kind === 'cyl' || b.s.axis !== a.s.axis) return err('That face isn’t parallel to the first one. Pick one facing the same line.');
  const value = Math.abs(a.s.at - b.s.at);
  if (value < 1e-9) return err('Those two faces are level with each other. Pick a face at a different distance.');
  const rel = a.s.n === b.s.n ? 'same' : a.s.n === Math.sign(a.s.at - b.s.at) ? 'outside' : 'inside';
  const A = on(a.p, a.s.axis, a.s.at), B = on(b.p, b.s.axis, b.s.at);
  if (kind === 'mic' && rel !== 'outside') return err('A micrometer closes on two outside faces, with the part between the anvil and spindle.');
  if (kind === 'depthmic') {
    if (!up(b.s, flipped) || rel !== 'same') return err('The rod goes down to a face that points up, below the base.');
    if ((flipped ? -1 : 1) * (b.s.at - a.s.at) > 0) return err('That face is higher than the base. Click a face below it.');
    return { ok: true, value, mode: 'depth rod', A: on(b.p, 'y', a.s.at), B, axis: 'y' };
  }
  if (kind === 'caliper' && rel === 'same') {
    const vertical = up(a.s, flipped) && up(b.s, flipped);
    const [hi, lo] = (flipped ? -1 : 1) * (a.s.at - b.s.at) > 0 ? [a, b] : [b, a];
    if (vertical) return { ok: true, value, mode: 'depth rod', A: on(lo.p, 'y', hi.s.at), B: on(lo.p, 'y', lo.s.at), axis: 'y' };
    return { ok: true, value, mode: 'step', A, B, axis: a.s.axis };
  }
  const mode = kind === 'mic' ? 'anvil and spindle' : kind === 'rule' ? 'rule' : rel === 'outside' ? 'outside jaws' : rel === 'inside' ? 'inside jaws' : 'step';
  return { ok: true, value, mode, A, B, axis: a.s.axis };
}

// One way to put the tool on the part that reads `target` (for "Show me"). Tries single clicks, then pairs.
export function solve(kind, geo, flipped, target, matches) {
  const plate = plateSurface(geo.height, flipped), [lo, hi] = geo.box;
  const all = [...geo.surfaces.map(s => ({ s, p: s.center })), { s: plate, p: [(lo[0] + hi[0]) / 2, plate.at, (lo[2] + hi[2]) / 2] }];
  for (const a of all) {
    const r = measure(kind, [a], flipped, geo.height);
    if (r.ok && matches(r.value, target)) return [a];
  }
  for (const a of all) for (const b of all) {
    if (a === b) continue;
    const r = measure(kind, [a, b], flipped, geo.height);
    if (r.ok && matches(r.value, target)) return [a, b];
  }
  return null;
}
