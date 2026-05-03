import { describe, expect, it, vi } from "vitest";
import { createFakeTicker } from "../../../src/infrastructure/ticker/fakeTicker";

describe("infrastructure/ticker/fakeTicker", () => {
  it("invokes subscribers with the correct delta on tick()", () => {
    const ticker = createFakeTicker();
    const cb = vi.fn();
    ticker.subscribe(cb);
    ticker.tick(16);
    expect(cb).toHaveBeenCalledWith(16);
  });

  it("supports multiple subscribers", () => {
    const ticker = createFakeTicker();
    const a = vi.fn();
    const b = vi.fn();
    ticker.subscribe(a);
    ticker.subscribe(b);
    ticker.tick(20);
    expect(a).toHaveBeenCalledWith(20);
    expect(b).toHaveBeenCalledWith(20);
    expect(ticker.subscriberCount).toBe(2);
  });

  it("unsubscribes via the returned cleanup", () => {
    const ticker = createFakeTicker();
    const cb = vi.fn();
    const off = ticker.subscribe(cb);
    off();
    ticker.tick(16);
    expect(cb).not.toHaveBeenCalled();
    expect(ticker.subscriberCount).toBe(0);
  });

  it("advance() splits the budget into discrete steps", () => {
    const ticker = createFakeTicker();
    const cb = vi.fn();
    ticker.subscribe(cb);
    ticker.advance(100, 25);
    expect(cb).toHaveBeenCalledTimes(4);
    for (const call of cb.mock.calls) {
      expect(call[0]).toBe(25);
    }
  });

  it("dispose() prevents further ticks", () => {
    const ticker = createFakeTicker();
    const cb = vi.fn();
    ticker.subscribe(cb);
    ticker.dispose();
    ticker.tick(16);
    ticker.advance(100);
    expect(cb).not.toHaveBeenCalled();
    expect(ticker.subscriberCount).toBe(0);
  });

  it("subscribe() after dispose is a no-op", () => {
    const ticker = createFakeTicker();
    ticker.dispose();
    const cb = vi.fn();
    const off = ticker.subscribe(cb);
    expect(typeof off).toBe("function");
    expect(ticker.subscriberCount).toBe(0);
  });
});
