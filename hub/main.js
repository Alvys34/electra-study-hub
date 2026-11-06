// main.js - the study hub home: one drawing title block per course from courses.js, with its saved progress
// and a direct link to the next thing to do.
import './hub.css';
import { COURSES } from './courses.js';

function read(key) {
  try { const v = JSON.parse(localStorage.getItem(key)); return v && typeof v === 'object' ? v : null; } catch { return null; }
}

const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

function block(c) {
  let sum = null;
  try { sum = c.summary?.(read) || null; } catch { sum = null; }
  const base = `./${c.path}`;
  const stats = sum?.stats || [];
  const links = sum ? [sum.next, ...(sum.more || [])].filter(Boolean) : [];
  return `
  <article class="tblock">
    <a class="tb-head" href="${base}">
      <span class="cell cell-code"><small>Course</small><b>${esc(c.subject)}</b></span>
      <span class="cell cell-title"><small>Title</small><strong>${esc(c.title)}</strong><span class="tb-blurb">${esc(c.blurb)}</span></span>
    </a>
    ${stats.length ? `<div class="tb-stats">${stats.map(([k, v]) => `<span class="cell"><small>${esc(k)}</small><b>${esc(v)}</b></span>`).join('')}</div>` : ''}
    <div class="tb-go">
      ${links.map((l, i) => `<a class="btn${i ? '' : ' primary'}" href="${base}${l.href}">${esc(l.label)}${i ? '' : ' <span aria-hidden="true">→</span>'}</a>`).join('')}
      ${links.length ? '' : `<a class="btn primary" href="${base}">Open <span aria-hidden="true">→</span></a>`}
    </div>
  </article>`;
}

document.getElementById('hub').innerHTML = `
  <header class="hub-head">
    <p class="eyebrow">Study hub</p>
    <h1>Mechanical &amp; CNC Study Hub</h1>
    <p class="lede">Progress stays in this browser.</p>
  </header>
  <main class="courses">${COURSES.map(block).join('')}</main>`;
