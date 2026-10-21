// rng.js - small seeded random generator, so a lab's problems come back the same after a refresh.
export function makeRng(seed) {
  let a = seed >>> 0;
  const next = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {
    next,
    int: (lo, hi) => lo + Math.floor(next() * (hi - lo + 1)), // inclusive
    pick: list => list[Math.floor(next() * list.length)],
    bool: () => next() < 0.5,
  };
}

export const newSeed = () => Math.floor(Math.random() * 2 ** 31);
