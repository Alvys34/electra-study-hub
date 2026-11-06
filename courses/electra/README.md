# ⚡ Circuit Analysis (EMNG1001)

Read the sheet, do the lab, then practice. Ten units (1A → 6), each with a **Read** study sheet and a **Do**
part of hands-on steps, many of them on a real-time 3D workbench with a circuit solver.

Open it from the hub (`npm run dev` at the repo root), or go straight to `/courses/electra/`.

## In-class Labs 6–9 (`#/labs`)

Lab 6 combination circuits, Lab 7 Multisim and wye-delta networks, Lab 8 RC circuits, Lab 9 AC response of RC
circuits. Each lab has a **lesson** (overview, concepts and procedure in short sections, each with its diagram beside
it) and a **guided mode** (`#/labs/<n>/guide`): one action per screen with what to do, what to observe, what is
happening and what to watch out for, plus Back / Next, saved progress and an exit back to the lesson.

- The lab tables are a notebook the student fills in. Every field is tagged Measured, Multisim, Your calculation or
  Observation. Nothing is pre-filled, and the app never writes a measurement.
- Calculators show each step (rule, substitution with units, result, meaning) from the student's own readings. They
  switch to nominal values only when "Example (nominal)" is picked, and then say so in a banner. A ✓ appears when
  the student's own calculated value matches the working.
- Light and dark mode and a motion switch are in the labs' top bar. Both, and the notebook and guided progress, are
  saved in the browser under `electra.labs.v1`.

Where it lives: `src/labs/` (`LabsPage.js` the views, `lab6.js`–`lab9.js` the content, `figures.js` + `svg.js` the
circuit drawings, `labkit.js` the notebook and calculators, `widgets.js` the explainers, `labs.css` the styles).
The lab sheets themselves are not in the repo: the content is written in our own words, with the sheets' circuits,
values and procedure order.

**Open it locally:** `npm install` then `npm run dev` at the repo root and go to Circuit Analysis → In-class labs.
For a no-server copy, `npm run standalone:electra` and open `release/Circuit Analysis/Open Circuit Analysis.html`.

**Host it on GitHub Pages:** it is already part of the hub site. Pushing to `main` deploys it
(`.github/workflows/pages.yml`). The labs are at `<site>/courses/electra/#/labs`.

## Where things live

- `src/lesson/unit*.js`: the lessons, one file per unit (sheet sections + steps). `[[term]]` = highlighted key term.
- `src/lesson/LessonPage.js`, `visuals.js`, `widgets.js`: the lesson page and its 2D interactives
- `src/game/engine/`: the 3D bench (parts, wiring, nodal-analysis circuit solver)
- `src/lab/FreeLab.js`: the free 3D sandbox (`#/lab`)
- `src/practice/`: practice problem generators and the practice session
- `src/core/`: progress store, glossary, number formatting, effects
- `curriculum/` (not in git): the course slide text, the source of truth for lesson content
- `docs/LESSON_AUTHORING.md`, `docs/lesson-template.js`: how to write a lesson
- `docs/GEMINI_BRIEF.md`: the original build brief (its paths are relative to this folder)

The school's slides are not in the repo, because the repo is public: neither the `.pptx` decks nor the text
pulled from them (`curriculum_overview.md`, `curriculum_summary.json`, made with `tools/parse_curriculum.py`).
Keep them locally in `courses/electra/curriculum/`; `.gitignore` skips that folder.

Progress is saved in the browser under `electra.progress.v2`, `electra.last.v1`, `electra.freelab.v1` and `electra.labs.v1`.
