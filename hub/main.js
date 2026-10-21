// main.js - the study hub home: one card per course from courses.js.
import './hub.css';
import { COURSES } from './courses.js';

function started(c) {
  try { return !!localStorage.getItem(c.progressKey); } catch { return false; }
}

const card = c => `
  <a class="course" href="./${c.path}">
    <span class="course-icon"${c.tint ? ` style="background:${c.tint}"` : ''}>${c.icon}</span>
    <span class="course-body">
      <span class="course-subject">${c.subject}</span>
      <span class="course-title">${c.title}</span>
      <span class="course-blurb">${c.blurb}</span>
      <span class="course-meta">${c.units} units${started(c) ? ' · <b>In progress</b>' : ''}</span>
    </span>
    <span class="course-go" aria-hidden="true">→</span>
  </a>`;

document.getElementById('hub').innerHTML = `
  <header class="hub-head">
    <h1>Mechanical Technician Study Hub</h1>
    <p>Pick a course. Your progress is saved in this browser.</p>
  </header>
  <main class="courses">${COURSES.map(card).join('')}</main>`;
