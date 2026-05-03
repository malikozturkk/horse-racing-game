import { beforeEach, describe, expect, it } from "vitest";
import { useResultsStore } from "../../../src/stores/resultsStore";
import { asHorseId, asRoundId } from "../../../src/domain/shared/types";
import { installPinia } from "../../helpers/pinia";
import { installTestServices } from "../../helpers/services";
import { buildRoundResult } from "../../factories/results";

describe("stores/resultsStore", () => {
  beforeEach(() => {
    installTestServices({ seed: 1 });
    installPinia();
  });

  describe("commitRoundResult()", () => {
    it("appends a new result and returns true", () => {
      const store = useResultsStore();
      const result = buildRoundResult({ roundId: asRoundId("r-1") });
      expect(store.commitRoundResult(result)).toBe(true);
      expect(store.orderedResults).toHaveLength(1);
      expect(store.latestResult?.roundId).toBe(asRoundId("r-1"));
      expect(store.hasAnyResult).toBe(true);
    });

    it("rejects duplicates and returns false", () => {
      const store = useResultsStore();
      const result = buildRoundResult({ roundId: asRoundId("r-1") });
      expect(store.commitRoundResult(result)).toBe(true);
      expect(store.commitRoundResult(result)).toBe(false);
      expect(store.orderedResults).toHaveLength(1);
    });

    it("recomputes standings on commit", () => {
      const store = useResultsStore();
      store.commitRoundResult(
        buildRoundResult({
          roundId: asRoundId("r-1"),
          finishOrder: [
            {
              rank: 1,
              horseId: asHorseId(1),
              finishTimeMs: 60_000,
              gapToLeaderMeters: 0,
              points: 10,
            },
            {
              rank: 2,
              horseId: asHorseId(2),
              finishTimeMs: 60_500,
              gapToLeaderMeters: 0,
              points: 7,
            },
          ],
        })
      );
      expect(store.standings).toHaveLength(2);
      expect(store.seasonChampion?.horseId).toBe(asHorseId(1));
      expect(store.rankOfHorse(asHorseId(1))).toBe(1);
      expect(store.rankOfHorse(asHorseId(2))).toBe(2);
      expect(store.rankOfHorse(asHorseId(99))).toBe(-1);
    });
  });

  describe("topN() / getRoundResult()", () => {
    it("topN returns the requested slice", () => {
      const store = useResultsStore();
      store.commitRoundResult(
        buildRoundResult({
          roundId: asRoundId("r-1"),
          finishOrder: [
            {
              rank: 1,
              horseId: asHorseId(1),
              finishTimeMs: 1,
              gapToLeaderMeters: 0,
              points: 10,
            },
            {
              rank: 2,
              horseId: asHorseId(2),
              finishTimeMs: 2,
              gapToLeaderMeters: 0,
              points: 7,
            },
            {
              rank: 3,
              horseId: asHorseId(3),
              finishTimeMs: 3,
              gapToLeaderMeters: 0,
              points: 5,
            },
          ],
        })
      );
      expect(store.topN(2)).toHaveLength(2);
      expect(store.topN(0)).toHaveLength(0);
      expect(store.topN(-3)).toHaveLength(0);
      expect(store.topN(99)).toHaveLength(3);
    });

    it("getRoundResult() returns the result for an id", () => {
      const store = useResultsStore();
      const r = buildRoundResult({ roundId: asRoundId("r-x") });
      store.commitRoundResult(r);
      expect(store.getRoundResult(asRoundId("r-x"))?.roundId).toBe(
        asRoundId("r-x")
      );
      expect(store.getRoundResult(asRoundId("missing"))).toBeUndefined();
    });
  });

  describe("setScoringPolicy() / clearResults()", () => {
    it("setScoringPolicy() recomputes standings using the new policy", () => {
      const store = useResultsStore();
      store.commitRoundResult(buildRoundResult({}));
      const flat = { id: "flat", pointsFor: () => 0 };
      store.setScoringPolicy(flat);
      expect(store.policy.id).toBe("flat");
    });

    it("clearResults() removes all data", () => {
      const store = useResultsStore();
      store.commitRoundResult(buildRoundResult({}));
      store.clearResults();
      expect(store.orderedResults).toHaveLength(0);
      expect(store.standings).toHaveLength(0);
      expect(store.hasAnyResult).toBe(false);
    });
  });

  describe("exportSnapshot()", () => {
    it("returns the rounds, standings and policy id", () => {
      const store = useResultsStore();
      store.commitRoundResult(buildRoundResult({}));
      const snap = store.exportSnapshot();
      expect(snap.rounds).toHaveLength(1);
      expect(snap.standings.length).toBeGreaterThan(0);
      expect(snap.policyId).toBe(store.policy.id);
    });
  });
});
