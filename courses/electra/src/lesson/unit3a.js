// unit3a.js - Unit 3A: Series Circuits & KVL (Read the study sheet -> Do the hands-on steps).
import { FIG } from './visuals.js';
import { fmtI } from '../game/engine/Game.js';
const across = (g, m, a, b) =>
  (g.joined(m.T('red'), a) && g.joined(m.T('com'), b)) ||
  (g.joined(m.T('red'), b) && g.joined(m.T('com'), a));
const lit = s => Math.abs(s.I || 0) > 0.05;

export const LESSON_3A = {
  id: 'unit3a',
  code: '3A',
  title: 'Series Circuits & KVL',
  color: '#f472b6',
  minutesRead: 8,
  doneLead: 'You wired a 3-resistor series chain on the 3D bench, verified Kirchhoff’s Voltage Law with a voltmeter, designed a voltage divider, and diagnosed an open series lamp string:',

  // =========================================================================
  // PART 1 - THE STUDY SHEET
  // =========================================================================
  sheet: [
    {
      title: 'What Makes a Circuit "Series"? (One Path = One Current)',
      fig: FIG.seriesChain,
      body: `<p>A [[series circuit]] provides <b>only one path</b> for current between two points so that the current is the same through each series resistor. Even if resistors are drawn at angles or around corners, if two parts share a junction with <b>no third branch</b> connected there, they are in series!</p>
      <ul>
        <li><b>Current Rule:</b> The current is identical at every point in a series loop: <code>I_T = I₁ = I₂ = I₃ = …</code></li>
        <li><b>Total Resistance Rule:</b> Series resistances simply add together: <code>R_T = R₁ + R₂ + R₃ + … + R_n</code></li>
        <li><b>Equal-Value Shortcut:</b> For <code>n</code> equal resistors of value <code>R</code> in series, <code>R_T = n × R</code>.</li>
        <li>Notice that total series resistance <code>R_T</code> is always <b>larger than the largest individual resistor</b>!</li>
      </ul>`,
      key: '[[One path]] means [[one current]] (`I_T = I₁ = I₂ = I₃`) and resistances add (`R_T = R₁ + R₂ + R₃`).',
      exam: 'Adding another resistor in series ALWAYS increases R_T and decreases circuit current I_T.',
    },
    {
      title: "Ohm's Law in Series Circuits",
      body: `<p>You can apply [[Ohm's law]] either to the <b>entire series circuit</b> or to <b>any individual resistor</b> inside it:</p>
      <ul>
        <li><b>Total circuit current:</b> <code>I_T = V_S / R_T</code></li>
        <li><b>Voltage drop across resistor R_x:</b> <code>V_x = I_T × R_x</code></li>
        <li><b>Resistance of a single resistor:</b> <code>R_x = V_x / I_T</code> or <code>R_x = R_T − (sum of other resistors)</code></li>
        <li><b>Slide example:</b> <code>680 Ω + 1,500 Ω + 2,200 Ω = 4,380 Ω = 4.38 kΩ</code>.</li>
      </ul>`,
      key: 'Find [[R_T]] first, then [[I_T = V_S / R_T]], then multiply [[I_T × R_x]] for each resistor\'s voltage drop.',
    },
    {
      title: 'Voltage Sources in Series (Aiding vs Opposing)',
      fig: FIG.seriesSources,
      body: `<p>When multiple DC voltage sources (such as batteries in a flashlight) are connected in series, the total voltage depends on their polarities:</p>
      <ul>
        <li><b>Series-Aiding (same direction, + to −):</b> Their voltages <b>add</b> together. Three <code>1.5 V</code> cells in series-aiding give <code>V_T = 1.5 + 1.5 + 1.5 = 4.5 V</code>; three <code>9 V</code> batteries give <code>27 V</code>.</li>
        <li><b>Series-Opposing (reversed battery):</b> A source wired backwards (+ to + or − to −) <b>subtracts</b> from the others. Four <code>1.5 V</code> cells with one reversed give <code>V_T = 1.5 + 1.5 + 1.5 − 1.5 = 3 V</code>. Three <code>9 V</code> batteries with one reversed give <code>9 + 9 − 9 = 9 V</code>.</li>
      </ul>`,
      key: 'Sources pointing the same way [[add]] (series-aiding); a reversed source [[subtracts]] (series-opposing).',
      exam: 'Always check the long (+) and short (−) battery plates in series-source problems before adding!',
    },
    {
      title: "Kirchhoff's Voltage Law (KVL)",
      body: `<p>[[Kirchhoff's Voltage Law]] ([[KVL]]) is a fundamental conservation-of-energy law for circuits. Stated two ways:</p>
      <ul>
        <li><b>Form 1:</b> The sum of all the voltage drops around a single closed path equals the total source voltage: <code>V_S = V₁ + V₂ + V₃ + … + V_n</code></li>
        <li><b>Form 2:</b> The algebraic sum of all voltages (both sources and drops) around any closed loop equals zero: <code>V_S − V₁ − V₂ − V₃ = 0</code></li>
        <li><b>Finding an unknown drop:</b> If a <code>12 V</code> source feeds three series resistors and you measure <code>V₁ = 3.5 V</code> and <code>V₂ = 2.5 V</code>, KVL tells you immediately that <code>V₃ = 12 − 3.5 − 2.5 = 6.0 V</code>!</li>
      </ul>`,
      key: '[[KVL]]: Around any closed loop, the voltage drops add up to the source voltage (`V_S = V₁ + V₂ + V₃`).',
    },
    {
      title: 'Voltage Dividers & Potentiometers',
      body: `<p>A series string of resistors acts as a [[voltage divider]]. Because the same current <code>I = V_S / R_T</code> flows through every resistor, each resistor's voltage drop is directly proportional to its resistance:</p>
      <ul>
        <li><b>Voltage-Divider Formula:</b> <code>V_x = V_S × (R_x / R_T)</code></li>
        <li><b>Proportionality:</b> The <b>largest resistor</b> always gets the <b>largest voltage drop</b>. A resistor that is twice as large as another drops twice as much voltage.</li>
        <li><b>Potentiometer as an Adjustable Voltage Divider:</b> Connecting ends 1 and 2 across <code>V_S</code> makes the wiper (terminal 3) output any voltage from <code>0 V</code> to <code>V_S</code> according to the resistance ratio on either side of the wiper.</li>
      </ul>`,
      key: '[[Voltage-divider formula]]: `V_x = V_S × (R_x / R_T)`. Biggest resistor → biggest share of the voltage!',
      exam: 'You don\'t need to calculate current first to find a series voltage drop — just multiply V_S by (R_x / R_T).',
    },
    {
      title: 'Ground Reference ($V_A$ vs $V_{AB}$) & Series Troubleshooting',
      body: `<p><b>Voltage With Respect to Ground:</b> Reference [[ground]] is defined as <code>0 V</code>.</p>
      <ul>
        <li><b>Single subscript ($V_A$):</b> Voltage at node <b>A</b> measured with respect to ground (<code>0 V</code>).</li>
        <li><b>Double subscript ($V_{AB}$):</b> Voltage at point <b>A</b> with respect to point <b>B</b>: <code>V_AB = V_A − V_B</code>.</li>
      </ul>
      <p><b>Troubleshooting Series Faults:</b></p>
      <ul>
        <li>[[Open circuit]] <b>in series:</b> Current drops to <b>zero everywhere</b> (<code>I = 0 A</code>). Every good resistor drops <code>0 V</code> (<code>V = I × R = 0</code>), and the <b>entire source voltage $V_S$ appears across the open component</b>!</li>
        <li>[[Short circuit]] <b>in series:</b> The shorted resistor has <code>0 Ω</code> and drops <code>0 V</code>. Total resistance <code>R_T</code> decreases, so total current <code>I_T</code> <b>increases</b> and the voltage drops across the remaining good resistors <b>increase</b>!</li>
      </ul>`,
      key: 'Across a series [[open]]: `V = V_S` and `I = 0` everywhere. Across a series [[short]]: `V = 0 V` and `I` increases!',
      exam: 'Exam classic: In a dead series circuit, how do you find the open resistor with a voltmeter? Look for the one measuring the FULL source voltage V_S!',
    },
  ],

  // =========================================================================
  // PART 2 - INTERACTIVE DO STEPS
  // =========================================================================
  steps: [
    {
      id: 'bench-series-chain', kind: '3d', title: 'Wire 3 resistors in series on the 3D bench',
      text: 'Wire the power supply (`12 V`) and all three resistors (`R1 = 1 kΩ`, `R2 = 2.2 kΩ`, `R3 = 3.3 kΩ`) end-to-end into **one single loop**. Watch the floating current tags above each resistor once the loop is complete!',
      how: 'Wire <b>+ → R1 → R2 → R3 → −</b> so current has one continuous path through all three resistors.',
      scene: {
        camera: { pos: [0, 7.6, 7.8], target: [0, 0.2, 0.1] },
        setup(g, s) {
          s.ps = g.supply({ pos: [-3.9, 0, -2.3], V: 12 });
          s.rs = [
            [1000, [-1.2, 0, -2.0]],
            [2200, [2.8, 0, -0.6]],
            [3300, [0.8, 0, 2.0]],
          ].map(([R, pos], i) => g.slot({ pos, content: { type: 'resistor', R }, locked: true, label: `R${i + 1}` }));
          s.tags = s.rs.map(r => g.stage.label(r.group, [0, 1.75, 0], '', 'itag'));
          g.stage.updaters.add(() => s.tags.forEach((t, i) => {
            const I = Math.abs(s.rs[i].I || 0);
            t.set(I > 1e-5 ? `I = ${fmtI(I)}` : '');
            t.el.style.visibility = I > 1e-5 ? 'visible' : 'hidden';
          }));
        },
        highlight(g, s) {
          const I = s.rs.map(r => Math.abs(r.I || 0));
          if (I.every(x => Math.abs(x - 12 / 6500) < 0.0002)) return [];
          return [s.ps.T('+'), ...s.rs.flatMap(r => [r.T('a'), r.T('b')]), s.ps.T('-')];
        },
      },
      tasks: [
        {
          text: 'Wire the 12 V supply, R1 (1 kΩ), R2 (2.2 kΩ), and R3 (3.3 kΩ) into one series loop',
          done: (g, s) => s.rs.every(r => Math.abs(Math.abs(r.I || 0) - 12 / 6500) < 0.0002),
        },
      ],
      success: 'Every tag reads `I = 1.85 mA`! Because `R_T = 1 + 2.2 + 3.3 = 6.5 kΩ`, the same current `12 V / 6.5 kΩ = 1.85 mA` flows through all three!',
      question: {
        type: 'number',
        q: 'Three resistors, `680 Ω`, `1,500 Ω`, and `2,200 Ω`, are connected in series. What is their total resistance `R_T` in `kΩ`?',
        answer: 4.38,
        unit: 'kΩ',
        fixedUnit: true,
        tol: 0.01,
        chips: ['4.38', '6.80', '15.0', '4380'],
        why: 'Series resistances add: `680 + 1,500 + 2,200 = 4,380 Ω = [[4.38 kΩ]]`.',
      },
    },
    {
      id: 'battery-series-3a', kind: 'visual', title: 'Voltage sources in series: aiding vs opposing',
      text: 'Batteries connected in the same direction (<b>series-aiding</b>) add their voltages together. A battery connected backwards (<b>series-opposing</b>) subtracts from the total!',
      how: 'Click the reversed middle battery below to flip its polarity so all three batteries aid each other for <b>18 V</b>.',
      visual: 'batterySeriesLab',
      tasks: [{ text: 'Flip the reversed battery so all three sources are series-aiding (+18 V)' }],
      success: 'All three sources now point the same way: `9 V + 6 V + 3 V = 18 V`!',
      question: {
        type: 'number',
        q: 'Four `1.5 V` batteries go in a flashlight, and one is put in backwards. What is the voltage across the bulb?',
        answer: 3,
        unit: 'V',
        fixedUnit: true,
        tol: 0.01,
        chips: ['0', '3', '4.5', '6'],
        why: 'Three cells aid and the reversed cell subtracts: `1.5 + 1.5 + 1.5 − 1.5 = [[3 V]]`.',
      },
    },
    {
      id: 'bench-kvl-hunt', kind: '3d', title: 'Kirchhoff’s Voltage Law (KVL) on the 3D bench',
      text: 'The `12 V` supply is shared across `R1 (1 kΩ)`, `R2 (2.2 kΩ)`, and `R3 (4.7 kΩ)`. Probe across `R1` and `R2` with the [[voltmeter]] on the 3D bench to see how their [[voltage drops]] compare!',
      how: 'Wire the voltmeter\'s <b>red</b> and <b>black</b> jacks across <b>R1</b>, then click the probe wires to remove them and wire across <b>R2</b>.',
      scene: {
        camera: { pos: [0, 7.6, 7.8], target: [0, 0.2, 0.1] },
        setup(g, s) {
          s.got = [false, false];
          s.ps = g.supply({ pos: [-3.9, 0, -2.3], V: 12 });
          s.Rv = [1000, 2200, 4700];
          s.rs = [[-0.8, 0, -2.2], [3.2, 0, -0.4], [0.6, 0, 1.9]].map((pos, i) =>
            g.slot({ pos, content: { type: 'resistor', R: s.Rv[i] }, locked: true, label: `R${i + 1}` })
          );
          s.m = g.meter({ pos: [4.0, 0, 2.2], mode: 'V', modes: ['V'], rotY: -0.4 });
          g.wire(s.ps.T('+'), s.rs[0].T('a'), { locked: true });
          g.wire(s.rs[0].T('b'), s.rs[1].T('a'), { locked: true });
          g.wire(s.rs[1].T('b'), s.rs[2].T('b'), { locked: true });
          g.wire(s.rs[2].T('a'), s.ps.T('-'), { locked: true });
          g.stage.updaters.add(() => {
            if (!s.got[0] && across(g, s.m, s.rs[0].T('a'), s.rs[0].T('b')) && Math.abs(s.m.value) > 0.5) s.got[0] = true;
            if (!s.got[1] && across(g, s.m, s.rs[1].T('a'), s.rs[1].T('b')) && Math.abs(s.m.value) > 0.5) s.got[1] = true;
          });
        },
        highlight(g, s) {
          if (!s.got[0]) return [s.m.T('red'), s.m.T('com'), s.rs[0].T('a'), s.rs[0].T('b')];
          if (!s.got[1]) return [s.rs[1].T('a'), s.rs[1].T('b')];
          return [];
        },
      },
      tasks: [
        { text: 'Measure V_R1 across R1 (1 kΩ) → 1.52 V', done: (g, s) => s.got[0] },
        { text: 'Move the probes to measure V_R2 across R2 (2.2 kΩ) → 3.34 V', done: (g, s) => s.got[1] },
      ],
      success: '`V_R1 = 1.52 V`, `V_R2 = 3.34 V`, and `V_R3 = 7.14 V` — they add up to `1.52 + 3.34 + 7.14 = 12.0 V` ([[KVL]])!',
      question: {
        type: 'number',
        q: 'A `20 V` source is connected across three series resistors. If `V₁ = 5 V` and `V₂ = 8 V`, what is the voltage drop `V₃` across the third resistor?',
        answer: 7,
        unit: 'V',
        fixedUnit: true,
        tol: 0.01,
        chips: ['3', '7', '13', '20'],
        why: 'By [[KVL]], `V_S = V₁ + V₂ + V₃`, so `V₃ = 20 − 5 − 8 = [[7 V]]`.',
      },
    },
    {
      id: 'bench-divider-3a', kind: '3d', title: 'Design a voltage divider on the 3D bench',
      text: 'By the [[voltage divider]] rule, `V_OUT = V_S × R2 / (R1 + R2)`. Pick resistors `R1` and `R2` from the 3D bin so the voltmeter across `R2` reads **4 V** (meaning `R2` is ⅓ of total resistance, so `R1 = 2 × R2`)!',
      how: 'Click the <b>2 kΩ</b> resistor in the bin and place it in <b>R1</b>, then click the <b>1 kΩ</b> resistor in the bin and place it in <b>R2 (V_OUT)</b>.',
      scene: {
        camera: { pos: [0.5, 8.4, 8.6], target: [0.5, 0.3, 0.4] },
        allowWiring: false,
        setup(g, s) {
          s.ps = g.supply({ pos: [-3.9, 0, -2.3], V: 12 });
          s.r1 = g.slot({ pos: [-0.6, 0, -2.0], content: null, accepts: ['resistor'], label: 'R1' });
          s.r2 = g.slot({ pos: [3.4, 0, -0.2], content: null, accepts: ['resistor'], label: 'R2 (V_OUT)' });
          s.m = g.meter({ pos: [4.6, 0, -2.4], mode: 'V', modes: ['V'], rotY: -0.4 });
          s.bin = g.bin({ pos: [0.6, 0, 3.0], items: [1000, 2000, 3300, 4700, 10000].map(R => ({ type: 'resistor', R })), showValues: true });
          g.wire(s.ps.T('+'), s.r1.T('a'), { locked: true });
          g.wire(s.r1.T('b'), s.r2.T('a'), { locked: true });
          g.wire(s.r2.T('b'), s.ps.T('-'), { locked: true });
          g.wire(s.m.T('red'), s.r2.T('a'), { locked: true });
          g.wire(s.m.T('com'), s.r2.T('b'), { locked: true });
        },
        highlight(g, s) {
          if (s.r1.content && s.r2.content && Math.abs(s.m.value - 4) < 0.15) return [];
          return g.held ? [s.r1, s.r2] : [s.bin];
        },
      },
      tasks: [
        {
          text: 'Install R1 = 2 kΩ and R2 = 1 kΩ from the bin so V_OUT = 4.00 V',
          done: (g, s) => s.r1.content && s.r2.content && Math.abs(s.m.value - 4) < 0.15,
        },
      ],
      success: '`V_OUT = 12 V × 1 kΩ / (2 kΩ + 1 kΩ) = 4.00 V`! The ratio of resistances sets the voltage split.',
      question: {
        type: 'number',
        q: 'Two resistors (`R₁ = 680 Ω` and `R₂ = 320 Ω`) are in series across a `10 V` source. What is the voltage drop `V₂` across `R₂`? (Voltage-divider formula)',
        answer: 3.2,
        unit: 'V',
        fixedUnit: true,
        tol: 0.02,
        chips: ['3.2', '5.0', '6.8', '10.0'],
        why: '`R_T = 680 + 320 = 1,000 Ω`. By the voltage-divider formula, `V₂ = 10 V × (320 / 1,000) = [[3.2 V]]`.',
      },
    },
    {
      id: 'series-fault-sim', kind: 'visual', title: 'Compare Healthy, Open & Shorted series circuits',
      text: 'Use the interactive series bar below to compare a <b>Healthy</b> series circuit against an [[open circuit]] (`R2` broken) and a [[short circuit]] (`R3` shorted).',
      how: 'Click <b>✂ Open R2</b> and <b>⚡ Short R3</b> at the bottom of the simulator to see how the voltage drops react.',
      visual: 'seriesLab',
      tasks: [{ text: 'Inspect Healthy, Open R2, and Short R3 states' }],
      success: 'In a series open, `I = 0` and all `12 V` sits across the break; in a series short, the shorted part drops `0 V` and current rises!',
      question: {
        q: 'Four resistors are in series across a `24 V` source. Suddenly current drops to `0 A`, and a voltmeter reads `0 V` across R₁, `24 V` across R₂, `0 V` across R₃, and `0 V` across R₄. What is the fault?',
        options: [
          'R₂ is open',
          'R₂ is shorted',
          'R₁, R₃, and R₄ are all shorted',
          'The power supply is turned off',
        ],
        correct: 0,
        why: 'When a resistor in a series loop [[opens]], current stops (`I = 0 A`), good resistors drop `0 V`, and the **entire source voltage (`24 V`) appears across the open resistor (`R₂`)**.',
      },
    },
    {
      id: 'bench-dead-string', kind: '3d', title: 'Troubleshoot the dead series lamp string on the 3D bench',
      text: 'Four lamps (`L1`–`L4`) are wired in series across `12 V`, and all four are dark because **L2** has burned [[open]]! Verify with the [[voltmeter]] that the full **12 V** sits across **L2**, then replace **L2** with the spare bulb from the bin.',
      how: 'Wire the voltmeter across <b>L2</b> (top-right lamp) to see the <b>12 V</b> reading, then click the <b>SPARE</b> lamp in the bin and click <b>L2</b> to fix the string.',
      scene: {
        camera: { pos: [0.4, 8.2, 8.4], target: [0.4, 0.2, 0.3] },
        setup(g, s) {
          s.dead = 1; // L2 is open
          s.found = false;
          s.ps = g.supply({ pos: [-3.9, 0, -2.3], V: 12 });
          const pos = [[-1.4, 0, -2.2], [2.4, 0, -2.2], [2.4, 0, 0.8], [-1.4, 0, 0.8]];
          s.ls = pos.map((p, i) => g.slot({ pos: p, content: { type: 'lamp', R: 30, Prated: 0.3, dead: i === s.dead }, accepts: ['lamp'], label: `L${i + 1}` }));
          s.m = g.meter({ pos: [0.6, 0, 3.2], mode: 'V', modes: ['V'] });
          s.bin = g.bin({ pos: [3.6, 0, 3.0], items: [{ type: 'lamp', R: 30, Prated: 0.3 }], title: 'SPARE' });
          g.wire(s.ps.T('+'), s.ls[0].T('a'), { locked: true });
          g.wire(s.ls[0].T('b'), s.ls[1].T('a'), { locked: true });
          g.wire(s.ls[1].T('b'), s.ls[2].T('b'), { locked: true });
          g.wire(s.ls[2].T('a'), s.ls[3].T('b'), { locked: true });
          g.wire(s.ls[3].T('a'), s.ps.T('-'), { locked: true });
          g.stage.updaters.add(() => {
            if (!s.found && s.m.value > 11 && across(g, s.m, s.ls[s.dead].T('a'), s.ls[s.dead].T('b'))) s.found = true;
          });
        },
        highlight(g, s) {
          if (!s.found) return [s.m.T('red'), s.m.T('com'), s.ls[1].T('a'), s.ls[1].T('b')];
          if (s.ls.every(l => lit(l))) return [];
          return g.held ? [s.ls[1]] : [s.bin];
        },
      },
      tasks: [
        { text: 'Probe across L2 with the voltmeter to see the full 12 V across the open bulb', done: (g, s) => s.found },
        { text: 'Pick the spare lamp from the bin and swap it into L2 so all 4 lamps glow', done: (g, s) => s.ls.every(l => lit(l)) },
      ],
      success: 'All four lamps glow at `3 V` each (`3 + 3 + 3 + 3 = 12 V`)! Measuring voltage across suspects is the fastest way to find a series open.',
      question: {
        q: 'In a circuit with reference ground (`0 V`), if point A measures `V_A = +15 V` and point B measures `V_B = +6 V`, what is the voltage `V_AB` (point A with respect to point B)?',
        options: ['+9 V', '+21 V', '−9 V', '+2.5 V'],
        correct: 0,
        why: 'Double-subscript voltage is the difference between the two node voltages: `V_AB = V_A − V_B = 15 V − 6 V = [[+9 V]]`.',
      },
    },
  ],
};
