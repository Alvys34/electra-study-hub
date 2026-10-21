// bench.test.js - the 3D bench: every random job can be measured by putting its tool on the part, the tool
// reads exactly the dimension asked for, and wrong set-ups give a reason instead of a reading.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeTask, FILTERS, sameReading } from '../src/bench/tasks.js';
import { partGeometry, plateSurface } from '../src/bench/geometry.js';
import { measure, solve } from '../src/bench/measure.js';

for (const { id } of FILTERS) {
  test(`bench (${id}): 300 random jobs can all be measured`, () => {
    for (let seed = 1; seed <= 300; seed++) {
      const task = makeTask(seed, id);
      assert.deepEqual(makeTask(seed, id).feature, task.feature, 'same seed, same job');
      if (id !== 'any') assert.equal(task.kind, id);
      const geo = partGeometry(task.part), match = v => sameReading(task, v);
      const picks = solve(task.kind, geo, false, null, match) || solve(task.kind, geo, true, null, match);
      assert.ok(picks, `seed ${seed}: no way to measure ${task.part.type} ${task.feature.key} with ${task.tool.id}`);
      const [lo, hi] = task.tool.range(task.target);
      assert.ok(task.target.value > lo && task.target.value < hi, `${task.feature.key} fits the ${task.tool.id}`);
    }
  });
}

test('bench: tools refuse set-ups they cannot make', () => {
  const task = makeTask(5, 'any');
  const geo = partGeometry({ ...task.part, type: 'stepBushing', L: [1.5, 0.4, 0.3], D: [0.95, 0.7, 0.35, 0.5] });
  const by = name => ({ s: geo.surfaces.find(s => s.name === name), p: geo.surfaces.find(s => s.name === name).center });
  assert.equal(measure('mic', [by('through bore')], false, geo.height).ok, false);
  assert.equal(measure('caliper', [by('through bore')], false, geo.height).value, 0.35);
  assert.equal(measure('height', [by('bottom face')], false, geo.height).ok, false);
  assert.ok(Math.abs(measure('height', [by('bottom face')], true, geo.height).value - 1.5) < 1e-9, 'flipped, the bottom face is on top');
  const depth = measure('depthmic', [by('top face'), by('floor of the top counterbore')], false, geo.height);
  assert.ok(depth.ok && Math.abs(depth.value - 0.4) < 1e-9);
  assert.equal(measure('depthmic', [by('floor of the top counterbore'), by('top face')], false, geo.height).ok, false, 'rod can’t go up');
  assert.equal(measure('caliper', [by('top face'), by('outside')], false, geo.height).ok, false, 'not parallel');
  const plate = { s: plateSurface(geo.height, false), p: [0, 0, 0] };
  assert.equal(measure('mic', [by('top face'), plate], false, geo.height).value, 1.5);
});
