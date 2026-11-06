// labs.test.js - the in-class lab content: every token resolves, every check points at a real step,
// and the theory numbers match a hand calculation.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import lab6 from '../src/labs/lab6.js';
import lab7 from '../src/labs/lab7.js';
import lab8 from '../src/labs/lab8.js';
import lab9 from '../src/labs/lab9.js';

const LABS = [lab6, lab7, lab8, lab9];
const nom = c => Object.fromEntries(c.inputs.map(i => [i.sym, i.nom]));
const step = (c, id) => c.steps(nom(c), true).find(s => s.id === id).r;
const near = (a, b, tol = 1e-3) => assert.ok(Math.abs(a - b) <= Math.abs(b) * tol, `${a} vs ${b}`);

for (const L of LABS) {
  test(`${L.id}: every token, field, table, figure and calc exists`, () => {
    const keys = new Set(L.fields.map(f => f.key));
    for (const s of L.sections) {
      for (const [, kind, arg] of s.html.matchAll(/\{\{(\w+)(?::(\w+))?\}\}/g)) {
        if (kind === 'field') assert.ok(keys.has(arg), `field ${arg}`);
        if (kind === 'table') assert.ok(L.tables[arg], `table ${arg}`);
        if (kind === 'calc') assert.ok(L.calcs[arg], `calc ${arg}`);
      }
      if (s.fig) assert.ok(L.figs[s.fig], `fig ${s.fig}`);
    }
    for (const g of L.guide) {
      (g.fields || []).forEach(k => assert.ok(keys.has(k), `guide field ${k}`));
      if (g.table) assert.ok(L.tables[g.table], `guide table ${g.table}`);
      if (g.calc) assert.ok(L.calcs[g.calc], `guide calc ${g.calc}`);
      if (g.fig) assert.ok(L.figs[g.fig], `guide fig ${g.fig}`);
      assert.ok(g.do, `guide step "${g.title}" says what to do`);
    }
    for (const t of Object.values(L.tables)) t.rows.forEach(r => r.keys.forEach(k => assert.ok(keys.has(k), `table key ${k}`)));
    for (const [k, ck] of Object.entries(L.checks || {})) {
      assert.ok(keys.has(k), `check on ${k}`);
      if (Array.isArray(ck)) assert.ok(L.calcs[ck[0]].steps(nom(L.calcs[ck[0]]), true).some(s => s.id === ck[1]), `check step ${ck}`);
    }
    for (const f of Object.values(L.figs)) assert.match(f.draw(0, {}), /^<svg/);
  });
}

test('no field is ever pre-filled with a value', () => {
  for (const L of LABS) for (const f of L.fields) assert.equal(f.value, undefined, f.key);
});

test('lab 6: nominal worked example', () => {
  const c = lab6.calcs.p1;
  near(step(c, 'p1R23c'), 4700 * 5600 / 10300);
  near(step(c, 'p1RTc'), 2200 + 4700 * 5600 / 10300 + 10000);
  near(step(lab6.calcs.p2, 'p2RTc'), 6900 * 15600 / 22500);
});

test('lab 7: balance and wye-delta', () => {
  near(step(lab7.calcs.bal, 'R6bal'), 10000);
  near(step(lab7.calcs.wye, 'tRBE'), 1119.46, 1e-4);
  near(step(lab7.calcs.wye, 'tRT'), 2339.46, 1e-4);
});

test('lab 9: time constant and the 1.6 kHz theory', () => {
  near(step(lab9.calcs.tau, 'tau'), 1e-4);
  near(step(lab9.calcs.th, 'V2pp'), 3.5257, 1e-3);
  near(step(lab9.calcs.th, 'th'), -45.15, 1e-3);
});
