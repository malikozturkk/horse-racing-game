import { asRoundId } from "../../src/domain/shared/types";
import type {
  ParticipantRuntime,
  RaceRuntime,
} from "../../src/domain/race/types";
import { asHorseId } from "../../src/domain/shared/types";

export const buildParticipantRuntime = (
  overrides: Partial<ParticipantRuntime> = {}
): ParticipantRuntime => ({
  horseId: overrides.horseId ?? asHorseId(1),
  lane: overrides.lane ?? 0,
  conditionAtStart: overrides.conditionAtStart ?? 80,
  conditionCurrent: overrides.conditionCurrent ?? 80,
  decayPerMeter: overrides.decayPerMeter ?? 0.01,
  progressMeters: overrides.progressMeters ?? 0,
  speedMps: overrides.speedMps ?? 0,
  finishedAt: overrides.finishedAt ?? null,
  finishRank: overrides.finishRank ?? null,
});

export const buildRaceRuntime = (
  overrides: Partial<RaceRuntime> = {}
): RaceRuntime => ({
  roundId: overrides.roundId ?? asRoundId("test-round:0"),
  distance: overrides.distance ?? 1200,
  startedAt: overrides.startedAt ?? 0,
  elapsedMs: overrides.elapsedMs ?? 0,
  participants:
    overrides.participants ??
    Array.from({ length: 3 }, (_, i) =>
      buildParticipantRuntime({ horseId: asHorseId(i + 1), lane: i })
    ),
  finishedOrder: overrides.finishedOrder ?? [],
  isComplete: overrides.isComplete ?? false,
});
