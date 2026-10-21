// LessonPage.js - Brilliant-style lesson: READ the study sheet first, then DO short steps
// (text on top, one interaction below, a task/question that unlocks the next step).
import { LESSON_1A } from './unit1a.js';
import { LESSON_1B } from './unit1b.js';
import { LESSON_1C } from './unit1c.js';
import { LESSON_2A } from './unit2a.js';
import { LESSON_2B } from './unit2b.js';
import { LESSON_3A } from './unit3a.js';
import { LESSON_4A } from './unit4a.js';
import { LESSON_4B } from './unit4b.js';
import { LESSON_5 } from './unit5.js';
import { LESSON_6 } from './unit6.js';
import { VISUALS, enableDragSort } from './visuals.js';
import { Game } from '../game/engine/Game.js';
import { hl } from '../core/text.js';
import { parseAnswer, close, shuffle } from '../core/num.js';
import { store } from '../core/store.js';
import { giveXP, sfx, celebrateSmall, celebrateBig } from '../core/fx.js';
import { buddy } from '../ui/Buddy.js';

export const LESSONS_V2 = {
  unit1a: LESSON_1A,
  unit1b: LESSON_1B,
  unit1c: LESSON_1C,
  unit2a: LESSON_2A,
  unit2b: LESSON_2B,
  unit3a: LESSON_3A,
  unit4a: LESSON_4A,
  unit4b: LESSON_4B,
  unit5: LESSON_5,
  unit6: LESSON_6,
};

let bench = null; // one embedded WebGL bench, reused across steps and visits

export class LessonPage {
  constructor(root, lessonId, phase, nav) {
    this.root = root; this.L = LESSONS_V2[lessonId]; this.phase = phase === 'do' ? 'do' : 'read'; this.nav = nav;
    this.key = `lesson-${lessonId}`;
    const saved = store.get().learn[this.key];
    this.i = saved && !saved.done ? Math.min(saved.seen, this.L.steps.length - 1) : 0;
    this.onScroll = this.onScroll.bind(this);
    this.onKey = this.onKey.bind(this);
  }

  mount() {
    document.body.classList.add('lesson-mode');
    try { localStorage.setItem('electra.last.v1', JSON.stringify({ u: this.L.id, p: this.phase })); } catch { /* storage unavailable */ }
    const s = store.get();
    const isDoDone = !!s.learn[this.key]?.done;
    const isReadDone = !!(s.learn[this.key + '-read']?.done || isDoDone);
    this.readDone = isReadDone;
    this.root.innerHTML = `<div class="ls" style="--accent:${this.L.color}">
      <div class="ls-head">
        <a class="icon-btn" href="#/" title="Back to course map">←</a>
        <div class="ls-title"><small>UNIT ${this.L.code}</small><b>${this.L.title}</b></div>
        <div class="ls-tabs" role="navigation" aria-label="Lesson steps">
          <a href="#/lesson/${this.L.id}" class="ls-tab ${this.phase === 'read' ? 'on' : ''} ${isReadDone ? 'done' : ''}">
            <span class="ls-tab-num">${isReadDone && this.phase !== 'read' ? '✓' : '1'}</span>
            <span>Read</span>
          </a>
          <span class="ls-tab-sep" aria-hidden="true">→</span>
          <a href="#/lesson/${this.L.id}/do" class="ls-tab ${this.phase === 'do' ? 'on' : ''} ${isDoDone ? 'done' : ''}">
            <span class="ls-tab-num">${isDoDone && this.phase !== 'do' ? '✓' : '2'}</span>
            <span>Lab</span>
          </a>
        </div>
        <button class="icon-btn" id="lsSheet" title="${this.phase === 'read' ? 'Print study sheet' : 'Open study sheet reference'}">${this.phase === 'read' ? '🖨️' : '📄'}</button>
      </div>
      <div class="ls-progress" ${this.phase === 'do' ? 'hidden' : ''}><i id="lsBar"></i></div>
      <div id="lsBody"></div>
    </div>`;
    this.root.querySelector('#lsSheet').onclick = () => (this.phase === 'read' ? window.print() : this.sheetModal());
    if (this.phase === 'read') this.renderRead(); else this.renderDo();
  }

  unmount() {
    document.body.classList.remove('lesson-mode');
    window.removeEventListener('scroll', this.onScroll);
    window.removeEventListener('keydown', this.onKey);
    this.cleanupStep?.();
    if (bench) { bench.game.unload(); bench.game.stage.paused = true; bench.el.remove(); }
    document.querySelectorAll('.ls-modal').forEach(m => m.remove());
  }

  // ================================================================== READ
  sheetHTML() {
    return this.L.sheet.map((s, k) => {
      const cleanBody = String(s.body || '').replace(/<\/ul>\s*<br\s*\/?>/gi, '</ul><div class="ls-spacer"></div>');
      const hasCallouts = s.key || s.exam;
      return `
      <section class="ls-sec" id="sec${k}">
        <div class="ls-sec-head">
          <div class="ls-sec-n">${k + 1}</div>
          <h2>${s.title}</h2>
        </div>
        ${s.lead ? `<p class="ls-lead-why">${hl(s.lead)}</p>` : ''}
        <div class="ls-text">${hl(cleanBody)}</div>
        ${s.fig ? `<figure class="ls-fig">${s.fig()}</figure>` : ''}
        ${hasCallouts ? `<div class="ls-callouts ${s.key && s.exam ? 'two' : ''}">
          ${s.key ? `<div class="ls-key"><div class="ls-callout-tag">Key idea</div><div class="ls-callout-body">${hl(s.key)}</div></div>` : ''}
          ${s.exam ? `<div class="ls-exam"><div class="ls-callout-tag">On the test</div><div class="ls-callout-body">${hl(s.exam)}</div></div>` : ''}
        </div>` : ''}
        ${s.check ? this.checkHTML(s.check) : ''}
      </section>`;
    }).join('');
  }

  checkHTML(c) {
    const order = c.options.map((_, i) => i).sort(() => Math.random() - 0.5);
    const ok = order.indexOf(c.correct);
    return `<div class="ls-q ls-check" data-ok="${ok}">
      <div class="ls-q-h">Quick check</div>
      <div class="ls-q-q">${hl(c.q)}</div>
      <div class="ls-opts">${order.map((src, i) => `<button type="button" class="ls-opt" data-k="${i}"><span>${i + 1}</span>${hl(c.options[src])}</button>`).join('')}</div>
      <div class="ls-why" hidden>${hl(c.why)}</div>
    </div>`;
  }

  bindSheet(scope) {
    scope.querySelectorAll('.mx.is-walk').forEach(card => {
      const steps = [...card.querySelectorAll('.mx-step')];
      const walkBtn = card.querySelector('.mx-walk');
      const nav = card.querySelector('.mx-nav');
      const prev = card.querySelector('.mx-prev');
      const next = card.querySelector('.mx-next');
      const count = card.querySelector('.mx-count');
      if (!walkBtn || steps.length < 2) return;
      let i = 0;
      let on = false;
      const paint = () => {
        steps.forEach((el, k) => {
          el.classList.toggle('is-on', on && k === i);
          el.classList.toggle('is-dim', on && k < i);
          el.classList.toggle('is-future', on && k > i);
        });
        count.textContent = `${i + 1} / ${steps.length}`;
        prev.disabled = i === 0;
        next.textContent = i === steps.length - 1 ? 'Show all' : 'Next';
      };
      const stop = () => {
        on = false;
        walkBtn.textContent = 'Step through';
        walkBtn.classList.remove('on');
        nav.hidden = true;
        steps.forEach(el => el.classList.remove('is-on', 'is-dim', 'is-future'));
      };
      walkBtn.addEventListener('click', () => {
        if (on) { stop(); return; }
        on = true;
        i = 0;
        walkBtn.textContent = 'Show all';
        walkBtn.classList.add('on');
        nav.hidden = false;
        paint();
      });
      prev.addEventListener('click', () => { if (i > 0) { i -= 1; paint(); } });
      next.addEventListener('click', () => {
        if (i < steps.length - 1) { i += 1; paint(); }
        else stop();
      });
    });

    scope.querySelectorAll('.ls-check').forEach(box => {
      const why = box.querySelector('.ls-why');
      const rule = why.innerHTML;
      const ok = Number(box.dataset.ok);
      box.querySelectorAll('.ls-opt').forEach(btn => {
        btn.addEventListener('click', () => {
          const k = Number(btn.dataset.k);
          const right = k === ok;
          btn.classList.toggle('right', right);
          btn.classList.toggle('wrong', !right);
          why.hidden = false;
          why.innerHTML = right
            ? `<b class="ok">Correct.</b> ${rule}`
            : `<b class="no">Not quite.</b> ${rule}`;
          if (right) box.querySelectorAll('.ls-opt').forEach(b => { b.disabled = true; });
        });
      });
    });
  }

  renderRead() {
    const body = this.root.querySelector('#lsBody');
    body.innerHTML = `<div class="ls-read">
      <header class="ls-intro">
        <div class="ls-intro-top">
          <span class="ls-kicker">Study sheet · ${this.L.minutesRead} min</span>
        </div>
        <h1>${this.L.title}</h1>
        <nav class="ls-toc" aria-label="Study sheet sections">${this.L.sheet.map((s, k) => `<a href="#sec${k}" data-k="${k}"><span>${k + 1}</span> ${s.title}</a>`).join('')}</nav>
      </header>
      <div class="ls-sheet">${this.sheetHTML()}</div>
      <div class="ls-cta">
        <div class="ls-cta-badge">Sheet done</div>
        <h3>Now try it hands-on</h3>
        <div class="ls-cta-acts">
          <a class="btn primary big" id="lsStartPart2" href="#/lesson/${this.L.id}/do">Start the lab →</a>
          <button class="btn ghost sm" onclick="window.print()">Print sheet</button>
        </div>
      </div>
    </div>`;
    this.bindSheet(body);
    body.querySelector('#lsStartPart2')?.addEventListener('click', () => {
      if (!this.readDone) {
        this.readDone = true;
        store.setLearn(this.key + '-read', 1, 1);
      }
    });
    body.querySelectorAll('.ls-toc a').forEach(a => a.onclick = e => { e.preventDefault(); document.getElementById('sec' + a.dataset.k).scrollIntoView({ behavior: 'smooth', block: 'start' }); });
    window.addEventListener('scroll', this.onScroll);
    this.onScroll();
  }

  onScroll() {
    const h = document.documentElement.scrollHeight - innerHeight;
    const bar = this.root.querySelector('#lsBar'); if (bar) bar.style.width = (h > 0 ? Math.min(100, (scrollY / h) * 100) : 100) + '%';
    if (h > 0 && scrollY / h > 0.92 && !this.readDone) {
      this.readDone = true;
      store.setLearn(this.key + '-read', 1, 1);
      this.root.querySelector('.ls-tabs a:first-child')?.classList.add('done');
      celebrateSmall(this.root.querySelector('.ls-cta'));
      buddy.onPartComplete(`Step 1 (Study Sheet) of Unit ${this.L.code}`);
    }
    const secs = this.root.querySelectorAll('.ls-sec');
    const links = this.root.querySelectorAll('.ls-toc a');
    if (secs.length && links.length) {
      let activeIdx = 0;
      secs.forEach((sec, idx) => {
        if (sec.getBoundingClientRect().top <= 160) activeIdx = idx;
      });
      links.forEach((a, idx) => a.classList.toggle('active', idx === activeIdx));
    }
  }

  sheetModal() {
    const m = document.createElement('div'); m.className = 'ls-modal';
    m.innerHTML = `<div class="ls-modal-card"><div class="ls-modal-h"><b>Unit ${this.L.code} · ${this.L.title}</b><button class="icon-btn">✕</button></div><div class="ls-sheet">${this.sheetHTML()}</div></div>`;
    document.body.appendChild(m);
    this.bindSheet(m);
    const close = () => m.remove();
    m.querySelector('button').onclick = close; m.onclick = e => { if (e.target === m) close(); };
  }

  // ================================================================== DO
  renderDo() {
    window.addEventListener('keydown', this.onKey);
    this.renderStep();
  }

  onKey(e) {
    if (e.target.matches('input')) return;
    if (e.key === 'Enter') { const c = this.root.querySelector('#lsNext'); if (c && !c.disabled) { e.preventDefault(); c.click(); } }
    if (/^[1-4]$/.test(e.key)) this.root.querySelectorAll('.ls-opt:not(:disabled)')[+e.key - 1]?.click();
  }

  goStep(i) {
    this.i = i;
    this.renderStep();
    const dots = this.root.querySelector('.ls-steps');
    if (dots && dots.getBoundingClientRect().top < 70) window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  renderStep() {
    this.cleanupStep?.(); this.cleanupStep = null;
    const steps = this.L.steps, st = steps[this.i];
    store.setLearn(this.key, this.i, steps.length);
    const bar = this.root.querySelector('#lsBar');
    if (bar) bar.style.width = ((this.i + 0.35) / steps.length) * 100 + '%';
    this.state = { tasksDone: 0, answered: false, tries: 0 };
    const tasks = st.tasks || [];
    const kindBadge = st.kind === '3d'
      ? '<span class="ls-kind is3d">3D bench</span>'
      : st.kind === 'visual'
        ? '<span class="ls-kind is2d">Interactive</span>'
        : '<span class="ls-kind isq">Quick check</span>';
    const readPrompt = !this.readDone && this.i === 0
      ? `<div class="ls-read-nudge"><span>Haven't read the sheet yet?</span><a href="#/lesson/${this.L.id}">Read it first (${this.L.minutesRead} min) →</a></div>`
      : '';
    const enter = this.shownI === this.i ? '' : this.shownI > this.i ? 'from-l' : 'from-r';
    this.shownI = this.i;
    const body = this.root.querySelector('#lsBody');
    body.innerHTML = `<div class="ls-do">
      ${readPrompt}
      <div class="ls-steps" role="tablist" aria-label="Lesson steps">${steps.map((s, k) => `<button type="button" class="ls-step-dot ${k < this.i ? 'done' : k === this.i ? 'cur' : ''}" data-step="${k}" title="Step ${k + 1}: ${s.title.replace(/"/g, '&quot;')}"><i>${k < this.i ? '✓' : k + 1}</i></button>`).join('')}</div>
      <article class="ls-step ${enter}">
        <div class="ls-step-meta">
          <div class="ls-step-n">Step ${this.i + 1} of ${steps.length}</div>
          ${kindBadge}
        </div>
        <h2>${hl(st.title)}</h2>
        <p class="ls-lead">${hl(st.text)}</p>
        ${st.how ? `<div class="ls-how"><b>Your move</b><span>${hl(st.how)}</span></div>` : ''}
        <div class="ls-inter ${st.kind === '3d' ? 'is3d' : 'is2d'}" id="lsInter" ${st.kind === 'question' ? 'hidden' : ''}></div>
        ${tasks.length ? `<div class="ls-tasks">${tasks.map((t, k) => `<div class="ls-task ${k === 0 ? 'cur' : ''}"><i></i><span>${hl(t.text)}</span></div>`).join('')}</div>` : ''}
        <div class="ls-fb" id="lsFb"></div>
        <div class="ls-q" id="lsQ" hidden></div>
        <div class="ls-nav">
          <button class="btn ghost" id="lsPrev" ${this.i === 0 ? 'disabled' : ''}>← Back</button>
          <button class="btn primary" id="lsNext" disabled>${this.i === steps.length - 1 ? 'Finish Unit 🎉' : 'Continue →'}</button>
        </div>
      </article>
    </div>`;
    body.querySelectorAll('.ls-step-dot').forEach(btn => {
      btn.onclick = () => {
        const idx = +btn.dataset.step;
        if (idx !== this.i) this.goStep(idx);
      };
    });
    body.querySelector('#lsPrev').onclick = () => this.goStep(this.i - 1);
    body.querySelector('#lsNext').onclick = () => this.next();

    const inter = body.querySelector('#lsInter');
    if (st.kind === '3d') this.mount3d(inter, st);
    else if (st.kind === 'visual') {
      const api = {
        done: () => this.tasksComplete(),
        say: h => this.say(h),
        miss: () => {
          this.state.tries++;
          this.missAt = performance.now();
          const fb = this.root.querySelector('#lsFb');
          fb?.classList.add('is-warn');
          fb?.classList.remove('is-info');
          buddy.onWrong();
        },
      };
      this.cleanupStep = VISUALS[st.visual](inter, api) || null;
      if (inter.querySelector('.v-sort')) enableDragSort(inter);
      inter.addEventListener('pointerdown', () => buddy.onBenchTouch('visual'), { passive: true });
      if (!tasks.length) this.tasksComplete(true);
    } else this.tasksComplete(true);
  }

  mount3d(inter, st) {
    if (!bench) {
      const el = document.createElement('div'); el.className = 'ls-bench';
      const tip = document.createElement('div'); tip.className = 'g-tip'; tip.hidden = true; document.body.appendChild(tip);
      const ui = {
        startLevel() {}, panel() {}, ask() {},
        objectiveDone: i => this.taskDone(i),
        levelComplete: () => this.tasksComplete(),
        say: (t) => this.say(t),
        tip: html => { if (!html) { tip.hidden = true; return; } tip.innerHTML = html; tip.hidden = false; },
        hintBar: t => { const b = this.root.querySelector('.ls-hintbar'); if (b) { b.hidden = !t; if (t) b.innerHTML = hl(t); } },
      };
      window.addEventListener('pointermove', e => { if (!tip.hidden) { tip.style.left = e.clientX + 16 + 'px'; tip.style.top = e.clientY + 16 + 'px'; } });
      el.innerHTML = `
        <div class="ls-bench-stage"></div>
        <div class="ls-bench-ctrl">
          <button type="button" class="ls-bctrl" id="lsBenchView" title="Recenter 3D camera">🎯 View</button>
          <button type="button" class="ls-bctrl" id="lsBenchReset" title="Reset 3D circuit">↺ Reset</button>
        </div>
        <div class="ls-hintbar" hidden></div>
        <div class="ls-bench-tips">Drag to rotate · Scroll to zoom · Click terminals to wire</div>`;
      const game = new Game(el.querySelector('.ls-bench-stage'), ui, { embedded: true });
      window.__electraGame = game;
      bench = { el, game, ui };
    }
    inter.appendChild(bench.el);
    bench.game.stage.paused = false;
    requestAnimationFrame(() => bench.game.stage.resize());
    const sc = st.scene;
    const level = {
      id: st.id, unit: this.L.id, intro: [], hints: [],
      objectives: (st.tasks || []).map(t => ({ text: t.text, done: t.done })),
      setup: sc.setup, camera: sc.camera, allowWiring: sc.allowWiring, noWiringMsg: sc.noWiringMsg, on: sc.on, highlight: sc.highlight,
    };
    bench.el.querySelector('#lsBenchView').onclick = e => {
      e.stopPropagation();
      const cam = sc.camera || { pos: [0, 7.2, 6.8], target: [0, 0.2, 0.2] };
      bench.game.stage.frame(cam.pos, cam.target);
      sfx.tap();
    };
    bench.el.querySelector('#lsBenchReset').onclick = e => {
      e.stopPropagation();
      sfx.tap();
      this.renderStep();
    };
    bench.game.load(level);
  }

  say(html) {
    const fb = this.root.querySelector('#lsFb');
    if (fb) {
      const raw = String(html || '').replace(/<[^>]+>/g, '').toLowerCase();
      const isOk = /^[✔✅]/.test(raw.trim());
      const justMissed = performance.now() - (this.missAt || -1e9) < 50;
      const isWarn = !isOk && (justMissed || raw.startsWith('not ') || raw.includes('careful') || raw.includes('check ') || raw.includes('remember:') || raw.includes('hold on') || raw.includes('no new wires') || raw.includes('⚠️') || raw.includes('❌') || raw.includes('💥'));
      const isInfo = raw.startsWith('click ') || raw.startsWith('pick ');
      fb.classList.toggle('is-warn', isWarn);
      fb.classList.toggle('is-info', !isWarn && isInfo);
      fb.innerHTML = hl(html);
      fb.classList.remove('pop');
      void fb.offsetWidth;
      fb.classList.add('pop');
    }
    buddy.onBenchEvent(html);
  }

  taskDone(k) {
    const rows = this.root.querySelectorAll('.ls-task');
    rows[k]?.classList.remove('cur'); rows[k]?.classList.add('done');
    rows[k + 1]?.classList.add('cur');
    this.state.tasksDone = k + 1;
    giveXP(5, rows[k]);
    celebrateSmall(rows[k]);
    buddy.onTaskDone();
  }

  tasksComplete(silent = false) {
    if (this.state.allDone) return;
    this.state.allDone = true;
    const st = this.L.steps[this.i];
    this.root.querySelectorAll('.ls-task').forEach(r => { r.classList.remove('cur'); r.classList.add('done'); });
    if (!silent) {
      if (st.success) this.say('✅ ' + st.success);
      if (st.kind !== '3d') giveXP(5, this.root.querySelector('#lsFb'));
      celebrateSmall(this.root.querySelector('#lsFb'));
      buddy.onTaskDone(st.title);
    }
    if (st.question) this.showQuestion(st.question);
    else this.root.querySelector('#lsNext').disabled = false;
  }

  showQuestion(q0) {
    const box = this.root.querySelector('#lsQ');
    box.hidden = false;

    if (q0.type === 'number') {
      const chips = q0.chips ? shuffle(q0.chips) : null;
      box.innerHTML = `<div class="ls-q-h">✅ Check yourself</div><div class="ls-q-q">${hl(q0.q)}</div>
        <div class="num-row"><input class="inp big" id="lsNumInp" autocomplete="off" inputmode="decimal" placeholder="Type your answer…">${q0.unit ? `<span class="unit">${q0.unit}</span>` : ''}<button class="btn primary" id="lsNumChk">Check</button></div>
        ${chips ? `<div class="chips ls-num-chips">${chips.map(c => `<button class="pchip" type="button" data-v="${c}">${c}${q0.unit ? ' ' + q0.unit : ''}</button>`).join('')}</div>` : ''}
        <div class="ls-why" hidden></div>`;
      box.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      const inp = box.querySelector('#lsNumInp');
      const chk = box.querySelector('#lsNumChk');
      const why = box.querySelector('.ls-why');
      const verify = () => {
        if (this.state.answered) return;
        const fixed = q0.fixedUnit !== false && q0.unit ? q0.unit : null;
        const v = parseAnswer(inp.value, fixed);
        why.hidden = false;
        if (!isFinite(v)) {
          why.innerHTML = `<b class="no">Hmm.</b> Type a number (or click one of the choices) to check.`;
          return;
        }
        this.state.tries++;
        if (close(v, q0.answer, q0.tol ?? 0.01)) {
          this.state.answered = true;
          inp.classList.remove('wrong'); inp.classList.add('right'); inp.disabled = true; chk.disabled = true;
          box.querySelectorAll('.ls-num-chips .pchip').forEach(b => { b.disabled = true; b.classList.toggle('on', close(parseAnswer(b.dataset.v, fixed), q0.answer, q0.tol ?? 0.01)); });
          why.innerHTML = `<b class="ok">Correct!</b> ${hl(q0.why)}`;
          giveXP(this.state.tries === 1 ? 10 : 5, chk);
          celebrateSmall(chk);
          buddy.onCorrect(this.state.tries);
          this.root.querySelector('#lsNext').disabled = false;
        } else {
          inp.classList.add('wrong'); setTimeout(() => inp.classList.remove('wrong'), 400);
          sfx.bad();
          const ratio = v / q0.answer;
          let nudge = '';
          if (isFinite(ratio) && ratio > 0) {
            const lg = Math.log10(ratio);
            if (Math.abs(lg - Math.round(lg)) < 0.01 && Math.round(lg) !== 0) nudge = ' Right digits — check where the decimal point moves!';
          }
          why.innerHTML = `<b class="no">Not quite.</b>${nudge} Have another go.`;
          box.classList.add('shake'); setTimeout(() => box.classList.remove('shake'), 400);
          buddy.onWrong();
        }
      };
      chk.onclick = verify;
      inp.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
          e.preventDefault(); e.stopPropagation();
          if (this.state.answered) this.root.querySelector('#lsNext')?.click();
          else verify();
        }
      });
      box.querySelectorAll('.ls-num-chips .pchip').forEach(b => b.onclick = () => {
        if (this.state.answered) return;
        inp.value = b.dataset.v;
        verify();
      });
      return;
    }

    // shuffle the options so the right answer isn't always in the same spot
    const order = q0.options.map((_, k) => k).sort(() => Math.random() - 0.5);
    const q = { ...q0, options: order.map(k => q0.options[k]), correct: order.indexOf(q0.correct) };
    this.state.correct = q.correct;
    box.innerHTML = `<div class="ls-q-h">✅ Check yourself</div><div class="ls-q-q">${hl(q.q)}</div>
      <div class="ls-opts">${q.options.map((o, k) => `<button class="ls-opt" data-k="${k}"><span>${k + 1}</span>${hl(o)}</button>`).join('')}</div><div class="ls-why" hidden></div>`;
    box.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    box.querySelectorAll('.ls-opt').forEach(b => b.onclick = () => {
      const k = +b.dataset.k; this.state.tries++;
      const why = box.querySelector('.ls-why'); why.hidden = false;
      if (k === q.correct) {
        box.querySelectorAll('.ls-opt').forEach((x, i) => { x.disabled = true; x.classList.toggle('right', i === k); });
        why.innerHTML = `<b class="ok">Correct!</b> ${hl(q.why)}`;
        giveXP(this.state.tries === 1 ? 10 : 5, b);
        celebrateSmall(b);
        buddy.onCorrect(this.state.tries);
        this.root.querySelector('#lsNext').disabled = false;
      } else {
        b.disabled = true; b.classList.add('wrong'); sfx.bad();
        why.innerHTML = `<b class="no">Not quite.</b> Have another go.`;
        box.classList.add('shake'); setTimeout(() => box.classList.remove('shake'), 400);
        buddy.onWrong();
      }
    });
  }

  next() {
    if (this.i < this.L.steps.length - 1) { this.goStep(this.i + 1); return; }
    this.finish();
  }

  finish() {
    this.cleanupStep?.();
    if (bench) { bench.game.unload(); bench.el.remove(); }
    store.setLearn(this.key, this.L.steps.length, this.L.steps.length);
    giveXP(50, this.root.querySelector('#lsNext'));
    celebrateBig();
    buddy.onUnitComplete(this.L.code, this.L.title);
    this.root.querySelector('#lsBar').style.width = '100%';
    const order = Object.keys(LESSONS_V2);
    const nextKey = order[order.indexOf(this.L.id) + 1];
    const nextL = nextKey ? LESSONS_V2[nextKey] : null;
    const lead = this.L.doneLead || 'You built circuits, broke them on purpose, fixed them, and used all three meters. Here\'s everything on one page:';
    this.root.querySelector('#lsBody').innerHTML = `<div class="ls-do"><article class="ls-step ls-done from-r">
      <div class="hook-emoji">🏆</div>
      <h2>Unit ${this.L.code} complete!</h2>
      <p class="ls-lead">${lead}</p>
      <div class="ls-recap">${this.L.sheet.map(s => `<div><b>${s.title}</b><span>${hl(s.key || s.exam || '')}</span></div>`).filter(x => !x.endsWith('<span></span></div>')).join('')}</div>
      <div class="ls-done-acts">
        <a class="btn primary big" href="#/practice/${this.L.id}">Practice ${this.L.code} →</a>
        ${nextL ? `<a class="btn ghost" href="#/lesson/${nextL.id}">Next: ${nextL.code} · ${nextL.title}</a>` : ''}
        <a class="btn ghost" href="#/">Course map</a>
      </div></article></div>`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

