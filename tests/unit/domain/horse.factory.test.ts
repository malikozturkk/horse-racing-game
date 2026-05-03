import { describe, expect, it } from "vitest";
import {
  BARN_SIZE,
  RACE_SIZE,
  createBarn,
  initialCondition,
  pickRaceEntrants,
  shuffleHorses,
  tickCondition,
} from "../../../src/domain/horse";
import { seededRng } from "../../../src/domain/shared/rng";
import { buildHorses } from "../../factories/horses";

describe("domain/horse/factory", () => {
  describe("createBarn()", () => {
    it("returns BARN_SIZE horses by default", () => {
      const barn = createBarn({ rng: seededRng(1) });
      expect(barn).toHaveLength(BARN_SIZE);
    });

    it("respects a custom size", () => {
      const barn = createBarn({ rng: seededRng(1), size: 5 });
      expect(barn).toHaveLength(5);
    });

    it("assigns sequential branded ids starting at 1", () => {
      const barn = createBarn({ rng: seededRng(1), size: 4 });
      expect(barn.map((h) => h.id as unknown as number)).toEqual([1, 2, 3, 4]);
    });

    it("produces deterministic conditions for a given seed", () => {
      const barnA = createBarn({ rng: seededRng(7), size: 5 });
      const barnB = createBarn({ rng: seededRng(7), size: 5 });
      expect(barnA.map((h) => h.condition)).toEqual(
        barnB.map((h) => h.condition)
      );
    });

    it("clamps generated conditions inside [1, 100]", () => {
      const barn = createBarn({ rng: seededRng(1), size: 20 });
      for (const horse of barn) {
        expect(horse.condition).toBeGreaterThanOrEqual(1);
        expect(horse.condition).toBeLessThanOrEqual(100);
      }
    });

    it("attaches a coloring + visual to every horse", () => {
      const barn = createBarn({ rng: seededRng(1), size: 3 });
      for (const horse of barn) {
        expect(horse.visual.coloring.body).toMatch(/^#/);
        expect(horse.visual.silkColor).toMatch(/^#/);
        expect(horse.name).toBeTypeOf("string");
      }
    });
  });

  describe("initialCondition()", () => {
    it("falls inside [1, 100]", () => {
      const r = seededRng(33);
      for (let i = 0; i < 100; i++) {
        const c = initialCondition(r);
        expect(c).toBeGreaterThanOrEqual(1);
        expect(c).toBeLessThanOrEqual(100);
      }
    });
  });

  describe("pickRaceEntrants()", () => {
    it("returns RACE_SIZE entrants by default", () => {
      const barn = buildHorses({ count: 20 });
      const picked = pickRaceEntrants(barn, RACE_SIZE, seededRng(1));
      expect(picked).toHaveLength(RACE_SIZE);
    });

    it("returns the whole barn when count exceeds the pool", () => {
      const barn = buildHorses({ count: 5 });
      const picked = pickRaceEntrants(barn, 99, seededRng(1));
      expect(picked).toHaveLength(5);
    });

    it("does not duplicate horses in the picked lineup", () => {
      const barn = buildHorses({ count: 20 });
      const picked = pickRaceEntrants(barn, 10, seededRng(2));
      const ids = new Set(picked.map((h) => h.id as unknown as number));
      expect(ids.size).toBe(picked.length);
    });

    it("does not mutate the source array", () => {
      const barn = buildHorses({ count: 4 });
      const original = barn.map((h) => h.id as unknown as number);
      pickRaceEntrants(barn, 4, seededRng(1));
      expect(barn.map((h) => h.id as unknown as number)).toEqual(original);
    });
  });

  describe("tickCondition()", () => {
    it("subtracts the decay amount and clamps", () => {
      expect(tickCondition(100, 10)).toBe(90);
      expect(tickCondition(50, 49)).toBe(1);
      expect(tickCondition(50, 999)).toBe(1);
      expect(tickCondition(-5, 0)).toBe(1);
    });
  });

  describe("shuffleHorses()", () => {
    it("returns a permutation of the input", () => {
      const horses = buildHorses({ count: 5 });
      const shuffled = shuffleHorses(horses, seededRng(9));
      expect([...shuffled].map((h) => h.id).sort()).toEqual(
        [...horses].map((h) => h.id).sort()
      );
    });
  });
});
