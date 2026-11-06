// Lab 9 · AC response of RC circuits. Content written for this app from the EMNG1001 lab sheet;
// the series RC (1 kΩ, 0.1 µF), signal settings, channel hook-up and Tables 1-3 follow the sheet.
import { l9Circuit } from './figures.js';

const TPD = ['µs/div', 'ms/div'], VPD = ['V/div', 'mV/div'];
const scopeRows = (p, ch2, extra = []) => [
  { key: `${p}TPD`, label: 'Time/Div, TPD', unit: 'µs/div', units: TPD, kind: 'set' },
  { key: `${p}DT`, label: 'Divisions for one period, D<sub>T</sub>', unit: 'div', kind: 'meas' },
  { key: `${p}T`, label: 'Period, T = D<sub>T</sub> × TPD', unit: 'µs', units: ['µs', 'ms'], kind: 'calc' },
  { key: `${p}f`, label: 'Frequency, f = 1/T', unit: 'Hz', units: ['Hz', 'kHz'], kind: 'calc' },
  { key: `${p}VPD1`, label: 'Volt/Div CH1, VPD₁', unit: 'V/div', units: VPD, kind: 'set' },
  { key: `${p}D1`, label: 'Peak-to-peak divisions CH1, D<sub>1,pp</sub>', unit: 'div', kind: 'meas' },
  { key: `${p}V1p`, label: 'Peak voltage CH1, V<sub>1,p</sub> = D<sub>1,pp</sub> × VPD₁ / 2', unit: 'V', kind: 'calc' },
  ...(ch2 ? [
    { key: `${p}VPD2`, label: 'Volt/Div CH2, VPD₂', unit: 'V/div', units: VPD, kind: 'set' },
    { key: `${p}D2`, label: 'Peak-to-peak divisions CH2, D<sub>2,pp</sub>', unit: 'div', kind: 'meas' },
    { key: `${p}V2p`, label: 'Peak voltage CH2, V<sub>2,p</sub> = D<sub>2,pp</sub> × VPD₂ / 2', unit: 'V', kind: 'calc' },
  ] : []),
  ...extra,
];

const fields = [
  ...scopeRows('a', false),
  ...scopeRows('b', true, [
    { key: 'bDd', label: 'Delay between input and output, D<sub>d</sub>', unit: 'div', kind: 'meas' },
    { key: 'bTd', label: 'Time delay, T<sub>d</sub> = D<sub>d</sub> × TPD', unit: 'µs', units: ['µs', 'ms'], kind: 'calc' },
    { key: 'bth', label: 'Phase shift, θ<sub>d</sub> = 360° × T<sub>d</sub> / T', unit: '°', kind: 'calc' },
  ]),
  ...scopeRows('c', true, [
    { key: 'cDRC', label: 'Time constant in divisions, D<sub>RC</sub>', unit: 'div', kind: 'meas' },
    { key: 'ctm', label: 'Measured time constant, τ = D<sub>RC</sub> × TPD', unit: 'µs', units: ['µs', 'ms'], kind: 'calc' },
    { key: 'ctc', label: 'Calculated time constant, τ = RC', unit: 'µs', units: ['µs', 'ms'], kind: 'calc' },
  ]),
  { key: 'cShape', label: 'Describe the shape of the output waveform', kind: 'obs' },
  { key: 'cAgree', label: 'Do your measured and calculated time constants agree?', kind: 'ans' },
  { key: 'dV2pp', label: 'Theory: output peak-to-peak voltage', unit: 'V', kind: 'calc' },
  { key: 'dth', label: 'Theory: phase shift (output vs input)', unit: '°', kind: 'calc' },
  { key: 'dCmp', label: 'Part 4: compare your theory with Table 2', kind: 'ans' },
  { key: 'sk1', label: 'Figure 1 sketch: note what you drew or photographed', kind: 'obs', rows: 2 },
  { key: 'sk3', label: 'Figure 3 sketch notes', kind: 'obs', rows: 2 },
  { key: 'sk4', label: 'Figure 4 sketch notes', kind: 'obs', rows: 2 },
];

const tbl = (id, title, p, ch2, extra = []) => ({
  id, title, note: 'Settings and divisions come from your scope. The formula rows are your own working; a ✓ shows when it matches.',
  head: ['Quantity', 'Your value'],
  rows: scopeRows(p, ch2, extra).map(f => ({ label: f.label, keys: [f.key] })),
});
const tables = {
  t1: tbl('t1', 'Table 1 · Part 1 (function generator on CH1)', 'a', false),
  t2: tbl('t2', 'Table 2 · Part 2 (sine, input and capacitor)', 'b', true, fields.filter(f => ['bDd', 'bTd', 'bth'].includes(f.key))),
  t3: tbl('t3', 'Table 3 · Part 3 (square wave, charging)', 'c', true, fields.filter(f => ['cDRC', 'ctm', 'ctc'].includes(f.key))),
};

// checks: every formula row is worked from the student's own entries in the same table
const mult = (a, b, k = 1) => nb => { const x = nb.num(a), y = nb.num(b); return x == null || y == null ? null : x * y * k; };
const inv = a => nb => { const x = nb.num(a); return x ? 1 / x : null; };
const checks = {};
for (const p of ['a', 'b', 'c']) {
  checks[`${p}T`] = mult(`${p}DT`, `${p}TPD`);
  checks[`${p}f`] = nb => { const T = nb.num(`${p}T`) ?? (checks[`${p}T`](nb)); return T ? 1 / T : null; };
  checks[`${p}V1p`] = mult(`${p}D1`, `${p}VPD1`, 0.5);
  if (p !== 'a') checks[`${p}V2p`] = mult(`${p}D2`, `${p}VPD2`, 0.5);
}
checks.bTd = mult('bDd', 'bTPD');
checks.bth = nb => { const Td = nb.num('bTd') ?? checks.bTd(nb), T = nb.num('bT') ?? checks.bT(nb); return Td == null || !T ? null : 360 * Td / T; };
checks.ctm = mult('cDRC', 'cTPD');
checks.ctc = () => 1000 * 0.1e-6;
checks.dV2pp = ['th', 'V2pp'];
checks.dth = ['th', 'th'];
void inv;

const v4 = (x, u) => (x == null ? '?' : `${Number((x / ({ Hz: 1, kHz: 1e3, Ω: 1, 'µF': 1e-6, V: 1, rad: 1 }[u] ?? 1)).toPrecision(4))} ${u}`);

const calcs = {
  tau: {
    id: 'tau', title: 'The RC time constant', sources: ['nom'], nomLabel: 'Uses the <b>nominal</b> parts from the equipment list: R = 1 kΩ, C = 0.1 µF.',
    inputs: [{ sym: 'R', nom: 1000, unit: 'Ω' }, { sym: 'C', nom: 0.1e-6, unit: 'µF' }],
    steps: v => [
      { id: 'tau', rule: '<b>Time constant</b>: how long the capacitor takes to cover 63.2% of a voltage step.', f: 'τ = R C', s: `${v4(v.R, 'Ω')} × ${v4(v.C, 'µF')}`, r: v.R * v.C, unit: 'µs', mean: 'Ω × F = seconds. After about 5τ the capacitor is practically fully charged.' },
      { rule: '<b>Half a period of the 1 kHz square wave</b> (how long each high or low lasts).', f: 'T/2 = 1 / (2 f)', s: '1 / (2 × 1 kHz)', r: 0.5e-3, unit: 'µs', mean: '500 µs = 5τ, so each half cycle is long enough for a full charge or discharge. The sheet chose 1 kHz for exactly this.' },
    ],
  },
  th: {
    id: 'th', title: 'Part 4 · Expected output and phase shift', sources: ['nom', 'meas'],
    nomLabel: 'Theory with the values the sheet gives: f = 1.6 kHz, V<sub>s,pp</sub> = 5 V, R = 1 kΩ, C = 0.1 µF. Calculated, not measured.',
    where: 'Table 2 (your f and V<sub>1,p</sub>)',
    inputs: [{ key: 'bf', sym: 'f', nom: 1600, unit: 'Hz' }, { key: 'bV1p', sym: 'Vsp', nom: 2.5, unit: 'V' }, { sym: 'R', nom: 1000, unit: 'Ω', fixed: true }, { sym: 'C', nom: 0.1e-6, unit: 'µF', fixed: true }],
    steps: v => {
      const w = 2 * Math.PI * v.f, Xc = 1 / (w * v.C), Z = Math.hypot(v.R, Xc), Vspp = 2 * v.Vsp;
      return [
        { rule: '<b>Angular frequency</b>.', f: 'ω = 2π f', s: `2π × ${v4(v.f, 'Hz')}`, r: w, unit: '', mean: 'In rad/s.' },
        { rule: '<b>Capacitive reactance</b>: the capacitor’s “AC resistance” at this frequency.', f: 'X<sub>C</sub> = 1 / (ωC)', s: `1 / (${v4(w, 'rad')} × ${v4(v.C, 'µF')})`, r: Xc, unit: 'Ω', mean: 'At 1.6 kHz, X<sub>C</sub> comes out almost equal to R. That is why the phase shift lands near 45°.' },
        { rule: '<b>Impedance magnitude</b>. R and X<sub>C</sub> are 90° apart, so they combine like the sides of a right triangle.', f: '|Z| = √(R² + X<sub>C</sub>²)', s: `√(${v4(v.R, 'Ω')}² + ${v4(Xc, 'Ω')}²)`, r: Z, unit: 'Ω' },
        { id: 'V2pp', rule: '<b>Voltage divider</b>: the capacitor gets its share X<sub>C</sub>/|Z| of the source.', f: 'V<sub>C,pp</sub> = V<sub>s,pp</sub> × X<sub>C</sub> / |Z|', s: `${v4(Vspp, 'V')} × ${v4(Xc, 'Ω')} / ${v4(Z, 'Ω')}`, r: Vspp * Xc / Z, unit: 'V' },
        { id: 'th', rule: '<b>Phase</b>: the capacitor voltage <b>lags</b> the source.', f: 'θ = −tan<sup>−1</sup>(R / X<sub>C</sub>)', s: `−tan<sup>−1</sup>(${v4(v.R, 'Ω')} / ${v4(Xc, 'Ω')})`, r: -Math.atan(v.R / Xc) * 180 / Math.PI, unit: '°',
          mean: 'Negative means the output peaks <b>after</b> the input. On the scope, CH2 is shifted to the right of CH1. The sheet’s θ<sub>d</sub> is the size of this delay.' },
      ];
    },
  },
};

const figs = {
  circ: { draw: () => l9Circuit(), caption: 'Figure 2 · CH1 reads the function generator (V<sub>s</sub>), CH2 reads the capacitor (the output). Both probe grounds go to circuit ground.' },
};

export default {
  id: 'lab9', num: 9, title: 'AC response of RC circuits', icon: '〰️', minutes: 120,
  tagline: 'Use the function generator and oscilloscope, measure the phase shift of a series RC, and find its time constant from a square wave.',
  overview: {
    about: 'With an <b>AC</b> source, a capacitor doesn’t just block or pass: it pushes back by an amount that depends on frequency (its <b>reactance</b>), and its voltage lags behind. You see all of this on the <b>oscilloscope</b>.',
    build: 'Part 1: the generator straight into the scope. Parts 2–3: the series RC of 1 kΩ and 0.1 µF, with CH1 on the source and CH2 on the capacitor, first with a sine and then a square wave. Part 4: the theory to compare against.',
    understand: ['How Time/Div and Volt/Div turn divisions into seconds and volts', 'Period, frequency, peak and peak-to-peak', 'What a phase shift is and how to measure it from a time delay', 'What the time constant τ = RC means on a charging curve'],
  },
  fields, tables, calcs, checks, figs,
  sections: [
    { kicker: 'Concept', title: 'Reading an oscilloscope screen', html: `
        <p>The screen is a grid of <b>divisions</b> (here 10 across, 8 up). Two knobs give each division a value:</p>
        <ul><li><b>Time/Div</b> (TPD): how much time one horizontal division is worth.</li>
        <li><b>Volt/Div</b> (VPD): how many volts one vertical division is worth, set per channel.</li></ul>
        <div class="formula">T = D<sub>T</sub> × TPD &nbsp;&nbsp; f = 1/T &nbsp;&nbsp; V<sub>p</sub> = D<sub>pp</sub> × VPD / 2</div>
        <p><b>Period</b> T = time for one full cycle. <b>Frequency</b> f = cycles per second (Hz). <b>Peak-to-peak</b> = bottom to top. <b>Peak</b> = half of that, centre to top.</p>
        {{scope:1}}
        <p class="note">The practice screen draws <b>ideal</b> waveforms from theory, so you can learn to read divisions. Your tables need readings from the real oscilloscope.</p>` },
    { kicker: 'Concept', title: 'Reactance, phase and the time constant', fig: 'circ', html: `
        <p>A capacitor’s opposition to AC is its <b>reactance</b>, X<sub>C</sub> = 1/(ωC) with ω = 2πf. High frequency means small X<sub>C</sub>. In a pure capacitance the voltage <b>lags</b> the current by 90°. With a resistor in series the lag of the capacitor voltage behind the source is somewhere between 0° and 90°.</p>
        <p><b>Phase shift</b> is that lag measured as an angle. If one full cycle (T) is 360°, a delay of T<sub>d</sub> is θ = 360° × T<sub>d</sub>/T.</p>
        <p>The <b>time constant</b> τ = RC is how long the capacitor takes to cover 63.2% of a sudden voltage step.</p>
        {{calc:tau}}
        <p class="explain"><b>Explanation, background from the sheet’s introduction:</b> RC, RL and RLC circuits act as frequency filters. Resistors use real power, capacitors and inductors exchange reactive power, and the power factor is the cosine of the input impedance’s phase. You don’t measure these here, but they explain why frequency matters.</p>` },
    { kicker: 'Part 1', title: 'Generator to scope', html: `
        <ol><li>Coax from the function generator output to <b>CH1</b>.</li>
        <li>Generator: <b>sine</b>, <b>2 kHz</b>, about <b>3 V peak-to-peak</b>.</li>
        <li>CH1 on <b>AC coupling</b>. Adjust Volt/Div, Time/Div, position, trigger, intensity and focus until the trace is steady. On a digital scope, <b>Auto</b> does most of this.</li>
        <li>Sketch the trace (Figure 1 of the sheet) and fill in Table 1.</li></ol>
        {{table:t1}}{{field:sk1}}` },
    { kicker: 'Part 2', title: 'Sine wave through the RC: measure the phase delay', fig: 'circ', html: `
        <p>Build Figure 2. Generator: <b>sine</b>, <b>1.6 kHz</b>, a convenient amplitude such as <b>5 V peak-to-peak</b>. CH1 on the generator output, CH2 on the capacitor. Set both Volt/Div knobs and the Time/Div so both waves fit.</p>
        {{scope:2}}
        <p><b>Measuring the delay:</b> pick a point that is easy to see on both traces, such as where each one crosses the centre line going upward. Count the divisions between them (D<sub>d</sub>). The output is the one that crosses <b>later</b>.</p>
        {{table:t2}}{{field:sk3}}` },
    { kicker: 'Part 3', title: 'Square wave: watch it charge and discharge', fig: 'circ', html: `
        <p>Same circuit. Generator: <b>square</b>, <b>1 kHz</b>, <b>5 V peak-to-peak</b>. The input jumps between two levels. The capacitor can’t jump, so it curves up and curves down.</p>
        {{scope:3}}
        <p><b>Measuring τ:</b> on a rising edge, start where the output curve begins to rise. Find the height that is 63.2% of the way from its bottom to the input’s peak-to-peak step (0.632 × V<sub>s,pp</sub> above the bottom). Count the horizontal divisions to that point: that is D<sub>RC</sub>.</p>
        {{table:t3}}{{field:cShape}}{{field:cAgree}}{{field:sk4}}` },
    { kicker: 'Part 4 · Theory', title: 'Expected output and phase, then compare', fig: 'circ', html: `
        <p>The sheet asks for the output peak-to-peak voltage and the phase shift for a 1.6 kHz, 5 V<sub>pp</sub> sine, then a comparison with Table 2.</p>
        {{calc:th}}{{field:dV2pp}}{{field:dth}}{{field:dCmp}}
        <p class="tip">Switch the calculator to <b>My readings</b> to redo it with the frequency and amplitude you actually measured in Table 2.</p>` },
  ],
  guide: [
    { part: 'Before you start', title: 'Get the equipment',
      do: 'Function generator, oscilloscope, coax leads, breadboard, a 1 kΩ resistor and a 0.1 µF capacitor.',
      why: 'The 0.1 µF is not an electrolytic in this lab, but check its marking anyway and follow your instructor’s directions.',
      watch: 'Use only the college’s equipment and stay within the settings the sheet gives.' },
    { part: 'Part 1', title: 'Connect the generator to CH1',
      do: 'Coax from the generator output to CH1. Generator: sine, 2 kHz, about 3 V<sub>pp</sub>. CH1 coupling: AC.',
      observe: 'A trace, possibly drifting or off the screen.',
      why: 'AC coupling removes any DC offset, so the wave sits centred on the screen.' },
    { part: 'Part 1', title: 'Get a steady trace', widget: 'scope:1',
      do: 'Press Auto if your scope has it. Otherwise set Volt/Div so the wave fills most of the height, Time/Div so you see 1–3 cycles, then adjust the trigger until it stands still.',
      observe: 'A still sine wave.',
      hint: 'A wave that slides sideways is a trigger problem. Set the trigger source to CH1 and its level to the middle of the wave.' },
    { part: 'Part 1', title: 'Read Table 1', table: 't1', widget: 'scope:1',
      do: 'Write down TPD and VPD₁. Count D<sub>T</sub> (one cycle) and D<sub>1,pp</sub> (bottom to top). Work out T, f and V<sub>1,p</sub>.',
      observe: 'f should come out near 2 kHz.',
      why: 'The divisions are just a ruler. The knob settings turn them into seconds and volts.',
      hint: 'Count to tenths of a division using the small ticks on the centre lines.' },
    { part: 'Part 1', title: 'Sketch the waveform', fields: ['sk1'],
      do: 'Draw what you see on the grid of Figure 1 in your Word sheet (hand drawing or a photo is fine).' },
    { part: 'Part 2', title: 'Build the series RC', fig: 'circ',
      do: 'Build Figure 2: generator → 1 kΩ → 0.1 µF → back to the generator’s ground. CH1 probe on the generator side, CH2 on the capacitor’s top. Probe grounds on the circuit ground.',
      watch: 'All grounds (generator and both probes) must be on the same node, or you’ll short part of the circuit through the scope.' },
    { part: 'Part 2', title: 'Sine at 1.6 kHz on both channels', widget: 'scope:2',
      do: 'Generator: sine, 1.6 kHz, about 5 V<sub>pp</sub>. Adjust both Volt/Div knobs and Time/Div so both waves fit.',
      observe: 'CH2 is smaller than CH1 and shifted to the right.',
      why: 'The capacitor only gets part of the voltage, and its voltage lags behind the source.' },
    { part: 'Part 2', title: 'Fill in Table 2', table: 't2', widget: 'scope:2',
      do: 'Record the settings and divisions for both channels and the delay D<sub>d</sub> between them. Work out T<sub>d</sub> and θ<sub>d</sub>.',
      hint: 'Measure the delay between matching points, such as the two upward zero crossings. A larger Time/Div setting makes the gap easier to count.' },
    { part: 'Part 2', title: 'Sketch both waves', fields: ['sk3'], do: 'Draw both traces on Figure 3 of your sheet, labelled CH1 and CH2.' },
    { part: 'Part 3', title: 'Switch to a square wave', widget: 'scope:3',
      do: 'Generator: square, 1 kHz, 5 V<sub>pp</sub>. Same circuit, same probes.',
      observe: 'CH1 is square. CH2 rises and falls in curves (shark fins).',
      why: 'Each half cycle (0.5 ms) is about 5τ, so the capacitor has time to charge almost fully, then discharge almost fully.' },
    { part: 'Part 3', title: 'Find the time constant', table: 't3', widget: 'scope:3', calc: 'tau',
      do: 'Fill in Table 3. For D<sub>RC</sub>, measure from the start of a rise to the point 63.2% of the way up the step.',
      hint: 'Zoom in with a smaller Time/Div so one rise fills the screen. You can count fractions of a division more accurately that way.' },
    { part: 'Part 3', title: 'Describe and compare', fields: ['cShape', 'cAgree', 'sk4'],
      do: 'Describe the output shape and say whether your measured τ agrees with RC.',
      why: 'Parts are within tolerance and you are reading the screen by eye, so expect some difference.' },
    { part: 'Part 4', title: 'Theory, then compare', calc: 'th', fields: ['dV2pp', 'dth', 'dCmp'],
      do: 'Work out X<sub>C</sub>, |Z|, the output peak-to-peak and the phase for 1.6 kHz and 5 V<sub>pp</sub>. Compare them with Table 2.',
      hint: 'Your Table 2 V<sub>2,p</sub> is a peak, so double it before comparing with a peak-to-peak value.' },
  ],
};
