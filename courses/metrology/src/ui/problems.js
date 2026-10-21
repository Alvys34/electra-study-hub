// problems.js - turns a lab recipe ([{ tool, n, spec }]) and a seed into the same problems every time.
import { makeRng } from '../core/rng.js';
import { TOOLS } from '../sim/index.js';

export function makeProblems(recipe, seed) {
  const rng = makeRng(seed), out = [];
  for (const { tool, n = 1, spec } of recipe) {
    for (let i = 0; i < n; i++) out.push({ tool: TOOLS[tool], spec: TOOLS[tool].random(rng, spec) });
  }
  return out;
}

export const countOf = recipe => recipe.reduce((a, r) => a + (r.n || 1), 0);
