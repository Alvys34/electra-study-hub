// lab.js (view) - a module's 10-problem lab. The saved lab state is the only source of truth: every click
// changes it through core/lab.js, saves it, then redraws the page from it.
import * as L from '../core/lab.js';
import { getLab, putLab } from '../core/store.js';
import { newSeed } from '../core/rng.js';
import { checkAnswer } from '../sim/index.js';
import { makeProblems, countOf } from './problems.js';
import { problemHtml, stepsHtml, answerHtml, answerForm, readForm } from './blocks.js';

export function renderLab(view, mod) {
  const id = `lab-${mod.id}`, count = countOf(mod.lab);
  let s = L.restore(getLab(id), id, count) || L.createLab(id, count, newSeed());
  let problems = makeProblems(mod.lab, s.seed);
  let fb = null; // feedback for the open problem only: { ok, text }

  const commit = (next, keepFb = false) => {
    if (!keepFb) fb = null;
    s = next; putLab(s); draw();
  };

  function draw() {
    const solvedN = s.solved.length, i = s.current;
    const pills = Array.from({ length: count }, (_, k) =>
      `<button class="pill${k === i ? ' cur' : ''}${L.isSolved(s, k) ? ' done' : ''}${s.tries[k] ? ' seen' : ''}" data-go="${k}" aria-label="Problem ${k + 1}${L.isSolved(s, k) ? ', solved' : ''}">${k + 1}</button>`).join('')
      + `<button class="pill sum${L.onSummary(s) ? ' cur' : ''}" data-go="${count}">Results</button>`;

    let body;
    if (L.onSummary(s)) {
      const open = Array.from({ length: count }, (_, k) => k).filter(k => !L.isSolved(s, k));
      body = `<div class="summary">
        <h2>${solvedN === count ? 'Lab complete' : `${solvedN} of ${count} solved`}</h2>
        <p>${open.length ? `Still open: ${open.map(k => `<button class="chip" data-go="${k}">${k + 1}</button>`).join(' ')}` : 'Every reading is solved. Nice work.'}</p>
        <div class="chips"><a class="btn" href="#/m/${mod.id}">Back to the lesson</a><button class="btn" data-new>New set of problems</button></div>
      </div>`;
    } else {
      const { tool, spec } = problems[i], solved = L.isSolved(s, i), shown = solved || L.isRevealed(s, i);
      const form = solved ? '' : answerForm(tool, spec);
      body = `${problemHtml(tool, spec, { tag: `Problem ${i + 1} of ${count}`, reveal: shown, extra: form + `<p class="fb ${fb ? (fb.ok ? 'ok' : 'no') : ''}" role="status">${fb ? fb.text : solved ? '✓ Solved' : ''}</p>` })}
        ${shown ? stepsHtml(tool, spec) + answerHtml(tool, spec) : ''}
        <div class="lab-nav">
          <button class="btn" data-go="${i - 1}"${i === 0 ? ' disabled' : ''}>← Back</button>
          ${!shown && L.triesAt(s) >= 2 ? '<button class="btn" data-reveal>Show the solution</button>' : ''}
          <button class="btn${solved ? ' go' : ''}" data-next>${i === count - 1 ? 'Results →' : solved ? 'Next →' : 'Skip →'}</button>
        </div>`;
    }

    view.innerHTML = `<p class="crumbs"><a href="#/">Course</a> / <a href="#/m/${mod.id}">Module ${mod.num}</a> / Lab</p>
      <div class="lab-head"><h1 class="page-title">Lab: ${mod.title}</h1><span class="mod-meta">${solvedN}/${count} solved · saved in this browser</span></div>
      <div class="pills">${pills}</div>
      <div class="lab-body">${body}</div>`;

    view.querySelectorAll('[data-go]').forEach(b => b.addEventListener('click', () => commit(L.goTo(s, Number(b.dataset.go)))));
    view.querySelector('[data-next]')?.addEventListener('click', () => commit(L.next(s)));
    view.querySelector('[data-reveal]')?.addEventListener('click', () => commit(L.reveal(s)));
    view.querySelector('[data-new]')?.addEventListener('click', () => {
      if (!confirm('Start a new set of 10 problems? Your solved marks for this lab will be cleared.')) return;
      const fresh = L.createLab(id, count, newSeed());
      problems = makeProblems(mod.lab, fresh.seed);
      commit(fresh);
    });
    const form = view.querySelector('form.answer-row');
    if (form) {
      form.addEventListener('submit', e => {
        e.preventDefault();
        const { tool, spec } = problems[s.current];
        const r = checkAnswer(tool, readForm(tool, form), spec);
        if (r.ok) { fb = { ok: true, text: '✓ Correct!' }; commit(L.solve(s), true); view.querySelector('[data-next]')?.focus(); }
        else {
          const t = L.triesAt(s) + 1;
          fb = { ok: false, text: r.msg || (t >= 2 ? 'Not quite. Try again, or open the solution below.' : 'Not quite. Try again.') };
          commit(L.miss(s), true);
          view.querySelector('form.answer-row input')?.focus();
        }
      });
    }
  }
  draw();
}
