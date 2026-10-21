// unit2b.js - Unit 2B: Ohm's Law (Read the study sheet -> Do the hands-on steps).
import { FIG } from './visuals.js';
import { Screen } from '../game/engine/Parts.js';

const across = (g, m, a, b) =>
  (g.joined(m.T('red'), a) && g.joined(m.T('com'), b)) ||
  (g.joined(m.T('red'), b) && g.joined(m.T('com'), a));

function drawVI(scr, pts, R) {
  scr.draw((c, w, h) => {
    const L = 90, B = h - 70, W = w - 140, H = h - 130;
    c.strokeStyle = '#1e3a35'; c.lineWidth = 1;
    for (let i = 0; i <= 6; i++) { const x = L + W * i / 6; c.beginPath(); c.moveTo(x, B); c.lineTo(x, B - H); c.stroke(); }
    for (let i = 0; i <= 4; i++) { const y = B - H * i / 4; c.beginPath(); c.moveTo(L, y); c.lineTo(L + W, y); c.stroke(); }
    c.strokeStyle = '#5eead4'; c.lineWidth = 3; c.beginPath(); c.moveTo(L, B - H); c.lineTo(L, B); c.lineTo(L + W, B); c.stroke();
    c.fillStyle = '#99f6e4'; c.font = 'bold 26px monospace';
    c.fillText('V →', L + W - 50, B + 48); c.fillText('I', 40, B - H + 10);
    for (let i = 0; i <= 6; i++) c.fillText(String(i * 4), L + W * i / 6 - 10, B + 28);
    c.fillText(`R = ${R} Ω`, L + 20, 52);
    const Imax = 24 / R;
    c.font = '20px monospace'; c.fillText(`${Math.round(Imax * 1000)} mA`, 6, B - H + 40);
    if (pts.size >= 2) { c.strokeStyle = 'rgba(250,204,21,.45)'; c.setLineDash([10, 8]); c.beginPath(); c.moveTo(L, B); c.lineTo(L + W, B - H); c.stroke(); c.setLineDash([]); }
    pts.forEach((I, V) => {
      const x = L + W * V / 24, y = B - H * (I / Imax);
      c.fillStyle = '#facc15'; c.shadowColor = '#facc15'; c.shadowBlur = 14; c.beginPath(); c.arc(x, y, 9, 0, 7); c.fill(); c.shadowBlur = 0;
    });
  });
}

export const LESSON_2B = {
  id: 'unit2b',
  code: '2B',
  title: "Ohm's Law",
  color: '#22d3ee',
  minutesRead: 6,
  doneLead: "You mastered the Ohm's law triangle, plotted a live V–I graph on the 3D bench monitor, swapped resistors to test inverse proportion, and uncovered a mystery resistor using V and A meters:",

  // =========================================================================
  // PART 1 - THE STUDY SHEET
  // =========================================================================
  sheet: [
    {
      title: "Ohm's Law & the Three Equations",
      fig: FIG.ohmTriFig,
      body: `<p>[[Ohm's law]] is the most important relationship in circuit analysis. It states that current (<b>I</b>) in a resistive circuit is [[directly proportional]] to applied voltage (<b>V</b>) and [[inversely proportional]] to resistance (<b>R</b>):</p>
      <ul>
        <li><b>Solve for Current:</b> <code>I = V / R</code> &nbsp;(Amperes = Volts ÷ Ohms)</li>
        <li><b>Solve for Voltage:</b> <code>V = I × R</code> &nbsp;(Volts = Amperes × Ohms)</li>
        <li><b>Solve for Resistance:</b> <code>R = V / I</code> &nbsp;(Ohms = Volts ÷ Amperes)</li>
      </ul>
      <p><b>Memory trick (the V–I–R triangle):</b> Put <b>V</b> on top and <b>I · R</b> on the bottom. Cover the letter you want to find with your thumb: if the remaining two are top-over-bottom, divide; if they are side-by-side, multiply!</p>`,
      key: '[[I = V / R]], [[V = I × R]], and [[R = V / I]]. Cover the unknown in the V–I–R triangle.',
      exam: 'Metric prefix shortcuts save time: Volts ÷ kilohms (kΩ) = milliamps (mA), and milliamps (mA) × kilohms (kΩ) = Volts!',
    },
    {
      title: 'Direct Proportion (I vs V) & Linear V–I Graphs',
      fig: FIG.viGraphFig,
      body: `<p>If you keep resistance <b>R constant</b> and change the source voltage <b>V</b>:</p>
      <ul>
        <li>Increase <b>V</b> → current <b>I</b> increases by the exact same factor (<b>double V → double I</b>; triple V → triple I).</li>
        <li>Decrease <b>V</b> → current <b>I</b> decreases by the same factor.</li>
        <li>Plotting current <b>I</b> (vertical axis) against voltage <b>V</b> (horizontal axis) for any fixed resistor produces a <b>straight line passing through the origin (0, 0)</b>. That is why fixed resistors are called <b>linear</b> devices.</li>
        <li>A <b>smaller resistance</b> allows more current per volt, so its V–I line is <b>steeper</b> (slope = <code>1 / R = G</code>).</li>
      </ul>`,
      key: 'With [[R constant]], [[I]] and [[V]] are [[directly proportional]]: a straight line through `(0, 0)` with slope `1/R`.',
    },
    {
      title: 'Inverse Proportion (I vs R)',
      body: `<p>If you keep source voltage <b>V constant</b> and change the resistance <b>R</b>:</p>
      <ul>
        <li>Increase <b>R</b> → current <b>I</b> decreases (<b>double R → half I</b>; 10× R → 1/10 I).</li>
        <li>Decrease <b>R</b> → current <b>I</b> increases (half R → double I).</li>
        <li><b>Slide problem:</b> A toaster has <code>12 Ω</code> in a <code>120 V</code> circuit, so <code>I = 120 / 12 = 10 A</code>. A <code>12 V</code> battery across <code>10 Ω</code> of headlight resistance pushes <code>I = 12 / 10 = 1.2 A</code>.</li>
      </ul>`,
      key: 'With [[V constant]], [[I]] and [[R]] are [[inversely proportional]]: doubling [[R]] cuts [[I]] in half.',
      exam: 'Watch for ratio questions on exams: if V is tripled and R is kept constant, I triples; if V is constant and R is doubled, I is halved.',
    },
    {
      title: 'Calculating Current, Voltage & Resistance (Worked Examples)',
      body: `<p>Always convert metric prefixes to powers of 10 (or use matching pairs like <code>kΩ ↔ mA</code> and <code>MΩ ↔ µA</code>) before calculating:</p>
      <ul>
        <li><b>Finding Current (I = V / R):</b> If <code>V = 100 V</code> and <code>R = 22 Ω</code>, then <code>I = 100 / 22 = 4.55 A</code>. If <code>V = 25 V</code> across <code>R = 4.7 kΩ</code>, then <code>I = 25 V / 4.7 kΩ = 5.32 mA</code>.</li>
        <li><b>Finding Voltage (V = I × R):</b> If <code>I = 5 mA</code> (<code>5 × 10⁻³ A</code>) flows through <code>R = 56 Ω</code>, then <code>V = 0.005 × 56 = 0.28 V = 280 mV</code>. If <code>I = 8 mA</code> flows through <code>R = 3.3 kΩ</code> (<code>Orange-Orange-Red</code>), <code>V = 8 mA × 3.3 kΩ = 26.4 V</code>.</li>
        <li><b>Finding Resistance (R = V / I):</b> If a <code>12 V</code> source pushes <code>3.08 A</code> through a lamp, <code>R = 12 V / 3.08 A = 3.90 Ω</code>. If <code>150 V</code> produces <code>4.55 mA</code>, <code>R = 150 V / 4.55 mA = 33.0 kΩ</code>.</li>
      </ul>`,
      key: 'Keep prefixes straight: [[V ÷ Ω = A]], [[V ÷ kΩ = mA]], [[V ÷ MΩ = µA]], and [[mA × kΩ = V]].',
      exam: 'When a schematic shows resistor colour bands instead of a number, decode the bands first (e.g. Red-Violet-Brown = 270 Ω) and then apply Ohm’s law.',
    },
  ],

  // =========================================================================
  // PART 2 - INTERACTIVE DO STEPS
  // =========================================================================
  steps: [
    {
      id: 'ohm-triangle-2b', kind: 'visual', title: "Cover the unknown in the Ohm's law triangle",
      text: 'The [[Ohm\'s law]] triangle puts <b>V</b> on top and <b>I · R</b> on the bottom. Click each of the three letters to cover it and see the exact formula!',
      how: 'Click <b>V</b>, <b>I</b>, and <b>R</b> in the triangle below.',
      visual: 'ohmTriangle',
      tasks: [{ text: 'Click all three letters (V, I, and R) in the triangle' }],
      success: 'Top-over-bottom means divide (`I = V/R`, `R = V/I`); side-by-side means multiply (`V = I × R`).',
      question: {
        q: 'Which formula correctly solves for [[voltage (V)]] using Ohm\'s law?',
        options: ['V = I × R', 'V = I ÷ R', 'V = R ÷ I', 'V = I + R'],
        correct: 0,
        why: 'Covering **V** at the top of the triangle leaves **I** and **R** side-by-side at the bottom: [[V = I × R]].',
      },
    },
    {
      id: 'bench-vi-graph', kind: '3d', title: 'Direct proportion: plot a live V–I graph on the 3D bench',
      text: 'On the 3D bench, an [[ammeter]] is wired in series with a `100 Ω` resistor and a 3D graph monitor. Use the **+** and **−** buttons on the power supply to dial `6 V` (`60 mA`), then double it to `12 V` (`120 mA`)!',
      how: 'Click the <b>+ button</b> on the power supply to step voltage to <b>6 V</b>, then up to <b>12 V</b>, and watch the yellow dots plot a straight line on the 3D monitor.',
      scene: {
        camera: { pos: [0.3, 7.0, 8.8], target: [0.3, 0.9, 0] },
        allowWiring: false,
        setup(g, s) {
          s.ps = g.supply({ pos: [-3.9, 0, -2.3], V: 2, adjustable: true, min: 0, max: 24, step: 2 });
          s.m = g.meter({ pos: [0.6, 0, 1.6], mode: 'A', modes: ['A'] });
          s.r = g.slot({ pos: [3.4, 0, 0.4], content: { type: 'resistor', R: 100 }, locked: true });
          s.scr = g.add(Screen, { pos: [1.4, 0, -3.4] });
          g.wire(s.ps.T('+'), s.m.T('red'), { locked: true });
          g.wire(s.m.T('com'), s.r.T('a'), { locked: true });
          g.wire(s.r.T('b'), s.ps.T('-'), { locked: true });
          s.pts = new Map(); s.key = '';
          g.stage.updaters.add(() => {
            const I = Math.abs(s.m.value || 0);
            if (s.ps.V > 0 && I > 0) s.pts.set(s.ps.V, I);
            const k = [...s.pts.keys()].join(',');
            if (k !== s.key) { s.key = k; drawVI(s.scr, s.pts, 100); }
          });
          drawVI(s.scr, s.pts, 100);
        },
        highlight(g, s) { return [s.ps]; },
      },
      tasks: [
        { text: 'Set the supply to 6 V so the ammeter reads 60 mA', done: (g, s) => Math.abs(Math.abs(s.m.value) - 0.06) < 0.002 },
        { text: 'Double the supply to 12 V so the current doubles to 120 mA', done: (g, s) => s.ps.V === 12 && Math.abs(Math.abs(s.m.value) - 0.12) < 0.003 },
      ],
      success: 'Double V → double I! And look at the 3D monitor: the points lie on a straight line through `(0, 0)`.',
      question: {
        q: 'If the resistance in a circuit is kept constant and the source voltage is [[tripled]], what happens to the current?',
        options: [
          'The current triples (3×)',
          'The current is cut to one-third (⅓×)',
          'The current stays the same',
          'The current increases by 9×',
        ],
        correct: 0,
        why: 'Current **I** is [[directly proportional]] to voltage **V** when **R** is constant (`I = V/R`), so tripling **V** triples **I**.',
      },
    },
    {
      id: 'bench-resistor-swap', kind: '3d', title: 'Inverse proportion: swap resistors on the 3D bench',
      text: 'Now the supply is fixed at **12 V**. To change the current, you have to change the [[resistance]]! Pick the right colour-coded resistor from the bin so the ammeter reads **12 mA** (`R = 12 V / 12 mA = 1 kΩ`), then **120 mA** (`100 Ω`).',
      how: 'Hover resistors in the bin to check their bands, click the <b>1 kΩ (Brown–Black–Red)</b> resistor and click the empty slot `R`, then swap in the <b>100 Ω (Brown–Black–Brown)</b> resistor.',
      scene: {
        camera: { pos: [0.4, 7.4, 8.2], target: [0.4, 0.3, 0.5] },
        allowWiring: false,
        setup(g, s) {
          s.ps = g.supply({ pos: [-3.9, 0, -2.3], V: 12 });
          s.m = g.meter({ pos: [-1.0, 0, -1.9], mode: 'A', modes: ['A'] });
          s.r = g.slot({ pos: [2.8, 0, -0.6], content: null, accepts: ['resistor'], label: 'R' });
          s.bin = g.bin({ pos: [1.0, 0, 3.0], items: [100, 220, 470, 1000, 2200].map(R => ({ type: 'resistor', R })), showValues: true });
          g.wire(s.ps.T('+'), s.m.T('red'), { locked: true });
          g.wire(s.m.T('com'), s.r.T('a'), { locked: true });
          g.wire(s.r.T('b'), s.ps.T('-'), { locked: true });
        },
        highlight(g, s) { return g.held ? [s.r] : [s.bin]; },
      },
      tasks: [
        { text: 'Drop the 1 kΩ resistor into slot R to get 12 mA', done: (g, s) => s.r.content?.R === 1000 },
        { text: 'Swap in the 100 Ω resistor (10× smaller R) to get 120 mA (10× larger I)', done: (g, s) => s.r.content?.R === 100 },
      ],
      success: 'Cutting resistance by 10× multiplied the current by 10× — [[current]] and [[resistance]] are [[inversely proportional]]!',
      question: {
        type: 'number',
        q: 'With `25 V` applied across a `4.7 kΩ` resistor, how much current flows in `mA`?',
        answer: 5.32,
        unit: 'mA',
        fixedUnit: true,
        tol: 0.02,
        chips: ['0.188', '5.32', '29.7', '117.5'],
        why: 'Using `V ÷ kΩ = mA`: `I = 25 V ÷ 4.7 kΩ = [[5.32 mA]]`.',
      },
    },
    {
      id: 'ohm-playground-2b', kind: 'visual', title: 'Hit 20 mA in the Ohm’s Law simulator',
      text: 'Slide **Voltage (V)** and **Resistance (R)** in the interactive circuit below until the current lands on **20 mA** (`0.02 A`) — for example, `12 V` across `600 Ω`, or `10 V` across `500 Ω`.',
      how: 'Drag the <b>Voltage V</b> or <b>Resistance R</b> slider until the readout turns green at <b>20 mA</b>.',
      visual: 'ohmPlayground',
      tasks: [{ text: 'Adjust V and R so the circuit current equals 20 mA' }],
      success: 'Any pair of V and R with a ratio of `20 mA` (`V / R = 0.02 A`) works!',
      question: {
        type: 'number',
        q: 'How much voltage (in V) is needed to push `5 mA` (`0.005 A`) of current through a `56 Ω` resistor?',
        answer: 0.28,
        unit: 'V',
        fixedUnit: true,
        tol: 0.02,
        chips: ['0.28', '2.8', '11.2', '280'],
        why: '`V = I × R = 0.005 A × 56 Ω = [[0.28 V]]` (`280 mV`).',
      },
    },
    {
      id: 'bench-mystery-resistor', kind: '3d', title: 'Solve the mystery resistor on the 3D bench',
      text: 'Someone taped over this resistor\'s colour bands! Measure the [[voltage]] across it (`12 V` supply) and the [[current]] through it (`25.5 mA`), then calculate `R = V / I` to unmask its value.',
      how: 'Click the meter dial to <b>V</b> and wire its probes across the mystery resistor to read its voltage.',
      scene: {
        camera: { pos: [0, 7.2, 6.8], target: [0, 0.2, 0.1] },
        setup(g, s) {
          s.ps = g.supply({ pos: [-3.9, 0, -2.0], V: 12 });
          s.r = g.slot({ pos: [1.6, 0, -0.6], content: { type: 'resistor', R: 470, mystery: true }, locked: true, label: 'Mystery R (I = 25.5 mA)' });
          s.m = g.meter({ pos: [3.2, 0, 1.6], mode: 'V', modes: ['V'], rotY: -0.35 });
          g.wire(s.ps.T('+'), s.r.T('a'), { locked: true });
          g.wire(s.r.T('b'), s.ps.T('-'), { locked: true });
        },
        highlight(g, s) {
          if (across(g, s.m, s.r.T('a'), s.r.T('b'))) return [];
          return g.pending ? [s.r.T('a'), s.r.T('b')] : [s.m.T('red'), s.m.T('com')];
        },
      },
      tasks: [
        { text: 'Clip the voltmeter across the mystery resistor to read V = 12.0 V', done: (g, s) => across(g, s.m, s.r.T('a'), s.r.T('b')) && Math.abs(s.m.value - 12) < 0.3 },
      ],
      success: 'With `V = 12 V` and `I = 25.53 mA` (`0.02553 A`), let\'s calculate the mystery resistance `R = V / I`!',
      question: {
        type: 'number',
        q: 'With `12 V` across the mystery resistor and `25.53 mA` (`0.02553 A`) flowing through it, what is its resistance `R` in ohms?',
        answer: 470,
        unit: 'Ω',
        fixedUnit: true,
        tol: 0.02,
        chips: ['220', '330', '470', '1000'],
        why: '`R = V / I = 12 V ÷ 0.02553 A = [[470 Ω]]` (Yellow–Violet–Brown).',
      },
    },
  ],
};
