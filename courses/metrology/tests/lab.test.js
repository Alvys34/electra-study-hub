// lab.test.js - the lab progression rules that fix the "Next freezes / solved gets forgotten" bug.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as L from '../src/core/lab.js';

test('Next after a correct answer always moves on, and the solve is kept', () => {
  let s = L.createLab('lab-1', 10, 42);
  s = L.solve(s);
  s = L.next(s);
  assert.equal(s.current, 1);
  assert.deepEqual(s.solved, [0]);
});

test('jumping by number keeps every earlier solve', () => {
  let s = L.createLab('lab-1', 10, 42);
  s = L.solve(L.goTo(s, 3));
  s = L.goTo(s, 7);
  s = L.solve(s);
  s = L.goTo(s, 0);
  assert.deepEqual(s.solved, [3, 7]);
  assert.ok(L.isSolved(s, 3) && L.isSolved(s, 7) && !L.isSolved(s, 0));
});

test('Next from the last problem opens the results, and never goes past them', () => {
  let s = L.goTo(L.createLab('lab-1', 10, 1), 9);
  s = L.next(s);
  assert.ok(L.onSummary(s));
  assert.equal(L.next(s).current, 10);
  assert.equal(L.goTo(s, -4).current, 0);
});

test('solving twice or missing does not change the solved list', () => {
  let s = L.solve(L.solve(L.createLab('lab-1', 10, 1)));
  s = L.miss(s);
  assert.deepEqual(s.solved, [0]);
  assert.equal(L.triesAt(s), 1);
});

test('a refresh restores the same lab, and junk is rejected', () => {
  let s = L.solve(L.goTo(L.createLab('lab-2', 10, 99), 4));
  const back = L.restore(JSON.parse(JSON.stringify(s)), 'lab-2', 10);
  assert.deepEqual(back, s);
  assert.equal(L.restore({ id: 'lab-2', count: 8, seed: 1 }, 'lab-2', 10), null);
  assert.equal(L.restore(null, 'lab-2', 10), null);
  assert.deepEqual(L.restore({ id: 'lab-2', count: 10, seed: 1, solved: [1, 50, 'x'] }, 'lab-2', 10).solved, [1]);
});
