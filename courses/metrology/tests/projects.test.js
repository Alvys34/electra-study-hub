// projects.test.js - random shop parts: every dimension is a reading its tool can show exactly, accepts as
// its own answer, and the drawing renders. Also checks the shapes make sense (steps go the right way).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TOOLS, checkAnswer } from '../src/sim/index.js';
import { PROJECTS, makePart, toolFor } from '../src/projects/index.js';
import { DRAW } from '../src/projects/drawings.js';

const plain = html => html.replace(/<small>.*<\/small>/, '').replace(/<[^>]+>/g, '');
const typed = (tool, spec) => (tool.unit === 'deg' ? { deg: String(spec.value) } : plain(tool.answer(spec)).replace(/["″]|mm/g, '').trim());
const inc = list => list.every((v, i) => i === 0 || v > list[i - 1]);

for (const p of PROJECTS) {
  test(`project ${p.num}: 200 random parts measure cleanly`, () => {
    for (let seed = 1; seed <= 200; seed++) {
      const part = makePart(p, seed);
      assert.deepEqual(makePart(p, seed), part, 'same seed, same part');
      for (const f of part.features) {
        const [id, extra] = toolFor(p, f), tool = TOOLS[id];
        assert.ok(tool, `${p.id} ${f.key} has a tool`);
        const spec = tool.snap({ ...tool.base, ...extra, value: f.value });
        assert.ok(Math.abs(spec.value - f.value) < 1e-9, `${p.id} ${f.key}=${f.value} is not on the ${id} scale`);
        const [lo, hi] = tool.range(spec);
        assert.ok(f.value > lo && f.value < hi, `${p.id} ${f.key}=${f.value} outside ${id} range`);
        assert.ok(checkAnswer(tool, typed(tool, spec), spec).ok, `${p.id} ${f.key}: ${id} rejects ${typed(tool, spec)}`);
      }
      const svg = DRAW[part.type](part, { active: part.features[0].key, done: {} });
      assert.ok(svg.startsWith('<svg') && !svg.includes('NaN'), `${p.id} drawing`);
      if (part.type === 'stepBlock') assert.ok(inc(part.L) && inc(part.H));
      if (part.type === 'stepPlate') assert.ok(inc(part.L) && part.D.every(d => d < part.W2));
      if (part.type === 'stepShaft') assert.ok(inc(part.L) && part.D.every((d, i) => i === 0 || d < part.D[i - 1]) && part.D[6] > 0);
      if (part.type === 'stepBushing') {
        const [D1, D2, D3, D4] = part.D, [L1, L2, L3] = part.L;
        assert.ok(D1 > D2 && D2 > D4 && D4 > D3 && L2 + L3 < L1);
      }
    }
  });
}
