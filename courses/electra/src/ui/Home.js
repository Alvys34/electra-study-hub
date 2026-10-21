// Home.js - Unified mission map: all 10 units (Read + Do + Practice), quick drills, and Free 3D Lab.
import { UNITS } from '../core/units.js';
import { LESSONS_V2 } from '../lesson/LessonPage.js';
import { store, levelFor, levelName } from '../core/store.js';
import { hl } from '../core/text.js';

export class Home {
  constructor(root, nav) {
    this.root = root;
    this.nav = nav;
  }

  mount() {
    const s = store.get();
    const missed = s.missed.length;
    const readUnits = UNITS.filter(u => s.learn[`lesson-${u.id}-read`]?.done || s.learn[`lesson-${u.id}`]?.done).length;
    const doneUnits = UNITS.filter(u => s.learn[`lesson-${u.id}`]?.done).length;
    const totalStars = UNITS.reduce((acc, u) => acc + store.stars(u.id), 0);
    const nextUnit = UNITS.find(u => !s.learn[`lesson-${u.id}`]?.done) || UNITS[0];
    const nextL2 = LESSONS_V2[nextUnit.id];
    const nextReadDone = !!(s.learn[`lesson-${nextUnit.id}-read`]?.done || s.learn[`lesson-${nextUnit.id}`]?.done);
    const nextDoProg = s.learn[`lesson-${nextUnit.id}`];
    const nextSeen = nextDoProg?.done ? nextL2.steps.length : (nextDoProg?.seen || 0);
    const nextPct = nextDoProg?.done ? 100 : Math.round(((nextReadDone ? 0.25 : 0) + 0.75 * (nextSeen / nextL2.steps.length)) * 100);
    const nextHref = `#/lesson/${nextUnit.id}${nextReadDone ? '/do' : ''}`;
    let resume = '';
    try {
      const last = JSON.parse(localStorage.getItem('electra.last.v1') || 'null');
      const LL = last && LESSONS_V2[last.u];
      if (LL && last.u !== nextUnit.id) {
        const prog = s.learn[`lesson-${last.u}`];
        const where = last.p === 'do'
          ? (prog && !prog.done ? `Lab step ${Math.min(prog.seen, LL.steps.length - 1) + 1}` : 'Lab')
          : 'Study sheet';
        resume = `<a class="resume-link" href="#/lesson/${last.u}${last.p === 'do' ? '/do' : ''}">↩ Back to <b>${LL.code} · ${LL.title}</b> · ${where}</a>`;
      }
    } catch { /* storage unavailable or corrupt */ }

    this.root.innerHTML = `<div class="home">
      <section class="hero">
        <div class="hero-txt">
          <h1>Circuit Analysis</h1>
          <p>Read the sheet, do the lab, then practice. Tap any <span class="kw" tabindex="0" role="button" title="Click for definition">highlighted word</span> for its definition.</p>
          <div class="hero-stats">
            <div class="hstat"><b>${readUnits}/${UNITS.length}</b><span>Sheets read</span></div>
            <div class="hstat"><b>${doneUnits}/${UNITS.length}</b><span>Labs done</span></div>
            <div class="hstat"><b>${totalStars}/${UNITS.length * 3} ★</b><span>Stars</span></div>
          </div>
          ${resume}
        </div>
        <a class="go-card" href="${nextHref}" style="--c:${nextUnit.color}">
          <div class="go-top">
            <span class="go-pill">Up next</span>
            <span class="go-code">Unit ${nextUnit.code}</span>
          </div>
          <div class="go-main">
            <span class="go-emoji">${nextUnit.emoji}</span>
            <div class="go-txt">
              <b>${nextL2.title}</b>
              <small>${nextReadDone ? `Lab · step ${Math.min(nextSeen + 1, nextL2.steps.length)} of ${nextL2.steps.length}` : `Study sheet · ~${nextL2.minutesRead} min`}</small>
            </div>
          </div>
          <div class="go-foot">
            <div class="go-bar"><i style="width:${nextPct}%"></i></div>
            <span class="go-cta">${nextReadDone ? (nextSeen ? 'Continue lab' : 'Start lab') : 'Start reading'} →</span>
          </div>
        </a>
      </section>

      <section class="quick" aria-label="Quick study tools">
        <button type="button" class="qbtn qbtn-featured" id="qCheat">
          <span>🃏</span>
          <b>Cheat sheets</b>
          <small>Every formula, 1A–6</small>
        </button>
        <a class="qbtn" href="#/practice/blitz">
          <span>⚡</span>
          <b>90-sec blitz</b>
          <small>Speed drill</small>
        </a>
        <a class="qbtn" href="#/practice/mix">
          <span>🧩</span>
          <b>Exam mix</b>
          <small>10 mixed problems</small>
        </a>
        <a class="qbtn ${missed ? '' : 'dim'}" href="#/practice/review">
          <span>🔁</span>
          <b>Review misses</b>
          <small>${missed ? `${missed} waiting` : 'All caught up'}</small>
        </a>
      </section>

      <section class="map">
        <div class="map-head">
          <h2>Units</h2>
        </div>
        <div class="path">
          ${UNITS.map((u, k) => {
            const L2 = LESSONS_V2[u.id];
            const doProg = s.learn[`lesson-${u.id}`];
            const isDoDone = !!doProg?.done;
            const isReadDone = !!(s.learn[`lesson-${u.id}-read`]?.done || isDoDone);
            const totalSteps = L2 ? L2.steps.length : 1;
            const seenSteps = isDoDone ? totalSteps : (doProg?.seen || 0);
            const pct = isDoDone ? 100 : Math.round(((isReadDone ? 0.25 : 0) + 0.75 * (seenSteps / totalSteps)) * 100);
            const stars = store.stars(u.id);
            const isHere = u.id === nextUnit.id && doneUnits < UNITS.length;
            return `<div class="node ${isHere ? 'here' : ''} ${isDoDone && stars === 3 ? 'mastered' : ''}" style="--c:${u.color};--i:${k}">
              <div class="node-top">
                <div class="node-badge">${u.emoji}</div>
                <div class="node-title">
                  <div class="node-meta">
                    <small>UNIT ${u.code}</small>
                  </div>
                  <b>${L2.title}</b>
                  <span>${u.blurb}</span>
                </div>
                <div class="stars" title="Practice mastery stars (${stars}/3)">${[0, 1, 2].map(i => `<i class="${i < stars ? 'on' : ''}">★</i>`).join('')}</div>
              </div>
              <div class="node-prog-row">
                <div class="node-bar"><i style="width:${pct}%"></i></div>
                <span class="node-pct">${pct}%</span>
              </div>
              <div class="node-acts">
                <a class="nb learn ${isReadDone ? 'is-done' : isHere ? 'is-primary' : ''}" href="#/lesson/${u.id}">
                  <span class="nb-num">${isReadDone ? '✓' : '1'}</span>
                  <span>Read <small>${L2.minutesRead} min</small></span>
                </a>
                <span class="nb-arrow" aria-hidden="true">→</span>
                <a class="nb do ${isHere && isReadDone && !isDoDone ? 'is-primary' : ''} ${isDoDone ? 'is-done' : ''}" href="#/lesson/${u.id}/do">
                  <span class="nb-num">${isDoDone ? '✓' : '2'}</span>
                  <span>Lab ${isDoDone ? '' : `<small>${seenSteps}/${totalSteps}</small>`}</span>
                </a>
                <a class="nb lab ${isHere && isDoDone && stars < 3 ? 'is-primary' : ''}" href="#/practice/${u.id}">
                  <span class="nb-num">${stars === 3 ? '★' : '3'}</span>
                  <span>Practice</span>
                </a>
              </div>
            </div>`;
          }).join('')}
        </div>

        <a class="bench-cta" href="#/lab">
          <div class="bench-cta-icon">🧰</div>
          <div class="bench-cta-body">
            <h3>3D Free Workbench</h3>
            <p>Wire any circuit from supplies, resistors, lamps, switches and fuses, then measure live V, I and Ω.</p>
          </div>
          <span class="bench-cta-btn">Open →</span>
        </a>

        <div class="map-foot">
          <button class="linkish" id="reset">Reset all progress</button>
        </div>
      </section>
    </div>`;

    this.root.querySelector('#qCheat').onclick = () => this.cheatSheets();
    this.root.querySelector('#reset').onclick = () => {
      if (confirm('Reset all progress? This clears reading, labs, practice stars, XP, streak and your saved 3D bench.')) {
        store.reset();
        try { localStorage.removeItem('electra.freelab.v1'); localStorage.removeItem('electra.last.v1'); } catch { /* storage unavailable */ }
        this.mount();
      }
    };
  }

  cheatSheets() {
    const m = document.createElement('div');
    m.className = 'modal';
    m.innerHTML = `<div class="modal-card"><div class="modal-head"><h2>Cheat sheets</h2><button class="icon-btn" id="mx" title="Close">✕</button></div>
      <div class="cheats">${UNITS.map(u => {
        const L2 = LESSONS_V2[u.id];
        const pts = L2.sheet.map(s => s.key || s.exam).filter(Boolean).map(p => `<li>${hl(p)}</li>`).join('');
        return `<div class="cheat" style="--c:${u.color}">
          <div class="cheat-top">
            <h3>${u.code} · ${L2.title}</h3>
            <a class="btn xs ghost" href="#/lesson/${u.id}">Sheet →</a>
          </div>
          <ul>${pts}</ul>
        </div>`;
      }).join('')}</div></div>`;
    document.body.appendChild(m);
    const close = () => { m.remove(); window.removeEventListener('keydown', esc); };
    const esc = e => { if (e.key === 'Escape') close(); };
    window.addEventListener('keydown', esc);
    m.addEventListener('click', e => { if (e.target === m) close(); });
    m.querySelectorAll('.cheat a').forEach(a => a.addEventListener('click', close));
    m.querySelector('#mx').onclick = close;
  }

  unmount() {}
}

export function renderTopbar(el) {
  const s = store.get();
  const lv = levelFor(s.xp);
  // The standalone offline file has no hub to go back to, so the hub link only exists in the hub build.
  const hub = import.meta.env.VITE_STANDALONE ? '' : `<a class="hub-link" href="../../" title="All courses" aria-label="Back to the study hub">⌂</a>`;
  el.innerHTML = `<div class="tb-left">${hub}<a class="brand" href="#/"><span class="bolt">⚡</span><span>Circuit Analysis</span><small class="brand-tag">EMNG1001</small></a></div>
    <div class="tb-right">
      <div class="lvl" title="${s.xp} XP total"><span class="lvl-n">Lv ${lv.level}</span><span class="lvl-name">${levelName(lv.level)}</span><span class="lvl-bar"><i style="width:${(lv.into / lv.need) * 100}%"></i></span></div>
      <div class="streak ${s.streak.count ? 'on' : ''}" title="Study streak (days in a row)">🔥 ${s.streak.count}</div>
      <button class="icon-btn" id="tbSprint" title="${s.sprintMins || 12}-min focus sprint timer">⏱</button>
      <button class="icon-btn" id="tbSound" title="Sound effects on/off">${s.sound ? '🔊' : '🔇'}</button>
    </div>`;
}
