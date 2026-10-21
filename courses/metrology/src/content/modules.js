// modules.js - the six modules of CRN-20405, in class order. Text is written for this site from the course
// outline; the school's PDFs and slides stay out of the repo. Block types: h, p, ul, tip, table, fracs,
// explore (a live instrument) and example (a worked problem). `lab` is the recipe for the 10 lab problems.

const FRACS = [
  ['1/64', '.0156'], ['1/32', '.0313'], ['3/64', '.0469'], ['1/16', '.0625'], ['3/32', '.0938'], ['1/8', '.125'],
  ['5/32', '.1563'], ['3/16', '.1875'], ['7/32', '.2188'], ['1/4', '.250'], ['9/32', '.2813'], ['5/16', '.3125'],
  ['11/32', '.3438'], ['3/8', '.375'], ['13/32', '.4063'], ['7/16', '.4375'], ['15/32', '.4688'], ['1/2', '.500'],
  ['9/16', '.5625'], ['5/8', '.625'], ['11/16', '.6875'], ['3/4', '.750'], ['13/16', '.8125'], ['7/8', '.875'], ['15/16', '.9375'],
];

export const MODULES = [
  {
    id: '1', num: 'I', title: 'Lab protocol and the steel rule',
    intro: 'How to treat a measuring tool, and how to read fractional, decimal and metric rules.',
    goals: ['Follow the metrology lab protocol', 'Read a fractional rule to 1/64" and simplify the fraction', 'Read decimal-inch and metric rules', 'Know how close a rule can measure'],
    blocks: [
      { h: 'Before you measure' },
      { ul: [
        '<b>Clean</b> the part and the tool. Chips, dirt and oil add thousandths.',
        '<b>Let hot parts cool.</b> Steel grows when warm. Measure close to room temperature (20 °C).',
        '<b>Check zero.</b> Close the tool on nothing (or on its standard) and make sure it reads zero.',
        '<b>Same light pressure every time.</b> Use the ratchet or friction thimble on a micrometer.',
        '<b>Square to the part.</b> A tilted tool reads big.',
        '<b>Look straight at the scale</b>, not from the side (parallax).',
        '<b>Measure two or three times</b> and write down the units: inch to 3 places (.001), metric to 2 places (0.01).',
        '<b>Put tools away clean</b> in their case, jaws or anvils slightly open.',
      ] },
      { tip: 'Your class slides have the full lab protocol. This is the short version to keep in your head at the bench.' },

      { h: 'The fractional rule' },
      { p: 'An engineering rule has four edges, usually in 1/8, 1/16, 1/32 and 1/64 of an inch. The longer the line, the bigger the fraction: inch, then 1/2, 1/4, 1/8, 1/16, 1/32, 1/64.' },
      { p: 'To read it: count whole inches, then count the small marks past the last inch, then simplify.' },
      { explore: 'rule-frac', spec: { grad: 16, value: 1 + 6 / 16 }, caption: 'Drag the rule left or right. The dashed box on the small rule shows where the magnifier is. Blue lines are the marks you count.' },
      { p: 'Always simplify: 8/16 = 4/8 = 2/4 = 1/2. Keep dividing top and bottom by 2 until one of them is odd.' },
      { example: 'rule-frac', spec: { grad: 32, value: 2 + 14 / 32 } },
      { example: 'rule-frac', spec: { grad: 64, value: 1 + 23 / 64 } },

      { h: 'The decimal rule' },
      { p: 'The decimal edge splits each inch into 10, 50 or 100 parts. The numbered lines are tenths (.100"). On the 1/50 edge each small mark is .020"; on the 1/100 edge it is .010".' },
      { explore: 'rule-dec', spec: { grad: 0.02, value: 2.34 } },
      { example: 'rule-dec', spec: { grad: 0.01, value: 3.47 } },

      { h: 'The metric rule' },
      { p: 'Lines every millimetre, numbers every 10 mm. The finer edge also has half-millimetre lines.' },
      { explore: 'rule-mm', spec: { value: 23.5 } },
      { example: 'rule-mm', spec: { value: 67.5 } },

      { h: 'How close can a rule get?' },
      { table: { head: ['Rule', 'Accuracy'], rows: [['Fractional inch', '±1/64"'], ['Decimal inch', '±.020"'], ['Metric', '±0.5 mm']] } },
      { tip: 'For anything tighter than that, use a caliper or micrometer (modules III–VI).' },
    ],
    lab: [
      { tool: 'rule-frac', n: 2, spec: { grad: 16 } },
      { tool: 'rule-frac', n: 2, spec: { grad: 32 } },
      { tool: 'rule-frac', n: 2, spec: { grad: 64 } },
      { tool: 'rule-dec', n: 2 },
      { tool: 'rule-mm', n: 2 },
    ],
  },

  {
    id: '2', num: 'II', title: 'Unit conversions and engineering fractions',
    intro: 'Fractions to decimals and back, and inches to millimetres. You will use these on every print.',
    goals: ['Turn any 64th into a decimal', 'Turn a decimal into the nearest fraction in lowest terms', 'Convert between inches and millimetres'],
    blocks: [
      { h: 'Fractions are halves of halves' },
      { p: 'Inch fractions are built on 2: 1/2, 1/4, 1/8, 1/16, 1/32, 1/64. That is why a fraction always simplifies by dividing by 2: 14/16 = 7/8, 28/32 = 7/8.' },
      { p: 'Canada uses both inch and metric in shops, so you need to move between all three: fraction, decimal inch and millimetres.' },

      { h: 'Fraction to decimal' },
      { p: 'A fraction is a division. Divide the top by the bottom.' },
      { example: 'convert', spec: { kind: 'f2d', value: 20 } },
      { example: 'convert', spec: { kind: 'f2d', value: 88 } },

      { h: 'Know these by heart' },
      { fracs: FRACS },
      { tip: 'Learn the 8ths first (.125, .250, .375, .500, .625, .750, .875). Every 16th sits halfway between two of them, ±.0625.' },

      { h: 'Decimal to fraction' },
      { p: 'Multiply the decimal by 64 to count 64ths, then simplify.' },
      { example: 'convert', spec: { kind: 'd2f', value: 28 } },

      { h: 'Inch and millimetre' },
      { p: '<b>1 inch = 25.4 mm</b>, exactly. So inch to mm: multiply by 25.4. mm to inch: divide by 25.4. (1 mm is about .0394".)' },
      { example: 'convert', spec: { kind: 'in2mm', value: 1250 } },
      { example: 'convert', spec: { kind: 'mm2in', value: 1270 } },

      { h: 'Place values' },
      { table: { head: ['Decimal', 'Say it', 'As a fraction'], rows: [['.1', 'one tenth / a hundred thou', '1/10'], ['.01', 'one hundredth / ten thou', '1/100'], ['.001', 'one thousandth / one thou', '1/1000']] } },
    ],
    lab: [
      { tool: 'convert', n: 3, spec: { kind: 'f2d' } },
      { tool: 'convert', n: 3, spec: { kind: 'd2f' } },
      { tool: 'convert', n: 2, spec: { kind: 'in2mm' } },
      { tool: 'convert', n: 2, spec: { kind: 'mm2in' } },
    ],
  },

  {
    id: '3', num: 'III', title: 'Vernier calipers and protractors',
    intro: 'Read inch and metric vernier calipers, the dial caliper, and plate and bevel protractors.',
    goals: ['Read an inch vernier caliper to .001"', 'Read a metric vernier caliper to 0.02 mm', 'Read a dial caliper', 'Read a bevel protractor to 5 minutes'],
    blocks: [
      { h: 'How a vernier works' },
      { p: 'The sliding plate (the vernier) has 25 lines in the space of 24 lines on the main scale. Each vernier space is .001" shorter, so only one vernier line can line up exactly. Its number is your thousandths.' },
      { p: 'Read it in three parts: the main scale up to the vernier 0, the small .025 lines after that, then the vernier line that lines up.' },
      { explore: 'vernier-in', spec: { value: 1.437 }, caption: 'Drag the main scale. The blue line is the last main line before the vernier 0; the amber pair is the line that lines up.' },
      { example: 'vernier-in', spec: { value: 2.163 } },

      { h: 'Metric vernier (0.02 mm)' },
      { p: '50 vernier lines fit in 49 mm, so each line is worth 0.02 mm. The vernier numbers 1 to 10 are tenths of a millimetre (every 5th line).' },
      { explore: 'vernier-mm', spec: { value: 41.36 } },
      { example: 'vernier-mm', spec: { value: 18.74 } },

      { h: 'Dial caliper' },
      { p: 'Same caliper, easier to read: the bar gives inches and tenths, the dial gives the rest. One full turn of the needle is .100".' },
      { explore: 'dial-in', spec: { value: 2.368 } },
      { example: 'dial-in', spec: { value: 1.284 } },

      { h: 'Four ways to use a caliper' },
      { ul: ['<b>Outside</b> jaws: diameters and thicknesses.', '<b>Inside</b> jaws: bores and slots.', '<b>Depth</b> rod: hole and step depths.', '<b>Step</b>: the ends of the jaws, for shoulder heights.'] },

      { h: 'Plate protractor' },
      { p: 'Reads whole degrees. Line up the blade, then read the scale where the blade edge crosses it.' },
      { explore: 'prot-plate', spec: { value: 47 } },

      { h: 'Universal bevel protractor' },
      { p: 'The dial is numbered 0 to 90 to 0 to 90 around the circle. The vernier has 12 lines on each side of its 0, and each line is <b>5 minutes</b> (60′ = 1°).' },
      { p: '<b>The rule that catches people:</b> read the vernier on the same side of its 0 that the dial numbers are growing. On the other side a line also lines up, and it gives the wrong minutes.' },
      { explore: 'prot-bevel', spec: { value: 23 * 60 + 35 }, caption: 'Drag the dial. Tick the box to flip which way the numbers grow, and watch which vernier side you need.' },
      { example: 'prot-bevel', spec: { value: 23 * 60 + 35, mirror: false } },
      { example: 'prot-bevel', spec: { value: 61 * 60 + 20, mirror: true } },
    ],
    lab: [
      { tool: 'vernier-in', n: 3 },
      { tool: 'vernier-mm', n: 2 },
      { tool: 'dial-in', n: 1 },
      { tool: 'prot-plate', n: 1 },
      { tool: 'prot-bevel', n: 3 },
    ],
  },

  {
    id: '4', num: 'IV', title: 'The inch micrometer',
    intro: 'Parts of a micrometer, reading it to .001", and the habits that keep it accurate.',
    goals: ['Name the parts of an outside micrometer', 'Read the sleeve and thimble to .001"', 'Use the ratchet and check zero'],
    blocks: [
      { h: 'Parts' },
      { ul: ['<b>Frame</b>: the C-shaped body. Hold it by the insulated part so your hand doesn’t warm it.', '<b>Anvil</b> and <b>spindle</b>: the two measuring faces.', '<b>Sleeve</b> (barrel): the fixed scale with the reference line.', '<b>Thimble</b>: turns with the spindle; its edge has 25 lines.', '<b>Ratchet</b> or friction stop: gives the same pressure every time.', '<b>Lock</b>: holds a reading. Don’t turn the thimble while it is locked.'] },

      { h: 'Reading it' },
      { p: 'The spindle screw has 40 threads per inch, so one turn of the thimble moves it <b>.025"</b>.' },
      { ul: ['Sleeve numbers are tenths: 1 = .100", 2 = .200" …', 'Small sleeve lines between them are .025" each.', 'Each thimble line is .001" (25 lines × .001 = one turn of .025").'] },
      { explore: 'mic-in', spec: { value: 0.587 }, caption: 'Drag the thimble. Watch the lines roll around it as it turns.' },
      { example: 'mic-in', spec: { value: 0.587 } },
      { example: 'mic-in', spec: { value: 0.906 } },

      { h: 'Good habits' },
      { ul: ['Wipe the anvil and spindle faces, then check zero with them closed (2–3 clicks of the ratchet).', 'Close on the part with the ratchet, never by forcing the thimble.', 'Never spin the micrometer by the frame to open it.', 'Store it with the faces slightly apart.'] },
      { tip: 'Some micrometers also have a vernier on the sleeve that reads .0001". Your class will say when you need it.' },
    ],
    lab: [
      { tool: 'mic-in', n: 8 },
      { tool: 'convert', n: 2 },
    ],
  },

  {
    id: '5', num: 'V', title: 'Metric micrometer and height gage',
    intro: 'Reading a metric micrometer to 0.01 mm, and measuring heights from a surface plate.',
    goals: ['Read a metric micrometer, including the half-millimetre lines', 'Read a vernier height gage to .001"', 'Set up a height gage on a surface plate'],
    blocks: [
      { h: 'Metric micrometer' },
      { p: 'One turn of the thimble moves the spindle <b>0.5 mm</b>. The thimble has 50 lines, so each is 0.01 mm.' },
      { ul: ['Top sleeve lines: whole millimetres (numbered every 5).', 'Bottom sleeve lines: the half millimetres in between.', 'If a bottom line shows past the last top line, add 0.50 mm.'] },
      { explore: 'mic-mm', spec: { value: 7.83 } },
      { example: 'mic-mm', spec: { value: 7.83 } },
      { example: 'mic-mm', spec: { value: 18.56 } },

      { h: 'Vernier height gage' },
      { p: 'A height gage is a vernier caliper standing up. It measures from the surface plate to a feature, so the plate is your zero.' },
      { ul: ['Clean the surface plate, the gage base and the part.', 'Bring the scriber down onto the plate and check that it reads zero.', 'Raise the slider to the feature, lock it, then use the fine adjust.', 'Read it like an inch vernier: main scale, .025 lines, then the vernier line that lines up.'] },
      { explore: 'height-in', spec: { value: 3.718 }, caption: 'Drag the scale up or down.' },
      { example: 'height-in', spec: { value: 5.241 } },
    ],
    lab: [
      { tool: 'mic-mm', n: 5 },
      { tool: 'height-in', n: 5 },
    ],
  },

  {
    id: '6', num: 'VI', title: 'Depth micrometer and review',
    intro: 'The micrometer that reads backwards, then a mixed review of every instrument.',
    goals: ['Read a depth micrometer where the reading hides under the thimble', 'Add the rod length for deeper rods', 'Read any instrument from the course'],
    blocks: [
      { h: 'Depth micrometer' },
      { p: 'The base sits on the top of the part and the rod goes down into the hole. As the depth grows, the thimble moves <b>down over the sleeve</b>, so the numbers run the other way.' },
      { p: '<b>The reading is what the thimble has covered</b>, not what you can see. The first line you can still see is the next one up, so it is too big.' },
      { explore: 'depth-in', spec: { value: 0.314 }, caption: 'Drag the thimble. Tick "See through the thimble" to show the hidden lines.' },
      { example: 'depth-in', spec: { value: 0.314 } },
      { example: 'depth-in', spec: { value: 0.662 } },
      { tip: 'Rods come in 1" steps (0–1, 1–2, 2–3 …). With the 1–2" rod, add 1.000" to the reading.' },

      { h: 'Review' },
      { p: 'The lab below mixes every instrument from the course, like the mid-term review. Use <a href="#/practice/rule-frac">Practice</a> for any tool you want more of.' },
    ],
    lab: [
      { tool: 'depth-in', n: 4 },
      { tool: 'rule-frac', n: 1, spec: { grad: 64 } },
      { tool: 'convert', n: 1 },
      { tool: 'vernier-in', n: 1 },
      { tool: 'prot-bevel', n: 1 },
      { tool: 'mic-in', n: 1 },
      { tool: 'mic-mm', n: 1 },
    ],
  },
];
