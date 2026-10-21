// unit2a.js - Unit 2A "Basic Electric Circuit" lesson: a study sheet to READ, then interactive steps to DO.
// [[term]] = highlighted key term.
import { FIG } from './visuals.js';

const LAMP = { type: 'lamp', R: 50, Prated: 2.88 };
const lit = s => Math.abs(s?.I || 0) > 0.08;
const across = (g, m, t1, t2) => (g.joined(m.T('red'), t1) && g.joined(m.T('com'), t2)) || (g.joined(m.T('red'), t2) && g.joined(m.T('com'), t1));
const CAM = { pos: [0, 6.0, 7.2], target: [0, 0.35, 0.1] };

export const LESSON_2A = {
  id: 'unit2a',
  code: '2A',
  title: 'Basic Electric Circuit',
  color: '#34d399',
  minutesRead: 6,

  // ================================================================== READ
  sheet: [
    {
      title: 'What is a circuit?',
      body: `A basic electric circuit is an arrangement of components that uses [[voltage]], [[current]] and [[resistance]] to do something useful, like light a lamp or spin a motor.
        <br><br>Every circuit has three essential parts:
        <ul><li>a [[source]], which supplies the energy (battery or power supply)</li><li>a [[load]], which uses the energy (lamp, motor, heater)</li><li>a [[path]] for current between them (the wires)</li></ul>
        Most real circuits add two more: a [[control]] device (a switch) and a [[protection]] device (a fuse or circuit breaker).`,
      fig: FIG.basicCircuit,
      key: 'Source + load + complete path = a working circuit.',
    },
    {
      title: 'Open and closed circuits',
      body: `A [[closed circuit]] has a complete path, so current flows.
        <br>An [[open circuit]] has a break in the path (an open switch, a cut wire, a blown fuse), so [[no current flows]]: I = 0.
        <br><br>The surprising part: in an open circuit, the [[full source voltage appears across the break]]. Current is zero, but the "push" is still there, waiting at the gap.`,
      fig: FIG.openClosed,
      exam: 'Open circuit → I = 0, and the whole source voltage sits across the open.',
    },
    {
      title: 'Short circuits',
      body: `A [[short circuit]] is an accidental, almost zero-resistance shortcut, for example two bare wires touching, or a stray drop of solder across a part.
        <br><br>Because R ≈ 0, Ohm's law ([[I = V ÷ R]]) gives a [[huge current]]. Wires overheat and parts can be damaged or start a fire. That's exactly what protective devices are for.`,
      fig: FIG.short,
    },
    {
      title: 'Switches: poles and throws',
      body: `Switches open and close circuits. They're described by two words:
        <ul><li>[[Pole]]: the number of movable arms</li><li>[[Throw]]: how many contacts each arm can connect to</li></ul>
        So you get [[SPST]] (single pole, single throw: a plain on/off), [[SPDT]] (one arm, two possible outputs), [[DPST]] and [[DPDT]] (two arms that move together).
        <br><br>Push buttons can be [[normally open (NO)]], which only connect while pressed, or [[normally closed (NC)]], which break the connection while pressed.`,
      fig: FIG.switches,
    },
    {
      title: 'Protective devices',
      body: `Protective devices sit [[in the current path]] and deliberately [[open the circuit]] when current goes over a set limit. That protects parts from damage and wires from overheating.
        <ul><li>[[Fuse]]: a wire inside melts when its rated current is exceeded. Once blown it must be [[replaced]]. Types include fast-acting and time-delay.</li>
        <li>[[Circuit breaker]]: trips using the [[heating effect]] of current (thermal) or the [[magnetic field]] it creates (magnetic). It can be [[reset]] and reused.</li></ul>`,
      exam: 'Fuse = melts, replace it. Breaker = trips, reset it.',
    },
    {
      title: 'Ground',
      body: `[[Ground]] is the reference point of a circuit, defined as [[0 V]]. Every other voltage is measured relative to it.
        <br><br>The name comes from history: one conductor used to be connected to an 8-foot metal rod driven into the earth. Today that's called [[earthing]].`,
      fig: FIG.ground,
    },
    {
      title: 'Measuring: the 3 meter rules',
      body: `A [[multimeter]] combines three instruments:
        <ul><li>[[Voltmeter]] measures voltage. Connect it [[in parallel]] (across the part). Match polarity: + to +, − to −. Set the range [[higher]] than the expected voltage.</li>
        <li>[[Ammeter]] measures current. Connect it [[in series]]: open the path so the current flows [[through]] the meter. Mind polarity, and select the current setting before connecting.</li>
        <li>[[Ohmmeter]] measures resistance. The circuit must be [[powered OFF]], because the meter uses its own small battery.</li></ul>`,
      fig: FIG.meters,
      exam: 'Voltmeter → parallel. Ammeter → series. Ohmmeter → power off.',
    },
  ],

  // ================================================================== DO
  steps: [
    {
      id: 'build', kind: '3d', title: 'Build your first circuit',
      text: 'Every circuit needs a [[source]], a [[load]] and a complete [[path]]. Here\'s a power supply (source) and a lamp (load). The wires are up to you.',
      how: 'Click a <b>glowing post</b>, then click the next glowing post to run a wire between them.',
      scene: {
        camera: CAM,
        setup(g, s) { s.ps = g.supply({ pos: [-3.4, 0, -1.2], V: 12 }); s.lamp = g.slot({ pos: [2.4, 0, -0.2], content: LAMP, locked: true }); },
        highlight(g, s) {
          if (!g.joined(s.ps.T('+'), s.lamp.T('a')) && !g.joined(s.ps.T('+'), s.lamp.T('b'))) return g.pending ? [s.lamp.T('a')] : [s.ps.T('+')];
          if (!lit(s.lamp)) { const free = g.joined(s.ps.T('+'), s.lamp.T('a')) ? s.lamp.T('b') : s.lamp.T('a'); return g.pending ? [s.ps.T('-')] : [free]; }
          return [];
        },
      },
      tasks: [
        { text: 'Wire the supply\'s [[+]] post to the lamp', done: (g, s) => g.joined(s.ps.T('+'), s.lamp.T('a')) || g.joined(s.ps.T('+'), s.lamp.T('b')) },
        { text: 'Wire the lamp back to the [[−]] post', done: (g, s) => lit(s.lamp) },
      ],
      success: '💡 Lit! You made a [[closed circuit]]. The glowing dots are electrons flowing around the loop.',
      question: { q: 'In this circuit, which part is the [[load]]?', options: ['The lamp', 'The power supply', 'The wires', 'The red post'], correct: 0, why: 'The load is what uses the energy. The supply is the source, and the wires are the path.' },
    },
    {
      id: 'open', kind: '3d', title: 'Open vs closed',
      text: 'A [[switch]] controls the circuit. [[Closed]] = complete path, current flows. [[Open]] = broken path, [[I = 0]]. A voltmeter is clipped across the switch so you can see what happens at the gap.',
      how: 'Click the switch\'s <b>black handle</b> to open it. Watch the lamp and the meter.',
      scene: {
        camera: CAM,
        setup(g, s) {
          s.ps = g.supply({ pos: [-3.4, 0, -1.2], V: 12 });
          s.lamp = g.slot({ pos: [2.6, 0, -1.2], content: LAMP, locked: true });
          s.sw = g.switch({ pos: [0.2, 0, 1.4], closed: true });
          s.m = g.meter({ pos: [3.4, 0, 1.7], mode: 'V', modes: ['V'], rotY: -0.3 });
          g.wire(s.ps.T('+'), s.lamp.T('a'), { locked: true });
          g.wire(s.lamp.T('b'), s.sw.T('b'), { locked: true });
          g.wire(s.sw.T('a'), s.ps.T('-'), { locked: true });
          g.wire(s.m.T('red'), s.sw.T('b'), { locked: true });
          g.wire(s.m.T('com'), s.sw.T('a'), { locked: true });
        },
        allowWiring: false, noWiringMsg: 'No wiring here. Click the switch handle!',
      },
      tasks: [{ text: 'Open the switch', done: (g, s) => !s.sw.closed && !lit(s.lamp) }],
      success: 'Lamp off. Now look at the meter across the switch gap…',
      question: { q: 'With the switch [[open]], what does the voltmeter across the gap read?', options: ['12 V, the full source voltage', '0 V, because there\'s no current', '6 V, half of it', 'It can\'t be measured'], correct: 0, why: 'Current is zero, so the lamp drops 0 V, which leaves the [[whole 12 V across the open]]. Classic exam question!' },
    },
    {
      id: 'switches', kind: 'visual', title: 'Poles and throws',
      text: '[[Pole]] = how many arms move. [[Throw]] = how many contacts each arm can reach. Try each type below.',
      how: 'Pick a switch type, then click the switch to flip it. Try a few.',
      visual: 'switchLab',
      tasks: [{ text: 'Flip at least two different switch types' }],
      success: 'Exactly: [[poles]] = arms, [[throws]] = positions each arm can reach.',
      question: { q: 'One arm that can connect to either of [[two]] different outputs is called…', options: ['SPDT', 'SPST', 'DPST', 'NC push button'], correct: 0, why: '[[Single Pole]] (one arm), [[Double Throw]] (two positions).' },
    },
    {
      id: 'short', kind: '3d', title: 'Short circuit!',
      text: 'This loop has a [[fuse]] in the path, a deliberate weak link. Let\'s see what a [[short circuit]] does: you\'re going to bypass the lamp with a wire.',
      how: 'Run a wire straight from one <b>glowing lamp post</b> to the other.',
      scene: {
        camera: CAM,
        setup(g, s) {
          s.ps = g.supply({ pos: [-3.4, 0, -1.2], V: 12 });
          s.fuse = g.slot({ pos: [-0.2, 0, -1.8], content: { type: 'fuse', rating: 1 }, accepts: ['fuse'], locked: true });
          s.lamp = g.slot({ pos: [2.6, 0, 0.6], content: LAMP, locked: true });
          g.wire(s.ps.T('+'), s.fuse.T('a'), { locked: true });
          g.wire(s.fuse.T('b'), s.lamp.T('a'), { locked: true });
          g.wire(s.lamp.T('b'), s.ps.T('-'), { locked: true });
        },
        highlight: (g, s) => (s.blown ? [] : [s.lamp.T('a'), s.lamp.T('b')]),
        on: { fuseBlown: (g, s) => { s.blown = true; g.say('💥 POW! The fuse melted.', { mood: 'shock' }); } },
      },
      tasks: [{ text: 'Short the lamp with a wire', done: (g, s) => s.blown }],
      success: 'The fuse did its job and [[opened the circuit]].',
      question: { q: 'Why did the fuse blow?', options: ['Resistance dropped to almost 0, so the current became huge', 'The voltage went up', 'The lamp used too much power', 'The fuse was too old'], correct: 0, why: '[[I = V ÷ R]]: with R ≈ 0, the current shoots up and the fuse wire melts.' },
    },
    {
      id: 'fix', kind: '3d', title: 'Fix it',
      text: 'A blown [[fuse]] can\'t fix itself. It has to be [[replaced]]. But first, remove whatever caused the problem!',
      how: 'Click the short wire to delete it. Then click the <b>spare fuse</b> in the blue bin and click the <b>blown fuse</b> to swap it.',
      scene: {
        camera: { pos: [0, 6.4, 7.6], target: [0, 0.3, 0.4] },
        setup(g, s) {
          s.ps = g.supply({ pos: [-3.4, 0, -1.4], V: 12 });
          s.fuse = g.slot({ pos: [-0.2, 0, -1.9], content: { type: 'fuse', rating: 1, blown: true }, accepts: ['fuse'] });
          s.lamp = g.slot({ pos: [2.6, 0, 0.3], content: LAMP, locked: true });
          g.bin({ pos: [-1.6, 0, 2.2], items: [{ type: 'fuse', rating: 1 }], title: 'SPARES' });
          g.wire(s.ps.T('+'), s.fuse.T('a'), { locked: true });
          g.wire(s.fuse.T('b'), s.lamp.T('a'), { locked: true });
          g.wire(s.lamp.T('b'), s.ps.T('-'), { locked: true });
          g.wire(s.lamp.T('a'), s.lamp.T('b'));
        },
        on: { fuseBlown: (g) => { g.say('Ha, it blew again: the short was still there! Here\'s another spare.', { mood: 'shock' }); const bin = g.parts.find(p => p.kind === 'bin'); bin.giveBack({ type: 'fuse', rating: 1 }); g.mistake(); } },
      },
      tasks: [
        { text: 'Remove the short-circuit wire', done: (g, s) => !g.joined(s.lamp.T('a'), s.lamp.T('b')) },
        { text: 'Swap in the spare fuse', done: (g, s) => s.fuse.content && !s.fuse.content.blown },
        { text: 'Lamp shining again', done: (g, s) => lit(s.lamp) },
      ],
      success: 'Fixed! Remember: a [[fuse]] gets [[replaced]], a [[breaker]] gets [[reset]].',
    },
    {
      id: 'protect', kind: 'visual', title: 'Fuse or breaker?',
      text: 'Both protect the circuit by [[opening it]] when current is too high. The difference is what happens afterwards.',
      how: 'Click a card, then click the box it belongs in.',
      visual: 'fuseVsBreaker',
      tasks: [{ text: 'Sort all 5 cards' }],
      success: 'All sorted! [[Fuse]] = melts, replace it. [[Breaker]] = trips, reset it.',
    },
    {
      id: 'ground', kind: 'visual', title: 'Ground',
      text: '[[Ground]] is the circuit\'s reference point. It\'s where we put "zero" when measuring voltages.',
      visual: 'groundPick',
      question: { q: 'What is the potential of ground?', options: ['0 V', 'The source voltage', '120 V', 'It depends on the load'], correct: 0, why: 'Ground is defined as [[0 V]]. Everything else is measured relative to it.' },
    },
    {
      id: 'voltmeter', kind: '3d', title: 'Measure voltage',
      text: 'A [[voltmeter]] goes [[in parallel]]: one probe on each side of the part. It has a huge internal resistance (~10 MΩ), so it barely disturbs the circuit.',
      how: 'Wire the meter\'s <b>red jack</b> to one lamp post and the <b>black jack</b> to the other. Follow the glow.',
      scene: {
        camera: CAM,
        setup(g, s) {
          s.ps = g.supply({ pos: [-3.4, 0, -1.2], V: 12 });
          s.lamp = g.slot({ pos: [1.6, 0, -1.2], content: LAMP, locked: true });
          s.m = g.meter({ pos: [3.4, 0, 1.6], mode: 'V', modes: ['V'], rotY: -0.3 });
          g.wire(s.ps.T('+'), s.lamp.T('a'), { locked: true });
          g.wire(s.lamp.T('b'), s.ps.T('-'), { locked: true });
        },
        highlight(g, s) {
          const red = g.joined(s.m.T('red'), s.lamp.T('a')) || g.joined(s.m.T('red'), s.lamp.T('b'));
          const com = g.joined(s.m.T('com'), s.lamp.T('a')) || g.joined(s.m.T('com'), s.lamp.T('b'));
          if (g.pending) return [s.lamp.T('a'), s.lamp.T('b')];
          return [!red && s.m.T('red'), !com && s.m.T('com')].filter(Boolean);
        },
      },
      tasks: [{ text: 'Probes across the lamp', done: (g, s) => across(g, s.m, s.lamp.T('a'), s.lamp.T('b')) && Math.abs(s.m.value) > 10 }],
      success: '12 V across the lamp: the full source voltage.',
      question: { q: 'A voltmeter is always connected…', options: ['In parallel (across the part)', 'In series (in the path)', 'Only to ground', 'With the power off'], correct: 0, why: 'Voltage is a difference between two points, so the meter goes [[across]] the part.' },
    },
    {
      id: 'ammeter', kind: '3d', title: 'Measure current',
      text: 'An [[ammeter]] goes [[in series]]: you open the path and make the current flow [[through]] the meter. There\'s a gap in this circuit, ready for it.',
      how: 'Bridge the gap: <b>red jack</b> → the switch\'s free post, <b>black jack</b> → the supply\'s <b>−</b> post.',
      scene: {
        camera: CAM,
        setup(g, s) {
          s.ps = g.supply({ pos: [-3.4, 0, -1.2], V: 12 });
          s.lamp = g.slot({ pos: [2.4, 0, -1.4], content: LAMP, locked: true });
          s.sw = g.switch({ pos: [1.0, 0, 1.4], closed: true, locked: true });
          s.m = g.meter({ pos: [-1.6, 0, 1.9], mode: 'A', modes: ['A'] });
          g.wire(s.ps.T('+'), s.lamp.T('a'), { locked: true });
          g.wire(s.lamp.T('b'), s.sw.T('b'), { locked: true });
        },
        highlight(g, s) {
          if (g.pending) return g.pending === s.m.T('red') ? [s.sw.T('a')] : g.pending === s.m.T('com') ? [s.ps.T('-')] : [];
          return [!g.joined(s.m.T('red'), s.sw.T('a')) && s.m.T('red'), !g.joined(s.m.T('com'), s.ps.T('-')) && s.m.T('com')].filter(Boolean);
        },
      },
      tasks: [{ text: 'Current flowing through the meter', done: (g, s) => !s.m.fuseBlown && Math.abs(s.m.value) > 0.15 }],
      success: '240 mA, and the lamp is lit because the meter completes the loop.',
      question: { q: 'Why must an ammeter go in series?', options: ['The current has to flow through it to be measured', 'So it gets the full voltage', 'Because it has a very high resistance', 'To protect the fuse'], correct: 0, why: 'An ammeter counts the charge flowing [[through]] it. Its resistance is almost 0 Ω, so putting it [[across]] a part would make a short!' },
    },
    {
      id: 'ohmmeter', kind: '3d', title: 'Measure resistance',
      text: 'An [[ohmmeter]] sends its own tiny current through the part. If the circuit is powered, the reading is garbage (or the meter gets damaged). Rule: [[power OFF]] first.',
      how: 'The probes are already on the lamp. Click the supply\'s <b>green power button</b> to switch it off.',
      scene: {
        camera: CAM,
        setup(g, s) {
          s.ps = g.supply({ pos: [-3.4, 0, -1.2], V: 12 });
          s.lamp = g.slot({ pos: [1.6, 0, -1.2], content: LAMP, locked: true });
          s.m = g.meter({ pos: [3.4, 0, 1.6], mode: 'Ω', modes: ['Ω'], rotY: -0.3 });
          g.wire(s.ps.T('+'), s.lamp.T('a'), { locked: true });
          g.wire(s.lamp.T('b'), s.ps.T('-'), { locked: true });
          g.wire(s.m.T('red'), s.lamp.T('a'), { locked: true });
          g.wire(s.m.T('com'), s.lamp.T('b'), { locked: true });
        },
        allowWiring: false, noWiringMsg: 'No wiring needed. Switch the power off!',
        on: { ohmLive: g => g.say('⚠️ The meter says [[LIVE!]] It can\'t measure resistance while the circuit is powered.', { mood: 'shock' }) },
      },
      tasks: [{ text: 'Power off, then read the resistance', done: (g, s) => !s.ps.on && Math.abs(s.m.value - 50) < 5 }],
      success: '50 Ω: that\'s the lamp\'s resistance.',
      question: { q: 'Before measuring resistance with an ohmmeter, you must…', options: ['Turn the circuit\'s power off', 'Connect it in series', 'Set it to the amps range', 'Short the part first'], correct: 0, why: 'The ohmmeter supplies its own small voltage. Outside power gives wrong readings and can damage it.' },
    },
  ],
};
