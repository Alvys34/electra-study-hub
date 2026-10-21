// unit5.js - Unit 5: Parallel Circuits & KCL (Read the study sheet -> Do the hands-on steps).
import { FIG } from './visuals.js';
import { fmtI } from '../game/engine/Game.js';
const across = (g, m, a, b) =>
  (g.joined(m.T('red'), a) && g.joined(m.T('com'), b)) ||
  (g.joined(m.T('red'), b) && g.joined(m.T('com'), a));
const lit = s => Math.abs(s.I || 0) > 0.08;

export const LESSON_5 = {
  id: 'unit5',
  code: '5',
  title: 'Parallel Circuits & KCL',
  color: '#34d399',
  minutesRead: 8,
  doneLead: "You wired lamps in parallel on the 3D bench, measured parallel equivalent resistance with an ohmmeter, verified Kirchhoff's Current Law (KCL), and tested how an open parallel branch affects total current:",

  // =========================================================================
  // PART 1 - THE STUDY SHEET
  // =========================================================================
  sheet: [
    {
      title: 'What Makes a Circuit "Parallel"? (Same Voltage Across Every Branch)',
      fig: FIG.parallelBranches,
      body: `<p>When two or more components are connected across the <b>same two common nodes (junctions)</b>, they are in [[parallel]]. A [[parallel circuit]] provides <b>more than one path (branch)</b> for current between two points.</p>
      <ul>
        <li><b>Parallel Voltage Rule:</b> Because every parallel branch connects directly between the same two nodes, the <b>voltage across every parallel branch is identical</b> and equals the source voltage:
          <br><code>V_T = V₁ = V₂ = V₃ = … = V_S</code></li>
        <li><b>Real-world example:</b> Household outlets and car headlights are wired in parallel so every appliance gets the full source voltage (<code>120 V</code> or <code>12 V</code>) and can turn on or off independently without killing the others.</li>
      </ul>`,
      key: '[[Parallel branches]] share the same two nodes, so [[voltage is the same]] across every branch (`V₁ = V₂ = V₃ = V_S`).',
      exam: 'In parallel, you never divide the voltage — every parallel branch gets the full voltage across those two nodes!',
    },
    {
      title: "Kirchhoff's Current Law (KCL)",
      body: `<p>A <b>node</b> (junction) is any point where two or more circuit paths meet. [[Kirchhoff's Current Law]] ([[KCL]]) states that charge never piles up or disappears at a node:</p>
      <ul>
        <li><b>Node Form:</b> The sum of all currents <b>entering</b> a node equals the sum of all currents <b>leaving</b> that node: <code>I_in(1) + I_in(2) + … = I_out(1) + I_out(2) + …</code></li>
        <li><b>Parallel Total Current Form:</b> Total source current splits among the parallel branches and recombines on the return side:
          <br><code>I_T = I₁ + I₂ + I₃ + … + I_n</code></li>
        <li><b>Finding an Unknown Branch Current (quiz):</b> If <code>I_T = 100 mA</code> splits into three branches and two of them are <code>40 mA</code> and <code>20 mA</code>, the third is <code>100 − 40 − 20 = 40 mA</code>. (60 mA would be the remainder only if there were just two branches.)</li>
      </ul>`,
      key: '[[KCL]]: Currents entering a node equal currents leaving (`I_T = I₁ + I₂ + I₃`).',
    },
    {
      title: 'Total Parallel Resistance (R_T): Three Essential Formulas',
      body: `<p>Every time you connect another resistor in parallel, you open an <b>additional lane</b> for current to flow. More paths mean <b>less overall opposition</b>, so total parallel resistance <code>R_T</code> is <b>ALWAYS smaller than the smallest branch resistor</b>!</p>
      <ul>
        <li><b>1. General Reciprocal Formula (any number of resistors):</b>
          <br><code>1 / R_T = 1 / R₁ + 1 / R₂ + 1 / R₃ + … + 1 / R_n</code> &nbsp;(or <code>G_T = G₁ + G₂ + G₃</code>)</li>
        <li><b>2. Two-Resistor Product-Over-Sum Shortcut:</b>
          <br><code>R_T = (R₁ × R₂) ÷ (R₁ + R₂)</code></li>
        <li><b>3. Equal-Value Resistors Shortcut:</b> For <code>n</code> parallel resistors all having the same resistance <code>R</code>:
          <br><code>R_T = R ÷ n</code> &nbsp;(e.g., four <code>100 Ω</code> resistors in parallel → <code>100 / 4 = 25 Ω</code>).</li>
      </ul>`,
      key: 'In parallel, [[R_T is ALWAYS less than the smallest resistor]]! Adding a parallel branch [[decreases R_T]] and [[increases I_T]].',
      exam: 'Sanity-check every parallel R_T calculation: if your answer is bigger than the smallest resistor (e.g. 680 Ω, 1 kΩ, 2.2 kΩ → R_T = 342 Ω, which is less than 680 Ω), you forgot to hit the 1/x key!',
    },
    {
      title: 'Current Dividers & Power in Parallel Circuits',
      body: `<p><b>Current-Divider Rule:</b> Because <code>I_x = V / R_x</code> and <code>V</code> is the same for all branches, branch current is <b>inversely proportional</b> to branch resistance — the <b>smallest resistor takes the largest current</b>!</p>
      <ul>
        <li><b>General Current-Divider Formula:</b> <code>I_x = I_T × (R_T / R_x)</code></li>
        <li><b>Two-Branch Current-Divider Formula (opposite resistor on top!):</b>
          <br><code>I₁ = I_T × R₂ / (R₁ + R₂)</code> &nbsp;and&nbsp; <code>I₂ = I_T × R₁ / (R₁ + R₂)</code></li>
      </ul>
      <p><b>Power in Parallel Circuits:</b> Just like in series, total power is the sum of the powers in all branches:</p>
      <ul>
        <li><code>P_T = P₁ + P₂ + P₃ + … + P_n = V_S × I_T = V_S² / R_T</code></li>
        <li>Because every branch sees the same voltage <code>V_S</code> (<code>P_x = V_S² / R_x</code>), the <b>smallest resistor in parallel dissipates the most power</b>!</li>
      </ul>`,
      key: '[[Current divider]]: smallest R gets the largest I (`I₁ = I_T × R₂ / (R₁ + R₂)`). Total power `P_T = P₁ + P₂ + …`.',
    },
    {
      title: 'Troubleshooting Parallel Circuits (Open vs Shorted Branch)',
      body: `<p>What happens when a fault occurs in a parallel circuit?</p>
      <ul>
        <li><b>Open Branch in Parallel:</b> If one branch resistor opens, current in that open branch drops to <code>0 A</code>. However, voltage across the remaining parallel branches stays at <code>V_S</code>, so <b>the other branch currents do NOT change</b>! Total current <code>I_T</code> simply <b>decreases</b> by the missing branch current (and <code>R_T</code> increases).</li>
        <li><b>Shorted Branch in Parallel:</b> A short across any parallel branch shorts out the entire parallel network (<code>R_T ≈ 0 Ω</code>), dropping voltage across all branches to <code>0 V</code> and blowing the main series fuse or tripping the breaker!</li>
      </ul>`,
      key: 'When one parallel branch [[opens]], the other branches keep their normal voltage and current, while [[I_T decreases]]!',
      exam: 'Compare: In SERIES, one open stops all current (I_T = 0). In PARALLEL, one open only stops that single branch while other branches keep running!',
    },
  ],

  // =========================================================================
  // PART 2 - INTERACTIVE DO STEPS
  // =========================================================================
  steps: [
    {
      id: 'bench-parallel-lamps-5', kind: '3d', title: 'Wire two lamps in parallel on the 3D bench',
      text: 'In a [[parallel circuit]], each load has its own branch connected across the `12 V` supply. Lamp **L1** is already wired across the supply (`12 V`, `240 mA`). Wire lamp **L2** in parallel across **L1** so both lamps get the full **12 V** and shine at full brightness!',
      how: 'Wire <b>L1’s left post</b> to <b>L2’s left post</b>, and wire <b>L1’s right post</b> to <b>L2’s right post</b>.',
      scene: {
        camera: { pos: [0, 7.4, 7.2], target: [0, 0.2, 0.1] },
        setup(g, s) {
          s.ps = g.supply({ pos: [-3.8, 0, -1.2], V: 12 });
          s.l1 = g.slot({ pos: [1.4, 0, -1.6], content: { type: 'lamp', R: 50, Prated: 2.88 }, locked: true, label: 'Branch 1 (L1)' });
          s.l2 = g.slot({ pos: [1.4, 0, 1.2], content: { type: 'lamp', R: 50, Prated: 2.88 }, locked: true, label: 'Branch 2 (L2)' });
          g.wire(s.ps.T('+'), s.l1.T('a'), { locked: true });
          g.wire(s.l1.T('b'), s.ps.T('-'), { locked: true });
        },
        highlight(g, s) {
          if (lit(s.l1) && lit(s.l2) && Math.abs(s.l2.Vd) > 11) return [];
          return [s.l1.T('a'), s.l1.T('b'), s.l2.T('a'), s.l2.T('b')];
        },
      },
      tasks: [
        {
          text: 'Wire Lamp L2 in parallel across Lamp L1 so both lamps receive the full 12 V',
          done: (g, s) => lit(s.l1) && lit(s.l2) && Math.abs(s.l2.Vd) > 11,
        },
      ],
      success: 'Both lamps shine at full `12 V` (`240 mA` each, `I_T = 480 mA`)! Parallel branches share the exact same voltage.',
      question: {
        q: 'Three resistors (`1 kΩ`, `2.2 kΩ`, and `4.7 kΩ`) are connected in [[parallel]] across a `15 V` battery. What is the voltage across the `4.7 kΩ` resistor?',
        options: ['15 V', '5 V', '9.04 V', '0 V'],
        correct: 0,
        why: 'In a [[parallel circuit]], the voltage is the **same across every branch** and equals the source voltage: [[15 V]].',
      },
    },
    {
      id: 'bench-parallel-rt-5', kind: '3d', title: 'Measure parallel total resistance (R_T) on the 3D bench',
      text: 'Two `1,000 Ω` (`1 kΩ`) resistors are wired in parallel on the bench (with no power supply connected). By the equal-value rule `R_T = R / n = 1,000 / 2 = 500 Ω` — smaller than either `1 kΩ` resistor! Clip the [[ohmmeter]] across the parallel pair to verify.',
      how: 'Wire the ohmmeter’s <b>red jack</b> to one side of the parallel pair and the <b>black COM jack</b> to the other side.',
      scene: {
        camera: { pos: [0, 7.2, 6.8], target: [0, 0.2, 0.1] },
        setup(g, s) {
          s.r1 = g.slot({ pos: [-1.2, 0, -1.4], content: { type: 'resistor', R: 1000 }, locked: true, label: 'R1' });
          s.r2 = g.slot({ pos: [-1.2, 0, 0.8], content: { type: 'resistor', R: 1000 }, locked: true, label: 'R2' });
          s.m = g.meter({ pos: [2.6, 0, 0.6], mode: 'Ω', modes: ['Ω'], rotY: -0.25 });
          g.wire(s.r1.T('a'), s.r2.T('a'), { locked: true });
          g.wire(s.r1.T('b'), s.r2.T('b'), { locked: true });
        },
        highlight(g, s) {
          if (across(g, s.m, s.r1.T('a'), s.r1.T('b'))) return [];
          return g.pending ? [s.r1.T('a'), s.r1.T('b')] : [s.m.T('red'), s.m.T('com')];
        },
      },
      tasks: [
        { text: 'Clip the ohmmeter across the parallel 1 kΩ ∥ 1 kΩ pair to read R_T = 500 Ω', done: (g, s) => across(g, s.m, s.r1.T('a'), s.r1.T('b')) && Math.abs(s.m.value - 500) < 10 },
      ],
      success: 'The ohmmeter reads [[500 Ω]]! Two equal `1 kΩ` resistors in parallel offer twice as many paths, cutting total resistance in half.',
      question: {
        type: 'number',
        q: 'Calculate the total parallel resistance `R_T` (in Ω) of `R₁ = 680 Ω`, `R₂ = 1,000 Ω`, and `R₃ = 2,200 Ω` connected in parallel.',
        answer: 342,
        unit: 'Ω',
        fixedUnit: true,
        tol: 0.02,
        chips: ['342', '680', '1293', '3880'],
        why: '`1 / R_T = 1/680 + 1/1000 + 1/2200 = 0.001471 + 0.001 + 0.0004545 = 0.002925 S` → `R_T = 1 / 0.002925 = [[342 Ω]]` (which is less than the smallest resistor, `680 Ω`!).',
      },
    },
    {
      id: 'parallel-lab-5', kind: 'visual', title: 'KCL & open parallel branches in action',
      text: 'Watch how total current `I_T` splits into the three parallel branches (`I_T = I₁ + I₂ + I₃`) in the simulator below. Uncheck one of the branch **on** toggles to see what happens when a parallel branch opens!',
      how: 'Uncheck any branch’s <b>on</b> box to open that branch and watch the other branches and total current <code>I_T</code>.',
      visual: 'parallelLab',
      tasks: [{ text: 'Toggle a parallel branch open to see that other branches stay unchanged while I_T drops' }],
      success: 'Opening one parallel branch drops `I_T`, while the other branches keep their exact same voltage (`12 V`) and current!',
      question: {
        type: 'number',
        q: 'A parallel circuit carries `I_T = 100 mA` in three branches. Two branches are `40 mA` and `20 mA`. What is the third branch current, in `mA`?',
        answer: 40,
        unit: 'mA',
        fixedUnit: true,
        tol: 0.01,
        chips: ['20', '40', '60', '160'],
        why: 'By [[KCL]], `I₃ = 100 − 40 − 20 = [[40 mA]]`. 60 mA would be the remainder only if those 40 mA were the only other branch.',
      },
    },
    {
      id: 'bench-kcl-switch-5', kind: '3d', title: 'Verify KCL & branch independence on the 3D bench',
      text: 'On the 3D bench, a `12 V` supply feeds two parallel branches: `R1 = 200 Ω` (`I₁ = 60 mA`) and `R2 = 300 Ω` (`I₂ = 40 mA`) controlled by a branch switch, while the main [[ammeter]] measures total current `I_T`. Close the branch switch to see `I_T` jump from `60 mA` to `60 + 40 = 100 mA`!',
      how: 'Click the <b>branch switch</b> on the 3D bench to add Branch 2 (`40 mA`) in parallel with Branch 1 (`60 mA`).',
      scene: {
        camera: { pos: [0, 7.6, 7.4], target: [0, 0.2, 0.1] },
        allowWiring: false,
        setup(g, s) {
          s.ps = g.supply({ pos: [-3.9, 0, -1.2], V: 12 });
          s.m = g.meter({ pos: [-1.4, 0, -2.0], mode: 'A', modes: ['A'] });
          s.r1 = g.slot({ pos: [2.2, 0, -1.6], content: { type: 'resistor', R: 200 }, locked: true, label: 'R1' });
          s.sw = g.switch({ pos: [0.2, 0, 1.2], closed: false });
          s.r2 = g.slot({ pos: [2.6, 0, 1.2], content: { type: 'resistor', R: 300 }, locked: true, label: 'R2' });
          s.t1 = g.stage.label(s.r1.group, [0, 1.75, 0], '', 'itag');
          s.t2 = g.stage.label(s.r2.group, [0, 1.75, 0], '', 'itag');
          g.wire(s.ps.T('+'), s.m.T('red'), { locked: true });
          g.wire(s.m.T('com'), s.r1.T('a'), { locked: true });
          g.wire(s.r1.T('b'), s.ps.T('-'), { locked: true });
          g.wire(s.r1.T('a'), s.sw.T('a'), { locked: true });
          g.wire(s.sw.T('b'), s.r2.T('a'), { locked: true });
          g.wire(s.r2.T('b'), s.r1.T('b'), { locked: true });
          g.stage.updaters.add(() => {
            s.t1.set(`I1 = ${fmtI(Math.abs(s.r1.I || 0))}`);
            s.t2.set(`I2 = ${fmtI(Math.abs(s.r2.I || 0))}`);
          });
        },
        highlight(g, s) { return !s.sw.closed ? [s.sw] : []; },
      },
      tasks: [
        { text: 'Close the branch switch so I_T = I1 (60 mA) + I2 (40 mA) = 100 mA', done: (g, s) => s.sw.closed && Math.abs(Math.abs(s.m.value) - 0.1) < 0.003 },
      ],
      success: 'Notice that `I1` stayed at `60 mA` when you closed the switch, while `I_T` rose to `60 mA + 40 mA = 100 mA`!',
      question: {
        type: 'number',
        q: 'A total current of `I_T = 10 mA` enters two parallel resistors: `R₁ = 1.0 kΩ` and `R₂ = 4.0 kΩ`. Using the two-branch [[current-divider formula]] `I₁ = I_T × R₂ / (R₁ + R₂)`, how much current (in `mA`) flows through the smaller resistor `R₁`?',
        answer: 8,
        unit: 'mA',
        fixedUnit: true,
        tol: 0.01,
        chips: ['2', '2.5', '5', '8'],
        why: '`I₁ = 10 mA × 4.0 kΩ / (1.0 kΩ + 4.0 kΩ) = 10 × (4 / 5) = [[8 mA]]`. The smaller `1 kΩ` resistor takes 4× as much current as the `4 kΩ` resistor (`2 mA`)!',
      },
    },
  ],
};
