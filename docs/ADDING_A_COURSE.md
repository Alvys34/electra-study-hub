# Adding a course

1. Create `courses/<id>/index.html` and `courses/<id>/src/main.js`. The quickest start is to copy the Circuit Analysis
   course's `index.html` and keep its `<header id="topbar">` / `<main id="view">` shell.
2. Add an entry to `hub/courses.js` (`id`, `path: 'courses/<id>/'`, title, subject, blurb, `progressKey`). Give it a
   `summary(read)` so the hub can show the course's saved numbers and a "next" button: `read(key)` returns the
   parsed localStorage value or `null`, and `summary` returns `{ stats: [[label, value]], next: { label, href },
   more: [{ label, href }] }`, with each `href` a hash route inside the course (`#/...`).
3. Give the course its own `localStorage` keys, prefixed with the course id (Circuit Analysis uses `electra.*`), so
   courses never overwrite each other's progress.
4. Link back to the hub with `href="../../"`.
5. Run `npm run dev` and open the hub. `vite.config.js` picks up the new folder automatically.

## Shared code

Right now everything lives inside `courses/electra/`. When a second course needs one of its pieces (the 3D
`Stage`, the glossary chips, the lesson page, the progress store), move that piece to `shared/` and import it
from both courses, rather than copying it.
