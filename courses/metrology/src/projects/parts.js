// parts.js - random parts like the class project sheets: step block, step plate, step shaft and step bushing.
// Every size is a whole number of the measuring tool's smallest step, so each one has an exact reading.
// Ranges are written in inches; metric parts scale them by 25.4 and snap to the metric tool.

const fix = v => Number(v.toFixed(6));

// Random size between lo and hi, snapped to `res`.
const q = (rng, lo, hi, res) => fix(rng.int(Math.ceil(lo / res - 1e-9), Math.floor(hi / res + 1e-9)) * res);
const snapSum = (list, res) => fix(Math.round(list.reduce((a, b) => a + b, 0) / res) * res);

export function stepBlock(rng, unit, res) {
  const k = unit === 'mm' ? 25.4 : 1;
  const seg = [0, 1, 2, 3].map(() => q(rng, 0.45 * k, 0.95 * k, res.len)).concat(q(rng, 0.9 * k, 1.3 * k, res.len));
  const L = seg.map((_, i) => snapSum(seg.slice(0, i + 1), res.len));
  const H = [q(rng, 0.15 * k, 0.3 * k, res.len)];
  for (let i = 1; i < 5; i++) H.push(snapSum([H[i - 1], q(rng, 0.12 * k, 0.3 * k, res.len)], res.len));
  const W = q(rng, 0.75 * k, 1.25 * k, res.len);
  // The sloped left face must end before the top step does.
  const aMin = Math.ceil((Math.atan(H[4] / (0.8 * seg[4])) * 180) / Math.PI);
  const A = rng.int(Math.max(aMin, 35), 75);
  return {
    type: 'stepBlock', L, H, W, A,
    features: [
      ...L.map((v, i) => ({ key: `L${i + 1}`, kind: 'len', value: v, desc: i === 4 ? 'overall length' : `right end to step ${i + 1}` })),
      ...H.map((v, i) => ({ key: `H${i + 1}`, kind: 'len', value: v, desc: `height of step ${i + 1}` })),
      { key: 'W', kind: 'len', value: W, desc: 'width' },
      { key: 'A', kind: 'angle', value: A, desc: 'angle of the sloped end' },
    ],
  };
}

export function stepPlate(rng, unit, res) {
  const k = unit === 'mm' ? 25.4 : 1;
  const W2 = q(rng, 0.5 * k, 0.75 * k, res.len), W1 = q(rng, 1.0 * k, 1.5 * k, res.len);
  const sw = [0, 1, 2, 3, 4].map(() => q(rng, 0.25 * k, 0.4 * k, res.len));
  // Slot 1 is nearest the right end; slots get deeper toward the left, like the class plate.
  const D = [0, 1, 2, 3, 4].map(() => q(rng, 0.1 * k, W2 - 0.2 * k, res.len)).sort((a, b) => a - b);
  const L = [q(rng, 0.3 * k, 0.5 * k, res.len)];
  for (let i = 1; i < 5; i++) L.push(snapSum([L[i - 1], sw[i - 1], q(rng, 0.25 * k, 0.45 * k, res.len)], res.len));
  L.push(snapSum([L[4], sw[4], q(rng, 0.3 * k, 0.5 * k, res.len)], res.len));
  return {
    type: 'stepPlate', L, D, sw, W1, W2,
    features: [
      ...L.map((v, i) => ({ key: `L${i + 1}`, kind: 'len', value: v, desc: i === 5 ? 'overall length' : `right end to slot ${i + 1}` })),
      ...D.map((v, i) => ({ key: `D${i + 1}`, kind: 'depth', value: v, desc: `depth of slot ${i + 1}` })),
      { key: 'W1', kind: 'len', value: W1, desc: 'width' },
      { key: 'W2', kind: 'len', value: W2, desc: 'thickness' },
    ],
  };
}

export function stepShaft(rng, unit, res) {
  const k = unit === 'mm' ? 25.4 : 1;
  const D = [q(rng, 0.85 * k, 0.98 * k, res.dia)];
  for (let i = 1; i < 7; i++) D.push(fix(D[i - 1] - q(rng, 0.05 * k, 0.1 * k, res.dia)));
  const seg = [0, 1, 2, 3, 4, 5, 6].map(() => q(rng, 0.35 * k, 0.7 * k, res.len));
  const L = seg.slice(0, 6).map((_, i) => snapSum(seg.slice(0, i + 1), res.len));
  return {
    type: 'stepShaft', L, D, total: snapSum(seg, res.len),
    features: [
      ...L.map((v, i) => ({ key: `L${i + 1}`, kind: 'len', value: v, desc: `left end to shoulder ${i + 1}` })),
      ...D.map((v, i) => ({ key: `D${i + 1}`, kind: 'dia', value: v, desc: `diameter ${i + 1}` })),
    ],
  };
}

export function stepBushing(rng, unit, res) {
  const k = unit === 'mm' ? 25.4 : 1;
  const D = [q(rng, 0.85 * k, 0.98 * k, res.dia), q(rng, 0.62 * k, 0.74 * k, res.dia), q(rng, 0.3 * k, 0.42 * k, res.dia), q(rng, 0.48 * k, 0.58 * k, res.dia)];
  const L = [q(rng, 1.2 * k, 1.8 * k, res.len), q(rng, 0.3 * k, 0.55 * k, res.len), q(rng, 0.25 * k, 0.45 * k, res.len)];
  return {
    type: 'stepBushing', L, D,
    features: [
      { key: 'L1', kind: 'len', value: L[0], desc: 'overall length' },
      { key: 'L2', kind: 'depth', value: L[1], desc: 'depth of the top counterbore' },
      { key: 'L3', kind: 'depth', value: L[2], desc: 'depth of the bottom counterbore' },
      { key: 'D1', kind: 'dia', value: D[0], desc: 'outside diameter' },
      { key: 'D2', kind: 'bore', value: D[1], desc: 'top counterbore' },
      { key: 'D3', kind: 'bore', value: D[2], desc: 'through bore' },
      { key: 'D4', kind: 'bore', value: D[3], desc: 'bottom counterbore' },
    ],
  };
}

export const PARTS = { stepBlock, stepPlate, stepShaft, stepBushing };
