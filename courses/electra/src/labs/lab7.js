// Lab 7 · Multisim and wye-delta networks. Content written for this app from the EMNG1001 lab sheet;
// the bridge (Figure 3), its values, node letters A-F and the meter hook-up follow the sheet.
import { l7WyeDelta, l7Bridge, l7Wye, dmmVolt, dmmAmp, dmmOhm } from './figures.js';

const NOM = { R1: 220, R2: 100, R3: 470, R4: 1000, R5: 4700, R6: 2200, R7: 1000 };
const n4 = (x, u = 'Ω') => (x == null ? '?' : `${Number((x / (u === 'kΩ' ? 1e3 : 1)).toPrecision(4))} ${u}`);

const rows = [1, 2, 3, 4, 5, 6, 7];
const fields = [
  ...rows.flatMap(n => [
    { key: `s${n}V`, label: `R<sub>${n}</sub> voltage (Multisim)`, unit: 'V', kind: 'sim' },
    { key: `s${n}I`, label: `R<sub>${n}</sub> current (Multisim)`, unit: 'mA', kind: 'sim' },
    { key: `s${n}P`, label: `R<sub>${n}</sub> power (your estimate)`, unit: 'mW', kind: 'calc' },
    { key: `h${n}V`, label: `R<sub>${n}</sub> voltage (breadboard)`, unit: 'V', kind: 'meas' },
    { key: `h${n}I`, label: `R<sub>${n}</sub> current (breadboard)`, unit: 'mA', kind: 'meas' },
    { key: `h${n}P`, label: `R<sub>${n}</sub> power (your estimate)`, unit: 'mW', kind: 'calc' },
  ]),
  { key: 'sRBE', label: 'Bridge resistance R<sub>BE</sub> (Multisim)', unit: 'Ω', units: ['Ω', 'kΩ'], kind: 'sim' },
  { key: 'sRT', label: 'Total resistance R<sub>T</sub> = R<sub>AF</sub> (Multisim)', unit: 'Ω', units: ['Ω', 'kΩ'], kind: 'sim' },
  { key: 'R6bal', label: 'R<sub>6</sub> needed for balance (your calculation)', unit: 'kΩ', units: ['Ω', 'kΩ'], kind: 'calc' },
  { key: 'sVR2bal', label: 'V<sub>R2</sub> after balancing (Multisim)', unit: 'V', units: ['V', 'mV'], kind: 'sim' },
  { key: 'balAns', label: 'Is the bridge balanced? What does V<sub>R2</sub> = 0 mean?', kind: 'ans' },
  { key: 'hVs', label: 'Supply voltage at A and F (breadboard)', unit: 'V', kind: 'meas' },
  { key: 'cmp12', label: 'Table 2 vs Table 1: how do they compare, and why?', kind: 'ans' },
  { key: 'hRBE', label: 'Bridge resistance R<sub>BE</sub> (breadboard)', unit: 'Ω', units: ['Ω', 'kΩ'], kind: 'meas' },
  { key: 'hRT', label: 'Total resistance R<sub>T</sub> = R<sub>AF</sub> (breadboard)', unit: 'Ω', units: ['Ω', 'kΩ'], kind: 'meas' },
  { key: 'cmpR', label: 'Breadboard R<sub>BE</sub> and R<sub>T</sub> vs Multisim: explain the differences.', kind: 'ans' },
  { key: 'hVR2bal', label: 'V<sub>R2</sub> with the balancing resistor (breadboard)', unit: 'V', units: ['V', 'mV'], kind: 'meas' },
  { key: 'hBalAns', label: 'Exactly balanced? Why not, and what would make it exact?', kind: 'ans' },
  { key: 'tRBE', label: 'R<sub>BE</sub> from your wye-delta working', unit: 'Ω', units: ['Ω', 'kΩ'], kind: 'calc' },
  { key: 'tRT', label: 'R<sub>T</sub> from your wye-delta working', unit: 'Ω', units: ['Ω', 'kΩ'], kind: 'calc' },
  { key: 'tWork', label: 'Part 3: your working (write the steps as you did them)', kind: 'ans', rows: 5 },
];

const mkTable = (id, title, p, note) => ({
  id, title, note, head: ['Resistor', 'Voltage across (V)', 'Current through (mA)', 'Power (mW)'],
  rows: rows.map(n => ({ label: `R<sub>${n}</sub>`, keys: [`${p}${n}V`, `${p}${n}I`, `${p}${n}P`] })),
});
const tables = {
  t1: mkTable('t1', 'Table 1 · Multisim simulation results', 's', 'Voltage and current: read them off XMM1 in Multisim. Power: your own estimate, P = V × I.'),
  t2: mkTable('t2', 'Table 2 · Physical measurement results', 'h', 'Voltage and current: your DMM on the breadboard. Power: your own estimate, P = V × I.'),
  tR: {
    id: 'tR', title: 'Bridge and total resistance', note: 'Supply disconnected for every resistance reading.',
    head: ['Quantity', 'Multisim', 'Breadboard', 'Your theory (Part 3)'],
    rows: [{ label: 'R<sub>BE</sub>', keys: ['sRBE', 'hRBE', 'tRBE'] }, { label: 'R<sub>T</sub> = R<sub>AF</sub>', keys: ['sRT', 'hRT', 'tRT'] }],
  },
};

const inNom = Object.entries(NOM).map(([sym, nom]) => ({ key: sym, sym, nom, unit: 'Ω' }));

const calcs = {
  bal: {
    id: 'bal', title: 'The R₆ that balances the bridge', sources: ['nom'],
    nomLabel: 'Uses the <b>nominal</b> values from Figure 3, which is what the sheet asks for here.',
    inputs: inNom.filter(i => ['R3', 'R4', 'R5'].includes(i.sym)),
    steps: v => [
      { rule: '<b>Balance condition</b> from the sheet: the two sides divide the voltage in the same ratio.', f: 'R₃ / R₄ = R₅ / R₆' },
      { id: 'R6bal', rule: '<b>Solve for R₆</b>: multiply both sides by R₆ and by R₄/R₃.', f: 'R₆ = R₅ × R₄ / R₃', s: `${n4(v.R5)} × ${n4(v.R4)} / ${n4(v.R3)}`, r: v.R5 * v.R4 / v.R3, unit: 'kΩ',
        mean: 'With this R₆, points C and D sit at the same voltage, so no current flows through R₂.' },
    ],
  },
  wye: {
    id: 'wye', title: 'Part 3 · Delta B-C-D to wye, then simplify', sources: ['nom'],
    nomLabel: 'Theory with the <b>nominal</b> values from Figure 3. These are calculated, not measured.',
    inputs: inNom,
    steps: v => {
      const S = v.R3 + v.R5 + v.R2;
      const RB = v.R3 * v.R5 / S, RC = v.R3 * v.R2 / S, RD = v.R5 * v.R2 / S;
      const b1 = RC + v.R4, b2 = RD + v.R6, par = b1 * b2 / (b1 + b2), RBE = RB + par, RT = v.R1 + RBE + v.R7;
      return [
        { rule: '<b>Find the delta.</b> Between B, C and D sit R₃ (B–C), R₅ (B–D) and R₂ (C–D). Add them: every wye arm divides by this sum.', f: 'Σ = R₃ + R₅ + R₂', s: `${n4(v.R3)} + ${n4(v.R5)} + ${n4(v.R2)}`, r: S, unit: 'Ω' },
        { rule: '<b>Arm at B</b> = product of the two delta resistors that touch B, over Σ. At B those are R₃ and R₅.', f: 'R<sub>B</sub> = R₃ R₅ / Σ', s: `${n4(v.R3)} × ${n4(v.R5)} / ${n4(S)}`, r: RB, unit: 'Ω' },
        { rule: '<b>Arm at C</b>: R₃ and R₂ touch C.', f: 'R<sub>C</sub> = R₃ R₂ / Σ', s: `${n4(v.R3)} × ${n4(v.R2)} / ${n4(S)}`, r: RC, unit: 'Ω' },
        { rule: '<b>Arm at D</b>: R₅ and R₂ touch D.', f: 'R<sub>D</sub> = R₅ R₂ / Σ', s: `${n4(v.R5)} × ${n4(v.R2)} / ${n4(S)}`, r: RD, unit: 'Ω' },
        { rule: '<b>Two series branches</b> now run from the star point N down to E.', f: 'N→C→E: R<sub>C</sub> + R₄', s: `${n4(RC)} + ${n4(v.R4)}`, r: b1, unit: 'Ω' },
        { rule: '', f: 'N→D→E: R<sub>D</sub> + R₆', s: `${n4(RD)} + ${n4(v.R6)}`, r: b2, unit: 'Ω' },
        { rule: '<b>Those branches are in parallel</b> (both run from N to E).', f: 'R<sub>NE</sub> = (R<sub>C</sub>+R₄)(R<sub>D</sub>+R₆) / sum', s: `${n4(b1)} × ${n4(b2)} / ${n4(b1 + b2)}`, r: par, unit: 'Ω' },
        { id: 'tRBE', rule: '<b>Bridge resistance</b>: B to N, then N to E.', f: 'R<sub>BE</sub> = R<sub>B</sub> + R<sub>NE</sub>', s: `${n4(RB)} + ${n4(par)}`, r: RBE, unit: 'Ω' },
        { id: 'tRT', rule: '<b>Total</b>: R₁ and R₇ are in series with the bridge.', f: 'R<sub>T</sub> = R₁ + R<sub>BE</sub> + R₇', s: `${n4(v.R1)} + ${n4(RBE)} + ${n4(v.R7)}`, r: RT, unit: 'Ω',
          mean: 'Compare this with your Multisim and breadboard R<sub>T</sub> in the table below.' },
      ];
    },
  },
};

const power = p => Object.fromEntries(rows.map(n => [`${p}${n}P`, nb => {
  const V = nb.num(`${p}${n}V`), I = nb.num(`${p}${n}I`);
  return V == null || I == null ? null : Math.abs(V * I);
}]));
const checks = { ...power('s'), ...power('h'), R6bal: ['bal', 'R6bal'], tRBE: ['wye', 'tRBE'], tRT: ['wye', 'tRT'] };

const figs = {
  wd: { draw: () => l7WyeDelta(), hl: [{ t: 'ga', label: 'R_a' }, { t: 'gb', label: 'R_b' }, { t: 'gc', label: 'R_c' }], caption: 'Figure 1 of the sheet. Both networks connect the same three nodes A, B, C and behave the same from outside.' },
  bridge: { draw: () => l7Bridge(), hl: [{ t: 'ga', label: 'Delta B-C-D' }, { t: 'gc', label: 'Cross branch R₂' }], caption: 'Figure 3 · the bridge. XMM1 is shown across R₆ (+ on D, − on E). Ground is at F.' },
  bridgeBal: { draw: () => l7Bridge({ r6: 'balance value', r6hl: true }), hl: [{ t: 'gb', label: 'R₆' }, { t: 'gc', label: 'R₂' }], caption: 'Swap R₆ for the balancing value, then read V<sub>R2</sub>.' },
  wye: { draw: () => l7Wye(), hl: [{ t: 'ga', label: 'New wye arms' }], caption: 'After the conversion: R<sub>B</sub>, R<sub>C</sub>, R<sub>D</sub> meet at a new star point N. Now it is ordinary series-parallel.' },
  volt: { draw: () => dmmVolt(), caption: 'Voltage: meter across the part.' },
  amp: { draw: () => dmmAmp(), caption: 'Current: meter in series.' },
  ohm: { draw: () => dmmOhm(), caption: 'Resistance: supply disconnected.' },
};

const MS = (path, then) => `<div class="ms"><span class="ms-path">${path.split(' – ').map(p => `<b>${p}</b>`).join('<i>›</i>')}</span>${then ? `<p>${then}</p>` : ''}</div>`;

export default {
  id: 'lab7', num: 7, title: 'Multisim & wye-delta networks', icon: '🔺', minutes: 120,
  tagline: 'Build the same bridge in Multisim and on the breadboard, balance it, and solve it by hand with a wye-delta conversion.',
  overview: {
    about: 'Some circuits have resistors that are <b>neither in series nor in parallel</b>. A <b>bridge</b> is the classic case. The <b>wye-delta conversion</b> swaps a triangle of resistors for an equivalent “Y” so the usual series-parallel rules work again.',
    build: 'The 7-resistor bridge of Figure 3 on a 12 V source: first in <b>Multisim</b>, then on the <b>breadboard</b>. You record voltages, currents and power, measure R<sub>BE</sub> and R<sub>T</sub>, and balance the bridge by changing R₆.',
    understand: ['Why a bridge will not reduce with series-parallel rules alone', 'How to convert delta → wye with the sheet’s equations', 'What “balanced” means and why V<sub>R2</sub> goes to zero', 'Why simulation, theory and breadboard results differ'],
  },
  fields, tables, calcs, checks, figs,
  sections: [
    { kicker: 'Concept', title: 'Why the bridge is different', fig: 'bridge',
      html: `<p>Look at R₂: it joins C and D. Is R₃ in series with R₄? It would be if all of R₃’s current went into R₄, but some of it leaves through R₂. Is R₃ in parallel with R₅? They share B, but their other ends (C and D) are different nodes.</p>
        <p>So no pair here is cleanly in series or in parallel. That is the sign you need a <b>wye-delta conversion</b>. Resistors R₃, R₅ and R₂ form a triangle (a <b>delta</b>) between B, C and D.</p>` },
    { kicker: 'Concept', title: 'Wye and delta, and the six equations', fig: 'wd',
      html: `<p>A <b>wye</b> (Y) has three resistors meeting at a centre point. A <b>delta</b> (Δ) has three resistors forming a triangle. Both connect the same three nodes A, B, C, and with the right values they behave identically from outside.</p>
        <p><b>Delta → wye</b> (the one you need in Part 3):</p>
        <div class="formula">R₁ = R<sub>a</sub>R<sub>b</sub> / (R<sub>a</sub> + R<sub>b</sub> + R<sub>c</sub>)</div>
        <div class="formula">R₂ = R<sub>b</sub>R<sub>c</sub> / (R<sub>a</sub> + R<sub>b</sub> + R<sub>c</sub>)</div>
        <div class="formula">R₃ = R<sub>a</sub>R<sub>c</sub> / (R<sub>a</sub> + R<sub>b</sub> + R<sub>c</sub>)</div>
        <p class="explain"><b>Explanation, a memory trick:</b> each wye arm = (the two delta resistors touching that arm’s node) ÷ (sum of all three). R₁ sits at B, and R<sub>a</sub> and R<sub>b</sub> are the delta sides touching B.</p>
        <p><b>Wye → delta</b> (for reference):</p>
        <div class="formula">R<sub>a</sub> = (R₁R₂ + R₂R₃ + R₁R₃) / R₂</div>
        <div class="formula">R<sub>b</sub> = (R₁R₂ + R₂R₃ + R₁R₃) / R₃</div>
        <div class="formula">R<sub>c</sub> = (R₁R₂ + R₂R₃ + R₁R₃) / R₁</div>
        <p class="note">Careful: these equations reuse the names R₁, R₂, R₃, which <b>clash</b> with the bridge’s own R₁ to R₇. In the bridge working below the new wye arms are called R<sub>B</sub>, R<sub>C</sub>, R<sub>D</sub> after the node each one touches.</p>` },
    { kicker: 'Part 1 · Multisim', title: 'Build Figure 3 in Multisim', fig: 'bridge',
      html: `<p>The sheet’s menu paths, in order:</p>
        <ol class="ms-list">
          <li>DC source: ${MS('Component Toolbar – Place Source – POWER_SOURCES – DC_POWER – OK', 'Double-click it. <b>Value</b> tab: 12 V. <b>Label</b> tab: rename it to Vs.')}</li>
          <li>Each resistor: ${MS('Component Toolbar – Place Basic – RESISTOR – OK', 'Double-click to set its value (Value tab) and label. Right-click to rotate it by 90°.')}</li>
          <li>Ground: ${MS('Component Toolbar – Place Source – POWER_SOURCES – GROUND – OK')}</li>
          <li>Multimeter: ${MS('Instruments Toolbar – Multimeter', 'Double-click to open its panel. Pick V, A or Ω and choose DC.')}</li>
          <li><b>Wire it</b>: hover a terminal until the cursor becomes the wiring tool, click, move to the next terminal and click again.</li>
          <li><b>Run</b> with the green Run button (Simulation toolbar, or the Simulate menu). <b>Stop</b> with the red button.</li>
        </ol>
        <p class="explain"><b>Explanation:</b> Multisim uses ideal parts at exactly their set values, so its answers match the pencil-and-paper theory. That is why the simulation is a good reference for your breadboard.</p>` },
    { kicker: 'Part 1 · Steps 2–3', title: 'Record the simulation', fig: 'volt',
      html: `<p>Move XMM1 to each resistor in turn. Voltage: set it to V and put it across the resistor. Current: set it to A and put it in series. <b>Power</b> is your own estimate from the two readings:</p>
        <div class="formula">P = V × I &nbsp;&nbsp;(V × mA = mW)</div>
        {{table:t1}}
        <p>Then, with the DC source disconnected in Multisim, set XMM1 to Ω and read R<sub>BE</sub> (between B and E) and R<sub>T</sub> = R<sub>AF</sub>.</p>
        {{field:sRBE}}{{field:sRT}}` },
    { kicker: 'Part 1 · Step 4', title: 'Balance the bridge', fig: 'bridgeBal',
      html: `<p>A bridge is <b>balanced</b> when C and D sit at the same voltage. Then nothing pushes current through R₂, and V<sub>R2</sub> = 0. The sheet gives the condition R₃/R₄ = R₅/R₆.</p>
        {{calc:bal}}{{field:R6bal}}
        {{balance}}
        <p>Set R₆ in Multisim to your value, reconnect the source, and measure V<sub>R2</sub>.</p>
        {{field:sVR2bal}}{{field:balAns}}` },
    { kicker: 'Part 2 · Breadboard', title: 'Build it for real and measure', fig: 'bridge',
      html: `<p>Same circuit on the breadboard at 12 V. Measure V<sub>s</sub> between A and F first, then every resistor’s voltage and current.</p>
        {{field:hVs}}{{table:t2}}{{field:cmp12}}
        <p>Supply disconnected: measure R<sub>BE</sub> and R<sub>T</sub>.</p>
        {{field:hRBE}}{{field:hRT}}{{field:cmpR}}
        <p>Swap R₆ for the balancing value and measure V<sub>R2</sub>.</p>
        {{field:hVR2bal}}{{field:hBalAns}}
        <p class="explain"><b>Explanation:</b> real resistors are only within tolerance (often ±5%) of their printed value, so R₃/R₄ and R₅/R₆ will rarely match exactly. A small V<sub>R2</sub> is normal. Trimming one resistor (for example with a potentiometer) until V<sub>R2</sub> reads zero gives exact balance.</p>` },
    { kicker: 'Part 3 · Theory', title: 'Solve R<sub>BE</sub> and R<sub>T</sub> by hand', fig: 'wye',
      html: `<p>The sheet asks you to convert the delta between <b>B, C and D</b> into a wye, then simplify. How the sheet’s letters map onto the bridge:</p>
        <div class="tbl-scroll"><table class="map"><thead><tr><th>Sheet’s Figure 1</th><th>In the bridge</th></tr></thead><tbody>
          <tr><td>nodes A, B, C</td><td>nodes B, C, D</td></tr>
          <tr><td>R<sub>a</sub> (A–B)</td><td>R₃ (B–C), 470 Ω</td></tr>
          <tr><td>R<sub>b</sub> (B–C)</td><td>R₂ (C–D), 100 Ω</td></tr>
          <tr><td>R<sub>c</sub> (A–C)</td><td>R₅ (B–D), 4.7 kΩ</td></tr>
          <tr><td>wye arms R₃, R₁, R₂</td><td>R<sub>B</sub>, R<sub>C</sub>, R<sub>D</sub></td></tr></tbody></table></div>
        {{calc:wye}}{{field:tRBE}}{{field:tRT}}{{field:tWork}}{{table:tR}}` },
    { kicker: 'Part 4', title: 'Simulation proof image', html: `<p>In Multisim, move the meter (set to A) so it reads the <b>total current</b>, in series between the source and A. Run the simulation, take a screenshot, and paste it into your Word lab sheet as Figure 4.</p>
        <p class="tip">On Windows: <b>Win + Shift + S</b> lets you drag a box around the circuit and copies it.</p>` },
  ],
  guide: [
    { part: 'Before you start', title: 'Open Multisim', fig: 'bridge',
      do: 'Open NI Multisim on the lab computer (the sheet also links NI’s download page if you use your own). Start a new design.',
      observe: 'Find the Component toolbar, the Instruments toolbar on the right, and the green Run / red Stop buttons.',
      why: 'Part 1 is all on screen. Nothing on the bench is powered yet.' },
    { part: 'Part 1 · Step 1a', title: 'Place the 12 V source',
      do: MS('Component Toolbar – Place Source – POWER_SOURCES – DC_POWER – OK', 'Click to drop it. Double-click: Value = 12 V, Label = Vs.'),
      observe: 'The label on screen now reads Vs and 12 V.', why: 'This is the supply between A and F in Figure 3.' },
    { part: 'Part 1 · Step 1b', title: 'Place the seven resistors', fig: 'bridge',
      do: MS('Component Toolbar – Place Basic – RESISTOR – OK', 'Seven times. Set each value from Figure 3: R1 220 Ω, R2 100 Ω, R3 470 Ω, R4 1 kΩ, R5 4.7 kΩ, R6 2.2 kΩ, R7 1 kΩ. Rotate the vertical ones (right-click › rotate 90°).'),
      watch: 'Check each label matches its value. Swapping R₂ and R₃ is an easy mistake and changes everything.',
      hint: 'Type values like 4.7k in Multisim’s value box.' },
    { part: 'Part 1 · Step 1c', title: 'Ground and multimeter',
      do: MS('Component Toolbar – Place Source – POWER_SOURCES – GROUND – OK') + MS('Instruments Toolbar – Multimeter', 'Double-click XMM1 to open its panel, choose V and DC.'),
      why: 'Multisim will not simulate without a ground reference. The sheet puts it at F.' },
    { part: 'Part 1 · Step 1d', title: 'Wire it and run', fig: 'bridge',
      do: 'Hover a terminal until you see the wiring cursor, click, then click the next terminal. Wire exactly as Figure 3, with XMM1 + on D and − on E. Press Run.',
      observe: 'XMM1 now shows V<sub>R6</sub>.',
      why: 'The two meter leads go on either side of R₆, so the meter is across it.',
      hint: 'If you get a simulation error, look for a missing ground or a wire that ends near a terminal without connecting (no dot).' },
    { part: 'Part 1 · Step 2', title: 'Every resistor: V and I', fig: 'volt', table: 't1',
      do: 'Move XMM1 across each resistor (V) and record. For current, switch XMM1 to A and insert it in series with that resistor. Work out P = V × I for each.',
      observe: 'Current through R₁ equals current through R₇, because all of it passes both.',
      why: 'The table is the full picture of where the energy goes. P is in mW when V is in V and I in mA.',
      hint: 'Stop the simulation before rewiring, then Run again.' },
    { part: 'Part 1 · Step 3', title: 'R<sub>BE</sub> and R<sub>T</sub> in Multisim', fig: 'ohm', fields: ['sRBE', 'sRT'],
      do: 'Delete or disconnect the DC source. Set XMM1 to Ω. Measure between B and E, then between A and F.',
      why: 'An ohmmeter needs the circuit unpowered, in simulation as well as on the bench.' },
    { part: 'Part 1 · Step 4', title: 'Find the balancing R₆', fig: 'bridgeBal', calc: 'bal', fields: ['R6bal'], widget: 'balance',
      do: 'Use R₃/R₄ = R₅/R₆ to find R₆. Type your answer.',
      why: 'When the two sides divide the voltage in the same ratio, C and D end up at the same potential.' },
    { part: 'Part 1 · Step 4', title: 'Check the balance in Multisim', fig: 'bridgeBal', fields: ['sVR2bal', 'balAns'],
      do: 'Set R₆ to your value. Reconnect the source, Run, and measure across R₂.',
      observe: 'V<sub>R2</sub> very close to 0 V.',
      why: 'No voltage difference across R₂ means no current through it. The bridge then behaves as if R₂ were not there.' },
    { part: 'Part 2', title: 'Build the bridge on the breadboard', fig: 'bridge',
      do: 'With the supply off, build Figure 3 using the original R₆ (2.2 kΩ). Mark A to F on paper so you can find them. Set the supply to 12 V and connect it to A (+) and F (−).',
      watch: 'Follow your instructor’s directions and use only the kit’s parts. Check every connection before powering.',
      hint: 'Build it in the same shape as the drawing: it makes finding B, C, D and E much easier.' },
    { part: 'Part 2 · Step 1', title: 'Measure the supply at A and F', fig: 'volt', fields: ['hVs'],
      do: 'DMM on DC V, red on A, black on F.', observe: 'Close to 12 V.' },
    { part: 'Part 2 · Step 2', title: 'Every resistor on the breadboard', fig: 'amp', table: 't2',
      do: 'Measure each resistor’s voltage (across) and current (in series, supply off while you open the circuit). Work out P = V × I.',
      watch: 'Move the red lead back to the V jack after measuring current.',
      why: 'These are the real values, including tolerance and contact resistance.' },
    { part: 'Part 2 · Step 3', title: 'Compare with Multisim', fields: ['cmp12'],
      do: 'Compare Table 2 with Table 1 and write down possible reasons for the differences.',
      hint: 'Think: resistor tolerance, meter accuracy and loading, the supply not being exactly 12 V, breadboard contacts.' },
    { part: 'Part 2 · Steps 4–5', title: 'R<sub>BE</sub> and R<sub>T</sub> on the breadboard', fig: 'ohm', fields: ['hRBE', 'hRT', 'cmpR'],
      do: 'Disconnect the supply. Measure between B and E, then A and F. Compare them with Multisim.',
      watch: 'Never use the ohmmeter on a powered circuit.' },
    { part: 'Part 2 · Step 6', title: 'Balance the real bridge', fig: 'bridgeBal', fields: ['hVR2bal', 'hBalAns'],
      do: 'Supply off. Replace R₆ with the resistor of your balancing value from the kit. Power up and measure V<sub>R2</sub>.',
      observe: 'A small voltage, probably not exactly zero.',
      why: 'Each real resistor is a little off its nominal value, so the two ratios are not quite equal.' },
    { part: 'Part 3', title: 'Wye-delta by hand', fig: 'wye', calc: 'wye', fields: ['tRBE', 'tRT', 'tWork'],
      do: 'Convert the delta between B, C, D into a wye, then reduce what is left. Write your steps in the box.',
      why: 'After the conversion, the circuit is ordinary series and parallel again.',
      hint: 'Each wye arm = (the two delta resistors touching that node) ÷ (sum of all three).' },
    { part: 'Part 4', title: 'Proof image',
      do: 'In Multisim, measure the total current (meter as an ammeter in series near A). Screenshot it into your Word sheet as Figure 4.',
      why: 'It shows your instructor the simulation you built yourself.' },
  ],
};
