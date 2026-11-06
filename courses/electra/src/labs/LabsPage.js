// LabsPage.js - the in-class labs (EMNG1001 Labs 6-9): #/labs (list), #/labs/<n> (lesson view),
// #/labs/<n>/guide (guided step-by-step mode). Calm, light/dark, phone first.
import './labs.css';
import { labStore } from './labstore.js';
import { Notebook, fieldHTML, tableHTML, calcHTML, calcResults, parseNum, pct, esc } from './labkit.js';
import * as W from './widgets.js';
import lab6 from './lab6.js';
import lab7 from './lab7.js';
import lab8 from './lab8.js';
import lab9 from './lab9.js';

export const LABS = { 6: lab6, 7: lab7, 8: lab8, 9: lab9 };

const SAFETY = [
  'Follow your instructor’s directions and the lab sheet. Use only the college’s kit and equipment.',
  'Switch off or disconnect the power before you measure resistance or change the circuit.',
  'Check the polarity of electrolytic capacitors and LEDs before you apply power.',
  'Don’t use damaged cords or mains-powered equipment. Don’t go beyond the settings in the lab sheet.',
];

let uid = 0;

export class LabsPage {
  constructor(root, arg, sub, nav) {
    this.root = root; this.nav = nav;
    this.lab = LABS[arg] || null;
    this.view = !this.lab ? 'index' : sub === 'guide' ? 'guide' : 'lesson';
    this.widgets = [];
    if (this.lab) {
      this.nb = new Notebook(this.lab.id);
      this.nb.add(this.lab.fields);
    }
  }

  mount() {
    document.body.classList.add('lw-on');
    document.body.classList.toggle('lw-guide', this.view === 'guide');
    this.offStore = labStore.on(w => { if (w === 'theme' || w === 'motion') this.applyPrefs(); });
    this.bind();
    this.render();
  }

  unmount() {
    this.widgets.forEach(w => w.unmount?.());
    this.offStore?.();
    this.ac?.abort();
    document.body.classList.remove('lw-on', 'lw-guide');
    delete document.documentElement.dataset.lwTheme;
  }

  applyPrefs() {
    const el = this.root.querySelector('.lw');
    const theme = labStore.theme(), motion = labStore.motionOn() ? 'on' : 'off';
    document.documentElement.dataset.lwTheme = theme;
    if (!el) return;
    el.dataset.theme = theme; el.dataset.motion = motion;
    const tb = el.querySelector('[data-act="theme"]');
    if (tb) { tb.innerHTML = theme === 'dark' ? '☀︎<span> Light</span>' : '☾<span> Dark</span>'; tb.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`); }
    const mb = el.querySelector('[data-act="motion"]');
    if (mb) { mb.innerHTML = motion === 'on' ? '〰<span> Motion on</span>' : '—<span> Motion off</span>'; mb.title = 'Animations on or off'; mb.setAttribute('aria-pressed', motion === 'on'); }
  }

  header(back, backLabel) {
    return `<header class="lw-top">
      <a class="lw-back" href="${back}">← <span>${backLabel}</span></a>
      <div class="lw-prefs">
        <button type="button" class="pill" data-act="motion" aria-pressed="true">Motion on</button>
        <button type="button" class="pill" data-act="theme">☾ Dark</button>
      </div></header>`;
  }

  render() {
    this.widgets.forEach(w => w.unmount?.());
    this.widgets = [];
    let body;
    if (this.view === 'index') body = this.indexHTML();
    else if (this.view === 'lesson') { labStore.setLast(this.lab.num, 'lesson'); body = this.lessonHTML(); }
    else body = this.guideHTML();
    this.root.innerHTML = `<div class="lw">${body}</div>`;
    this.applyPrefs();
    this.mountTokens(this.root);
    this.refresh();
    this.fitAll();
  }

  /** Crop each diagram's viewBox to what is drawn, so it uses the full width on a phone. */
  fitAll(scope = this.root) {
    scope.querySelectorAll('.fig svg.sch').forEach(svg => {
      try {
        const bb = svg.getBBox();
        if (bb.width > 0) svg.setAttribute('viewBox', `${bb.x - 10} ${bb.y - 10} ${bb.width + 20} ${bb.height + 20}`);
      } catch { /* not rendered yet */ }
    });
  }

  /* ------------------------------------------------------------------ index */
  indexHTML() {
    const last = labStore.last();
    const resume = last && LABS[last.lab]
      ? `<a class="resume" href="#/labs/${last.lab}${last.view === 'guide' ? '/guide' : ''}">Continue <b>Lab ${last.lab} · ${LABS[last.lab].title}</b>${last.view === 'guide' ? `, guided step ${labStore.guide(LABS[last.lab].id).step + 1}` : ''} →</a>` : '';
    return `${this.header('#/', 'Circuit Analysis')}
      <main class="lw-main">
        <section class="lw-hero">
          <p class="kick">EMNG1001 · In-class labs</p>
          <h1>Labs 6–9</h1>
          <p class="lead">Each lab has a <b>lesson</b> to read before class and a <b>guided mode</b> that walks you through the procedure one step at a time on your phone. Your readings stay on this device.</p>
          ${resume}
        </section>
        <div class="lab-cards">${Object.values(LABS).map(L => {
          const g = labStore.guide(L.id), seen = g.seen.length, n = L.guide.length;
          const filled = Object.keys(labStore.notesFor(L.id)).length;
          return `<a class="lab-card" href="#/labs/${L.num}">
            <span class="lc-n">Lab ${L.num}</span>
            <span class="lc-i" aria-hidden="true">${L.icon}</span>
            <b>${L.title}</b>
            <span class="lc-t">${L.tagline}</span>
            <span class="lc-p"><span class="bar"><i style="width:${Math.round((seen / n) * 100)}%"></i></span>
              <small>${seen ? `${seen}/${n} guided steps` : 'Not started'}${filled ? ` · ${filled} entries saved` : ''}</small></span>
          </a>`;
        }).join('')}</div>
        ${this.safetyHTML()}
      </main>`;
  }

  safetyHTML() {
    return `<aside class="safety"><h3>Lab safety</h3><ul>${SAFETY.map(s => `<li>${s}</li>`).join('')}</ul></aside>`;
  }

  /* ------------------------------------------------------------------ lesson */
  lessonHTML() {
    const L = this.lab, g = labStore.guide(L.id);
    const started = g.seen.length > 0;
    return `${this.header('#/labs', 'All labs')}
      <main class="lw-main">
        <section class="lw-hero">
          <p class="kick">Lab ${L.num} · lesson</p>
          <h1>${L.title}</h1>
          <p class="lead">${L.tagline}</p>
          <div class="ov">
            <div><h3>What it’s about</h3><p>${L.overview.about}</p></div>
            <div><h3>What you’ll build and measure</h3><p>${L.overview.build}</p></div>
            <div><h3>By the end you should understand</h3><ul>${L.overview.understand.map(u => `<li>${u}</li>`).join('')}</ul></div>
          </div>
          <div class="cta-row">
            <a class="btn-go" href="#/labs/${L.num}/guide">${started ? `Continue guided lab · step ${g.step + 1} of ${L.guide.length}` : 'Start guided lab'} →</a>
            <span class="muted">One action at a time, with Back and Next.</span>
          </div>
        </section>
        <nav class="toc" aria-label="Sections"><b>In this lab</b><ol>${L.sections.map((s, i) => `<li><a href="#/labs/${L.num}" data-jump="s${i}">${s.title}</a></li>`).join('')}</ol></nav>
        ${this.safetyHTML()}
        ${L.sections.map((s, i) => `<section class="sec ${s.fig ? 'has-fig' : ''}" id="s${i}">
          <div class="sec-h"><p class="kick">${s.kicker}</p><h2>${s.title}</h2></div>
          <div class="sec-body"><div class="sec-txt">${this.tokens(s.html)}</div>
          ${s.fig ? `<div class="sec-fig">${this.figHTML(s.fig, s.figStage || 0)}</div>` : ''}</div>
        </section>`).join('')}
        <section class="sec end">
          <div class="sec-txt"><h2>Ready?</h2><p>Open the guided mode in class and follow it step by step. Everything you type here and there is the same notebook.</p>
          <div class="cta-row"><a class="btn-go" href="#/labs/${L.num}/guide">${started ? 'Continue guided lab' : 'Start guided lab'} →</a></div>
          <p class="muted small">Your entries are saved only in this browser. <button type="button" class="linkish" data-act="clear">Clear my Lab ${L.num} entries</button></p></div>
        </section>
      </main>`;
  }

  /* ------------------------------------------------------------------ guide */
  guideHTML() {
    const L = this.lab, n = L.guide.length;
    let i = Math.max(0, Math.min(n - 1, labStore.guide(L.id).step || 0));
    labStore.setGuideStep(L.id, i, L.num);
    const st = L.guide[i];
    const blk = (cls, title, html) => (html ? `<div class="gblk ${cls}"><h3>${title}</h3><p>${html}</p></div>` : '');
    const extras = [
      st.fields?.length ? `<div class="g-fields">${st.fields.map(k => fieldHTML(this.nb, k, { id: ++uid })).join('')}</div>` : '',
      st.table ? tableHTML(this.nb, L.tables[st.table]) : '',
      st.kcl ? `<div data-w="kcl"></div>` : '',
      st.calc ? calcHTML(this.nb, L.calcs[st.calc]) : '',
      st.widget ? `<div data-w="${st.widget.split(':')[0]}" data-arg="${st.widget.split(':')[1] || ''}"></div>` : '',
    ].join('');
    return `<header class="lw-top g-top">
        <a class="lw-back" href="#/labs/${L.num}" data-act="exit">✕ <span>Exit to lesson</span></a>
        <div class="g-prog" role="progressbar" aria-valuemin="1" aria-valuemax="${n}" aria-valuenow="${i + 1}">
          <span>Lab ${L.num} · step <b>${i + 1}</b> of ${n}</span><span class="bar"><i style="width:${((i + 1) / n) * 100}%"></i></span></div>
        <div class="lw-prefs"><button type="button" class="pill" data-act="motion">Motion on</button><button type="button" class="pill" data-act="theme">☾ Dark</button></div>
      </header>
      <main class="lw-main guide">
        <article class="g-card ${st.fig ? 'has-fig' : ''}">
          <div class="g-h"><p class="kick">${st.part}</p><h2>${st.title}</h2></div>
          <div class="g-body"><div class="g-txt">
            ${blk('do', 'Do', st.do)}
            ${blk('obs', 'Observe or measure', st.observe)}
            ${blk('why', 'What’s happening', st.why)}
            ${blk('watch', 'Watch out', st.watch)}
            ${st.hint ? `<div class="gblk hint"><h3>Hint</h3><p>${st.hint}</p></div>` : ''}
          </div>
          ${st.fig ? `<div class="g-fig">${this.figHTML(st.fig, st.figStage || 0)}</div>` : ''}</div>
        </article>
        ${extras ? `<div class="g-extra">${extras}</div>` : ''}
      </main>
      <nav class="g-nav">
        <button type="button" class="btn-nav" data-act="prev" ${i === 0 ? 'disabled' : ''}>← Back</button>
        <ol class="dots" aria-hidden="true">${L.guide.map((_, j) => `<li class="${j === i ? 'on' : labStore.guide(L.id).seen.includes(j) ? 'seen' : ''}"></li>`).join('')}</ol>
        ${i < n - 1 ? `<button type="button" class="btn-nav primary" data-act="next">Next →</button>`
          : `<a class="btn-nav primary" href="#/labs/${L.num}">Finish ✓</a>`}
      </nav>`;
  }

  /* ------------------------------------------------------------------ pieces */
  tokens(html) {
    const L = this.lab;
    return html.replace(/\{\{(\w+)(?::([\w]+))?\}\}/g, (_, kind, arg) => {
      if (kind === 'table') return tableHTML(this.nb, L.tables[arg]);
      if (kind === 'field') return fieldHTML(this.nb, arg);
      if (kind === 'calc') return calcHTML(this.nb, L.calcs[arg]);
      return `<div data-w="${kind}" data-arg="${arg || ''}"></div>`;
    });
  }

  figHTML(name, stage = 0) {
    const f = this.lab.figs[name];
    if (!f) return '';
    const ctl = [];
    if (f.stages) ctl.push(`<div class="seg" data-fstage>${f.stages.map((s, j) => `<button type="button" data-stage="${j}" class="${j === stage ? 'on' : ''}">${s}</button>`).join('')}</div>`);
    if (f.hl) ctl.push(`<div class="chips">${f.hl.map(h => `<button type="button" class="chip ${h.t}" data-hl="${h.t}" aria-pressed="false">${h.label.replace(/_(\w)/, '<sub>$1</sub>')}</button>`).join('')}${f.arrows ? `<button type="button" class="chip cur" data-cur aria-pressed="false">Show current</button>` : ''}</div>`);
    return `<figure class="fig" data-fig="${name}" data-stage="${stage}" data-show="">
      <div class="fig-art">${f.draw(stage, {})}</div>
      ${ctl.length ? `<div class="fig-ctl">${ctl.join('')}</div>` : ''}
      ${f.caption ? `<figcaption>${f.caption}</figcaption>` : ''}</figure>`;
  }

  redrawFig(fig) {
    const f = this.lab.figs[fig.dataset.fig];
    const cur = fig.dataset.cur === '1';
    fig.querySelector('.fig-art').innerHTML = f.draw(+fig.dataset.stage, { arrows: cur, flow: cur });
    this.fitAll(fig);
  }

  mountTokens(scope) {
    const env = { motion: () => labStore.motionOn() };
    scope.querySelectorAll('[data-w]').forEach(el => {
      const fn = W[el.dataset.w];
      if (!fn) return;
      const w = el.dataset.w === 'scope' ? fn(el, env, +el.dataset.arg || 1) : fn(el, el.dataset.w === 'kcl' ? this.nb : env);
      if (w) this.widgets.push(w);
    });
  }

  /** Re-work everything derived from the notebook: calculators, ✓ checks, differences, KCL sums. */
  refresh(skip) {
    if (!this.lab) return;
    const L = this.lab;
    this.root.querySelectorAll('[data-calc]').forEach(el => {
      const c = L.calcs[el.dataset.calc];
      if (c) el.outerHTML = calcHTML(this.nb, c);
    });
    const cache = {};
    const expected = key => {
      const ck = L.checks?.[key];
      if (!ck) return null;
      if (typeof ck === 'function') return ck(this.nb);
      const [cid, sid] = ck;
      const c = L.calcs[cid];
      if (!(cid in cache)) {
        const srcs = c.sources || ['meas', 'nom'];
        const nomOnly = srcs.length === 1 && srcs[0] === 'nom';
        if (nomOnly || cid === 'th') {
          const v = {}; c.inputs.forEach(i => { v[i.sym] = i.nom; });
          cache[cid] = Object.fromEntries(c.steps(v, true).filter(s => s.id).map(s => [s.id, s.r]));
        } else cache[cid] = calcResults(this.nb, c);
      }
      return cache[cid]?.[sid] ?? null;
    };
    this.root.querySelectorAll('[data-chk]').forEach(el => {
      const key = el.dataset.chk, mine = this.nb.num(key), exp = expected(key);
      if (mine == null || exp == null || !Number.isFinite(exp)) { el.textContent = ''; el.className = 'chk'; return; }
      const ok = Math.abs(Math.abs(mine) - Math.abs(exp)) <= Math.max(Math.abs(exp) * 0.015, 1e-12);
      el.textContent = ok ? '✓ matches the working' : '✗ doesn’t match the working yet';
      el.className = `chk ${ok ? 'ok' : 'no'}`;
    });
    this.root.querySelectorAll('[data-diff]').forEach(el => {
      const [a, b] = el.dataset.diff.split('|');
      const d = pct(this.nb.num(b), this.nb.num(a));
      el.textContent = d == null ? '—' : `${d > 0 ? '+' : ''}${d.toFixed(1)}%`;
    });
    this.widgets.forEach(w => w.refresh?.());
    void skip;
  }

  bind() {
    const r = this.root;
    this.ac = new AbortController();
    const opt = { signal: this.ac.signal };
    r.addEventListener('input', e => {
      const t = e.target;
      if (!t.dataset?.key || t.tagName === 'BUTTON') return;
      labStore.setNote(this.lab.id, t.dataset.key, t.value);
      r.querySelectorAll(`[data-key="${t.dataset.key}"]`).forEach(o => { if (o !== t && o.tagName !== 'BUTTON') o.value = t.value; });
      if (t.tagName === 'INPUT') {
        const bad = t.value.trim() !== '' && parseNum(t.value) == null;
        t.classList.toggle('bad', bad);
        if (bad) t.title = 'Type a plain number with a dot for decimals, e.g. 1.234 or 1234'; else t.removeAttribute('title');
      }
      this.refresh();
    }, opt);
    r.addEventListener('change', e => {
      const t = e.target;
      if (t.dataset?.unit) {
        labStore.setUnit(this.lab.id, t.dataset.unit, t.value);
        r.querySelectorAll(`select[data-unit="${t.dataset.unit}"]`).forEach(o => { o.value = t.value; });
        this.refresh();
      }
    }, opt);
    r.addEventListener('click', e => {
      const b = e.target.closest('button, a');
      if (!b) return;
      const act = b.dataset.act;
      if (act === 'theme') return labStore.toggleTheme();
      if (act === 'motion') return labStore.toggleMotion();
      if (act === 'prev' || act === 'next') {
        const g = labStore.guide(this.lab.id);
        labStore.setGuideStep(this.lab.id, Math.max(0, Math.min(this.lab.guide.length - 1, g.step + (act === 'next' ? 1 : -1))), this.lab.num);
        this.render(); window.scrollTo(0, 0);
        return;
      }
      if (act === 'clear') {
        if (confirm(`Clear everything you typed for Lab ${this.lab.num} and its guided progress?`)) { labStore.clearLab(this.lab.id); this.render(); }
        return;
      }
      if (b.dataset.jump) { e.preventDefault(); document.getElementById(b.dataset.jump)?.scrollIntoView({ behavior: labStore.motionOn() ? 'smooth' : 'auto' }); return; }
      if (b.dataset.key && b.dataset.val) {   // pass / fail
        const cur = this.nb.raw(b.dataset.key);
        const v = cur === b.dataset.val ? '' : b.dataset.val;
        labStore.setNote(this.lab.id, b.dataset.key, v);
        r.querySelectorAll(`button[data-key="${b.dataset.key}"]`).forEach(x => x.classList.toggle('on', x.dataset.val === v));
        return;
      }
      if (b.dataset.src) {
        const [id, src] = b.dataset.src.split('|');
        labStore.setCalcSrc(id, src); this.refresh();
        return;
      }
      const fig = b.closest('.fig');
      if (fig) {
        if (b.dataset.stage != null) {
          fig.dataset.stage = b.dataset.stage;
          fig.querySelectorAll('[data-stage]').forEach(x => x.classList.toggle('on', x === b));
          this.redrawFig(fig);
        } else if (b.dataset.hl) {
          const on = b.getAttribute('aria-pressed') !== 'true';
          b.setAttribute('aria-pressed', on);
          const set = new Set(fig.dataset.show.split(' ').filter(Boolean));
          on ? set.add(b.dataset.hl) : set.delete(b.dataset.hl);
          fig.dataset.show = [...set].join(' ');
        } else if (b.dataset.cur != null) {
          const on = fig.dataset.cur !== '1';
          fig.dataset.cur = on ? '1' : '';
          b.setAttribute('aria-pressed', on);
          this.redrawFig(fig);
        }
      }
    }, opt);
    if (this.view === 'guide') {
      window.addEventListener('keydown', e => {
        if (/INPUT|TEXTAREA|SELECT|BUTTON/.test(document.activeElement?.tagName)) return;
        if (e.key === 'ArrowRight') r.querySelector('[data-act="next"]')?.click();
        if (e.key === 'ArrowLeft') r.querySelector('[data-act="prev"]')?.click();
        if (e.key === 'Escape') this.nav(`#/labs/${this.lab.num}`);
      }, opt);
    }
  }
}
void esc;
