// PracticeSession.js - the "doing" part: rounds of problems with hints, combos and instant feedback
import { makeProblem, randomGen, UNIT_GENERATORS } from './generators.js';
import { UNITS } from '../core/units.js';
import { parseAnswer, close, eng, plain, sig, sup, pick, shuffle } from '../core/num.js';
import { store } from '../core/store.js';
import { sfx, giveXP, burst, toast, celebrateSmall, celebrateBig } from '../core/fx.js';
import { buddy } from '../ui/Buddy.js';

// unit-less answers get powers of ten, never a bare SI prefix ("4.2 T" would read as tesla)
function showAnswer(x, unit) {
  if (unit) return eng(x, unit, 4);
  if (x === 0 || (Math.abs(x) >= 1e-3 && Math.abs(x) < 1e4)) return plain(x);
  const e = Math.floor(Math.log10(Math.abs(x)));
  return `${sig(x / 10 ** e, 4)} × 10${sup(e)}`;
}

const PRAISE = ['Nailed it!', 'Shockingly good ⚡', 'Current-ly crushing it', 'Ohm my!', 'Resistance is futile', 'Watt a legend', 'Totally grounded', 'Positive vibes ➕', 'Amped up!'];

export class PracticeSession {
  /** mode: unitId | 'mix' | 'review' | 'blitz' */
  constructor(root, mode, nav, opts = {}) {
    this.root = root; this.mode = mode; this.nav = nav;
    this.skill = opts.skill || null;
    this.total = mode === 'mix' ? 10 : mode === 'blitz' ? Infinity : 8;
    this.results = []; this.combo = 0; this.bestCombo = 0; this.earned = 0;
    this.lastGen = null; this.queue = null;
    this.onKey = this.onKey.bind(this);
    if (mode === 'review') {
      this.queue = shuffle(store.get().missed.slice()).slice(0, 10);
      this.total = this.queue.length;
    }
    this.unit = UNITS.find(u => u.id === mode);
  }

  mount() {
    window.addEventListener('keydown', this.onKey);
    if (this.mode === 'review' && this.total === 0) {
      this.root.innerHTML = `<div class="ps"><div class="card c-done"><div class="hook-emoji">🧹</div><h2>Nothing to review</h2><p class="lead">Missed questions come back here with new numbers.</p><a class="btn primary" href="#/">Back to map</a></div></div>`;
      return;
    }
    if (this.mode === 'blitz') { this.blitzEnd = Date.now() + 90_000; }
    this.root.innerHTML = `<div class="ps" style="--accent:${this.unit?.color || '#38bdf8'}">
      <div class="lp-top">
        <button class="icon-btn" id="psBack" title="Back to map">✕</button>
        <div class="ps-title">${this.title()}</div>
        <div class="combo" id="combo"></div>
        <div class="lp-count" id="psCount"></div>
      </div>
      ${this.unit ? this.skillBar() : ''}
      <div class="ps-dots" id="psDots"></div>
      <div class="lp-stage" id="psStage"></div></div>`;
    this.root.querySelector('#psBack').onclick = () => this.nav('#/');
    this.root.querySelectorAll('.skill-chip').forEach(b => b.onclick = () => {
      this.skill = b.dataset.g || null;
      this.root.querySelectorAll('.skill-chip').forEach(x => x.classList.toggle('on', x === b));
      this.next(true);
    });
    if (this.mode === 'blitz') this.timer = setInterval(() => this.tickBlitz(), 250);
    this.next();
  }

  unmount() { window.removeEventListener('keydown', this.onKey); clearInterval(this.timer); }

  title() {
    if (this.mode === 'mix') return '🧩 Exam mix';
    if (this.mode === 'review') return '🔁 Review your misses';
    if (this.mode === 'blitz') return '⚡ 90-second blitz';
    return `${this.unit.emoji} ${this.unit.code} · ${this.unit.title}`;
  }

  skillBar() {
    const gens = UNIT_GENERATORS[this.mode];
    const keys = Object.keys(gens);
    if (keys.length < 2) return '';
    return `<div class="skills"><button class="skill-chip ${!this.skill ? 'on' : ''}">🎲 Mixed</button>${keys.map(k => `<button class="skill-chip ${this.skill === k ? 'on' : ''}" data-g="${k}">${gens[k][0]}</button>`).join('')}</div>`;
  }

  pickProblem() {
    if (this.mode === 'review') { const m = this.queue[this.results.length]; return makeProblem(m.unit, m.gen); }
    if (this.mode === 'mix' || this.mode === 'blitz') {
      // favour units already learned, but include everything
      const learned = UNITS.filter(u => store.get().learn[u.id]?.seen > 3).map(u => u.id);
      const pool = learned.length >= 2 && Math.random() < 0.75 ? learned : UNITS.map(u => u.id);
      for (let tries = 0; tries < 30; tries++) {
        const u = pick(pool); const g = randomGen(u, this.lastGen);
        const p = makeProblem(u, g);
        if (this.mode !== 'blitz' || p.kind === 'mcq' || (p.kind === 'num' && tries > 12)) return p;
      }
    }
    const g = this.skill || randomGen(this.mode, this.lastGen);
    return makeProblem(this.mode, g);
  }

  next(reset = false) {
    if (reset) { this.results = []; this.combo = 0; }
    if (this.results.length >= this.total) return this.summary();
    this.p = this.pickProblem();
    this.lastGen = this.p.gen;
    this.tries = 0; this.hintsUsed = 0; this.done = false; this.partIdx = 0; this.partTries = 0; this.anyMissPart = false;
    this.render();
  }

  dots() {
    const n = this.total === Infinity ? this.results.length + 1 : this.total;
    this.root.querySelector('#psDots').innerHTML = Array.from({ length: Math.min(n, 30) }, (_, k) => {
      const r = this.results[k];
      return `<i class="${r === undefined ? (k === this.results.length ? 'cur' : '') : r ? 'ok' : 'no'}"></i>`;
    }).join('');
    this.root.querySelector('#psCount').textContent = this.total === Infinity ? `${this.results.filter(Boolean).length} ✔` : `${Math.min(this.results.length + 1, this.total)}/${this.total}`;
    const cb = this.root.querySelector('#combo');
    cb.innerHTML = this.combo >= 2 ? `🔥 ×${this.combo}` : '';
    cb.classList.toggle('hot', this.combo >= 5);
  }

  render() {
    this.dots();
    const p = this.p;
    window.__electraProblem = p; // handy for debugging in the console
    const u = UNITS.find(x => x.id === p.unitId);
    const stage = this.root.querySelector('#psStage');
    stage.innerHTML = `<div class="card c-prob enter-r">
      <div class="prob-tags"><span class="utag" style="--c:${u.color}">${u.code}</span><span class="stag">${p.skill}</span></div>
      <div class="prob-q">${p.q}</div>
      ${p.fig ? `<div class="fig">${p.fig}</div>` : ''}
      <div class="ans" id="ans"></div>
      <div class="fb" id="fb" aria-live="polite"></div>
      <div class="hints" id="hints"></div>
      <div class="prob-actions" id="acts"></div>
      <div class="sol" id="sol" hidden></div>
    </div>`;
    const ans = stage.querySelector('#ans');
    if (p.kind === 'mcq') {
      ans.innerHTML = `<div class="opts">${p.options.map((o, k) => `<button class="opt" data-k="${k}"><span class="key">${k + 1}</span>${o}</button>`).join('')}</div>`;
      ans.querySelectorAll('.opt').forEach(b => b.onclick = () => this.checkMcq(+b.dataset.k));
    } else if (p.kind === 'num') {
      ans.innerHTML = `<div class="num-row"><input class="inp big" id="inp" autocomplete="off" inputmode="decimal" placeholder="your answer"><span class="unit">${p.unit}</span><button class="btn primary" id="chk">Check</button></div>
        ${!p.fixed && /[ΩAVWSCJ]/.test(p.unit) ? '<div class="hintline">Prefixes OK: 4.7k, 20m, 3.3M, 45µ…</div>' : ''}`;
      const inp = ans.querySelector('#inp');
      ans.querySelector('#chk').onclick = () => this.checkNum();
      inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); this.done ? this.next() : this.checkNum(); } });
      setTimeout(() => inp.focus({ preventScroll: true }), 50);
    } else if (p.kind === 'multi') {
      ans.innerHTML = `<div class="parts">${p.parts.map((pt, k) => `<div class="part ${k === 0 ? 'active' : 'locked'}" data-k="${k}">
        <label>${pt.label}</label><input class="inp" autocomplete="off" inputmode="decimal" ${k ? 'disabled' : ''}><span class="unit">${pt.unit}</span><button class="btn sm">Check</button><span class="pres"></span></div>`).join('')}</div>`;
      ans.querySelectorAll('.part').forEach((row, k) => {
        const inp = row.querySelector('input');
        row.querySelector('button').onclick = () => this.checkPart(k);
        inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); this.done ? this.next() : this.checkPart(k); } });
      });
      setTimeout(() => ans.querySelector('input')?.focus({ preventScroll: true }), 50);
    }
    this.actions();
  }

  actions() {
    const acts = this.root.querySelector('#acts');
    const p = this.p;
    if (this.done) {
      acts.innerHTML = `<button class="btn primary big" id="nx">${this.results.length >= this.total ? 'See results 🏁' : 'Next →'}</button>`;
      acts.querySelector('#nx').onclick = () => this.next();
      return;
    }
    const left = p.hints.length - this.hintsUsed;
    acts.innerHTML = `${left > 0 ? `<button class="btn ghost sm" id="hn">💡 Hint <small>(${left})</small></button>` : ''}
      ${p.solution.length && p.kind !== 'mcq' ? `<button class="btn ghost sm" id="sh">📖 Show me how</button>` : ''}`;
    acts.querySelector('#hn')?.addEventListener('click', () => this.hint());
    acts.querySelector('#sh')?.addEventListener('click', () => this.giveUp());
  }

  hint() {
    const h = this.p.hints[this.hintsUsed++];
    const el = document.createElement('div'); el.className = 'hint'; el.innerHTML = `💡 ${h}`;
    this.root.querySelector('#hints').appendChild(el);
    sfx.tap(); this.actions();
  }

  showSolution(open = true) {
    const sol = this.root.querySelector('#sol');
    if (!this.p.solution.length && !this.p.tip) return;
    sol.hidden = false;
    sol.innerHTML = `${this.p.solution.length ? `<div class="sol-h">How to solve it</div><ol>${this.p.solution.map(s => `<li>${s}</li>`).join('')}</ol>` : ''}${this.p.tip ? `<div class="tip">📝 ${this.p.tip}</div>` : ''}`;
    if (!open) sol.classList.add('quiet');
  }

  finishProblem(correct) {
    const firstTry = correct && this.tries <= 1 && this.hintsUsed === 0 && !this.anyMissPart;
    store.recordAnswer(this.p.unitId, this.p.gen, correct, firstTry);
    if (this.mode === 'review' && firstTry) store.clearMissed(this.p.unitId, this.p.gen);
    this.results.push(firstTry);
    const fbEl = this.root.querySelector('#fb');
    if (firstTry) {
      this.combo++; this.bestCombo = Math.max(this.bestCombo, this.combo);
      const xp = 10 + Math.min(10, (this.combo - 1) * 2);
      this.earned += xp; giveXP(xp, fbEl);
      if (this.p.kind !== 'multi') celebrateSmall(fbEl);
      if (this.combo >= 3) sfx.combo(this.combo);
      if ([3, 5, 10, 15, 20].includes(this.combo)) { burst({ big: this.combo >= 5 }); toast(`🔥 ${this.combo} in a row!`); }
      buddy.onCorrect(1);
    } else {
      this.combo = 0;
      if (correct) {
        this.earned += 4;
        giveXP(4, fbEl);
        if (this.p.kind !== 'multi') celebrateSmall(fbEl);
        buddy.onCorrect(this.tries);
      } else {
        buddy.onWrong();
      }
    }
    this.done = true;
    this.dots();
    this.actions();
    this.showSolution(!firstTry);
    if (this.mode === 'blitz') setTimeout(() => { if (this.done && this.p === this._lastP) this.next(); }, firstTry ? 500 : 1800);
    this._lastP = this.p;
  }

  feedback(html, cls) {
    const fb = this.root.querySelector('#fb');
    fb.className = `fb ${cls}`; fb.innerHTML = html;
  }

  checkMcq(k) {
    if (this.done) return;
    this.tries = 1;
    const ok = k === this.p.correct;
    this.root.querySelectorAll('.opt').forEach((b, i) => { b.disabled = true; b.classList.toggle('right', i === this.p.correct); b.classList.toggle('wrong', i === k && !ok); });
    if (ok) this.feedback(`✅ ${pick(PRAISE)}`, 'ok');
    else { sfx.bad(); this.feedback('❌ Not this time. Here\'s the reasoning:', 'no'); this.root.querySelector('.c-prob').classList.add('shake'); }
    this.finishProblem(ok);
  }

  checkNum() {
    if (this.done) return;
    const inp = this.root.querySelector('#inp');
    const v = parseAnswer(inp.value, this.p.fixed ? this.p.unit : null);
    if (!isFinite(v)) { this.feedback('🤔 I couldn\'t read that number. Try something like <code>4.7k</code>, <code>0.02</code> or <code>3e-6</code>.', 'warn'); return; }
    this.tries++;
    if (close(v, this.p.answer, this.p.tol)) {
      inp.classList.add('right'); inp.disabled = true;
      this.feedback(`✅ ${pick(PRAISE)} <span class="muted">${this.p.fixed ? '' : '= ' + showAnswer(this.p.answer, this.p.unit)}</span>`, 'ok');
      this.finishProblem(true);
    } else {
      sfx.bad(); inp.classList.add('wrong'); setTimeout(() => inp.classList.remove('wrong'), 450);
      const ratio = v / this.p.answer;
      let nudge = '';
      if (isFinite(ratio) && ratio > 0) {
        const lg = Math.log10(ratio);
        if (Math.abs(lg - Math.round(lg)) < 0.01 && Math.round(lg) % 3 === 0 && Math.round(lg) !== 0) nudge = ' Your digits are right, but you\'re off by a factor of 1000. Check your prefix!';
        else if (Math.abs(lg - Math.round(lg)) < 0.01 && Math.round(lg) !== 0) nudge = ' Right digits, wrong decimal place.';
      }
      if (this.tries >= 3) {
        this.feedback(`❌ The answer is <b>${this.p.fixed ? this.p.answer + ' ' + this.p.unit : eng(this.p.answer, this.p.unit, 4)}</b>. Look at the steps below.`, 'no');
        inp.disabled = true; this.finishProblem(false);
      } else {
        this.feedback(`❌ Not quite.${nudge} ${this.tries === 1 ? 'Try again, or grab a hint.' : 'Last try!'}`, 'no');
        buddy.onWrong();
      }
    }
  }

  checkPart(k) {
    if (this.done || k !== this.partIdx) return;
    const row = this.root.querySelectorAll('.part')[k];
    const pt = this.p.parts[k];
    const inp = row.querySelector('input');
    const v = parseAnswer(inp.value, pt.fixed ? pt.unit : null);
    if (!isFinite(v)) { this.feedback('🤔 I couldn\'t read that number.', 'warn'); return; }
    if (k === 0 && this.partTries === 0) this.tries = 1;
    if (close(v, pt.answer, pt.tol)) {
      row.classList.add('ok'); inp.disabled = true; row.querySelector('.pres').textContent = '✔';
      celebrateSmall(row);
      this.feedback(`✔ ${pt.label.replace(/<[^>]+>/g, '')} correct`, 'ok');
      this.advancePart(k);
    } else {
      this.partTries++; sfx.bad();
      inp.classList.add('wrong'); setTimeout(() => inp.classList.remove('wrong'), 450);
      if (this.partTries >= 2) {
        this.anyMissPart = true;
        inp.value = pt.fixed ? pt.answer : eng(pt.answer, '', 4).replace(' ', '');
        inp.disabled = true; row.classList.add('given'); row.querySelector('.pres').textContent = '→';
        this.feedback(`That one is <b>${pt.fixed ? pt.answer + ' ' + pt.unit : eng(pt.answer, pt.unit, 4)}</b>. Filled it in so you can carry on.`, 'warn');
        this.advancePart(k);
      } else {
        this.feedback('❌ Not quite. One more go (or take a hint).', 'no');
        buddy.onWrong();
      }
    }
  }

  advancePart(k) {
    this.partIdx = k + 1; this.partTries = 0;
    const rows = this.root.querySelectorAll('.part');
    if (this.partIdx >= rows.length) {
      const ok = !this.anyMissPart;
      this.feedback(ok ? `✅ ${pick(PRAISE)} Whole table solved!` : '👍 Done. Check the steps for the ones you missed.', ok ? 'ok' : 'warn');
      if (ok) celebrateSmall(this.root.querySelector('.parts'));
      this.finishProblem(true);
      return;
    }
    const nr = rows[this.partIdx];
    nr.classList.remove('locked'); nr.classList.add('active'); rows[k].classList.remove('active');
    const ni = nr.querySelector('input'); ni.disabled = false; ni.focus({ preventScroll: true });
  }

  giveUp() {
    if (this.done) return;
    this.tries = 9;
    if (this.p.kind === 'num') {
      const inp = this.root.querySelector('#inp'); inp.disabled = true;
      this.feedback(`Answer: <b>${this.p.fixed ? this.p.answer + ' ' + this.p.unit : eng(this.p.answer, this.p.unit, 4)}</b>`, 'warn');
    } else if (this.p.kind === 'multi') {
      this.root.querySelectorAll('.part').forEach((row, k) => { const pt = this.p.parts[k]; const i = row.querySelector('input'); if (!row.classList.contains('ok')) { i.value = pt.fixed ? pt.answer : eng(pt.answer, '', 4).replace(' ', ''); i.disabled = true; row.classList.remove('locked', 'active'); row.classList.add('given'); } });
      this.anyMissPart = true;
      this.feedback('Here\'s the full working. Try the next one yourself!', 'warn');
    }
    this.finishProblem(false);
  }

  tickBlitz() {
    const left = Math.max(0, this.blitzEnd - Date.now());
    const el = this.root.querySelector('#psCount');
    if (el) el.innerHTML = `⏱ ${Math.ceil(left / 1000)}s · ${this.results.filter(Boolean).length} ✔`;
    if (left <= 0) { clearInterval(this.timer); this.total = this.results.length; this.summary(); }
  }

  onKey(e) {
    if (e.target.matches('input')) return;
    if (/^[1-4]$/.test(e.key) && !this.done) this.root.querySelectorAll('.opt')[+e.key - 1]?.click();
    if ((e.key === 'Enter' || e.key === 'ArrowRight') && this.done) { e.preventDefault(); this.next(); }
    if (e.key === 'h' && !this.done) this.hint();
  }

  summary() {
    clearInterval(this.timer);
    const n = this.results.length, right = this.results.filter(Boolean).length;
    const pct = n ? Math.round(right / n * 100) : 0;
    if (pct >= 80) {
      celebrateBig();
      buddy.onPartComplete('Practice round');
    } else {
      sfx.cheer();
    }
    const verdict = pct === 100 ? 'Flawless. 🏆' : pct >= 80 ? 'Exam-ready on this one. 💪' : pct >= 50 ? 'Getting there! One more round will lock it in.' : 'Good warm-up. Try the Learn cards again, then come back.';
    const missed = store.get().missed.length;
    const again = this.mode === 'review' ? '#/practice/review' : `#/practice/${this.mode}`;
    this.root.querySelector('#psStage').innerHTML = `<div class="card c-done enter-r">
      <div class="score-ring" style="--p:${pct}"><span>${right}/${n}</span></div>
      <h2>${verdict}</h2>
      <div class="stats"><div><b>+${this.earned}</b><span>XP</span></div><div><b>${this.bestCombo}</b><span>best streak</span></div><div><b>${pct}%</b><span>first try</span></div></div>
      <div class="done-actions">
        <button class="btn primary big" id="again">↻ Another round</button>
        ${missed ? `<a class="btn ghost" href="#/practice/review">🔁 Review misses (${missed})</a>` : ''}
        <a class="btn ghost" href="#/">🗺️ Back to map</a>
      </div></div>`;
    this.root.querySelector('#again').onclick = () => this.nav(again, true);
    const dots = this.root.querySelector('#psDots'); if (dots) dots.innerHTML = '';
  }
}
