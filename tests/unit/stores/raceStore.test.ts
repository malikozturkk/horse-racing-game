import { beforeEach, describe, expect, it } from "vitest";
import { useBarnStore } from "../../../src/stores/barnStore";
import { useScheduleStore } from "../../../src/stores/scheduleStore";
import { useRaceStore } from "../../../src/stores/raceStore";
import { useResultsStore } from "../../../src/stores/resultsStore";
import { installPinia } from "../../helpers/pinia";
import { installTestServices, type TestServices } from "../../helpers/services";
import { runUntil } from "../../helpers/race";

const setupSeasonReady = (seed = 1): TestServices => {
  const services = installTestServices({ seed });
  installPinia();
  useBarnStore().generateBarn();
  useScheduleStore().generateSchedule({ seasonId: "season-test" });
  return services;
};

describe("stores/raceStore", () => {
  beforeEach(() => {
    setupSeasonReady();
  });

  describe("armRound()", () => {
    it("creates a runtime in 'arming' state for a valid round", () => {
      const race = useRaceStore();
      race.armRound(0);
      expect(race.status).toBe("arming");
      expect(race.isArmed).toBe(true);
      expect(race.runtime).not.toBeNull();
      expect(race.activeRoundIndex).toBe(0);
      expect(race.error).toBeNull();
    });

    it("flags the round as queued in the schedule", () => {
      const race = useRaceStore();
      const schedule = useScheduleStore();
      race.armRound(0);
      expect(schedule.rounds[0]?.status).toBe("queued");
    });

    it("records an error when the round index is out of bounds", () => {
      const race = useRaceStore();
      race.armRound(99);
      expect(race.status).toBe("idle");
      expect(race.runtime).toBeNull();
      expect(race.error).toMatch(/no round/);
    });

    it("records an error when the barn is missing horses for the round", () => {
      useBarnStore().replaceBarn([]);
      const race = useRaceStore();
      race.armRound(0);
      expect(race.runtime).toBeNull();
      expect(race.error).toMatch(/barn missing/);
    });
  });

  describe("start / pause / resume", () => {
    it("transitions arming → running and subscribes to the ticker", () => {
      const services = installTestServices({ seed: 1 });
      installPinia();
      useBarnStore().generateBarn();
      useScheduleStore().generateSchedule({ seasonId: "s" });
      const race = useRaceStore();
      race.armRound(0);
      race.start();
      expect(race.status).toBe("running");
      expect(race.isLive).toBe(true);
      expect(services.ticker.subscriberCount).toBe(1);
    });

    it("start() is a no-op when no runtime is armed", () => {
      const race = useRaceStore();
      race.start();
      expect(race.status).toBe("idle");
    });

    it("pause() detaches the ticker and updates the status", () => {
      const services = installTestServices({ seed: 1 });
      installPinia();
      useBarnStore().generateBarn();
      useScheduleStore().generateSchedule({ seasonId: "s" });
      const race = useRaceStore();
      race.armRound(0);
      race.start();
      race.pause();
      expect(race.status).toBe("paused");
      expect(services.ticker.subscriberCount).toBe(0);
      expect(race.canResume).toBe(true);
    });

    it("resume() reattaches the ticker", () => {
      const services = installTestServices({ seed: 1 });
      installPinia();
      useBarnStore().generateBarn();
      useScheduleStore().generateSchedule({ seasonId: "s" });
      const race = useRaceStore();
      race.armRound(0);
      race.start();
      race.pause();
      race.resume();
      expect(race.status).toBe("running");
      expect(services.ticker.subscriberCount).toBe(1);
    });

    it("ticks advance progress and decay barn condition", () => {
      const services = installTestServices({ seed: 7 });
      installPinia();
      const barn = useBarnStore();
      barn.generateBarn();
      const conditionBefore = barn.allHorses.map((h) => h.condition);
      useScheduleStore().generateSchedule({ seasonId: "s" });
      const race = useRaceStore();
      race.armRound(0);
      race.start();
      services.ticker.advance(2_000, 32);
      expect(race.runtime?.elapsedMs ?? 0).toBeGreaterThan(0);
      const conditionAfter = barn.allHorses.map((h) => h.condition);
      expect(conditionAfter).not.toEqual(conditionBefore);
    });
  });

  describe("finishRound()", () => {
    it("commits the round result and transitions to completed", () => {
      const services = installTestServices({ seed: 7 });
      installPinia();
      useBarnStore().generateBarn();
      useScheduleStore().generateSchedule({ seasonId: "s" });
      const race = useRaceStore();
      const results = useResultsStore();
      race.setAutoAdvance(false);
      race.armRound(0);
      race.start();
      runUntil(services, () => race.status === "completed", {
        stepMs: 32,
        maxSimMs: 600_000,
      });
      expect(race.status).toBe("completed");
      expect(results.orderedResults).toHaveLength(1);
      const round = useScheduleStore().rounds[0];
      expect(round?.status).toBe("completed");
    });

    it("auto-advances to the next round when enabled", () => {
      const services = installTestServices({ seed: 7 });
      installPinia();
      useBarnStore().generateBarn();
      useScheduleStore().generateSchedule({ seasonId: "s" });
      const race = useRaceStore();
      race.setAutoAdvance(true);
      race.armRound(0);
      race.start();
      runUntil(services, () => useResultsStore().orderedResults.length >= 2, {
        stepMs: 32,
        maxSimMs: 1_200_000,
      });
      expect(useResultsStore().orderedResults.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe("derived flags", () => {
    it("canStart toggles with the lifecycle phases", () => {
      installTestServices({ seed: 1 });
      installPinia();
      useBarnStore().generateBarn();
      useScheduleStore().generateSchedule({ seasonId: "s" });
      const race = useRaceStore();
      expect(race.canStart).toBe(false);
      race.armRound(0);
      expect(race.canStart).toBe(true);
      race.start();
      expect(race.canStart).toBe(false);
      race.pause();
      expect(race.canStart).toBe(true);
    });

    it("computes liveStandings, leader and progressRatio from the runtime", () => {
      const services = installTestServices({ seed: 7 });
      installPinia();
      useBarnStore().generateBarn();
      useScheduleStore().generateSchedule({ seasonId: "s" });
      const race = useRaceStore();
      race.setAutoAdvance(false);
      race.armRound(0);
      race.start();
      services.ticker.advance(800, 32);
      expect(race.liveStandings.length).toBeGreaterThan(0);
      expect(race.leader).toBe(race.liveStandings[0]);
      expect(race.progressRatio).toBeGreaterThanOrEqual(0);
      expect(race.progressRatio).toBeLessThanOrEqual(1);
    });
  });

  describe("abort() / reset() / dispose()", () => {
    it("abort() returns to idle and detaches the ticker", () => {
      const services = installTestServices({ seed: 1 });
      installPinia();
      useBarnStore().generateBarn();
      useScheduleStore().generateSchedule({ seasonId: "s" });
      const race = useRaceStore();
      race.armRound(0);
      race.start();
      race.abort();
      expect(race.status).toBe("idle");
      expect(race.runtime).toBeNull();
      expect(race.activeRoundIndex).toBeNull();
      expect(services.ticker.subscriberCount).toBe(0);
    });

    it("reset() clears all transient state", () => {
      installTestServices({ seed: 1 });
      installPinia();
      useBarnStore().generateBarn();
      useScheduleStore().generateSchedule({ seasonId: "s" });
      const race = useRaceStore();
      race.armRound(0);
      race.reset();
      expect(race.runtime).toBeNull();
      expect(race.error).toBeNull();
      expect(race.status).toBe("idle");
    });
  });
});
