// store.js - everything this course saves, under one localStorage key (the hub reads it to show "In progress").
export const KEY = 'metrology.progress.v1';

const blank = () => ({ labs: {}, read: {} });

function load() {
  try {
    const d = JSON.parse(localStorage.getItem(KEY));
    return d && typeof d === 'object' ? { ...blank(), ...d } : blank();
  } catch { return blank(); }
}

let data = load();

function save() {
  try { localStorage.setItem(KEY, JSON.stringify(data)); } catch { /* private mode: progress lasts until the tab closes */ }
}

export const getLab = id => data.labs[id] || null;
export function putLab(state) { data.labs[state.id] = state; save(); }

export const isRead = id => !!data.read[id];
export function markRead(id) { if (!data.read[id]) { data.read[id] = true; save(); } }

export function getTheme() { try { return localStorage.getItem('metrology.theme'); } catch { return null; } }
export function setTheme(t) { try { localStorage.setItem('metrology.theme', t); } catch { /* ignore */ } }
