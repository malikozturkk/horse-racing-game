import type { HorseId, RoundId } from "../shared/types";
import type { Rng } from "../shared/rng";
import type { ParticipantRuntime, RaceRuntime } from "./types";
import {
  RACE_JITTER_MPS,
  RACE_MAX_DELTA_MS,
  RACE_MOMENTUM,
  RACE_SPEED_BASE_MPS,
  RACE_SPEED_FROM_CONDITION_MPS,
  RACE_TIME_SCALE,
} from "./constants";

export interface InitRuntimeInput {
  readonly roundId: RoundId;
  readonly distance: number;
  readonly startedAt: number;
  readonly participants: readonly InitParticipantInput[];
}

export interface InitParticipantInput {
  readonly horseId: HorseId;
  readonly lane: number;
  readonly conditionAtStart: number;
}

export const initRuntime = (input: InitRuntimeInput): RaceRuntime => ({
  roundId: input.roundId,
  distance: input.distance,
  startedAt: input.startedAt,
  elapsedMs: 0,
  participants: input.participants.map(
    (p): ParticipantRuntime => ({
      horseId: p.horseId,
      lane: p.lane,
      conditionAtStart: p.conditionAtStart,
      progressMeters: 0,
      speedMps: 0,
      finishedAt: null,
      finishRank: null,
    })
  ),
  finishedOrder: [],
  isComplete: false,
});

const targetSpeed = (condition: number, rng: Rng): number => {
  const fromCond =
    (Math.max(0, Math.min(100, condition)) / 100) *
    RACE_SPEED_FROM_CONDITION_MPS;
  const jitter = rng.float(-RACE_JITTER_MPS, RACE_JITTER_MPS);
  return RACE_SPEED_BASE_MPS + fromCond + jitter;
};

export interface AdvanceDeps {
  readonly rng: Rng;
}

export const advance = (
  runtime: RaceRuntime,
  rawDeltaMs: number,
  deps: AdvanceDeps
): RaceRuntime => {
  if (runtime.isComplete) return runtime;
  if (rawDeltaMs <= 0) return runtime;

  const clampedDelta = Math.min(rawDeltaMs, RACE_MAX_DELTA_MS);
  const simDeltaMs = clampedDelta * RACE_TIME_SCALE;
  const simDeltaSec = simDeltaMs / 1000;
  const newElapsedMs = runtime.elapsedMs + simDeltaMs;

  const finishedOrder = [...runtime.finishedOrder];
  let crossedThisTick = 0;

  const nextParticipants: ParticipantRuntime[] = runtime.participants.map(
    (p): ParticipantRuntime => {
      if (p.finishedAt !== null) return p;

      const target = targetSpeed(p.conditionAtStart, deps.rng);
      const newSpeed = p.speedMps + (target - p.speedMps) * RACE_MOMENTUM;
      const newProgress = p.progressMeters + newSpeed * simDeltaSec;

      if (newProgress >= runtime.distance) {
        const rank = finishedOrder.length + crossedThisTick + 1;
        crossedThisTick += 1;
        finishedOrder.push(p.horseId);
        return {
          ...p,
          progressMeters: runtime.distance,
          speedMps: newSpeed,
          finishedAt: newElapsedMs,
          finishRank: rank,
        };
      }

      return {
        ...p,
        progressMeters: newProgress,
        speedMps: newSpeed,
      };
    }
  );

  const isComplete = nextParticipants.every((p) => p.finishedAt !== null);

  return {
    roundId: runtime.roundId,
    distance: runtime.distance,
    startedAt: runtime.startedAt,
    elapsedMs: newElapsedMs,
    participants: nextParticipants,
    finishedOrder,
    isComplete,
  };
};

export const computeLiveStandings = (
  runtime: RaceRuntime
): readonly ParticipantRuntime[] => {
  return [...runtime.participants].sort((a, b) => {
    if (a.finishRank !== null && b.finishRank !== null) {
      return a.finishRank - b.finishRank;
    }
    if (a.finishRank !== null) return -1;
    if (b.finishRank !== null) return 1;
    return b.progressMeters - a.progressMeters;
  });
};
