// practice.js (view) - any instrument on its own: a live one to play with, and endless random readings.
import { TOOLS, TOOL_LIST, checkAnswer } from '../sim/index.js';
import { makeRng, newSeed } from '../core/rng.js';
import { mountExplore } from './explore.js';
import { problemHtml, stepsHtml, answerHtml, answerForm, readForm } from './blocks.js';

export function renderPractice(view, toolId, variantIdx = 0) {
  const tool = TOOLS[toolId] || TOOL_LIST[0];
  const variants = tool.variants || [];
  const variant = variants[variantIdx] || variants[0];
  const rng = makeRng(newSeed());
  view.innerHTML = `<p class="crumbs"><a href="#/">Course</a> / Practice</p>
    <h1 class="page-title">${tool.name}</h1>
    <div class="chips" style="margin-bottom:12px">${TOOL_LIST.map(t => `<a class="chip${t === tool ? ' on' : ''}" href="#/practice/${t.id}">${t.short}</a>`).join('')}</div>
    ${variants.length > 1 ? `<div class="chips">${variants.map((v, k) => `<a class="chip${v === variant ? ' on' : ''}" href="#/practice/${tool.id}/${k}">${v.label}</a>`).join('')}</div>` : ''}
    ${tool.noSim ? '' : '<h2 class="section-title">Try it</h2><div id="exp"></div>'}
    <h2 class="section-title">Quiz yourself</h2><div id="quiz" class="lab-body"></div>`;
  if (!tool.noSim) mountExplore(view.querySelector('#exp'), tool, variant?.spec || {}, { caption: 'Drag the scale, use the slider, or click it and use the arrow keys. The steps update as you move.' });

  const quiz = view.querySelector('#quiz');
  let spec, solved, tries, fb;
  const fresh = () => { spec = tool.random(rng, variant?.spec); solved = false; tries = 0; fb = null; draw(); };
  function draw() {
    const shown = solved || tries >= 3;
    quiz.innerHTML = problemHtml(tool, spec, { tag: 'Problem', reveal: shown, extra: (solved ? '' : answerForm(tool, spec)) + `<p class="fb ${fb ? (fb.ok ? 'ok' : 'no') : ''}" role="status">${fb ? fb.text : ''}</p>` })
      + (shown ? stepsHtml(tool, spec) + answerHtml(tool, spec) : '')
      + `<div class="lab-nav"><span></span><button class="btn${solved ? ' go' : ''}" data-new>New reading →</button></div>`;
    quiz.querySelector('[data-new]').addEventListener('click', fresh);
    quiz.querySelector('form')?.addEventListener('submit', e => {
      e.preventDefault();
      const r = checkAnswer(tool, readForm(tool, e.target), spec);
      if (r.ok) { solved = true; fb = { ok: true, text: '✓ Correct!' }; }
      else { tries++; fb = { ok: false, text: r.msg || (tries >= 3 ? 'Here is how to read it.' : 'Not quite. Try again.') }; }
      draw();
      (quiz.querySelector('form input') || quiz.querySelector('[data-new]')).focus({ preventScroll: true });
    });
  }
  fresh();
}
