import type { HorseId, RoundId } from "../shared/types";

export type RoundIndex = 0 | 1 | 2 | 3 | 4 | 5;

export type RoundStatus =
  | "pending"
  | "queued"
  | "live"
  | "photoFinish"
  | "completed";

export interface Round {
  readonly id: RoundId;
  readonly index: RoundIndex;
  readonly name: string;
  readonly distanceMeters: number;
  readonly lineup: readonly HorseId[];
  status: RoundStatus;
}

export interface ScheduleGenerationMeta {
  readonly generatedAt: number;
  readonly sourceSeed: number | null;
  readonly horsesPerRound: number;
}
