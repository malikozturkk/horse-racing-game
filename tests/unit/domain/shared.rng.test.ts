import { describe, expect, it } from "vitest";
import { defaultRng, seededRng } from "../../../src/domain/shared/rng";

describe("domain/shared/rng", () => {
  describe("seededRng()", () => {
    it("is deterministic for the same seed", () => {
      const a = seededRng(123);
      const b = seededRng(123);
      const seqA = Array.from({ length: 8 }, () => a.next());
      const seqB = Array.from({ length: 8 }, () => b.next());
      expect(seqA).toEqual(seqB);
    });

    it("produces different sequences for different seeds", () => {
      const a = seededRng(1);
      const b = seededRng(2);
      const seqA = Array.from({ length: 6 }, () => a.next());
      const seqB = Array.from({ length: 6 }, () => b.next());
      expect(seqA).not.toEqual(seqB);
    });

    it("yields floats inside [0, 1)", () => {
      const r = seededRng(7);
      for (let i = 0; i < 200; i++) {
        const v = r.next();
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThan(1);
      }
    });
  });

  describe("rng.int()", () => {
    it("respects an inclusive [min, max] range", () => {
      const r = seededRng(99);
      for (let i = 0; i < 500; i++) {
        const v = r.int(3, 9);
        expect(v).toBeGreaterThanOrEqual(3);
        expect(v).toBeLessThanOrEqual(9);
        expect(Number.isInteger(v)).toBe(true);
      }
    });

    it("returns the constant when min equals max", () => {
      const r = seededRng(1);
      expect(r.int(5, 5)).toBe(5);
    });

    it("throws when max < min", () => {
      const r = seededRng(1);
      expect(() => r.int(5, 1)).toThrow(RangeError);
    });
  });

  describe("rng.float()", () => {
    it("returns values within bounds", () => {
      const r = seededRng(11);
      for (let i = 0; i < 200; i++) {
        const v = r.float(-2, 2);
        expect(v).toBeGreaterThanOrEqual(-2);
        expect(v).toBeLessThan(2);
      }
    });
  });

  describe("rng.pick()", () => {
    it("returns one of the provided items", () => {
      const r = seededRng(3);
      const items = ["a", "b", "c"] as const;
      for (let i = 0; i < 30; i++) {
        expect(items).toContain(r.pick(items));
      }
    });

    it("throws on an empty array", () => {
      const r = seededRng(3);
      expect(() => r.pick([])).toThrow(RangeError);
    });
  });

  describe("rng.shuffle()", () => {
    it("returns a permutation without mutating the source", () => {
      const source = [1, 2, 3, 4, 5];
      const r = seededRng(3);
      const out = r.shuffle(source);
      expect(out).toHaveLength(source.length);
      expect([...out].sort()).toEqual([...source].sort());
      expect(source).toEqual([1, 2, 3, 4, 5]);
    });

    it("is deterministic for a given seed", () => {
      const a = seededRng(42).shuffle([1, 2, 3, 4, 5]);
      const b = seededRng(42).shuffle([1, 2, 3, 4, 5]);
      expect(a).toEqual(b);
    });
  });

  describe("defaultRng()", () => {
    it("produces a working Rng with all methods", () => {
      const r = defaultRng();
      expect(typeof r.next()).toBe("number");
      expect(Number.isInteger(r.int(1, 3))).toBe(true);
      expect(typeof r.float(0, 1)).toBe("number");
      expect(["x", "y"]).toContain(r.pick(["x", "y"]));
      expect(r.shuffle([1, 2])).toHaveLength(2);
    });
  });
});
