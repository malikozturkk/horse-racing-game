import { describe, expect, it } from "vitest";
import {
  advance,
  computeLiveStandings,
  initRuntime,
} from "../../../src/domain/race/simulationEngine";
import { asHorseId, asRoundId } from "../../../src/domain/shared/types";
import { seededRng } from "../../../src/domain/shared/rng";
import {
  buildRaceRuntime,
  buildParticipantRuntime,
} from "../../factories/runtime";

const initFor = (count: number, distance = 1200, seed = 1) =>
  initRuntime(
    {
      roundId: asRoundId("test:round"),
      distance,
      startedAt: 0,
      participants: Array.from({ length: count }, (_, i) => ({
        horseId: asHorseId(i + 1),
        lane: i,
        conditionAtStart: 80,
      })),
    },
    { rng: seededRng(seed) }
  );

describe("domain/race/simulationEngine", () => {
  describe("initRuntime()", () => {
    it("creates a runtime with all participants at zero progress", () => {
      const runtime = initFor(3);
      expect(runtime.participants).toHaveLength(3);
      expect(runtime.elapsedMs).toBe(0);
      expect(runtime.finishedOrder).toEqual([]);
      expect(runtime.isComplete).toBe(false);
      for (const p of runtime.participants) {
        expect(p.progressMeters).toBe(0);
        expect(p.speedMps).toBe(0);
        expect(p.finishedAt).toBeNull();
        expect(p.finishRank).toBeNull();
      }
    });

    it("samples a decay per meter for every participant", () => {
      const runtime = initFor(5, 1200, 11);
      for (const p of runtime.participants) {
        expect(p.decayPerMeter).toBeGreaterThan(0);
      }
    });
  });

  describe("advance()", () => {
    it("returns the runtime unchanged when delta <= 0", () => {
      const runtime = initFor(3);
      expect(advance(runtime, 0, { rng: seededRng(1) })).toBe(runtime);
      expect(advance(runtime, -10, { rng: seededRng(1) })).toBe(runtime);
    });

    it("clamps very large deltas to RACE_MAX_DELTA_MS", () => {
      const runtime = initFor(2, 1_000_000);
      const next = advance(runtime, 10_000_000, { rng: seededRng(1) });
      expect(next.elapsedMs).toBe(1200);
    });

    it("never reports progress beyond the race distance", () => {
      const runtime = initFor(4, 200);
      let r = runtime;
      for (let i = 0; i < 100; i++) {
        r = advance(r, 50, { rng: seededRng(i + 1) });
      }
      for (const p of r.participants) {
        expect(p.progressMeters).toBeLessThanOrEqual(200);
      }
    });

    it("eventually marks the race complete with monotonic finishRanks", () => {
      let r = initFor(4, 600);
      for (let i = 0; i < 200 && !r.isComplete; i++) {
        r = advance(r, 200, { rng: seededRng(i + 1) });
      }
      expect(r.isComplete).toBe(true);
      expect(r.finishedOrder).toHaveLength(4);
      const ranks = r.participants.map((p) => p.finishRank ?? 0);
      const sorted = [...ranks].sort((a, b) => a - b);
      expect(new Set(sorted).size).toBe(sorted.length);
      for (const rank of sorted) expect(rank).toBeGreaterThan(0);
      const firstId = r.finishedOrder[0]!;
      const first = r.participants.find((p) => p.horseId === firstId);
      expect(first?.finishRank).toBe(1);
    });

    it("preserves a finished participant across subsequent ticks", () => {
      const runtime = buildRaceRuntime({
        distance: 100,
        participants: [
          buildParticipantRuntime({
            horseId: asHorseId(1),
            lane: 0,
            progressMeters: 100,
            finishedAt: 1000,
            finishRank: 1,
          }),
          buildParticipantRuntime({
            horseId: asHorseId(2),
            lane: 1,
            progressMeters: 0,
          }),
        ],
        finishedOrder: [asHorseId(1)],
      });
      const next = advance(runtime, 50, { rng: seededRng(1) });
      const p1 = next.participants.find(
        (p) => (p.horseId as unknown as number) === 1
      );
      expect(p1?.finishedAt).toBe(1000);
      expect(p1?.finishRank).toBe(1);
    });

    it("returns the same runtime once the race is complete", () => {
      const finished = { ...initFor(2, 100), isComplete: true };
      expect(advance(finished, 100, { rng: seededRng(1) })).toBe(finished);
    });
  });

  describe("computeLiveStandings()", () => {
    it("ranks finished participants by their finishRank first", () => {
      const runtime = buildRaceRuntime({
        participants: [
          buildParticipantRuntime({
            horseId: asHorseId(1),
            progressMeters: 1200,
            finishedAt: 100,
            finishRank: 2,
          }),
          buildParticipantRuntime({
            horseId: asHorseId(2),
            progressMeters: 1200,
            finishedAt: 80,
            finishRank: 1,
          }),
          buildParticipantRuntime({
            horseId: asHorseId(3),
            progressMeters: 800,
          }),
          buildParticipantRuntime({
            horseId: asHorseId(4),
            progressMeters: 1100,
          }),
        ],
      });
      const standings = computeLiveStandings(runtime);
      const ids = standings.map((p) => p.horseId as unknown as number);
      expect(ids).toEqual([2, 1, 4, 3]);
    });

    it("uses progress as a tiebreaker for unfinished horses", () => {
      const runtime = buildRaceRuntime({
        participants: [
          buildParticipantRuntime({
            horseId: asHorseId(1),
            progressMeters: 200,
          }),
          buildParticipantRuntime({
            horseId: asHorseId(2),
            progressMeters: 700,
          }),
          buildParticipantRuntime({
            horseId: asHorseId(3),
            progressMeters: 500,
          }),
        ],
      });
      const standings = computeLiveStandings(runtime);
      expect(standings.map((p) => p.horseId as unknown as number)).toEqual([
        2, 3, 1,
      ]);
    });
  });
});
