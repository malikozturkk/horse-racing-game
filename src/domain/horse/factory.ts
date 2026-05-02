import { asHorseId } from "../shared/types";
import type { Rng } from "../shared/rng";
import { defaultRng } from "../shared/rng";
import type { Horse, HorseIdentity, HorseVisual } from "./types";
import { clampCondition, MAX_CONDITION, MIN_CONDITION } from "./types";
import {
  HORSE_NAMES,
  HORSE_COLORINGS,
  SILK_COLORS,
  SILK_ACCENT_COLORS,
  BARN_SIZE,
  RACE_SIZE,
} from "./constants";

const buildVisual = (index: number): HorseVisual => {
  const coloring = HORSE_COLORINGS[index % HORSE_COLORINGS.length];
  if (!coloring) {
    throw new Error(`HORSE_COLORINGS missing entry at ${index}`);
  }
  return {
    coloring,
    silkColor: SILK_COLORS[index % SILK_COLORS.length] ?? "#FFFFFF",
    silkAccentColor:
      SILK_ACCENT_COLORS[index % SILK_ACCENT_COLORS.length] ?? "#000000",
    silkPatternIndex: index % 5,
  };
};

const buildIdentity = (index: number): HorseIdentity =>
  Object.freeze({
    id: asHorseId(index + 1),
    name: HORSE_NAMES[index % HORSE_NAMES.length] ?? `Horse ${index + 1}`,
    visual: Object.freeze(buildVisual(index)),
  });

export const initialCondition = (rng: Rng): number =>
  clampCondition(rng.int(MIN_CONDITION, MAX_CONDITION));

export interface CreateBarnOptions {
  readonly size?: number;
  readonly rng?: Rng;
}

export const createBarn = (options: CreateBarnOptions = {}): Horse[] => {
  const rng = options.rng ?? defaultRng();
  const size = options.size ?? BARN_SIZE;
  return Array.from(
    { length: size },
    (_, i): Horse => ({
      ...buildIdentity(i),
      condition: initialCondition(rng),
    })
  );
};

export const pickRaceEntrants = (
  barn: readonly Horse[],
  count: number = RACE_SIZE,
  rng: Rng = defaultRng()
): Horse[] => {
  if (count >= barn.length) return rng.shuffle(barn);
  return rng.shuffle(barn).slice(0, count);
};

export const tickCondition = (current: number, decayAmount: number): number =>
  clampCondition(current - decayAmount);

export { shuffleHorses };

const shuffleHorses = <T>(items: readonly T[], rng: Rng = defaultRng()): T[] =>
  rng.shuffle(items);
