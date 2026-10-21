# Mechanical Technician Study Hub

A home page of interactive courses. Each course is its own app in `courses/<id>/`, and the hub page lists them all.

| Course | Folder | What it covers |
|---|---|---|
| ⚡ Circuit Analysis | `courses/electra/` | EMNG1001: 10 units with study sheets, hands-on 3D bench steps, practice and a free 3D lab |
| 📐 Blueprint Reading & Metrology | `courses/metrology/` | CRN-20405: rules, conversions, calipers, micrometers, height gage and protractors, with movable instruments, a 10-problem lab per module, and shop projects 1–9 (measure a random part on a drawing) |

## Run it

```
npm install      # first time only
npm run dev      # open the address it prints (usually http://localhost:5173)
```

On Windows you can double-click `Start-Hub.bat` instead.

## Test it

```
npm test         # lab progression, answer parsing and every instrument's step-by-step maths
```

## Publish it

Every push to `main` builds the site and publishes it to GitHub Pages (`.github/workflows/pages.yml`).
Turn it on once in the repo: **Settings → Pages → Source: GitHub Actions**.

`npm run build` makes the same site locally in `dist/`; `npm run preview` serves it.

## Offline copy

`npm run standalone:electra` writes `release/Electra/Open Electra.html` (Circuit Analysis), a single file with everything inlined
that opens without a server or internet.

## Layout

```
index.html            the hub page
hub/                  hub code; courses.js lists the courses shown on the hub
courses/<id>/         one folder per course, each with its own index.html, src/, docs/
vite.config.js        builds the hub and every course folder that has an index.html
```

To add a course, see [docs/ADDING_A_COURSE.md](docs/ADDING_A_COURSE.md).
