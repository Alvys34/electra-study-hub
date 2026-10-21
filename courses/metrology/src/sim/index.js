// index.js - every instrument the course can draw, by id. Each tool knows how to draw a reading,
// explain it step by step, make random readings, and check an answer.
import { makeRule } from './rule.js';
import { makeVernier } from './vernier.js';
import { dial } from './dial.js';
import { makeMic } from './micrometer.js';
import { makeProtractor } from './protractor.js';
import { convert } from './convert.js';

const list = [
  makeRule('frac'), makeRule('dec'), makeRule('mm'),
  convert,
  makeVernier('in'), makeVernier('mm'), dial,
  makeProtractor('bevel'), makeProtractor('plate'),
  makeMic('in'), makeMic('mm'), makeMic('depth'),
  makeVernier('in', true),
];

export const TOOLS = Object.fromEntries(list.map(t => [t.id, t]));
export const TOOL_LIST = list;

// Checks return true/false or { ok, msg }; this gives every caller the same shape.
export function checkAnswer(tool, input, spec) {
  const r = tool.check(input, spec);
  return typeof r === 'object' && r ? r : { ok: !!r };
}
