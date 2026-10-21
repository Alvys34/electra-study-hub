// lesson.js (view) - one module: short reading, live instruments, worked examples, then the lab.
import { TOOLS } from '../sim/index.js';
import { MODULES } from '../content/modules.js';
import { markRead, getLab } from '../core/store.js';
import { mountExplore } from './explore.js';
import { workedHtml } from './blocks.js';
import { countOf } from './problems.js';

function block(b, k) {
  if (b.h) return `<h2>${b.h}</h2>`;
  if (b.p) return `<p>${b.p}</p>`;
  if (b.ul) return `<ul>${b.ul.map(x => `<li>${x}</li>`).join('')}</ul>`;
  if (b.tip) return `<div class="tip">${b.tip}</div>`;
  if (b.table) return `<table class="ref"><thead><tr>${b.table.head.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>${b.table.rows.map(r => `<tr>${r.map((c, i) => `<td${i ? ' class="num"' : ''}>${c}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
  if (b.fracs) return `<div class="frac-grid">${b.fracs.map(([f, d]) => `<div>${f}<span>${d}</span></div>`).join('')}</div>`;
  if (b.explore) return `<div data-explore="${k}"></div>`;
  if (b.example) return workedHtml(TOOLS[b.example], TOOLS[b.example].snap({ ...TOOLS[b.example].base, ...b.spec }));
  return '';
}

export function renderLesson(view, id) {
  const i = MODULES.findIndex(m => m.id === id), mod = MODULES[i];
  if (!mod) { location.hash = '#/'; return; }
  markRead(mod.id);
  const prev = MODULES[i - 1], next = MODULES[i + 1], lab = getLab(`lab-${mod.id}`), n = countOf(mod.lab);
  view.innerHTML = `<p class="crumbs"><a href="#/">Course</a> / Module ${mod.num}</p>
    <h1 class="page-title">${mod.title}</h1>
    <p class="lede">${mod.intro}</p>
    <article class="lesson">
      <div class="goals"><h3>By the end you can</h3><ul>${mod.goals.map(g => `<li>${g}</li>`).join('')}</ul></div>
      ${mod.blocks.map(block).join('')}
      <h2>Lab</h2>
      <div class="cta"><p><b>${n} readings</b> on what this module covered. ${lab ? `${lab.solved.length}/${n} solved so far.` : 'Your progress is saved as you go.'}</p><a class="btn primary" href="#/lab/${mod.id}">${lab?.solved.length ? 'Continue the lab' : 'Start the lab'} →</a></div>
    </article>
    <nav class="page-nav">${prev ? `<a class="btn" href="#/m/${prev.id}">← ${prev.num}. ${prev.title}</a>` : '<span></span>'}${next ? `<a class="btn" href="#/m/${next.id}">${next.num}. ${next.title} →</a>` : ''}</nav>`;
  view.querySelectorAll('[data-explore]').forEach(el => {
    const b = mod.blocks[Number(el.dataset.explore)];
    mountExplore(el, TOOLS[b.explore], b.spec, { caption: b.caption });
  });
}
