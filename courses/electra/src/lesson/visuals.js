// visuals.js - simple 2D diagrams (study sheet) and small 2D interactions (lesson steps).
import { eng, sig, sup, plain } from '../core/num.js';
import { sfx } from '../core/fx.js';
import { WIDGETS } from './widgets.js';
import { seriesSVG, parallelSVG, comboSVG, dividerSVG } from '../core/schematic.js';

// ---------- tiny SVG drawing kit ----------
const L = (x1, y1, x2, y2, c = 'w') => `<line class="${c}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`;
const P = (d, c = 'w') => `<path class="${c}" d="${d}"/>`;
const T = (x, y, t, c = 'lb', a = 'middle') => `<text class="${c}" x="${x}" y="${y}" text-anchor="${a}">${t}</text>`;
const dot = (x, y) => `<circle class="dot" cx="${x}" cy="${y}" r="4"/>`;
const svg = (w, h, inner, label) => `<svg class="fg" viewBox="0 0 ${w} ${h}" role="img" aria-label="${label}">${inner}</svg>`;

function battery(x, y1, y2, label = '') { // vertical, + on top
  const m = (y1 + y2) / 2;
  return L(x, y1, x, m - 8) + L(x, m + 8, x, y2) + L(x - 18, m - 8, x + 18, m - 8, 'c') + L(x - 10, m + 8, x + 10, m + 8, 'c thick') + T(x + 26, m - 10, '+', 'pl', 'start') + (label ? T(x - 26, m + 5, label, 'vl', 'end') : '');
}
function lamp(x, y, on = false) { // circle with X, centred
  return `<circle class="${on ? 'lamp on' : 'lamp'}" cx="${x}" cy="${y}" r="20"/>` + L(x - 14, y - 14, x + 14, y + 14, 'c') + L(x - 14, y + 14, x + 14, y - 14, 'c');
}
function fuseH(x1, x2, y) { const m = (x1 + x2) / 2; return L(x1, y, m - 26, y) + `<rect class="c-box" x="${m - 26}" y="${y - 10}" width="52" height="20" rx="4"/>` + L(m - 26, y, m + 26, y, 'c') + L(m + 26, y, x2, y); }
function switchH(x1, x2, y, open = true) { const m = (x1 + x2) / 2; return L(x1, y, m - 22, y) + dot(m - 22, y) + dot(m + 22, y) + L(m - 22, y, m + (open ? 16 : 22), y - (open ? 22 : 0), 'c') + L(m + 22, y, x2, y); }
function meter(x, y, letter) { return `<circle class="meter" cx="${x}" cy="${y}" r="17"/>` + T(x, y + 6, letter, 'ml'); }
function chip(x, y, text, color, anchor = 'middle') {
  const w = text.length * 7.6 + 16;
  const x0 = anchor === 'middle' ? x - w / 2 : anchor === 'end' ? x - w : x;
  return `<rect class="chip" x="${x0}" y="${y - 14}" width="${w}" height="21" rx="6" style="--c:${color}"/>` + T(x0 + w / 2, y + 1, text, 'chipt');
}

// ---------- study-sheet figures ----------
export const FIG = {
  // ---- Unit 1A figures ----
  passiveActive: () => {
    const resSym = L(20, 62, 40, 62) + P('M40,62 l5,-10 l10,20 l10,-20 l10,20 l10,-20 l10,20 l5,-10', 'c') + L(100, 62, 120, 62);
    const capSym = L(150, 62, 184, 62) + L(184, 44, 184, 80, 'c') + L(196, 44, 196, 80, 'c') + L(196, 62, 230, 62);
    const indSym = L(254, 62, 272, 62) + P('M272,62 a9,9 0 0,1 18,0 a9,9 0 0,1 18,0 a9,9 0 0,1 18,0 a9,9 0 0,1 18,0', 'c') + L(344, 62, 362, 62);
    const bjtSym = `<circle class="cell" cx="468" cy="64" r="28"/>` + L(425, 64, 455, 64) + L(455, 46, 455, 82, 'c') + L(455, 56, 481, 40, 'c') + L(455, 72, 481, 88, 'c') + P('M473,86 l8,2 l-3,-8', 'arrow');
    return svg(560, 210,
      `<rect class="cell" x="8" y="10" width="368" height="190" rx="14"/>` +
      chip(192, 30, 'PASSIVE · consumes or stores energy', '#38bdf8') +
      resSym + T(70, 102, 'Resistor (R)', 'ttl') + T(70, 120, 'Opposes I · Ω', 'cap small') +
      capSym + T(190, 102, 'Capacitor (C)', 'ttl') + T(190, 120, 'Stores Q · F', 'cap small') +
      indSym + T(308, 102, 'Inductor (L)', 'ttl') + T(308, 120, 'Opposes ΔI · H', 'cap small') +
      T(192, 154, '+ Transformer (steps V or I, never power)', 'cap small') +
      T(192, 180, '✘ Cannot amplify signal power', 'warn') +
      `<rect class="cell" x="386" y="10" width="166" height="190" rx="14"/>` +
      chip(469, 30, 'ACTIVE · amplifies', '#34d399') +
      bjtSym + T(469, 114, 'Transistor', 'ttl') + T(469, 134, 'Vacuum tube (valve)', 'cap small') + T(469, 152, 'Tunnel diode', 'cap small') +
      T(469, 180, '✔ Amplifies (uses DC)', 'cap'),
      'Passive components versus active components');
  },

  sciVsEng: () => svg(560, 205,
    `<rect class="cell" x="10" y="12" width="260" height="180" rx="14"/>` +
    chip(140, 34, 'SCIENTIFIC NOTATION', '#38bdf8') +
    T(140, 78, '0.00056  →  5.6 × 10⁻⁴', 'vl') +
    T(140, 108, 'Mantissa: 1 to <10', 'ttl') +
    T(140, 130, '(exactly ONE non-zero digit left of point)', 'cap small') +
    T(140, 154, 'Exponent: any integer (… −4, −1, 3, 7 …)', 'cap small') +
    T(140, 176, '6,380,000 m = 6.38 × 10⁶ m', 'cap') +
    `<rect class="cell" x="290" y="12" width="260" height="180" rx="14"/>` +
    chip(420, 34, 'ENGINEERING NOTATION', '#facc15') +
    T(420, 78, '0.00056  →  560 × 10⁻⁶', 'pl') +
    T(420, 108, 'Mantissa: 1 to <1000', 'ttl') +
    T(420, 130, '(1, 2 or 3 digits left of point)', 'cap small') +
    T(420, 154, 'Exponent: MULTIPLE OF 3 (matches prefix)', 'cap small') +
    T(420, 176, '560 × 10⁻⁶ A = 560 µA', 'cap'),
    'Scientific notation versus engineering notation'),

  prefixLadder: () => {
    const steps = [
      ['P', 'peta', '10¹⁵', '#f472b6'], ['T', 'tera', '10¹²', '#c084fc'], ['G', 'giga', '10⁹', '#818cf8'],
      ['M', 'mega', '10⁶', '#38bdf8'], ['k', 'kilo', '10³', '#22d3ee'], ['—', 'base', '10⁰', '#34d399'],
      ['m', 'milli', '10⁻³', '#a3e635'], ['µ', 'micro', '10⁻⁶', '#facc15'], ['n', 'nano', '10⁻⁹', '#fb923c'],
      ['p', 'pico', '10⁻¹²', '#f87171'], ['f', 'femto', '10⁻¹⁵', '#fb7185'],
    ];
    const boxes = steps.map(([sym, name, exp, col], i) => {
      const x = 10 + i * 49;
      return `<g transform="translate(${x},22)">
        <rect class="cell" x="0" y="0" width="45" height="92" rx="9" style="stroke:${col}"/>
        ${T(22.5, 28, sym, 'ttl')}
        ${T(22.5, 50, name, 'cap small')}
        ${T(22.5, 76, exp, 'vl')}
      </g>`;
    }).join('');
    return svg(560, 210,
      boxes +
      P('M120,142 L440,142 l-10,-6 m10,6 l-10,6', 'arrow') +
      T(280, 134, 'Larger → smaller unit: move decimal RIGHT (0.47 MΩ = 470 kΩ)', 'cap') +
      P('M440,178 L120,178 l10,-6 m-10,6 l10,6', 'arrow') +
      T(280, 198, 'Smaller → larger unit: move decimal LEFT (10,000 pF = 0.01 µF)', 'cap'),
      'Engineering metric prefixes from peta to femto');
  },

  // ---- Unit 1B figures ----
  colorChart1b: () => {
    const cols = [
      ['0', 'Black', '#18181b', '×1'], ['1', 'Brown', '#78350f', '×10'], ['2', 'Red', '#dc2626', '×10²'],
      ['3', 'Orange', '#f97316', '×10³'], ['4', 'Yellow', '#facc15', '×10⁴'], ['5', 'Green', '#16a34a', '×10⁵'],
      ['6', 'Blue', '#2563eb', '×10⁶'], ['7', 'Violet', '#7c3aed', '×10⁷'], ['8', 'Gray', '#6b7280', '—'],
      ['9', 'White', '#f8fafc', '—'], ['±5%', 'Gold', '#d4af37', '×0.1'], ['±10%', 'Silver', '#cbd5e1', '×0.01'],
    ];
    const items = cols.map(([d, n, hex, m], i) => {
      const x = 12 + (i % 6) * 90, y = 14 + Math.floor(i / 6) * 76;
      return `<g transform="translate(${x},${y})">
        <rect class="cell" x="0" y="0" width="84" height="66" rx="10"/>
        <rect x="8" y="8" width="68" height="14" rx="4" fill="${hex}" stroke="rgba(255,255,255,.3)"/>
        ${T(42, 38, `${n} (${d})`, 'cap small')}
        ${T(42, 55, m, 'vl')}
      </g>`;
    }).join('');
    return svg(560, 195, items + T(280, 184, '"Big Boys Race Our Young Girls But Violet Generally Wins" (0 → 9)', 'cap'), '4-band resistor color code chart');
  },

  varResistors: () => svg(560, 190,
    `<rect class="cell" x="10" y="12" width="172" height="166" rx="12"/>` +
    chip(96, 32, 'POTENTIOMETER', '#38bdf8') +
    L(28, 86, 52, 86) + P('M52,86 l6,-10 l12,20 l12,-20 l12,20 l12,-20 l12,20 l6,-10', 'c') + L(124, 86, 154, 86) +
    P('M90,124 L90,98 l-6,8 m6,-8 l6,8', 'arrow') +
    T(96, 146, '3 terminals (wiper)', 'ttl') + T(96, 164, 'Divides voltage', 'cap small') +
    `<rect class="cell" x="194" y="12" width="172" height="166" rx="12"/>` +
    chip(280, 32, 'RHEOSTAT', '#facc15') +
    L(214, 86, 238, 86) + P('M238,86 l6,-10 l12,20 l12,-20 l12,20 l12,-20 l12,20 l6,-10', 'c') + L(310, 86, 340, 86) +
    P('M248,112 L306,62 l-9,2 m9,-2 l-2,9', 'arrow') +
    T(280, 146, '2 terminals', 'ttl') + T(280, 164, 'Controls current', 'cap small') +
    `<rect class="cell" x="378" y="12" width="172" height="166" rx="12"/>` +
    chip(464, 32, 'SENSORS', '#34d399') +
    T(464, 72, '🌡️ Thermistor (NTC: T↑ R↓)', 'cap small') +
    T(464, 100, '☀️ Photocell (Light↑ R↓)', 'cap small') +
    T(464, 128, '🏋️ Strain Gauge (Force→ΔR)', 'cap small') +
    T(464, 158, 'Physical input → R', 'ttl'),
    'Potentiometer, rheostat, and resistive sensors'),

  wireFormula: () => svg(560, 185,
    `<rect class="cell" x="12" y="14" width="536" height="158" rx="14"/>` +
     `<ellipse cx="90" cy="86" rx="22" ry="38" fill="#b45309" stroke="#f59e0b" stroke-width="2.5"/>` +
    `<rect x="90" y="48" width="190" height="76" fill="#d97706" opacity="0.85"/>` +
    `<ellipse cx="280" cy="86" rx="22" ry="38" fill="#f59e0b" stroke="#fde68a" stroke-width="2.5"/>` +
    T(185, 36, 'Length l (feet)', 'vl') +
    T(280, 89, 'A = d²', 'ttl') +
    T(185, 148, '1 mil = 0.001 in · Area (CM) = (d in mils)²', 'cap small') +
    chip(430, 44, 'WIRE RESISTANCE', '#facc15') +
    T(430, 86, 'R = ρ × l / A', 'big') +
    T(430, 118, 'Copper ρ = 10.37 CM·Ω/ft', 'vl') +
    T(430, 144, 'Smaller AWG # = thicker wire = lower R', 'cap small'),
    'Wire resistance formula R = rho * l / A and circular mils'),

  // ---- Unit 1C figures ----
  coulombLaw: () => svg(560, 180,
    `<rect class="cell" x="12" y="12" width="260" height="156" rx="14"/>` +
    `<circle cx="88" cy="76" r="22" fill="#be123c"/>` + T(88, 82, '+', 'ttl') +
    `<circle cx="192" cy="76" r="22" fill="#be123c"/>` + T(192, 82, '+', 'ttl') +
    P('M58,76 l-24,0 l8,-6 m-8,6 l8,6', 'arrow') + P('M222,76 l24,0 l-8,-6 m8,6 l-8,6', 'arrow') +
    T(140, 128, 'Like charges REPEL', 'ttl') + T(140, 150, '1 C = 6.25 × 10¹⁸ electrons', 'cap small') +
    `<rect class="cell" x="288" y="12" width="260" height="156" rx="14"/>` +
    `<circle cx="358" cy="76" r="22" fill="#be123c"/>` + T(358, 82, '+', 'ttl') +
    `<circle cx="478" cy="76" r="22" fill="#1d4ed8"/>` + T(478, 82, '−', 'ttl') +
    P('M386,76 l24,0 l-8,-6 m8,6 l-8,6', 'arrow') + P('M450,76 l-24,0 l8,-6 m-8,6 l8,6', 'arrow') +
    T(418, 128, 'Unlike charges ATTRACT', 'ttl') + T(418, 150, 'F = k·Q₁·Q₂ / d²', 'vl'),
    'Coulomb law attraction and repulsion'),

  flowCompare: () => svg(560, 190,
    `<rect class="cell" x="10" y="12" width="262" height="166" rx="14"/>` +
    chip(141, 34, 'ELECTRON FLOW (− → +)', '#38bdf8') +
    battery(54, 60, 146) + L(54, 60, 220, 60) + L(220, 60, 220, 146) + L(220, 146, 54, 146) + lamp(220, 103, true) +
    P('M120,146 l30,0 l-8,-6 m8,6 l-8,6', 'arrow') +
    T(141, 168, 'Electrons leave − terminal', 'cap small') +
    `<rect class="cell" x="288" y="12" width="262" height="166" rx="14"/>` +
    chip(419, 34, 'CONVENTIONAL (+ → −)', '#facc15') +
    battery(332, 60, 146) + L(332, 60, 498, 60) + L(498, 60, 498, 146) + L(498, 146, 332, 146) + lamp(498, 103, true) +
    P('M398,60 l30,0 l-8,-6 m8,6 l-8,6', 'arrow') +
    T(419, 168, 'Conventional leaves + terminal', 'cap small'),
    'Electron flow versus conventional current'),

  // ---- Unit 2A figures ----
  basicCircuit: () => svg(560, 270,
    battery(70, 50, 220) + fuseH(70, 260, 50) + switchH(260, 420, 50, false) + L(420, 50, 490, 50) + L(490, 50, 490, 115) + lamp(490, 135, true) + L(490, 155, 490, 220) + L(490, 220, 70, 220) +
    chip(70, 250, 'SOURCE', '#f87171') + chip(165, 22, 'PROTECTION', '#fb923c') + chip(340, 22, 'CONTROL', '#60a5fa') + chip(490, 250, 'LOAD', '#facc15') + chip(280, 250, 'PATH (wires)', '#34d399'),
    'Basic circuit with source, protection, control, load and path'),

  openClosed: () => svg(560, 210,
    `<g>${battery(40, 40, 160)}${switchH(40, 190, 40, false)}${L(190, 40, 230, 40)}${L(230, 40, 230, 80)}${lamp(230, 100, true)}${L(230, 120, 230, 160)}${L(230, 160, 40, 160)}
      ${P('M150,152 l14,8 l-14,8', 'arrow')}${T(135, 195, 'CLOSED: current flows', 'cap')}</g>` +
    `<g transform="translate(300,0)">${battery(20, 40, 160)}${switchH(20, 170, 40, true)}${L(170, 40, 210, 40)}${L(210, 40, 210, 80)}${lamp(210, 100, false)}${L(210, 120, 210, 160)}${L(210, 160, 20, 160)}
      ${T(95, 85, 'I = 0', 'big')}${T(115, 195, 'OPEN: path broken', 'cap')}</g>`,
    'Closed circuit versus open circuit'),

  short: () => svg(560, 220,
    battery(70, 40, 180) + fuseH(70, 260, 40) + L(260, 40, 420, 40) + L(420, 40, 420, 90) + lamp(420, 110) + L(420, 130, 420, 180) + L(420, 180, 70, 180) +
    P('M420,62 C470,62 470,160 420,160', 'short') + T(478, 115, 'short!', 'warn', 'start') +
    P('M300,32 l16,8 l-16,8', 'arrow big') + P('M330,32 l16,8 l-16,8', 'arrow big') + T(165, 75, 'fuse melts → opens', 'cap') + T(250, 210, 'R ≈ 0  →  I = V ÷ R is huge', 'cap'),
    'Short circuit across the lamp'),

  switches: () => {
    const cell = (x, y, title, sub, inner) => `<g transform="translate(${x},${y})"><rect class="cell" x="0" y="0" width="160" height="120" rx="12"/>${inner}${T(80, 98, title, 'ttl')}${T(80, 114, sub, 'cap small')}</g>`;
    const spst = dot(40, 50) + dot(120, 50) + L(20, 50, 40, 50) + L(120, 50, 140, 50) + L(40, 50, 112, 26, 'c');
    const spdt = L(20, 50, 40, 50) + dot(40, 50) + dot(120, 28) + dot(120, 72) + L(120, 28, 140, 28) + L(120, 72, 140, 72) + L(40, 50, 116, 30, 'c');
    const dpst = dot(40, 34) + dot(120, 34) + dot(40, 70) + dot(120, 70) + L(40, 34, 112, 14, 'c') + L(40, 70, 112, 50, 'c') + `<line class="dash" x1="76" y1="24" x2="76" y2="60"/>`;
    const dpdt = dot(40, 30) + dot(118, 16) + dot(118, 44) + dot(40, 70) + dot(118, 56) + dot(118, 84) + L(40, 30, 114, 18, 'c') + L(40, 70, 114, 58, 'c') + `<line class="dash" x1="76" y1="24" x2="76" y2="64"/>`;
    const no = dot(50, 60) + dot(110, 60) + L(30, 60, 50, 60) + L(110, 60, 130, 60) + L(44, 40, 116, 40, 'c') + L(80, 40, 80, 20, 'c');
    const nc = dot(50, 46) + dot(110, 46) + L(30, 46, 50, 46) + L(110, 46, 130, 46) + L(44, 56, 116, 56, 'c') + L(80, 56, 80, 30, 'c');
    return svg(520, 270,
      cell(0, 0, 'SPST', '1 pole · 1 throw', spst) + cell(180, 0, 'SPDT', '1 pole · 2 throws', spdt) + cell(360, 0, 'DPST', '2 poles · 1 throw', dpst) +
      cell(0, 145, 'DPDT', '2 poles · 2 throws', dpdt) + cell(180, 145, 'NO push button', 'closes when pressed', no) + cell(360, 145, 'NC push button', 'opens when pressed', nc),
      'Switch types');
  },

  ground: () => svg(560, 200,
    `<g transform="translate(40,30)">${L(30, 0, 30, 40)}${L(6, 40, 54, 40, 'c')}${L(14, 50, 46, 50, 'c')}${L(22, 60, 38, 60, 'c')}${T(30, 95, 'earth ground', 'cap')}</g>` +
    `<g transform="translate(170,30)">${L(30, 0, 30, 40)}${L(6, 40, 54, 40, 'c')}${L(6, 40, 0, 56, 'c')}${L(30, 40, 24, 56, 'c')}${L(54, 40, 48, 56, 'c')}${T(30, 95, 'chassis ground', 'cap')}</g>` +
    `<g transform="translate(310,20)">${battery(30, 20, 130)}${L(30, 20, 180, 20)}${L(180, 20, 180, 55)}<rect class="c-box" x="168" y="55" width="24" height="40" rx="3"/>${L(180, 95, 180, 130)}${L(180, 130, 30, 130)}${L(105, 130, 105, 145)}${L(85, 145, 125, 145, 'c')}${L(92, 152, 118, 152, 'c')}${L(99, 159, 111, 159, 'c')}${T(140, 160, '0 V', 'big', 'start')}</g>`,
    'Ground symbols'),

  meters: () => svg(560, 240,
    battery(60, 40, 200, '12 V') + L(60, 40, 220, 40) + meter(250, 40, 'A') + L(267, 40, 420, 40) + L(420, 40, 420, 100) + lamp(420, 120, true) + L(420, 140, 420, 200) + L(420, 200, 60, 200) +
    L(420, 80, 500, 80) + L(420, 160, 500, 160) + L(500, 80, 500, 103) + meter(500, 120, 'V') + L(500, 137, 500, 160) +
    T(250, 80, 'ammeter: IN SERIES', 'cap') + T(550, 196, 'voltmeter: ACROSS', 'cap', 'end'),
    'Ammeter in series, voltmeter in parallel'),

  // ---- Unit 2B figures ----
  ohmTriFig: () => svg(560, 190,
    `<rect class="cell" x="12" y="10" width="240" height="170" rx="14"/>` +
    P('M132,26 L216,158 L48,158 Z', 'c') + L(90, 96, 174, 96, 'c') + L(132, 96, 132, 158, 'c') +
    T(132, 76, 'V', 'pl') + T(106, 138, 'I', 'vl') + T(158, 138, 'R', 'vl') +
    `<rect class="cell" x="268" y="10" width="280" height="170" rx="14"/>` +
    chip(408, 34, "OHM'S LAW THREE FORMS", '#38bdf8') +
    T(408, 74, 'I = V ÷ R   (Amperes)', 'vl') +
    T(408, 108, 'V = I × R   (Volts)', 'pl') +
    T(408, 142, 'R = V ÷ I   (Ohms)', 'ttl') +
    T(408, 166, 'Tip: V ÷ kΩ = mA  ·  mA × kΩ = V', 'cap small'),
    "Ohm's law triangle and three equations"),

  viGraphFig: () => svg(560, 190,
    `<rect class="cell" x="12" y="10" width="536" height="170" rx="14"/>` +
    L(60, 150, 260, 150, 'c') + L(60, 150, 60, 26, 'c') +
    L(60, 150, 230, 36, 'arrow') + L(60, 150, 245, 96, 'w') +
    T(160, 170, 'Voltage V (V) →', 'cap small') + T(36, 40, 'I (mA)', 'cap small') +
    T(192, 42, 'Smaller R (steeper)', 'pl') + T(210, 114, 'Larger R (flatter)', 'vl') +
    T(405, 62, 'Linear V–I Relationship', 'ttl') +
    T(405, 92, '• Fixed R → straight line through (0, 0)', 'cap small') +
    T(405, 116, '• Double V → I doubles (direct)', 'cap small') +
    T(405, 140, '• Double R → I halves (inverse)', 'cap small'),
    'Linear V-I graph for fixed resistors'),

  // ---- Unit 3A figures ----
  seriesChain: () => seriesSVG({
    Vs: 12,
    Rs: [
      { label: 'R₁', value: 1000, note: '2 V' },
      { label: 'R₂', value: 2000, note: '4 V' },
      { label: 'R₃', value: 3000, note: '6 V' },
    ],
  }),

  seriesSources: () => svg(560, 180,
    `<rect class="cell" x="10" y="12" width="262" height="156" rx="14"/>` +
    chip(141, 34, 'SERIES-AIDING (Same Way)', '#34d399') +
    T(141, 82, '[− 9 V +] → [− 9 V +]', 'vl') +
    T(141, 118, 'V_T = 9 V + 9 V = 18 V', 'pl') +
    T(141, 148, 'Voltages ADD together', 'cap small') +
    `<rect class="cell" x="288" y="12" width="262" height="156" rx="14"/>` +
    chip(419, 34, 'SERIES-OPPOSING (Reversed)', '#f87171') +
    T(419, 82, '[− 12 V +] ↔ [+ 3 V −]', 'warn') +
    T(419, 118, 'V_T = 12 V − 3 V = 9 V', 'pl') +
    T(419, 148, 'Reversed source SUBTRACTS', 'cap small'),
    'Series-aiding versus series-opposing voltage sources'),

  // ---- Unit 4A figures ----
  wattFormulas: () => svg(560, 185,
    `<rect class="cell" x="12" y="12" width="536" height="162" rx="14"/>` +
    chip(280, 34, "WATT'S LAW · THREE POWER FORMULAS", '#facc15') +
    T(110, 88, 'P = V × I', 'pl') + T(110, 116, 'Know V & I', 'cap small') + T(110, 142, 'I = P/V · V = P/I', 'vl') +
    T(280, 88, 'P = I² × R', 'pl') + T(280, 116, 'Know I & R (series)', 'cap small') + T(280, 142, 'I = √(P/R) · R = P/I²', 'vl') +
    T(450, 88, 'P = V² ÷ R', 'pl') + T(450, 116, 'Know V & R (parallel)', 'cap small') + T(450, 142, 'V = √(PR) · R = V²/P', 'vl'),
    "Watt's law power formulas"),

  resistorSizes: () => svg(560, 175,
    `<rect class="cell" x="12" y="10" width="536" height="155" rx="14"/>` +
    `<rect x="46" y="66" width="38" height="14" rx="5" fill="#d97706" stroke="#fde68a"/>` + T(65, 106, '¼ W (0.25 W)', 'cap small') +
    `<rect x="148" y="60" width="58" height="22" rx="6" fill="#d97706" stroke="#fde68a"/>` + T(177, 108, '½ W (0.5 W)', 'cap small') +
    `<rect x="276" y="52" width="86" height="32" rx="8" fill="#d97706" stroke="#fde68a"/>` + T(319, 110, '1 W', 'cap small') +
    `<rect x="420" y="42" width="110" height="46" rx="10" fill="#d97706" stroke="#fde68a"/>` + T(475, 112, '2 W', 'cap small') +
    T(280, 138, 'Bigger body = higher POWER RATING (W)', 'vl') +
    T(280, 156, 'Always pick P_rating > P_actual!', 'cap small'),
    'Resistor physical sizes versus wattage ratings'),

  // ---- Unit 4B figures ----
  energyBands: () => svg(560, 195,
    `<rect class="cell" x="10" y="10" width="172" height="175" rx="12"/>` +
    chip(96, 30, 'INSULATOR', '#94a3b8') +
    `<rect x="30" y="48" width="132" height="24" rx="5" fill="#1e293b" stroke="#38bdf8"/>` + T(96, 65, 'Conduction Band', 'cap small') +
    T(96, 102, '↕ HUGE Energy Gap', 'warn') +
    `<rect x="30" y="126" width="132" height="26" rx="5" fill="#334155" stroke="#facc15"/>` + T(96, 144, 'Valence Band (8 e⁻)', 'cap small') +
    `<rect class="cell" x="194" y="10" width="172" height="175" rx="12"/>` +
    chip(280, 30, 'SEMICONDUCTOR', '#38bdf8') +
    `<rect x="214" y="54" width="132" height="24" rx="5" fill="#1e293b" stroke="#38bdf8"/>` + T(280, 71, 'Conduction Band', 'cap small') +
    T(280, 102, '↕ Narrow Gap (Si, Ge)', 'vl') +
    `<rect x="214" y="118" width="132" height="26" rx="5" fill="#334155" stroke="#facc15"/>` + T(280, 136, 'Valence Band (4 e⁻)', 'cap small') +
    `<rect class="cell" x="378" y="10" width="172" height="175" rx="12"/>` +
    chip(464, 30, 'CONDUCTOR', '#facc15') +
    `<rect x="398" y="72" width="132" height="32" rx="5" fill="#1e293b" stroke="#38bdf8"/>` +
    `<rect x="398" y="92" width="132" height="32" rx="5" fill="rgba(250,204,21,.2)" stroke="#facc15"/>` +
    T(464, 92, 'Bands Overlap!', 'pl') + T(464, 150, '1 Valence e⁻ (Cu Z=29)', 'cap small'),
    'Energy bands for insulators, semiconductors, and conductors'),

  // ---- Unit 5 figures ----
  parallelBranches: () => parallelSVG({
    Vs: 12,
    Rs: [
      { label: 'R₁', value: 1000, note: '12 mA' },
      { label: 'R₂', value: 2000, note: '6 mA' },
      { label: 'R₃', value: 4000, note: '3 mA' },
    ],
  }),

  // ---- Unit 6 figures ----
  seriesParallelFig: () => comboSVG({
    Vs: 24,
    R1: { label: 'R₁', value: 400, note: 'series' },
    R2: { label: 'R₂', value: 600, note: 'branch' },
    R3: { label: 'R₃', value: 600, note: 'branch' },
  }),

  loadedDividerFig: () => dividerSVG({
    Vs: 12,
    R1: 3000,
    R2: 3000,
    RL: 3000,
    Vo: 4,
  }),
};

// ---------- 2D interactions for lesson steps ----------
// Each: (host, api) where api.done() completes the step's task, api.say(html) gives feedback.
// Drag-and-drop for every .v-sort widget. A drop replays the widget's own click flow
// (select the card, then click the bucket) so the grading logic stays in one place.
export function enableDragSort(host) {
  host.querySelectorAll('.v-pool .v-item').forEach(it => { it.draggable = true; });
  let dragged = null;
  const clearHover = () => host.querySelectorAll('.drop-hover').forEach(b => b.classList.remove('drop-hover'));
  host.addEventListener('dragstart', e => {
    const item = e.target.closest?.('.v-item');
    if (!item || item.classList.contains('placed') || !item.closest('.v-pool')) { e.preventDefault(); return; }
    dragged = item;
    item.click();
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', item.textContent);
    requestAnimationFrame(() => item.classList.add('dragging'));
  });
  host.addEventListener('dragover', e => {
    const bk = dragged && e.target.closest('.v-bk');
    if (!bk) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!bk.classList.contains('drop-hover')) { clearHover(); bk.classList.add('drop-hover'); }
  });
  host.addEventListener('dragleave', e => {
    const bk = e.target.closest('.v-bk');
    if (bk && !bk.contains(e.relatedTarget)) bk.classList.remove('drop-hover');
  });
  host.addEventListener('drop', e => {
    const bk = dragged && e.target.closest('.v-bk');
    if (!bk) return;
    e.preventDefault();
    clearHover();
    bk.click();
  });
  host.addEventListener('dragend', () => {
    dragged?.classList.remove('dragging');
    dragged = null;
    clearHover();
  });
}

export const VISUALS = {
  ...WIDGETS,

  // ---- Unit 1A visuals ----
  passiveVsActive(host, api) {
    const items = [
      ['Resistor (R)', 0],
      ['Transistor', 1],
      ['Capacitor (C)', 0],
      ['Triode vacuum tube', 1],
      ['Inductor (L)', 0],
      ['Tunnel diode', 1],
    ];
    let sel = null, left = items.length;
    host.innerHTML = `<div class="v-sort"><div class="v-pool">${items.map(([t], i) => `<button class="v-item" data-i="${i}">${t}</button>`).join('')}</div>
      <div class="v-buckets"><div class="v-bk" data-b="0"><b>🧊 Passive (consumes / stores)</b><div></div></div><div class="v-bk" data-b="1"><b>🚀 Active (amplifies / injects power)</b><div></div></div></div></div>`;
    host.querySelector('.v-pool').onclick = e => {
      const b = e.target.closest('.v-item'); if (!b || b.classList.contains('placed')) return;
      host.querySelectorAll('.v-item').forEach(x => x.classList.remove('sel')); b.classList.add('sel'); sel = b; sfx.tap();
    };
    host.querySelectorAll('.v-bk').forEach(bk => bk.onclick = () => {
      if (!sel) { api.say('Drag a component card into the box it belongs in.'); return; }
      const want = items[+sel.dataset.i][1];
      if (want === +bk.dataset.b) {
        sel.classList.remove('sel'); sel.classList.add('placed'); bk.querySelector('div').appendChild(sel); sel = null; sfx.tap();
        if (--left === 0) api.done(); else api.say('✔ Right! Keep going.');
      } else {
        api.say('Not that bucket — ask: can this part amplify a signal\'s power, or does it only absorb/store energy?');
        bk.classList.add('shake'); setTimeout(() => bk.classList.remove('shake'), 400); api.miss(); sfx.bad();
      }
    });
  },

  unitMatch1a(host, api) {
    const pairs = [
      ['Electric Current (I)', 'Ampere (A)'],
      ['Electric Charge (Q)', 'Coulomb (C)'],
      ['Resistance (R)', 'Ohm (Ω)'],
      ['Capacitance (C)', 'Farad (F)'],
      ['Inductance (L)', 'Henry (H)'],
      ['Conductance (G)', 'Siemens (S)'],
    ];
    const rightOrder = [2, 5, 0, 4, 1, 3];
    let selL = null, matched = 0;
    host.innerHTML = `<div class="v-match">
      <div class="v-mcol" id="vmL">${pairs.map(([q], i) => `<button class="v-item" data-i="${i}">${q}</button>`).join('')}</div>
      <div class="v-mcol" id="vmR">${rightOrder.map(i => `<button class="v-item" data-i="${i}">${pairs[i][1]}</button>`).join('')}</div>
    </div>`;
    host.querySelector('#vmL').onclick = e => {
      const b = e.target.closest('.v-item'); if (!b || b.classList.contains('placed')) return;
      host.querySelectorAll('#vmL .v-item').forEach(x => x.classList.remove('sel'));
      b.classList.add('sel'); selL = b; sfx.tap();
    };
    host.querySelector('#vmR').onclick = e => {
      const b = e.target.closest('.v-item'); if (!b || b.classList.contains('placed')) return;
      if (!selL) { api.say('Click a quantity on the left first, then click its unit on the right.'); return; }
      if (+selL.dataset.i === +b.dataset.i) {
        selL.classList.remove('sel'); selL.classList.add('placed'); b.classList.add('placed');
        selL = null; sfx.tap();
        if (++matched === pairs.length) api.done();
        else api.say(`✔ Matched! (${matched}/${pairs.length})`);
      } else {
        b.classList.add('shake'); setTimeout(() => b.classList.remove('shake'), 400);
        api.say('Not a match — check the symbol and try again.'); api.miss(); sfx.bad();
      }
    };
  },

  notationMachine(host, api) {
    const presets = ['0.00056', '6380000', '0.000027', '47000000', '0.00725'];
    const seen = new Set();
    host.innerHTML = `<div class="wg">
      <div class="chips" id="nmp">${presets.map((v, i) => `<button class="pchip ${i === 0 ? 'on' : ''}" data-v="${v}">${Number(v) >= 1000 ? Number(v).toLocaleString('en-US') : v}</button>`).join('')}</div>
      <label class="inp-l">Or type any number <input class="inp" id="nm" value="0.00056" inputmode="decimal"></label>
      <div class="cmp2"><div class="cmpc"><div class="k">Scientific</div><div class="v" id="ns"></div><div class="n">1 non-zero digit before point</div></div>
      <div class="cmpc eng"><div class="k">Engineering</div><div class="v" id="ne"></div><div class="n">exponent is a multiple of 3</div></div></div>
      <div class="wg-sub" id="nh"></div></div>`;
    const inp = host.querySelector('#nm');
    const upd = (fromUser = false) => {
      const x = parseFloat(inp.value.replace(/,/g, ''));
      if (!isFinite(x) || x === 0) { host.querySelector('#ns').textContent = '—'; host.querySelector('#ne').textContent = '—'; return; }
      const e = Math.floor(Math.log10(Math.abs(x)));
      const m = x / Math.pow(10, e);
      const e3 = Math.floor(e / 3) * 3, m3 = x / Math.pow(10, e3);
      host.querySelector('#ns').innerHTML = `${sig(m, 4)} × 10${sup(e)}`;
      host.querySelector('#ne').innerHTML = `${sig(m3, 4)} × 10${sup(e3)} <small>${eng(x, '', 4).replace(/^[-\d.]+\s*/, '') || '(no prefix)'}</small>`;
      host.querySelector('#nh').innerHTML = `Decimal hops ${Math.abs(e)} place${Math.abs(e) === 1 ? '' : 's'} ${e >= 0 ? 'left → positive exponent' : 'right → negative exponent'}.`;
      if (fromUser) {
        seen.add(sig(x, 4));
        if (seen.size >= 2) api.done();
        else api.say('Nice! Try one more number to compare.');
      }
    };
    host.querySelector('#nmp').onclick = e => {
      const b = e.target.closest('.pchip'); if (!b) return;
      host.querySelectorAll('#nmp .pchip').forEach(x => x.classList.toggle('on', x === b));
      inp.value = b.dataset.v; sfx.tap(); upd(true);
    };
    inp.addEventListener('input', () => upd(true));
    seen.add(sig(0.00056, 4));
    upd(false);
  },

  powerMath1a(host, api) {
    const probs = [
      {
        title: 'Multiply: (3 × 10⁴) × (6 × 10⁻³)',
        rule: 'Multiply the front numbers (3 × 6), and <b>add</b> the exponents (4 + (−3)).',
        mOpts: [9, 18, 2], mAns: 18,
        eOpts: [-12, 1, 7], eAns: 1,
      },
      {
        title: 'Divide: (50 × 10⁸) ÷ (2 × 10⁻²)',
        rule: 'Divide the front numbers (50 ÷ 2), and <b>subtract</b> the exponents (8 − (−2)).',
        mOpts: [25, 48, 100], mAns: 25,
        eOpts: [6, 10, -4], eAns: 10,
      },
    ];
    let idx = 0, pickM = null, pickE = null;
    const render = () => {
      const p = probs[idx];
      host.innerHTML = `<div class="wg">
        <div class="wg-sub">Problem ${idx + 1} of ${probs.length}</div>
        <div class="wg-big" style="font-size:clamp(22px,4vw,30px)">${p.title}</div>
        <div class="wg-sub">${p.rule}</div>
        <div class="cmp2">
          <div class="cmpc"><div class="k">1. Front number (mantissa)</div>
            <div class="chips" style="margin-top:8px" id="pmM">${p.mOpts.map(v => `<button class="pchip ${pickM === v ? 'on' : ''}" data-v="${v}">${v}</button>`).join('')}</div>
          </div>
          <div class="cmpc eng"><div class="k">2. Exponent of 10</div>
            <div class="chips" style="margin-top:8px" id="pmE">${p.eOpts.map(v => `<button class="pchip ${pickE === v ? 'on' : ''}" data-v="${v}">10${sup(v)}</button>`).join('')}</div>
          </div>
        </div>
        <div class="wg-read big" id="pmOut">${pickM !== null && pickE !== null ? `Result: <b>${pickM} × 10${sup(pickE)}</b>` : 'Pick both parts above.'}</div>
      </div>`;
      const check = () => {
        if (pickM === null || pickE === null) return;
        if (pickM === p.mAns && pickE === p.eAns) {
          host.querySelector('#pmOut').classList.add('ok');
          sfx.tap();
          if (idx === 0) {
            api.say('✔ 18 × 10¹! Now try the division problem.');
            setTimeout(() => { idx = 1; pickM = null; pickE = null; render(); }, 650);
          } else {
            api.done();
          }
        } else {
          api.say(pickM !== p.mAns ? 'Check the front numbers first.' : 'Careful with the exponent sign! Remember: 8 − (−2) = 8 + 2.');
          api.miss(); sfx.bad();
        }
      };
      host.querySelector('#pmM').onclick = e => { const b = e.target.closest('.pchip'); if (!b) return; pickM = +b.dataset.v; render(); check(); };
      host.querySelector('#pmE').onclick = e => { const b = e.target.closest('.pchip'); if (!b) return; pickE = +b.dataset.v; render(); check(); };
    };
    render();
  },

  prefixSlider(host, api) {
    const examples = [[4700, 'Ω'], [0.000047, 'F'], [2_400_000_000, 'Hz'], [0.0035, 'A'], [150000, 'W'], [0.00000000022, 'F']];
    let i = 0, cur = 3;
    const solved = new Set();
    const PFX = [['G', 9], ['M', 6], ['k', 3], ['', 0], ['m', -3], ['µ', -6], ['n', -9], ['p', -12]];
    host.innerHTML = `<div class="wg">
      <div class="wg-big"><span id="pv"></span></div>
      <div class="wg-sub" id="ps"></div>
      <div class="chips" id="pc">${PFX.map(([p, e], k) => `<button class="pchip" data-k="${k}">${p || 'base'}<small>10${sup(e)}</small></button>`).join('')}</div>
      <div class="row-c"><button class="btn ghost sm" id="pn">↻ Next number (1/${examples.length})</button></div></div>`;
    const render = () => {
      const [v, u] = examples[i]; const [p, e] = PFX[cur];
      const m = v / Math.pow(10, e);
      const good = Math.abs(m) >= 1 && Math.abs(m) < 1000 && cur !== 3;
      host.querySelector('#pv').innerHTML = `${Math.abs(m) >= 1e6 || Math.abs(m) < 1e-4 ? sig(m, 3).replace(/e\+?(-?\d+)/, (_, x) => ` × 10${sup(x)}`) : plain(m, 4)} <b>${p}${u}</b>`;
      host.querySelector('#pv').className = good ? 'ok' : '';
      host.querySelector('#ps').innerHTML = good ? '✔ Between 1 and 999 — that\'s the engineering sweet spot!' : 'Click a prefix so the number in front lands between 1 and 999.';
      host.querySelectorAll('.pchip').forEach((b, k) => b.classList.toggle('on', k === cur));
      if (good) {
        solved.add(i);
        host.querySelector('#pn').textContent = `↻ Next number (${Math.min(solved.size + 1, 2)}/2 solved)`;
        if (solved.size >= 2) api.done();
        else api.say('✔ Got the first one! Click "Next number" to convert one more.');
      }
    };
    host.querySelector('#pc').addEventListener('click', e => {
      const b = e.target.closest('.pchip'); if (!b) return;
      cur = +b.dataset.k;
      const [v] = examples[i]; const [, exp] = PFX[cur];
      const m = v / Math.pow(10, exp);
      const good = Math.abs(m) >= 1 && Math.abs(m) < 1000 && cur !== 3;
      if (good) sfx.tap(); else { sfx.bad(); api.miss(); }
      render();
    });
    host.querySelector('#pn').addEventListener('click', () => { i = (i + 1) % examples.length; cur = 3; sfx.tap(); render(); });
    render();
  },

  sigFigLab(host, api) {
    const items = [
      { raw: '0.005', parts: [['0.00', false], ['5', true]], ans: 1, rule: 'Leading zeros to the left of the first non-zero digit are <b>never</b> significant.' },
      { raw: '0.00000506', parts: [['0.00000', false], ['506', true]], ans: 3, rule: 'Leading zeros never count, but the sandwiched zero between 5 and 6 <b>is</b> significant.' },
      { raw: '2005', parts: [['2005', true]], ans: 4, rule: 'Zeros sandwiched between non-zero digits are <b>always</b> significant.' },
      { raw: '4.00', parts: [['4.00', true]], ans: 3, rule: 'Trailing zeros to the right of a decimal point are <b>always</b> significant.' },
    ];
    let idx = 0, revealed = false;
    const render = () => {
      const it = items[idx];
      const numHtml = revealed
        ? it.parts.map(([t, sig]) => `<span class="${sig ? 'ok' : 'dim-zero'}">${t}</span>`).join('')
        : it.raw;
      host.innerHTML = `<div class="wg">
        <div class="wg-sub">Card ${idx + 1} of ${items.length} · How many significant digits?</div>
        <div class="wg-big">${numHtml}</div>
        <div class="chips" id="sfBtns">${[1, 2, 3, 4, 6, 8].map(n => `<button class="pchip ${revealed && n === it.ans ? 'on' : ''}" data-n="${n}">${n} SD</button>`).join('')}</div>
        <div class="wg-read ${revealed ? 'ok' : ''}" id="sfRule">${revealed ? `✔ <b>${it.ans} SD</b> — ${it.rule}` : 'Count the significant digits and click an answer above.'}</div>
      </div>`;
      host.querySelector('#sfBtns').onclick = e => {
        const b = e.target.closest('.pchip'); if (!b || revealed) return;
        const n = +b.dataset.n;
        if (n === it.ans) {
          revealed = true; sfx.tap(); render();
          if (idx < items.length - 1) {
            setTimeout(() => { idx++; revealed = false; render(); }, 1100);
          } else {
            api.done();
          }
        } else {
          b.classList.add('shake'); setTimeout(() => b.classList.remove('shake'), 400);
          api.say('Check the zero rules: leading zeros never count; sandwiched zeros and trailing decimal zeros always count.');
          api.miss(); sfx.bad();
        }
      };
    };
    render();
  },

  // ---- Unit 1B visuals ----
  varResSort(host, api) {
    const items = [
      ['3 terminals — divides voltage (volume knob)', 0],
      ['2 terminals — wired in series to limit current', 1],
      ['NTC Thermistor: temperature ↑ → R ↓', 2],
      ['Photoconductive cell: light ↑ → R ↓', 2],
      ['Strain gauge: mechanical stretch → ΔR', 2],
    ];
    let sel = null, left = items.length;
    host.innerHTML = `<div class="v-sort"><div class="v-pool">${items.map(([t], i) => `<button class="v-item" data-i="${i}">${t}</button>`).join('')}</div>
      <div class="v-buckets" style="grid-template-columns:repeat(auto-fit,minmax(160px,1fr))">
        <div class="v-bk" data-b="0"><b>🎛️ Potentiometer</b><div></div></div>
        <div class="v-bk" data-b="1"><b>🎚️ Rheostat</b><div></div></div>
        <div class="v-bk" data-b="2"><b>🌡️ Resistive Sensor</b><div></div></div>
      </div></div>`;
    host.querySelector('.v-pool').onclick = e => {
      const b = e.target.closest('.v-item'); if (!b || b.classList.contains('placed')) return;
      host.querySelectorAll('.v-item').forEach(x => x.classList.remove('sel')); b.classList.add('sel'); sel = b; sfx.tap();
    };
    host.querySelectorAll('.v-bk').forEach(bk => bk.onclick = () => {
      if (!sel) { api.say('Click a description card first, then click the matching variable-resistor category.'); return; }
      if (items[+sel.dataset.i][1] === +bk.dataset.b) {
        sel.classList.remove('sel'); sel.classList.add('placed'); bk.querySelector('div').appendChild(sel); sel = null; sfx.tap();
        if (--left === 0) api.done(); else api.say('✔ Spot on!');
      } else {
        bk.classList.add('shake'); setTimeout(() => bk.classList.remove('shake'), 400);
        api.say('Check the terminals or physical stimulus: 3-terminal divider = Potentiometer, 2-terminal current control = Rheostat.');
        api.miss(); sfx.bad();
      }
    });
  },

  // ---- Unit 1C visuals ----
  cellSort1c(host, api) {
    const items = [
      ['Alkaline AA battery (use once)', 0],
      ['Lead-acid car battery (alternator recharges)', 1],
      ['Lithium-ion phone battery', 1],
      ['Carbon-zinc flashlight cell', 0],
      ['NiMH rechargeable pack', 1],
      ['Silver-oxide watch button cell', 0],
    ];
    let sel = null, left = items.length;
    host.innerHTML = `<div class="v-sort"><div class="v-pool">${items.map(([t], i) => `<button class="v-item" data-i="${i}">${t}</button>`).join('')}</div>
      <div class="v-buckets">
        <div class="v-bk" data-b="0"><b>🗑️ Primary Cell (Non-rechargeable)</b><div></div></div>
        <div class="v-bk" data-b="1"><b>🔋 Secondary Cell (Rechargeable)</b><div></div></div>
      </div></div>`;
    host.querySelector('.v-pool').onclick = e => {
      const b = e.target.closest('.v-item'); if (!b || b.classList.contains('placed')) return;
      host.querySelectorAll('.v-item').forEach(x => x.classList.remove('sel')); b.classList.add('sel'); sel = b; sfx.tap();
    };
    host.querySelectorAll('.v-bk').forEach(bk => bk.onclick = () => {
      if (!sel) { api.say('Click a battery card above first, then click Primary or Secondary.'); return; }
      if (items[+sel.dataset.i][1] === +bk.dataset.b) {
        sel.classList.remove('sel'); sel.classList.add('placed'); bk.querySelector('div').appendChild(sel); sel = null; sfx.tap();
        if (--left === 0) api.done(); else api.say('✔ Correct!');
      } else {
        bk.classList.add('shake'); setTimeout(() => bk.classList.remove('shake'), 400);
        api.say('Remember: Primary = one-way chemical reaction (cannot recharge); Secondary = reversible (rechargeable).');
        api.miss(); sfx.bad();
      }
    });
  },

  // ---- Unit 2A visuals ----
  switchLab(host, api) {
    const types = [
      { k: 'SPST', poles: 1, throws: 1 }, { k: 'SPDT', poles: 1, throws: 2 }, { k: 'DPST', poles: 2, throws: 1 }, { k: 'DPDT', poles: 2, throws: 2 },
    ];
    let cur = 0, pos = 0; const seen = new Set();
    host.innerHTML = `<div class="v-switch"><div class="v-tabs">${types.map((t, i) => `<button data-i="${i}">${t.k}</button>`).join('')}</div>
      <div class="v-stage"></div><div class="v-cap"></div></div>`;
    const draw = () => {
      const t = types[cur];
      host.querySelectorAll('.v-tabs button').forEach((b, i) => b.classList.toggle('on', i === cur));
      let s = '';
      for (let p = 0; p < t.poles; p++) {
        const y = 70 + p * 110;
        s += L(30, y, 110, y) + dot(110, y);
        const outs = t.throws === 1 ? [y] : [y - 35, y + 35];
        outs.forEach((oy, k) => { s += dot(250, oy) + L(250, oy, 330, oy) + `<circle class="lampmini ${pos === k ? 'on' : ''}" cx="350" cy="${oy}" r="12"/>`; });
        const target = t.throws === 1 ? (pos === 0 ? y : y - 40) : outs[pos];
        const reach = t.throws === 1 && pos !== 0 ? 225 : 250;
        s += `<line class="arm" x1="110" y1="${y}" x2="${reach}" y2="${target}"/>`;
        s += T(70, y - 12, `pole ${p + 1}`, 'cap small');
      }
      if (t.poles === 2) s += `<line class="dash" x1="180" y1="70" x2="180" y2="180"/>`;
      host.querySelector('.v-stage').innerHTML = svg(400, t.poles === 2 ? 240 : 140, s + `<rect class="hit" x="90" y="0" width="180" height="240" fill="transparent"/>`, 'switch');
      host.querySelector('.v-cap').innerHTML = `<b>${t.k}</b> = <span class="kw" tabindex="0" role="button">${t.poles} pole${t.poles > 1 ? 's' : ''}</span> (arms) · <span class="kw" tabindex="0" role="button">${t.throws} throw${t.throws > 1 ? 's' : ''}</span> (positions per arm). <small>Click the switch to flip it.</small>`;
      host.querySelector('.hit').onclick = () => { pos = (pos + 1) % 2; seen.add(t.k); draw(); if (seen.size >= 2) api.done(); else api.say(`Nice, that's ${t.k}. Now try a different type.`); };
    };
    host.querySelector('.v-tabs').onclick = e => { const b = e.target.closest('button'); if (!b) return; cur = +b.dataset.i; pos = 0; draw(); };
    draw();
  },

  fuseVsBreaker(host, api) {
    const items = [['Melts when current is too high', 0], ['Can be reset and reused', 1], ['Must be replaced after it trips', 0], ['Trips by heat (thermal) or magnetism', 1], ['Comes as fast-acting or time-delay', 0]];
    let sel = null, left = items.length;
    host.innerHTML = `<div class="v-sort"><div class="v-pool">${items.map(([t], i) => `<button class="v-item" data-i="${i}">${t}</button>`).join('')}</div>
      <div class="v-buckets"><div class="v-bk" data-b="0"><b>🔥 Fuse</b><div></div></div><div class="v-bk" data-b="1"><b>🔁 Circuit breaker</b><div></div></div></div></div>`;
    host.querySelector('.v-pool').onclick = e => { const b = e.target.closest('.v-item'); if (!b || b.classList.contains('placed')) return; host.querySelectorAll('.v-item').forEach(x => x.classList.remove('sel')); b.classList.add('sel'); sel = b; };
    host.querySelectorAll('.v-bk').forEach(bk => bk.onclick = () => {
      if (!sel) { api.say('Pick a card first, then click where it belongs.'); return; }
      const want = items[+sel.dataset.i][1];
      if (want === +bk.dataset.b) { sel.classList.remove('sel'); sel.classList.add('placed'); bk.querySelector('div').appendChild(sel); sel = null; if (--left === 0) api.done(); else api.say('✔ Right!'); }
      else { api.say('Not that one. Think: which one survives and can be used again?'); bk.classList.add('shake'); setTimeout(() => bk.classList.remove('shake'), 400); api.miss(); }
    });
  },

  groundPick(host, api) {
    host.innerHTML = `<div class="v-ground">${FIG.ground()}<p class="v-note">Ground is the circuit's <span class="kw" tabindex="0" role="button">0 V reference</span>. Every other voltage is measured from it, like measuring heights from sea level.</p></div>`;
    api.done();
  },

  // ---- Unit 3A extra visual: Series-Aiding vs Series-Opposing Batteries ----
  batterySeriesLab(host, api) {
    const cells = [
      { v: 9, flip: false },
      { v: 6, flip: true },
      { v: 3, flip: false },
    ];
    const render = () => {
      const vt = cells.reduce((s, c) => s + (c.flip ? -c.v : c.v), 0);
      host.innerHTML = `<div class="wg">
        <div class="wg-target">🎯 Click any reversed battery to flip it so all three are <b>series-aiding</b> (total = <b>18 V</b>).</div>
        <div class="row-c" id="bsRow">${cells.map((c, i) => `
          <button class="pchip ${c.flip ? '' : 'on'}" data-i="${i}" style="padding:14px 18px;min-width:130px">
            <span style="font-size:18px">${c.flip ? '➕ 🔋 ➖' : '➖ 🔋 ➕'}</span>
            <b>${c.flip ? `−${c.v} V (opposing)` : `+${c.v} V (aiding)`}</b>
            <small>Click to flip</small>
          </button>`).join('<span style="font-weight:800;font-size:20px">→</span>')}
        </div>
        <div class="wg-read big ${vt === 18 ? 'ok' : ''}">Total Voltage V<sub>T</sub> = ${cells.map(c => (c.flip ? `−${c.v}` : `+${c.v}`)).join(' ')} = <b>${vt} V</b></div>
      </div>`;
      host.querySelectorAll('#bsRow .pchip').forEach(b => b.onclick = () => {
        const idx = +b.dataset.i;
        cells[idx].flip = !cells[idx].flip;
        sfx.tap();
        render();
        if (cells.every(c => !c.flip)) api.done();
      });
    };
    render();
  },

  // ---- Unit 4A extra visual: Utility kWh Bill Calculator ----
  kwhCalculator(host, api) {
    const loads = [
      ['1200 W Heater', 1200, 1],
      ['100 W Desk Lamp', 100, 10],
      ['2500 W Water Heater', 2500, 2],
    ];
    let pick = 0, hrs = loads[0][2];
    const seen = new Set();
    const render = () => {
      const [, watts] = loads[pick];
      const kwh = (watts * hrs) / 1000;
      const cost = kwh * 0.12;
      host.innerHTML = `<div class="wg">
        <div class="chips" id="kwP">${loads.map(([n], i) => `<button class="pchip ${i === pick ? 'on' : ''}" data-i="${i}">${n}</button>`).join('')}</div>
        <label class="sl"><span class="sl-l">Hours used</span><input type="range" min="1" max="24" step="1" value="${hrs}"><output>${hrs} h</output></label>
        <div class="wg-read big ${seen.size >= 2 ? 'ok' : ''}">
          W = (${watts} W × ${hrs} h) ÷ 1000 = <b>${sig(kwh, 3)} kWh</b> &nbsp;·&nbsp; Cost @ $0.12/kWh = <b>$${cost.toFixed(2)}</b>
        </div>
      </div>`;
      host.querySelectorAll('#kwP .pchip').forEach(b => b.onclick = () => {
        pick = +b.dataset.i; hrs = loads[pick][2]; seen.add(pick); sfx.tap(); render();
        if (seen.size >= 2) api.done();
      });
      const inp = host.querySelector('input[type=range]');
      inp.oninput = () => {
        hrs = +inp.value; seen.add('sl'); render();
        if (seen.size >= 2) api.done();
      };
    };
    seen.add(0);
    render();
  },

  // ---- Unit 4B extra visual: Conductor / Semiconductor / Insulator Sorter ----
  materialSort4b(host, api) {
    const items = [
      ['Copper (Z = 29 · 1 valence e⁻)', 0],
      ['Silicon (Z = 14 · 4 valence e⁻)', 1],
      ['Glass / Rubber (wide energy gap)', 2],
      ['Silver (1 valence e⁻ · lowest ρ)', 0],
      ['Germanium (Z = 32 · 4 valence e⁻)', 1],
      ['Neon gas (Z = 10 · 8 valence e⁻ full shell)', 2],
    ];
    let sel = null, left = items.length;
    host.innerHTML = `<div class="v-sort"><div class="v-pool">${items.map(([t], i) => `<button class="v-item" data-i="${i}">${t}</button>`).join('')}</div>
      <div class="v-buckets" style="grid-template-columns:repeat(auto-fit,minmax(160px,1fr))">
        <div class="v-bk" data-b="0"><b>⚡ Conductor (1–3 val e⁻)</b><div></div></div>
        <div class="v-bk" data-b="1"><b>💻 Semiconductor (4 val e⁻)</b><div></div></div>
        <div class="v-bk" data-b="2"><b>🛡️ Insulator (8 val e⁻ / wide gap)</b><div></div></div>
      </div></div>`;
    host.querySelector('.v-pool').onclick = e => {
      const b = e.target.closest('.v-item'); if (!b || b.classList.contains('placed')) return;
      host.querySelectorAll('.v-item').forEach(x => x.classList.remove('sel')); b.classList.add('sel'); sel = b; sfx.tap();
    };
    host.querySelectorAll('.v-bk').forEach(bk => bk.onclick = () => {
      if (!sel) { api.say('Click a material card first, then click its category.'); return; }
      if (items[+sel.dataset.i][1] === +bk.dataset.b) {
        sel.classList.remove('sel'); sel.classList.add('placed'); bk.querySelector('div').appendChild(sel); sel = null; sfx.tap();
        if (--left === 0) api.done(); else api.say('✔ Right on!');
      } else {
        bk.classList.add('shake'); setTimeout(() => bk.classList.remove('shake'), 400);
        api.say('Check the valence electrons: 1 = Conductor, 4 = Semiconductor, 8 (or wide gap) = Insulator.');
        api.miss(); sfx.bad();
      }
    });
  },
};
