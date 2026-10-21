// circuit.js - a tiny nodal-analysis solver so anything he wires on the bench behaves like the real thing.
// Every terminal is a node. Wires are 10 mΩ resistors (so we know the current in each wire).
// Elements: { a, b, G } conductance between terminals, or { a, b, V, Rint } a voltage source (+ at a).

const WIRE_G = 100;     // 0.01 Ω
const LEAK_G = 1e-9;    // keeps floating nodes at 0 V instead of breaking the maths

export function solve(terminalIds, elements, groundId) {
  const idx = new Map();
  terminalIds.forEach((id, i) => idx.set(id, i));
  const n = terminalIds.length;
  const G = Array.from({ length: n }, () => new Float64Array(n));
  const I = new Float64Array(n);

  const stamp = (a, b, g) => {
    const i = idx.get(a), j = idx.get(b);
    if (i === undefined || j === undefined || i === j) return;
    G[i][i] += g; G[j][j] += g; G[i][j] -= g; G[j][i] -= g;
  };

  for (const e of elements) {
    if (e.V !== undefined) {
      const g = 1 / e.Rint;
      stamp(e.a, e.b, g);
      const i = idx.get(e.a), j = idx.get(e.b);
      if (i !== undefined) I[i] += e.V * g;
      if (j !== undefined) I[j] -= e.V * g;
    } else if (e.I !== undefined) {
      // ideal current source pushing e.I from b to a (into a)
      const i = idx.get(e.a), j = idx.get(e.b);
      if (i !== undefined) I[i] += e.I;
      if (j !== undefined) I[j] -= e.I;
    } else {
      stamp(e.a, e.b, e.G);
    }
  }
  for (let i = 0; i < n; i++) G[i][i] += LEAK_G;

  // ground: pin the reference node to 0 V
  const gi = idx.get(groundId);
  if (gi !== undefined) { for (let j = 0; j < n; j++) { G[gi][j] = 0; } G[gi][gi] = 1; I[gi] = 0; }

  const v = gauss(G, I, n);
  const V = new Map();
  terminalIds.forEach((id, i) => V.set(id, v[i]));

  // currents through each element, conventional a -> b
  for (const e of elements) {
    const dv = (V.get(e.a) ?? 0) - (V.get(e.b) ?? 0);
    if (e.V !== undefined) e.current = (e.V - dv) / e.Rint; // out of + terminal
    else if (e.I !== undefined) e.current = e.I;
    else e.current = dv * e.G;
  }
  return V;
}

function gauss(A, b, n) {
  const M = A.map((row, i) => { const r = new Float64Array(n + 1); r.set(row); r[n] = b[i]; return r; });
  for (let c = 0; c < n; c++) {
    let p = c;
    for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
    if (Math.abs(M[p][c]) < 1e-18) continue;
    [M[c], M[p]] = [M[p], M[c]];
    for (let r = 0; r < n; r++) {
      if (r === c) continue;
      const f = M[r][c] / M[c][c];
      if (f === 0) continue;
      for (let k = c; k <= n; k++) M[r][k] -= f * M[c][k];
    }
  }
  const x = new Float64Array(n);
  for (let i = 0; i < n; i++) x[i] = Math.abs(M[i][i]) < 1e-18 ? 0 : M[i][n] / M[i][i];
  return x;
}

export const WIRE_CONDUCTANCE = WIRE_G;

/** Groups terminals into connected nets (through wires only) — handy for "is it a closed loop?" checks. */
export function nets(terminalIds, wires) {
  const parent = new Map(terminalIds.map(t => [t, t]));
  const find = x => { while (parent.get(x) !== x) { parent.set(x, parent.get(parent.get(x))); x = parent.get(x); } return x; };
  for (const w of wires) { const a = find(w.a), b = find(w.b); if (a !== b) parent.set(a, b); }
  return find;
}
