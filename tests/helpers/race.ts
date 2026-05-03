import type { TestServices } from "./services";

export interface RunRaceOptions {
  readonly stepMs?: number;
  readonly maxSimMs?: number;
}

export const runUntil = (
  services: TestServices,
  predicate: () => boolean,
  options: RunRaceOptions = {}
): number => {
  const stepMs = options.stepMs ?? 16;
  const maxSimMs = options.maxSimMs ?? 60_000;
  let elapsed = 0;
  while (!predicate() && elapsed < maxSimMs) {
    services.ticker.tick(stepMs);
    services.clock.advance(stepMs);
    elapsed += stepMs;
  }
  return elapsed;
};
