// unit6.js - Unit 6: Series-Parallel Combination Circuits (Read the study sheet -> Do the hands-on steps).
import { FIG } from './visuals.js';
const across = (g, m, a, b) =>
  (g.joined(m.T('red'), a) && g.joined(m.T('com'), b)) ||
  (g.joined(m.T('red'), b) && g.joined(m.T('com'), a));

export const LESSON_6 = {
  id: 'unit6',
  code: '6',
  title: 'Series–Parallel Circuits',
  color: '#c084fc',
  minutesRead: 8,
  doneLead: 'You reduced series–parallel networks step by step, measured series vs parallel voltage drops on the 3D bench, and tested the voltage-divider loading effect in both 2D and 3D:',

  // =========================================================================
  // PART 1 - THE STUDY SHEET
  // =========================================================================
  sheet: [
    {
      title: 'Identifying Series–Parallel Relationships',
      fig: FIG.seriesParallelFig,
      body: `<p>A [[series-parallel]] (combination) circuit contains both series and parallel current paths. Before touching a calculator, always trace the nodes from the positive source terminal to the negative terminal:</p>
      <ul>
        <li><b>Strictly in Series:</b> Two components or blocks are in series only if the <b>exact same current</b> must flow through both (no third branch splits off between them).</li>
        <li><b>Strictly in Parallel:</b> Two components or branches are in parallel only if both ends are connected directly to the <b>exact same pair of nodes</b> (so they share the exact same voltage).</li>
        <li><b>Redrawing Tip:</b> If a schematic looks diagonal or tangled, label the nodes (<b>A, B, C</b>) and redraw it with the source on the left and horizontal/vertical branches on the right.</li>
      </ul>`,
      key: 'In `R₁ + (R₂ ∥ R₃)`, `R₁` carries the full total current `I_T`, which then splits at node B into parallel branches `R₂` and `R₃`.',
    },
    {
      title: 'Total Resistance (R_T) & the Reduce-and-Return Method',
      body: `<p>To analyze any series–parallel circuit completely, use the <b>Reduce-and-Return</b> workflow:</p>
      <ul>
        <li><b>Step 1 — Reduce to R_T:</b> Start at the resistors farthest from the source. Replace each pure parallel pair (<code>R₂ ∥ R₃</code>) with its equivalent resistance <code>R_23 = (R₂ × R₃) / (R₂ + R₃)</code>, and add series resistors until you have one total resistance <code>R_T</code>.</li>
        <li><b>Step 2 — Find Total Current:</b> <code>I_T = V_S / R_T</code>.</li>
        <li><b>Step 3 — Expand Back Outward:</b>
          <br>• Series resistors carry <code>I_T</code>, so <code>V_R1 = I_T × R₁</code>.
          <br>• By [[KVL]], the voltage across the parallel bank is <code>V_23 = V_S − V_R1</code> (or <code>I_T × R_23</code>).
          <br>• Branch currents are <code>I₂ = V_23 / R₂</code> and <code>I₃ = V_23 / R₃</code>, and by [[KCL]] <code>I₂ + I₃ = I_T</code>!</li>
      </ul>`,
      key: '1. Combine `R₂ ∥ R₃ → R_23` · 2. Add `R_T = R₁ + R_23` · 3. Find `I_T = V_S / R_T` · 4. Use KVL & KCL to expand back.',
      exam: 'Example 2: the slide writes “1 mA × 1 kΩ = 3 V”, but R₁ is 3 kΩ. With V_S = 10 V and R_T = 10 kΩ, I_T = 1 mA. V_R1 = 1 mA × 3 kΩ = 3 V, V_R2 = 1 mA × 2 kΩ = 2 V, and the parallel section drops 10 − 3 − 2 = 5 V.',
    },
    {
      title: 'Loaded Voltage Dividers & the Loading Effect',
      fig: FIG.loadedDividerFig,
      body: `<p>An unloaded voltage divider (<code>R₁</code> and <code>R₂</code> in series) outputs <code>V_OUT = V_S × R₂ / (R₁ + R₂)</code>. What happens when you connect a load resistor <code>R_L</code> across the output (<code>R₂</code>)?</p>
      <ul>
        <li>[[Loading effect]]: Connecting <code>R_L</code> places it <b>in parallel with R₂</b>. Because parallel resistance is always smaller than either resistor alone, the equivalent bottom resistance <code>R_eq = R₂ ∥ R_L</code> is <b>smaller than R₂</b>!</li>
        <li><b>Loaded Output Voltage:</b> <code>V_OUT(loaded) = V_S × R_eq / (R₁ + R_eq)</code> — which is <b>always lower</b> than the unloaded output voltage!</li>
        <li><b>Stiff Divider Rule of Thumb:</b> If the load resistance <code>R_L</code> is at least <b>10 times larger</b> than <code>R₂</code> (<code>R_L ≥ 10 × R₂</code>), the output voltage drops by less than 10%.</li>
      </ul>`,
      key: 'Connecting a load `R_L` across `R₂` puts them in parallel (`R₂ ∥ R_L < R₂`), pulling `V_OUT` **down** (the [[loading effect]]).',
      exam: 'Always replace R₂ with (R₂ ∥ R_L) first, then apply the voltage-divider formula!',
    },
    {
      title: 'Bleeder Current & Ladder Networks',
      body: `<p><b>Bleeder Resistor & Bleeder Current:</b> In a multi-tap voltage divider, the bottom resistor connected to ground (<code>R₃</code>) that carries a continuous current even when all loads are disconnected is called the [[bleeder resistor]]. Its current is the <b>bleeder current</b>:</p>
      <ul>
        <li><b>Why use a bleeder resistor?</b> It keeps a minimum load on the supply to stabilize voltage regulation and safely discharges filter capacitors when power is turned off.</li>
        <li><b>Formula:</b> <code>I_bleeder = I_T − I_load1 − I_load2</code></li>
      </ul>
      <p><b>Ladder Networks:</b> A cascaded chain of repeating series-and-parallel resistor stages. Always reduce a ladder network starting at the <b>farthest end from the source</b> and working step-by-step back toward <code>V_S</code>.</p>`,
      key: 'Reduce [[ladder networks]] from the far right (load end) back to the source. [[Bleeder current]] flows through the unswitched ground resistor.',
    },
  ],

  // =========================================================================
  // PART 2 - INTERACTIVE DO STEPS
  // =========================================================================
  steps: [
    {
      id: 'combo-reducer-6', kind: 'visual', title: 'Step-by-step Reduce-and-Return',
      text: 'Walk through all 5 stages of reducing `R₁ + (R₂ ∥ R₃)` to a single `R_T` and expanding back out to find every voltage drop and branch current!',
      how: 'Click <b>Next step →</b> through all 5 stages to watch the circuit simplify and expand back.',
      visual: 'comboReducer',
      tasks: [{ text: 'Step through all 5 stages of the Reduce-and-Return solver' }],
      success: 'Combine `R₂ ∥ R₃` first, add `R₁`, find `I_T`, then use KVL and Ohm’s law to get every branch value!',
      question: {
        type: 'number',
        q: 'Resistor `R₁ = 400 Ω` is in series with a parallel pair of `R₂ = 600 Ω` and `R₃ = 600 Ω`. What is the total resistance `R_T` of the combination in ohms?',
        answer: 700,
        unit: 'Ω',
        fixedUnit: true,
        tol: 0.01,
        chips: ['300', '700', '1000', '1600'],
        why: 'First combine the parallel pair: two equal `600 Ω` resistors in parallel give `R_23 = 600 / 2 = 300 Ω`. Then add the series resistor: `R_T = 400 + 300 = [[700 Ω]]`.',
      },
    },
    {
      id: 'bench-series-parallel-6', kind: '3d', title: 'Measure a series–parallel network on the 3D bench',
      text: 'On the 3D bench, a `14 V` supply feeds `R1 = 400 Ω` in series with the parallel pair `R2 = 600 Ω ∥ R3 = 600 Ω` (`R_23 = 300 Ω`, so `R_T = 700 Ω` and `I_T = 20 mA`). Use the [[voltmeter]] to measure `V_R1` (`8.00 V`) and the parallel bank voltage `V_23` (`6.00 V`)!',
      how: 'Wire the voltmeter probes across <b>R1 (400 Ω)</b> first (`8 V`), then move the probes across <b>R2 (600 Ω)</b> (`6 V`).',
      scene: {
        camera: { pos: [0, 7.6, 7.6], target: [0, 0.2, 0.1] },
        setup(g, s) {
          s.got = [false, false];
          s.ps = g.supply({ pos: [-3.9, 0, -1.6], V: 14 });
          s.r1 = g.slot({ pos: [-0.8, 0, -2.0], content: { type: 'resistor', R: 400 }, locked: true, label: 'R1' });
          s.r2 = g.slot({ pos: [2.4, 0, -1.2], content: { type: 'resistor', R: 600 }, locked: true, label: 'R2' });
          s.r3 = g.slot({ pos: [2.4, 0, 1.0], content: { type: 'resistor', R: 600 }, locked: true, label: 'R3' });
          s.m = g.meter({ pos: [-1.0, 0, 2.0], mode: 'V', modes: ['V'] });
          g.wire(s.ps.T('+'), s.r1.T('a'), { locked: true });
          g.wire(s.r1.T('b'), s.r2.T('a'), { locked: true });
          g.wire(s.r2.T('a'), s.r3.T('a'), { locked: true });
          g.wire(s.r2.T('b'), s.r3.T('b'), { locked: true });
          g.wire(s.r2.T('b'), s.ps.T('-'), { locked: true });
          g.stage.updaters.add(() => {
            if (!s.got[0] && across(g, s.m, s.r1.T('a'), s.r1.T('b')) && Math.abs(Math.abs(s.m.value) - 8) < 0.3) s.got[0] = true;
            if (!s.got[1] && (across(g, s.m, s.r2.T('a'), s.r2.T('b')) || across(g, s.m, s.r3.T('a'), s.r3.T('b'))) && Math.abs(Math.abs(s.m.value) - 6) < 0.3) s.got[1] = true;
          });
        },
        highlight(g, s) {
          if (!s.got[0]) return [s.m.T('red'), s.m.T('com'), s.r1.T('a'), s.r1.T('b')];
          if (!s.got[1]) return [s.r2.T('a'), s.r2.T('b')];
          return [];
        },
      },
      tasks: [
        { text: 'Measure V_R1 across the series resistor R1 (400 Ω) → 8.00 V', done: (g, s) => s.got[0] },
        { text: 'Move the probes across R2 (600 Ω) to measure the parallel bank voltage → 6.00 V', done: (g, s) => s.got[1] },
      ],
      success: 'KVL holds across series–parallel blocks too: `V_R1 (8 V) + V_parallel (6 V) = 14 V`!',
      question: {
        type: 'number',
        q: 'In that same circuit (`V_parallel = 6 V` across `R₂ = 600 Ω` and `R₃ = 600 Ω`), how much current (in `mA`) flows through branch resistor `R₂`?',
        answer: 10,
        unit: 'mA',
        fixedUnit: true,
        tol: 0.01,
        chips: ['5', '10', '20', '35'],
        why: '`I₂ = V_parallel / R₂ = 6 V ÷ 600 Ω = 0.01 A = [[10 mA]]` (half of the `20 mA` total current, since `R₂ = R₃`).',
      },
    },
    {
      id: 'bench-loading-effect-6', kind: '3d', title: 'See the Voltage-Divider Loading Effect on the 3D bench',
      text: 'On the 3D bench, an unloaded voltage divider (`R1 = 1 kΩ`, `R2 = 1 kΩ` across `12 V`) shows `V_OUT = 6.00 V` on the voltmeter. Flip the **Connect Load (R_L = 1 kΩ)** switch to connect `R_L` in parallel with `R2` (`1 kΩ ∥ 1 kΩ = 500 Ω`) and watch `V_OUT` sag!',
      how: 'Click the <b>bench switch</b> to connect the `1 kΩ` load resistor across `R2` and watch the voltmeter.',
      scene: {
        camera: { pos: [0, 7.6, 7.6], target: [0, 0.2, 0.1] },
        allowWiring: false,
        setup(g, s) {
          s.ps = g.supply({ pos: [-3.9, 0, -1.4], V: 12 });
          s.r1 = g.slot({ pos: [-1.0, 0, -1.8], content: { type: 'resistor', R: 1000 }, locked: true, label: 'R1' });
          s.r2 = g.slot({ pos: [1.8, 0, -1.4], content: { type: 'resistor', R: 1000 }, locked: true, label: 'R2' });
          s.sw = g.switch({ pos: [0.4, 0, 1.2], closed: false });
          s.rl = g.slot({ pos: [2.8, 0, 1.2], content: { type: 'resistor', R: 1000 }, locked: true, label: 'Load R_L' });
          s.m = g.meter({ pos: [-1.4, 0, 1.8], mode: 'V', modes: ['V'] });
          g.wire(s.ps.T('+'), s.r1.T('a'), { locked: true });
          g.wire(s.r1.T('b'), s.r2.T('a'), { locked: true });
          g.wire(s.r2.T('b'), s.ps.T('-'), { locked: true });
          g.wire(s.m.T('red'), s.r2.T('a'), { locked: true });
          g.wire(s.m.T('com'), s.r2.T('b'), { locked: true });
          g.wire(s.r2.T('a'), s.sw.T('a'), { locked: true });
          g.wire(s.sw.T('b'), s.rl.T('a'), { locked: true });
          g.wire(s.rl.T('b'), s.r2.T('b'), { locked: true });
        },
        highlight(g, s) { return !s.sw.closed ? [s.sw] : []; },
      },
      tasks: [
        { text: 'Flip the switch to connect Load R_L (1 kΩ) across R2 and see V_OUT drop from 6.00 V to 4.00 V', done: (g, s) => s.sw.closed && Math.abs(Math.abs(s.m.value) - 4) < 0.15 },
      ],
      success: 'Because `R2 ∥ R_L = 1 kΩ ∥ 1 kΩ = 500 Ω`, the bottom half of the divider is now half of `R1` (`1 kΩ`), pulling `V_OUT` down from `6 V` to `4 V`!',
      question: {
        q: 'When a load resistor `R_L` is connected across the output of a voltage divider, why does the output voltage `V_OUT` decrease? (Slide 33 quiz)',
        options: [
          'Because R_L is in parallel with the bottom divider resistor R₂, reducing their combined equivalent resistance',
          'Because R_L increases the resistance of the bottom half of the divider',
          'Because R_L is in series with R₁',
          'Because the source voltage V_S turns off',
        ],
        correct: 0,
        why: 'Connecting `R_L` in parallel with `R₂` makes `R₂ ∥ R_L < R₂`, which lowers the bottom share of the voltage divider (the [[loading effect]]).',
      },
    },
    {
      id: 'loaded-divider-sim-6', kind: 'visual', title: 'Make a "stiff" voltage divider (minimal loading)',
      text: 'In the divider below (`R₁ = R₂ = 10 kΩ`, unloaded `V_OUT = 5 V`), slide the load resistance **R_L** up until `R_L` is much larger than `R₂` (`R_L ≥ 100 kΩ`) so `V_OUT` stays above **4.95 V**!',
      how: 'Drag the <b>Load R_L</b> slider to the right until the readout turns green (`V_OUT > 4.95 V`).',
      visual: 'loadedDivider',
      tasks: [{ text: 'Increase Load R_L until V_OUT is within 1% of its 5 V unloaded value' }],
      success: 'When `R_L` is much larger than `R₂` (at least `10 × R₂`), the divider is "stiff" and the loading effect is minimal!',
      question: {
        q: 'In a multi-tap power-supply voltage divider, what do we call the current through the bottom resistor that flows continuously even when external loads are disconnected?',
        options: ['Bleeder current', 'Short-circuit current', 'Surge current', 'Conventional current'],
        correct: 0,
        why: 'The bottom resistor is the [[bleeder resistor]], and the current through it is the [[bleeder current]].',
      },
    },
  ],
};
