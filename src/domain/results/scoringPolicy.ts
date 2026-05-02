import type { FinishEntry, RoundResult, Standing } from "./types";
import type { HorseId } from "../shared/types";

export interface ScoringPolicy {
  readonly id: string;
  pointsFor(rank: number, totalParticipants: number): number;
}

const POINTS_TABLE: readonly number[] = [10, 7, 5, 3, 2, 1, 1, 1, 1, 1];

export const defaultScoringPolicy: ScoringPolicy = {
  id: "podium-default-v1",
  pointsFor(rank: number): number {
    if (rank < 1) return 0;
    if (rank > POINTS_TABLE.length) return 0;
    return POINTS_TABLE[rank - 1] ?? 0;
  },
};

export const computeStandings = (
  rounds: readonly RoundResult[]
): readonly Standing[] => {
  const acc = new Map<
    HorseId,
    { points: number; wins: number; races: number; totalTime: number }
  >();

  for (const round of rounds) {
    for (const entry of round.finishOrder) {
      const prev = acc.get(entry.horseId) ?? {
        points: 0,
        wins: 0,
        races: 0,
        totalTime: 0,
      };
      acc.set(entry.horseId, {
        points: prev.points + entry.points,
        wins: prev.wins + (entry.rank === 1 ? 1 : 0),
        races: prev.races + 1,
        totalTime: prev.totalTime + entry.finishTimeMs,
      });
    }
  }

  const out: Standing[] = [];
  for (const [horseId, agg] of acc) {
    out.push({
      horseId,
      totalPoints: agg.points,
      wins: agg.wins,
      races: agg.races,
      averageTimeMs: agg.races > 0 ? agg.totalTime / agg.races : 0,
    });
  }

  out.sort((a, b) => {
    if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
    if (b.wins !== a.wins) return b.wins - a.wins;
    return a.averageTimeMs - b.averageTimeMs;
  });

  return out;
};

export interface BuildFinishOrderInput {
  readonly finishedOrder: readonly HorseId[];
  readonly finishTimes: ReadonlyMap<HorseId, number>;
  readonly progressByHorseId: ReadonlyMap<HorseId, number>;
  readonly distance: number;
  readonly totalParticipants: number;
  readonly policy?: ScoringPolicy;
}

export const buildFinishOrder = (
  input: BuildFinishOrderInput
): readonly FinishEntry[] => {
  const policy = input.policy ?? defaultScoringPolicy;
  const finishedSet = new Set<HorseId>(input.finishedOrder);

  const entries: FinishEntry[] = input.finishedOrder.map((horseId, idx) => {
    const rank = idx + 1;
    const finishTimeMs = input.finishTimes.get(horseId) ?? Infinity;
    return {
      rank,
      horseId,
      finishTimeMs,
      gapToLeaderMeters: 0,
      points: policy.pointsFor(rank, input.totalParticipants),
    };
  });

  const dnfIds = [...input.progressByHorseId.entries()]
    .filter(([id]) => !finishedSet.has(id))
    .sort((a, b) => b[1] - a[1])
    .map(([id]) => id);

  for (const horseId of dnfIds) {
    const rank = entries.length + 1;
    const progress = input.progressByHorseId.get(horseId) ?? 0;
    entries.push({
      rank,
      horseId,
      finishTimeMs: Infinity,
      gapToLeaderMeters: Math.max(0, input.distance - progress),
      points: policy.pointsFor(rank, input.totalParticipants),
    });
  }

  return entries;
};
