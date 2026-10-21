// lab.js - lab progress: which problem is open and which are solved. Pure functions, no DOM.
// Every way of moving (Next, the number buttons, a refresh) goes through goTo, and nothing here ever
// removes a problem from `solved`, so the bug where Next froze or a solved problem was forgotten can't happen.
export function createLab(id, count, seed) {
  return { id, count, seed, current: 0, solved: [], revealed: [], tries: {} };
}

// Index `count` is the summary page after the last problem.
export const goTo = (s, i) => ({ ...s, current: Math.max(0, Math.min(s.count, Number(i) || 0)) });

export const next = s => goTo(s, s.current + 1);
export const prev = s => goTo(s, s.current - 1);

const addTo = (list, i) => (list.includes(i) ? list : [...list, i].sort((a, b) => a - b));

export const solve = (s, i = s.current) => ({ ...s, solved: addTo(s.solved, i) });
export const reveal = (s, i = s.current) => ({ ...s, revealed: addTo(s.revealed, i) });
export const miss = (s, i = s.current) => ({ ...s, tries: { ...s.tries, [i]: (s.tries[i] || 0) + 1 } });

export const isSolved = (s, i = s.current) => s.solved.includes(i);
export const isRevealed = (s, i = s.current) => s.revealed.includes(i);
export const triesAt = (s, i = s.current) => s.tries[i] || 0;
export const onSummary = s => s.current >= s.count;

// First problem that still needs doing, or -1 when all are solved.
export const firstOpen = s => {
  for (let i = 0; i < s.count; i++) if (!s.solved.includes(i)) return i;
  return -1;
};

// Saved data from localStorage: keep it only if it has the right shape for this lab.
export function restore(saved, id, count) {
  if (!saved || saved.id !== id || saved.count !== count || !Number.isInteger(saved.seed)) return null;
  const ok = i => Number.isInteger(i) && i >= 0 && i < count;
  return {
    ...createLab(id, count, saved.seed),
    current: Number.isInteger(saved.current) ? Math.max(0, Math.min(count, saved.current)) : 0,
    solved: Array.isArray(saved.solved) ? saved.solved.filter(ok) : [],
    revealed: Array.isArray(saved.revealed) ? saved.revealed.filter(ok) : [],
    tries: saved.tries && typeof saved.tries === 'object' ? saved.tries : {},
  };
}
