# Electra: brief for the next build

You're picking up **Electra**, a study app for the college course **EMNG1001 Circuit Analysis**. It's for one
student who has ADHD and gets bored easily. He tested **Unit 2A** in its current form and loved it. Your job is to
roll that format out to the rest of the course, clean up the app, and turn the old game levels into a free 3D lab.

Read this whole file before changing anything, then read `docs/LESSON_AUTHORING.md`.

---

## 1. What already exists (and what's good)

| Part | Where | Status |
|---|---|---|
| **Unit 2A lesson** (the reference) | `src/lesson/unit2a.js`, `src/lesson/LessonPage.js`, `src/lesson/visuals.js`, `src/lesson.css` | ✅ **The gold standard. Copy this format.** Route: `#/lesson/unit2a` (Read) and `#/lesson/unit2a/do` (Do) |
| 3D bench engine | `src/game/engine/` (`Game.js`, `Parts.js`, `Stage.js`, `circuit.js`) | ✅ Solid. Real circuit solver (nodal analysis), live current, electron particles, wiring, parts bin, multimeter. Reuse it. |
| 12 game levels (2A, 2B, 3A) | `src/game/levels.js`, `src/game/GameUI.js`, `src/game/GameScreen.js`, route `#/play/<id>` | ⚠️ To be **replaced by the Free Lab** (section 4). Their scene setups for 2B/3A are useful references for new lessons. |
| Practice problems | `src/practice/generators.js` (+ `PracticeSession.js`) | ✅ ~60 problem types, fuzz-tested. Keep. Use them in lessons or as a Practice tab. |
| Old quick-read cards + mini-widgets | `src/learn/` | ⚠️ Superseded by lessons. **Retire** once every unit has a new lesson, but port useful widgets first (see `docs/LESSON_AUTHORING.md` §6). |
| Old Gemini 3D scenes | `src/modules/`, `src/three/`, `src/ui/StudyHUD.js`, route `#/lab/<unit>` | ⚠️ Retire. The Free Lab replaces them. `ComponentModels.createBohrAtom` is worth salvaging for 4B. |
| Course content | `curriculum_overview.md` (all slide text), `curriculum/*.pptx` (original decks with images) | Source of truth for every lesson. |
| Launcher | `Start-Electra.bat` (runs `npm run dev -- --open`) | Keep working. |

---

## 2. What the student told us (design rules)

These come from watching him use it. Treat them as requirements.

1. **Read first, then do.** He wants the whole topic as a readable **study sheet** first (Part 1), then hands-on
   steps (Part 2). Don't drop him into an interactive scene without context.
2. **Text on top, interaction below** (like Brilliant). Each Do step is one idea: short text → one interaction →
   a task and/or a check question that unlocks **Continue**.
3. **Always say exactly what to do.** Every interactive step has a "👉 Your move" instruction, and on 3D steps the
   exact terminals to click **glow with a bouncing 👇** (`scene.highlight`). The first game failed because he
   didn't know what to do. Never repeat that.
4. **Key terms must stand out.** Wrap every key term in `[[double brackets]]` and it renders as a yellow chip.
   Every section and step should have a few. Don't highlight whole sentences.
5. **Short.** ADHD-friendly: one idea per step, about 1–3 sentences of text, no walls of text. A unit's Do part is
   about 8–12 steps.
6. **Mix 3D and simple visuals.** Use the 3D bench when there's something physical to do (wire, measure, break,
   swap). Use simple 2D visuals for classification, symbols and number skills.
7. **Laptop first**, but it must not break on a phone.
8. **Accuracy matters.** It's real coursework. All numbers and facts come from the slides. Known slide errors are
   listed in `docs/LESSON_AUTHORING.md` §8. Don't copy them.

---

## 3. Workstream A: build the remaining units as lessons

Build one lesson per unit, **in this order**, each in its own file `src/lesson/<unitId>.js`, following
`docs/LESSON_AUTHORING.md` and copying `docs/lesson-template.js`:

`unit1a` → `unit1b` → `unit1c` → `unit2b` → `unit3a` → `unit4a` → `unit4b` → `unit5` → `unit6`

For each unit:

1. Read its section of `curriculum_overview.md`. Open the `.pptx` too if a slide's meaning depends on an image.
2. Write the **sheet** (Read part): 5–8 sections that cover *everything* on the slides, including worked examples
   and the slide quiz topics.
3. Write the **steps** (Do part): 8–12 steps that let him try each sheet section. Use the suggested outline in
   `docs/LESSON_AUTHORING.md` §7 as a starting point.
4. Register it (see `docs/LESSON_AUTHORING.md` §5) and play it start to finish yourself.
5. Run the checklist in `docs/LESSON_AUTHORING.md` §9. **Don't move to the next unit until the current one passes.**

> Tip: build `unit2b` and `unit3a` early if you want quick wins. `src/game/levels.js` already has tested 3D
> scenes for them (Ohm's-law graph monitor, resistor swap from the bin, mystery resistor, KVL ledger, divider
> designer, dead-lamp troubleshooter). Lift those scene setups into lesson steps.

---

## 4. Workstream B: Free Lab (replaces the game levels)

Turn the 3D bench into a **free sandbox**: a lab where you can take any part, put it on the bench, connect things,
and see what happens, as if in a real electronics lab. No goals or levels.

Requirements:

- Full-screen 3D bench (reuse `Stage` + `Game` + `Parts`). Route `#/lab`, linked from the home screen as
  "🧪 Free Lab".
- **Parts shelf** (side panel) to add parts: power supply (adjustable V), lamp, resistor (pick the value: E12
  values, or type one in), switch, fuse (pick rating), multimeter, and optionally the bench monitor.
- **Place / move / delete** parts on the bench (drag to move, a delete key or button to remove).
  *Engine note:* wires are built from terminal world positions when they're created, so when a part moves, rebuild
  the wires attached to it. `Game` has no `removePart` yet, so add one (remove group, unregister pickables,
  remove labels, delete attached wires).
- **Wiring** works exactly as now (click terminal → click terminal; click a wire to delete it).
- **Edit a part** by clicking it: small popover for value (R, V, fuse rating), lock/unlock, delete.
- Live readouts stay (supply V/A display, meter, current tags on hover, electron flow, glow, fuse blowing,
  overload trip). Sparky isn't needed. Use short toasts for events (fuse blown, overload, meter-fuse).
- Optional: "Save bench / Load bench" to localStorage, and 3–4 starter templates (empty bench, series loop,
  parallel lamps, voltage divider).
- **Blender is available** if you want better models. Export glTF/GLB, load with `GLTFLoader`
  (`three/examples/jsm/loaders/GLTFLoader.js`), and keep each part's terminal positions and the `Part` API
  (`terminals`, `elements()`, `after()`) unchanged so the solver and wiring keep working. Keep models light
  (< 2 MB total).

When the Free Lab works, remove the `#/play/*` levels (`src/game/levels.js`, `GameUI.js`, `GameScreen.js`) and the
star/level UI on the home screen. Keep `src/game/engine/`. The lessons depend on it.

---

## 5. Workstream C: UI/UX cleanup

The home screen grew in layers and needs one coherent design. Target layout:

1. **Header:** brand, level/XP, streak, focus-sprint timer, sound toggle (keep these, they work).
2. **Hero:** one "Continue" button that goes to the next unfinished lesson step.
3. **Course map:** one card per unit (1A → 6) in course order. Each shows the title, a short blurb, Read ✓ / Do
   progress, and opens the lesson. Units without a lesson yet show "coming soon".
4. **Practice:** the existing 90-sec blitz, exam mix, review misses and per-unit practice (from
   `src/practice/`).
5. **Tools:** 🧪 Free Lab, 📄 all study sheets (printable), 🃏 concept cards (or fold into study sheets).

Retire (delete the code and routes, don't just hide them) as each replacement lands:

- "More units" section and old quick-read cards (`src/learn/*`, route `#/learn/*`), once that unit's lesson exists.
- Old 3D lab (`#/lab/<unit>`, `src/modules/`, `src/three/SceneManager.js`, `src/ui/StudyHUD.js`, the
  `#labView` markup in `index.html`).
- Game levels (`#/play/*`), once the Free Lab exists.
- Hard-coded `unit2a` references in `src/ui/Home.js` and `LessonPage.finish()` (the "Play the bench levels" link).
  Make them generic.

General polish:

- One visual language: keep the existing dark theme tokens in `src/app.css :root` and the fonts. Remove unused CSS
  (`src/styles.css` is mostly for the old lab).
- Consistent spacing, button styles and card styles across Home, Lesson and Practice.
- Visible focus states, keyboard support (Enter = continue, 1–4 = answer), `prefers-reduced-motion` respected.
- Check at 1280×720, 1366×768, 1920×1080 and 390×844 (phone). No horizontal scroll, and nothing important
  hidden behind overlays.

---

## 6. Rules of the road

- **Don't break Unit 2A.** It's the approved reference. You may restyle it in the cleanup, but keep its content
  and flow.
- Keep saved progress working. Storage lives in `src/core/store.js` (`localStorage` key `electra.progress.v2`).
  If you change the shape, migrate old data instead of wiping it.
- No new frameworks. It's plain ES modules + Vite + three.js. Keep it that way.
- Run `npm run build` before you finish. It must build with no errors.
- Test like the student would: run `Start-Electra.bat`, start from the home screen, and play every new lesson to the
  end with mouse only.

## 7. Done means

- [ ] All 10 units have a Read + Do lesson that passes the checklist in `docs/LESSON_AUTHORING.md` §9
- [ ] Free Lab works (add/move/delete parts, wire anything, readings make physical sense)
- [ ] Home screen rebuilt as in §5. Old learn cards, old lab and game levels removed
- [ ] `npm run build` passes, no console errors, tested at the four screen sizes
