import type { HorseId, RoundId } from "../shared/types";

export type RaceStatus =
  | "idle"
  | "arming"
  | "running"
  | "paused"
  | "finishing"
  | "completed";

export interface ParticipantRuntime {
  readonly horseId: HorseId;
  readonly lane: number;
  readonly conditionAtStart: number;
  readonly conditionCurrent: number;
  readonly decayPerMeter: number;
  readonly progressMeters: number;
  readonly speedMps: number;
  readonly finishedAt: number | null;
  readonly finishRank: number | null;
}

export interface RaceRuntime {
  readonly roundId: RoundId;
  readonly distance: number;
  readonly startedAt: number;
  readonly elapsedMs: number;
  readonly participants: readonly ParticipantRuntime[];
  readonly finishedOrder: readonly HorseId[];
  readonly isComplete: boolean;
}

export interface RaceTickInput {
  readonly runtime: RaceRuntime;
  readonly deltaMs: number;
}
