import { describe, expect, it } from "vitest";
import {
  MAX_CONDITION,
  MIN_CONDITION,
  clampCondition,
} from "../../../src/domain/horse/types";

describe("domain/horse/types", () => {
  describe("clampCondition()", () => {
    it("rounds inside the supported range", () => {
      expect(clampCondition(50.4)).toBe(50);
      expect(clampCondition(50.6)).toBe(51);
    });

    it("clamps below the floor", () => {
      expect(clampCondition(-100)).toBe(MIN_CONDITION);
      expect(clampCondition(0)).toBe(MIN_CONDITION);
    });

    it("clamps above the ceiling", () => {
      expect(clampCondition(101)).toBe(MAX_CONDITION);
      expect(clampCondition(9999)).toBe(MAX_CONDITION);
    });
  });
});
