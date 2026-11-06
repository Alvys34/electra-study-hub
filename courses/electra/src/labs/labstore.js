// labstore.js - everything the in-class labs save in this browser: theme, motion, the student's own
// readings and answers (the "notebook"), and where they are in each guided lab.
// Nothing here is ever filled in by the app: the notebook only holds what the student typed.

const KEY = 'electra.labs.v1';

const blank = () => ({
  theme: null,          // 'light' | 'dark' | null (follow the device)
  motion: null,         // 'on' | 'off' | null (follow the device)
  notes: {},            // labId -> { fieldKey: string }
  units: {},            // labId -> { fieldKey: unit chosen in a unit picker }
  guide: {},            // labId -> { step: n, seen: [n...] }
  calcSrc: {},          // calcId -> 'meas' | 'nom'
  last: null,           // { lab, view: 'lesson' | 'guide' }
});

let state = load();
const listeners = new Set();

// Another tab saved: take its copy, so this tab's next save doesn't erase readings typed over there.
if (typeof window !== 'undefined') window.addEventListener('storage', e => {
  if (e.key !== KEY) return;
  state = load();
  emit('sync');
});

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return blank();
    const s = JSON.parse(raw);
    const b = blank();
    if (!s || typeof s !== 'object') return b;
    return {
      ...b, ...s,
      notes: obj(s.notes), units: obj(s.units), guide: obj(s.guide), calcSrc: obj(s.calcSrc),
    };
  } catch {
    return blank();
  }
}
function obj(v) { return v && typeof v === 'object' && !Array.isArray(v) ? v : {}; }

function save() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* storage unavailable: keep working in memory */ }
}
function emit(what) { listeners.forEach(fn => fn(what)); }

const sysDark = () => !!window.matchMedia?.('(prefers-color-scheme: dark)').matches;
const sysCalm = () => !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

export const labStore = {
  on(fn) { listeners.add(fn); return () => listeners.delete(fn); },

  theme() { return state.theme || (sysDark() ? 'dark' : 'light'); },
  toggleTheme() { state.theme = this.theme() === 'dark' ? 'light' : 'dark'; save(); emit('theme'); },
  motionOn() { return state.motion ? state.motion === 'on' : !sysCalm(); },
  toggleMotion() { state.motion = this.motionOn() ? 'off' : 'on'; save(); emit('motion'); },

  note(lab, key) { return state.notes[lab]?.[key] ?? ''; },
  setNote(lab, key, val) {
    state.notes[lab] ||= {};
    if (val === '' || val == null) delete state.notes[lab][key];
    else state.notes[lab][key] = String(val);
    save(); emit('note');
  },
  notesFor(lab) { return state.notes[lab] || {}; },
  clearLab(lab) {
    delete state.notes[lab]; delete state.units[lab]; delete state.guide[lab];
    if (state.last && (state.last.lab === lab || `lab${state.last.lab}` === lab)) state.last = null;
    save(); emit('note');
  },

  unit(lab, key, fallback) { return state.units[lab]?.[key] || fallback; },
  setUnit(lab, key, u) { state.units[lab] ||= {}; state.units[lab][key] = u; save(); emit('note'); },

  guide(lab) { return state.guide[lab] || { step: 0, seen: [] }; },
  /** `num` is the lab number (6-9) that "Continue Lab N" links to; `lab` is the lab id the steps are saved under. */
  setGuideStep(lab, step, num) {
    const g = state.guide[lab] || { step: 0, seen: [] };
    g.step = step;
    if (!g.seen.includes(step)) g.seen.push(step);
    state.guide[lab] = g;
    state.last = { lab: num ?? lab, view: 'guide' };
    save();
  },

  calcSrc(id, def = 'meas') { return state.calcSrc[id] || def; },
  setCalcSrc(id, src) { state.calcSrc[id] = src; save(); emit('note'); },

  // older saves kept the guided lab as its id ('lab6'); links need the number
  last() {
    const l = state.last;
    return l && typeof l.lab === 'string' && /^lab\d+$/.test(l.lab) ? { ...l, lab: Number(l.lab.slice(3)) } : l;
  },
  setLast(lab, view) { state.last = { lab, view }; save(); },
};
