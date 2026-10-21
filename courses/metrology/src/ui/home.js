// home.js (view) - the course page: modules in order, then every instrument for free practice.
import { MODULES } from '../content/modules.js';
import { TOOL_LIST } from '../sim/index.js';
import { getLab, isRead } from '../core/store.js';
import { countOf } from './problems.js';
import { PROJECTS, PART_NAMES } from '../projects/index.js';

export function renderHome(view) {
  const card = m => {
    const n = countOf(m.lab), done = getLab(`lab-${m.id}`)?.solved.length || 0;
    return `<a class="mod-card" href="#/m/${m.id}">
      <span class="mod-num">MODULE ${m.num}</span><h3>${m.title}</h3><p>${m.intro}</p>
      <span class="meter"><i style="width:${(done / n) * 100}%"></i></span>
      <span class="mod-meta">${done ? `Lab ${done}/${n}` : isRead(m.id) ? 'Started' : 'Not started'}</span>
    </a>`;
  };
  const projCard = p => {
    const st = getLab(`proj-${p.id}`), n = st?.count || 1, done = st?.solved.length || 0;
    return `<a class="mod-card" href="#/project/${p.id}">
      <span class="mod-num">PROJECT ${p.num} · ${PART_NAMES[p.part].toUpperCase()}</span><h3>${p.title}</h3><p>${p.toolNote}</p>
      <span class="meter"><i style="width:${(done / n) * 100}%"></i></span>
      <span class="mod-meta">${done ? `${done}/${n} dimensions recorded` : 'Not started'}</span>
    </a>`;
  };
  view.innerHTML = `<header class="home-head">
      <p class="crumbs"><a href="../../">Mechanical Technician Study Hub</a></p>
      <h1 class="page-title">Blueprint Reading &amp; Metrology</h1>
      <p class="lede">Read every measuring tool in the shop: rules, calipers, micrometers, height gages and protractors. Each module has a short read, instruments you can move, worked examples and a 10-problem lab.</p>
    </header>
    <div class="mod-grid">${MODULES.map(card).join('')}</div>
    <h2 class="section-title">Shop projects</h2>
    <p class="lede" style="margin-bottom:14px">The lab sheets from class: a random part on a drawing, and you measure every dimension with the right tool. Every part is different.</p>
    <div class="mod-grid">${PROJECTS.map(projCard).join('')}</div>
    <h2 class="section-title">3D measuring bench</h2>
    <a class="cta bench-cta" href="#/bench"><p><b>A part, a tool, a dimension.</b> Turn the part around in 3D, put the caliper, micrometer, depth mic, height gage or rule on it (it snaps to faces and diameters), read the scale and check your answer.</p><span class="btn primary">Open the bench →</span></a>
    <h2 class="section-title">Practice any instrument</h2>
    <div class="chips">${TOOL_LIST.map(t => `<a class="chip" href="#/practice/${t.id}">${t.name}</a>`).join('')}</div>
    <p class="tip" style="margin-top:28px">Projects 10 (coordinate measurement) and 11 (sine bar and gauge blocks) aren't here yet. Blueprint reading lessons (views, lines, tolerances) will come once we have the class slides.</p>`;
}
