import type {
  Round,
  RoundIndex,
  RoundStatus,
} from "../../src/domain/schedule/types";
import { asHorseId, asRoundId } from "../../src/domain/shared/types";
import {
  HORSES_PER_ROUND,
  ROUND_NAMES,
  SCHEDULE_DISTANCES,
  TOTAL_ROUNDS,
} from "../../src/domain/schedule/constants";

export const buildRound = (overrides: Partial<Round> = {}): Round => {
  const index = (overrides.index ?? 0) as RoundIndex;
  return {
    id: overrides.id ?? asRoundId(`test-round:${index}`),
    index,
    name: overrides.name ?? ROUND_NAMES[index],
    distanceMeters: overrides.distanceMeters ?? SCHEDULE_DISTANCES[index],
    lineup:
      overrides.lineup ??
      Array.from({ length: HORSES_PER_ROUND }, (_, i) => asHorseId(i + 1)),
    status: (overrides.status ?? "pending") as RoundStatus,
  };
};

export const buildRoundSet = (seasonId: string = "test-season"): Round[] =>
  Array.from({ length: TOTAL_ROUNDS }, (_, i): Round =>
    buildRound({
      index: i as RoundIndex,
      id: asRoundId(`${seasonId}:r${i + 1}`),
    })
  );
