import { describe, expect, it } from "vitest";
import {
  buildFinishOrder,
  computeStandings,
  defaultScoringPolicy,
} from "../../../src/domain/results/scoringPolicy";
import { asHorseId, asRoundId } from "../../../src/domain/shared/types";
import { buildRoundResult } from "../../factories/results";

describe("domain/results/scoringPolicy", () => {
  describe("defaultScoringPolicy", () => {
    const cases: ReadonlyArray<readonly [number, number]> = [
      [1, 10],
      [2, 7],
      [3, 5],
      [4, 3],
      [5, 2],
      [6, 1],
      [10, 1],
      [11, 0],
      [0, 0],
      [-3, 0],
    ] as const;

    it.each(cases)("rank %i awards %i points", (rank, expected) => {
      expect(defaultScoringPolicy.pointsFor(rank, 10)).toBe(expected);
    });
  });

  describe("buildFinishOrder()", () => {
    it("ranks finished horses in finishedOrder sequence", () => {
      const out = buildFinishOrder({
        finishedOrder: [asHorseId(2), asHorseId(1), asHorseId(3)],
        finishTimes: new Map([
          [asHorseId(2), 60_000],
          [asHorseId(1), 60_500],
          [asHorseId(3), 61_000],
        ]),
        progressByHorseId: new Map([
          [asHorseId(2), 1200],
          [asHorseId(1), 1200],
          [asHorseId(3), 1200],
        ]),
        distance: 1200,
        totalParticipants: 3,
      });
      expect(out.map((e) => e.rank)).toEqual([1, 2, 3]);
      expect(out.map((e) => e.horseId as unknown as number)).toEqual([2, 1, 3]);
      expect(out[0]?.points).toBe(10);
    });

    it("appends DNF horses ranked by remaining progress", () => {
      const out = buildFinishOrder({
        finishedOrder: [asHorseId(1)],
        finishTimes: new Map([[asHorseId(1), 60_000]]),
        progressByHorseId: new Map([
          [asHorseId(1), 1200],
          [asHorseId(2), 900],
          [asHorseId(3), 1100],
        ]),
        distance: 1200,
        totalParticipants: 3,
      });
      expect(out.map((e) => e.horseId as unknown as number)).toEqual([1, 3, 2]);
      const dnf = out[1];
      const dnf2 = out[2];
      expect(dnf?.finishTimeMs).toBe(Infinity);
      expect(dnf?.gapToLeaderMeters).toBe(100);
      expect(dnf2?.gapToLeaderMeters).toBe(300);
    });

    it("uses an injected scoring policy when supplied", () => {
      const policy = {
        id: "test-flat",
        pointsFor: () => 1,
      };
      const out = buildFinishOrder({
        finishedOrder: [asHorseId(1), asHorseId(2)],
        finishTimes: new Map([
          [asHorseId(1), 1000],
          [asHorseId(2), 1100],
        ]),
        progressByHorseId: new Map([
          [asHorseId(1), 1200],
          [asHorseId(2), 1200],
        ]),
        distance: 1200,
        totalParticipants: 2,
        policy,
      });
      expect(out.every((e) => e.points === 1)).toBe(true);
    });
  });

  describe("computeStandings()", () => {
    it("aggregates points, wins and average finish time", () => {
      const round1 = buildRoundResult({
        roundId: asRoundId("r1"),
        finishOrder: [
          {
            rank: 1,
            horseId: asHorseId(1),
            finishTimeMs: 60_000,
            gapToLeaderMeters: 0,
            points: 10,
          },
          {
            rank: 2,
            horseId: asHorseId(2),
            finishTimeMs: 60_500,
            gapToLeaderMeters: 0,
            points: 7,
          },
        ],
      });
      const round2 = buildRoundResult({
        roundId: asRoundId("r2"),
        finishOrder: [
          {
            rank: 1,
            horseId: asHorseId(2),
            finishTimeMs: 70_000,
            gapToLeaderMeters: 0,
            points: 10,
          },
          {
            rank: 2,
            horseId: asHorseId(1),
            finishTimeMs: 70_400,
            gapToLeaderMeters: 0,
            points: 7,
          },
        ],
      });

      const standings = computeStandings([round1, round2]);
      expect(standings).toHaveLength(2);
      expect(standings[0]?.totalPoints).toBe(17);
      expect(standings[1]?.totalPoints).toBe(17);
      const horse1 = standings.find(
        (s) => (s.horseId as unknown as number) === 1
      );
      const horse2 = standings.find(
        (s) => (s.horseId as unknown as number) === 2
      );
      expect(horse1?.wins).toBe(1);
      expect(horse2?.wins).toBe(1);
      expect(horse1?.averageTimeMs).toBe((60_000 + 70_400) / 2);
      expect(horse2?.averageTimeMs).toBe((60_500 + 70_000) / 2);
      expect(standings[0]?.horseId as unknown as number).toBe(1);
    });

    it("returns an empty array when there are no rounds", () => {
      expect(computeStandings([])).toEqual([]);
    });

    it("sorts primarily by total points (descending)", () => {
      const round = buildRoundResult({
        finishOrder: [
          {
            rank: 1,
            horseId: asHorseId(1),
            finishTimeMs: 60_000,
            gapToLeaderMeters: 0,
            points: 10,
          },
          {
            rank: 2,
            horseId: asHorseId(2),
            finishTimeMs: 60_500,
            gapToLeaderMeters: 0,
            points: 7,
          },
          {
            rank: 3,
            horseId: asHorseId(3),
            finishTimeMs: 61_000,
            gapToLeaderMeters: 0,
            points: 5,
          },
        ],
      });
      const standings = computeStandings([round]);
      expect(standings.map((s) => s.totalPoints)).toEqual([10, 7, 5]);
    });
  });
});
