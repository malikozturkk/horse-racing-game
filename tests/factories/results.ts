import type { FinishEntry, RoundResult } from "../../src/domain/results/types";
import { asHorseId, asRoundId } from "../../src/domain/shared/types";
import type { RoundIndex } from "../../src/domain/schedule/types";

export const buildFinishEntry = (
  overrides: Partial<FinishEntry> = {}
): FinishEntry => ({
  rank: overrides.rank ?? 1,
  horseId: overrides.horseId ?? asHorseId(1),
  finishTimeMs: overrides.finishTimeMs ?? 60_000,
  gapToLeaderMeters: overrides.gapToLeaderMeters ?? 0,
  points: overrides.points ?? 10,
});

export const buildRoundResult = (
  overrides: Partial<RoundResult> = {}
): RoundResult => ({
  roundId: overrides.roundId ?? asRoundId("test-round:0"),
  roundIndex: (overrides.roundIndex ?? 0) as RoundIndex,
  distance: overrides.distance ?? 1200,
  completedAt: overrides.completedAt ?? 0,
  finishOrder:
    overrides.finishOrder ??
    Array.from({ length: 3 }, (_, i) =>
      buildFinishEntry({
        rank: i + 1,
        horseId: asHorseId(i + 1),
        finishTimeMs: 60_000 + i * 250,
        points: [10, 7, 5][i] ?? 0,
      })
    ),
});
