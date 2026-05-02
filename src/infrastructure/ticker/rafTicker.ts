import type { TickCallback, Ticker, Unsubscribe } from "./types";

export const createRafTicker = (): Ticker => {
  const subs = new Set<TickCallback>();
  let frameId: number | null = null;
  let lastTs: number | null = null;
  let disposed = false;

  const loop = (ts: number): void => {
    if (disposed) return;
    if (lastTs === null) {
      lastTs = ts;
      frameId = requestAnimationFrame(loop);
      return;
    }
    const delta = ts - lastTs;
    lastTs = ts;

    for (const cb of [...subs]) {
      try {
        cb(delta);
      } catch (e) {
        console.error("[rafTicker] subscriber threw:", e);
      }
    }

    if (subs.size === 0) {
      frameId = null;
      lastTs = null;
      return;
    }
    frameId = requestAnimationFrame(loop);
  };

  const start = (): void => {
    if (disposed) return;
    if (frameId !== null) return;
    lastTs = null;
    frameId = requestAnimationFrame(loop);
  };

  return {
    subscribe(cb: TickCallback): Unsubscribe {
      if (disposed) return () => undefined;
      subs.add(cb);
      if (subs.size === 1) start();
      return () => {
        subs.delete(cb);
      };
    },
    dispose(): void {
      disposed = true;
      subs.clear();
      if (frameId !== null) {
        cancelAnimationFrame(frameId);
        frameId = null;
      }
      lastTs = null;
    },
  };
};
