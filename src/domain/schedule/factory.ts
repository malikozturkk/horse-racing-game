import { asRoundId } from "../shared/types";
import type { HorseId } from "../shared/types";
import type { Rng } from "../shared/rng";
import { defaultRng } from "../shared/rng";
import type { Round, RoundIndex, ScheduleGenerationMeta } from "./types";
import {
  HORSES_PER_ROUND,
  ROUND_INDICES,
  ROUND_NAMES,
  SCHEDULE_DISTANCES,
  TOTAL_ROUNDS,
} from "./constants";

export interface BuildScheduleInput {
  readonly horseIds: readonly HorseId[];
  readonly rng?: Rng;
  readonly horsesPerRound?: number;
  readonly seasonId: string;
  readonly seed?: number | null;
}

export interface BuildScheduleOutput {
  readonly rounds: Round[];
  readonly meta: ScheduleGenerationMeta;
}

const pickLineup = (
  pool: readonly HorseId[],
  size: number,
  rng: Rng
): HorseId[] => {
  if (pool.length < size) {
    throw new RangeError(
      `Not enough horses to fill a round: need ${size}, have ${pool.length}`
    );
  }
  return rng.shuffle(pool).slice(0, size);
};

export const buildSchedule = (
  input: BuildScheduleInput
): BuildScheduleOutput => {
  const rng = input.rng ?? defaultRng();
  const size = input.horsesPerRound ?? HORSES_PER_ROUND;

  const rounds: Round[] = ROUND_INDICES.map((index: RoundIndex): Round => {
    const lineup = pickLineup(input.horseIds, size, rng);
    return {
      id: asRoundId(`${input.seasonId}:r${index + 1}`),
      index,
      name: ROUND_NAMES[index],
      distanceMeters: SCHEDULE_DISTANCES[index],
      lineup,
      status: "pending",
    };
  });

  if (rounds.length !== TOTAL_ROUNDS) {
    throw new Error(
      `Schedule must have ${TOTAL_ROUNDS} rounds, produced ${rounds.length}`
    );
  }

  return {
    rounds,
    meta: {
      generatedAt: Date.now(),
      sourceSeed: input.seed ?? null,
      horsesPerRound: size,
    },
  };
};
