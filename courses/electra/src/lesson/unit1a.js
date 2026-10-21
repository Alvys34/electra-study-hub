// unit1a.js - Unit 1A "Quantities & Units" lesson: a study sheet to READ, then interactive steps to DO.
// [[term]] = highlighted key term.
import { FIG } from './visuals.js';
import { sci, op, m, e, grp, unit, worked, pairs, jumps, facts, prefixes, powerCards, sub, balance } from './mathfmt.js';

const across = (g, m, t1, t2) => (g.joined(m.T('red'), t1) && g.joined(m.T('com'), t2)) || (g.joined(m.T('red'), t2) && g.joined(m.T('com'), t1));
const CAM = { pos: [0, 6.0, 7.2], target: [0, 0.35, 0.1] };

export const LESSON_1A = {
  id: 'unit1a',
  code: '1A',
  title: 'Quantities & Units',
  color: '#38bdf8',
  minutesRead: 8,
  doneLead: 'You sorted passive and active parts, matched SI units, mastered scientific and engineering notations, converted prefixes, and counted significant digits. Here\'s your recap:',

  // ================================================================== READ
  sheet: [
    {
      title: 'Passive vs active components',
      lead: 'A circuit can only amplify a signal with an active part. Resistors, capacitors and inductors never do.',
      body: `Electronic components fall into two families based on how they handle energy:
        <ul><li>[[Passive components]] only consume, absorb or store energy from the circuit they're connected to. They never produce energy and [[cannot amplify]] the power of a signal (though a [[transformer]] or resonant circuit can step up voltage or current).</li>
        <li>[[Active components]] rely on an external DC power source to inject power into a circuit and [[can amplify]] signal power: [[transistors]], [[triode vacuum tubes]] (valves), and [[tunnel diodes]].</li></ul>
        <div class="ls-spacer"></div>The three classic two-terminal passive load components are:
        <ul><li>[[Resistor]] (letter symbol <b>R</b>, unit [[ohm]] <b>Ω</b>): opposes current flow. Built from a carbon-composition resistance core, insulation coating, colour bands and wire leads.</li>
        <li>[[Capacitor]] (letter symbol <b>C</b>, unit [[farad]] <b>F</b>): stores electric charge between conductive foil plates separated by a dielectric such as mica, or as a polarized tantalum electrolytic capacitor.</li>
        <li>[[Inductor]] (letter symbol <b>L</b>, unit [[henry]] <b>H</b>): a coil of wire whose [[inductance]] opposes the rise and fall of current through it.</li></ul>`,
      fig: FIG.passiveActive,
      key: 'Passive parts (R, C, L, transformers) only absorb or store energy; active parts (transistors, tubes, tunnel diodes) need a power source and can amplify.',
      exam: 'A resistor, capacitor or inductor is always a [[passive component]]. A transistor is an [[active component]].',
      check: {
        q: 'A [[transistor]] is an example of…',
        options: ['An active component', 'A passive component', 'A unit of resistance', 'A metric prefix'],
        correct: 0,
        why: 'Transistors need a DC source and can amplify signal power, so they are [[active components]]. Resistors, capacitors and inductors are passive.',
      },
    },
    {
      title: 'SI fundamental and supplementary units',
      lead: 'Every meter reading and formula in this course is built on these base units.',
      body: `[[SI]] stands for <i>Système International d'Unités</i> (International System of Units): [[7 fundamental units]] plus [[2 supplementary units]].
        ${facts([
          ['Length', '[[meter (m)]]'],
          ['Mass', '[[kilogram (kg)]]'],
          ['Time', '[[second (s)]]'],
          ['Electric current', '[[ampere (A)]]'],
          ['Temperature', '[[kelvin (K)]]'],
          ['Amount of substance', '[[mole (mol)]]'],
          ['Intensity of light', '[[candela (cd)]]'],
          ['Plane angle', '[[radian (rad)]] · supplementary'],
          ['Solid angle', '[[steradian (sr)]] · supplementary'],
        ])}`,
      exam: 'Of all the electrical units, only the [[ampere (A)]] is one of the 7 fundamental SI units. Volt, ohm, coulomb and watt are derived units.',
      check: {
        q: 'Which electrical unit is one of the 7 fundamental SI units?',
        options: ['Ampere (A)', 'Volt (V)', 'Ohm (Ω)', 'Watt (W)'],
        correct: 0,
        why: '[[Ampere]] is fundamental. Volt, ohm and watt are derived from the base units.',
      },
    },
    {
      title: 'Important electrical quantities and units',
      lead: 'Formulas use the letter. Meters show the unit. Mixing those up is a classic exam trap.',
      body: `Every circuit quantity has a letter symbol (used in formulas) and an SI unit.
        ${facts([
          ['Current · I', '[[ampere]] (A)'],
          ['Charge · Q', '[[coulomb]] (C)'],
          ['Voltage · V', '[[volt]] (V)'],
          ['Power · P', '[[watt]] (W)'],
          ['Energy · W', '[[joule]] (J)'],
          ['Resistance · R', '[[ohm]] (Ω)'],
          ['Reactance · X', '[[ohm]] (Ω)'],
          ['Impedance · Z', '[[ohm]] (Ω)'],
          ['Conductance · G', '[[siemens]] (S)'],
          ['Frequency · f', '[[hertz]] (Hz)'],
          ['Capacitance · C', '[[farad]] (F)'],
          ['Inductance · L', '[[henry]] (H)'],
        ])}`,
      key: 'Resistance (R), reactance (X) and impedance (Z) all share the unit [[ohm (Ω)]]. Conductance (G) is the inverse of resistance and is measured in [[siemens (S)]].',
      check: {
        q: '[[Resistance]], [[reactance]] and [[impedance]] are all measured in…',
        options: ['ohms (Ω)', 'siemens (S)', 'farads (F)', 'henrys (H)'],
        correct: 0,
        why: 'R, X and Z share the [[ohm]]. Conductance, the inverse of resistance, is in siemens.',
      },
    },
    {
      title: 'Scientific notation',
      lead: 'Circuit values jump from millions of ohms to millionths of an amp. Scientific notation keeps those zeros honest.',
      body: `[[Scientific notation]] writes a number as a [[mantissa]] (from 1 up to, but not including, 10 — <b>exactly one non-zero digit left of the decimal</b>) times a [[base]] of 10 raised to an integer [[exponent]].
        <ul><li>Move the decimal <b>left</b> (numbers ≥ 1) → [[positive exponent]].</li>
        <li>Move the decimal <b>right</b> (numbers &lt; 1) → [[negative exponent]].</li></ul>
        ${worked('Positive exponent · decimal moved left', [
          { k: 'Number', eq: `6,380,000 ${unit('m')}` },
          { k: 'One digit in front', eq: m('6.380000') },
          { k: 'Count the jumps', eq: 'Decimal moved left 6 places', bridge: 'Left means a positive exponent. The places you moved are the exponent.' },
          { k: 'Scientific notation', eq: sci('6.38', 6, 'm') },
        ])}
        ${pairs('More numbers ≥ 1', [
          { from: '5,630', to: sci('5.63', 3), bridge: 'Decimal moved left 3 places → exponent +3.' },
          { from: '24,680', to: sci('2.468', 4) },
          { from: '47,000,000', to: sci('4.7', 7) },
          { from: sci('6.03', 7), to: '60,300,000', k: 'Back to a plain number' },
        ])}
        ${worked('Negative exponent · decimal moved right', [
          { k: 'Number', eq: m('0.00725') },
          { k: 'One digit in front', eq: m('7.25') },
          { k: 'Count the jumps', eq: 'Decimal moved right 3 places', bridge: 'Right means a negative exponent.' },
          { k: 'Scientific notation', eq: sci('7.25', -3) },
        ])}
        ${pairs('More numbers < 1', [
          { from: '0.000 000 000 053 m', to: sci('5.3', -11, 'm'), k: 'Hydrogen atom radius', bridge: 'Decimal moved right 11 places → exponent −11.' },
          { from: sci('5.3', -4), to: '0.00053', k: 'Back to a plain number' },
          { from: '0.000027', to: sci('2.7', -5) },
          { from: '0.605', to: sci('6.05', -1) },
        ])}
        <p>Powers of ten to keep in your pocket:</p>
        ${powerCards([
          { exp: 7, value: '10,000,000' },
          { exp: 3, value: '1,000' },
          { exp: 0, value: '1' },
          { exp: -3, value: '0.001' },
          { exp: -6, value: '0.000001' },
        ])}`,
      key: 'Scientific notation = [[one non-zero digit]] before the decimal point. Numbers ≥ 1 have a positive exponent; numbers < 1 have a negative exponent.',
      check: {
        q: 'What is 0.00725 in scientific notation?',
        options: [sci('7.25', -3), sci('7.25', 3), sci('725', -6), sci('0.725', -2)],
        correct: 0,
        why: 'The decimal moved right 3 places, so the exponent is −3, and one non-zero digit sits in front: 7.25.',
      },
    },
    {
      title: 'Engineering notation',
      lead: 'Engineering notation lines the exponent up with the prefix printed on a meter (k, M, m, µ).',
      body: `[[Engineering notation]] is scientific notation with one extra rule: the [[exponent]] must be a [[multiple of 3]], and the [[mantissa]] has <b>1 to 3 digits</b> left of the decimal (1 to 999). Each of those powers matches an [[SI metric prefix]].
        <p>The only exponents you snap to:</p>
        ${jumps()}
        ${pairs('Already on a multiple of 3', [
          { from: '0.0000045', to: sci('4.5', -6), bridge: '−6 is a multiple of 3, and 4.5 is between 1 and 999.' },
          { from: '0.00789', to: sci('7.89', -3) },
          { from: '47,000,000', to: sci('47', 6), bridge: 'Scientific notation would be 4.7 × 10⁷. Engineering keeps 47 so the exponent can be 6.' },
          { from: '0.000027', to: sci('27', -6) },
        ])}
        ${worked('0.00056 · scientific, then engineering', [
          { k: 'Scientific notation', eq: sci('5.6', -4), bridge: 'One digit in front. The exponent −4 is allowed here, but it is not a multiple of 3.' },
          { k: 'Next multiple of 3, going down', eq: e(-6) },
          { k: 'Balance the mantissa', eq: `${m('5.6')} ${op('→')} ${m('560')}`, bridge: balance(-4, -6, '5.6', '560') },
          { k: 'Engineering notation', eq: sci('560', -6) },
        ])}`,
      fig: FIG.sciVsEng,
      exam: `For 0.00056: [[scientific notation]] is ${sci('5.6', -4)} (1 digit in front); [[engineering notation]] is ${sci('560', -6)} (exponent is a multiple of 3).`,
      check: {
        q: 'How is 0.00056 written in engineering notation?',
        options: [sci('560', -6), sci('5.6', -4), sci('56', -5), sci('5.6', 4)],
        correct: 0,
        why: '−6 is a multiple of 3 and 560 sits between 1 and 999. 5.6 × 10⁻⁴ is scientific notation, not engineering.',
      },
    },
    {
      title: 'Operations with powers of 10',
      lead: 'Adding currents or dividing voltages in this form is most of the arithmetic in later units.',
      body: `When you are done, snap the result onto a multiple of 3 if the question asks for engineering notation.
        ${jumps()}
        ${sub('Addition and subtraction')}
        <p>Give both numbers the <b>same power of 10</b>, then add or subtract the mantissas.</p>
        ${worked('Addition · match to 10²', [
          { k: 'Problem', eq: `${grp(`(${sci(4, 2)})`)} ${op('+')} ${grp(`(${sci(8, 3)})`)}` },
          { k: 'Match exponents to 10²', eq: `${grp(`(${sci(4, 2)})`)} ${op('+')} ${grp(`(${sci(80, 2)})`)}`, bridge: balance(3, 2, '8', '80') },
          { k: 'Grouped operation', eq: `${grp(`(${m(4)} ${op('+')} ${m(80)})`)} ${op('×')} ${e(2)}` },
          { k: 'Result', eq: sci(84, 2) },
          { k: 'Engineering form', eq: sci('8.4', 3), bridge: balance(2, 3, '84', '8.4') },
        ])}
        ${worked('Addition · match to 10⁵', [
          { k: 'Problem', eq: `${grp(`(${sci('1.6', 5)})`)} ${op('+')} ${grp(`(${sci('0.9', 6)})`)}` },
          { k: 'Match exponents to 10⁵', eq: `${grp(`(${sci('1.6', 5)})`)} ${op('+')} ${grp(`(${sci(9, 5)})`)}`, bridge: balance(6, 5, '0.9', '9') },
          { k: 'Grouped operation', eq: `${grp(`(${m('1.6')} ${op('+')} ${m(9)})`)} ${op('×')} ${e(5)}` },
          { k: 'Result', eq: sci('10.6', 5) },
          { k: 'Engineering form', eq: sci('1.06', 6), bridge: balance(5, 6, '10.6', '1.06') },
        ])}
        ${worked('Subtraction with mismatched exponents', [
          { k: 'Problem', eq: `${grp(`(${sci(25, -6)})`)} ${op('−')} ${grp(`(${sci(68, -5)})`)}` },
          { k: 'Match exponents to 10⁻⁶', eq: `${grp(`(${sci(25, -6)})`)} ${op('−')} ${grp(`(${sci(680, -6)})`)}`, bridge: balance(-5, -6, '68', '680') },
          { k: 'Grouped operation', eq: `${grp(`(${m(25)} ${op('−')} ${m(680)})`)} ${op('×')} ${e(-6)}` },
          { k: 'Result', eq: sci('−655', -6), bridge: '−6 is already a multiple of 3, and 655 is between 1 and 999, so this is engineering notation.' },
        ])}
        ${worked('Subtraction · match to 10⁻¹²', [
          { k: 'Problem', eq: `${grp(`(${sci(75, -11)})`)} ${op('−')} ${grp(`(${sci(25, -12)})`)}` },
          { k: 'Match exponents to 10⁻¹²', eq: `${grp(`(${sci(750, -12)})`)} ${op('−')} ${grp(`(${sci(25, -12)})`)}`, bridge: balance(-11, -12, '75', '750') },
          { k: 'Grouped operation', eq: `${grp(`(${m(750)} ${op('−')} ${m(25)})`)} ${op('×')} ${e(-12)}` },
          { k: 'Result', eq: sci(725, -12), bridge: '−12 is a multiple of 3, so this is already engineering notation.' },
        ])}
        ${sub('Multiplication')}
        <p>Multiply the mantissas. [[Add the exponents]].</p>
        ${worked('Multiply', [
          { k: 'Problem', eq: `${grp(`(${sci(3, 4)})`)} ${op('×')} ${grp(`(${sci(6, -3)})`)}` },
          { k: 'Multiply fronts, add exponents', eq: `${grp(`(${m(3)} ${op('×')} ${m(6)})`)} ${op('×')} <span class="exponent">10⁴⁺⁽⁻³⁾</span>` },
          { k: 'Result', eq: sci(18, 1) },
          { k: 'Engineering form', eq: sci(180, 0), bridge: balance(1, 0, '18', '180') + ' Exponent 0 is a multiple of 3.' },
        ])}
        ${worked('Multiply · exponents already land on a multiple of 3', [
          { k: 'Problem', eq: `${grp(`(${sci(5, 12)})`)} ${op('×')} ${grp(`(${sci(3, -6)})`)}` },
          { k: 'Multiply fronts, add exponents', eq: `${grp(`(${m(5)} ${op('×')} ${m(3)})`)} ${op('×')} <span class="exponent">10¹²⁺⁽⁻⁶⁾</span>` },
          { k: 'Result', eq: sci(15, 6), bridge: '12 + (−6) = 6, which is already a multiple of 3.' },
        ])}
        ${sub('Division')}
        <p>Divide the mantissas. [[Subtract the exponents]] (top minus bottom).</p>
        ${worked('Divide', [
          { k: 'Problem', eq: `${grp(`(${sci(100, 12)})`)} ${op('÷')} ${grp(`(${sci(4, 6)})`)}` },
          { k: 'Divide fronts, subtract exponents', eq: `${grp(`(${m(100)} ${op('÷')} ${m(4)})`)} ${op('×')} <span class="exponent">10¹²⁻⁶</span>` },
          { k: 'Result', eq: sci(25, 6), bridge: '12 − 6 = 6, already a multiple of 3.' },
        ])}
        ${worked('Divide by a negative exponent', [
          { k: 'Problem', eq: `${grp(`(${sci(50, 8)})`)} ${op('÷')} ${grp(`(${sci(2, -2)})`)}` },
          { k: 'Divide fronts, subtract exponents', eq: `${grp(`(${m(50)} ${op('÷')} ${m(2)})`)} ${op('×')} <span class="exponent">10⁸⁻⁽⁻²⁾</span>`, bridge: 'Subtracting a negative exponent adds it: 8 − (−2) = 10.' },
          { k: 'Result', eq: sci(25, 10) },
          { k: 'Engineering form', eq: sci(250, 9), bridge: balance(10, 9, '25', '250') },
        ])}`,
      key: 'Add/subtract → match exponents first. Multiply → [[add exponents]]. Divide → [[subtract exponents]] (watch double negatives!).',
      check: {
        q: `What is ${grp(`(${sci(12, 3)})`)} ${op('×')} ${grp(`(${sci(3, -6)})`)}?`,
        options: [sci(36, -3), sci(36, -9), sci(4, -3), sci(15, -3)],
        correct: 0,
        why: 'Multiply the mantissas (12 × 3 = 36) and add the exponents (3 + (−6) = −3).',
      },
    },
    {
      title: 'Metric prefixes, conversions & arithmetic',
      lead: 'Meters speak in prefixes. The quantity does not change — only the decimal point and the name do.',
      body: `Preferred engineering prefixes step by 1,000, which is the same 3-step jump as the exponent ladder.
        ${jumps([-15, -12, -9, -6, -3, 0, 3, 6, 9, 12, 15])}
        ${prefixes([
          { sym: 'P', name: 'peta', exp: 15 },
          { sym: 'T', name: 'tera', exp: 12 },
          { sym: 'G', name: 'giga', exp: 9 },
          { sym: 'M', name: 'mega', exp: 6 },
          { sym: 'k', name: 'kilo', exp: 3 },
          { sym: 'm', name: 'milli', exp: -3 },
          { sym: 'µ', name: 'micro', exp: -6 },
          { sym: 'n', name: 'nano', exp: -9 },
          { sym: 'p', name: 'pico', exp: -12 },
          { sym: 'f', name: 'femto', exp: -15 },
        ])}
        ${sub('Larger unit → smaller unit')}
        <p>The decimal moves <b>right</b>. A smaller unit needs a [[larger number]].</p>
        ${worked('0.47 MΩ → kΩ', [
          { k: 'Problem', eq: `${m('0.47')} ${unit('MΩ')}` },
          { k: 'Exponents', eq: `${unit('mega')} ${e(6)} ${op('→')} ${unit('kilo')} ${e(3)}` },
          { k: 'Move the decimal', eq: `${m('0.47')} ${op('→')} ${m('470')}`, bridge: balance(6, 3, '0.47', '470') },
          { k: 'Result', eq: `${m('470')} ${unit('kΩ')}` },
        ])}
        ${sub('Smaller unit → larger unit')}
        <p>The decimal moves <b>left</b>. A larger unit needs a [[smaller number]].</p>
        ${worked('200 mV → V', [
          { k: 'Problem', eq: `${m('200')} ${unit('mV')}` },
          { k: 'Exponents', eq: `${unit('milli')} ${e(-3)} ${op('→')} ${unit('volt')} ${e(0)}` },
          { k: 'Move the decimal', eq: `${m('200')} ${op('→')} ${m('0.2')}`, bridge: balance(-3, 0, '200', '0.2') },
          { k: 'Result', eq: `${m('0.2')} ${unit('V')}` },
        ])}
        ${worked('10,000 pF → µF', [
          { k: 'Problem', eq: `${m('10,000')} ${unit('pF')}` },
          { k: 'Exponents', eq: `${unit('pico')} ${e(-12)} ${op('→')} ${unit('micro')} ${e(-6)}` },
          { k: 'Move the decimal', eq: `${m('10,000')} ${op('→')} ${m('0.01')}`, bridge: balance(-12, -6, '10,000', '0.01') },
          { k: 'Result', eq: `${m('0.01')} ${unit('µF')}` },
        ])}
        ${worked('2700 MW → GW', [
          { k: 'Problem', eq: `${m('2700')} ${unit('MW')}` },
          { k: 'Exponents', eq: `${unit('mega')} ${e(6)} ${op('→')} ${unit('giga')} ${e(9)}` },
          { k: 'Move the decimal', eq: `${m('2700')} ${op('→')} ${m('2.7')}`, bridge: balance(6, 9, '2700', '2.7') },
          { k: 'Result', eq: `${m('2.7')} ${unit('GW')}` },
        ])}
        ${sub('Adding with mixed prefixes')}
        <p>Convert to the [[same prefix]] first, then add.</p>
        ${worked('10,000 Ω + 22 kΩ', [
          { k: 'Problem', eq: `${m('10,000')} ${unit('Ω')} ${op('+')} ${m('22')} ${unit('kΩ')}` },
          { k: 'Match the prefix', eq: `${m('10,000')} ${unit('Ω')} ${op('=')} ${m('10')} ${unit('kΩ')}`, bridge: balance(0, 3, '10,000', '10') },
          { k: 'Add', eq: `${m('10')} ${op('+')} ${m('22')} ${unit('kΩ')}` },
          { k: 'Result', eq: `${m('32')} ${unit('kΩ')} ${op('=')} ${m('32,000')} ${unit('Ω')}` },
        ])}
        ${worked('200 µA + 1.0 mA', [
          { k: 'Problem', eq: `${m('200')} ${unit('µA')} ${op('+')} ${m('1.0')} ${unit('mA')}` },
          { k: 'Match to microamps', eq: `${m('1.0')} ${unit('mA')} ${op('=')} ${m('1,000')} ${unit('µA')}`, bridge: balance(-3, -6, '1.0', '1,000') },
          { k: 'Add', eq: `${m('200')} ${op('+')} ${m('1,000')} ${unit('µA')}` },
          { k: 'Result', eq: `${m('1,200')} ${unit('µA')} ${op('=')} ${m('1.2')} ${unit('mA')}`, bridge: 'Slide 23 prints 12,000 µA. That is a typo. 200 + 1,000 = 1,200 µA.' },
        ])}`,
      fig: FIG.prefixLadder,
      exam: 'Smaller unit → bigger number (0.47 MΩ = 470 kΩ). Bigger unit → smaller number (2700 MW = 2.7 GW, 200 mV = 0.2 V).',
      check: {
        q: '0.47 MΩ equals how many kilohms?',
        options: ['470 kΩ', '0.47 kΩ', '47 kΩ', '4.7 kΩ'],
        correct: 0,
        why: 'Mega (10⁶) to kilo (10³) is 3 exponent steps down, so the decimal moves right 3 places: 0.47 → 470.',
      },
    },
    {
      title: 'Significant digits and rounding',
      lead: 'A reading is only as precise as the digits that were actually measured.',
      body: `[[Significant digits]] (significant figures, SD) show how precisely a value was measured.
        ${facts([
          ['Non-zero digits', 'Always count · 1.22 is 3 SD, 9456 is 4, 8 is 1, 8.2 is 2'],
          ['Leading zeros', 'Never count · 0.005 is 1 SD, 0.00000506 is 3 SD'],
          ['Sandwiched zeros', 'Always count · 2005 is 4 SD, 3.06 is 3, 900.0035 is 7'],
          ['Trailing zeros after a decimal', 'Always count · 4.00 is 3 SD, 300.000 is 6'],
        ])}
        <p>The exponent in scientific notation is <b>not</b> a significant digit. A whole number with no decimal, like 8200, is ambiguous (2, 3 or 4 SD). Write it in scientific notation to say which you mean.</p>
        ${pairs('Same number, different precision', [
          { from: '8,200 (ambiguous)', to: `${sci('8.200', 3)} · 4 SD` },
          { from: '8,200 (ambiguous)', to: `${sci('8.20', 3)} · 3 SD` },
          { from: '8,200 (ambiguous)', to: `${sci('8.2', 3)} · 2 SD` },
          { from: sci('3.45', 3), to: '3 SD — the exponent does not count' },
          { from: sci('2.000', 23), to: '4 SD' },
          { from: sci('1.5600', 2), to: '5 SD' },
        ])}
        ${sub('Rounding to 3 significant figures')}
        <p>Look at the digit immediately to the right of the 3rd significant digit. [[≥ 5, round up]]. [[&lt; 5, leave it]].</p>
        ${pairs('Round to 3 SD', [
          { from: '8.7257', to: m('8.73'), bridge: 'The 4th digit is 5, so round up.' },
          { from: '125.699', to: m('126'), bridge: 'The 4th digit is 6, so round up.' },
          { from: '3.435555', to: m('3.44'), bridge: 'The 4th digit is 5, so round up.' },
          { from: '3.425', to: m('3.43'), bridge: 'The 4th digit is 5, so round up.' },
          { from: '3.4123', to: m('3.41'), bridge: 'The 4th digit is 2, which is less than 5, so leave it.' },
        ])}`,
      key: 'Leading zeros never count (0.00000506 has 3 SD). Sandwiched zeros and trailing zeros after a decimal point always count.',
      check: {
        q: 'How many significant digits are in 0.00000506?',
        options: ['3', '8', '6', '2'],
        correct: 0,
        why: 'Leading zeros never count. The significant digits are 5, 0 and 6.',
      },
    },
  ],

  // ================================================================== DO
  steps: [
    {
      id: 'passive-active', kind: 'visual', title: 'Passive vs active',
      text: '[[Passive components]] only absorb or store energy from the circuit and can never amplify power. [[Active components]] rely on a DC source and can [[amplify]] a signal.',
      how: 'Click a component card, then click the box (<b>Passive</b> or <b>Active</b>) where it belongs.',
      visual: 'passiveVsActive',
      tasks: [{ text: 'Sort all 6 electronic components' }],
      success: 'All sorted! [[Resistors]], [[capacitors]], [[inductors]] and [[transformers]] are passive; [[transistors]], [[tubes]] and [[tunnel diodes]] are active.',
      question: {
        q: 'A [[resistor]] is an example of…',
        options: ['A passive component', 'An active component', 'An electrical circuit', 'A signal amplifier'],
        correct: 0,
        why: 'Resistors only consume energy (turning it into heat) and cannot amplify power, so they are [[passive components]].',
      },
    },
    {
      id: 'si-units', kind: 'visual', title: 'Electrical quantities and SI units',
      text: 'Every circuit quantity has a letter symbol and a standard [[SI unit]]. Out of all the electrical units, only the [[ampere (A)]] is one of the 7 fundamental SI base units.',
      how: 'Click a <b>quantity</b> on the left, then click its matching <b>unit</b> on the right.',
      visual: 'unitMatch1a',
      tasks: [{ text: 'Match all 6 quantities to their SI units' }],
      success: 'Matched! Remember: [[R]], [[X]] and [[Z]] are all in [[ohms (Ω)]], while [[conductance (G)]] is in [[siemens (S)]].',
      question: {
        q: 'The fundamental SI unit of [[electrical current]] is the…',
        options: ['Ampere (A)', 'Volt (V)', 'Ohm (Ω)', 'Coulomb (C)'],
        correct: 0,
        why: '[[Ampere]] is one of the 7 fundamental SI units (m, kg, s, A, K, mol, cd). Volt, ohm and coulomb are derived units.',
      },
    },
    {
      id: 'notation-machine', kind: 'visual', title: 'Scientific vs engineering notation',
      text: '[[Scientific notation]] keeps [[one non-zero digit]] before the decimal point. [[Engineering notation]] keeps [[1 to 3 digits]] in front so the exponent is always a [[multiple of 3]] that matches a metric prefix.',
      how: 'Click at least two preset numbers (or type your own) to compare both notations side by side.',
      visual: 'notationMachine',
      tasks: [{ text: 'Compare at least two numbers in the notation machine' }],
      success: 'Notice how [[engineering notation]] always snaps the exponent to a multiple of 3 (… −6, −3, 3, 6 …).',
      question: {
        q: 'In [[engineering notation]], how is the number [[0.00056]] written?',
        options: ['560 × 10⁻⁶', '5.6 × 10⁻⁴', '56 × 10⁻⁵', '5.6 × 10⁴'],
        correct: 0,
        why: '[[5.6 × 10⁻⁴]] is scientific notation (one digit in front). [[560 × 10⁻⁶]] is engineering notation because the exponent [[−6]] is a multiple of 3 and 560 is between 1 and 999.',
      },
    },
    {
      id: 'powers-of-ten', kind: 'visual', title: 'Multiplying and dividing powers of 10',
      text: 'To [[multiply]] numbers in scientific or engineering notation, multiply the front numbers and [[add the exponents]]. To [[divide]], divide the front numbers and [[subtract the exponents]] (top minus bottom).',
      how: 'Pick the front number and the power of 10 for both slide problems below.',
      visual: 'powerMath1a',
      tasks: [{ text: 'Solve both power-of-10 operations' }],
      success: 'Spot on! Subtracting a negative exponent adds it: 8 − (−2) = [[10]].',
      question: {
        q: 'What is (100 × 10¹²) ÷ (4 × 10⁶)?',
        options: ['25 × 10⁶', '25 × 10¹⁸', '25 × 10²', '400 × 10⁶'],
        correct: 0,
        why: 'Divide the front numbers (100 ÷ 4 = [[25]]) and subtract the exponents (12 − 6 = [[6]]) to get [[25 × 10⁶]].',
      },
    },
    {
      id: 'prefix-slider', kind: 'visual', title: 'The metric prefix ladder',
      text: 'Engineering prefixes jump by [[× 1000]] (three decimal places) at each step: [[G]] (10⁹), [[M]] (10⁶), [[k]] (10³), base, [[m]] (10⁻³), [[µ]] (10⁻⁶), [[n]] (10⁻⁹), [[p]] (10⁻¹²).',
      how: 'Click a prefix button so the number lands between <b>1 and 999</b>, then click <b>Next number</b> and solve a second one.',
      visual: 'prefixSlider',
      tasks: [{ text: 'Put 2 numbers into the 1–999 prefix sweet spot' }],
      success: 'The quantity itself never changes — only the [[prefix]] and decimal point move.',
      question: {
        q: 'The metric prefix [[nano (n)]] means 10⁻⁹. What does [[pico (p)]] mean?',
        options: ['10⁻¹²', '10⁻⁶', '10⁻³', '10⁻¹⁵'],
        correct: 0,
        why: 'Stepping down by 10³ each time: [[milli]] = 10⁻³, [[micro]] = 10⁻⁶, [[nano]] = 10⁻⁹, [[pico]] = 10⁻¹², [[femto]] = 10⁻¹⁵.',
      },
    },
    {
      id: 'bench-prefix', kind: '3d', title: 'Prefixes on a real meter',
      text: 'Bench multimeters use [[metric prefixes]] automatically so you don\'t have to count zeros. Here\'s a [[4,700 Ω]] resistor on the bench — let\'s measure it with the [[ohmmeter]] in kilohms.',
      how: 'Click the meter\'s <b>red jack</b> and wire it to one glowing resistor post, then wire the <b>black COM jack</b> to the other post.',
      scene: {
        camera: CAM,
        setup(g, s) {
          s.res = g.slot({ pos: [-0.8, 0, -0.4], content: { type: 'resistor', R: 4700, tol: 5 }, locked: true, label: '4,700 Ω' });
          s.m = g.meter({ pos: [2.4, 0, 1.0], mode: 'Ω', modes: ['Ω'], rotY: -0.25 });
        },
        highlight(g, s) {
          const red = g.joined(s.m.T('red'), s.res.T('a')) || g.joined(s.m.T('red'), s.res.T('b'));
          const com = g.joined(s.m.T('com'), s.res.T('a')) || g.joined(s.m.T('com'), s.res.T('b'));
          if (g.pending) return [s.res.T('a'), s.res.T('b')];
          return [!red && s.m.T('red'), !com && s.m.T('com')].filter(Boolean);
        },
      },
      tasks: [
        { text: 'Clip the ohmmeter probes across the 4,700 Ω resistor', done: (g, s) => across(g, s.m, s.res.T('a'), s.res.T('b')) && Math.abs(s.m.value - 4700) < 50 },
      ],
      success: 'Look at the meter display: [[4.70 kΩ]]! Because [[kilo (k)]] means 10³, 4.70 kΩ is the exact same resistance as 4,700 Ω.',
      question: {
        q: 'The quantity [[200 mV]] on a meter is the same as…',
        options: ['0.2 V', '0.000 200 V', '20 mV', '2 V'],
        correct: 0,
        why: '[[milli (m)]] means 10⁻³ (÷ 1,000). Moving from mV to a larger unit (V) shifts the decimal 3 places left: 200 mV = [[0.2 V]].',
      },
    },
    {
      id: 'convert-units', kind: '3d', title: 'Milliamps on the 3D bench & prefix conversion',
      text: 'Going to a [[smaller unit]] makes the number [[larger]] (move the decimal right, like `0.24 A = 240 mA`). Going to a [[larger unit]] makes the number [[smaller]] (move the decimal left, like `2700 MW = 2.7 GW`). Flip the bench switch to watch the [[ammeter]] read in milliamps!',
      how: 'Click the <b>switch lever</b> on the 3D bench to close the loop and read the current in <b>mA</b> on the green meter.',
      scene: {
        camera: CAM,
        allowWiring: false,
        setup(g, s) {
          s.ps = g.supply({ pos: [-3.2, 0, 0], V: 12, on: true, locked: true });
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
        { text: 'Flip the switch closed so the ammeter reads 240 mA (= 0.24 A)', done: (g, s) => s.sw.closed && s.m.value > 0.2 },
      ],
      success: 'The meter reads [[240.0 mA]], which is the exact same current as [[0.24 A]]!',
      question: {
        type: 'number',
        q: 'Convert Slide 21\'s example: [[0.47 MΩ]] equals how many [[kΩ]]?',
        answer: 470,
        unit: 'kΩ',
        fixedUnit: true,
        tol: 0.001,
        chips: ['0.00047', '47', '470', '4700'],
        why: 'Going from [[mega (10⁶)]] down to [[kilo (10³)]] is a 1,000× smaller unit, so the number becomes 1,000× larger: 0.47 × 1,000 = [[470 kΩ]].',
      },
    },
    {
      id: 'metric-arithmetic', kind: 'question', title: 'Metric arithmetic',
      text: 'To add or subtract quantities with metric prefixes, convert them to the [[same prefix]] first — like turning `10,000 Ω + 22 kΩ` into `10 kΩ + 22 kΩ = 32 kΩ`.',
      question: {
        type: 'number',
        q: 'Solve Slide 23\'s example in microamps: [[200 µA + 1.0 mA]] = how many [[µA]]?',
        answer: 1200,
        unit: 'µA',
        fixedUnit: true,
        tol: 0.001,
        chips: ['201', '1200', '2200', '12000'],
        why: 'Convert [[1.0 mA]] to microamps first: 1.0 mA = [[1,000 µA]]. Then 200 µA + 1,000 µA = [[1,200 µA]] (= 1.2 mA). (Slide 23 has a famous typo saying 12,000 µA — don\'t fall for it!)',
      },
    },
    {
      id: 'sig-figs', kind: 'visual', title: 'Significant digits and rounding',
      text: '[[Non-zero digits]], [[sandwiched zeros]], and [[trailing zeros after a decimal]] always count; [[leading zeros]] never count. To round to 3 significant figures, check the [[4th digit]]: if it is [[≥ 5]], round up.',
      how: 'Click the right <b>significant digit (SD) count</b> for each slide number below.',
      visual: 'sigFigLab',
      tasks: [{ text: 'Count the significant digits in all 4 slide numbers' }],
      success: 'Nailed all 4! Leading zeros are just placeholders — they never count as significant.',
      question: {
        type: 'number',
        q: 'Round Slide 26\'s first example, [[8.7257]], to [[3 significant figures]].',
        answer: 8.73,
        unit: '',
        fixedUnit: true,
        tol: 0.0005,
        chips: ['8.70', '8.72', '8.73', '8.80'],
        why: 'Keep the first three digits ([[8.72]]) and look at the 4th digit ([[5]]). Because it is 5 or more, round up to [[8.73]].',
      },
    },
  ],
};
