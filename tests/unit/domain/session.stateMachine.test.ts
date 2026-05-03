import { describe, expect, it } from "vitest";
import {
  assertCanTransition,
  canTransition,
} from "../../../src/domain/session/stateMachine";
import type { GamePhase } from "../../../src/domain/session/types";

const ALLOWED: ReadonlyArray<readonly [GamePhase, GamePhase]> = [
  ["idle", "scheduled"],
  ["scheduled", "racing"],
  ["scheduled", "idle"],
  ["racing", "paused"],
  ["racing", "scheduled"],
  ["racing", "seasonFinished"],
  ["racing", "idle"],
  ["paused", "racing"],
  ["paused", "idle"],
  ["seasonFinished", "idle"],
  ["seasonFinished", "scheduled"],
];

const FORBIDDEN: ReadonlyArray<readonly [GamePhase, GamePhase]> = [
  ["idle", "racing"],
  ["idle", "paused"],
  ["idle", "seasonFinished"],
  ["scheduled", "paused"],
  ["scheduled", "seasonFinished"],
  ["paused", "seasonFinished"],
  ["paused", "scheduled"],
  ["seasonFinished", "racing"],
  ["seasonFinished", "paused"],
];

describe("domain/session/stateMachine", () => {
  describe("canTransition()", () => {
    it.each(ALLOWED)("allows %s → %s", (from, to) => {
      expect(canTransition(from, to)).toBe(true);
    });

    it.each(FORBIDDEN)("forbids %s → %s", (from, to) => {
      expect(canTransition(from, to)).toBe(false);
    });

    it("rejects self transitions", () => {
      const phases: GamePhase[] = [
        "idle",
        "scheduled",
        "paused",
        "seasonFinished",
      ];
      for (const p of phases) {
        expect(canTransition(p, p)).toBe(false);
      }
    });

    it("treats racing → racing as allowed by the table (idempotent restart)", () => {
      expect(canTransition("racing", "racing")).toBe(false);
    });
  });

  describe("assertCanTransition()", () => {
    it("returns ok for allowed transitions", () => {
      const r = assertCanTransition("idle", "scheduled");
      expect(r.ok).toBe(true);
    });

    it("returns a domain error for forbidden transitions", () => {
      const r = assertCanTransition("idle", "racing");
      expect(r.ok).toBe(false);
      if (!r.ok) {
        expect(r.error.code).toBe("session/illegal-transition");
        expect(r.error.message).toContain("idle");
        expect(r.error.message).toContain("racing");
      }
    });
  });
});
