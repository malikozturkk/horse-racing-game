import type { HorseId, RoundId } from "../shared/types";
import type { RoundIndex } from "../schedule/types";

export interface FinishEntry {
  readonly rank: number;
  readonly horseId: HorseId;
  readonly finishTimeMs: number;
  readonly gapToLeaderMeters: number;
  readonly points: number;
}

export interface RoundResult {
  readonly roundId: RoundId;
  readonly roundIndex: RoundIndex;
  readonly distance: number;
  readonly completedAt: number;
  readonly finishOrder: readonly FinishEntry[];
}

export interface Standing {
  readonly horseId: HorseId;
  readonly totalPoints: number;
  readonly wins: number;
  readonly races: number;
  readonly averageTimeMs: number;
}
