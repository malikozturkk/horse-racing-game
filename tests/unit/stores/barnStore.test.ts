import { beforeEach, describe, expect, it } from "vitest";
import { useBarnStore } from "../../../src/stores/barnStore";
import { BARN_SIZE } from "../../../src/domain/horse/constants";
import { asHorseId } from "../../../src/domain/shared/types";
import { installPinia } from "../../helpers/pinia";
import { installTestServices } from "../../helpers/services";
import { buildHorses } from "../../factories/horses";

describe("stores/barnStore", () => {
  beforeEach(() => {
    installTestServices({ seed: 13 });
    installPinia();
  });

  describe("generateBarn()", () => {
    it("populates BARN_SIZE horses by default", () => {
      const store = useBarnStore();
      store.generateBarn();
      expect(store.horseCount).toBe(BARN_SIZE);
      expect(store.isPopulated).toBe(true);
      expect(store.allHorses).toHaveLength(BARN_SIZE);
    });

    it("respects a custom size", () => {
      const store = useBarnStore();
      store.generateBarn(7);
      expect(store.horseCount).toBe(7);
    });

    it("indexes horses by id and exposes ordered ids", () => {
      const store = useBarnStore();
      store.generateBarn(5);
      const ids = store.allIds.map((id) => id as unknown as number);
      expect(ids).toEqual([1, 2, 3, 4, 5]);
      const horse = store.getById(asHorseId(3));
      expect(horse?.id).toBe(asHorseId(3));
    });
  });

  describe("replaceBarn()", () => {
    it("replaces horses and resets entrants", () => {
      const store = useBarnStore();
      const horses = buildHorses({ count: 4 });
      store.replaceBarn(horses);
      expect(store.horseCount).toBe(4);
      expect(store.getById(asHorseId(1))).toBeDefined();
    });
  });

  describe("getByIds()", () => {
    it("returns horses in the requested order, skipping unknown ids", () => {
      const store = useBarnStore();
      store.replaceBarn(buildHorses({ count: 4 }));
      const horses = store.getByIds([
        asHorseId(3),
        asHorseId(99),
        asHorseId(1),
      ]);
      expect(horses.map((h) => h.id as unknown as number)).toEqual([3, 1]);
    });
  });

  describe("setCondition / applyConditionDelta", () => {
    it("clamps conditions inside [1, 100]", () => {
      const store = useBarnStore();
      store.replaceBarn(buildHorses({ count: 1, conditionFn: () => 80 }));
      store.setCondition(asHorseId(1), 9999);
      expect(store.getById(asHorseId(1))?.condition).toBe(100);
      store.setCondition(asHorseId(1), -100);
      expect(store.getById(asHorseId(1))?.condition).toBe(1);
    });

    it("applyConditionDelta() adds and clamps", () => {
      const store = useBarnStore();
      store.replaceBarn(buildHorses({ count: 1, conditionFn: () => 50 }));
      store.applyConditionDelta(asHorseId(1), -30);
      expect(store.getById(asHorseId(1))?.condition).toBe(20);
      store.applyConditionDelta(asHorseId(1), -1000);
      expect(store.getById(asHorseId(1))?.condition).toBe(1);
    });

    it("ignores unknown ids gracefully", () => {
      const store = useBarnStore();
      store.replaceBarn(buildHorses({ count: 1 }));
      expect(() => store.setCondition(asHorseId(999), 50)).not.toThrow();
      expect(() =>
        store.applyConditionDelta(asHorseId(999), 5)
      ).not.toThrow();
    });
  });

  describe("setConditions / applyConditionDeltas", () => {
    it("setConditions() applies a batch and clamps each value", () => {
      const store = useBarnStore();
      store.replaceBarn(buildHorses({ count: 3, conditionFn: () => 50 }));
      store.setConditions(
        new Map([
          [asHorseId(1), 70],
          [asHorseId(2), -5],
          [asHorseId(3), 200],
        ])
      );
      expect(store.getById(asHorseId(1))?.condition).toBe(70);
      expect(store.getById(asHorseId(2))?.condition).toBe(1);
      expect(store.getById(asHorseId(3))?.condition).toBe(100);
    });

    it("setConditions() does nothing when no value changes", () => {
      const store = useBarnStore();
      store.replaceBarn(buildHorses({ count: 2, conditionFn: () => 60 }));
      const before = store.snapshot();
      store.setConditions(
        new Map([
          [asHorseId(1), 60],
          [asHorseId(2), 60],
        ])
      );
      const after = store.snapshot();
      expect(after).toEqual(before);
    });

    it("applyConditionDeltas() batches incremental changes", () => {
      const store = useBarnStore();
      store.replaceBarn(buildHorses({ count: 2, conditionFn: () => 80 }));
      store.applyConditionDeltas(
        new Map([
          [asHorseId(1), -20],
          [asHorseId(2), 30],
        ])
      );
      expect(store.getById(asHorseId(1))?.condition).toBe(60);
      expect(store.getById(asHorseId(2))?.condition).toBe(100);
    });
  });

  describe("snapshot()", () => {
    it("returns a frozen snapshot of the barn", () => {
      const store = useBarnStore();
      store.replaceBarn(buildHorses({ count: 2 }));
      const snap = store.snapshot();
      expect(Object.isFrozen(snap)).toBe(true);
      expect(snap).toHaveLength(2);
    });
  });

  describe("recoverHorse()", () => {
    it("restores condition to 100", () => {
      const store = useBarnStore();
      store.replaceBarn(buildHorses({ count: 1, conditionFn: () => 30 }));
      store.recoverHorse(asHorseId(1));
      expect(store.getById(asHorseId(1))?.condition).toBe(100);
    });
  });

  describe("resetBarn()", () => {
    it("regenerates the barn with the configured rng", () => {
      const store = useBarnStore();
      store.generateBarn(5);
      const ids = store.allIds.length;
      store.resetBarn();
      expect(store.horseCount).toBe(BARN_SIZE);
      expect(store.horseCount).not.toBe(ids);
    });
  });
});
