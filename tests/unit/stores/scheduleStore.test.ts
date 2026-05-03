import { beforeEach, describe, expect, it } from "vitest";
import { useBarnStore } from "../../../src/stores/barnStore";
import { useScheduleStore } from "../../../src/stores/scheduleStore";
import {
  HORSES_PER_ROUND,
  TOTAL_ROUNDS,
} from "../../../src/domain/schedule/constants";
import { installPinia } from "../../helpers/pinia";
import { installTestServices } from "../../helpers/services";

describe("stores/scheduleStore", () => {
  beforeEach(() => {
    installTestServices({ seed: 1 });
    installPinia();
    useBarnStore().generateBarn();
  });

  describe("generateSchedule()", () => {
    it("creates TOTAL_ROUNDS rounds and resets the cursor to 0", () => {
      const store = useScheduleStore();
      store.generateSchedule({ seasonId: "season-1" });
      expect(store.rounds).toHaveLength(TOTAL_ROUNDS);
      expect(store.isGenerated).toBe(true);
      expect(store.currentRoundIndex).toBe(0);
      expect(store.currentRound?.index).toBe(0);
      expect(store.nextRound?.index).toBe(1);
    });

    it("each round is filled with HORSES_PER_ROUND unique entrants", () => {
      const store = useScheduleStore();
      store.generateSchedule({ seasonId: "season-1" });
      for (const round of store.rounds) {
        expect(round.lineup).toHaveLength(HORSES_PER_ROUND);
        expect(new Set(round.lineup).size).toBe(round.lineup.length);
      }
    });

    it("throws when the barn is empty", () => {
      const barn = useBarnStore();
      barn.replaceBarn([]);
      expect(() =>
        useScheduleStore().generateSchedule({ seasonId: "x" })
      ).toThrow();
    });

    it("populates meta with the requested seed", () => {
      const store = useScheduleStore();
      store.generateSchedule({ seasonId: "x", seed: 99 });
      expect(store.meta?.sourceSeed).toBe(99);
      expect(store.meta?.horsesPerRound).toBe(HORSES_PER_ROUND);
    });
  });

  describe("setRoundStatus / setRoundStatusByIndex", () => {
    it("updates a round status by id", () => {
      const store = useScheduleStore();
      store.generateSchedule({ seasonId: "s" });
      const round = store.rounds[0]!;
      store.setRoundStatus(round.id, "live");
      expect(store.rounds[0]?.status).toBe("live");
    });

    it("updates a round status by index", () => {
      const store = useScheduleStore();
      store.generateSchedule({ seasonId: "s" });
      store.setRoundStatusByIndex(2, "queued");
      expect(store.rounds[2]?.status).toBe("queued");
    });

    it("does nothing for unknown ids or out-of-range indexes", () => {
      const store = useScheduleStore();
      store.generateSchedule({ seasonId: "s" });
      const before = store.rounds.map((r) => r.status);
      store.setRoundStatusByIndex(999, "live");
      expect(store.rounds.map((r) => r.status)).toEqual(before);
    });
  });

  describe("advanceCursor / setCursor", () => {
    it("advanceCursor() walks to the next round and ends as null", () => {
      const store = useScheduleStore();
      store.generateSchedule({ seasonId: "s" });
      for (let i = 0; i < TOTAL_ROUNDS; i++) {
        expect(store.currentRoundIndex).toBe(i);
        store.advanceCursor();
      }
      expect(store.currentRoundIndex).toBeNull();
      expect(store.nextRound?.index).toBe(0);
    });

    it("setCursor() snaps within range", () => {
      const store = useScheduleStore();
      store.generateSchedule({ seasonId: "s" });
      store.setCursor(3);
      expect(store.currentRoundIndex).toBe(3);
      store.setCursor(-1);
      expect(store.currentRoundIndex).toBe(3);
      store.setCursor(99);
      expect(store.currentRoundIndex).toBe(3);
      store.setCursor(null);
      expect(store.currentRoundIndex).toBeNull();
    });
  });

  describe("derived state", () => {
    it("isFullyCompleted requires every round to be completed", () => {
      const store = useScheduleStore();
      store.generateSchedule({ seasonId: "s" });
      expect(store.isFullyCompleted).toBe(false);
      for (const r of store.rounds) {
        store.setRoundStatus(r.id, "completed");
      }
      expect(store.isFullyCompleted).toBe(true);
      expect(store.completedRounds).toHaveLength(TOTAL_ROUNDS);
      expect(store.pendingRounds).toHaveLength(0);
      expect(store.progressRatio).toBe(1);
    });

    it("progressRatio reflects completed rounds", () => {
      const store = useScheduleStore();
      store.generateSchedule({ seasonId: "s" });
      const half = Math.floor(TOTAL_ROUNDS / 2);
      for (let i = 0; i < half; i++) {
        store.setRoundStatus(store.rounds[i]!.id, "completed");
      }
      expect(store.progressRatio).toBeCloseTo(half / TOTAL_ROUNDS, 5);
    });
  });

  describe("lineupForRound()", () => {
    it("returns the round + horse list", () => {
      const store = useScheduleStore();
      store.generateSchedule({ seasonId: "s" });
      const result = store.lineupForRound(0);
      expect(result?.round.index).toBe(0);
      expect(result?.horses).toHaveLength(HORSES_PER_ROUND);
    });

    it("returns null for an unknown index", () => {
      const store = useScheduleStore();
      store.generateSchedule({ seasonId: "s" });
      expect(store.lineupForRound(99)).toBeNull();
    });
  });

  describe("resetSchedule()", () => {
    it("clears all rounds, meta and cursor", () => {
      const store = useScheduleStore();
      store.generateSchedule({ seasonId: "s" });
      store.resetSchedule();
      expect(store.rounds).toEqual([]);
      expect(store.meta).toBeNull();
      expect(store.currentRoundIndex).toBeNull();
    });
  });
});
