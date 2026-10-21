// fx.js - little rewards: sounds, confetti, XP pops, toasts, and small/big celebrations
import confetti from 'canvas-confetti';
import { store, levelFor, levelName } from './store.js';

let ctx = null;
function audio() {
  if (!ctx) {
    try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { ctx = null; }
  }
  if (ctx && ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }
  return ctx;
}

function tone(freq, dur = 0.09, type = 'sine', when = 0, vol = 0.08) {
  if (!store.get().sound) return;
  const a = audio(); if (!a) return;
  const o = a.createOscillator(); const g = a.createGain();
  o.type = type; o.frequency.value = freq;
  const t = a.currentTime + when;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(a.destination);
  o.start(t); o.stop(t + dur + 0.02);
}

export const sfx = {
  tap: () => tone(660, 0.05, 'triangle', 0, 0.045),
  good: () => {
    tone(587.33, 0.09, 'triangle', 0, 0.075);
    tone(880, 0.14, 'triangle', 0.065, 0.085);
  },
  // Cheerful 4-note major sparkle chime for right answers
  cheer: () => {
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5 E5 G5 C6
    notes.forEach((f, i) => {
      tone(f, 0.14 + i * 0.03, 'triangle', i * 0.055, 0.085);
      tone(f * 2, 0.09, 'sine', i * 0.055 + 0.01, 0.03);
    });
  },
  // Bigger triumphant fanfare when a part / unit / round is completed
  fanfare: () => {
    const melody = [
      { f: 523.25, t: 0.00, d: 0.11 }, // C5
      { f: 659.25, t: 0.09, d: 0.11 }, // E5
      { f: 783.99, t: 0.18, d: 0.11 }, // G5
      { f: 1046.5, t: 0.27, d: 0.20 }, // C6
      { f: 783.99, t: 0.43, d: 0.10 }, // G5
      { f: 1046.5, t: 0.53, d: 0.38 }, // C6
      { f: 1318.5, t: 0.53, d: 0.38 }, // E6 harmony
    ];
    melody.forEach(n => {
      tone(n.f, n.d, 'triangle', n.t, 0.09);
      tone(n.f * 0.5, n.d, 'sine', n.t, 0.045);
    });
  },
  combo: n => {
    const base = 520 + Math.min(n, 10) * 40;
    tone(base, 0.07, 'triangle', 0, 0.08);
    tone(base * 1.25, 0.09, 'triangle', 0.055, 0.085);
    tone(base * 1.5, 0.12, 'triangle', 0.11, 0.09);
    tone(base * 2, 0.16, 'triangle', 0.165, 0.095);
  },
  bad: () => {
    tone(220, 0.14, 'sawtooth', 0, 0.045);
    tone(180, 0.16, 'sawtooth', 0.08, 0.04);
  },
  level: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.16, 'triangle', i * 0.09, 0.08)),
  zap: () => {
    tone(1200, 0.04, 'square', 0, 0.03);
    tone(400, 0.08, 'square', 0.03, 0.03);
  },
};

export function burst(opts = {}) {
  confetti({
    particleCount: opts.big ? 160 : 65,
    spread: opts.big ? 105 : 68,
    origin: { x: opts.x ?? 0.5, y: opts.y ?? 0.65 },
    colors: ['#38bdf8', '#facc15', '#34d399', '#f472b6', '#a78bfa'],
    disableForReducedMotion: true,
  });
}

/**
 * Little celebration on every right answer:
 * Plays the bright 4-note cheer chime + fires a crisp directional confetti & star burst from the answer element.
 */
export function celebrateSmall(anchorEl) {
  sfx.cheer();
  let x = 0.5, y = 0.68;
  if (anchorEl?.getBoundingClientRect) {
    const r = anchorEl.getBoundingClientRect();
    if (r.width > 0 || r.height > 0) {
      x = Math.max(0.1, Math.min(0.9, (r.left + r.width / 2) / window.innerWidth));
      y = Math.max(0.15, Math.min(0.88, (r.top + r.height / 2) / window.innerHeight));
    }
  }
  confetti({
    particleCount: 55,
    spread: 68,
    startVelocity: 32,
    origin: { x, y },
    colors: ['#facc15', '#34d399', '#38bdf8', '#f472b6', '#a78bfa'],
    disableForReducedMotion: true,
  });
  setTimeout(() => {
    confetti({
      particleCount: 22,
      spread: 90,
      startVelocity: 24,
      scalar: 1.15,
      shapes: ['star'],
      origin: { x, y },
      colors: ['#fde047', '#f472b6', '#4ade80'],
      disableForReducedMotion: true,
    });
  }, 110);
}

/**
 * Bigger multi-wave celebration when a Part / Step / Unit is completed:
 * Plays the triumphant fanfare + fires dual side-cannons and a center star shower!
 */
export function celebrateBig() {
  sfx.fanfare();
  // Left cannon
  confetti({
    particleCount: 80,
    angle: 60,
    spread: 65,
    startVelocity: 48,
    origin: { x: 0.06, y: 0.68 },
    colors: ['#facc15', '#34d399', '#38bdf8', '#f472b6', '#a78bfa'],
    disableForReducedMotion: true,
  });
  // Right cannon
  confetti({
    particleCount: 80,
    angle: 120,
    spread: 65,
    startVelocity: 48,
    origin: { x: 0.94, y: 0.68 },
    colors: ['#facc15', '#34d399', '#38bdf8', '#f472b6', '#a78bfa'],
    disableForReducedMotion: true,
  });
  // Center gold/pink star burst follow-up
  setTimeout(() => {
    confetti({
      particleCount: 70,
      spread: 110,
      startVelocity: 38,
      scalar: 1.2,
      shapes: ['star', 'circle'],
      origin: { x: 0.5, y: 0.45 },
      colors: ['#fde047', '#f472b6', '#4ade80', '#38bdf8'],
      disableForReducedMotion: true,
    });
  }, 240);
}

/** Floating "+10 XP" near an element, and give the XP. Handles level-ups. */
export function giveXP(n, anchorEl) {
  const before = levelFor(store.get().xp).level;
  store.addXP(n);
  const after = levelFor(store.get().xp).level;

  const pop = document.createElement('div');
  pop.className = 'xp-pop';
  pop.textContent = `+${n} XP`;
  const r = anchorEl?.getBoundingClientRect?.();
  pop.style.left = (r ? r.left + r.width / 2 : window.innerWidth / 2) + 'px';
  pop.style.top = (r ? r.top : window.innerHeight / 2) + 'px';
  document.body.appendChild(pop);
  setTimeout(() => pop.remove(), 1100);

  if (after > before) {
    celebrateBig();
    toast(`⚡ Level ${after}: ${levelName(after)}!`, 'level');
  }
}

export function toast(msg, kind = '') {
  let host = document.getElementById('toastHost');
  if (!host) { host = document.createElement('div'); host.id = 'toastHost'; document.body.appendChild(host); }
  const t = document.createElement('div');
  t.className = `toast ${kind}`;
  t.innerHTML = msg;
  host.appendChild(t);
  setTimeout(() => t.classList.add('out'), 2600);
  setTimeout(() => t.remove(), 3100);
}

export const h = (html) => {
  const t = document.createElement('template');
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
};
