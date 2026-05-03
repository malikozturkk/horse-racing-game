import { describe, expect, it } from "vitest";
import { buildSchedule } from "../../../src/domain/schedule/factory";
import {
  HORSES_PER_ROUND,
  ROUND_NAMES,
  SCHEDULE_DISTANCES,
  TOTAL_ROUNDS,
} from "../../../src/domain/schedule/constants";
import { asHorseId } from "../../../src/domain/shared/types";
import { seededRng } from "../../../src/domain/shared/rng";

const horseIds = (count: number) =>
  Array.from({ length: count }, (_, i) => asHorseId(i + 1));

describe("domain/schedule/factory", () => {
  describe("buildSchedule()", () => {
    it("produces TOTAL_ROUNDS rounds in canonical order", () => {
      const { rounds } = buildSchedule({
        seasonId: "s-1",
        horseIds: horseIds(20),
        rng: seededRng(1),
      });
      expect(rounds).toHaveLength(TOTAL_ROUNDS);
      expect(rounds.map((r) => r.index)).toEqual([0, 1, 2, 3, 4, 5]);
      expect(rounds.map((r) => r.distanceMeters)).toEqual(
        SCHEDULE_DISTANCES as readonly number[]
      );
      expect(rounds.map((r) => r.name)).toEqual(ROUND_NAMES as readonly string[]);
    });

    it("each round has the configured number of unique horses", () => {
      const { rounds } = buildSchedule({
        seasonId: "s-1",
        horseIds: horseIds(20),
        rng: seededRng(1),
      });
      for (const round of rounds) {
        expect(round.lineup).toHaveLength(HORSES_PER_ROUND);
        const ids = new Set(round.lineup.map((id) => id as unknown as number));
        expect(ids.size).toBe(round.lineup.length);
        expect(round.status).toBe("pending");
      }
    });

    it("respects a custom horsesPerRound", () => {
      const { rounds } = buildSchedule({
        seasonId: "s-1",
        horseIds: horseIds(20),
        rng: seededRng(1),
        horsesPerRound: 5,
      });
      for (const round of rounds) {
        expect(round.lineup).toHaveLength(5);
      }
    });

    it("throws when there are not enough horses", () => {
      expect(() =>
        buildSchedule({
          seasonId: "s-1",
          horseIds: horseIds(3),
          rng: seededRng(1),
        })
      ).toThrow(RangeError);
    });

    it("creates unique round ids prefixed with the season id", () => {
      const { rounds } = buildSchedule({
        seasonId: "season-77",
        horseIds: horseIds(20),
        rng: seededRng(1),
      });
      const ids = rounds.map((r) => r.id as unknown as string);
      expect(new Set(ids).size).toBe(ids.length);
      expect(ids[0]).toBe("season-77:r1");
      expect(ids[5]).toBe("season-77:r6");
    });

    it("returns metadata describing the source", () => {
      const { meta } = buildSchedule({
        seasonId: "s-meta",
        horseIds: horseIds(20),
        rng: seededRng(1),
        seed: 1234,
      });
      expect(meta.horsesPerRound).toBe(HORSES_PER_ROUND);
      expect(meta.sourceSeed).toBe(1234);
      expect(typeof meta.generatedAt).toBe("number");
    });

    it("produces deterministic lineups for a given seed", () => {
      const a = buildSchedule({
        seasonId: "x",
        horseIds: horseIds(20),
        rng: seededRng(99),
      });
      const b = buildSchedule({
        seasonId: "x",
        horseIds: horseIds(20),
        rng: seededRng(99),
      });
      expect(a.rounds.map((r) => r.lineup)).toEqual(
        b.rounds.map((r) => r.lineup)
      );
    });
  });
});
