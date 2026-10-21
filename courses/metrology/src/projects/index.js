// index.js - the shop projects from the class workbook. Each one is a part type, a unit, and which tool
// measures which kind of dimension (and to what step). Projects 10 (coordinates) and 11 (sine bar) need
// tools this site doesn't simulate yet.
import { makeRng } from '../core/rng.js';
import { PARTS } from './parts.js';

const RULE = { frac: ['rule-frac', { grad: 64 }], dec: ['rule-dec', { grad: 0.02 }], mm: ['rule-mm', { grad: 0.5 }] };
const PLATE = ['prot-plate', {}];

export const PROJECTS = [
  { id: 'p1', num: 1, title: 'Inch ruler (fraction)', part: 'stepBlock', unit: 'in', toolNote: 'Inch rule, nearest 1/64"', res: { len: 1 / 64 }, tools: { len: RULE.frac, angle: PLATE }, module: '1' },
  { id: 'p2', num: 2, title: 'Inch ruler (decimal)', part: 'stepBlock', unit: 'in', toolNote: 'Inch rule, nearest .02"', res: { len: 0.02 }, tools: { len: RULE.dec, angle: PLATE }, module: '1' },
  { id: 'p3', num: 3, title: 'Metric ruler', part: 'stepBlock', unit: 'mm', toolNote: 'Metric rule, nearest 0.5 mm', res: { len: 0.5 }, tools: { len: RULE.mm, angle: PLATE }, module: '1' },
  { id: 'p4', num: 4, title: 'Inch vernier caliper', part: 'stepPlate', unit: 'in', toolNote: 'Inch vernier caliper, nearest .001"', res: { len: 0.001 }, tools: { len: ['vernier-in', {}], depth: ['vernier-in', {}] }, module: '3' },
  { id: 'p5', num: 5, title: 'Metric vernier caliper', part: 'stepPlate', unit: 'mm', toolNote: 'Metric vernier caliper, nearest 0.02 mm', res: { len: 0.02 }, tools: { len: ['vernier-mm', {}], depth: ['vernier-mm', {}] }, module: '3' },
  { id: 'p6', num: 6, title: 'Imperial measurement (shaft)', part: 'stepShaft', unit: 'in', toolNote: 'Height gage for lengths, inch micrometer for diameters', res: { len: 0.001, dia: 0.001 }, tools: { len: ['height-in', {}], dia: ['mic-in', {}] }, module: '5' },
  { id: 'p7', num: 7, title: 'Metric measurement (shaft)', part: 'stepShaft', unit: 'mm', toolNote: 'Vernier caliper for lengths, metric micrometer for diameters', res: { len: 0.02, dia: 0.01 }, tools: { len: ['vernier-mm', {}], dia: ['mic-mm', {}] }, module: '5' },
  { id: 'p8', num: 8, title: 'Imperial measurement (bushing)', part: 'stepBushing', unit: 'in', toolNote: 'Vernier and depth micrometer for lengths, micrometer with telescoping gauge for diameters', res: { len: 0.001, dia: 0.001 }, tools: { len: ['vernier-in', {}], depth: ['depth-in', {}], dia: ['mic-in', {}], bore: ['mic-in', {}] }, module: '6' },
  { id: 'p9', num: 9, title: 'Metric measurement (bushing)', part: 'stepBushing', unit: 'mm', toolNote: 'Vernier for lengths and depths, micrometer with telescoping gauge for diameters', res: { len: 0.02, dia: 0.01 }, tools: { len: ['vernier-mm', {}], depth: ['vernier-mm', {}], dia: ['mic-mm', {}], bore: ['mic-mm', {}] }, module: '6' },
];

export const PART_NAMES = { stepBlock: 'Step block', stepPlate: 'Step plate', stepShaft: 'Step shaft', stepBushing: 'Step bushing' };

// How to take each kind of measurement, shown with the reading.
export const HOW = {
  len: 'Measure it, then read the tool.',
  depth: 'Use the depth end of the tool: rest it on the top face and bring the rod or spindle down to the bottom.',
  dia: 'Measure across the diameter, square to the part.',
  bore: 'Set a telescoping gauge in the bore, lock it, take it out, then measure the gauge with the micrometer.',
  angle: 'Set the blade along the sloped face and the base along the bottom.',
};

// The part for a project and seed: always the same part for the same seed (so a refresh keeps it).
export function makePart(project, seed) {
  return PARTS[project.part](makeRng(seed), project.unit, { len: project.res.len, dia: project.res.dia ?? project.res.len });
}

export const toolFor = (project, feature) => project.tools[feature.kind];
