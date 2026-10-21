// geometry.js - the shop parts as a list of surfaces you can click: flat faces (a plane square to x, y or z,
// with the way its outside points) and round ones (a cylinder, outside or a bore). The 3D scene draws one mesh
// per surface, and measure.js works only from these numbers, so every reading is exact.
// Part coordinates: y is up with the part on the surface plate at y = 0. Block and plate run along x (right end
// at the largest x) and z (front face at the largest z). Shafts and bushings stand on end around the y axis.

const fix = v => Number(v.toFixed(6));

// A flat profile in x-y (counter-clockwise), pushed out along z from 0 to W: two end caps and one face per edge.
function extrude(profile, W) {
  const out = [];
  out.push({ kind: 'plane', axis: 'z', at: W, n: 1, poly: profile.map(([x, y]) => [x, y, W]), name: 'front face' });
  out.push({ kind: 'plane', axis: 'z', at: 0, n: -1, poly: profile.map(([x, y]) => [x, y, 0]), name: 'back face' });
  profile.forEach(([x1, y1], i) => {
    const [x2, y2] = profile[(i + 1) % profile.length];
    const poly = [[x1, y1, 0], [x2, y2, 0], [x2, y2, W], [x1, y1, W]];
    if (y1 === y2) out.push({ kind: 'plane', axis: 'y', at: y1, n: x2 > x1 ? -1 : 1, poly, name: x2 > x1 ? 'bottom face' : 'top face' });
    else if (x1 === x2) out.push({ kind: 'plane', axis: 'x', at: x1, n: y2 > y1 ? 1 : -1, poly, name: y2 > y1 ? 'face pointing right' : 'face pointing left' });
    // A sloped face: a tool closing on it touches its far corner, so it measures like a face at that corner.
    else out.push({ kind: 'plane', axis: 'x', at: Math.min(x1, x2), n: -1, poly, sloped: true, name: 'sloped end' });
  });
  return out;
}

function stepBlock(p) {
  const { L, H, A } = p, L5 = L[4], X = d => fix(L5 - d);
  const slopeTop = fix(H[4] / Math.tan((A * Math.PI) / 180));
  const prof = [[0, 0], [L5, 0], [L5, H[0]]];
  for (let i = 0; i < 4; i++) prof.push([X(L[i]), H[i]], [X(L[i]), H[i + 1]]);
  prof.push([slopeTop, H[4]]);
  return { surfaces: extrude(prof, p.W), box: [[0, 0, 0], [L5, H[4], p.W]] };
}

function stepPlate(p) {
  const { L, D, sw, W1, W2 } = p, L6 = L[5], X = d => fix(L6 - d);
  const prof = [[0, 0], [L6, 0], [L6, W2]];
  for (let i = 0; i < 5; i++) {
    const xr = X(L[i]), xl = X(L[i] + sw[i]), y = fix(W2 - D[i]);
    prof.push([xr, W2], [xr, y], [xl, y], [xl, W2]);
  }
  prof.push([0, W2]);
  return { surfaces: extrude(prof, W1), box: [[0, 0, 0], [L6, W2, W1]] };
}

const ring = (at, n, r0, r1, name) => ({ kind: 'plane', axis: 'y', at, n, ring: [r0, r1], name });
const cyl = (r, y0, y1, inside, name) => ({ kind: 'cyl', r, y0, y1, inside, name });

function stepShaft(p) {
  const { L, D, total } = p, edges = [0, ...L, total], r = D.map(d => d / 2);
  const s = [ring(0, -1, 0, r[0], 'bottom end'), ring(total, 1, 0, r[6], 'top end')];
  for (let i = 0; i < 7; i++) s.push(cyl(r[i], edges[i], edges[i + 1], false, `diameter ${i + 1}`));
  for (let i = 0; i < 6; i++) s.push(ring(L[i], 1, r[i + 1], r[i], `shoulder ${i + 1}`));
  return { surfaces: s, box: [[-r[0], 0, -r[0]], [r[0], total, r[0]]] };
}

function stepBushing(p) {
  const [L1, L2, L3] = p.L, [R1, R2, R3, R4] = p.D.map(d => d / 2), y2 = fix(L1 - L2);
  return {
    surfaces: [
      cyl(R1, 0, L1, false, 'outside'),
      ring(L1, 1, R2, R1, 'top face'), ring(0, -1, R4, R1, 'bottom face'),
      cyl(R2, y2, L1, true, 'top counterbore'), ring(y2, 1, R3, R2, 'floor of the top counterbore'),
      cyl(R3, L3, y2, true, 'through bore'),
      ring(L3, -1, R3, R4, 'floor of the bottom counterbore'), cyl(R4, 0, L3, true, 'bottom counterbore'),
    ],
    box: [[-R1, 0, -R1], [R1, L1, R1]],
  };
}

const BUILD = { stepBlock, stepPlate, stepShaft, stepBushing };

// Surfaces with ids and a point on each (where "Show me" puts the tool), plus the part's bounding box.
export function partGeometry(part) {
  const g = BUILD[part.type](part);
  g.surfaces.forEach((s, i) => {
    s.id = i;
    if (s.poly) s.center = [0, 1, 2].map(k => s.poly.reduce((a, q) => a + q[k], 0) / s.poly.length);
    else if (s.ring) s.center = [(s.ring[0] + s.ring[1]) / 2, s.at, 0];
    else s.center = [s.r, (s.y0 + s.y1) / 2, 0];
  });
  g.height = g.box[1][1];
  return g;
}

// The surface plate under the part. It stands in for whichever face of the part is lying on it.
export const plateSurface = (height, flipped) =>
  ({ id: 'plate', kind: 'plane', axis: 'y', at: flipped ? height : 0, n: flipped ? 1 : -1, plate: true, name: 'surface plate', center: [0, flipped ? height : 0, 0] });
