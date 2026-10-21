// Buddy.js - Clippy-style cartoon supporter ("Your Fans"): You + Ollie (Yorkshire) & Ruby (Cavalier King Charles) cheering on your partner ("Amo" / "Amore")!
// Uses the 6-frame custom sprite sheet (/buddy-sprites.png) with Italian expressions ("Amo", "Amore", "Andiamo!", "Porco dio!").

import { sfx } from '../core/fx.js';
import { LESSONS_V2 } from '../lesson/LessonPage.js';

const LOVE_NOTES = [
  "Amo, you can do it!! You're smart as hell and me, <b>Ollie</b>, and <b>Ruby</b> are so proud of how hard you're working 🐾💖",
  "Dai Amore, look at you mastering circuits! One step at a time—your brain is built for this. Andiamo!! ⚡🐶",
  "Sending you the biggest kiss and a giant group hug from me, <b>Ollie</b>, and <b>Ruby</b> right now, Amo!! 🤗🐾💖",
  "Hey Amo! If a formula feels tricky, click any yellow highlighted word or hit <b>💡 Hint</b> below. Me, Ruby &amp; Ollie have your back! 🤗🐾",
  "Amore mio, remember to unclench your jaw, drop your shoulders, and take a sip of water. Oh, you can do it, Amo! 💧💛",
  "<b>Ruby</b> and <b>Ollie</b> are literally wagging their tails for you right now, Amo! Every problem you try wires the concept deeper in 🐶💖",
  "Squeezing you tight, Amore!! Take a deep breath—you can do it, and me, <b>Ruby</b> &amp; <b>Ollie</b> adore you so much 🥰🐶💕",
  "10/10 partner, 10/10 future engineer. Forza Amo, you can do it—me, Ollie, and Ruby are cheering from the corner! 🎉🐾",
  "Emergency cuddle &amp; puppy kisses from <b>Ollie</b> and <b>Ruby</b> deployed for Amo!! You're our favourite human and you're doing SO well today 💛🫂🐾",
  "Need a 2-minute breather, Amore? Stretch your arms up and give <b>Ruby</b> and <b>Ollie</b> a belly rub! We'll hold your spot right here ☕✨",
  "Seeing you figure this stuff out is my favourite thing, Amo. Andiamo, let's crush this next part together! 💪❤️",
];

const UNIT_TIPS = {
  unit1a: "Amo, quick Unit 1A tip: Engineering notation always uses powers of 10 in multiples of 3 (10³, 10⁶, 10⁻³, 10⁻⁶)—each step is 1,000×! Andiamo! 💡",
  unit1b: "Amore, Unit 1B tip: For 4-band resistors, Band 1 &amp; 2 are digits, Band 3 is how many zeros to add, and Gold = ±5%! Easy points! 🌈",
  unit1c: "Amo, Unit 1C tip: Voltage is joules per coulomb (V = W/Q), and Current is coulombs per second (I = Q/t)! You got this! ⚡",
  unit2a: "Amore, Unit 2A tip: Ammeters go IN SERIES (break the loop), Voltmeters go ACROSS, and Ohmmeters need power OFF! 📟",
  unit2b: "Amo, Unit 2B tip: Cover the letter you want in the V–I–R triangle: V = I × R, I = V / R, R = V / I! 🔺",
  unit3a: "Amore, Unit 3A tip: In a SERIES loop, current I is the exact same everywhere, and voltage drops add up to V_S (KVL)! 🔗",
  unit4a: "Amo, Unit 4A tip: Power P = V × I = I²R = V²/R! And electric bills charge for ENERGY in kilowatt-hours (kWh), not watts! 💡",
  unit4b: "Amore, Unit 4B tip: Copper has 29 electrons (2·8·18·1)—that lonely 1 valence electron in shell 4 makes it a great conductor! ⚛️",
  unit5: "Amo, Unit 5 tip: In PARALLEL, voltage is the same across every branch, branch currents add up (KCL), and R_T is always smaller than the smallest branch! 🌿",
  unit6: "Amore, Unit 6 tip: For Series–Parallel, collapse parallel banks into one equivalent resistor first, find I_T, then expand back out! Andiamo! 🧩",
};

function pickRandom(arr, last) {
  if (!arr || !arr.length) return '';
  if (arr.length === 1) return arr[0];
  let item = arr[Math.floor(Math.random() * arr.length)];
  if (item === last) item = arr[(arr.indexOf(item) + 1) % arr.length];
  return item;
}

/**
 * Renders the 6-pose custom cartoon sprite sheet of You + Ollie (Yorkshire) & Ruby (Cavalier King Charles) (/buddy-sprites.png):
 * Frame 0 (0%):   happy  (Row 1, Col 1 - Warm smile with Ollie & Ruby)
 * Frame 1 (20%):  cheer / proud (Row 1, Col 2 - Fist pump "Andiamo!", Ollie & Ruby paws up)
 * Frame 2 (40%):  love   (Row 1, Col 3 - Hand heart "Forza Amo!", floating hearts)
 * Frame 3 (60%):  think  (Row 2, Col 1 - Pointing to temple with lightbulb, Ollie & Ruby head-tilt)
 * Frame 4 (80%):  oops   (Row 2, Col 2 - Italian pinched fingers "Porco dio!", Ollie facepalm, Ruby gasp)
 * Frame 5 (100%): shock  (Row 2, Col 3 - Short-circuit static hair & sparks!)
 */
function renderAvatarSprite() {
  return `<div class="bdy-sprite" role="img" aria-label="You, Ollie, and Ruby cheering on Amo"></div>`;
}

const MOOD_BADGES = {
  happy: '🐾',
  love: '🥰',
  cheer: '🎉',
  proud: '🏆',
  think: '💡',
  oops: '🙊',
  shock: '⚡',
};

const MIN_KEY = 'electra.buddy.min';
const HIDE_KEY = 'electra.buddy.hidden';
function readMin() {
  try { return localStorage.getItem(MIN_KEY) === '1'; } catch { return false; }
}
function writeMin(v) {
  try { localStorage.setItem(MIN_KEY, v ? '1' : '0'); } catch { /* storage unavailable */ }
}

class StudyBuddy {
  constructor() {
    this.el = null;
    this.min = readMin();
    this.hidden = (() => { try { return localStorage.getItem(HIDE_KEY) === '1'; } catch { return false; } })();
    if (this.hidden) this.min = true;
    this.lastMsg = '';
    this.mood = 'happy';
    this.foldT = 0;
    this.hover = false;
  }

  init() {
    if (this.el) return;
    const wrap = document.createElement('aside');
    wrap.className = `bdy ${this.min ? 'is-min' : ''} ${this.hidden ? 'is-hidden' : ''}`;
    wrap.dataset.mood = 'happy';
    wrap.setAttribute('aria-label', 'Your Fans Companion');
    wrap.innerHTML = `
      <div class="bdy-card" id="bdyCard">
        <div class="bdy-head">
          <span class="bdy-tag"><i id="bdyBadge">🐾</i> Me, Ollie &amp; Ruby</span>
          <button type="button" class="bdy-min-btn" id="bdyMin" title="Minimize bubble" aria-label="Minimize Your Fans">–</button>
        </div>
        <div class="bdy-msg" id="bdyMsg">Ciao <b>Amo</b>!! Ready to crush some circuits? Oh, you can do it—me, <b>Ollie</b>, and <b>Ruby</b> are right here cheering for you! Tap our portrait anytime for a love note! 🐾💖</div>
        <div class="bdy-actions">
          <button type="button" class="bdy-act bdy-hint-btn" data-act="tip">💡 Hint</button>
        </div>
      </div>
      <div class="bdy-dock" id="bdyDock">
        <button type="button" class="bdy-avatar" id="bdyAvatar" title="Click to open or get another love note, Amo! 🐾💖">
          <div class="bdy-fx" id="bdyFx"></div>
          ${renderAvatarSprite()}
          <span class="bdy-pill-badge" id="bdyCornerBadge">🐾</span>
        </button>
        <div class="bdy-caprow">
          <button type="button" class="bdy-caption" id="bdyCaption" title="Click to open or get a love note from Me, Ollie &amp; Ruby!">🐾 Your fans</button>
          <button type="button" class="bdy-hide-btn" id="bdyHide" title="${this.hidden ? 'Show' : 'Hide'} your fans" aria-label="${this.hidden ? 'Show' : 'Hide'} your fans">${this.hidden ? '+' : '–'}</button>
        </div>
      </div>
    `;
    document.body.appendChild(wrap);
    this.el = wrap;

    wrap.querySelector('#bdyMin').onclick = e => {
      e.stopPropagation();
      this.setMin(true);
    };
    const card = wrap.querySelector('#bdyCard');
    card.addEventListener('mouseenter', () => { this.hover = true; clearTimeout(this.foldT); });
    card.addEventListener('mouseleave', () => { this.hover = false; this.scheduleFold(2500); });
    this.scheduleFold();

    wrap.querySelector('#bdyHide').onclick = e => {
      e.stopPropagation();
      this.setHidden(!this.hidden);
    };

    const onPortraitClick = e => {
      e.stopPropagation();
      if (this.hidden) {
        this.setHidden(false);
      } else if (this.min) {
        // First click when minimized: simply open the conversation bubble
        this.setMin(false);
        this.spawnParticles(['🐾', '💖', '✨'], 4);
      } else {
        // Subsequent clicks when already open: give more love notes!
        this.pepTalk();
      }
    };
    wrap.querySelector('#bdyAvatar').onclick = onPortraitClick;
    wrap.querySelector('#bdyCaption').onclick = onPortraitClick;

    wrap.querySelectorAll('.bdy-act').forEach(btn => {
      btn.onclick = e => {
        e.stopPropagation();
        const act = btn.dataset.act;
        if (act === 'tip') this.unitTip();
      };
    });
  }

  setMin(v) {
    this.min = !!v;
    writeMin(this.min);
    this.el?.classList.toggle('is-min', this.min);
    sfx.tap?.();
    this.scheduleFold();
  }

  setHidden(v) {
    this.hidden = !!v;
    try { localStorage.setItem(HIDE_KEY, this.hidden ? '1' : '0'); } catch { /* storage unavailable */ }
    this.el?.classList.toggle('is-hidden', this.hidden);
    const btn = this.el?.querySelector('#bdyHide');
    if (btn) {
      btn.textContent = this.hidden ? '+' : '–';
      btn.title = this.hidden ? 'Show your fans' : 'Hide your fans';
      btn.setAttribute('aria-label', btn.title);
    }
    if (this.hidden) { clearTimeout(this.foldT); this.min = true; this.el?.classList.add('is-min'); }
    sfx.tap?.();
  }

  // Auto-fold is transient: it never overwrites the saved open/minimized preference.
  scheduleFold(ms) {
    clearTimeout(this.foldT);
    if (this.min || this.hover || !this.el) return;
    const len = this.el.querySelector('#bdyMsg')?.textContent.length || 0;
    this.foldT = setTimeout(() => {
      if (this.hover) return;
      this.min = true;
      this.el.classList.add('is-min');
    }, ms ?? Math.min(9000, 4000 + len * 30));
  }

  spawnParticles(emojis = ['💖', '🐾', '✨', '🥰'], count = 6) {
    if (!this.el) return;
    const fx = this.el.querySelector('#bdyFx');
    if (!fx) return;
    for (let i = 0; i < count; i++) {
      const sp = document.createElement('i');
      sp.className = 'bdy-p';
      sp.textContent = emojis[i % emojis.length];
      sp.style.setProperty('--dx', `${(Math.random() - 0.5) * 120}px`);
      sp.style.setProperty('--dy', `${-40 - Math.random() * 55}px`);
      sp.style.animationDelay = `${i * 50}ms`;
      fx.appendChild(sp);
      setTimeout(() => sp.remove(), 1150);
    }
  }

  say(text, { mood = 'happy', particles = null, particleCount = 6, autoOpen = false } = {}) {
    this.init();
    const msgEl = this.el.querySelector('#bdyMsg');
    if (msgEl) msgEl.innerHTML = text;
    if (this.hidden || (this.min && !autoOpen)) return;
    if (autoOpen && this.min) {
      this.min = false;
      this.el.classList.remove('is-min');
    }
    this.mood = mood;
    this.el.dataset.mood = mood;
    const badge = MOOD_BADGES[mood] || '🐾';
    const b1 = this.el.querySelector('#bdyBadge');
    const b2 = this.el.querySelector('#bdyCornerBadge');
    if (b1) b1.textContent = badge;
    if (b2) b2.textContent = badge;

    const card = this.el.querySelector('#bdyCard');
    if (card && !this.min) {
      card.classList.remove('bdy-pop');
      void card.offsetWidth;
      card.classList.add('bdy-pop');
    }
    const av = this.el.querySelector('#bdyAvatar');
    if (av) {
      av.classList.remove('bdy-bounce');
      void av.offsetWidth;
      av.classList.add('bdy-bounce');
    }
    if (particles) this.spawnParticles(particles, particleCount);
    if (!this.min) this.scheduleFold();
  }

  pepTalk() {
    sfx.cheer?.();
    const msg = pickRandom(LOVE_NOTES, this.lastMsg);
    this.lastMsg = msg;
    this.say(msg, { mood: 'love', particles: ['💖', '🐾', '🥰', '✨'], particleCount: 7, autoOpen: true });
  }

  unitTip() {
    sfx.tap?.();
    const hash = location.hash || '#/';
    const [, kind, arg] = hash.split('/');
    // If inside an active Practice problem with hints, surface a problem hint too!
    if (kind === 'practice' && window.__electraProblem?.hints?.length) {
      const h = window.__electraProblem.hints[0];
      this.say(`💡 <b>Hint for Amo:</b> ${h} — Me, <b>Ollie</b> &amp; <b>Ruby</b> believe in you! 🐾`, {
        mood: 'think',
        particles: ['💡', '🐾', '⚡'],
        autoOpen: true,
      });
      return;
    }
    if (UNIT_TIPS[arg]) {
      this.say(UNIT_TIPS[arg], { mood: 'think', particles: ['💡', '🐾', '⚡'], autoOpen: true });
      return;
    }
    if (kind === 'lab') {
      this.say("Amo, Free Lab tip: Click any resistor or supply on the 3D bench to open its inspector, or drag parts across the mat while the wires follow live! Andiamo! 🧰⚡", {
        mood: 'think',
        particles: ['🧰', '⚡', '🐾'],
        autoOpen: true,
      });
      return;
    }
    const keys = Object.keys(UNIT_TIPS);
    const randomTip = UNIT_TIPS[keys[Math.floor(Math.random() * keys.length)]];
    this.say(randomTip, { mood: 'think', particles: ['💡', '🐾'], autoOpen: true });
  }

  // Contextual reactions triggered automatically by app events
  onRoute(kind, arg, sub) {
    this.init();
    if (!kind || kind === 'home') {
      this.say("Bentornato <b>Amo</b>!! Oh, you can do it—pick any unit to read or jump onto the 3D bench. Me, <b>Ollie</b>, and <b>Ruby</b> are cheering for you! 🐾💖", { mood: 'happy' });
    } else if (kind === 'lesson') {
      const L = LESSONS_V2[arg];
      if (!L) return;
      if (sub === 'do') {
        this.say(`<b>Andiamo Amo!!</b> Hands-on time for <b>Unit ${L.code}: ${L.title}</b>! Wire it up on the bench—me, <b>Ruby</b>, and <b>Ollie</b> are watching! 🔧🐾`, {
          mood: 'cheer',
          particles: ['⚡', '🐾', '💛'],
        });
      } else {
        this.say(`Studying <b>Unit ${L.code}: ${L.title}</b>, Amore! Tap any <span class="kw">highlighted word</span> for a quick definition—you can do it! 📖🐶`, {
          mood: 'happy',
        });
      }
    } else if (kind === 'practice') {
      if (arg === 'blitz') {
        this.say("90-second blitz!! <b>Andiamo Amo!!</b> Deep breath, trust your instincts—<b>Ollie</b> and <b>Ruby</b> are hyped!! ⚡🔥🐾", { mood: 'cheer', particles: ['⚡', '🔥', '🐾'] });
      } else if (arg === 'review') {
        this.say("Reviewing misses is the smartest move, Amore! Oh, you can do it—even <b>Ruby</b> and <b>Ollie</b> are impressed! 🧠🐶💖", { mood: 'love' });
      } else {
        this.say("Practice round, <b>Amo</b>! Remember: prefixes like <code>4.7k</code> or <code>25m</code> work right in the box. Andiamo! 🎯🐾", { mood: 'happy' });
      }
    } else if (kind === 'lab') {
      this.say("Welcome to the 3D Free Workbench, <b>Amore</b>! Spawn parts, wire terminals, or drag components around—andiamo! 🧰⚡🐾", {
        mood: 'cheer',
        particles: ['🧰', '⚡', '🐾'],
      });
    }
  }

  onGlossaryClick(termTitle) {
    const msgs = [
      `Bravissimo <b>Amo</b>, checking <b>${termTitle}</b>! Locking down the vocab makes exam questions so much easier 📖🐾`,
      `Love how thorough you are, <b>Amore</b>! Knowing <b>${termTitle}</b> cold is free points on the test 🧠✨`,
      `Smart move looking up <b>${termTitle}</b>, Amo! Look at <b>Ollie</b> and <b>Ruby</b> tilting their heads with you 🐶💖`,
    ];
    this.say(pickRandom(msgs, this.lastMsg), { mood: 'think', particles: ['📖', '🐾', '✨'] });
  }

  onTaskDone() {
    this._lastPriorityAt = Date.now();
    const msgs = [
      "<b>ANDIAMO AMO!!</b> Look at that circuit go! <b>Ruby</b> and <b>Ollie</b> have their paws up cheering! ⚡🐾🥰",
      "Bravissimo Amore!! Objective checked off—oh, you make this look so easy! 😍🐶✨",
      "Cleanest wiring in EMNG1001, <b>Amo</b>!! Keep it rolling, me, Ollie &amp; Ruby love watching you cook! 🔧💖",
      "Spot on, Amore mio!! Look at those electrons flowing—andiamo!! ⚡🎉🐾",
    ];
    this.say(pickRandom(msgs, this.lastMsg), { mood: 'cheer', particles: ['⚡', '🐾', '💖', '✨'], particleCount: 7 });
  }

  onCorrect(tries = 1) {
    this._lastPriorityAt = Date.now();
    const firstTryMsgs = [
      "<b>ANDIAMO!!</b> Nailed it on the first try, <b>Amo</b>!! That's my brilliant man—<b>Ollie</b> and <b>Ruby</b> are doing zoomies! 🥰🎉🐾",
      "10/10 <b>Amore</b>!! Your brain is on absolute fire today! Bravissimo from me, Ruby &amp; Ollie!! 🔥💖🐶",
      "BOOM! Right in the bullseye, <b>Amo</b>! Told you that you can do it!! 🎯😍🐾",
      "Too easy for you, Amore mio!! Me, <b>Ollie</b>, and <b>Ruby</b> are beaming right now 😊💛✨",
    ];
    const retryMsgs = [
      "<b>ANDIAMO AMO!!</b> Got it!! Way to stick with it—me, <b>Ruby</b>, and <b>Ollie</b> knew you'd figure it out! 💪💖🐾",
      "YES <b>Amore</b>!! Persistence wins every single time! Belly rubs for Ollie &amp; Ruby and a big kiss for you 🎉🥰",
    ];
    const pool = tries <= 1 ? firstTryMsgs : retryMsgs;
    this.say(pickRandom(pool, this.lastMsg), { mood: 'love', particles: ['💖', '🐾', '🎉', '🥰', '✨'], particleCount: 8 });
  }

  onWrong() {
    this._lastPriorityAt = Date.now();
    const msgs = [
      "<b>Porco dio!!</b> 🤌😅 That one's sneaky! Look at <b>Ollie</b> covering his eyes and <b>Ruby</b> gasping! Don't worry <b>Amo</b>, oh you can do it—try again! 🐾❤️",
      "<b>Porco dio!!</b> 🤌 Almost had it, <b>Amore</b>! Shake it off, check the value or prefix and give it another shot—me, <b>Ruby</b> &amp; <b>Ollie</b> believe in you! 🤗🐶💛",
      "<b>Porco dio!!</b> 🤌 What a tricky trap! Zero stress <b>Amo</b>—mistakes are how your brain wires the concept in. Oh, you can do it! 🐾💖",
      "<b>Porco dio!!</b> 🤌 Don't let that trip you up, <b>Amore mio</b>! Take a peek at the formula—me, <b>Ollie</b>, and <b>Ruby</b> are right here with you! 💪🐶💕",
    ];
    const chosen = pickRandom(msgs, this.lastMsg);
    this.lastMsg = chosen;
    this.say(chosen, { mood: 'oops', particles: ['🤌', '🙊', '🐾', '💕'], particleCount: 7 });
  }

  onBenchTouch() {
    // Don't overwrite a celebration or fail reaction that just happened in the last 900ms
    if (this._lastPriorityAt && Date.now() - this._lastPriorityAt < 900) return;
    // Throttle rapid slider/drag ticks so the lightbulb animation feels crisp
    if (this._lastTouchAt && Date.now() - this._lastTouchAt < 1400 && this.mood === 'think') return;
    this._lastTouchAt = Date.now();

    const msgs = [
      "Ooooh <b>Amo</b>, tinkering on the 3D bench!! 💡 Look at <b>Ollie</b> and <b>Ruby</b> tilting their heads watching every move—let's see what happens! ⚡🐾",
      "Lightbulb moment loading for <b>Amore</b>!! 💡✨ Me, <b>Ruby</b>, and <b>Ollie</b> love watching you test components hands-on! 🔧🐶",
      "Touch everything on the bench, <b>Amo</b>! 💡 That's how real engineers figure it out—<b>Ollie</b> and <b>Ruby</b> have their eyes glued to your circuit! 🐾⚡",
      "Look at you experimenting, <b>Amore mio</b>! 💡🧠 <b>Ruby</b> and <b>Ollie</b> are locked in—watch how V and I react! ⚡🐶",
    ];
    const chosen = pickRandom(msgs, this.lastMsg);
    this.lastMsg = chosen;
    this.say(chosen, { mood: 'think', particles: ['💡', '⚡', '🐾', '✨'], particleCount: 5 });
  }

  onBenchEvent(text) {
    const raw = String(text || '').replace(/<[^>]+>/g, '');
    const lower = raw.toLowerCase();
    if (!lower) return;
    if (lower.includes('short') || lower.includes('blown') || lower.includes('blew') || lower.includes('pop') || lower.includes('overheat') || lower.includes('smoke') || lower.includes('💥')) {
      this._lastPriorityAt = Date.now();
      this.say("<b>Porco dio!!</b> ⚡😂 What a spark on the bench!! Look at <b>Ollie</b> and <b>Ruby's</b> fur standing straight up! Good thing virtual fuses are free—wire it through the load, <b>Amo</b>!", {
        mood: 'shock',
        particles: ['⚡', '💥', '🐾', '😂'],
        particleCount: 8,
      });
      return;
    }
    if (
      lower.includes('careful') ||
      lower.includes('hold on') ||
      lower.includes('wrong') ||
      lower.includes('not quite') ||
      lower.includes('hmm') ||
      lower.includes('no new wires') ||
      lower.includes('turn the supply off') ||
      lower.includes('power off') ||
      lower.includes('overload') ||
      lower.includes('never') ||
      lower.includes('⚠️') ||
      lower.includes('❌')
    ) {
      this._lastPriorityAt = Date.now();
      this.say(`<b>Porco dio!!</b> 🤌😅 Careful on the bench, <b>Amo</b>! <b>Ollie</b> is covering his eyes and <b>Ruby</b> gasped! Check the hint and try that move again—you can do it! 🐾💛`, {
        mood: 'oops',
        particles: ['🤌', '🙊', '🐾', '⚡'],
        particleCount: 7,
      });
    }
  }

  onPartComplete(label) {
    this._lastPriorityAt = Date.now();
    this.say(`🎉 <b>ANDIAMO AMO!!</b> ${label} complete!! Me, <b>Ollie</b>, and <b>Ruby</b> are throwing confetti for you, Amore!! 🐾💖✨`, {
      mood: 'cheer',
      particles: ['🎉', '🐾', '💖', '⚡', '🌟'],
      particleCount: 10,
      autoOpen: true,
    });
  }

  onUnitComplete(unitCode, unitTitle) {
    this._lastPriorityAt = Date.now();
    this.say(`🏆 <b>ANDIAMO AMO!!</b> You just finished <b>Unit ${unitCode} (${unitTitle})</b>!! Me, <b>Ollie</b>, and <b>Ruby</b> are SO proud of you, Amore mio!! 🎉🐾💖🥰`, {
      mood: 'proud',
      particles: ['🏆', '🐾', '💖', '🎉', '🥰'],
      particleCount: 12,
      autoOpen: true,
    });
  }
}

export const buddy = new StudyBuddy();
