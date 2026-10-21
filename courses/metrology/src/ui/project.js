// project.js (view) - a shop project like the class workbook: a random part on a drawing, a worksheet of
// dimensions, and the tool reading for whichever dimension you pick. Uses the same saved lab state as the
// module labs (core/lab.js), one entry per dimension, so Next / picking a row / refresh behave the same way.
import * as L from '../core/lab.js';
import { getLab, putLab } from '../core/store.js';
import { newSeed } from '../core/rng.js';
import { TOOLS, checkAnswer } from '../sim/index.js';
import { PROJECTS, PART_NAMES, HOW, makePart, toolFor } from '../projects/index.js';
import { DRAW } from '../projects/drawings.js';
import { simHtml, stepsHtml, answerHtml, answerForm, readForm } from './blocks.js';

// The plain recorded value for the drawing and worksheet: 1-3/8", 1.437", 23.50 mm, 47°.
const recorded = (tool, spec) => tool.answer(spec).replace(/<small>.*<\/small>/, '').replace(/<[^>]+>/g, '').trim();

export function renderProject(view, id) {
  const project = PROJECTS.find(p => p.id === id);
  if (!project) { location.hash = '#/'; return; }
  const labId = `proj-${project.id}`;
  let part, rows, s;
  const load = seed => {
    part = makePart(project, seed);
    rows = part.features.map(f => {
      const [toolId, extra] = toolFor(project, f), tool = TOOLS[toolId];
      return { f, tool, spec: tool.snap({ ...tool.base, ...extra, value: f.value }) };
    });
  };
  const saved = getLab(labId);
  load(saved?.seed ?? 0);
  s = L.restore(saved, labId, rows.length) || L.createLab(labId, rows.length, newSeed());
  load(s.seed);
  let fb = null;

  const commit = (next, keepFb = false) => { if (!keepFb) fb = null; s = next; putLab(s); draw(); };

  function draw() {
    const done = {};
    rows.forEach((row, k) => { if (L.isSolved(s, k)) done[row.f.key] = recorded(row.tool, row.spec); });
    const cur = rows[s.current], desk = (s.seed % 24) + 1;
    const drawing = DRAW[part.type](part, { active: cur?.f.key, done });

    let panel;
    if (L.onSummary(s)) {
      panel = `<div class="summary"><h2>${s.solved.length === rows.length ? 'Part measured' : `${s.solved.length} of ${rows.length} recorded`}</h2>
        <p>${s.solved.length === rows.length ? 'Every dimension is on the worksheet. Try another part: every part is different.' : 'Pick any open row in the worksheet to finish it.'}</p>
        <div class="chips"><button class="btn primary" data-new>Measure a new part</button></div></div>`;
    } else {
      const { f, tool, spec } = cur, solved = L.isSolved(s), shown = solved || L.isRevealed(s);
      panel = `<section class="blk blk-problem"><div class="blk-tag">Measure ${f.key} · ${f.desc}</div>
          <p class="q">${HOW[f.kind]} <span class="dim-tool">${tool.name}</span></p>
          ${simHtml(tool, spec, shown)}
          ${solved ? '' : answerForm(tool, spec)}
          <p class="fb ${fb ? (fb.ok ? 'ok' : 'no') : ''}" role="status">${fb ? fb.text : solved ? `✓ Recorded: ${done[f.key]}` : ''}</p>
        </section>
        ${shown ? stepsHtml(tool, spec) + answerHtml(tool, spec) : ''}
        <div class="lab-nav">
          <button class="btn" data-go="${s.current - 1}"${s.current === 0 ? ' disabled' : ''}>← Back</button>
          ${!shown && L.triesAt(s) >= 2 ? '<button class="btn" data-reveal>Show the solution</button>' : ''}
          <button class="btn${solved ? ' go' : ''}" data-next>${s.current === rows.length - 1 ? 'Finish →' : solved ? 'Next dimension →' : 'Skip →'}</button>
        </div>`;
    }

    const sheet = rows.map((row, k) => `<tr class="${k === s.current ? 'cur' : ''}${L.isSolved(s, k) ? ' done' : ''}">
        <td><button class="row-btn" data-go="${k}">${row.f.key}</button></td><td>${row.f.desc}</td>
        <td class="num">${done[row.f.key] || (k === s.current ? '…' : '')}</td></tr>`).join('');

    view.innerHTML = `<p class="crumbs"><a href="#/">Course</a> / Shop projects / Project ${project.num}</p>
      <div class="lab-head"><h1 class="page-title">Project ${project.num}: ${project.title}</h1><span class="mod-meta">${s.solved.length}/${rows.length} recorded · saved in this browser</span></div>
      <p class="lede">Measure every dimension of this ${PART_NAMES[part.type].toLowerCase()} and fill in the worksheet, like the lab sheet in class. Each new part has different sizes.</p>
      <figure class="sheet">${drawing}
        <figcaption><span><b>${PART_NAMES[part.type]}</b> · Project ${project.num}</span><span>Tool: ${project.toolNote}</span><span>Units: ${project.unit === 'mm' ? 'mm' : 'inch'} · Desk ${desk}</span></figcaption>
      </figure>
      <div class="proj-grid">
        <div class="lab-body">${panel}</div>
        <div class="worksheet"><h2 class="ws-title">Worksheet</h2>
          <table class="ref ws"><thead><tr><th>Dim.</th><th>What</th><th>Reading</th></tr></thead><tbody>${sheet}</tbody></table>
          <button class="btn" data-new>New part</button></div>
      </div>`;

    view.querySelectorAll('[data-go]').forEach(b => b.addEventListener('click', () => commit(L.goTo(s, Number(b.dataset.go)))));
    view.querySelector('[data-next]')?.addEventListener('click', () => commit(L.next(s)));
    view.querySelector('[data-reveal]')?.addEventListener('click', () => commit(L.reveal(s)));
    view.querySelectorAll('[data-new]').forEach(b => b.addEventListener('click', () => {
      if (s.solved.length && s.solved.length < rows.length && !confirm('Measure a new part? This worksheet will be cleared.')) return;
      const seed = newSeed();
      load(seed);
      commit(L.createLab(labId, rows.length, seed));
    }));
    view.querySelector('form.answer-row')?.addEventListener('submit', e => {
      e.preventDefault();
      const { tool, spec } = rows[s.current], r = checkAnswer(tool, readForm(tool, e.target), spec);
      if (r.ok) { fb = { ok: true, text: `✓ Correct, recorded ${recorded(tool, spec)}` }; commit(L.solve(s), true); view.querySelector('[data-next]')?.focus(); }
      else {
        fb = { ok: false, text: r.msg || (L.triesAt(s) + 1 >= 2 ? 'Not quite. Try again, or open the solution below.' : 'Not quite. Try again.') };
        commit(L.miss(s), true);
        view.querySelector('form.answer-row input')?.focus();
      }
    });
  }
  draw();
}
