// home.js (view) - the course page: modules in order, then every instrument for free practice.
import { MODULES } from '../content/modules.js';
import { TOOL_LIST } from '../sim/index.js';
import { getLab, isRead } from '../core/store.js';
import { countOf } from './problems.js';

export function renderHome(view) {
  const card = m => {
    const n = countOf(m.lab), done = getLab(`lab-${m.id}`)?.solved.length || 0;
    return `<a class="mod-card" href="#/m/${m.id}">
      <span class="mod-num">MODULE ${m.num}</span><h3>${m.title}</h3><p>${m.intro}</p>
      <span class="meter"><i style="width:${(done / n) * 100}%"></i></span>
      <span class="mod-meta">${done ? `Lab ${done}/${n}` : isRead(m.id) ? 'Started' : 'Not started'}</span>
    </a>`;
  };
  view.innerHTML = `<header class="home-head">
      <p class="crumbs"><a href="../../">Mechanical Technician Study Hub</a></p>
      <h1 class="page-title">Blueprint Reading &amp; Metrology</h1>
      <p class="lede">Read every measuring tool in the shop: rules, calipers, micrometers, height gages and protractors. Each module has a short read, instruments you can move, worked examples and a 10-problem lab.</p>
    </header>
    <div class="mod-grid">${MODULES.map(card).join('')}</div>
    <h2 class="section-title">Practice any instrument</h2>
    <div class="chips">${TOOL_LIST.map(t => `<a class="chip" href="#/practice/${t.id}">${t.name}</a>`).join('')}</div>
    <p class="tip" style="margin-top:28px">Blueprint reading (views, lines, title blocks, tolerances) will be added once we have the class slides for it.</p>`;
}
