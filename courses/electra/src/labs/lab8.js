// Lab 8 · RC circuits. Content written for this app from the EMNG1001 lab sheet; the LED-and-switch
// circuit (Figure 2), capacitor values, switch and LED labels and the procedure follow the sheet.
import { l8OhmTest, l8Circuit, dmmVolt } from './figures.js';

const CAPS = [['C1', 100], ['C2', 47], ['C3', 10], ['C4', 0.1], ['C5', 0.01]];
const u4 = (x, u) => (x == null ? '?' : `${Number((x / { 'µF': 1e-6, V: 1, 'µC': 1e-6 }[u]).toPrecision(4))} ${u}`);

const fields = [
  ...CAPS.map(([c, v]) => ({ key: `pf${c}`, label: `${c.replace(/(\d)/, '<sub>$1</sub>')} (${v} µF)`, plain: c, kind: 'pf' })),
  ...CAPS.map(([c]) => ({ key: `ob${c}`, label: `What the meter did for ${c.replace(/(\d)/, '<sub>$1</sub>')}`, kind: 'obs', rows: 2, ph: 'e.g. climbed slowly to OL, flickered, stayed at 0…' })),
  { key: 'obsS1', label: 'Step 3 · closing S<sub>1</sub>: which LED pulsed, and why?', kind: 'obs' },
  { key: 'obsS2', label: 'Step 4 · opening S<sub>1</sub>, closing S<sub>2</sub>: which LED pulsed, and why?', kind: 'obs' },
  { key: 'sV1', label: 'V<sub>C1</sub> in series', unit: 'V', kind: 'meas' },
  { key: 'sV2', label: 'V<sub>C2</sub> in series', unit: 'V', kind: 'meas' },
  { key: 'sQ1', label: 'Q<sub>C1</sub> in series (your calculation)', unit: 'µC', units: ['µC', 'mC'], kind: 'calc' },
  { key: 'sQ2', label: 'Q<sub>C2</sub> in series (your calculation)', unit: 'µC', units: ['µC', 'mC'], kind: 'calc' },
  { key: 'pV', label: 'V<sub>C1</sub> = V<sub>C2</sub> in parallel', unit: 'V', kind: 'meas' },
  { key: 'pQ1', label: 'Q<sub>C1</sub> in parallel (your calculation)', unit: 'µC', units: ['µC', 'mC'], kind: 'calc' },
  { key: 'pQ2', label: 'Q<sub>C2</sub> in parallel (your calculation)', unit: 'µC', units: ['µC', 'mC'], kind: 'calc' },
  { key: 'q1', label: 'Q1. What can you conclude about testing capacitors with an ohmmeter?', kind: 'ans' },
  { key: 'q2', label: 'Q2. Capacitors in series: your conclusion, backed by your step 5 results', kind: 'ans' },
  { key: 'q3', label: 'Q3. Capacitors in parallel: your conclusion, backed by your step 6 results', kind: 'ans' },
];

const tables = {
  t1: { id: 't1', title: 'Table 1 · Ohmmeter test results', note: 'Pass or fail is your judgement from what the meter did.',
    head: ['Capacitor', 'Value', 'Result', 'What you saw'],
    rows: CAPS.map(([c, v]) => ({ label: c.replace(/(\d)/, '<sub>$1</sub>'), nominal: `${v} µF`, keys: [`pf${c}`, `ob${c}`] })) },
};

const C1 = { key: null, sym: 'C1', nom: 100e-6, unit: 'µF', fixed: true }, C2 = { key: null, sym: 'C2', nom: 47e-6, unit: 'µF', fixed: true };

const calcs = {
  ser: {
    id: 'ser', title: 'Series capacitors: charge from your voltages', where: 'step 5d',
    intro: 'C₁ = 100 µF and C₂ = 47 µF are the nominal values printed on the parts. Electrolytics are often ±20%, so expect some spread.',
    inputs: [C1, C2, { key: 'sV1', sym: 'V1', nom: null, unit: 'V' }, { key: 'sV2', sym: 'V2', nom: null, unit: 'V' }], sources: ['meas'],
    steps: v => {
      const tot = v.V1 != null && v.V2 != null ? v.V1 + v.V2 : null;
      return [
        { id: 'sQ1', rule: '<b>Charge on C₁</b>: Q = CV.', f: 'Q<sub>C1</sub> = C₁ V<sub>C1</sub>', s: `${u4(v.C1, 'µF')} × ${u4(v.V1, 'V')}`, r: v.V1 != null ? v.C1 * v.V1 : null, unit: 'µC', mean: 'µF × V = µC.' },
        { id: 'sQ2', rule: '<b>Charge on C₂</b>.', f: 'Q<sub>C2</sub> = C₂ V<sub>C2</sub>', s: `${u4(v.C2, 'µF')} × ${u4(v.V2, 'V')}`, r: v.V2 != null ? v.C2 * v.V2 : null, unit: 'µC',
          mean: 'In series the same current flows through both for the same time, so ideally Q<sub>C1</sub> = Q<sub>C2</sub>. How close are yours?' },
        { rule: '<b>Voltage ratio</b> you measured, against the theory ratio C₂/C₁ = 0.47.', f: 'V<sub>C1</sub> / V<sub>C2</sub>', s: `${u4(v.V1, 'V')} / ${u4(v.V2, 'V')}`, r: v.V2 ? v.V1 / v.V2 : null, unit: '',
          mean: 'The bigger capacitor (C₁) takes the smaller share of the voltage.' },
        { rule: '<b>Theory for comparison</b>: the series total is smaller than either capacitor.', f: 'C<sub>T</sub> = [1/C₁ + 1/C₂]<sup>−1</sup>', s: '[1/100 µF + 1/47 µF]<sup>−1</sup>', r: 1 / (1 / v.C1 + 1 / v.C2), unit: 'µF' },
        { rule: '<b>Total voltage the pair reached</b> (from your two readings).', f: 'V<sub>C1</sub> + V<sub>C2</sub>', s: `${u4(v.V1, 'V')} + ${u4(v.V2, 'V')}`, r: tot, unit: 'V',
          mean: 'Explanation: expect it to come out below 12 V, roughly 12 V minus LED₁’s turn-on voltage (about 2 V for a red LED). LED₁ stops conducting once the voltage left across it drops below that, and the meter drains a little charge while you measure.' },
      ];
    },
  },
  par: {
    id: 'par', title: 'Parallel capacitors: charge from your voltage', where: 'step 6d',
    intro: 'Same nominal values: C₁ = 100 µF, C₂ = 47 µF.',
    inputs: [C1, C2, { key: 'pV', sym: 'V', nom: null, unit: 'V' }], sources: ['meas'],
    steps: v => [
      { id: 'pQ1', rule: '<b>Charge on C₁</b>.', f: 'Q<sub>C1</sub> = C₁ V', s: `${u4(v.C1, 'µF')} × ${u4(v.V, 'V')}`, r: v.V != null ? v.C1 * v.V : null, unit: 'µC' },
      { id: 'pQ2', rule: '<b>Charge on C₂</b>.', f: 'Q<sub>C2</sub> = C₂ V', s: `${u4(v.C2, 'µF')} × ${u4(v.V, 'V')}`, r: v.V != null ? v.C2 * v.V : null, unit: 'µC',
        mean: 'Same voltage, so the bigger capacitor holds more charge, in proportion to its capacitance.' },
      { rule: '<b>Theory for comparison</b>: parallel capacitances simply add.', f: 'C<sub>T</sub> = C₁ + C₂', s: '100 µF + 47 µF', r: v.C1 + v.C2, unit: 'µF' },
      { rule: '<b>Total charge stored</b>.', f: 'Q<sub>T</sub> = Q<sub>C1</sub> + Q<sub>C2</sub> = C<sub>T</sub> V', s: `${u4(v.C1 + v.C2, 'µF')} × ${u4(v.V, 'V')}`, r: v.V != null ? (v.C1 + v.C2) * v.V : null, unit: 'µC' },
    ],
  },
};
const checks = { sQ1: ['ser', 'sQ1'], sQ2: ['ser', 'sQ2'], pQ1: ['par', 'pQ1'], pQ2: ['par', 'pQ2'] };

const figs = {
  ohm: { draw: () => l8OhmTest(), caption: 'Figure 1 of the sheet: discharge first, then the ohmmeter with matching polarity.' },
  circ: { draw: () => l8Circuit(), caption: 'Figure 2 · S₁ charges C₁ through R₁ and LED₁. S₂ discharges it through R₂ and LED₂. Both switches start open.' },
  series: { draw: () => l8Circuit({ variant: 'series' }), caption: 'One way to draw step 5: C₂ stacked under C₁, + of C₂ to − of C₁. The sheet asks you to draw your own version (Figure 3).' },
  parallel: { draw: () => l8Circuit({ variant: 'parallel' }), caption: 'One way to draw step 6: C₁ and C₂ side by side, both + to the top. The sheet asks you to draw your own version (Figure 4).' },
  volt: { draw: () => dmmVolt(), caption: 'Voltage across a capacitor: meter across it, quickly.' },
};

export default {
  id: 'lab8', num: 8, title: 'RC circuits', icon: '🔋', minutes: 90,
  tagline: 'Test capacitors with the ohmmeter, watch two LEDs show charging and discharging, then compare series and parallel capacitors.',
  overview: {
    about: 'A <b>capacitor</b> stores electric charge on two conductors separated by an insulator (the <b>dielectric</b>). In an <b>RC circuit</b> a resistor sets how fast it charges and discharges.',
    build: 'Five capacitor tests with the DMM, then the 12 V circuit of Figure 2 with two push-button switches and two LEDs, then the same circuit with C₁ = 100 µF and C₂ = 47 µF in series and in parallel.',
    understand: ['What Q = CV means and its units', 'How the ohmmeter test tells a good capacitor from a shorted or open one', 'Why an LED flashes only while the capacitor charges or discharges', 'Why series capacitance shrinks and parallel capacitance adds'],
  },
  fields, tables, calcs, checks, figs,
  sections: [
    { kicker: 'Concept', title: 'Charge, capacitance and voltage', fig: 'circ',
      html: `<div class="formula big">Q = C V</div>
        <p><b>Q</b> is charge in coulombs (C), <b>C</b> is capacitance in farads (F), <b>V</b> is voltage in volts. Double the voltage and the stored charge doubles. A bigger capacitor (larger plates, or plates closer together) holds more charge at the same voltage.</p>
        <p>Current is charge per second, so a steady current I for a time T moves a charge <b>Q = I T</b>.</p>
        <p class="explain"><b>Explanation, units:</b> 1 µF = 10<sup>−6</sup> F. So 100 µF at 10 V holds 100 × 10 = 1000 µC = 1 mC.</p>` },
    { kicker: 'Concept', title: 'Series and parallel capacitors', fig: 'series',
      html: `<p><b>Series:</b> the same current flows through both for the same time, so they get the <b>same charge</b>: Q₁ = Q₂, which means V₁/V₂ = C₂/C₁. The larger capacitor takes the <b>smaller</b> voltage.</p>
        <div class="formula">C<sub>T</sub> = [ 1/C₁ + 1/C₂ + … + 1/C<sub>N</sub> ]<sup>−1</sup></div>
        <p><b>Parallel:</b> same voltage on each, and the capacitances add:</p>
        <div class="formula">C<sub>T</sub> = C₁ + C₂ + … + C<sub>N</sub></div>
        <p class="note">Notice it is the <b>opposite</b> of resistors: capacitors in series behave like resistors in parallel.</p>` },
    { kicker: 'Part 1 · Step 1', title: 'The ohmmeter test', fig: 'ohm',
      html: `<ol>
          <li><b>Discharge</b> the capacitor by briefly touching its two leads together.</li>
          <li>Set the ohmmeter to a <b>high</b> range. Meter <b>+ to capacitor +</b>, − to −.</li>
          <li>A good capacitor reads low at first, then climbs towards “infinite” (OL) as the meter’s small current charges it.</li>
          <li>Big capacitors charge slowly, so you may need a <b>lower</b> range to see it finish. Small ones charge so fast you may only see a flicker, even on the highest range.</li>
          <li>Stays near <b>zero</b> = shorted. Jumps <b>straight</b> to OL on a big capacitor = open.</li></ol>
        <p>For a tiny capacitor, no change at all does <b>not</b> prove it is bad. The test is just too slow to catch it. Other methods would be needed.</p>
        {{ohmsim}}
        {{table:t1}}` },
    { kicker: 'Part 1 · Steps 2–4', title: 'The LED charge and discharge circuit', fig: 'circ',
      html: `<p>Push-button switches are <b>normally open</b>: they only conduct while you hold them down. Build Figure 2 with both left open.</p>
        <p class="warn"><b>Polarity:</b> the LEDs and the electrolytic C₁ only work one way round. A reversed LED just won’t light. A reversed electrolytic can be damaged, and can burst if a strong reverse voltage stays on it. <b>Check every lead before you connect the supply.</b></p>
        {{rcsim}}
        <p>Use the simulator to predict what you will see, then write down what <b>actually</b> happened on your bench:</p>
        {{field:obsS1}}{{field:obsS2}}` },
    { kicker: 'Part 1 · Step 5', title: 'Two capacitors in series', fig: 'series',
      html: `<p>Add C₂ = 47 µF in series with C₁. Open both switches, discharge both capacitors, then hold S₁ until LED₁ has flashed and gone dark again. Measure each capacitor’s voltage <b>quickly</b>: the meter itself slowly drains them.</p>
        {{field:sV1}}{{field:sV2}}{{calc:ser}}{{field:sQ1}}{{field:sQ2}}
        <p class="tip">The sheet also asks for a drawing of this circuit (Figure 3), possibly made in Multisim.</p>` },
    { kicker: 'Part 1 · Step 6', title: 'Two capacitors in parallel', fig: 'parallel',
      html: `<p>Rewire so C₁ and C₂ are side by side. Discharge them, charge with S₁ as before, and measure the voltage once (they share it).</p>
        {{field:pV}}{{calc:par}}{{field:pQ1}}{{field:pQ2}}
        <p class="tip">Drawing for Figure 4 of the sheet: same as step 5.</p>` },
    { kicker: 'Part 2', title: 'Questions', html: `<p>Back each answer with your own numbers: your Table 1 results, your series voltages and charges, your parallel voltage and charges.</p>
        {{field:q1}}{{field:q2}}{{field:q3}}` },
  ],
  guide: [
    { part: 'Before you start', title: 'Get the five capacitors', table: 't1',
      do: 'Take out 100 µF, 47 µF, 10 µF, 0.1 µF and 0.01 µF from your toolbox: C₁ to C₅.',
      observe: 'The electrolytics (the larger values) have a stripe marking the <b>−</b> lead, and the − lead is usually shorter.',
      why: 'Polarised capacitors must be connected the right way round in every step of this lab.' },
    { part: 'Part 1 · Step 1', title: 'Discharge, then test with the ohmmeter', fig: 'ohm', widget: 'ohmsim',
      do: 'Short each capacitor’s leads for a moment. Set a high Ω range, meter + to capacitor +, and watch the display.',
      observe: 'Climbing towards OL = pass. Stuck near 0 = short. Instantly OL on a big one = open.',
      why: 'The meter pushes a tiny current that charges the capacitor. As it charges, less current flows, so the reading rises.',
      watch: 'Don’t hold both leads with your fingers. Your skin conducts.',
      hint: 'Large value slow to finish? Drop to a lower range. Small value with no change? Use the highest range and watch for a flicker.' },
    { part: 'Part 1 · Step 1', title: 'Record pass or fail', table: 't1',
      do: 'Mark each capacitor Pass or Fail from what you saw, and note what the meter did.',
      hint: 'If a 0.01 µF shows no change at all, note that this is a limit of the test, not necessarily a bad part.' },
    { part: 'Part 1 · Step 2', title: 'Build Figure 2', fig: 'circ',
      do: 'Supply off. Build Figure 2: S₁ → R₁ (1 kΩ) → LED₁ → the top of C₁ (100 µF, + up). From the same point, S₂ → R₂ (1 kΩ) → LED₂ → back to −. Set the supply to 12 V. Leave both switches open.',
      observe: 'LED flat side / shorter leg = cathode, pointing in the direction of the arrow in the figure.',
      why: 'R₁ and R₂ limit the current so the LEDs aren’t damaged.',
      watch: 'Check the polarity of C₁, LED₁ and LED₂ before connecting the supply. A reversed electrolytic can be destroyed.' },
    { part: 'Part 1 · Step 3', title: 'Close S₁', fig: 'circ', widget: 'rcsim', fields: ['obsS1'],
      do: 'Press and hold S₁. Watch both LEDs.',
      observe: 'Which LED gives a pulse of light, and does it stay on?',
      why: 'Current flows only while C₁ is filling up. As its voltage rises towards the supply, the current, and so the LED, fades out.',
      hint: 'If nothing lights, C₁ may already be charged. Close S₂ first to empty it.' },
    { part: 'Part 1 · Step 4', title: 'Open S₁, then close S₂', fig: 'circ', widget: 'rcsim', fields: ['obsS2'],
      do: 'Release S₁. Then press and hold S₂.',
      observe: 'Which LED pulses this time?',
      why: 'The charged C₁ now acts as the source, pushing its stored charge out through R₂ and LED₂ until it is empty.' },
    { part: 'Part 1 · Step 5', title: 'Add C₂ in series', fig: 'series',
      do: 'Supply off. Insert C₂ = 47 µF in series with C₁ (for example between C₁’s − lead and the − rail, + of C₂ towards C₁). Both switches open.',
      watch: 'Each electrolytic’s + must face the more positive side.',
      hint: 'Ask your instructor if you’re unsure where they want C₂ placed. The sheet doesn’t draw it.' },
    { part: 'Part 1 · Step 5c–d', title: 'Discharge, charge, measure fast', fig: 'volt', fields: ['sV1', 'sV2'],
      do: 'Short each capacitor’s leads briefly. Hold S₁ until LED₁ flashes and goes dark. Then quickly measure V<sub>C1</sub> and V<sub>C2</sub>.',
      observe: 'C₁ (the bigger one) should show the smaller voltage.',
      why: 'The meter’s own resistance slowly discharges a capacitor, so the first reading is the most accurate.',
      hint: 'If readings seem off, repeat steps c and d.' },
    { part: 'Part 1 · Step 5e', title: 'Charge on each capacitor', calc: 'ser', fields: ['sQ1', 'sQ2'],
      do: 'Use Q = CV with your two voltages.', observe: 'The two charges should be close to each other.', why: 'Series parts share the same current for the same time.' },
    { part: 'Part 1 · Step 6', title: 'Parallel: rewire and measure', fig: 'parallel', fields: ['pV'],
      do: 'Supply off. Put C₁ and C₂ side by side, both + up. Discharge both. Hold S₁ until LED₁ goes dark, then measure the voltage once.',
      why: 'Parallel parts share the same two nodes, so they get the same voltage.' },
    { part: 'Part 1 · Step 6e', title: 'Charge on each capacitor', calc: 'par', fields: ['pQ1', 'pQ2'],
      do: 'Q = CV for each, with the same V.', observe: 'C₁ holds about twice the charge of C₂ (100 vs 47 µF).' },
    { part: 'Part 2', title: 'Answer the questions', fields: ['q1', 'q2', 'q3'],
      do: 'Answer using your own results as evidence.',
      hint: 'For Q2, compare your two series charges. For Q3, compare your two parallel charges with the ratio of capacitances.' },
  ],
};
