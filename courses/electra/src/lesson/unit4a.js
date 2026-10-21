// unit4a.js - Unit 4A: Energy & Power in Electric Circuits (Read the study sheet -> Do the hands-on steps).
import { FIG } from './visuals.js';
import { sig } from '../core/num.js';

export const LESSON_4A = {
  id: 'unit4a',
  code: '4A',
  title: 'Energy & Power in Electric Circuits',
  color: '#fb923c',
  minutesRead: 6,
  doneLead: "You dialed power up on the 3D bench using Watt's law, watched an underrated resistor glow hot and swapped in a safe wattage rating, calculated utility kWh bills, and solved power-supply efficiency and Ah battery problems:",

  // =========================================================================
  // PART 1 - THE STUDY SHEET
  // =========================================================================
  sheet: [
    {
      title: 'Energy (W) vs Power (P) — Joules and Watts',
      body: `<p>[[Energy]] (symbol <b>W</b>) is the ability to do work, measured in [[joules]] (<b>J</b>). [[Power]] (symbol <b>P</b>) is the <b>rate</b> at which energy is used per unit time, measured in [[watts]] (<b>W</b>):</p>
      <ul>
        <li><b>Formula:</b> <code>P = W / t</code> &nbsp;(Watts = Joules ÷ Seconds)</li>
        <li><b>One watt (1 W)</b> is the power when <b>1 joule</b> of energy is used in <b>1 second</b> (<code>1 W = 1 J/s</code>).</li>
        <li><b>Rearranged forms:</b> <code>W = P × t</code> and <code>t = W / P</code></li>
        <li><b>Horsepower (hp):</b> Mechanical power is often rated in horsepower, where <code>1 hp = 746 W</code>.</li>
        <li><b>Slide examples:</b> If <code>100 J</code> of energy is used in <code>5 s</code>, then <code>P = 100 J / 5 s = 20 W</code>. If <code>50 J</code> is used in <code>2.5 s</code>, <code>P = 20 W</code>.</li>
      </ul>`,
      key: '[[P = W / t]] — [[1 Watt]] = [[1 Joule]] per second (`1 W = 1 J/s`). Rearranged: [[W = P × t]].',
      exam: 'When using P = W / t with joules and watts, time t must be in SECONDS (convert minutes × 60, hours × 3,600).',
    },
    {
      title: 'The Kilowatt-Hour (kWh) Unit of Energy',
      body: `<p>Because a single joule is tiny, electric utility companies measure household energy consumption in [[kilowatt-hours]] (<b>kWh</b>):</p>
      <ul>
        <li><b>1 kilowatt-hour (1 kWh)</b> is the energy used when a <b>1,000 W (1 kW)</b> load operates continuously for <b>1 hour</b> (equal to <code>3.6 × 10⁶ J</code>).</li>
        <li><b>Formula:</b> <code>W (kWh) = P (kW) × t (hours) = (P_watts × hours) ÷ 1,000</code></li>
        <li><b>Slide examples:</b> A <code>1,200 W</code> (<code>1.2 kW</code>) heater running for <code>20 minutes</code> (<code>1/3 h</code>) uses <code>1.2 kW × 1/3 h = 0.4 kWh</code>. The same heater running for <code>1 hour</code> uses <code>1.2 kWh</code>.</li>
      </ul>`,
      key: '[[kWh]] is a unit of [[ENERGY]], not power! `Energy (kWh) = Power (kW) × Time (hours)`.',
      exam: 'To find total kWh for multiple appliances, calculate (Watts × Hours) for each appliance, add the watt-hours together, and divide by 1,000.',
    },
    {
      title: "Watt's Law: The Three Power Formulas",
      fig: FIG.wattFormulas,
      body: `<p>Combining the basic power equation <code>P = V × I</code> with [[Ohm's law]] (<code>V = I × R</code> and <code>I = V / R</code>) gives the three forms of [[Watt's law]]:</p>
      <ul>
        <li><b>Know V and I:</b> <code>P = V × I</code> &nbsp;(and <code>I = P / V</code>, <code>V = P / I</code>)</li>
        <li><b>Know I and R:</b> <code>P = I² × R</code> &nbsp;(and <code>I = √(P / R)</code>, <code>R = P / I²</code>)</li>
        <li><b>Know V and R:</b> <code>P = V² / R</code> &nbsp;(and <code>V = √(P × R)</code>, <code>R = V² / P</code>)</li>
        <li><b>Slide examples:</b>
          <br>1. <code>I = 0.135 A</code> through <code>R = 27 Ω</code> → <code>P = (0.135)² × 27 = 0.492 W</code>
          <br>2. A heater draws <code>12 A</code> from <code>120 V</code> → <code>P = 12 × 120 = 1,440 W</code>
          <br>3. <code>V = 5 V</code> across <code>R = 100 Ω</code> → <code>P = 5² / 100 = 0.25 W</code></li>
      </ul>`,
      key: 'Three power equations: [[P = V × I]], [[P = I² × R]], and [[P = V² / R]].',
      exam: 'Remember to SQUARE the current in P = I²R and SQUARE the voltage in P = V²/R!',
    },
    {
      title: 'Resistor Power Ratings & Heat Dissipation',
      fig: FIG.resistorSizes,
      body: `<p>As electrons flow through a resistor, they collide with atoms and convert electrical energy into <b>heat</b>. A resistor's [[power rating]] (in watts) is the maximum power it can safely dissipate without overheating or burning out:</p>
      <ul>
        <li><b>What sets the power rating?</b> The resistor's <b>physical size (surface area, length, and diameter)</b> — NOT its resistance in ohms! Standard metal-film/carbon sizes are <code>⅛ W (0.125 W)</code>, <code>¼ W (0.25 W)</code>, <code>½ W (0.5 W)</code>, <code>1 W</code>, and <code>2 W</code>. Higher powers use ceramic wirewound resistors.</li>
        <li><b>Safe Selection Rule:</b> Always choose a resistor with a power rating <b>greater than</b> the actual power <code>P</code> it will dissipate in the circuit (a 2× safety margin is standard practice).</li>
      </ul>`,
      key: 'A resistor\'s [[power rating (W)]] depends on its [[physical size]]. Always pick `P_rating > P_actual`!',
    },
    {
      title: 'Power Supply Efficiency (η) & Battery Ampere-Hour (Ah) Rating',
      body: `<p><b>Power Supply Efficiency:</b> Every real power supply loses some power internally as heat (<code>P_loss</code>), so input power is always greater than output power (<code>P_in = P_out + P_loss</code>):</p>
      <ul>
        <li><b>Efficiency Formula:</b> <code>η (%) = (P_out / P_in) × 100%</code></li>
        <li><b>Power Loss:</b> <code>P_loss = P_in − P_out</code> &nbsp;(and <code>P_out = P_in − P_loss</code>)</li>
      </ul>
      <p><b>Battery Capacity in Ampere-Hours (Ah):</b> Batteries are rated in [[ampere-hours]] (<b>Ah</b>), which equals discharge current (in amperes) multiplied by discharge time (in hours):</p>
      <ul>
        <li><b>Formula:</b> <code>Capacity (Ah) = I (A) × t (hours)</code> &nbsp;(so <code>I = Ah / t</code> and <code>t = Ah / I</code>)</li>
        <li><b>Example:</b> A <code>10 Ah</code> battery can supply <code>0.5 A</code> for <code>20 hours</code> (<code>0.5 A × 20 h = 10 Ah</code>).</li>
      </ul>`,
      key: 'Efficiency `η = (P_out / P_in) × 100%`. Battery capacity `Ah = I (amps) × t (hours)`.',
      exam: '5 V across a 100 Ω resistor dissipates P = V²/R = 25/100 = 0.25 W. A rating has to be greater than that, so ¼ W (exactly 0.25 W) is not enough; use at least ½ W.',
    },
  ],

  // =========================================================================
  // PART 2 - INTERACTIVE DO STEPS
  // =========================================================================
  steps: [
    {
      id: 'kwh-calc-4a', kind: 'visual', title: 'Kilowatt-hours (kWh) on your electric bill',
      text: 'Electric companies bill you for [[energy]] in [[kilowatt-hours]] (`kWh`): `W (kWh) = (Watts × hours) ÷ 1,000`. Try at least two appliances or slider positions below!',
      how: 'Click another appliance button or drag the <b>Hours used</b> slider to compare energy in kWh.',
      visual: 'kwhCalculator',
      tasks: [{ text: 'Compare kWh energy usage across at least 2 settings' }],
      success: 'Convert watts to kilowatts (`÷ 1,000`) and multiply by hours to get `kWh`!',
      question: {
        type: 'number',
        q: 'How many [[kilowatt-hours (kWh)]] does a `1,200 W` (`1.2 kW`) heater use in `20 minutes`?',
        answer: 0.4,
        unit: 'kWh',
        fixedUnit: true,
        tol: 0.02,
        chips: ['0.4', '1.2', '24', '400'],
        why: '`1,200 W = 1.2 kW` and `20 min = 1/3 h`. `W = 1.2 kW × 1/3 h = [[0.4 kWh]]`. The same heater for a full hour uses 1.2 kWh.',
      },
    },
    {
      id: 'bench-watts-law-4a', kind: '3d', title: "Watt's Law on the 3D bench: P = V × I = V² / R",
      text: 'On the 3D bench, a `100 Ω` resistor is wired in series with an [[ammeter]]. Use the **+** button on the power supply to dial the voltage up to **10 V** (`I = 100 mA = 0.1 A`) so the resistor dissipates **1.00 W** (`P = 10 V × 0.1 A = 1 W`)!',
      how: 'Click the <b>+ button</b> on the power supply until it reaches <b>10 V</b> and watch the floating power tag above the resistor.',
      scene: {
        camera: { pos: [0, 7.2, 6.8], target: [0, 0.2, 0.1] },
        allowWiring: false,
        setup(g, s) {
          s.ps = g.supply({ pos: [-3.6, 0, -1.6], V: 4, adjustable: true, min: 0, max: 16, step: 2 });
          s.m = g.meter({ pos: [-0.4, 0, 1.4], mode: 'A', modes: ['A'] });
          s.r = g.slot({ pos: [2.4, 0, -0.4], content: { type: 'resistor', R: 100, Prated: 2 }, locked: true, label: '100 Ω (2 W)' });
          s.ptag = g.stage.label(s.r.group, [0, 1.85, 0], '', 'itag');
          g.wire(s.ps.T('+'), s.m.T('red'), { locked: true });
          g.wire(s.m.T('com'), s.r.T('a'), { locked: true });
          g.wire(s.r.T('b'), s.ps.T('-'), { locked: true });
          g.stage.updaters.add(() => {
            const I = Math.abs(s.r.I || 0);
            const P = I * I * 100;
            s.ptag.set(`P = ${sig(P, 3)} W`);
          });
        },
        highlight(g, s) { return s.ps.V === 10 ? [] : [s.ps]; },
      },
      tasks: [
        { text: 'Step the supply voltage to 10 V so I = 100 mA and P = 1.00 W', done: (g, s) => s.ps.V === 10 && Math.abs(Math.abs(s.m.value) - 0.1) < 0.005 },
      ],
      success: 'At `10 V` across `100 Ω`, `I = 0.10 A` (`100 mA`) and `P = V × I = 10 V × 0.10 A = 1.00 W` (`= V²/R = 100/100`)!',
      question: {
        type: 'number',
        q: 'How much power (in watts) does `0.135 A` dissipate in a `27 Ω` resistor?',
        answer: 0.492,
        unit: 'W',
        fixedUnit: true,
        tol: 0.02,
        chips: ['0.492', '3.65', '27', '200'],
        why: 'Use `P = I² × R`. Square the current first: `(0.135)² = 0.018225`, then `0.018225 × 27 = [[0.492 W]]`.',
      },
    },
    {
      id: 'power-heat-4a', kind: 'visual', title: 'Pick a safe resistor power rating (W)',
      text: 'With `12 V` across a `220 Ω` resistor, the power dissipated is `P = V² / R = 144 / 220 = 0.655 W` (`655 mW`). Both `⅛ W` (`0.125 W`) and `¼ W` (`0.25 W`) — and even `½ W` (`0.5 W`) — will overheat! Pick the **smallest standard rating** that safely handles `0.655 W`.',
      how: 'Click the wattage rating buttons below until the smoke stops and you have the smallest safe rating.',
      visual: 'powerHeat',
      tasks: [{ text: 'Select the 1 W power rating so the 655 mW resistor runs safely without smoking' }],
      success: 'Because `0.655 W > 0.5 W`, a `½ W` resistor overheats — `1 W` is the smallest standard rating above `0.655 W`!',
      question: {
        q: 'A `100 Ω` resistor has `5 V` across it. What is the smallest standard power rating that is greater than the power it dissipates?',
        options: ['½ W (0.50 W)', '⅛ W (0.125 W)', '¼ W (0.25 W)', '1 W'],
        correct: 0,
        why: '`P = V² / R = 25 / 100 = [[0.25 W]]`. The rating has to be greater than the power dissipated, so ¼ W (exactly 0.25 W) is not enough. The next standard rating is [[½ W]].',
      },
    },
    {
      id: 'bench-overheat-4a', kind: '3d', title: 'Swap out an overheating resistor on the 3D bench',
      text: 'On the 3D bench, `12 V` is applied across a `100 Ω` resistor (`P = 12² / 100 = 1.44 W`), but someone installed a tiny **¼ W (0.25 W)** resistor and it\'s glowing red-hot! Swap in the **100 Ω (2 W)** resistor from the bin to fix it.',
      how: 'Click the <b>100 Ω (2 W)</b> resistor in the parts bin, then click the glowing hot resistor slot to replace it.',
      scene: {
        camera: { pos: [0, 7.2, 6.8], target: [0, 0.2, 0.1] },
        allowWiring: false,
        setup(g, s) {
          s.ps = g.supply({ pos: [-3.6, 0, -1.6], V: 12 });
          s.r = g.slot({
            pos: [1.6, 0, -0.4],
            content: { type: 'resistor', R: 100, Prated: 0.2, tag: 'quarter' },
            accepts: ['resistor'],
            label: 'R (dissipating 1.44 W)',
          });
          s.bin = g.bin({
            pos: [0.4, 0, 2.6],
            items: [{ type: 'resistor', R: 100, Prated: 2.5, tag: 'twoWatt', label: '100 Ω (2 W)' }],
            title: '2 W SPARE',
          });
          g.wire(s.ps.T('+'), s.r.T('a'), { locked: true });
          g.wire(s.r.T('b'), s.ps.T('-'), { locked: true });
        },
        highlight(g, s) {
          if (s.r.content?.tag === 'twoWatt') return [];
          return g.held ? [s.r] : [s.bin];
        },
      },
      tasks: [
        { text: 'Replace the overheating ¼ W resistor with the 2 W resistor from the bin', done: (g, s) => s.r.content?.tag === 'twoWatt' },
      ],
      success: 'Cool and steady! A `2 W` rating easily handles `1.44 W` of heat dissipation.',
      question: {
        type: 'number',
        q: 'A power supply takes `P_in = 25 W` and delivers `P_out = 20 W` to a load. What is its efficiency `η` in percent?',
        answer: 80,
        unit: '%',
        fixedUnit: true,
        tol: 0.01,
        chips: ['20', '75', '80', '125'],
        why: '`η = (P_out / P_in) × 100% = (20 W ÷ 25 W) × 100% = [[80 %]]`.',
      },
    },
    {
      id: 'battery-ah-4a', kind: 'question', title: 'Battery capacity in Ampere-Hours (Ah)',
      text: 'A battery\'s [[ampere-hour]] (`Ah`) rating tells you how much current it can deliver multiplied by how many hours it can sustain that current: `Capacity (Ah) = I (A) × t (hours)`.',
      question: {
        type: 'number',
        q: 'For how many hours can a `10 Ah` battery continuously deliver `0.5 A`?',
        answer: 20,
        unit: 'h',
        fixedUnit: true,
        tol: 0.01,
        chips: ['5', '10', '20', '50'],
        why: '`t = Capacity (Ah) ÷ I (A) = 10 Ah ÷ 0.5 A = [[20 hours]]`.',
      },
    },
  ],
};
