// tools.test.js - every instrument's worked steps must add up to its answer, and its own answer must pass its check.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TOOL_LIST, checkAnswer } from '../src/sim/index.js';
import { makeRng } from '../src/core/rng.js';
import { parseNum, fmtIn } from '../src/core/answer.js';
import { MODULES } from '../src/content/modules.js';
import { makeProblems } from '../src/ui/problems.js';

const plain = html => html.replace(/<[^>]+>/g, '').replace(/&[a-z]+;/g, '');

// What a student would type for the tool's own answer.
function typed(tool, spec) {
  if (tool.unit === 'angle') return { deg: String(Math.floor(spec.value / 60)), min: String(spec.value % 60) };
  if (tool.unit === 'deg') return { deg: String(spec.value), min: '' };
  return plain(tool.answer(spec)).replace(/=.*$/, '').replace(/[″"]|mm/g, '').trim();
}

for (const tool of TOOL_LIST) {
  test(`${tool.id}: random readings draw, explain and check themselves`, () => {
    const rng = makeRng(7);
    for (let k = 0; k < 300; k++) {
      const spec = tool.random(rng, tool.variants?.[k % tool.variants.length]?.spec);
      assert.ok(tool.draw(spec, { reveal: k % 2 === 0 }).startsWith('<svg'));
      assert.ok(tool.steps(spec).length >= 2);
      assert.ok(checkAnswer(tool, typed(tool, spec), spec).ok, `${tool.id} rejects its own answer ${JSON.stringify(typed(tool, spec))} for ${JSON.stringify(spec)}`);
    }
  });
}

test('wrong answers are rejected', () => {
  const rng = makeRng(3);
  for (const tool of TOOL_LIST) {
    const spec = tool.random(rng);
    const wrong = tool.unit === 'angle' ? { deg: String(Math.floor(spec.value / 60)), min: String((spec.value % 60 + 30) % 60) }
      : tool.unit === 'deg' ? { deg: String(spec.value + 1) } : '999';
    assert.equal(checkAnswer(tool, wrong, spec).ok, false, tool.id);
  }
});

test('vernier steps add up: the last step total equals the reading', () => {
  const t = TOOL_LIST.find(x => x.id === 'vernier-in');
  for (let n = 100; n < 6000; n += 37) {
    const spec = { ...t.base, value: n / 1000 };
    const last = plain(t.steps(spec).at(-1));
    const parts = last.match(/(\d*\.\d+)/g).map(Number);
    assert.equal(Math.round((parts[0] + parts[1] + parts[2]) * 1000), n);
    assert.equal(parts[3], Number(fmtIn(n / 1000)));
  }
});

test('parseNum reads shop notation', () => {
  assert.equal(parseNum('1-3/8'), 1.375);
  assert.equal(parseNum('1 3/8"'), 1.375);
  assert.equal(parseNum('.375'), 0.375);
  assert.equal(parseNum('12,70 mm'), 12.7);
  assert.ok(Number.isNaN(parseNum('abc')));
});

test('every module lab makes 10 problems, the same ones for the same seed', () => {
  for (const m of MODULES) {
    const a = makeProblems(m.lab, 123), b = makeProblems(m.lab, 123);
    assert.equal(a.length, 10, m.id);
    assert.deepEqual(a.map(p => p.spec), b.map(p => p.spec));
  }
});
