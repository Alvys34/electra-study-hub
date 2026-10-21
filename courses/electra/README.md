# ⚡ Electra · Circuit Analysis (EMNG1001)

Read the sheet, do the lab, then practice. Ten units (1A → 6), each with a **Read** study sheet and a **Do**
part of hands-on steps, many of them on a real-time 3D workbench with a circuit solver.

Open it from the hub (`npm run dev` at the repo root), or go straight to `/courses/electra/`.

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

Progress is saved in the browser under `electra.progress.v2`, `electra.last.v1` and `electra.freelab.v1`.
