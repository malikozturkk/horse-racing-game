import { afterEach, describe, expect, it } from "vitest";
import {
  getServices,
  resetServices,
  setServices,
} from "../../../src/infrastructure/container";
import { createFakeClock } from "../../../src/infrastructure/clock/fakeClock";
import { createFakeTicker } from "../../../src/infrastructure/ticker/fakeTicker";
import { seededRng } from "../../../src/domain/shared/rng";

describe("infrastructure/container", () => {
  afterEach(() => resetServices());

  it("returns lazily-built defaults from getServices()", () => {
    const services = getServices();
    expect(services.rng).toBeDefined();
    expect(services.clock).toBeDefined();
    expect(services.ticker).toBeDefined();
  });

  it("memoises the services across calls", () => {
    const a = getServices();
    const b = getServices();
    expect(a).toBe(b);
  });

  it("setServices() merges overrides over defaults", () => {
    const fakeClock = createFakeClock(7);
    setServices({ clock: fakeClock });
    const services = getServices();
    expect(services.clock).toBe(fakeClock);
    expect(services.rng).toBeDefined();
    expect(services.ticker).toBeDefined();
  });

  it("resetServices() drops the cached singleton", () => {
    const a = getServices();
    resetServices();
    const b = getServices();
    expect(b).not.toBe(a);
  });

  it("resetServices() disposes the previous ticker if present", () => {
    const ticker = createFakeTicker();
    setServices({ ticker, rng: seededRng(1), clock: createFakeClock() });
    resetServices();
    const cb = () => undefined;
    ticker.subscribe(cb);
    expect(ticker.subscriberCount).toBe(0);
  });
});
