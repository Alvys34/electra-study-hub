// glossary.js - Clickable [[highlighted key terms]] (.kw) definition popover across all units (1A-6).
import { sfx } from './fx.js';
import { buddy } from '../ui/Buddy.js';

export const GLOSSARY = [
  // ==================== UNIT 1A: Quantities, Units & Prefixes ====================
  {
    keys: ['highlighted words', 'key terms', 'key term'],
    title: 'Interactive Key Terms',
    tag: 'Study Tool',
    def: 'Any word or phrase highlighted in gold can be clicked (or focused + Enter) to pop up a quick definition, unit, or formula reminder right where you are reading.',
    eq: 'Click any [[gold term]] → instant definition',
  },
  {
    keys: ['passive component', 'passive components', 'passive', 'passive device', 'cannot amplify'],
    title: 'Passive Component',
    tag: 'Unit 1A · Components',
    def: 'An electronic part that consumes, stores, or releases electrical energy but cannot amplify a signal or control current using another electrical signal (examples: resistors, capacitors, inductors, lamps).',
    eq: 'Examples: R (resistor), C (capacitor), L (inductor)',
  },
  {
    keys: ['active component', 'active components', 'active', 'active device', 'amplify', 'can amplify', 'amplification'],
    title: 'Active Component',
    tag: 'Unit 1A · Components',
    def: 'An electronic part that can supply energy, amplify signals, or control current flow using another electrical signal (examples: transistors, integrated circuits, voltage/current sources).',
    eq: 'Examples: Transistor, IC, DC Supply',
  },
  {
    keys: ['transistor', 'transistors', 'triode vacuum tube', 'triode vacuum tubes', 'vacuum tube', 'vacuum tubes', 'valve', 'valves', 'tubes', 'tunnel diode', 'tunnel diodes'],
    title: 'Transistors, Vacuum Tubes & Tunnel Diodes',
    tag: 'Unit 1A · Active Devices',
    def: 'The classic active devices. Powered by an external DC source, they use a small input signal to control a larger flow of energy, so they can amplify. Transistors replaced vacuum tubes (valves) in almost all modern electronics.',
    eq: 'Active = needs DC power + can amplify',
  },
  {
    keys: ['transformer', 'transformers'],
    title: 'Transformer',
    tag: 'Unit 1A · Passive Device',
    def: 'Two coils sharing a magnetic core. It can step an AC voltage up or down, but it adds no energy: power out is never more than power in. That is why it still counts as passive.',
    eq: 'Step up V → current goes down (P_out ≤ P_in)',
  },
  {
    keys: ['si', 'si unit', 'si units', 'si system', '7 fundamental units', 'fundamental units', '2 supplementary units', 'supplementary units',
      'meter (m)', 'kilogram (kg)', 'second (s)', 'kelvin (k)', 'mole (mol)', 'candela (cd)', 'radian (rad)', 'steradian (sr)'],
    title: 'SI Units (Système International)',
    tag: 'Unit 1A · Units',
    def: 'The international metric system. It has 7 fundamental units: meter (length), kilogram (mass), second (time), ampere (current), kelvin (temperature), mole (amount of substance) and candela (light). It also has 2 supplementary units: radian (plane angle) and steradian (solid angle). Every other unit, like the volt or ohm, is derived from these.',
    eq: 'm · kg · s · A · K · mol · cd  (+ rad, sr)',
  },
  {
    keys: ['reactance', 'impedance'],
    title: 'Reactance (X) & Impedance (Z)',
    tag: 'Unit 1A · Quantity & Unit',
    def: 'Reactance (X) is the opposition that capacitors and inductors offer to AC. Impedance (Z) is the total opposition to AC: resistance and reactance combined. Like resistance, both are measured in ohms.',
    eq: 'R, X and Z are all measured in ohms (Ω)',
  },
  {
    keys: ["coulomb's law", 'repel', 'attract', 'like charges', 'unlike charges'],
    title: "Coulomb's Law (Like Charges Repel)",
    tag: 'Unit 1C · Charge',
    def: 'Like charges repel and unlike charges attract. The force between two charges grows with the size of both charges and drops with the square of the distance between them.',
    eq: 'F = k · Q₁Q₂ / r²',
  },
  {
    keys: ['charge', 'electrical charge', 'q'],
    title: 'Electrical Charge (Q)',
    tag: 'Unit 1A / 1C · Quantity',
    def: 'A fundamental electrical property of matter carried by protons (+) and electrons (−). Measured in coulombs (C), where 1 C equals the charge of 6.25 × 10¹⁸ electrons.',
    eq: 'Symbol: Q · Unit: Coulomb (C) · Q = I × t',
  },
  {
    keys: ['coulomb', 'coulombs', '6.25 × 10¹⁸ electrons', '6.25 x 10^18', '1.6 × 10⁻¹⁹ c'],
    title: 'Coulomb (C)',
    tag: 'Unit 1A / 1C · SI Unit',
    def: 'The SI unit of electrical charge (Q). One coulomb is the total charge carried by 6.25 × 10¹⁸ electrons; each single electron has a charge of 1.6 × 10⁻¹⁹ C.',
    eq: '1 C = 6.25 × 10¹⁸ electrons · 1 e⁻ = 1.6 × 10⁻¹⁹ C',
  },
  {
    keys: ['current', 'electrical current', 'electric current', 'i = q / t', 'i = q/t'],
    title: 'Electrical Current (I)',
    tag: 'Unit 1A / 1C · Quantity',
    def: 'The rate of flow of electrical charge past a given point in a circuit. One ampere (1 A) flows when 1 coulomb of charge passes a point every second.',
    eq: 'Symbol: I · Unit: Ampere (A) · I = Q / t = V / R',
  },
  {
    keys: ['ampere', 'amperes', 'amp', 'amps', '1 a'],
    title: 'Ampere (A)',
    tag: 'Unit 1A / 1C · SI Unit',
    def: 'The SI unit of electrical current (I). One ampere equals one coulomb of charge flowing past a point in one second (1 A = 1 C/s).',
    eq: '1 A = 1 C / 1 s',
  },
  {
    keys: ['voltage', 'potential difference', 'electromotive force', 'emf', 'v = w / q', 'v = w/q'],
    title: 'Voltage / Potential Difference (V)',
    tag: 'Unit 1A / 1C · Quantity',
    def: 'The electrical pressure (potential energy difference per unit charge) that pushes electrons through a circuit. One volt equals one joule of work done per coulomb of charge.',
    eq: 'Symbol: V · Unit: Volt (V) · V = W / Q = I × R',
  },
  {
    keys: ['volt', 'volts', '1 v'],
    title: 'Volt (V)',
    tag: 'Unit 1A / 1C · SI Unit',
    def: 'The SI unit of voltage (potential difference). One volt is the potential difference when 1 joule of energy moves 1 coulomb of charge (1 V = 1 J/C).',
    eq: '1 V = 1 J / 1 C',
  },
  {
    keys: ['resistance', 'electrical resistance', 'opposition to current'],
    title: 'Resistance (R)',
    tag: 'Unit 1A / 1B · Quantity',
    def: 'The opposition to the flow of electrical current in a material or component. Higher resistance means less current for the same applied voltage.',
    eq: 'Symbol: R · Unit: Ohm (Ω) · R = V / I = 1 / G',
  },
  {
    keys: ['ohm', 'ohms', 'ω'],
    title: 'Ohm (Ω)',
    tag: 'Unit 1A / 1B · SI Unit',
    def: 'The SI unit of electrical resistance (R). One ohm is the resistance that allows exactly 1 ampere of current to flow when 1 volt is applied across it.',
    eq: '1 Ω = 1 V / 1 A',
  },
  {
    keys: ['conductance', 'g = 1 / r', 'g = 1/r'],
    title: 'Conductance (G)',
    tag: 'Unit 1A / 1B · Quantity',
    def: 'The measure of how easily a material or component allows current to flow — the exact reciprocal of resistance.',
    eq: 'Symbol: G · Unit: Siemens (S) · G = 1 / R',
  },
  {
    keys: ['siemens', 'mho', 's = 1/ω'],
    title: 'Siemens (S)',
    tag: 'Unit 1A / 1B · SI Unit',
    def: 'The SI unit of conductance (G), equal to 1 / Ω (formerly called the mho). A 100 Ω resistor has a conductance of 0.01 S (10 mS).',
    eq: '1 S = 1 / 1 Ω',
  },
  {
    keys: ['energy', 'work', 'electrical energy', 'joule', 'joules', 'w = p × t', 'w = pt'],
    title: 'Energy / Work (W)',
    tag: 'Unit 1A / 4A · Quantity & Unit',
    def: 'The capacity to do work. InSI units, energy is measured in joules (J); in electric utility billing, it is measured in kilowatt-hours (kWh).',
    eq: 'Symbol: W · Unit: Joule (J) · W = P × t',
  },
  {
    keys: ['power', 'electrical power', 'watt', 'watts', 'p = w / t', 'p = vi', 'p = v × i', "watt's law", 'watts law'],
    title: 'Electrical Power (P) & Watt (W)',
    tag: 'Unit 1A / 4A · Quantity & Unit',
    def: 'The rate at which energy is used or converted into heat/light per unit time. One watt (1 W) equals one joule of energy per second (1 J/s).',
    eq: 'P = W / t = V × I = I²R = V² / R · Unit: Watt (W)',
  },
  {
    keys: ['frequency', 'hertz', 'hz'],
    title: 'Frequency (f) & Hertz (Hz)',
    tag: 'Unit 1A · Quantity & Unit',
    def: 'The number of complete cycles of a periodic waveform that occur each second. Measured in hertz (Hz), where 1 Hz = 1 cycle per second.',
    eq: 'Symbol: f · Unit: Hertz (Hz)',
  },
  {
    keys: ['capacitance', 'farad', 'farads', 'capacitor'],
    title: 'Capacitance (C) & Farad (F)',
    tag: 'Unit 1A · Quantity & Unit',
    def: 'A component’s ability to store energy in an electric field (charge per volt). Measured in farads (F), typically in microfarads (µF), nanofarads (nF), or picofarads (pF).',
    eq: 'Symbol: C · Unit: Farad (F)',
  },
  {
    keys: ['inductance', 'henry', 'henries', 'inductor'],
    title: 'Inductance (L) & Henry (H)',
    tag: 'Unit 1A · Quantity & Unit',
    def: 'A coil’s ability to store energy in a magnetic field and oppose changes in current. Measured in henries (H), typically mH or µH.',
    eq: 'Symbol: L · Unit: Henry (H)',
  },
  {
    keys: ['scientific notation', 'mantissa', 'power of ten', 'one non-zero digit'],
    title: 'Scientific Notation',
    tag: 'Unit 1A · Notation',
    def: 'Writing a number as a mantissa with a single non-zero digit before the decimal point (1 ≤ |M| < 10) multiplied by an integer power of 10.',
    eq: 'Example: 47,000 = 4.7 × 10⁴',
  },
  {
    keys: ['engineering notation', 'multiple of 3', 'multiples of 3', '1 to 3 digits'],
    title: 'Engineering Notation',
    tag: 'Unit 1A · Notation',
    def: 'A form of powers-of-ten notation where the exponent of 10 is ALWAYS a multiple of 3 (…, −12, −9, −6, −3, 0, 3, 6, 9, 12) and the mantissa is between 1 and 999, matching metric prefixes directly.',
    eq: 'Example: 47,000 Ω = 47 × 10³ Ω = 47 kΩ',
  },
  {
    keys: ['metric prefix', 'metric prefixes', 'peta', 'tera', 'giga', 'mega', 'kilo', 'milli', 'micro', 'nano', 'pico', 'femto'],
    title: 'Metric Prefix',
    tag: 'Unit 1A · Notation',
    def: 'A letter symbol placed before a base unit to represent a power-of-10³ multiplier: P (10¹⁵), T (10¹²), G (10⁹), M (10⁶), k (10³), m (10⁻³), µ (10⁻⁶), n (10⁻⁹), p (10⁻¹²), f (10⁻¹⁵).',
    eq: 'Larger unit → smaller number · Smaller unit → larger number',
  },
  {
    keys: ['exponent', 'exponents', 'base', 'positive exponent', 'negative exponent', 'add the exponents', 'add exponents',
      'subtract the exponents', 'subtract exponents', 'addition & subtraction', 'multiplication', 'division', 'multiply'],
    title: 'Powers of 10: Exponent Rules',
    tag: 'Unit 1A · Notation',
    def: 'In 4.7 × 10³, 10 is the base and 3 is the exponent. A positive exponent means a number ≥ 10, a negative one means a number < 1. To add or subtract, first give both numbers the same power of 10. To multiply, multiply the front numbers and add the exponents. To divide, divide the front numbers and subtract the exponents.',
    eq: '10ᵃ × 10ᵇ = 10ᵃ⁺ᵇ · 10ᵃ ÷ 10ᵇ = 10ᵃ⁻ᵇ',
  },
  {
    keys: ['larger unit', 'smaller unit', 'larger number', 'smaller number', 'same prefix', 'larger', 'smaller'],
    title: 'Converting Between Prefixes',
    tag: 'Unit 1A · Conversions',
    def: 'Going to a smaller unit needs a larger number, so move the decimal point right (0.47 MΩ = 470 kΩ). Going to a larger unit needs a smaller number, so move it left (10,000 pF = 0.01 µF). Before adding or subtracting, convert both values to the same prefix.',
    eq: '10 kΩ + 22,000 Ω = 10 kΩ + 22 kΩ = 32 kΩ',
  },
  {
    keys: ['significant digits', 'significant figures', 'sig figs', 'round-off', 'rounding',
      'non-zero digits', 'leading zeros', 'sandwiched zeros', 'trailing zeros', 'trailing zeros after a decimal',
      'never significant', 'always significant', '≥ 5, round up', '< 5, leave it', '≥ 5', '4th digit'],
    title: 'Significant Digits (Sig Figs)',
    tag: 'Unit 1A · Measurement Accuracy',
    def: 'The digits in a measured or calculated number that carry real precision. Non-zero digits, trapped zeros, and trailing zeros after a decimal point are significant; leading placeholder zeros (like 0.00 in 0.00470) are not.',
    eq: '0.00470 has 3 sig figs (4, 7, 0) · Report answers to 3 sig figs',
  },

  // ==================== UNIT 1B: Resistors & Wire Resistance ====================
  {
    keys: ['fixed resistor', 'fixed resistors', 'resistor', 'resistors'],
    title: 'Resistor (R)',
    tag: 'Unit 1B · Component',
    def: 'A passive two-terminal component designed to introduce a specific amount of resistance into a circuit to limit current and divide voltage.',
    eq: 'R = V / I · Unit: Ohm (Ω)',
  },
  {
    keys: ['color code', 'colour code', '4-band', 'color bands', 'colour bands', 'big boys race our young girls but violet generally wins',
      '0 black', '1 brown', '2 red', '3 orange', '4 yellow', '5 green', '6 blue', '7 violet', '8 gray', '9 white'],
    title: '4-Band Resistor Colour Code',
    tag: 'Unit 1B · Identification',
    def: 'Bands 1 & 2 give the first two digits, Band 3 is the power-of-10 multiplier (number of zeros), and Band 4 is tolerance (Gold = ±5%, Silver = ±10%, none = ±20%).',
    eq: '0 Blk · 1 Brn · 2 Red · 3 Org · 4 Yel · 5 Grn · 6 Blu · 7 Vio · 8 Gry · 9 Wht',
  },
  {
    keys: ['tolerance', '±5%', '±10%', '±20%', 'minimum resistance', 'maximum resistance'],
    title: 'Resistor Tolerance',
    tag: 'Unit 1B · Specification',
    def: 'The maximum percentage by which a resistor’s actual measured value may vary from its nominal (marked) value. Gold = ±5%, Silver = ±10%, no 4th band = ±20%.',
    eq: 'R_min = R × (1 − tol) · R_max = R × (1 + tol)',
  },
  {
    keys: ['variable resistor', 'variable resistors'],
    title: 'Variable Resistor',
    tag: 'Unit 1B · Component',
    def: 'A resistor whose resistance value can be adjusted mechanically (potentiometer, rheostat) or automatically by a physical stimulus (thermistor, photoconductive cell, strain gauge).',
    eq: 'Types: Potentiometer (3-term), Rheostat (2-term), Sensors',
  },
  {
    keys: ['potentiometer', 'pot'],
    title: 'Potentiometer',
    tag: 'Unit 1B · Variable Resistor',
    def: 'A three-terminal variable resistor with a sliding wiper contact used as an adjustable voltage divider (for example, an audio volume knob).',
    eq: '3 terminals → controls voltage (voltage divider)',
  },
  {
    keys: ['rheostat'],
    title: 'Rheostat',
    tag: 'Unit 1B · Variable Resistor',
    def: 'A two-terminal variable resistor (or a potentiometer wired using only one end and the wiper) connected in series with a load to control current directly.',
    eq: '2 terminals → controls current',
  },
  {
    keys: ['thermistor', 'ntc'],
    title: 'Thermistor',
    tag: 'Unit 1B · Sensor Resistor',
    def: 'A thermally sensitive resistor whose resistance changes with temperature. Most have a Negative Temperature Coefficient (NTC): when temperature goes UP, resistance goes DOWN.',
    eq: 'NTC: Temperature ↑ → Resistance ↓',
  },
  {
    keys: ['photoconductive cell', 'ldr', 'photoresistor'],
    title: 'Photoconductive Cell (LDR)',
    tag: 'Unit 1B · Sensor Resistor',
    def: 'A light-sensitive variable resistor whose resistance decreases as light intensity increases.',
    eq: 'Light intensity ↑ → Resistance ↓',
  },
  {
    keys: ['strain gauge', 'strain gauges'],
    title: 'Strain Gauge',
    tag: 'Unit 1B · Sensor Resistor',
    def: 'A sensor whose metallic foil grid stretches or compresses under mechanical force, changing its length and cross-sectional area and therefore its electrical resistance.',
    eq: 'Mechanical strain (stretch/compression) → ΔR',
  },
  {
    keys: ['resistivity', 'specific resistance', 'ρ', 'rho', 'r = ρl/a', 'r = ρ × l / a'],
    title: 'Resistivity (ρ) & Wire Resistance Formula',
    tag: 'Unit 1B · Wire Resistance',
    def: 'An intrinsic material property measuring how strongly a material opposes current (in CM·Ω/ft or Ω·m). Wire resistance increases with resistivity (ρ) and length (l), and decreases with cross-sectional area (A).',
    eq: 'R = ρ × l / A · Area in CM = d_mils²',
  },
  {
    keys: ['circular mil', 'circular mils', 'cm', 'mil', 'mils', 'd²'],
    title: 'Circular Mil (CM)',
    tag: 'Unit 1B · Wire Area Unit',
    def: 'A unit of wire cross-sectional area equal to the area of a circle with a diameter of 1 mil (0.001 inch). Finding area in circular mils requires no π — just square the diameter in mils!',
    eq: '1 mil = 0.001 in · A (in CM) = (d in mils)²',
  },
  {
    keys: ['awg', 'american wire gauge', 'wire gauge'],
    title: 'American Wire Gauge (AWG)',
    tag: 'Unit 1B · Wire Sizing',
    def: 'Standard wire-size numbering system where a SMALLER AWG number means a THICKER wire with larger cross-sectional area and LOWER resistance per foot.',
    eq: 'Smaller AWG # → Thicker wire → Lower R · Larger AWG # → Thinner wire → Higher R',
  },

  // ==================== UNIT 1C: Charge, Voltage & Current ====================
  {
    keys: ['primary cell', 'primary cells', 'primary battery', 'non-rechargeable'],
    title: 'Primary Cell / Battery',
    tag: 'Unit 1C · Voltage Source',
    def: 'A battery whose electrochemical reaction is non-reversible — once its chemical reactants are exhausted, it cannot be recharged (e.g., alkaline AA, carbon-zinc, lithium coin cell).',
    eq: 'Primary = Use once (not rechargeable)',
  },
  {
    keys: ['secondary cell', 'secondary cells', 'secondary battery', 'rechargeable'],
    title: 'Secondary Cell / Battery',
    tag: 'Unit 1C · Voltage Source',
    def: 'A rechargeable battery whose chemical reaction can be reversed by driving external current back through the cell (e.g., lead-acid car battery, Li-ion, NiMH).',
    eq: 'Secondary = Rechargeable',
  },
  {
    keys: ['fuel cell', 'fuel cells'],
    title: 'Fuel Cell',
    tag: 'Unit 1C · Voltage Source',
    def: 'An electrochemical energy converter that produces DC electricity continuously as long as fuel (such as hydrogen) and an oxidizer (oxygen) are supplied from outside.',
    eq: 'Continuous external fuel (H₂ + O₂) → DC Electricity + H₂O',
  },
  {
    keys: ['solar cell', 'photovoltaic', 'generator', 'power supply', 'electronic power supply'],
    title: 'Voltage Sources (Solar, Generator, Power Supply)',
    tag: 'Unit 1C · Voltage Source',
    def: 'Devices that convert another form of energy into DC electrical potential: solar cells convert light, generators convert mechanical rotation, and electronic power supplies convert AC wall power into regulated DC.',
    eq: 'Light / Mechanical / AC → Regulated DC Voltage (V)',
  },
  {
    keys: ['anode', 'cathode', 'electrolyte', 'electrodes'],
    title: 'Electrodes (Anode & Cathode) & Electrolyte',
    tag: 'Unit 1C · Cell Chemistry',
    def: 'In our course slides for a voltaic cell, the two conducting plates are the electrodes — the negative anode (source of electrons) and positive cathode — separated by a conductive chemical paste or liquid called the electrolyte.',
    eq: 'Anode (−) & Cathode (+) immersed in Electrolyte',
  },
  {
    keys: ['electron flow', 'free electrons', '− → +'],
    title: 'Electron Flow (− → +)',
    tag: 'Unit 1C · Current Direction',
    def: 'The actual physical motion of negatively charged free electrons through a conductor: repelled from the negative (−) terminal and attracted toward the positive (+) terminal.',
    eq: 'Electron Flow: Negative (−) terminal → Positive (+) terminal',
  },
  {
    keys: ['conventional current', 'conventional flow', '+ → −'],
    title: 'Conventional Current (+ → −)',
    tag: 'Unit 1C · Current Direction',
    def: 'The historical engineering convention (defined by Benjamin Franklin before electrons were discovered) that treats current as positive charge flowing from the positive (+) terminal to the negative (−) terminal.',
    eq: 'Conventional Current: Positive (+) terminal → Negative (−) terminal',
  },
  {
    keys: ['current source', 'ideal current source', 'constant current'],
    title: 'Current Source',
    tag: 'Unit 1C · Source Type',
    def: 'An active source (symbol: circle with an arrow inside) that delivers a constant, fixed current regardless of the load resistance connected across it.',
    eq: 'Ideal Current Source: I_out = constant for any load R_L',
  },

  // ==================== UNIT 2A: Basic Circuit, Switches, Fuse & Meters ====================
  {
    keys: ['source', 'load', 'path', 'basic circuit'],
    title: 'The Three Parts of Every Circuit',
    tag: 'Unit 2A · Fundamentals',
    def: 'Every working electric circuit requires (1) a Source to supply voltage, (2) a Load to use the energy do work, and (3) a complete conducting Path (wires) from one source terminal through the load and back to the other terminal.',
    eq: 'Circuit = Source + Load + Complete Path',
  },
  {
    keys: ['closed circuit', 'closed', 'complete loop'],
    title: 'Closed Circuit',
    tag: 'Unit 2A · Circuit State',
    def: 'An unbroken conducting loop from the source, through the load, and back to the source. Current flows normally and the load operates.',
    eq: 'Closed Loop → I > 0 (Current flows)',
  },
  {
    keys: ['open circuit', 'open', 'broken path'],
    title: 'Open Circuit',
    tag: 'Unit 2A · Circuit State',
    def: 'A circuit with a break in the conducting path (such as an open switch, disconnected wire, or burned-out filament). Infinite resistance across the break means zero current flows everywhere in that loop — and the full supply voltage appears across the open gap!',
    eq: 'Open Circuit → I = 0 A · V_across_open = V_S',
  },
  {
    keys: ['short circuit', 'short'],
    title: 'Short Circuit',
    tag: 'Unit 2A · Circuit Fault',
    def: 'An accidental low-resistance path that bypasses the load, allowing dangerously high current (I = V/R_wire) to surge from the source and trip a breaker or blow a fuse.',
    eq: 'Short Circuit → R ≈ 0 Ω → Huge I ↑↑ → Blows fuse!',
  },
  {
    keys: ['spst', 'spdt', 'dpst', 'dpdt', 'no', 'nc', 'normally open', 'normally closed', 'poles', 'throws', 'pole', 'throw', 'switch', 'switches', 'control', 'control device'],
    title: 'Switch Types (Poles & Throws, NO / NC)',
    tag: 'Unit 2A · Control Devices',
    def: 'Poles = number of separate circuits controlled; Throws = number of closed positions per pole (SPST, SPDT, DPST, DPDT). Push buttons are Momentary: Normally Open (NO) closes when pressed; Normally Closed (NC) opens when pressed.',
    eq: 'Poles = wipers · Throws = positions per pole',
  },
  {
    keys: ['fuse', 'fuses', 'circuit breaker', 'breaker', 'protection', 'protection device', 'replaced', 'reset', 'heating effect', 'magnetic field'],
    title: 'Fuse & Circuit Breaker',
    tag: 'Unit 2A · Overcurrent Protection',
    def: 'Safety devices wired IN SERIES with the source to open the circuit when current exceeds a safe rating. A fuse melts a thin metal link once and must be replaced; a circuit breaker trips mechanically and can be reset.',
    eq: 'Wired in SERIES · Fuse = replace · Breaker = reset',
  },
  {
    keys: ['ground', 'reference ground', 'chassis ground', 'earth ground', '0 v', 'earthing'],
    title: 'Ground (0 V Reference)',
    tag: 'Unit 2A / 3A · Reference Point',
    def: 'The common reference point in a circuit defined as 0 V against which single-subscript node voltages (like V_A or V_B) are measured, often also serving as a common return path.',
    eq: 'V_ground = 0 V · V_AB = V_A − V_B',
  },
  {
    keys: ['voltmeter', 'across', 'in parallel'],
    title: 'Voltmeter (Measures V)',
    tag: 'Unit 2A · Measurement',
    def: 'An instrument that measures potential difference (voltage) between two points. Always connect a voltmeter ACROSS (in parallel with) the component while power is ON. It has very high internal resistance so it draws virtually no current.',
    eq: 'Connect in PARALLEL (across) · Internal R ≈ ∞',
  },
  {
    keys: ['ammeter', 'in series', 'break the circuit'],
    title: 'Ammeter (Measures I)',
    tag: 'Unit 2A · Measurement',
    def: 'An instrument that measures current flowing through a branch. You must BREAK the circuit and wire the ammeter IN SERIES so current flows through it. Never connect an ammeter across a voltage source — its internal resistance is ~0 Ω!',
    eq: 'Connect in SERIES (in-line) · Internal R ≈ 0 Ω',
  },
  {
    keys: ['ohmmeter', 'power off', 'powered off', 'live!'],
    title: 'Ohmmeter (Measures R)',
    tag: 'Unit 2A · Measurement',
    def: 'An instrument that measures component resistance using its own internal battery. Always turn circuit power OFF and isolate the component before connecting the ohmmeter across it.',
    eq: 'Power OFF + Isolate part · Connect across component',
  },
  {
    keys: ['dmm', 'digital multimeter', 'multimeter'],
    title: 'Digital Multimeter (DMM)',
    tag: 'Unit 2A · Measurement',
    def: 'A single bench or handheld instrument that combines a voltmeter (V), ammeter (A), and ohmmeter (Ω) selected by a rotary dial.',
    eq: 'DMM = Voltmeter + Ammeter + Ohmmeter in one tool',
  },
  {
    keys: ['schematic', 'schematic diagram'],
    title: 'Schematic Diagram',
    tag: 'Unit 2A · Circuit Drawings',
    def: 'A standardized map of a circuit using graphic symbols (battery, resistor, switch, ground, meters) to show how components are electrically connected rather than how they physically look.',
    eq: 'Standard symbols showing electrical connections',
  },

  // ==================== UNIT 2B: Ohm's Law ====================
  {
    keys: ["ohm's law", 'ohms law', 'v = ir', 'v = i × r', 'i = v / r', 'i = v/r', 'r = v / i', 'r = v/i'],
    title: "Ohm's Law",
    tag: 'Unit 2B · Core Law',
    def: 'Current (I) in a resistive circuit is directly proportional to applied voltage (V) and inversely proportional to resistance (R). Cover the unknown in the V–I–R triangle to see the formula!',
    eq: 'I = V / R · V = I × R · R = V / I',
  },
  {
    keys: ['directly proportional', 'direct proportion', 'linear', 'v-i graph', 'v–i graph', 'slope'],
    title: 'Direct Proportion & Linear V–I Graph',
    tag: "Unit 2B · Ohm's Law",
    def: 'With resistance R held constant, current I is directly proportional to voltage V: double V and I doubles. Plotting I vs V for a fixed resistor gives a straight line through the origin whose slope is 1/R (conductance G).',
    eq: 'Constant R: V ↑ 2× → I ↑ 2× · Straight line through (0,0)',
  },
  {
    keys: ['inversely proportional', 'inverse proportion'],
    title: 'Inverse Proportion (I vs R)',
    tag: "Unit 2B · Ohm's Law",
    def: 'With supply voltage V held constant, current I is inversely proportional to resistance R: doubling R cuts current I in half.',
    eq: 'Constant V: R ↑ 2× → I ↓ ½×',
  },

  // ==================== UNIT 3A: Series Circuits ====================
  {
    keys: ['series', 'series circuit', 'series circuits', 'single path', 'one path'],
    title: 'Series Circuit',
    tag: 'Unit 3A · Topology',
    def: 'A circuit that provides only ONE path for current between two points (two components share a single node with no third branch attached). The exact same current I flows through every series component!',
    eq: 'I_T = I₁ = I₂ = I₃ · R_T = R₁ + R₂ + R₃',
  },
  {
    keys: ['total resistance', 'rt', 'r_t'],
    title: 'Total / Equivalent Resistance (R_T)',
    tag: 'Unit 3A / 5 / 6 · Resistance',
    def: 'The single resistance seen by the power source. In series, resistances add (R_T > largest R); in parallel, conductances add so R_T is always smaller than the smallest branch resistor!',
    eq: 'Series: R_T = ΣR · Parallel: R_T = 1 / Σ(1/R)',
  },
  {
    keys: ['voltageSources in series', 'series-aiding', 'series-opposing', 'reversed battery'],
    title: 'Voltage Sources in Series (Aiding vs Opposing)',
    tag: 'Unit 3A · Sources',
    def: 'Batteries wired in the same direction (+ to −) are series-aiding and their voltages ADD. A battery wired backwards (+ to + or − to −) is series-opposing and SUBTRACTS from the others.',
    eq: 'Aiding: V_T = V₁ + V₂ · Opposing: V_T = |V₁ − V₂|',
  },
  {
    keys: ["kirchhoff's voltage law", 'kirchhoffs voltage law', 'kvl', 'voltage drop', 'voltage drops'],
    title: "Kirchhoff's Voltage Law (KVL)",
    tag: 'Unit 3A · Core Law',
    def: 'Around any closed loop, the sum of all component voltage drops equals the total source voltage (or the algebraic sum of all voltages around a closed loop is zero).',
    eq: 'V_S = V₁ + V₂ + V₃ + … · ΣV_loop = 0',
  },
  {
    keys: ['voltage divider', 'voltage-divider', 'unloaded voltage divider', 'potentiometer as a voltage divider'],
    title: 'Voltage Divider Formula',
    tag: 'Unit 3A · Series Rule',
    def: 'Series resistors divide the total voltage in direct proportion to their resistances: the largest resistor always gets the largest share of the source voltage.',
    eq: 'V_x = V_S × (R_x / R_T)',
  },

  // ==================== UNIT 4A: Power & Energy ====================
  {
    keys: ['watt\'s law', 'watts law', 'power formulas', 'p = i²r', 'p = v²/r', 'p = v² / r'],
    title: "Watt's Law & Power Formulas",
    tag: 'Unit 4A · Core Law',
    def: "Combines P = VI with Ohm's law (V = IR) so you can find power from any two of V, I, and R without solving for the third variable first.",
    eq: 'P = V × I = I² × R = V² / R',
  },
  {
    keys: ['kilowatt-hour', 'kilowatt-hours', 'kwh', 'utility bill'],
    title: 'Kilowatt-Hour (kWh)',
    tag: 'Unit 4A · Energy Unit',
    def: 'The commercial unit of electrical energy used on electric utility bills. One kWh is the energy used by a 1,000 W (1 kW) load running for 1 hour (equal to 3.6 × 10⁶ joules).',
    eq: 'W (kWh) = P (kW) × t (hours) = (P_watts × hours) / 1000',
  },
  {
    keys: ['power rating', 'wattage rating', '1/4 w', '1/2 w', '¼ w', '½ w'],
    title: 'Resistor Power Rating (W)',
    tag: 'Unit 4A · Component Rating',
    def: 'The maximum power in watts a resistor can safely dissipate as heat without overheating or burning up. Determined by physical size (larger surface area = higher wattage rating), NOT resistance in ohms!',
    eq: 'Safe design rule: Choose P_rating > P_actual (e.g. 2× safety margin)',
  },
  {
    keys: ['ampere-hour', 'amp-hour', 'ah', 'battery capacity'],
    title: 'Ampere-Hour (Ah) Rating',
    tag: 'Unit 4A · Battery Capacity',
    def: 'Measures battery charge capacity: the product of discharge current (in amperes) and discharge time (in hours). A 10 Ah battery can deliver 0.5 A for 20 hours (0.5 × 20 = 10 Ah).',
    eq: 'Capacity (Ah) = I (A) × t (hours)',
  },
  {
    keys: ['power supply efficiency', 'efficiency', 'η', 'p_out / p_in'],
    title: 'Power Supply Efficiency (η)',
    tag: 'Unit 4A · Efficiency',
    def: 'The ratio of useful output power delivered to the load (P_out) to total input power drawn by the supply (P_in). The difference is P_loss (wasted as heat).',
    eq: 'η = (P_out / P_in) × 100% · P_in = P_out + P_loss',
  },

  // ==================== UNIT 4B: Atomic Theory & Conduction ====================
  {
    keys: ['bohr model', 'bohr atom', 'atomic number', 'proton', 'protons', 'neutron', 'neutrons', 'electron', 'electrons', 'nucleus'],
    title: 'Bohr Model of the Atom & Atomic Number (Z)',
    tag: 'Unit 4B · Atomic Structure',
    def: 'A planetary model where a dense central nucleus of positive protons and neutral neutrons is surrounded by negative electrons orbiting in discrete shells. Atomic number Z equals the number of protons (and electrons in a neutral atom).',
    eq: 'Neutral atom: # Protons = # Electrons = Atomic Number (Z)',
  },
  {
    keys: ['electron shell', 'electron shells', '2n²', 'shell capacity'],
    title: 'Electron Shells & 2n² Rule',
    tag: 'Unit 4B · Atomic Structure',
    def: 'Electrons occupy concentric energy shells numbered n = 1, 2, 3, 4… outward from the nucleus. Each shell can hold at most 2n² electrons (2, 8, 18, 32…). The outer valence shell is the exception: it holds at most 8 electrons, or 2n² if that is smaller.',
    eq: 'Max in shell n = 2n² (1→2, 2→8, 3→18, 4→32). Valence shell ≤ 8.',
  },
  {
    keys: ['valence shell', 'valence electron', 'valence electrons'],
    title: 'Valence Shell & Valence Electrons',
    tag: 'Unit 4B · Atomic Structure',
    def: 'The outermost occupied electron shell of an atom and the electrons in it. Because they are farthest from the nucleus, valence electrons have the highest energy, are least tightly bound, and determine electrical conductivity.',
    eq: '1 valence e⁻ = Conductor · 4 = Semiconductor · 8 = Insulator/Inert',
  },
  {
    keys: ['ionization', 'positive ion', 'negative ion', 'ion', 'ions'],
    title: 'Ionization & Ions',
    tag: 'Unit 4B · Atomic Structure',
    def: 'The process of an atom losing or gaining a valence electron. Absorbing heat/light energy frees a valence electron, leaving a net-positive ion; gaining an extra electron creates a negative ion.',
    eq: 'Lose e⁻ → Positive Ion (+) · Gain e⁻ → Negative Ion (−)',
  },
  {
    keys: ['conductor', 'conductors', 'copper', 'silver', 'gold', 'aluminum'],
    title: 'Conductor (1–3 Valence Electrons)',
    tag: 'Unit 4B · Material Category',
    def: 'A material with 1 to 3 valence electrons and no energy gap, so room-temperature electrons move freely. The best conductors (silver, copper, gold) have 1 valence electron. Aluminum is also a conductor and has 3.',
    eq: 'Resistivity order: Silver (1) > Copper (1) > Gold (1) > Aluminum (3 valence e⁻)',
  },
  {
    keys: ['insulator', 'insulators'],
    title: 'Insulator (8 Valence Electrons)',
    tag: 'Unit 4B · Material Category',
    def: 'A material (glass, porcelain, Teflon, rubber, mica) whose valence electrons are tightly bound. The best insulators have 8 valence electrons and a wide energy gap, so almost no current flows at normal voltages.',
    eq: 'Wide energy gap → practically zero free electrons',
  },
  {
    keys: ['semiconductor', 'semiconductors', 'silicon', 'germanium'],
    title: 'Semiconductor (4 Valence Electrons)',
    tag: 'Unit 4B · Material Category',
    def: 'A material such as Silicon (Z=14) or Germanium (Z=32) with exactly 4 valence electrons and a narrow energy gap — midway between a conductor and an insulator, forming the basis of diodes, transistors, and ICs.',
    eq: 'Silicon (Z=14) & Germanium (Z=32) → 4 valence electrons',
  },
  {
    keys: ['energy gap', 'band gap', 'conduction band', 'valence band'],
    title: 'Valence Band, Conduction Band & Energy Gap',
    tag: 'Unit 4B · Band Theory',
    def: 'To conduct electricity, an electron must jump from the valence band across the forbidden energy gap into the conduction band. Insulators have a huge gap, semiconductors have a narrow gap, and conductors overlap (no gap).',
    eq: 'Gap size: Insulator (wide) > Semiconductor (narrow) > Conductor (overlap)',
  },

  // ==================== UNIT 5: Parallel Circuits ====================
  {
    keys: ['parallel', 'parallel circuit', 'parallel circuits', 'branches', 'branch'],
    title: 'Parallel Circuit',
    tag: 'Unit 5 · Topology',
    def: 'A circuit with more than one current path (branch) connected between the same two common nodes. Every parallel branch receives the exact same voltage, and branches operate independently!',
    eq: 'V_T = V₁ = V₂ = V₃ · I_T = I₁ + I₂ + I₃ · R_T < smallest R',
  },
  {
    keys: ["kirchhoff's current law", 'kirchhoffs current law', 'kcl', 'node'],
    title: "Kirchhoff's Current Law (KCL)",
    tag: 'Unit 5 · Core Law',
    def: 'The sum of all currents entering any circuit node (junction) must equal the sum of all currents leaving that node — charge never piles up or vanishes at a junction.',
    eq: 'I_in = I_out · I_T = I₁ + I₂ + I₃ + …',
  },
  {
    keys: ['product over sum', 'two resistors in parallel', 'equal resistors in parallel', 'r / n'],
    title: 'Parallel Resistance Shortcuts',
    tag: 'Unit 5 · Parallel Rules',
    def: 'General rule: 1/R_T = 1/R₁ + 1/R₂ + …; for two resistors: R_T = (R₁ × R₂)/(R₁ + R₂); for N equal resistors of value R: R_T = R / N. Adding a parallel branch ALWAYS lowers R_T and increases I_T!',
    eq: 'Two R: (R₁R₂)/(R₁+R₂) · N equal R: R / N · R_T < smallest branch R',
  },
  {
    keys: ['current divider', 'current-divider'],
    title: 'Current Divider Rule',
    tag: 'Unit 5 · Parallel Rule',
    def: 'Parallel branches divide total current INVERSELY to their resistances — the smallest resistor takes the largest branch current!',
    eq: 'I_x = I_T × (R_T / R_x) · For 2 branches: I₁ = I_T × R₂ / (R₁ + R₂)',
  },

  // ==================== UNIT 6: Series-Parallel Circuits ====================
  {
    keys: ['series-parallel', 'combination circuit', 'reduce and return', 'redraw', 'ladder network', 'ladder networks'],
    title: 'Series–Parallel Combination Circuit',
    tag: 'Unit 6 · Topology',
    def: 'A network containing both series and parallel relationships. Solve by reducing innermost series/parallel groups step-by-step to find R_T and I_T, then work backward using KVL, KCL, and Ohm’s law.',
    eq: '1. Combine innermost groups → R_T · 2. Find I_T = V_S / R_T · 3. Expand back',
  },
  {
    keys: ['loading effect', 'loaded voltage divider', 'stiff voltage divider', 'load resistor'],
    title: 'Loaded Voltage Divider & Loading Effect',
    tag: 'Unit 6 · Application',
    def: 'Connecting a load resistor R_L across a voltage-divider output places R_L in parallel with the bottom resistor R₂, lowering its equivalent resistance (R₂ ∥ R_L < R₂) and pulling the output voltage V_out DOWN. If R_L ≥ 10 × R₂, the divider is "stiff" (<10% drop).',
    eq: 'R_eq = R₂ ∥ R_L < R₂ → V_out drops! · Stiff rule: R_L ≥ 10 × R₂',
  },
  {
    keys: ['bleeder resistor', 'bleeder current'],
    title: 'Bleeder Resistor & Bleeder Current',
    tag: 'Unit 6 · Application',
    def: 'The bottom resistor in a loaded voltage divider (or a resistor across a power-supply filter) that carries a small continuous "bleeder current" even when loads are disconnected, stabilizing output voltage and safely discharging capacitors when power is turned off.',
    eq: 'I_bleeder = I_total − I_loads',
  },
];

const norm = s => String(s || '').toLowerCase()
  .replace(/[’‘]/g, "'")
  .replace(/[-‐–]/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();
const escRe = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
// whole-word containment; tolerates simple plural / verb endings on the needle ("opens", "opened")
const wordIn = (needle, hay) => new RegExp(`(^|[^a-z0-9µ_])${escRe(needle)}(s|es|ed|ing)?($|[^a-z0-9µ_])`).test(hay);

let INDEX = null;
const index = () => (INDEX ||= GLOSSARY.flatMap(item => item.keys.map(k => ({ k: norm(k), item }))));

export function lookupTerm(raw, contextText = '') {
  const clean = String(raw || '').replace(/\s+/g, ' ').trim();
  const low = norm(clean);
  const bare = low.replace(/\s*\([^)]*\)/g, '').trim();
  const isFormula = /[=÷×/]/.test(clean) && /[virpqwgt]/i.test(clean);

  // 1. Exact key match (also with any trailing "(unit)" removed, e.g. "ampere (A)")
  for (const q of [low, bare]) {
    const hit = index().find(e => e.k === q);
    if (hit) return hit.item;
  }
  // 2. Whole-word match, preferring the longest (most specific) key
  let best = null;
  for (const e of index()) {
    if (e.k.length < 3) continue;
    const score = wordIn(e.k, low) ? e.k.length * 2 : (low.length >= 4 && wordIn(low, e.k)) ? low.length * 2 : 0;
    if (score > (best?.score || 0)) best = { score, len: e.k.length, item: e.item };
  }
  if (best && (best.len >= 6 || !isFormula)) return best.item;
  // 3. Smart pattern detection for numbers, units, and formulas wrapped in [[...]]
  if (isFormula) {
    return {
      title: clean,
      tag: 'Key Formula',
      def: 'Core circuit-analysis equation relating electrical quantities. Keep all values in base SI units (V, A, Ω, W, s, C) or matching engineering prefixes (e.g., V ÷ kΩ = mA) when calculating.',
      eq: clean,
    };
  }
  if (/ω|\bohms?\b/i.test(clean)) {
    return {
      title: clean,
      tag: 'Resistance Value (Ω)',
      def: 'A resistance measurement in ohms (Ω). Remember: 1 kΩ = 1,000 Ω (10³ Ω) and 1 MΩ = 1,000,000 Ω (10⁶ Ω). Higher resistance opposes current more strongly.',
      eq: 'R = V / I · 1 kΩ = 10³ Ω · 1 MΩ = 10⁶ Ω',
    };
  }
  if (/(?<![a-zµ])(ma|µa|ua|na|amps?|a)(?![a-z])/i.test(clean) && /\d/.test(clean)) {
    return {
      title: clean,
      tag: 'Current Value (A)',
      def: 'An electrical current measurement in amperes (A). 1 mA = 10⁻³ A (0.001 A) and 1 µA = 10⁻⁶ A (0.000001 A).',
      eq: 'I = V / R = Q / t · 1 A = 1,000 mA = 1,000,000 µA',
    };
  }
  if (/\b(kv|mv|volt|volts|v)\b/i.test(clean) && /\d/.test(clean)) {
    return {
      title: clean,
      tag: 'Voltage Value (V)',
      def: 'A potential difference (voltage) measurement in volts (V). Voltage is the electrical pressure pushing charge through a circuit.',
      eq: 'V = I × R = W / Q',
    };
  }
  if (/\b(kw|mw|watt|watts|kwh|w)\b/i.test(clean) && /\d/.test(clean)) {
    return {
      title: clean,
      tag: 'Power / Energy Value',
      def: 'A power measurement in watts (W = J/s) or energy measurement in kilowatt-hours (kWh).',
      eq: 'P = V × I = I²R = V²/R',
    };
  }
  // 4. Contextual fallback using surrounding sentence
  const ctx = String(contextText || '').replace(/\s+/g, ' ').trim();
  return {
    title: clean,
    tag: 'Key Concept',
    def: ctx && ctx.length > clean.length + 10
      ? `Key takeaway from this section: "${ctx.slice(0, 220)}${ctx.length > 220 ? '…' : ''}"`
      : `"${clean}" is an important highlighted concept in EMNG1001 Circuit Analysis — remember this rule for practice problems and exams.`,
    eq: null,
  };
}

let popEl = null;
let activeTarget = null;

export function closeGlossaryPop() {
  if (popEl) { popEl.remove(); popEl = null; }
  if (activeTarget) { activeTarget.classList.remove('kw-open'); activeTarget = null; }
}

export function showGlossaryPop(targetEl) {
  if (!targetEl) return;
  if (activeTarget === targetEl && popEl) {
    closeGlossaryPop();
    return;
  }
  closeGlossaryPop();
  activeTarget = targetEl;
  targetEl.classList.add('kw-open');
  sfx.click?.();

  const raw = targetEl.textContent || '';
  const parentBlock = targetEl.closest('p, li, .ls-key, .ls-exam, .ls-lead, .ls-task, .ls-q-q, .g-bubble') || targetEl.parentElement;
  const ctx = parentBlock ? parentBlock.textContent : '';
  const info = lookupTerm(raw, ctx);

  popEl = document.createElement('div');
  popEl.className = 'kw-pop';
  popEl.setAttribute('role', 'dialog');
  popEl.setAttribute('aria-label', info.title);
  popEl.innerHTML = `
    <div class="kw-pop-head">
      <div>
        <span class="kw-pop-tag">⚡ ${info.tag}</span>
        <b class="kw-pop-title">${info.title}</b>
      </div>
      <button type="button" class="kw-pop-x" aria-label="Close definition">✕</button>
    </div>
    <p class="kw-pop-def">${info.def}</p>
    ${info.eq ? `<div class="kw-pop-eq">${info.eq}</div>` : ''}
    <div class="kw-pop-foot"><span>📖 Course Glossary</span><span>Esc to close</span></div>
  `;
  document.body.appendChild(popEl);

  popEl.querySelector('.kw-pop-x').onclick = e => {
    e.stopPropagation();
    closeGlossaryPop();
  };

  // Position cleanly above or below the clicked .kw chip within the viewport
  const r = targetEl.getBoundingClientRect();
  const pr = popEl.getBoundingClientRect();
  const pad = 12;
  const centerX = r.left + r.width / 2;
  let left = centerX - pr.width / 2;
  left = Math.max(pad, Math.min(window.innerWidth - pr.width - pad, left));
  let top = r.bottom + 10;
  let above = false;
  if (top + pr.height > window.innerHeight - pad && r.top - pr.height - 10 > pad) {
    top = r.top - pr.height - 10;
    above = true;
  }
  const caretX = Math.max(20, Math.min(pr.width - 20, centerX - left));
  popEl.style.left = `${Math.round(left)}px`;
  popEl.style.top = `${Math.round(Math.max(pad, top))}px`;
  popEl.style.setProperty('--caret-x', `${Math.round(caretX)}px`);
  popEl.classList.toggle('above', above);
  buddy.onGlossaryClick(info.title);
}

let initialized = false;
export function initGlossary() {
  if (initialized) return;
  initialized = true;

  document.addEventListener('click', e => {
    const kw = e.target.closest('.kw');
    if (kw) {
      // If inside a quiz option button (.ls-opt or .opt), only intercept if the option is already disabled/answered,
      // OR show the popover AND don't accidentally submit a wrong quiz answer when clicking the word itself!
      const optBtn = kw.closest('.ls-opt, .opt');
      if (optBtn && !optBtn.disabled) {
        // Let the user still click the option normally, or if they clicked directly on the .kw chip inside a question prompt:
        // Inside an active option button, let the option click happen so we don't block answering MCQs.
        return;
      }
      e.stopPropagation();
      showGlossaryPop(kw);
      return;
    }
    if (popEl && !e.target.closest('.kw-pop')) {
      closeGlossaryPop();
    }
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && popEl) {
      closeGlossaryPop();
      return;
    }
    if ((e.key === 'Enter' || e.key === ' ') && document.activeElement?.classList?.contains('kw')) {
      e.preventDefault();
      showGlossaryPop(document.activeElement);
    }
  });

  window.addEventListener('scroll', () => {
    if (popEl) closeGlossaryPop();
  }, { passive: true });
  window.addEventListener('hashchange', () => closeGlossaryPop());
}
