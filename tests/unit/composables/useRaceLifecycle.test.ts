import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { nextTick } from "vue";
import { useRaceLifecycle } from "../../../src/composables/useRaceLifecycle";
import { useSessionStore } from "../../../src/stores/sessionStore";
import { useRaceStore } from "../../../src/stores/raceStore";
import { useScheduleStore } from "../../../src/stores/scheduleStore";
import { useResultsStore } from "../../../src/stores/resultsStore";
import { installTestServices } from "../../helpers/services";
import { withSetup } from "../../helpers/withSetup";
import { runUntil } from "../../helpers/race";

describe("composables/useRaceLifecycle", () => {
  let cleanup: (() => void) | null = null;

  beforeEach(() => {
    installTestServices({ seed: 7 });
  });

  afterEach(() => {
    cleanup?.();
    cleanup = null;
  });

  it("forwards reactive state from the underlying stores", () => {
    const { result, unmount } = withSetup(() => useRaceLifecycle());
    cleanup = unmount;
    const session = useSessionStore();
    session.bootstrapSession();
    expect(result.phase.value).toBe("idle");
    expect(result.statusLabel.value).toBe("Hazır");
  });

  it("invokes session.onRoundFinished when race status flips to completed", async () => {
    const services = installTestServices({ seed: 7 });
    const { result, unmount } = withSetup(() => useRaceLifecycle());
    cleanup = unmount;

    result.generateSchedule();
    result.setAutoAdvance(false);
    result.startRace();
    runUntil(services, () => useRaceStore().status === "completed", {
      stepMs: 32,
      maxSimMs: 600_000,
    });
    await nextTick();
    expect(useSessionStore().phase).toBe("scheduled");
    expect(useResultsStore().orderedResults).toHaveLength(1);
    expect(useScheduleStore().rounds[0]?.status).toBe("completed");
  });

  it("setAutoAdvance() proxies to the race store", () => {
    const { result, unmount } = withSetup(() => useRaceLifecycle());
    cleanup = unmount;
    result.setAutoAdvance(false);
    const session = useSessionStore();
    session.bootstrapSession();
    session.generateSchedule();
    session.startRace();
    expect(useRaceStore().autoAdvance).toBe(false);
  });
});
