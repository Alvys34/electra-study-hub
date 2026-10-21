// store.js - progress, XP, streaks and the "review later" queue (saved in this browser)

const KEY = 'electra.progress.v2';

const blank = () => ({
  xp: 0,
  streak: { count: 0, last: null },     // last = 'YYYY-MM-DD'
  learn: {},                             // unitId -> { seen: n, total: n, done: bool }
  practice: {},                          // unitId -> { tries, right, firstTry }
  missed: [],                            // [{ unit, gen, at }] generator keys to resurface
  sound: true,
  lastUnit: null,
  sprintMins: 12,
  game: { stars: {}, codex: [], seenIntro: false },
});

let state = load();
const listeners = new Set();

function load() {
  let raw = null;
  try {
    raw = localStorage.getItem(KEY);
    if (raw) return normalize(JSON.parse(raw));
  } catch (e) {
    // keep unreadable progress recoverable before the next save overwrites it
    try { if (raw) localStorage.setItem(KEY + '.bak', raw); } catch { /* storage unavailable */ }
  }
  return blank();
}

function isObj(v) { return !!v && typeof v === 'object' && !Array.isArray(v); }

function normalize(saved) {
  const b = blank();
  if (!isObj(saved)) return b;
  const st = { ...b, ...saved };
  st.xp = Number.isFinite(st.xp) ? st.xp : 0;
  st.streak = { ...b.streak, ...(isObj(saved.streak) ? saved.streak : {}) };
  st.learn = isObj(saved.learn) ? saved.learn : {};
  st.practice = isObj(saved.practice) ? saved.practice : {};
  st.missed = Array.isArray(saved.missed) ? saved.missed : [];
  const g = isObj(saved.game) ? saved.game : {};
  st.game = { ...b.game, ...g, stars: isObj(g.stars) ? g.stars : {}, codex: Array.isArray(g.codex) ? g.codex : [] };
  return st;
}

function save() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* ignore */ }
  listeners.forEach(fn => fn(state));
}

export const store = {
  get: () => state,
  on(fn) { listeners.add(fn); return () => listeners.delete(fn); },

  addXP(n) {
    state.xp += n;
    touchStreak();
    save();
  },

  level() { return levelFor(state.xp); },

  setLearn(unit, seen, total) {
    const cur = state.learn[unit] || { seen: 0, total, done: false };
    cur.seen = Math.max(cur.seen, seen);
    cur.total = total;
    if (seen >= total) cur.done = true;
    state.learn[unit] = cur;
    state.lastUnit = unit;
    save();
  },

  recordAnswer(unit, gen, correct, firstTry) {
    const p = state.practice[unit] || { tries: 0, right: 0, firstTry: 0 };
    p.tries++;
    if (correct) p.right++;
    if (correct && firstTry) p.firstTry++;
    state.practice[unit] = p;
    state.lastUnit = unit;
    if (!correct || !firstTry) {
      if (!state.missed.some(m => m.unit === unit && m.gen === gen)) {
        state.missed.push({ unit, gen, at: Date.now() });
        if (state.missed.length > 40) state.missed.shift();
      }
    }
    save();
  },

  clearMissed(unit, gen) {
    state.missed = state.missed.filter(m => !(m.unit === unit && m.gen === gen));
    save();
  },

  stars(unit) {
    const p = state.practice[unit];
    if (!p) return 0;
    if (p.firstTry >= 20 && p.right / p.tries >= 0.8) return 3;
    if (p.firstTry >= 10) return 2;
    if (p.firstTry >= 4) return 1;
    return 0;
  },

  levelStars(id) { return state.game?.stars?.[id] || 0; },
  setLevelStars(id, n) {
    state.game ||= { stars: {}, codex: [] };
    state.game.stars[id] = Math.max(state.game.stars[id] || 0, n);
    if (!state.game.codex.includes(id)) state.game.codex.push(id);
    save();
  },
  markIntroSeen() { state.game ||= { stars: {}, codex: [] }; state.game.seenIntro = true; save(); },

  toggleSound() { state.sound = !state.sound; save(); return state.sound; },
  reset() { state = blank(); save(); },
};

function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function touchStreak() {
  const t = today();
  const s = state.streak;
  if (s.last === t) return;
  const y = new Date(); y.setDate(y.getDate() - 1);
  const yest = `${y.getFullYear()}-${String(y.getMonth() + 1).padStart(2, '0')}-${String(y.getDate()).padStart(2, '0')}`;
  s.count = s.last === yest ? s.count + 1 : 1;
  s.last = t;
}

export function levelFor(xp) {
  // each level needs a bit more: 100, 150, 200, ...
  let lvl = 1, need = 100, rest = xp;
  while (rest >= need) { rest -= need; lvl++; need += 50; }
  return { level: lvl, into: rest, need };
}

export const LEVEL_NAMES = ['Spark', 'Electron', 'Conductor', 'Resistor Wrangler', 'Ohm Whisperer', 'Circuit Ninja',
  'Kirchhoff Kid', 'Voltage Viking', 'Power Wizard', 'Grand Electrician'];
export const levelName = l => LEVEL_NAMES[Math.min(l - 1, LEVEL_NAMES.length - 1)];
