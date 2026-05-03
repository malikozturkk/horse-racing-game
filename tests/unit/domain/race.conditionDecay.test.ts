import { describe, expect, it } from "vitest";
import {
  RACE_CONDITION_DECAY_MAX_PER_METER,
  RACE_CONDITION_DECAY_MIN_PER_METER,
} from "../../../src/domain/race/constants";
import {
  sampleDecayPerMeter,
  tickConditionDecay,
} from "../../../src/domain/race/conditionDecay";
import { MIN_CONDITION } from "../../../src/domain/horse/types";
import { seededRng } from "../../../src/domain/shared/rng";

describe("domain/race/conditionDecay", () => {
  describe("sampleDecayPerMeter()", () => {
    it("samples within the configured bounds", () => {
      const r = seededRng(5);
      for (let i = 0; i < 200; i++) {
        const v = sampleDecayPerMeter(r);
        expect(v).toBeGreaterThanOrEqual(RACE_CONDITION_DECAY_MIN_PER_METER);
        expect(v).toBeLessThanOrEqual(RACE_CONDITION_DECAY_MAX_PER_METER);
      }
    });
  });

  describe("tickConditionDecay()", () => {
    it("returns the same condition when no meters are travelled", () => {
      const next = tickConditionDecay(
        { current: 80, decayPerMeter: 0.01, metersTraveled: 0 },
        { rng: seededRng(1) }
      );
      expect(next).toBe(80);
    });

    it("decreases condition proportionally to distance and decay", () => {
      const next = tickConditionDecay(
        { current: 100, decayPerMeter: 0.01, metersTraveled: 10 },
        { rng: seededRng(1) }
      );
      expect(next).toBeLessThan(100);
      expect(next).toBeGreaterThan(99.8);
    });

    it("never drops below MIN_CONDITION", () => {
      const next = tickConditionDecay(
        {
          current: MIN_CONDITION + 0.01,
          decayPerMeter: 999,
          metersTraveled: 1000,
        },
        { rng: seededRng(1) }
      );
      expect(next).toBe(MIN_CONDITION);
    });
  });
});
