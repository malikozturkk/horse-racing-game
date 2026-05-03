import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { useSeasonLifecycle } from "../../../src/composables/useSeasonLifecycle";
import { useSessionStore } from "../../../src/stores/sessionStore";
import { useResultsStore } from "../../../src/stores/resultsStore";
import { installTestServices } from "../../helpers/services";
import { withSetup } from "../../helpers/withSetup";
import { buildRoundResult } from "../../factories/results";

describe("composables/useSeasonLifecycle", () => {
  let cleanup: (() => void) | null = null;

  beforeEach(() => {
    installTestServices({ seed: 1 });
  });

  afterEach(() => {
    cleanup?.();
    cleanup = null;
  });

  it("auto-bootstraps the session when mounted with the default option", () => {
    const { result, unmount } = withSetup(() => useSeasonLifecycle());
    cleanup = unmount;
    expect(result.phase.value).toBe("idle");
    expect(useSessionStore().createdAt).toBeGreaterThanOrEqual(0);
  });

  it("does not auto-bootstrap when disabled", () => {
    const { result, unmount } = withSetup(() =>
      useSeasonLifecycle({ autoBootstrap: false })
    );
    cleanup = unmount;
    expect(useSessionStore().phase).toBe("idle");
    expect(result.hasAnyResult.value).toBe(false);
  });

  it("exposes results helpers and reflects new commits", () => {
    const { result, unmount } = withSetup(() => useSeasonLifecycle());
    cleanup = unmount;
    useResultsStore().commitRoundResult(buildRoundResult({}));
    expect(result.hasAnyResult.value).toBe(true);
    expect(result.standings.value.length).toBeGreaterThan(0);
    expect(result.latestResult.value).not.toBeNull();
    const snap = result.exportResults();
    expect(snap.rounds).toHaveLength(1);
  });
});
