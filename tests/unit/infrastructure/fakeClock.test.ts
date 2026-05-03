import { describe, expect, it } from "vitest";
import { createFakeClock } from "../../../src/infrastructure/clock/fakeClock";

describe("infrastructure/clock/fakeClock", () => {
  it("starts at 0 by default", () => {
    const clock = createFakeClock();
    expect(clock.now()).toBe(0);
  });

  it("accepts an initial time", () => {
    expect(createFakeClock(1000).now()).toBe(1000);
  });

  it("advance() adds to the current time", () => {
    const clock = createFakeClock(50);
    clock.advance(150);
    expect(clock.now()).toBe(200);
  });

  it("set() overwrites the current time", () => {
    const clock = createFakeClock(50);
    clock.set(999);
    expect(clock.now()).toBe(999);
  });
});
