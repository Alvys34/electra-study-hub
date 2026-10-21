// main.js - Blueprint Reading & Metrology: top bar, theme and a small hash router.
import './app.css';
import { renderHome } from './ui/home.js';
import { renderLesson } from './ui/lesson.js';
import { renderLab } from './ui/lab.js';
import { renderPractice } from './ui/practice.js';
import { renderProject } from './ui/project.js';
import { renderBench } from './ui/bench.js';
import { MODULES } from './content/modules.js';
import { getTheme, setTheme } from './core/store.js';

const root = document.documentElement;
const systemTheme = () => (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
const applyTheme = t => { root.dataset.theme = t; };
applyTheme(getTheme() || systemTheme());

function topbar() {
  const el = document.getElementById('topbar');
  el.innerHTML = `<a class="hub-link" href="../../" title="All courses" aria-label="Back to the study hub">⌂</a>
    <a class="brand" href="#/"><span>Metrology</span><small>CRN-20405</small></a>
    <span class="spacer"></span>
    <button class="icon-btn" id="theme" title="Light / dark" aria-label="Switch light or dark theme">◐</button>`;
  el.querySelector('#theme').addEventListener('click', () => {
    const t = root.dataset.theme === 'light' ? 'dark' : 'light';
    applyTheme(t); setTheme(t);
  });
}

let leave = null; // the 3D bench stops its renderer when you go to another page

function route() {
  const view = document.getElementById('view');
  leave?.(); leave = null;
  const [, page, a, b] = location.hash.replace(/^#/, '').split('/');
  if (page === 'm') renderLesson(view, a);
  else if (page === 'lab' && MODULES.some(m => m.id === a)) renderLab(view, MODULES.find(m => m.id === a));
  else if (page === 'project') renderProject(view, a);
  else if (page === 'bench') leave = renderBench(view, a);
  else if (page === 'practice') renderPractice(view, a, Number(b) || 0);
  else renderHome(view);
  window.scrollTo(0, 0);
}

topbar();
addEventListener('hashchange', route);
route();
