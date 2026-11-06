// figures.js - every circuit drawing used by Labs 6-9, redrawn as clean SVG from the lab sheets' figures.
// Topology, labels and values follow the handouts. Tags (ga, gb, gc) mark the parts a figure can highlight.
import { svg, wire, dot, node, text, res, rres, cap, battery, acsrc, sw, led, ground, meter, arrow, flow, probe } from './svg.js';

const k = v => `${v} kΩ`;

/* ------------------------------------------------------------------ Lab 6 */

// Figure 1 of the sheet: the worked example (3.3 k, 4.7 k, 6.8 k), not the kit circuit.
export function l6Example(stage = 0) {
  let b = battery(50, 50, 190, { val: '12 V' });
  b += wire([[50, 50], [210, 50]]) + wire([[50, 190], [410, 190]]);
  if (stage === 0) {
    b += res(210, 50, 210, 190, { name: 'R_1', val: k(3.3), t: 'gb' });
    b += wire([[210, 50], [260, 50]]) + res(260, 50, 380, 50, { name: 'R_2', val: k(4.7), t: 'ga' }) + wire([[380, 50], [410, 50]]);
    b += res(410, 50, 410, 190, { name: 'R_3', val: k(6.8), t: 'ga' });
    b += dot(210, 50) + dot(210, 190);
  } else if (stage === 1) {
    b += res(210, 50, 210, 190, { name: 'R_1', val: k(3.3), t: 'gb' });
    b += wire([[210, 50], [410, 50]]) + res(410, 50, 410, 190, { name: 'R_a', val: k(11.5), t: 'gb' });
    b += dot(210, 50) + dot(210, 190);
  } else {
    b += wire([[210, 50], [300, 50]]) + wire([[210, 190], [50, 190]]);
    b += res(300, 50, 300, 190, { name: 'R_T', val: '≈ 2.564 kΩ' });
  }
  return svg(480, 230, b, ['Figure 1: example combination circuit', 'Figure 2: R2 and R3 replaced by Ra', 'Figure 3: total resistance'][stage]);
}

// Figure 4: Part 1 circuit. stage 0 = as built, 1 = R2,3 merged, 2 = RT.
export function l6Part1(stage = 0, o = {}) {
  let b = battery(50, 50, 210, { val: '12 V' });
  if (stage < 2) {
    b += res(50, 50, 200, 50, { name: 'R_1', val: k(2.2), t: 'ga' }) + wire([[200, 50], [260, 50]], 'ga');
    b += res(50, 210, 230, 210, { name: 'R_4', val: k(10), side: 'b', t: 'ga' }) + wire([[230, 210], [260, 210]]);
  }
  if (stage === 0) {
    b += res(260, 50, 260, 210, { name: 'R_2', val: k(4.7), t: 'gb' });
    b += wire([[260, 50], [420, 50]]) + wire([[260, 210], [420, 210]]);
    b += res(420, 50, 420, 210, { name: 'R_3', val: k(5.6), t: 'gb' });
    b += dot(260, 50) + dot(260, 210);
    if (o.arrows) b += arrow(232, 50, 'r', 'I_T') + arrow(260, 96, 'd', 'I_{R2}') + arrow(420, 96, 'd', 'I_{R3}');
    if (o.flow) b += flow([[50, 50], [260, 50], [260, 210], [50, 210]]) + flow([[260, 50], [420, 50], [420, 210], [260, 210]], 'thin');
  } else if (stage === 1) {
    b += res(260, 50, 260, 210, { name: 'R_{2,3}', val: '= R₂ ∥ R₃', t: 'gb' });
  } else {
    b += wire([[50, 50], [260, 50]]) + wire([[50, 210], [260, 210]]);
    b += res(260, 50, 260, 210, { name: 'R_T', val: '= R₁ + R₂,₃ + R₄' });
  }
  return svg(520, 260, b, 'Figure 4: Part 1 combination circuit');
}

// Figure 5: Part 2 circuit.
export function l6Part2(stage = 0, o = {}) {
  let b = battery(50, 40, 250, { val: '12 V' });
  b += wire([[50, 40], [410, 40]]) + wire([[50, 250], [410, 250]]);
  if (stage === 0) {
    b += res(230, 40, 230, 145, { name: 'R_1', val: k(2.2), t: 'ga' }) + res(230, 145, 230, 250, { name: 'R_2', val: k(4.7), t: 'ga' });
    b += res(410, 40, 410, 145, { name: 'R_3', val: k(5.6), t: 'gb' }) + res(410, 145, 410, 250, { name: 'R_4', val: k(10), t: 'gb' });
    b += dot(230, 40) + dot(230, 250);
    if (o.arrows) b += arrow(140, 40, 'r', 'I_T') + arrow(230, 66, 'd', 'I_{R1,2}') + arrow(410, 66, 'd', 'I_{R3,4}');
    if (o.flow) b += flow([[50, 40], [230, 40], [230, 250], [50, 250]]) + flow([[230, 40], [410, 40], [410, 250], [230, 250]], 'thin');
  } else if (stage === 1) {
    b += res(230, 40, 230, 250, { name: 'R_{1,2}', val: '= R₁ + R₂', t: 'ga' }) + res(410, 40, 410, 250, { name: 'R_{3,4}', val: '= R₃ + R₄', t: 'gb' });
    b += dot(230, 40) + dot(230, 250);
  } else {
    b += res(230, 40, 230, 250, { name: 'R_T', val: '= R₁,₂ ∥ R₃,₄' });
  }
  return svg(520, 290, b, 'Figure 5: Part 2 combination circuit');
}

/* -------------------------------------------- DMM hook-ups (explanations) */

export function dmmVolt() {
  let b = battery(50, 60, 200, { val: '12 V' });
  b += wire([[50, 60], [140, 60]]) + res(140, 60, 280, 60, { name: 'R', val: '' }) + wire([[280, 60], [330, 60], [330, 200], [50, 200]]);
  b += meter(210, 150, 'V');
  b += probe([[196, 172], [196, 186], [150, 186], [150, 60]], '+') + probe([[224, 172], [224, 186], [270, 186], [270, 60]], '-');
  b += dot(150, 60) + dot(270, 60);
  return svg(380, 240, b, 'Voltmeter connected across a resistor');
}
export function dmmAmp() {
  let b = battery(50, 60, 200, { val: '12 V' });
  b += wire([[50, 60], [110, 60]]) + wire([[180, 60], [210, 60]]) + res(210, 60, 330, 60, { name: 'R', val: '' }) + wire([[330, 60], [360, 60], [360, 200], [50, 200]]);
  b += meter(145, 130, 'A') + probe([[110, 60], [131, 60], [131, 152]], '+') + probe([[180, 60], [159, 60], [159, 152]], '-');
  b += text(145, 228, 'circuit opened here; the meter closes the gap', 'cap');
  return svg(400, 240, b, 'Ammeter connected in series');
}
export function dmmOhm() {
  let b = res(110, 70, 270, 70, { name: 'R', val: 'power disconnected' });
  b += meter(190, 160, 'Ω') + probe([[176, 182], [176, 196], [110, 196], [110, 70]], '+') + probe([[204, 182], [204, 196], [270, 196], [270, 70]], '-');
  return svg(380, 230, b, 'Ohmmeter across a resistor with power removed');
}

/* ------------------------------------------------------------------ Lab 7 */

// Figure 1 of the sheet: wye (left) and delta (right) between nodes A, B, C.
export function l7WyeDelta() {
  let b = '';
  // wye
  b += node(120, 30, 'A', 0, -10, 'middle') + rres(120, 30, 120, 130) + dot(120, 130);
  b += rres(120, 130, 40, 215) + rres(120, 130, 200, 215);
  b += node(40, 215, 'B', -6, 18, 'end') + node(200, 215, 'C', 6, 18, 'start');
  b += text(134, 84, 'R_3', 'lb', 'start') + text(58, 166, 'R_1', 'lb', 'end') + text(182, 166, 'R_2', 'lb', 'start');
  b += text(120, 252, 'Wye (Y)', 'cap');
  // delta
  b += node(390, 30, 'A', 0, -10, 'middle') + node(310, 215, 'B', -6, 18, 'end') + node(470, 215, 'C', 6, 18, 'start');
  b += rres(390, 30, 310, 215, 'ga') + rres(390, 30, 470, 215, 'gc') + rres(310, 215, 470, 215, 'gb');
  b += text(334, 116, 'R_a', 'lb', 'end') + text(446, 116, 'R_c', 'lb', 'start') + text(390, 240, 'R_b', 'lb');
  b += text(390, 262, 'Delta (Δ)', 'cap');
  return svg(520, 272, b, 'Wye and delta networks between nodes A, B and C');
}

// Figure 3 of the sheet: the bridge, with XMM1 across R6 (+ on D, − on E).
export function l7Bridge(o = {}) {
  const r6 = o.r6 || k(2.2);
  let b = battery(60, 50, 270, { val: '12 V' });
  b += res(60, 50, 220, 50, { name: 'R_1', val: '220 Ω' }) + wire([[220, 50], [400, 50]]);
  b += res(220, 50, 220, 160, { name: 'R_3', val: '470 Ω', side: 'a', t: 'ga' });
  b += res(400, 50, 400, 160, { name: 'R_5', val: k(4.7), t: 'ga' });
  b += res(220, 160, 400, 160, { name: 'R_2', val: '100 Ω', side: 'b', t: 'ga gc' });
  b += res(220, 160, 220, 270, { name: 'R_4', val: k(1), side: 'a' });
  b += res(400, 160, 400, 270, { name: 'R_6', val: r6, t: o.r6hl ? 'gb' : '' });
  b += res(60, 270, 220, 270, { name: 'R_7', val: k(1), side: 'b' }) + wire([[220, 270], [400, 270]]);
  b += node(60, 50, 'A', -10, -8) + node(220, 50, 'B', 0, -12, 'middle') + node(220, 160, 'C', -12, -8) + node(400, 160, 'D', 12, 22, 'start');
  b += node(220, 270, 'E', 0, 26, 'middle') + node(60, 270, 'F', -14, 6) + ground(60, 270);
  if (o.meter !== false) {
    b += meter(530, 96, 'V', 'XMM1');
    b += probe([[516, 118], [516, 160], [400, 160]], '+') + probe([[544, 118], [544, 300], [400, 300], [400, 270]], '-');
  }
  return svg(590, 320, b, 'Figure 3: bridge circuit with the multimeter across R6');
}

// The delta B-C-D replaced by its wye (star point N). Used in Part 3.
export function l7Wye() {
  let b = battery(50, 60, 260, { val: '12 V' });
  b += res(50, 60, 190, 60, { name: 'R_1', val: '220 Ω' });
  b += res(190, 60, 330, 60, { name: 'R_B', val: 'arm at B', t: 'ga' }) + wire([[330, 60], [470, 60]]);
  b += res(330, 60, 330, 150, { name: 'R_C', val: 'arm at C', side: 'a', t: 'ga' }) + res(330, 150, 330, 260, { name: 'R_4', val: k(1), side: 'a' });
  b += res(470, 60, 470, 150, { name: 'R_D', val: 'arm at D', t: 'ga' }) + res(470, 150, 470, 260, { name: 'R_6', val: k(2.2) });
  b += res(50, 260, 190, 260, { name: 'R_7', val: k(1), side: 'b' }) + wire([[190, 260], [470, 260]]);
  b += node(50, 60, 'A', -10, -8) + node(190, 60, 'B', 0, -14, 'middle') + node(330, 60, 'N', 0, -14, 'middle');
  b += node(330, 150, 'C', -12, -6) + node(470, 150, 'D', 12, -6, 'start') + node(330, 260, 'E', 0, 26, 'middle') + node(50, 260, 'F', -14, 6);
  return svg(560, 300, b, 'Bridge after converting delta B-C-D into a wye');
}

/* ------------------------------------------------------------------ Lab 8 */

// Lab 8 Figure 1: the ohmmeter test.
export function l8OhmTest() {
  let b = '';
  b += wire([[40, 110], [90, 110]]) + cap(90, 110, 150, 110, { name: 'C', polar: true }) + wire([[150, 110], [200, 110], [200, 170], [40, 170], [40, 110]]);
  b += text(120, 205, '1. Short the leads to discharge', 'cap');
  b += meter(370, 50, 'Ω', 'Ohmmeter');
  b += cap(320, 150, 420, 150, { name: 'C', polar: true });
  b += probe([[356, 72], [356, 92], [300, 92], [300, 150], [320, 150]], '+') + probe([[384, 72], [384, 92], [440, 92], [440, 150], [420, 150]], '-');
  b += text(370, 205, '2. Meter + to capacitor +', 'cap');
  return svg(490, 220, b, 'Two steps of the ohmmeter test');
}

// Lab 8 Figure 2 (variant: 'one' = C1 only, 'series' = C1 over C2, 'parallel' = C1 beside C2).
export function l8Circuit(o = {}) {
  const v = o.variant || 'one';
  const s1 = !!o.s1, s2 = !!o.s2;
  const cx = 360, cx2 = v === 'parallel' ? 430 : cx;
  const s2a = cx2, s2b = cx2 + 100, r2x = s2b + 30;
  let b = battery(50, 60, 280, { val: '12 V' });
  b += sw(50, 60, 140, { name: 'S_1', closed: s1, id: 's1' });
  b += res(140, 60, 240, 60, { name: 'R_1', val: k(1) });
  b += led(240, 60, 335, 60, { name: 'LED_1', dir: 'r', id: 'led1' }) + wire([[335, 60], [cx2, 60]]);
  if (v === 'series') {
    b += cap(cx, 60, cx, 170, { name: 'C_1', val: '100 µF', polar: true }) + cap(cx, 170, cx, 280, { name: 'C_2', val: '47 µF', polar: true });
  } else {
    b += cap(cx, 60, cx, 280, { name: 'C_1', val: '100 µF', polar: true, side: v === 'parallel' ? 'a' : 'b' });
    if (v === 'parallel') b += cap(cx2, 60, cx2, 280, { name: 'C_2', val: '47 µF', polar: true }) + dot(cx, 60) + dot(cx, 280);
  }
  b += dot(cx2, 60) + dot(cx2, 280);
  b += sw(s2a, 60, s2b, { name: 'S_2', closed: s2, id: 's2' }) + wire([[s2b, 60], [r2x, 60]]);
  b += res(r2x, 60, r2x, 165, { name: 'R_2', val: k(1) });
  b += led(r2x, 165, r2x, 265, { name: 'LED_2', dir: 'd', id: 'led2' }) + wire([[r2x, 265], [r2x, 280]]);
  b += wire([[50, 280], [r2x, 280]]);
  return svg(r2x + 80, 312, b, 'Figure 2: LED and switch RC circuit');
}

/* ------------------------------------------------------------------ Lab 9 */

// Lab 9 Figure 2: series RC on the function generator, CH1 on the source, CH2 on the capacitor.
export function l9Circuit() {
  let b = acsrc(70, 80, 250, { val: 'function gen.' });
  b += res(70, 80, 270, 80, { name: 'R', val: k(1) }) + cap(270, 80, 270, 250, { name: 'C', val: '0.1 µF' });
  b += wire([[70, 250], [270, 250]]) + ground(170, 250) + dot(70, 80) + dot(270, 80) + dot(170, 250);
  b += `<rect class="mtr" x="340" y="16" width="130" height="66" rx="8"/><text class="lv" x="405" y="10" text-anchor="middle">Oscilloscope</text>`;
  b += `<circle class="term ch1" cx="340" cy="38" r="4.5"/><circle class="term ch2" cx="340" cy="62" r="4.5"/>`;
  b += text(352, 42, 'CH1', 'il ch1', 'start') + text(352, 66, 'CH2', 'il ch2', 'start');
  b += `<path class="probe ch1" d="M70,80 L70,30 L310,30 L310,38 L340,38"/><path class="probe ch2" d="M270,80 L270,62 L340,62"/>`;
  b += text(430, 52, '∿', 'mtr-l', 'middle');
  return svg(500, 290, b, 'Figure 2: series RC circuit with the oscilloscope');
}
