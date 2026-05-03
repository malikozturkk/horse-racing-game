import { beforeEach, describe, expect, it } from "vitest";
import { useBarnStore } from "../../../src/stores/barnStore";
import { useScheduleStore } from "../../../src/stores/scheduleStore";
import { useRaceStore } from "../../../src/stores/raceStore";
import { useResultsStore } from "../../../src/stores/resultsStore";
import { useSessionStore } from "../../../src/stores/sessionStore";
import { TOTAL_ROUNDS } from "../../../src/domain/schedule/constants";
import { installPinia } from "../../helpers/pinia";
import { installTestServices } from "../../helpers/services";
import { runUntil } from "../../helpers/race";

describe("stores/sessionStore", () => {
  beforeEach(() => {
    installTestServices({ seed: 1 });
    installPinia();
  });

  describe("bootstrapSession()", () => {
    it("starts in 'idle' phase with an empty schedule and a populated barn", () => {
      const session = useSessionStore();
      session.bootstrapSession();
      expect(session.phase).toBe("idle");
      expect(session.seasonNumber).toBe(0);
      expect(useBarnStore().isPopulated).toBe(true);
      expect(useScheduleStore().rounds).toEqual([]);
      expect(useResultsStore().hasAnyResult).toBe(false);
    });
  });

  describe("generateSchedule()", () => {
    it("transitions idle → scheduled and creates a season id", () => {
      const session = useSessionStore();
      session.bootstrapSession();
      const r = session.generateSchedule();
      expect(r.ok).toBe(true);
      expect(session.phase).toBe("scheduled");
      expect(session.seasonNumber).toBe(1);
      expect(session.seasonId).toMatch(/^season-\d+-\d+/);
      expect(useScheduleStore().rounds).toHaveLength(TOTAL_ROUNDS);
    });

    it("rejects when called outside an allowed phase", () => {
      const session = useSessionStore();
      session.bootstrapSession();
      session.generateSchedule();
      const r = session.generateSchedule();
      expect(r.ok).toBe(false);
      if (!r.ok) {
        expect(r.error.code).toBe("session/cannot-generate-schedule");
      }
    });
  });

  describe("startRace / pauseRace / resumeRace", () => {
    it("startRace transitions scheduled → racing and arms the first round", () => {
      const session = useSessionStore();
      session.bootstrapSession();
      session.generateSchedule();
      const r = session.startRace();
      expect(r.ok).toBe(true);
      expect(session.phase).toBe("racing");
      expect(useRaceStore().isLive).toBe(true);
    });

    it("pauseRace transitions racing → paused", () => {
      const session = useSessionStore();
      session.bootstrapSession();
      session.generateSchedule();
      session.startRace();
      const r = session.pauseRace();
      expect(r.ok).toBe(true);
      expect(session.phase).toBe("paused");
    });

    it("resumeRace transitions paused → racing", () => {
      const session = useSessionStore();
      session.bootstrapSession();
      session.generateSchedule();
      session.startRace();
      session.pauseRace();
      const r = session.resumeRace();
      expect(r.ok).toBe(true);
      expect(session.phase).toBe("racing");
    });

    it("rejects pause when not racing", () => {
      const session = useSessionStore();
      session.bootstrapSession();
      session.generateSchedule();
      const r = session.pauseRace();
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.error.code).toBe("session/cannot-pause");
    });

    it("rejects resume when not paused", () => {
      const session = useSessionStore();
      session.bootstrapSession();
      session.generateSchedule();
      const r = session.resumeRace();
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.error.code).toBe("session/cannot-resume");
    });

    it("rejects start outside scheduled phase", () => {
      const session = useSessionStore();
      session.bootstrapSession();
      const r = session.startRace();
      expect(r.ok).toBe(false);
    });
  });

  describe("onRoundFinished", () => {
    it("returns to scheduled when more rounds remain", () => {
      const services = installTestServices({ seed: 7 });
      installPinia();
      const session = useSessionStore();
      session.bootstrapSession();
      session.generateSchedule();
      useRaceStore().setAutoAdvance(false);
      session.startRace();
      runUntil(services, () => useRaceStore().status === "completed", {
        stepMs: 32,
        maxSimMs: 600_000,
      });
      const r = session.onRoundFinished();
      expect(r.ok).toBe(true);
      expect(session.phase).toBe("scheduled");
    });

    it("transitions to seasonFinished when all rounds are completed", () => {
      const session = useSessionStore();
      session.bootstrapSession();
      session.generateSchedule();
      session.startRace();
      const schedule = useScheduleStore();
      for (const round of schedule.rounds) {
        schedule.setRoundStatus(round.id, "completed");
      }
      const r = session.onRoundFinished();
      expect(r.ok).toBe(true);
      expect(session.phase).toBe("seasonFinished");
      expect(session.isSeasonOver).toBe(true);
    });
  });

  describe("stopRace / startNewSeason / resetSession", () => {
    it("stopRace aborts and returns to scheduled", () => {
      const session = useSessionStore();
      session.bootstrapSession();
      session.generateSchedule();
      session.startRace();
      const r = session.stopRace();
      expect(r.ok).toBe(true);
      expect(session.phase).toBe("scheduled");
      expect(useRaceStore().runtime).toBeNull();
    });

    it("startNewSeason requires the seasonFinished phase", () => {
      const session = useSessionStore();
      session.bootstrapSession();
      session.generateSchedule();
      const r = session.startNewSeason();
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.error.code).toBe("session/cannot-start-new-season");
    });

    it("startNewSeason succeeds after the season is finished", () => {
      const session = useSessionStore();
      session.bootstrapSession();
      session.generateSchedule();
      session.startRace();
      const schedule = useScheduleStore();
      for (const round of schedule.rounds) {
        schedule.setRoundStatus(round.id, "completed");
      }
      session.onRoundFinished();
      const r = session.startNewSeason();
      expect(r.ok).toBe(true);
      expect(session.phase).toBe("scheduled");
      expect(session.seasonNumber).toBe(2);
    });

    it("resetSession bootstraps a fresh session", () => {
      const session = useSessionStore();
      session.bootstrapSession();
      session.generateSchedule();
      session.resetSession();
      expect(session.phase).toBe("idle");
      expect(session.seasonNumber).toBe(0);
      expect(useScheduleStore().rounds).toEqual([]);
    });
  });

  describe("statusLabel", () => {
    it.each([
      ["idle", "Hazır"],
      ["scheduled", "Program Hazır"],
      ["racing", "Yarış Sürüyor"],
      ["paused", "Duraklatıldı"],
      ["seasonFinished", "Yarışma Bitti"],
    ] as const)("phase %s exposes label %s", (phase, label) => {
      installTestServices({ seed: 1 });
      installPinia();
      const session = useSessionStore();
      session.bootstrapSession();
      switch (phase) {
        case "scheduled":
          session.generateSchedule();
          break;
        case "racing":
          session.generateSchedule();
          session.startRace();
          break;
        case "paused":
          session.generateSchedule();
          session.startRace();
          session.pauseRace();
          break;
        case "seasonFinished": {
          session.generateSchedule();
          session.startRace();
          const schedule = useScheduleStore();
          for (const round of schedule.rounds) {
            schedule.setRoundStatus(round.id, "completed");
          }
          session.onRoundFinished();
          break;
        }
        case "idle":
        default:
          break;
      }
      expect(session.statusLabel).toBe(label);
    });
  });
});
