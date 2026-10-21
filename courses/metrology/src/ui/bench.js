// bench.js (view) - the 3D measuring bench: a random shop part, the dimension to measure and the tool to use.
// Click faces or diameters to put the tool on the part (it snaps to them), read the zoomed-in scale, type the
// reading. The answer is checked against the dimension asked for, so a tool on the wrong faces is caught too.
import { getBench, putBench } from '../core/store.js';
import { newSeed } from '../core/rng.js';
import { checkAnswer } from '../sim/index.js';
import { PART_NAMES } from '../projects/index.js';
import { DRAW } from '../projects/drawings.js';
import { FILTERS, makeTask, specAt, sameReading } from '../bench/tasks.js';
import { partGeometry, plateSurface } from '../bench/geometry.js';
import { measure, solve, PROMPT } from '../bench/measure.js';
import { simHtml, stepsHtml, answerHtml, answerForm, readForm } from './blocks.js';

const MODE = {
  'outside jaws': 'Outside jaws on the part.', 'inside jaws': 'Inside jaws opened in the gap.', step: 'Step end of the caliper on the two faces.',
  'depth rod': 'Depth rod down from the top face.', 'anvil and spindle': 'Anvil and spindle closed on the part.', scriber: 'Scriber resting on the face.', rule: 'Rule lined up with the first face.',
};

export function renderBench(view, filterArg) {
  const saved = getBench() || {};
  const filter = FILTERS.some(f => f.id === filterArg) ? filterArg : saved.filter || 'any';
  let st = { seed: saved.filter === filter && Number.isInteger(saved.seed) ? saved.seed : newSeed(), filter, right: saved.right || 0 };
  let task, geo, picks, result, flipped, hover, msg, fb, tries, solved, revealed, bench = null, gone = false;
  const save = () => putBench(st);

  view.innerHTML = `<p class="crumbs"><a href="#/">Course</a> / 3D measuring bench</p>
    <div class="lab-head"><h1 class="page-title">3D measuring bench</h1><span class="mod-meta" id="b-score"></span></div>
    <p class="lede">A random part and the tool to measure it with. Click the part to put the tool on: it snaps to faces and diameters. Then read the scale and type what it says.</p>
    <div class="chips bench-filters" role="group" aria-label="Tool">${FILTERS.map(f => `<a class="chip${f.id === filter ? ' on' : ''}" href="#/bench/${f.id}">${f.name}</a>`).join('')}</div>
    <section class="blk blk-problem bench-job" id="b-job"></section>
    <div class="bench-grid">
      <div class="bench-stage">
        <div class="bench-3d" id="b-3d"></div>
        <div class="bench-tools">
          <button class="btn sm" data-flip title="Turn the part upside down">⇅ Flip part</button>
          <button class="btn sm" data-view>⟲ View</button>
          <button class="btn sm" data-clear>Take tool off</button>
        </div>
        <p class="bench-status" id="b-status" role="status"></p>
        <p class="bench-hint">Drag to turn the view · scroll or pinch to zoom · click a face to put the tool on it</p>
      </div>
      <figure class="sheet bench-sheet" id="b-sheet"></figure>
    </div>
    <div class="lab-body" id="b-panel"></div>`;
  const $ = id => view.querySelector(id);

  function load(seed) {
    task = makeTask(seed, filter); geo = partGeometry(task.part);
    picks = []; result = null; flipped = false; hover = null; msg = null; fb = null; tries = 0; solved = false; revealed = false;
    const { feature: f, tool, part } = task;
    $('#b-job').innerHTML = `<div class="blk-tag">Job · ${PART_NAMES[part.type]} · ${task.project.unit === 'mm' ? 'metric' : 'inch'}</div>
      <p class="q">Measure <b>${f.key}</b> (${f.desc}) with the <span class="dim-tool">${tool.name}</span>.</p>`;
    $('#b-sheet').innerHTML = `${DRAW[part.type](part, { active: f.key, done: {} })}
      <figcaption><span><b>${f.key}</b> is in blue</span><span>Tool: ${tool.short}</span></figcaption>`;
    if (bench) { bench.clearTool(); bench.setPart(geo, task.project.unit === 'mm' ? 1 / 25.4 : 1, false); }
    draw();
  }

  const surfaceOf = hit => (hit.surface === 'plate' ? plateSurface(geo.height, flipped) : hit.surface);

  // What a click on this surface would do right now: a reading, a request for a second face, or a reason it can't.
  function tryPick(hit) {
    const pick = { s: surfaceOf(hit), p: hit.point };
    const next = result || picks.length >= 2 ? [pick] : [...picks, pick];
    let r = measure(task.kind, next, flipped, geo.height);
    if (r.ok) {
      const hi = task.tool.range(specAt(task, r.value))[1];
      if (r.value > hi + 1e-9) r = { ok: false, msg: `Too big for this tool: the ${task.tool.short} only opens to ${hi}${task.tool.unit === 'mm' ? ' mm' : '"'}.` };
    }
    return { next, r };
  }

  function onHover(hit) {
    if (!hit) { hover = null; bench.cursor('grab'); }
    else {
      const { r } = tryPick(hit);
      hover = r.msg ? null : surfaceOf(hit);
      bench.cursor(r.msg ? 'not-allowed' : 'pointer');
    }
    paint();
  }

  function onClick(hit) {
    if (!hit || solved) return;
    const { next, r } = tryPick(hit);
    if (r.msg) { msg = r.msg; draw(); return; }
    picks = next; msg = null; fb = null;
    result = r.ok ? r : null;
    if (result) bench.showTool(task.kind, result); else bench.clearTool();
    draw();
  }

  const paint = () => bench?.paint({ hover, picked: picks.map(p => p.s), placed: !!result });

  // Puts the tool where it reads the dimension asked for (flipping the part if that's the only way).
  function showMe() {
    const match = v => sameReading(task, v);
    let found = solve(task.kind, geo, flipped, null, match);
    if (!found) { found = solve(task.kind, geo, !flipped, null, match); if (found) { flipped = !flipped; bench.setFlipped(flipped, true); } }
    if (!found) return;
    picks = found; result = measure(task.kind, picks, flipped, geo.height); msg = null;
    bench.showTool(task.kind, result);
    draw();
  }

  function draw() {
    $('#b-score').textContent = `${st.right} measured right · saved in this browser`;
    const n = picks.length, prompts = PROMPT[task.kind];
    $('#b-status').className = `bench-status${msg ? ' no' : result ? ' ok' : ''}`;
    $('#b-status').textContent = msg || (result ? `${MODE[result.mode]} Read the scale below. Click the part to move the tool.` : prompts[Math.min(n, prompts.length - 1)]);
    paint();

    const { tool, target, feature: f } = task;
    let panel;
    if (!result) {
      panel = `<div class="bench-empty"><p>The tool’s scale shows here, zoomed in, once the tool is on the part.</p>
        <button class="btn" data-show>Show me where it goes</button></div>`;
    } else {
      const spec = specAt(task, result.value), shown = solved || revealed;
      panel = `<section class="blk blk-problem"><div class="blk-tag">Reading · ${tool.name}, zoomed in</div>
          <p class="q">${tool.question(spec)}</p>
          ${simHtml(tool, spec, shown && sameReading(task, result.value))}
          ${solved ? '' : answerForm(tool, spec)}
          <p class="fb ${fb ? (fb.ok ? 'ok' : 'no') : ''}" role="status">${fb ? fb.text : ''}</p>
        </section>
        ${shown ? stepsHtml(tool, target) + answerHtml(tool, target, `Answer · ${f.key}`) : ''}`;
    }
    panel += `<div class="lab-nav">
        <span>${result && !solved && !revealed ? '<button class="btn" data-show>Show me where it goes</button>' : ''}
        ${!solved && !revealed && tries >= 2 ? '<button class="btn" data-reveal>Show the answer</button>' : ''}</span>
        <button class="btn${solved || revealed ? ' go' : ''}" data-new>${solved || revealed ? 'Next part →' : 'Skip: new part'}</button></div>`;
    $('#b-panel').innerHTML = panel;

    $('#b-panel').querySelectorAll('[data-show]').forEach(b => b.addEventListener('click', showMe));
    $('#b-panel').querySelector('[data-reveal]')?.addEventListener('click', () => { revealed = true; if (!result || !sameReading(task, result.value)) showMe(); else draw(); });
    $('#b-panel').querySelector('[data-new]').addEventListener('click', () => { st = { ...st, seed: newSeed() }; save(); load(st.seed); });
    $('#b-panel').querySelector('form.answer-row')?.addEventListener('submit', e => {
      e.preventDefault();
      const input = readForm(tool, e.target), on = sameReading(task, result.value);
      if (on && checkAnswer(tool, input, target).ok) {
        solved = true;
        if (!revealed) { st = { ...st, right: st.right + 1 }; save(); }
        fb = { ok: true, text: `✓ Correct: ${f.key} = ${tool.answer(target).replace(/<[^>]+>/g, '')}` };
      } else {
        tries += 1;
        const readRight = checkAnswer(tool, input, specAt(task, result.value)).ok;
        fb = { ok: false, text: !on && readRight ? `You read the tool right, but it isn’t on ${f.key}. Look at the drawing, then click the faces for the ${f.desc}.`
          : !on ? `Check where the tool is first: it isn’t on ${f.key} yet.`
          : checkAnswer(tool, input, target).msg || (tries >= 2 ? 'Not quite. Read the scale again, or show the answer.' : 'Not quite. Read the scale again.') };
      }
      draw();
      (solved ? $('#b-panel [data-new]') : $('#b-panel form.answer-row input'))?.focus();
    });
  }

  view.querySelector('[data-flip]').addEventListener('click', () => {
    if (!bench || solved) return;
    flipped = !flipped; picks = []; result = null; msg = null; fb = null;
    bench.clearTool(); bench.setFlipped(flipped, true); draw();
  });
  view.querySelector('[data-view]').addEventListener('click', () => bench?.frame());
  view.querySelector('[data-clear]').addEventListener('click', () => { if (solved) return; picks = []; result = null; msg = null; fb = null; bench?.clearTool(); draw(); });

  save();
  load(st.seed);
  // three.js only loads on this page.
  const theme = () => bench?.setTheme(document.documentElement.dataset.theme === 'light');
  const mo = new MutationObserver(theme); mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  import('../bench/scene.js').then(({ Bench }) => {
    if (gone) return;
    try { bench = new Bench($('#b-3d'), { onHover, onClick }); } catch {
      $('#b-3d').innerHTML = '<p class="bench-nogl">This browser can’t show 3D (WebGL is off). Try another browser or turn on hardware acceleration.</p>';
      return;
    }
    theme();
    bench.setPart(geo, task.project.unit === 'mm' ? 1 / 25.4 : 1, false);
    draw();
  });
  return () => { gone = true; mo.disconnect(); bench?.dispose(); };
}
