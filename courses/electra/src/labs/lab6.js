// Lab 6 · Combination circuits. Content written for this app from the EMNG1001 lab sheet;
// circuits, values, tables and procedure order follow the sheet.
import { l6Example, l6Part1, l6Part2, dmmVolt, dmmAmp, dmmOhm } from './figures.js';

const R = (n, nom) => ({ key: `R${n}m`, label: `R<sub>${n}</sub> measured`, plain: `R${n}`, unit: 'kΩ', kind: 'meas', nominal: `${nom} kΩ` });
const C = (key, label, unit) => ({ key, label, unit, kind: 'calc' });
const M = (key, label, unit) => ({ key, label, unit, kind: 'meas' });

const fields = [
  R(1, 2.2), R(2, 4.7), R(3, 5.6), R(4, 10),
  { key: 'p1series', label: 'Which resistors carry the same current (series)?', kind: 'ans', rows: 2, ph: 'e.g. list the resistor names' },
  { key: 'p1parallel', label: 'Which resistors share both ends (parallel)?', kind: 'ans', rows: 2 },
  M('p1Vs', 'Supply voltage V<sub>s</sub> as applied (Part 1)', 'V'),
  C('p1R23', 'R<sub>2,3</sub> (your calculation)', 'kΩ'),
  C('p1RTc', 'R<sub>T</sub> calculated', 'kΩ'), M('p1RTm', 'R<sub>T</sub> measured', 'kΩ'),
  C('p1ITc', 'I<sub>T</sub> calculated', 'mA'), M('p1ITm', 'I<sub>T</sub> measured', 'mA'),
  C('p1V1c', 'V<sub>R1</sub> calculated', 'V'), M('p1V1m', 'V<sub>R1</sub> measured', 'V'),
  C('p1V23c', 'V<sub>R2,3</sub> calculated', 'V'), M('p1V23m', 'V<sub>R2,3</sub> measured', 'V'),
  C('p1V4c', 'V<sub>R4</sub> calculated', 'V'), M('p1V4m', 'V<sub>R4</sub> measured', 'V'),
  C('p1I2c', 'I<sub>R2</sub> calculated', 'mA'), M('p1I2m', 'I<sub>R2</sub> measured', 'mA'),
  C('p1I3c', 'I<sub>R3</sub> calculated', 'mA'), M('p1I3m', 'I<sub>R3</sub> measured', 'mA'),
  { key: 'p1cmp', label: 'Table 2: do calculated and measured agree? Comment on the differences.', kind: 'ans' },
  M('p2Vs', 'Supply voltage V<sub>s</sub> as applied (Part 2)', 'V'),
  C('p2R12c', 'R<sub>1,2</sub> calculated', 'kΩ'), M('p2R12m', 'R<sub>1,2</sub> measured', 'kΩ'),
  C('p2R34c', 'R<sub>3,4</sub> calculated', 'kΩ'), M('p2R34m', 'R<sub>3,4</sub> measured', 'kΩ'),
  C('p2RTc', 'R<sub>T</sub> calculated', 'kΩ'), M('p2RTm', 'R<sub>T</sub> measured', 'kΩ'),
  C('p2I12c', 'I<sub>R1,2</sub> calculated', 'mA'), M('p2I12m', 'I<sub>R1,2</sub> measured', 'mA'),
  C('p2I34c', 'I<sub>R3,4</sub> calculated', 'mA'), M('p2I34m', 'I<sub>R3,4</sub> measured', 'mA'),
  C('p2ITc', 'I<sub>T</sub> calculated', 'mA'), M('p2ITm', 'I<sub>T</sub> measured', 'mA'),
  C('p2V1c', 'V<sub>R1</sub> calculated', 'V'), M('p2V1m', 'V<sub>R1</sub> measured', 'V'),
  C('p2V2c', 'V<sub>R2</sub> calculated', 'V'), M('p2V2m', 'V<sub>R2</sub> measured', 'V'),
  C('p2V3c', 'V<sub>R3</sub> calculated', 'V'), M('p2V3m', 'V<sub>R3</sub> measured', 'V'),
  C('p2V4c', 'V<sub>R4</sub> calculated', 'V'), M('p2V4m', 'V<sub>R4</sub> measured', 'V'),
  { key: 'p2cmp', label: 'Table 3: do calculated and measured agree? Comment on the differences.', kind: 'ans' },
  { key: 'q1', label: 'Q1. In your own words, what is a combination circuit?', kind: 'ans' },
  { key: 'q2', label: 'Q2. What is an equivalent circuit?', kind: 'ans' },
  { key: 'q3', label: 'Q3. What is an equivalent circuit for?', kind: 'ans' },
  { key: 'q4', label: 'Q4. KCL on your Table 2 measurements (Figure 4)', kind: 'ans' },
  { key: 'q5', label: 'Q5. KVL on your Table 2 measurements (Figure 4)', kind: 'ans' },
  { key: 'q6', label: 'Q6. KCL on your Table 3 measurements (Figure 5)', kind: 'ans' },
  { key: 'q7', label: 'Q7. KVL on your Table 3 measurements (Figure 5)', kind: 'ans' },
];

const tables = {
  t1: {
    id: 't1', title: 'Table 1 · Measuring resistances', note: 'Measure each resistor on its own, out of the circuit.',
    head: ['Resistor', 'Nominal', 'Measured (kΩ)'], diff: null,
    rows: [1, 2, 3, 4].map(n => ({ label: `R<sub>${n}</sub>`, nominal: `${[2.2, 4.7, 5.6, 10][n - 1]} kΩ`, keys: [`R${n}m`] })),
  },
  t2: {
    id: 't2', title: 'Table 2 · Circuit of Figure 4', note: 'Calculated column: your own working from Table 1 and V<sub>s</sub>. Measured column: the DMM.',
    head: ['Parameter', 'Calculated', 'Measured'], diff: [0, 1],
    rows: [['R<sub>T</sub> (kΩ)', 'p1RTc', 'p1RTm'], ['I<sub>T</sub> (mA)', 'p1ITc', 'p1ITm'], ['V<sub>R1</sub> (V)', 'p1V1c', 'p1V1m'],
      ['V<sub>R2,3</sub> (V)', 'p1V23c', 'p1V23m'], ['V<sub>R4</sub> (V)', 'p1V4c', 'p1V4m'], ['I<sub>R2</sub> (mA)', 'p1I2c', 'p1I2m'], ['I<sub>R3</sub> (mA)', 'p1I3c', 'p1I3m']]
      .map(([label, a, b]) => ({ label, keys: [a, b] })),
  },
  t3: {
    id: 't3', title: 'Table 3 · Circuit of Figure 5', note: 'Calculated column: your own working from Table 1 and V<sub>s</sub>. Measured column: the DMM.',
    head: ['Parameter', 'Calculated', 'Measured'], diff: [0, 1],
    rows: [['R<sub>1,2</sub> (kΩ)', 'p2R12c', 'p2R12m'], ['R<sub>3,4</sub> (kΩ)', 'p2R34c', 'p2R34m'], ['R<sub>T</sub> (kΩ)', 'p2RTc', 'p2RTm'],
      ['I<sub>R1,2</sub> (mA)', 'p2I12c', 'p2I12m'], ['I<sub>R3,4</sub> (mA)', 'p2I34c', 'p2I34m'], ['I<sub>T</sub> (mA)', 'p2ITc', 'p2ITm'],
      ['V<sub>R1</sub> (V)', 'p2V1c', 'p2V1m'], ['V<sub>R2</sub> (V)', 'p2V2c', 'p2V2m'], ['V<sub>R3</sub> (V)', 'p2V3c', 'p2V3m'], ['V<sub>R4</sub> (V)', 'p2V4c', 'p2V4m']]
      .map(([label, a, b]) => ({ label, keys: [a, b] })),
  },
};

const inR = [1, 2, 3, 4].map(n => ({ key: `R${n}m`, sym: `R${n}`, nom: [2200, 4700, 5600, 10000][n - 1], unit: 'kΩ' }));
const kv = (x, u) => `${x == null ? '?' : Number((x / ({ 'kΩ': 1e3, mA: 1e-3, V: 1 }[u])).toPrecision(4))} ${u}`;

const calcs = {
  p1: {
    id: 'p1', title: 'Figure 4 worked from your readings', where: 'Table 1 and step 5',
    inputs: [...inR, { key: 'p1Vs', sym: 'Vs', nom: 12, unit: 'V' }],
    steps: v => {
      const R23 = v.R2 && v.R3 ? (v.R2 * v.R3) / (v.R2 + v.R3) : null;
      const RT = R23 != null ? v.R1 + R23 + v.R4 : null;
      const IT = RT ? v.Vs / RT : null;
      const V23 = IT != null ? IT * R23 : null;
      return [
        { id: 'p1R23c', rule: '<b>Parallel pair.</b> R₂ and R₃ share both ends, so combine them with product over sum.', f: 'R<sub>2,3</sub> = R₂R₃ / (R₂ + R₃)', s: `(${kv(v.R2, 'kΩ')} × ${kv(v.R3, 'kΩ')}) / (${kv(v.R2, 'kΩ')} + ${kv(v.R3, 'kΩ')})`, r: R23, unit: 'kΩ', mean: 'Smaller than either one: two paths let current through more easily than one.' },
        { id: 'p1RTc', rule: '<b>Series loop.</b> Now R₁, R<sub>2,3</sub> and R₄ are end to end, so add them.', f: 'R<sub>T</sub> = R₁ + R<sub>2,3</sub> + R₄', s: `${kv(v.R1, 'kΩ')} + ${kv(R23, 'kΩ')} + ${kv(v.R4, 'kΩ')}`, r: RT, unit: 'kΩ', mean: 'This is the single resistor the supply “sees”.' },
        { id: 'p1ITc', rule: '<b>Ohm’s law on the whole circuit.</b>', f: 'I<sub>T</sub> = V<sub>s</sub> / R<sub>T</sub>', s: `${kv(v.Vs, 'V')} / ${kv(RT, 'kΩ')}`, r: IT, unit: 'mA', mean: 'Volts ÷ kilohms gives milliamps. All of it flows through R₁ and R₄.' },
        { id: 'p1V1c', rule: '<b>Ohm’s law on R₁.</b>', f: 'V<sub>R1</sub> = I<sub>T</sub> R₁', s: `${kv(IT, 'mA')} × ${kv(v.R1, 'kΩ')}`, r: IT != null ? IT * v.R1 : null, unit: 'V' },
        { id: 'p1V23c', rule: '<b>Voltage across the parallel pair.</b> R₂ and R₃ both get this same voltage.', f: 'V<sub>R2,3</sub> = I<sub>T</sub> R<sub>2,3</sub>', s: `${kv(IT, 'mA')} × ${kv(R23, 'kΩ')}`, r: V23, unit: 'V' },
        { id: 'p1V4c', rule: '<b>Ohm’s law on R₄.</b>', f: 'V<sub>R4</sub> = I<sub>T</sub> R₄', s: `${kv(IT, 'mA')} × ${kv(v.R4, 'kΩ')}`, r: IT != null ? IT * v.R4 : null, unit: 'V' },
        { id: 'p1I2c', rule: '<b>Split of the current.</b> Each branch gets V<sub>R2,3</sub> ÷ its own resistance.', f: 'I<sub>R2</sub> = V<sub>R2,3</sub> / R₂', s: `${kv(V23, 'V')} / ${kv(v.R2, 'kΩ')}`, r: V23 != null ? V23 / v.R2 : null, unit: 'mA' },
        { id: 'p1I3c', rule: '', f: 'I<sub>R3</sub> = V<sub>R2,3</sub> / R₃', s: `${kv(V23, 'V')} / ${kv(v.R3, 'kΩ')}`, r: V23 != null ? V23 / v.R3 : null, unit: 'mA', mean: 'Check: I<sub>R2</sub> + I<sub>R3</sub> should equal I<sub>T</sub> (that is KCL).' },
      ];
    },
  },
  p2: {
    id: 'p2', title: 'Figure 5 worked from your readings', where: 'Table 1 and Part 2 step 2',
    inputs: [...inR, { key: 'p2Vs', sym: 'Vs', nom: 12, unit: 'V' }],
    steps: v => {
      const R12 = v.R1 != null && v.R2 != null ? v.R1 + v.R2 : null;
      const R34 = v.R3 != null && v.R4 != null ? v.R3 + v.R4 : null;
      const RT = R12 && R34 ? (R12 * R34) / (R12 + R34) : null;
      const I12 = R12 ? v.Vs / R12 : null, I34 = R34 ? v.Vs / R34 : null;
      return [
        { id: 'p2R12c', rule: '<b>Left branch.</b> R₁ and R₂ are end to end: add.', f: 'R<sub>1,2</sub> = R₁ + R₂', s: `${kv(v.R1, 'kΩ')} + ${kv(v.R2, 'kΩ')}`, r: R12, unit: 'kΩ' },
        { id: 'p2R34c', rule: '<b>Right branch.</b> R₃ and R₄ are end to end: add.', f: 'R<sub>3,4</sub> = R₃ + R₄', s: `${kv(v.R3, 'kΩ')} + ${kv(v.R4, 'kΩ')}`, r: R34, unit: 'kΩ' },
        { id: 'p2RTc', rule: '<b>Two branches in parallel.</b> Product over sum.', f: 'R<sub>T</sub> = R<sub>1,2</sub>R<sub>3,4</sub> / (R<sub>1,2</sub> + R<sub>3,4</sub>)', s: `(${kv(R12, 'kΩ')} × ${kv(R34, 'kΩ')}) / (${kv(R12, 'kΩ')} + ${kv(R34, 'kΩ')})`, r: RT, unit: 'kΩ' },
        { id: 'p2I12c', rule: '<b>Each branch sits right across the supply</b>, so each one gets the full V<sub>s</sub>.', f: 'I<sub>R1,2</sub> = V<sub>s</sub> / R<sub>1,2</sub>', s: `${kv(v.Vs, 'V')} / ${kv(R12, 'kΩ')}`, r: I12, unit: 'mA' },
        { id: 'p2I34c', rule: '', f: 'I<sub>R3,4</sub> = V<sub>s</sub> / R<sub>3,4</sub>', s: `${kv(v.Vs, 'V')} / ${kv(R34, 'kΩ')}`, r: I34, unit: 'mA' },
        { id: 'p2ITc', rule: '<b>Total current.</b>', f: 'I<sub>T</sub> = V<sub>s</sub> / R<sub>T</sub>', s: `${kv(v.Vs, 'V')} / ${kv(RT, 'kΩ')}`, r: RT ? v.Vs / RT : null, unit: 'mA', mean: 'Check: it should equal I<sub>R1,2</sub> + I<sub>R3,4</sub>.' },
        { id: 'p2V1c', rule: '<b>Voltage drops</b> inside each branch (that branch’s current × the resistor).', f: 'V<sub>R1</sub> = I<sub>R1,2</sub> R₁', s: `${kv(I12, 'mA')} × ${kv(v.R1, 'kΩ')}`, r: I12 != null ? I12 * v.R1 : null, unit: 'V' },
        { id: 'p2V2c', rule: '', f: 'V<sub>R2</sub> = I<sub>R1,2</sub> R₂', s: `${kv(I12, 'mA')} × ${kv(v.R2, 'kΩ')}`, r: I12 != null ? I12 * v.R2 : null, unit: 'V' },
        { id: 'p2V3c', rule: '', f: 'V<sub>R3</sub> = I<sub>R3,4</sub> R₃', s: `${kv(I34, 'mA')} × ${kv(v.R3, 'kΩ')}`, r: I34 != null ? I34 * v.R3 : null, unit: 'V' },
        { id: 'p2V4c', rule: '', f: 'V<sub>R4</sub> = I<sub>R3,4</sub> R₄', s: `${kv(I34, 'mA')} × ${kv(v.R4, 'kΩ')}`, r: I34 != null ? I34 * v.R4 : null, unit: 'V', mean: 'Check: V<sub>R1</sub> + V<sub>R2</sub> and V<sub>R3</sub> + V<sub>R4</sub> should each add up to V<sub>s</sub> (KVL).' },
      ];
    },
  },
};

// which calculator step checks each "your calculation" field
const checks = {
  p1R23: ['p1', 'p1R23c'], p1RTc: ['p1', 'p1RTc'], p1ITc: ['p1', 'p1ITc'], p1V1c: ['p1', 'p1V1c'], p1V23c: ['p1', 'p1V23c'],
  p1V4c: ['p1', 'p1V4c'], p1I2c: ['p1', 'p1I2c'], p1I3c: ['p1', 'p1I3c'],
  p2R12c: ['p2', 'p2R12c'], p2R34c: ['p2', 'p2R34c'], p2RTc: ['p2', 'p2RTc'], p2I12c: ['p2', 'p2I12c'], p2I34c: ['p2', 'p2I34c'],
  p2ITc: ['p2', 'p2ITc'], p2V1c: ['p2', 'p2V1c'], p2V2c: ['p2', 'p2V2c'], p2V3c: ['p2', 'p2V3c'], p2V4c: ['p2', 'p2V4c'],
};

const figs = {
  example: { draw: s => l6Example(s), stages: ['Figure 1', 'Figure 2', 'Figure 3'], hl: [{ t: 'ga', label: 'Series pair' }, { t: 'gb', label: 'Parallel pair' }], caption: 'The sheet’s worked example. Its values (3.3, 4.7, 6.8 kΩ) are not your kit.' },
  part1: { draw: (s, o) => l6Part1(s, o), stages: ['As built', 'Merge R₂ ∥ R₃', 'One resistor'], hl: [{ t: 'ga', label: 'Same current' }, { t: 'gb', label: 'Same voltage' }], arrows: true, flow: true, caption: 'Figure 4 · Part 1. R₂ and R₃ form the parallel pair; R₁ and R₄ carry all of I<sub>T</sub>.' },
  part2: { draw: (s, o) => l6Part2(s, o), stages: ['As built', 'Add each branch', 'One resistor'], hl: [{ t: 'ga', label: 'Left branch' }, { t: 'gb', label: 'Right branch' }], arrows: true, flow: true, caption: 'Figure 5 · Part 2. Two series branches, each placed straight across the supply.' },
  volt: { draw: () => dmmVolt(), caption: 'Voltage: the meter goes <b>across</b> the part, circuit powered.' },
  amp: { draw: () => dmmAmp(), caption: 'Current: open the circuit and put the meter <b>in series</b>, so the current has to flow through it.' },
  ohm: { draw: () => dmmOhm(), caption: 'Resistance: <b>power off</b> and the part disconnected, meter across it.' },
};

export default {
  id: 'lab6', num: 6, title: 'Combination circuits', icon: '🔀', minutes: 90,
  tagline: 'Spot what is in series and what is in parallel, shrink the circuit to one resistor, then check your maths with the DMM.',
  overview: {
    about: 'A <b>combination circuit</b> mixes series and parallel parts. You solve it by replacing groups of resistors with one <b>equivalent</b> resistor, step by step, until only one is left.',
    build: 'Two circuits on the breadboard from the same four resistors (2.2, 4.7, 5.6 and 10 kΩ) and a 12 V supply. You measure every resistor, then the voltages and currents in each circuit.',
    understand: ['How to tell series from parallel by looking at the connections', 'How to reduce a circuit to R<sub>T</sub> and work back out with Ohm’s law', 'Why calculated and measured values differ a little', 'How KCL and KVL let you check your own readings'],
  },
  fields, tables, calcs, checks, figs,
  sections: [
    { kicker: 'Concept', title: 'Series or parallel? Look at the ends', fig: 'example',
      html: `<p><b>Series</b> means connected end to end with nothing else joining in between. The <b>same current</b> has to go through each part, one after the other.</p>
        <p><b>Parallel</b> means both ends of one part are wired straight to both ends of another. They get the <b>same voltage</b>.</p>
        <p>In the sheet’s example, R₂ and R₃ are end to end, so they become R<sub>a</sub> = 4.7 + 6.8 = 11.5 kΩ. Then R₁ sits across R<sub>a</sub> (both ends joined), so they are in parallel:</p>
        <div class="formula">R<sub>T</sub> = [ 1/R₁ + 1/R<sub>a</sub> ]<sup>−1</sup> = [ 1/3.3 + 1/11.5 ]<sup>−1</sup> ≈ 2.564 kΩ</div>
        <p class="tip">Tap the figure buttons to walk through the sheet’s Figures 1 → 2 → 3.</p>` },
    { kicker: 'Concept', title: 'The two shortcuts you need', html: `<div class="two">
        <div class="formula big">Series: R = R₁ + R₂ + …</div>
        <div class="formula big">Two in parallel: R = R₁R₂ / (R₁ + R₂)</div></div>
        <p>For exactly two resistors in parallel, “product over sum” is the same as the 1/R formula, just quicker on a calculator. The parallel result is always <b>smaller than the smallest</b> resistor. That makes a good sanity check.</p>
        <p><b>Ohm’s law</b> (V = IR) then works on any single resistor, or on the whole circuit using R<sub>T</sub>. A handy unit fact: <b>volts ÷ kΩ = mA</b>, and <b>mA × kΩ = V</b>.</p>` },
    { kicker: 'Part 1 · Steps 1–2', title: 'Measure the four resistors first', fig: 'ohm',
      html: `<p>Real resistors are close to their printed (nominal) value, not exactly on it. The sheet wants your calculations to use the <b>measured</b> values, so measure each one alone, before it goes into the circuit.</p>
        {{table:t1}}` },
    { kicker: 'Part 1 · Steps 3–4', title: 'Build Figure 4 and read its shape', fig: 'part1',
      html: `<p>R₁ leaves the supply’s + side and R₄ comes back to the − side. Between them, R₂ and R₃ both connect to the same two junctions.</p>
        <p>Use the highlight buttons on the figure to check your thinking, then answer the sheet’s two questions in your own words:</p>
        {{field:p1series}}{{field:p1parallel}}` },
    { kicker: 'Part 1 · Steps 5–6', title: 'Calculate Figure 4 from your own readings', fig: 'part1', figStage: 1,
      html: `<p>Measure V<sub>s</sub> at the circuit (it is rarely exactly 12.00 V), then reduce: R₂ ∥ R₃ → R<sub>2,3</sub>, add the series parts to get R<sub>T</sub>, find I<sub>T</sub>, and work back out to each resistor.</p>
        {{field:p1Vs}}{{field:p1R23}}{{calc:p1}}
        <p class="tip">Type your own answers into the <b>Calculated</b> column of Table 2 below. A ✓ appears when your number matches the working above.</p>` },
    { kicker: 'Part 1 · Steps 7–9', title: 'Measure Figure 4 and compare', fig: 'volt',
      html: `<p><b>R<sub>T</sub> with the supply disconnected</b>: meter across the two points where the supply was attached. Then reconnect and measure the voltages across each resistor and the currents (meter in series).</p>
        {{table:t2}}{{field:p1cmp}}
        <p class="note">The <b>Difference</b> column is worked out from the two numbers you typed: (measured − calculated) ÷ calculated. A few percent usually comes from meter accuracy, rounding, and the resistance of the wires and breadboard.</p>` },
    { kicker: 'Part 2 · Steps 1–3', title: 'Figure 5: two series branches in parallel', fig: 'part2',
      html: `<p>This time R₁ + R₂ form one branch and R₃ + R₄ form another. Both branches connect straight across the supply, so each branch gets the whole V<sub>s</sub>.</p>
        {{field:p2Vs}}{{calc:p2}}` },
    { kicker: 'Part 2 · Steps 4–6', title: 'Measure Figure 5 and compare', fig: 'amp',
      html: `<p>With the supply disconnected, measure R<sub>T</sub> and the resistance of each branch (R<sub>1,2</sub>, R<sub>3,4</sub>). Then power it and measure the currents and voltage drops.</p>
        {{table:t3}}{{field:p2cmp}}` },
    { kicker: 'Part 3', title: 'Questions: KCL and KVL on your results', html: `
        <p><b>KCL</b> (current law): the current going into a junction equals the current coming out. <b>KVL</b> (voltage law): around any closed loop, the voltage rises equal the drops.</p>
        <p><b>How to apply them to your tables</b> (use your measured column):</p>
        <ul><li>Figure 4, KCL: at the junction after R₁, does I<sub>T</sub> ≈ I<sub>R2</sub> + I<sub>R3</sub>?</li>
        <li>Figure 4, KVL: going round the loop through R₁, the parallel pair and R₄, does V<sub>s</sub> ≈ V<sub>R1</sub> + V<sub>R2,3</sub> + V<sub>R4</sub>?</li>
        <li>Figure 5, KCL: does I<sub>T</sub> ≈ I<sub>R1,2</sub> + I<sub>R3,4</sub>?</li>
        <li>Figure 5, KVL: is V<sub>R1</sub> + V<sub>R2</sub> ≈ V<sub>s</sub>, and V<sub>R3</sub> + V<sub>R4</sub> ≈ V<sub>s</sub>?</li></ul>
        <p>Write the sums with your numbers, then say how close they came.</p>
        {{kcl}}
        {{field:q1}}{{field:q2}}{{field:q3}}{{field:q4}}{{field:q5}}{{field:q6}}{{field:q7}}` },
  ],
  guide: [
    { part: 'Before you start', title: 'Set up safely', fig: 'part1',
      do: 'Get your kit and the DC power supply from the bench as your instructor directs. Leave the supply <b>off</b> for now.',
      observe: 'Check the power cord and the supply look undamaged.',
      why: 'You will build and rebuild circuits several times. Doing every change with the power off protects you, the meter and the parts.',
      watch: 'Never use a broken cord or damaged mains-powered equipment. Use only the college’s kit.' },
    { part: 'Part 1', title: 'Find the four resistors', fields: [],
      do: 'Take out the 2.2 kΩ, 4.7 kΩ, 5.6 kΩ and 10 kΩ resistors. They become R₁, R₂, R₃ and R₄ in that order.',
      observe: 'Read the colour bands, or check the labels in your kit.',
      why: 'Both circuits in this lab reuse these four, so keep them in that order on the bench.',
      hint: '2.2 k = red red red. 4.7 k = yellow violet red. 5.6 k = green blue red. 10 k = brown black orange.' },
    { part: 'Part 1 · Step 2', title: 'Measure each resistor', fig: 'ohm', table: 't1',
      do: 'Set the DMM to Ω. Hold each resistor by one lead only and touch the probes to its two ends. Type each reading in kΩ.',
      observe: 'A reading close to the nominal value, within the tolerance band (usually ±5%).',
      why: 'An ohmmeter pushes a small current of its own through the part. That is why it must not be powered by anything else.',
      watch: 'Touching both leads with your fingers adds your body’s resistance in parallel and lowers the reading.',
      hint: 'If the meter shows “OL” or 1., you are on too low a range or not touching the leads.' },
    { part: 'Part 1 · Step 3', title: 'Build Figure 4', fig: 'part1',
      do: 'With the supply off, build Figure 4: R₁ from +, then R₂ and R₃ side by side between the same two rows, then R₄ back to −. Then switch on and set the supply to 12 V.',
      observe: 'R₂ and R₃ must share both of their rows. R₁ and R₄ each share only one row with the pair.',
      why: 'Breadboard rows are the junctions. Two leads in the same row are connected.',
      watch: 'Double-check before powering: one misplaced lead turns a parallel pair into series.',
      hint: 'Trace with your finger from + back to −. You should only ever have a choice of paths at the R₂/R₃ junctions.' },
    { part: 'Part 1 · Step 4', title: 'Name the topology', fig: 'part1', fields: ['p1series', 'p1parallel'],
      do: 'Answer in your own words: which resistors carry the same current, and which share both ends?',
      observe: 'Use the figure’s highlight buttons only after you have decided.',
      why: 'Spotting series and parallel is the whole skill of this lab. Everything else follows from it.' },
    { part: 'Part 1 · Step 5', title: 'Measure the supply at the circuit', fig: 'volt', fields: ['p1Vs'],
      do: 'DMM on DC V. Red probe on the supply’s + where it enters the circuit, black on −.',
      observe: 'Something close to 12 V. Type exactly what the meter shows.',
      why: 'The supply’s own display can be off by a little. Your calculations should use what actually reaches the circuit.' },
    { part: 'Part 1 · Step 6', title: 'Calculate Figure 4', fig: 'part1', figStage: 1, calc: 'p1', fields: ['p1R23', 'p1RTc', 'p1ITc', 'p1V1c', 'p1V23c', 'p1V4c', 'p1I2c', 'p1I3c'],
      do: 'Work through the steps on paper or a calculator, using <b>your</b> Table 1 values and V<sub>s</sub>. Type each result.',
      observe: 'A ✓ next to each value means it matches the working shown here.',
      why: 'R₂ ∥ R₃ is replaced by one resistor, leaving a plain series loop. Ohm’s law on the loop gives I<sub>T</sub>, and I<sub>T</sub> gives each drop.',
      hint: 'Keep the units straight: V ÷ kΩ = mA. If I<sub>T</sub> comes out in the thousands, you divided by ohms instead of kilohms.' },
    { part: 'Part 1 · Step 7', title: 'Measure R<sub>T</sub> with the supply off', fig: 'ohm', fields: ['p1RTm'],
      do: 'Disconnect the supply leads from the circuit. Put the DMM (Ω) across the two points where the supply was attached.',
      observe: 'A value close to your calculated R<sub>T</sub>.',
      why: 'With the supply removed, the ohmmeter sees the whole network as one equivalent resistor.',
      watch: 'Never measure resistance on a powered circuit.' },
    { part: 'Part 1 · Step 8', title: 'Measure voltages and currents', fig: 'amp', fields: ['p1ITm', 'p1V1m', 'p1V23m', 'p1V4m', 'p1I2m', 'p1I3m'],
      do: 'Reconnect the supply. Measure each voltage with the meter across the part. For each current, switch the supply off, open the circuit at that point, put the meter in series (A or mA jack), then switch it back on.',
      observe: 'I<sub>R2</sub> + I<sub>R3</sub> should come close to I<sub>T</sub>.',
      why: 'An ammeter has almost no resistance, so it must be in the path of the current. Put across a part, it would short it.',
      watch: 'Move the red lead back to the V jack after measuring current. Many blown meter fuses happen here.',
      hint: 'Current through R₁ is I<sub>T</sub>. You can measure it on the wire between the supply and R₁.' },
    { part: 'Part 1 · Step 9', title: 'Compare Table 2', table: 't2', fields: ['p1cmp'],
      do: 'Look at the Difference column and write a short comment.',
      observe: 'Small differences of a few percent are normal.',
      why: 'Meters have limited accuracy, readings get rounded, and wires and breadboard contacts add a little resistance.' },
    { part: 'Part 2 · Step 1', title: 'Build Figure 5', fig: 'part2',
      do: 'Switch the supply off. Rebuild as Figure 5: R₁ over R₂ as one branch, R₃ over R₄ as the other, both branches across the supply. Set 12 V.',
      observe: 'Each branch connects to + at the top and − at the bottom.',
      why: 'Same four resistors, new arrangement, so the answers will be completely different.' },
    { part: 'Part 2 · Step 2', title: 'Measure the supply again', fig: 'volt', fields: ['p2Vs'],
      do: 'Measure V<sub>s</sub> at the circuit as before.', observe: 'Close to 12 V.', why: 'The load changed, so the supply’s output can shift a little.' },
    { part: 'Part 2 · Step 3', title: 'Calculate Figure 5', fig: 'part2', figStage: 1, calc: 'p2', fields: ['p2R12c', 'p2R34c', 'p2RTc', 'p2I12c', 'p2I34c', 'p2ITc', 'p2V1c', 'p2V2c', 'p2V3c', 'p2V4c'],
      do: 'Add each branch, combine the two branches in parallel, then use Ohm’s law branch by branch.',
      observe: 'R<sub>T</sub> should be smaller than either branch.',
      why: 'Each branch is straight across V<sub>s</sub>, so branch current = V<sub>s</sub> ÷ branch resistance. Inside a branch, the current is the same through both resistors.' },
    { part: 'Part 2 · Step 4', title: 'Measure the resistances, supply off', fig: 'ohm', fields: ['p2RTm', 'p2R12m', 'p2R34m'],
      do: 'Disconnect the supply. Measure R<sub>T</sub> across the supply points, then each branch on its own.',
      watch: 'To read one branch alone, lift one end of the other branch. Otherwise the meter sees both in parallel.',
      why: 'With both branches connected, an ohmmeter across one branch actually measures the whole parallel combination.' },
    { part: 'Part 2 · Step 5', title: 'Measure currents and drops', fig: 'amp', fields: ['p2I12m', 'p2I34m', 'p2ITm', 'p2V1m', 'p2V2m', 'p2V3m', 'p2V4m'],
      do: 'Reconnect the supply. Measure the four voltage drops and the three currents.',
      observe: 'V<sub>R1</sub> + V<sub>R2</sub> ≈ V<sub>s</sub> and V<sub>R3</sub> + V<sub>R4</sub> ≈ V<sub>s</sub>.',
      why: 'Each branch is its own little series circuit across the supply.' },
    { part: 'Part 2 · Step 6', title: 'Compare Table 3', table: 't3', fields: ['p2cmp'],
      do: 'Comment on how close calculated and measured came.', why: 'Same reasons as Part 1: meter accuracy, rounding and contact resistance.' },
    { part: 'Part 3', title: 'KCL, KVL and the questions', fields: ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7'], kcl: true,
      do: 'Use your measured numbers to write out each KCL and KVL check, then answer Q1–Q3 in your own words.',
      why: 'If your measured currents and voltages satisfy KCL and KVL, your readings are consistent with each other.',
      hint: 'An equivalent circuit behaves the same as the original <i>as seen from its terminals</i>, which is why it makes the maths simpler.' },
  ],
};
