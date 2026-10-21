// unit1b.js - Unit 1B: Resistance & Resistors (Read the study sheet -> Do the hands-on steps).
import { FIG } from './visuals.js';

const CAM = { pos: [0, 7.2, 6.8], target: [0, 0.2, 0.1] };
const across = (g, m, a, b) =>
  (g.joined(m.T('red'), a) && g.joined(m.T('com'), b)) ||
  (g.joined(m.T('red'), b) && g.joined(m.T('com'), a));

export const LESSON_1B = {
  id: 'unit1b',
  code: '1B',
  title: 'Resistance & Resistors',
  color: '#f59e0b',
  minutesRead: 6,
  doneLead: 'You decoded 4-band colour codes, calculated tolerance limits and conductance, sorted variable resistors, measured resistors on the 3D bench, and sized copper wire in circular mils. Here is your complete Unit 1B study sheet:',

  // =========================================================================
  // PART 1 - THE STUDY SHEET
  // =========================================================================
  sheet: [
    {
      title: 'Resistance (R) and Conductance (G)',
      body: `<p>[[Resistance]] (symbol <b>R</b>, unit [[ohm]] <b>Ω</b>) is the opposition to current flow in a circuit. A component designed specifically to have a certain amount of resistance is called a [[resistor]]. Resistors are used to limit current, divide voltage, and generate heat.</p>
      <p>The exact opposite of resistance is [[conductance]] (symbol <b>G</b>, unit [[siemens]] <b>S</b>), which measures how easily a material lets current flow:</p>
      <ul>
        <li><b>Formula:</b> <code>G = 1 / R</code> and <code>R = 1 / G</code></li>
        <li><b>Example:</b> A <code>22 kΩ</code> resistor has conductance <code>G = 1 / 22,000 Ω = 45.5 µS</code>.</li>
      </ul>`,
      key: '[[Resistance]] opposes current ([[Ω]]). [[Conductance]] is the reciprocal: [[G = 1 / R]] in [[siemens (S)]].',
      exam: 'If a test question gives resistance in kΩ, 1 ÷ kΩ gives conductance directly in mS (e.g., 1 ÷ 1 kΩ = 1 mS).',
    },
    {
      title: 'Fixed Resistors & the 4-Band Colour Code',
      fig: FIG.colorChart1b,
      body: `<p>[[Fixed resistors]] (carbon-composition, metal-film, wirewound) have a resistance value set during manufacturing. Most axial-lead resistors use a [[4-band]] colour code read from the end closest to a band:</p>
      <ul>
        <li><b>Band 1:</b> First significant digit</li>
        <li><b>Band 2:</b> Second significant digit</li>
        <li><b>Band 3 (Multiplier):</b> Power of 10 (number of zeros to add; [[Gold]] = <code>×0.1</code>, [[Silver]] = <code>×0.01</code>)</li>
        <li><b>Band 4 (Tolerance):</b> [[Gold]] = <code>±5%</code>, [[Silver]] = <code>±10%</code>, <b>No 4th band</b> = <code>±20%</code></li>
      </ul>
      <p><b>Course mnemonic (0 → 9):</b> <i>"[[Big Boys Race Our Young Girls But Violet Generally Wins]]"</i> — <b>B</b>lack (0), <b>B</b>rown (1), <b>R</b>ed (2), <b>O</b>range (3), <b>Y</b>ellow (4), <b>G</b>reen (5), <b>B</b>lue (6), <b>V</b>iolet (7), <b>G</b>ray (8), <b>W</b>hite (9).</p>`,
      key: 'Digits 0–9: [[0 Black]], [[1 Brown]], [[2 Red]], [[3 Orange]], [[4 Yellow]], [[5 Green]], [[6 Blue]], [[7 Violet]], [[8 Gray]], [[9 White]].',
      exam: 'Watch for Gold (×0.1) and Silver (×0.01) in the 3rd band: Red–Violet–Gold–Gold = 27 × 0.1 = 2.7 Ω ±5%.',
    },
    {
      title: 'Tolerance Range & Alphanumeric Labels',
      body: `<p>[[Tolerance]] is the maximum percentage a real resistor may vary from its marked (nominal) value and still be in spec:</p>
      <ul>
        <li><b>Minimum resistance:</b> <code>R_min = R_nominal × (1 − tol)</code></li>
        <li><b>Maximum resistance:</b> <code>R_max = R_nominal × (1 + tol)</code></li>
        <li><b>Example:</b> A <code>1,000 Ω ±10%</code> resistor can measure anywhere from <code>900 Ω</code> to <code>1,100 Ω</code> (a ±100 Ω window).</li>
      </ul>
      <p><b>Surface-mount (SMD) & stamped labels:</b> Three digits act like the first 3 colour bands (<code>472 = 47 × 10² = 4.7 kΩ</code>). When a letter (<b>R</b>, <b>K</b>, or <b>M</b>) replaces the decimal point, it marks both the decimal position and the prefix: <code>4R7 = 4.7 Ω</code>, <code>3K3 = 3.3 kΩ</code>, <code>1M5 = 1.5 MΩ</code>.</p>`,
      key: '[[R_min = R × (1 − tol)]] and [[R_max = R × (1 + tol)]]. In stamped codes, [[R, K, M]] stand in for the decimal point.',
    },
    {
      title: 'Variable Resistors & Resistive Sensors',
      fig: FIG.varResistors,
      body: `<p>[[Variable resistors]] let resistance change either by turning a shaft/slider or automatically in response to the environment:</p>
      <ul>
        <li>[[Potentiometer]] — <b>3 terminals</b> (two ends + a sliding wiper); wired across a source to **divide voltage** (e.g., volume control).</li>
        <li>[[Rheostat]] — <b>2 terminals</b>; wired in series with a load to **control current**. (A 3-terminal pot becomes a rheostat if you tie the wiper to one end terminal.)</li>
        <li>[[Thermistor]] — thermally sensitive resistor. Most have a <b>Negative Temperature Coefficient (NTC)</b>: when temperature increases, resistance **decreases**.</li>
        <li>[[Photoconductive cell]] — light-sensitive resistor: when light intensity increases, resistance **decreases**.</li>
        <li>[[Strain gauge]] — metal foil grid whose resistance changes when mechanical force stretches or compresses it.</li>
      </ul>`,
      key: '[[Potentiometer]] = 3 terminals (voltage divider). [[Rheostat]] = 2 terminals (current control). [[Thermistor]] (NTC): Temp ↑ → R ↓.',
      exam: 'Know the difference between a potentiometer (3 terminals, voltage) and a rheostat (2 terminals, current), plus how NTC thermistors and photocells react.',
    },
    {
      title: 'Wire Resistance, Circular Mils & AWG',
      fig: FIG.wireFormula,
      body: `<p>Even connecting wires have a small resistance that depends on four factors: <b>material type (resistivity ρ)</b>, <b>length (l)</b>, <b>cross-sectional area (A)</b>, and <b>temperature</b>:</p>
      <ul>
        <li><b>Formula:</b> <code>R = ρ × l / A</code> &nbsp;(longer wire → higher R; thicker wire → lower R)</li>
        <li><b>Mil:</b> <code>1 mil = 0.001 inch</code> (one-thousandth of an inch).</li>
        <li>[[Circular mil]] <b>(CM):</b> Area of a circle with a 1-mil diameter. To find area in CM, square the diameter in mils: <code>A (CM) = d_mils²</code> (for example, <code>0.004 in = 4 mils → A = 4² = 16 CM</code>).</li>
        <li><b>Copper resistivity:</b> <code>ρ = 10.37 CM·Ω/ft</code> at 20 °C (Silver is lowest at 9.9; Gold 14.7; Aluminum 17.0).</li>
        <li><b>Slide example:</b> 20 ft of copper wire with diameter 1.5 mils. <code>A = 1.5² = 2.25 CM</code>, so <code>R = (10.37 × 20) / 2.25 = 92.18 Ω</code>, which rounds to <code>92 Ω</code>.</li>
        <li>[[AWG]] <b>(American Wire Gauge):</b> Standard wire size numbers. A <b>smaller AWG number</b> means a <b>thicker wire</b> with larger area CM and <b>lower resistance</b>!</li>
      </ul>`,
      key: '[[R = ρ × l / A]] where [[A = d²]] in [[circular mils (CM)]]. Smaller [[AWG]] number = thicker wire = lower resistance.',
      exam: 'Convert inches to mils first (multiply inches × 1,000), square it to get CM, then plug into R = ρ × l / A.',
    },
  ],

  // =========================================================================
  // PART 2 - INTERACTIVE DO STEPS
  // =========================================================================
  steps: [
    {
      id: 'resistor-builder-1b', kind: 'visual', title: 'Build a resistor by its colour bands',
      text: 'Read a [[4-band]] resistor from left to right: <b>1st digit</b>, <b>2nd digit</b>, <b>multiplier</b> (power of 10), and <b>tolerance</b> ([[Gold]] = ±5%, [[Silver]] = ±10%).',
      how: 'Click the band tabs and paint the resistor to match the target resistance and tolerance.',
      visual: 'resistorBuilder',
      tasks: [{ text: 'Match the target resistance and tolerance using the 4 colour bands' }],
      success: 'Yellow (4), Violet (7), Red (×10²), Gold (±5%) = [[4.7 kΩ ±5%]]!',
      question: {
        q: 'Which colour code represents an [[82 Ω]] resistor?',
        options: [
          'Gray – Red – Black',
          'Gray – Red – Brown',
          'Blue – Red – Black',
          'White – Red – Gold',
        ],
        correct: 0,
        why: 'Gray = [[8]], Red = [[2]], and Black = [[× 10⁰ (× 1)]], giving 82 × 1 = [[82 Ω]]. (Brown in the 3rd band would be 820 Ω.)',
      },
    },
    {
      id: 'bench-ohmmeter-1b', kind: '3d', title: 'Measure a colour-coded resistor on the 3D bench',
      text: 'On the 3D bench sits a resistor painted <b>Red – Violet – Orange – Gold</b>. Decode the bands in your head (2, 7, ×10³), then clip the [[ohmmeter]] across its leads to verify!',
      how: 'Click the meter\'s <b>red jack</b> and wire it to one glowing resistor post, then wire the <b>black COM jack</b> to the other post.',
      scene: {
        camera: CAM,
        setup(g, s) {
          s.res = g.slot({ pos: [-0.8, 0, -0.3], content: { type: 'resistor', R: 27000, tol: 5 }, locked: true, label: 'Red–Violet–Orange–Gold' });
          s.m = g.meter({ pos: [2.3, 0, 0.9], mode: 'Ω', modes: ['Ω'], rotY: -0.25 });
        },
        highlight(g, s) {
          const red = g.joined(s.m.T('red'), s.res.T('a')) || g.joined(s.m.T('red'), s.res.T('b'));
          const com = g.joined(s.m.T('com'), s.res.T('a')) || g.joined(s.m.T('com'), s.res.T('b'));
          if (g.pending) return [s.res.T('a'), s.res.T('b')];
          return [!red && s.m.T('red'), !com && s.m.T('com')].filter(Boolean);
        },
      },
      tasks: [
        { text: 'Wire the ohmmeter across the Red–Violet–Orange–Gold resistor', done: (g, s) => across(g, s.m, s.res.T('a'), s.res.T('b')) && s.m.value > 20000 },
      ],
      success: 'The ohmmeter reads [[27.0 kΩ]]! Red (2), Violet (7), Orange (×10³) = 27,000 Ω = 27 kΩ.',
      question: {
        type: 'number',
        q: 'What is the value in [[kΩ]] of a resistor with bands: <b>Orange – Orange – Yellow – Gold</b>?',
        answer: 330,
        unit: 'kΩ',
        fixedUnit: true,
        tol: 0.01,
        chips: ['3.3', '33', '330', '3300'],
        why: 'Orange = [[3]], Orange = [[3]], Yellow = [[× 10⁴]] (four zeros) → 330,000 Ω = [[330 kΩ]].',
      },
    },
    {
      id: 'tolerance-step', kind: 'question', title: 'Tolerance limits: minimum & maximum Ω',
      text: 'A resistor\'s [[tolerance]] band tells you how far above or below the marked value it can legally measure: `R_min = R × (1 − tol)` and `R_max = R × (1 + tol)`. Remember: <b>Gold = ±5%</b>, <b>Silver = ±10%</b>, and <b>no 4th band = ±20%</b>.',
      question: {
        type: 'number',
        q: 'What is the [[minimum]] acceptable resistance (in Ω) of a [[1,000 Ω]] resistor with a [[Silver (±10%)]] tolerance band?',
        answer: 900,
        unit: 'Ω',
        fixedUnit: true,
        tol: 0.005,
        chips: ['800', '900', '950', '1100'],
        why: '10% of 1,000 Ω is [[100 Ω]]. Subtracting 100 Ω gives `R_min = 1,000 − 100 = 900 Ω` (and `R_max = 1,100 Ω`).',
      },
    },
    {
      id: 'bench-conductance-1b', kind: '3d', title: 'Conductance (G = 1/R) on the 3D bench',
      text: '[[Conductance]] `G = 1 / R` in [[siemens]] (S) measures how easily current flows. We need a resistor in the bench slot with a conductance of **1 mS** (`0.001 S`). Since `R = 1 / G = 1 / 0.001 S = 1,000 Ω`, swap the **1 kΩ** resistor from the parts bin into the holder!',
      how: 'Click the <b>1 kΩ resistor</b> in the blue parts bin on the left, then click the <b>resistor holder</b> to install it and read the ohmmeter.',
      scene: {
        camera: CAM,
        allowWiring: false,
        setup(g, s) {
          s.res = g.slot({ pos: [0, 0, -0.3], content: { type: 'resistor', R: 220, tol: 5 }, label: 'holder' });
          s.m = g.meter({ pos: [2.5, 0, 0.9], mode: 'Ω', modes: ['Ω'], rotY: -0.25 });
          s.bin = g.bin({
            pos: [-3.2, 0, -0.2],
            items: [
              { type: 'resistor', R: 220, tol: 5, label: '220 Ω' },
              { type: 'resistor', R: 1000, tol: 5, label: '1 kΩ' },
              { type: 'resistor', R: 4700, tol: 5, label: '4.7 kΩ' },
              { type: 'resistor', R: 10000, tol: 5, label: '10 kΩ' },
            ],
          });
          g.wire(s.m.T('red'), s.res.T('a'), { locked: true });
          g.wire(s.m.T('com'), s.res.T('b'), { locked: true });
        },
        highlight(g, s) {
          if (s.res.content?.R === 1000) return [];
          return g.held ? [s.res] : [s.bin];
        },
      },
      tasks: [
        { text: 'Swap the 1 kΩ resistor into the holder so G = 1 / 1,000 Ω = 1 mS', done: (g, s) => s.res.content?.R === 1000 },
      ],
      success: 'With [[1.00 kΩ]] in the holder, its conductance is `G = 1 / 1,000 Ω = 1 mS` (`1,000 µS`)!',
      question: {
        q: 'What is the [[conductance (G)]] of a [[22 kΩ]] resistor?',
        options: ['45.5 µS', '22 mS', '4.55 mS', '0.022 S'],
        correct: 0,
        why: '`G = 1 / R = 1 / 22,000 Ω = 0.00004545 S = [[45.5 µS]]`.',
      },
    },
    {
      id: 'var-res-sort', kind: 'visual', title: 'Potentiometer, rheostat & resistive sensors',
      text: 'A [[potentiometer]] has <b>3 terminals</b> and divides voltage. A [[rheostat]] has <b>2 terminals</b> and controls current. [[Thermistors]], [[photoconductive cells]], and [[strain gauges]] change resistance in response to heat, light, or force.',
      how: 'Click each card above, then click the category box it belongs in.',
      visual: 'varResSort',
      tasks: [{ text: 'Sort all 5 variable resistors and sensors into their categories' }],
      success: 'You\'ve got all 5 variable resistor types down cold!',
      question: {
        q: 'A variable resistor wired with [[two terminals]] in series with a load to control [[current]] is called a…',
        options: ['Rheostat', 'Potentiometer', 'Thermistor', 'Fixed resistor'],
        correct: 0,
        why: 'A [[rheostat]] uses 2 terminals to vary series resistance and current; a [[potentiometer]] uses 3 terminals to divide voltage.',
      },
    },
    {
      id: 'wire-lab-1b', kind: 'visual', title: 'Wire resistance & circular mils',
      text: 'Wire resistance follows `R = ρ × l / A`, where length `l` is in feet, diameter `d` is in mils (`1 mil = 0.001 in`), and cross-sectional area in [[circular mils]] is `A = d²`. Make the wire shorter or thicker until its resistance drops below **1 Ω**!',
      how: 'Drag the <b>Diameter</b> slider up (thicker wire) or the <b>Length</b> slider down until <code>R &lt; 1 Ω</code>.',
      visual: 'wireLab',
      tasks: [{ text: 'Adjust wire length or diameter until R is under 1 Ω' }],
      success: 'Doubling a wire\'s diameter quadruples its area (`A = d²`), cutting its resistance to one-fourth!',
      question: {
        type: 'number',
        q: 'Find the resistance (in Ω) of [[20 ft]] of copper wire (`ρ = 10.37 CM·Ω/ft`) with diameter [[1.5 mils]].',
        answer: 92.18,
        unit: 'Ω',
        fixedUnit: true,
        tol: 0.02,
        chips: ['2.25', '92.2', '207', '466'],
        why: '`A = 1.5² = [[2.25 CM]]`. Then `R = (10.37 × 20) / 2.25 = 207.4 / 2.25 = [[92.18 Ω]]`, which rounds to 92 Ω.',
      },
    },
  ],
};
