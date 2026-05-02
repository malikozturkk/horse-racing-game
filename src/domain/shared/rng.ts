export interface Rng {
  next(): number;
  int(min: number, max: number): number;
  float(min: number, max: number): number;
  pick<T>(items: readonly T[]): T;
  shuffle<T>(items: readonly T[]): T[];
}

const buildRng = (next: () => number): Rng => ({
  next,
  int(min, max) {
    if (max < min) throw new RangeError("rng.int: max < min");
    return Math.floor(next() * (max - min + 1)) + min;
  },
  float(min, max) {
    return next() * (max - min) + min;
  },
  pick<T>(items: readonly T[]): T {
    if (items.length === 0) throw new RangeError("rng.pick: empty");
    return items[Math.floor(next() * items.length)] as T;
  },
  shuffle<T>(items: readonly T[]): T[] {
    const out = [...items];
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(next() * (i + 1));
      const tmp = out[i] as T;
      out[i] = out[j] as T;
      out[j] = tmp;
    }
    return out;
  },
});

export const defaultRng = (): Rng => buildRng(Math.random);

export const seededRng = (seed: number): Rng => {
  let state = seed >>> 0;
  return buildRng(() => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  });
};
