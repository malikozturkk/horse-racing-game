import type { TickCallback, Ticker, Unsubscribe } from "./types";

export interface FakeTicker extends Ticker {
  tick(deltaMs: number): void;
  advance(totalMs: number, step?: number): void;
  readonly subscriberCount: number;
}

export const createFakeTicker = (): FakeTicker => {
  const subs = new Set<TickCallback>();
  let disposed = false;

  return {
    subscribe(cb: TickCallback): Unsubscribe {
      if (disposed) return () => undefined;
      subs.add(cb);
      return () => {
        subs.delete(cb);
      };
    },
    tick(deltaMs: number): void {
      if (disposed) return;
      for (const cb of [...subs]) cb(deltaMs);
    },
    advance(totalMs: number, step = 16): void {
      if (disposed) return;
      let remaining = totalMs;
      while (remaining > 0) {
        const slice = Math.min(step, remaining);
        for (const cb of [...subs]) cb(slice);
        remaining -= slice;
      }
    },
    dispose(): void {
      disposed = true;
      subs.clear();
    },
    get subscriberCount(): number {
      return subs.size;
    },
  };
};
