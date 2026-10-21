// main.js - app shell + router: Home (#/), Read+Do Lessons (#/lesson/<unit>), Practice (#/practice/<unit>), Free 3D Lab (#/lab).
import './app.css';
import './game.css';
import './lesson.css';
import { Home, renderTopbar } from './ui/Home.js';
import { PracticeSession } from './practice/PracticeSession.js';
import { LessonPage, LESSONS_V2 } from './lesson/LessonPage.js';
import { FreeLab } from './lab/FreeLab.js';
import { UNITS } from './core/units.js';
import { store } from './core/store.js';
import { toast, sfx, burst } from './core/fx.js';
import { initGlossary } from './core/glossary.js';
import { buddy } from './ui/Buddy.js';

// ---------- router ----------
const shell = document.getElementById('shell');
const view = document.getElementById('view');
const topbar = document.getElementById('topbar');
let current = null, currentHash = null;

function nav(hash, force = false) {
  if (location.hash === hash && force) { route(true); return; }
  location.hash = hash;
}

function route(force = false) {
  const hash = location.hash || '#/';
  if (hash === currentHash && !force) return;
  currentHash = hash;
  if (current?.unmount) current.unmount();
  current = null;
  const [, kind, arg, sub] = hash.split('/');
  window.scrollTo(0, 0);
  shell.dataset.view = kind || 'home';

  if (kind === 'lab') {
    current = new FreeLab(view, nav);
  } else if (kind === 'lesson' && LESSONS_V2[arg]) {
    current = new LessonPage(view, arg, sub, nav);
  } else if (kind === 'practice' && (UNITS.some(u => u.id === arg) || ['mix', 'review', 'blitz'].includes(arg))) {
    current = new PracticeSession(view, arg, nav);
  } else {
    current = new Home(view, nav);
  }
  current.mount();
  buddy.onRoute(kind, arg, sub);
}

window.addEventListener('hashchange', () => route());

// ---------- top bar (XP, streak, focus sprint, sound) ----------
let sprint = null;
function drawTop() {
  renderTopbar(topbar);
  topbar.querySelector('#tbSound').onclick = () => { store.toggleSound(); drawTop(); };
  const sb = topbar.querySelector('#tbSprint');
  sb.onclick = () => (sprint ? stopSprint() : startSprint());
  if (sprint) { sb.classList.add('running'); updateSprint(); }
}
store.on(() => drawTop());

function startSprint() {
  const mins = store.get().sprintMins || 12;
  sprint = { end: Date.now() + mins * 60_000, t: setInterval(updateSprint, 1000) };
  toast(`⏱ ${mins}-minute focus sprint started. Phone face-down!`);
  drawTop();
}
function stopSprint() { clearInterval(sprint?.t); sprint = null; drawTop(); }
function updateSprint() {
  const sb = topbar.querySelector('#tbSprint');
  const left = Math.max(0, sprint.end - Date.now());
  const m = Math.floor(left / 60000), s = Math.floor((left % 60000) / 1000);
  sb.textContent = `⏱ ${m}:${String(s).padStart(2, '0')}`;
  if (left <= 0) {
    stopSprint();
    sfx.level(); burst({ big: true, y: 0.4 });
    const o = document.createElement('div');
    o.className = 'modal';
    o.innerHTML = `<div class="modal-card small"><div class="hook-emoji">🧃</div><h2>Sprint done!</h2>
      <p class="lead">Take a <b>3-minute</b> brain break: stand up, stretch, get some water. Your progress is saved.</p>
      <div class="done-actions"><button class="btn primary" id="again">Start another sprint</button><button class="btn ghost" id="done">I'm done for now</button></div></div>`;
    document.body.appendChild(o);
    o.querySelector('#again').onclick = () => { o.remove(); startSprint(); };
    o.querySelector('#done').onclick = () => o.remove();
  }
}

initGlossary();
buddy.init();
drawTop();
route();
