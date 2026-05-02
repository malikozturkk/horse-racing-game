import type { Horse, HorseIdentity, HorseVisual } from "./types";
import {
  HORSE_NAMES,
  HORSE_COLORINGS,
  SILK_COLORS,
  SILK_ACCENT_COLORS,
  BARN_SIZE,
  RACE_SIZE,
} from "./constants";

const rand = Math.random;

const clamp = (n: number, min: number, max: number) =>
  Math.min(Math.max(n, min), max);

const randInt = (min: number, max: number) =>
  Math.floor(rand() * (max - min + 1)) + min;

function buildVisual(index: number): HorseVisual {
  return {
    coloring: HORSE_COLORINGS[index % HORSE_COLORINGS.length],
    silkColor: SILK_COLORS[index % SILK_COLORS.length],
    silkAccentColor: SILK_ACCENT_COLORS[index % SILK_ACCENT_COLORS.length],
    silkPatternIndex: index % 5,
  };
}

function buildIdentity(index: number): HorseIdentity {
  return Object.freeze({
    id: index + 1,
    name: HORSE_NAMES[index % HORSE_NAMES.length],
    visual: Object.freeze(buildVisual(index)),
  });
}

export function initialCondition(): number {
  return randInt(60, 100);
}

export function tickCondition(current: number, decayAmount: number): number {
  return clamp(current - decayAmount, 0, 100);
}

export function createBarn(): Horse[] {
  return Array.from(
    { length: BARN_SIZE },
    (_, i): Horse => ({
      ...buildIdentity(i),
      condition: initialCondition(),
    })
  );
}

export function shuffle<T>(arr: readonly T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = randInt(0, i);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function pickRaceEntrants(
  barn: readonly Horse[],
  count: number = RACE_SIZE
): Horse[] {
  if (count >= barn.length) return shuffle(barn);
  return shuffle(barn).slice(0, count);
}
