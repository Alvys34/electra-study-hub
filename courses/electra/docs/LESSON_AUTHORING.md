# How to write an Electra lesson

Unit 2A (`src/lesson/unit2a.js`) is the approved reference. **Open it side by side with this guide.** Every new
unit is one data file in the same shape. The page (`LessonPage.js`) does all the rendering, so you mostly write
content.

Contents: 1. Lesson file shape · 2. The sheet (Read) · 3. Steps (Do) · 4. 3D bench API · 5. Registering ·
6. 2D visuals & porting old widgets · 7. Suggested outlines per unit · 8. Slide errors to avoid · 9. Checklist

---

## 1. Lesson file shape

```js
// src/lesson/unit2b.js
import { FIG } from './visuals.js';

export const LESSON_2B = {
  id: 'unit2b',            // must match the unit id used everywhere else (unit1a … unit6)
  code: '2B',              // shown in headers
  title: "Ohm's Law",
  color: '#22d3ee',        // accent colour (use the unit colour from src/learn/lessons.js UNITS)
  minutesRead: 5,          // honest estimate for the Read part
  sheet: [ /* sections, see §2 */ ],
  steps: [ /* Do steps, see §3 */ ],
};
```

Start by copying `docs/lesson-template.js`.

**Key terms:** wrap them like `[[Ohm's law]]` in any text field (sheet body, key, exam, step text, task text,
success, question, options, why). They render as yellow chips. Aim for 2–5 per section or step. Highlight the
term, not the whole sentence.

**HTML is allowed** in text fields (`<b>`, `<br>`, `<ul><li>`, `<sub>`). Keep it simple.

---

## 2. The sheet (Read part)

The full topic, readable like a good study sheet, and **printable** (the page has a print button). Cover *every*
slide of the unit, including worked examples, formulas and whatever the slide quiz tests.

```js
sheet: [
  {
    title: 'Open and closed circuits',               // short, plain
    body: `A [[closed circuit]] has a complete path…`, // 2–6 short sentences, lists welcome
    fig: FIG.openClosed,                              // optional: a function returning an SVG string (§6)
    key: 'Source + load + complete path = a working circuit.',      // optional "💡 Key idea" box
    exam: 'Open circuit → I = 0, and the whole source voltage…',    // optional "🎯 On the test" box
  },
]
```

Guidelines:
- 5–8 sections per unit, in slide order.
- Plain language first, then the formal term: "the push that moves charge, called [[voltage]]".
- Put formulas in the body, e.g. `[[I = V ÷ R]]`, or in `key`.
- Worked examples from the slides go in the body as a short numbered calculation.
- Use `exam` for anything the slide quiz asks, or a classic trap.

---

## 3. Steps (Do part)

8–12 steps. Each step is one idea from the sheet, made hands-on. The page shows, top to bottom:
**step title → `text` → "👉 Your move" (`how`) → the interaction → task checklist → feedback → check question →
Continue**. Continue unlocks only after all tasks are done **and** the question (if any) is answered correctly.
Wrong answers can be retried, and options are shuffled automatically.

### Fields

```js
{
  id: 'open',                     // unique within the lesson
  kind: '3d' | 'visual' | 'question',
  title: 'Open vs closed',
  text: 'A [[switch]] controls…', // 1–3 sentences: the idea being practised
  how: 'Click the switch\'s <b>black handle</b>…',  // REQUIRED for 3d/visual: exactly what to do (HTML ok)

  // kind '3d' only
  scene: {
    camera: { pos: [0, 6.0, 7.2], target: [0, 0.35, 0.1] },  // this default works for most layouts
    setup(g, s) { /* build parts + pre-wire, store refs on s */ },
    highlight(g, s) { return [/* terminals to glow + 👇 right now */]; }, // strongly recommended
    allowWiring: true,            // false = player can't add wires (only click parts)
    noWiringMsg: 'No wiring here. Click the switch!',
    on: { fuseBlown(g, s, slot) {…} },  // optional event handlers (§4)
  },

  // kind 'visual' only
  visual: 'switchLab',            // key in VISUALS (src/lesson/visuals.js)

  tasks: [                        // 3d: done(g, s) is polled every frame, in order
    { text: 'Open the switch', done: (g, s) => !s.sw.closed },
  ],                              // visual: no done(); the visual calls api.done()
  success: 'Lamp off. Now look at the meter…',   // shown when all tasks are done

  question: {                     // optional check question, shown after the tasks
    q: 'With the switch [[open]], the voltmeter across the gap reads…',
    options: ['12 V, the full source voltage', '0 V', '6 V', 'It can\'t be measured'],
    correct: 0,                   // index in YOUR list (it gets shuffled on screen)
    why: 'Current is zero, so…',  // shown after answering correctly
  },
}
```

`kind: 'question'` is a step with only a question (no interaction). Use it sparingly. Most steps should let him
*do* something.

### Writing good steps
- **One idea per step.** If you need "and then", split it into two steps.
- **`how` must be unambiguous.** Name the exact thing ("the red jack", "the supply's − post") and make
  `highlight()` glow exactly those terminals. When the player has started a wire (`g.pending`), highlight where it
  should go next. See the `build` and `ammeter` steps in `unit2a.js`.
- **Let him break things.** Shorts, blown fuses, a meter in the wrong mode. The engine reacts dramatically, and
  those are the moments he remembers.
- **The question should test the idea just practised**, with plausible wrong options built on real
  misconceptions.
- Pre-wire everything that isn't the point of the step (`{ locked: true }`), so the task stays small.

---

## 4. 3D bench API (`g` = Game, `s` = your per-step state object)

Coordinates: the bench is the XZ plane, Y up. In lessons the canvas is about 2:1, so keep parts within
**x ∈ [-4, 4], z ∈ [-2, 2]**. Proven positions: supply `[-3.4, 0, -1.2]`, a slot at `[2.4, 0, -0.4]`,
a switch at `[0.4, 0, 1.4]`, a meter at `[3.4, 0, 1.6]` with `rotY: -0.3`. All parts take `pos` and optional
`rotY`, `locked`.

### Parts (created in `setup`)

| Create | Terminals | Useful props / methods |
|---|---|---|
| `g.supply({ pos, V: 12, adjustable, min, max, step, on })` | `'+'`, `'-'` | `.V`, `.on`, `.tripped`, `.I`, `.nudge(±1)`. Trips "OVERLOAD" if > 3 A for ~1 s; reset with its green power button |
| `g.slot({ pos, content, accepts, locked, label, showValue, span })` | `'a'`, `'b'` | `.content`, `.I` (current a→b), `.Vd` (voltage a−b), `.set(content)` |
| `g.switch({ pos, closed, locked })` | `'a'`, `'b'` | `.closed`, `.toggle()` (click the handle in 3D) |
| `g.meter({ pos, mode, modes, rotY })` | `'red'`, `'com'` | `.mode` (`'OFF'`,`'V'`,`'A'`,`'Ω'`), `.value` (V, A or Ω), `.fuseBlown`, `.cycle()`. Restrict the dial with `modes: ['V']` |
| `g.bin({ pos, items, title, showValues })` | none | parts to drag into slots: click item → click slot |
| `g.add(Screen, { pos })` (import `Screen` from `../game/engine/Parts.js`) | none | `.draw((ctx, w, h) => {…})`: a monitor for graphs/readouts |

**Slot contents:**
- `{ type: 'resistor', R: 1000, tol: 5, mystery: false, Prated }`. Colour bands are drawn automatically.
  `mystery: true` tapes them over. `Prated` makes it glow when over-powered.
- `{ type: 'lamp', R: 50, Prated: 2.88, canBurn: false, dead: false }`. Brightness follows P/Prated.
  `dead: true` = open (a hidden fault).
- `{ type: 'fuse', rating: 1, blown: false }`. Blows automatically when |I| > rating.
- `accepts: ['resistor']` limits what the bin can drop into it.

**Wires:** `g.wire(termA, termB, { locked: true })`. Get terminals with `part.T('+')`, `part.T('a')`, etc. The
player adds wires by clicking two terminals and removes one by clicking it (unless it's locked).

**Queries for `tasks[].done`:**
- `g.joined(t1, t2)`: are two terminals connected through wires (directly or via other wires)?
- `Math.abs(slot.I) > 0.08`: current is flowing (a 50 Ω lamp on 12 V gives 0.24 A).
- `meter.mode === 'V' && Math.abs(meter.value - 12) < 0.2`: a meter reading.
- Helper used in 2A (copy it): `across(g, meter, t1, t2)`: the meter probes are across t1 and t2, either polarity.
- `g.wires.filter(w => !w.locked)`: the wires the player added.

**Events** (`scene.on`): `fuseBlown(slot)`, `overload()`, `burnout(slot)`, `meterFuse(meter)`, `ohmLive(meter)`,
`placed(slot, spec, oldSpec)`, `wired(wire)`, `probe(wire)`, `partClick(part)`, `change(reason)`. Each handler gets
`(g, s, …args)`. Defining one replaces the default dramatic message for that event (see `DEFAULT_REACTIONS` in
`Game.js`).

**Feedback & extras:** `g.say('text with [[terms]]')` shows a message under the bench. `g.mistake()` counts a
mistake. `g.stage.label(object3d, [x, y, z], 'html', 'itag')` adds a floating tag (2B/3A levels use it for
"I = 1.85 mA"). `g.stage.updaters.add(dt => …)` runs per-frame logic (cleared between steps).

**Physics notes:** wires are 0.01 Ω, supply internal R 0.05 Ω, voltmeter 10 MΩ, ammeter 0.05 Ω (its own fuse
blows above 2.5 A), and the ohmmeter injects 1 mA and shows `LIVE!` if powered. Series, parallel and combination
circuits all solve correctly, so you can build anything from the course.

**Working examples to copy:** `src/lesson/unit2a.js` (all steps) and `src/game/levels.js`. That has 12 tested scenes
including: an adjustable supply plus a V–I graph on a monitor (`2b-1`), a resistor swap from the bin (`2b-2`), a
mystery resistor (`2b-3`), series wiring with current tags (`3a-1`), a KVL ledger (`3a-2`), a divider designer
(`3a-3`), and a dead lamp in a series string (`3a-4`).

---

## 5. Registering a lesson

1. `src/lesson/LessonPage.js`: import your lesson and add it to `LESSONS_V2`:
   `export const LESSONS_V2 = { unit2a: LESSON_2A, unit2b: LESSON_2B };`
2. Routes then work automatically: `#/lesson/unit2b` (Read) and `#/lesson/unit2b/do` (Do).
3. Progress is stored as `store.get().learn['lesson-unit2b']` (Do progress) and `['lesson-unit2b-read']`.
4. Add it to the home screen's course map (part of the cleanup in `GEMINI_BRIEF.md` §5).

---

## 6. 2D visuals

**Static figures** for the sheet live in `FIG` in `src/lesson/visuals.js`. Each one is a function that returns an SVG
string. Reuse the drawing helpers there (`battery`, `lamp`, `fuseH`, `switchH`, `meter`, `chip`, `L`, `T`) and the
`.fg` CSS classes in `src/lesson.css` (`w` wire, `c` component, `lamp on`, `chip` with `--c` colour, `cap` caption).
Keep figures simple, about 560 × 200–270 viewBox, and dark-theme friendly (print CSS converts them).

**Interactive visuals** for `kind: 'visual'` steps live in `VISUALS`:

```js
export const VISUALS = {
  myVisual(host, api) {
    host.innerHTML = `…`;            // build your UI inside host
    // api.done()  → completes the step's tasks (shows success, then the question)
    // api.say(h)  → feedback line under the visual
    // api.miss()  → count a wrong attempt
    return () => {};                 // optional cleanup (timers, animation frames)
  },
};
```

**Port the old widgets.** `src/learn/widgets.js` has 15 tested mini-sims with the same `(host, api)` signature.
They call `api.done()` when their mission is met, so most port with no changes. Copy the function into
`VISUALS` (with its helpers and imports):

| Widget | Use in |
|---|---|
| `prefixSlider`, `notationMachine` | 1A |
| `resistorBuilder`, `wireLab` | 1B |
| `coulomb`, `flowToggle` | 1C |
| `ohmTriangle`, `ohmPlayground` | 2B |
| `seriesLab` | 3A |
| `powerHeat` | 4A |
| `atomBuilder` | 4B (or the 3D `ComponentModels.createBohrAtom` in `src/three/`) |
| `parallelLab` | 5 |
| `comboReducer`, `loadedDivider` | 6 |

Before deleting `src/learn/`, also look at `src/learn/lessons.js`. Its `sort` cards (passive/active,
primary/secondary cells, conductor/semiconductor/insulator) make good sorting visuals. `fuseVsBreaker` in
`visuals.js` is the pattern for those.

**Typed number answers.** The current question type is multiple choice. If a step needs a typed answer (unit
conversions, Ohm's law), add a `type: 'number'` question to `LessonPage.showQuestion` using `parseAnswer(text,
fixedUnit)` and `close(got, want, tol)` from `src/core/num.js`. `PracticeSession.checkNum` shows how (it accepts
"4.7k", "20 mA", "3e-6"). `src/practice/generators.js` can supply fresh-number questions: `makeProblem(unit, key)`.

---

## 7. Suggested outlines per unit

Starting points. Check every fact against `curriculum_overview.md`.

**1A Quantities & Units** (34 slides). Sheet: passive vs active · SI units (7 + 2) · electrical units table ·
scientific notation · engineering notation · operations with powers of 10 · metric prefixes & conversions (G…p) ·
metric arithmetic · significant digits & rounding. Do: sort passive/active · prefix slider · notation machine ·
convert 0.47 MΩ → kΩ (number) · ×/÷ powers of ten · count sig figs · round to 3 SF.

**1B Resistors** (40 slides). Sheet: resistance & conductance (G = 1/R) · fixed resistor types · pots vs
rheostats · 4- and 5-band colour code (mnemonic) · tolerance range · 3-digit & alphanumeric labels · R = ρL/A
with circular mils · AWG · temperature (PTC/NTC). Do: resistor builder · read a 3D resistor's bands, then confirm
with the ohmmeter (slot + meter in Ω) · tolerance range · wire lab · AWG question.

**1C Voltage & Current** (14 slides). Sheet: charge (6.25 × 10¹⁸ e⁻ = 1 C) · Coulomb's law · voltage V = W/Q ·
sources & cells (cathode/anode/electrolyte/separator), primary vs secondary · current I = Q/t · electron vs
conventional flow. Do: coulomb widget · sort primary/secondary · 3D: watch electron flow, then set the supply
voltage · flowToggle · I = Q/t calculation.

**2B Ohm's Law** (10 slides). Sheet: V, I, R review · Ohm's law three forms · direct proportion (V–I line) ·
inverse proportion (I vs R) · slide word problems. Do: triangle · `2b-1` V–I graph scene · double V → double I ·
`2b-2` resistor swap · `2b-3` mystery resistor · word problem.

**3A Series & KVL** (45 slides). Sheet: one path/same current · R_T sum · Ohm's law in series · sources in series
(reversed cell) · KVL · voltage divider rule · potentiometer · ground & V_A/V_B/V_AB · power in series ·
ideal vs real sources · troubleshooting opens/shorts. Do: `3a-1` wire a series loop · `3a-2` KVL ledger ·
`3a-3` divider designer · reversed battery (visual or 3D) · ground-referenced voltages (meter COM on ground) ·
`3a-4` find the dead lamp.

**4A Energy & Power** (12 slides). Sheet: energy (J), power (W = J/s) · kWh (1 kWh = 3.6 MJ) · P = VI = I²R =
V²/R · resistor power rating · amp-hours · efficiency. Do: adjustable supply plus a resistor with `Prated`, heat
it until it glows · choose a rating (powerHeat) · kWh calculation · Ah battery life · efficiency.

**4B Atomic Structure** (16 slides). Sheet: Bohr model · atomic number · shells & 2n² · valence electrons ·
ions · energy gap/conduction band · conductors/semiconductors/insulators (Cu, Si). Do: atom builder (2D or 3D
Bohr atom) · 2n² question · sort by valence · ion question.

**5 Parallel & KCL** (34 slides). Sheet: branches/nodes · same voltage · KCL · R_T < smallest (reciprocal
formula, conductance) · product-over-sum, equal values · current divider · current sources · power ·
troubleshooting (open branch, short). Do: 3D wire two lamps in parallel, remove one and the other stays lit ·
ammeters on branches to show KCL · R_T with ohmmeter (power off) · current divider question · open-branch
troubleshooting.

**6 Combination Circuits** (36 slides). Sheet: identifying series-parallel · reduce → solve → expand ·
worked example 1 (52 V; 100/270/390 Ω) · example 2 (10 V; R_T = 10 kΩ) · loaded voltage dividers · voltmeter
loading. Do: identify (visual) · comboReducer · 3D build R1 + (R2‖R3) and measure each part · loadedDivider ·
loading question.

---

## 8. Slide errors and quirks (don't copy these)

- **1A slide 23:** says "200 µA + 1.0 mA = 12,000 µA". It's **1,200 µA** (= 1.2 mA).
- **Ω printed as "W"** in several slides (font glitch): 1B quiz "82 W", "330 kW"; 4A "27 W resistor",
  "100 W resistor"; 5 "18.2 kW"; 6 quiz "1.0 kW". These are **ohms**.
- **6 slide 21:** "VR1 = 1 mA × 1 K = 3 V". R1 is actually **3 kΩ** (consistent with R_T = 10 kΩ).
- **1B mnemonic:** use the slide's version, "Big Boys Race Our Young Girls But Violet Generally Wins".
  `src/data/curriculumData.js` has a different one, so ignore it.
- **3A deck** is titled "UNIT 2C" on slide 1 but it's unit 3A in this app.
- **1C:** the slide calls the cathode the positive electrode and the anode negative. Keep the slide's convention.

---

## 9. Checklist before calling a unit done

Content
- [ ] Every slide's content appears in the sheet (including the slide quiz topics)
- [ ] All numbers checked against `curriculum_overview.md` (and §8 errors avoided)
- [ ] Key terms highlighted with `[[…]]` in every section and step (not whole sentences)

Steps
- [ ] 8–12 steps, one idea each, text ≤ 3 sentences
- [ ] Every 3d/visual step has a clear `how`, and 3D steps highlight the exact terminals
- [ ] Every step can be completed with the mouse, and it can't get stuck (e.g. a spare is restocked if he blows it again)
- [ ] Questions test the step's idea, with plausible distractors and a helpful `why`

Quality
- [ ] Played start to finish from the home screen with no console errors
- [ ] Nothing in the 3D scene is cut off at 1280×720 or hidden behind UI
- [ ] Printing the Read part gives a clean study sheet
- [ ] `npm run build` passes
