// unit1c.js - Unit 1C: Electrical Charge, Voltage & Current (Read the study sheet -> Do the hands-on steps).
import { FIG } from './visuals.js';

const CAM = { pos: [0, 7.2, 6.8], target: [0, 0.2, 0.1] };
const across = (g, m, a, b) =>
  (g.joined(m.T('red'), a) && g.joined(m.T('com'), b)) ||
  (g.joined(m.T('red'), b) && g.joined(m.T('com'), a));

export const LESSON_1C = {
  id: 'unit1c',
  code: '1C',
  title: 'Charge, Voltage & Current',
  color: '#a78bfa',
  minutesRead: 6,
  doneLead: 'You explored Coulomb’s law, calculated charge from electron counts, solved V = W/Q and I = Q/t problems, sorted primary vs secondary batteries, and measured voltage and current on the 3D bench:',

  // =========================================================================
  // PART 1 - THE STUDY SHEET
  // =========================================================================
  sheet: [
    {
      title: 'Electrical Charge (Q) & Coulomb’s Law',
      fig: FIG.coulombLaw,
      body: `<p>[[Electrical charge]] (symbol <b>Q</b>) is an intrinsic property of protons (positive, <b>+</b>) and electrons (negative, <b>−</b>). The SI unit of charge is the [[coulomb]] (<b>C</b>):</p>
      <ul>
        <li><b>1 coulomb (1 C)</b> is the total charge of <code>6.25 × 10¹⁸ electrons</code>.</li>
        <li>A single electron carries a charge of <code>1.6 × 10⁻¹⁹ C</code> (the reciprocal of <code>6.25 × 10¹⁸</code>).</li>
        <li><b>Formula:</b> <code>Q = (number of electrons) ÷ (6.25 × 10¹⁸ electrons/C)</code></li>
        <li><b>Coulomb’s Law:</b> An electric field exists around every charge. <b>Like charges repel</b> (+/+ or −/−) and <b>unlike charges attract</b> (+/−) with a force inversely proportional to the square of distance (<code>F ∝ 1/d²</code>).</li>
      </ul>`,
      key: '[[1 C = 6.25 × 10¹⁸ electrons]]. Like charges [[repel]]; unlike charges [[attract]].',
      exam: 'Example from Slide 5: How many coulombs are in 93.8 × 10¹⁶ electrons? Q = (93.8 × 10¹⁶) / (6.25 × 10¹⁸) = 0.15 C.',
    },
    {
      title: 'Voltage (V = W / Q) — Energy per Charge',
      body: `<p>Moving charges against an electric field requires work (energy <b>W</b>, in [[joules]] <b>J</b>). [[Voltage]] (<b>V</b>, also called <i>potential difference</i> or <i>electromotive force</i>) is the driving pressure defined as energy per unit charge:</p>
      <ul>
        <li><b>Definition:</b> <code>V = W / Q</code> &nbsp;(Volts = Joules ÷ Coulombs)</li>
        <li><b>One volt (1 V)</b> is the potential difference between two points when <b>1 joule</b> of energy is used to move <b>1 coulomb</b> of charge.</li>
        <li><b>Rearranged forms:</b> <code>W = V × Q</code> and <code>Q = W / V</code></li>
        <li><b>Slide examples:</b> If <code>50 J</code> of energy is available for every <code>10 C</code> of charge, <code>V = 50 J / 10 C = 5 V</code>. A <code>12 V</code> battery uses <code>W = 12 V × 0.5 C = 6 J</code> to move <code>0.5 C</code>.</li>
      </ul>`,
      key: '[[V = W / Q]] — [[1 Volt]] = [[1 Joule]] of energy per [[1 Coulomb]] of charge.',
      exam: 'Always check what two values you are given: V = W/Q, W = V×Q, or Q = W/V.',
    },
    {
      title: 'DC Voltage Sources & Battery Types',
      body: `<p>An ideal [[voltage source]] provides a constant voltage for any load required by a circuit. Real-world DC voltage sources convert other forms of energy into electrical potential:</p>
      <ul>
        <li><b>Batteries (Voltaic Cells):</b> Convert <b>chemical energy</b> directly into electrical energy. A cell consists of two conducting electrodes — in our course slides, the positive [[cathode]] and negative [[anode]] — immersed in a conductive [[electrolyte]].</li>
        <li>[[Primary cell]] — <b>Non-rechargeable</b> (chemical reaction is one-way; e.g., alkaline AA, carbon-zinc, silver-oxide button cells).</li>
        <li>[[Secondary cell]] — <b>Rechargeable</b> (chemical reaction is reversed by charging; e.g., lead-acid car battery, lithium-ion, NiMH).</li>
        <li>[[Fuel cell]] — Combines externally supplied fuel (like hydrogen) and oxidizer (oxygen) to produce DC continuously without running down.</li>
        <li>[[Solar cell]] — Photovoltaic semiconductor junction that converts <b>light energy</b> directly into DC voltage.</li>
        <li><b>DC Generator:</b> Converts <b>mechanical energy</b> (rotation in a magnetic field) into electrical energy.</li>
        <li><b>Electronic Power Supply:</b> Converts <b>AC utility voltage</b> from a wall outlet into regulated DC voltage.</li>
      </ul>`,
      key: '[[Primary cells]] cannot be recharged; [[secondary cells]] are rechargeable; [[fuel cells]] use continuous external fuel.',
    },
    {
      title: 'Electrical Current (I = Q / t) — Rate of Charge Flow',
      body: `<p>Randomly moving free electrons in a copper wire produce zero net current. When a voltage source is connected, it pushes electrons in one net direction. [[Current]] (symbol <b>I</b>, unit [[ampere]] <b>A</b>) is the rate of flow of charge past a point:</p>
      <ul>
        <li><b>Definition:</b> <code>I = Q / t</code> &nbsp;(Amperes = Coulombs ÷ Seconds)</li>
        <li><b>One ampere (1 A)</b> flows when <b>1 coulomb</b> of charge passes a cross-section in <b>1 second</b>.</li>
        <li><b>Rearranged forms:</b> <code>Q = I × t</code> and <code>t = Q / I</code></li>
        <li><b>Slide example:</b> <code>2 C</code> flowing past a point in <code>5 s</code> is <code>I = 2 C / 5 s = 0.4 A</code>.</li>
      </ul>`,
      key: '[[I = Q / t]] — [[1 Ampere]] = [[1 Coulomb]] of charge flowing per [[1 Second]].',
      exam: 'If time is given in minutes, convert to seconds first (× 60) before using I = Q / t.',
    },
    {
      title: 'Electron Flow vs Conventional Current & Current Sources',
      fig: FIG.flowCompare,
      body: `<p>There are two ways to draw the direction of current in a circuit:</p>
      <ul>
        <li>[[Electron flow]] <b>(− → +):</b> Follows the physical negatively charged electrons, which are repelled out of the source's <b>negative (−)</b> terminal and attracted into the <b>positive (+)</b> terminal.</li>
        <li>[[Conventional current]] <b>(+ → −):</b> The historical engineering direction assuming positive charge flows out of the <b>positive (+)</b> terminal and returns to the <b>negative (−)</b> terminal.</li>
      </ul>
      <p><b>Current Sources:</b> While a voltage source keeps V constant, an ideal [[current source]] (schematic symbol: circle with an arrow inside) maintains a <b>constant output current</b> regardless of the load resistance connected to it.</p>`,
      key: '[[Electron flow]] goes [[− → +]]. [[Conventional current]] goes [[+ → −]]. An ideal [[current source]] delivers constant I.',
    },
  ],

  // =========================================================================
  // PART 2 - INTERACTIVE DO STEPS
  // =========================================================================
  steps: [
    {
      id: 'coulomb-lab-1c', kind: 'visual', title: 'Coulomb’s law: attract, repel & distance',
      text: 'Every charged particle creates an electric field. Flip the signs of the two charges and slide their distance to see [[Coulomb’s law]] (`F ∝ 1/d²`) in action!',
      how: 'Click <b>flip charge A</b> or <b>flip charge B</b> so you see both attraction and repulsion, and slide <b>Distance</b> to at least 2 units.',
      visual: 'coulomb',
      tasks: [{ text: 'Observe both attraction and repulsion and move the distance slider' }],
      success: 'Like charges repel, unlike charges attract, and doubling the distance cuts the force to one-fourth!',
      question: {
        type: 'number',
        q: 'One coulomb equals `6.25 × 10¹⁸` electrons. How many coulombs of charge do `93.8 × 10¹⁶` (`0.938 × 10¹⁸`) electrons represent? (Slide 5 example)',
        answer: 0.15,
        unit: 'C',
        fixedUnit: true,
        tol: 0.02,
        chips: ['0.015', '0.15', '1.5', '6.67'],
        why: '`Q = (93.8 × 10¹⁶) ÷ (6.25 × 10¹⁸) = 0.938 ÷ 6.25 = [[0.15 C]]`.',
      },
    },
    {
      id: 'bench-voltage-1c', kind: '3d', title: 'Voltage (V = W / Q) on the 3D bench',
      text: '[[Voltage]] (`V = W / Q`) is the electrical pressure supplied by a source: <b>1 V = 1 J/C</b>. On the 3D bench, wire the [[voltmeter]] across the DC power supply terminals and dial the supply to **12 V**!',
      how: 'Wire the meter\'s <b>red jack</b> to the supply\'s <b>red (+) post</b>, wire the <b>black COM jack</b> to the <b>black (−) post</b>, and drag the supply knob to <b>12 V</b>.',
      scene: {
        camera: CAM,
        setup(g, s) {
          s.ps = g.supply({ pos: [-1.8, 0, -0.2], V: 5, adjustable: true, min: 0, max: 20, step: 1, on: true });
          s.m = g.meter({ pos: [2.0, 0, 0.6], mode: 'V', modes: ['V'], rotY: -0.25 });
        },
        highlight(g, s) {
          if (!across(g, s.m, s.ps.T('+'), s.ps.T('-'))) {
            return g.pending ? [s.ps.T('+'), s.ps.T('-')] : [s.m.T('red'), s.m.T('com')];
          }
          return Math.abs(s.ps.V - 12) > 0.3 ? [s.ps] : [];
        },
      },
      tasks: [
        { text: 'Wire the voltmeter across the DC supply (+ and −)', done: (g, s) => across(g, s.m, s.ps.T('+'), s.ps.T('-')) },
        { text: 'Turn the supply voltage knob to 12 V (12 J per coulomb)', done: (g, s) => across(g, s.m, s.ps.T('+'), s.ps.T('-')) && Math.abs(s.m.value - 12) < 0.3 },
      ],
      success: 'At [[12.0 V]], the supply gives every coulomb of charge [[12 joules]] of energy (`W = V × Q`).',
      question: {
        type: 'number',
        q: 'If `50 J` of energy is used to move `10 C` of charge, what is the voltage in volts?',
        answer: 5,
        unit: 'V',
        fixedUnit: true,
        tol: 0.01,
        chips: ['0.2', '5', '60', '500'],
        why: 'Use `V = W / Q = 50 J ÷ 10 C = [[5 V]]`.',
      },
    },
    {
      id: 'cell-sort-1c', kind: 'visual', title: 'Primary vs secondary batteries',
      text: 'Batteries convert chemical energy into electrical energy. [[Primary cells]] have a one-way reaction and cannot be recharged; [[secondary cells]] can be recharged by reversing current through them.',
      how: 'Click each battery card above, then place it into the <b>Primary</b> or <b>Secondary</b> bucket.',
      visual: 'cellSort1c',
      tasks: [{ text: 'Sort all 6 batteries into Primary vs Secondary cells' }],
      success: 'Primary = use once; Secondary = rechargeable; and a [[fuel cell]] runs continuously as long as fuel is supplied!',
      question: {
        q: 'Which type of cell produces electricity continuously from an external supply of hydrogen and oxygen without needing to be recharged?',
        options: ['Fuel cell', 'Primary alkaline cell', 'Lead-acid secondary cell', 'Carbon-zinc cell'],
        correct: 0,
        why: 'A [[fuel cell]] converts a continuous external stream of fuel (hydrogen) and oxidizer (oxygen) directly into DC electricity.',
      },
    },
    {
      id: 'bench-current-1c', kind: '3d', title: 'Current (I = Q / t) & electron flow on the 3D bench',
      text: '[[Current]] (`I = Q / t`) is coulombs per second. Flip the 3D bench switch closed to watch [[electron flow]] (the glowing blue dots leaving the `−` terminal and heading toward `+`) and measure the current on the [[ammeter]]!',
      how: 'Click the <b>switch lever</b> on the 3D bench to close the circuit and watch the electrons and ammeter.',
      scene: {
        camera: CAM,
        allowWiring: false,
        setup(g, s) {
          s.ps = g.supply({ pos: [-3.2, 0, 0], V: 10, on: true, locked: true });
          s.sw = g.switch({ pos: [-0.8, 0, -1.2], closed: false });
          s.lamp = g.slot({ pos: [1.6, 0, 0], content: { type: 'lamp', R: 50 }, locked: true, label: '50 Ω lamp' });
          s.m = g.meter({ pos: [-0.8, 0, 1.3], mode: 'A', modes: ['A'], rotY: 0 });
          g.wire(s.ps.T('+'), s.sw.T('a'), { locked: true });
          g.wire(s.sw.T('b'), s.lamp.T('a'), { locked: true });
          g.wire(s.lamp.T('b'), s.m.T('red'), { locked: true });
          g.wire(s.m.T('com'), s.ps.T('-'), { locked: true });
        },
        highlight(g, s) { return !s.sw.closed ? [s.sw] : []; },
      },
      tasks: [
        { text: 'Close the switch to start electron flow and read the ammeter', done: (g, s) => s.sw.closed && s.m.value > 0.15 },
      ],
      success: 'The ammeter reads [[200 mA]] (`0.20 A`) — that means `0.20 coulombs` of charge pass through the meter every second!',
      question: {
        type: 'number',
        q: 'If `2 C` of charge passes a point in `5 s`, what is the current in amperes?',
        answer: 0.4,
        unit: 'A',
        fixedUnit: true,
        tol: 0.01,
        chips: ['0.4', '2.5', '7', '10'],
        why: '`I = Q / t = 2 C ÷ 5 s = [[0.4 A]]`.',
      },
    },
    {
      id: 'flow-toggle-1c', kind: 'visual', title: 'Electron flow (− → +) vs conventional current (+ → −)',
      text: 'Physical [[electron flow]] leaves the <b>negative (−)</b> terminal and travels to the <b>positive (+)</b> terminal. [[Conventional current]] is drawn from <b>positive (+) to negative (−)</b>.',
      how: 'Click both <b>Electron flow</b> and <b>Conventional current</b> to compare the two directions.',
      visual: 'flowToggle',
      tasks: [{ text: 'Compare Electron flow and Conventional current' }],
      success: 'Same magnitude of current in amperes — just opposite arrow directions!',
      question: {
        q: 'How much energy (in joules) is used to move [[50 C]] of charge through a potential difference of [[12 V]]? (`W = V × Q`)',
        options: ['600 J', '4.17 J', '62 J', '0.24 J'],
        correct: 0,
        why: 'Rearranging `V = W / Q` gives `W = V × Q = 12 V × 50 C = [[600 J]]`.',
      },
    },
  ],
};
