import type { Rng } from "../domain/shared/rng";
import { defaultRng } from "../domain/shared/rng";
import type { Ticker } from "./ticker";
import { createRafTicker } from "./ticker";
import type { Clock } from "./clock";
import { createSystemClock } from "./clock";

export interface Services {
  rng: Rng;
  ticker: Ticker;
  clock: Clock;
}

let services: Services | null = null;

const buildDefaults = (): Services => ({
  rng: defaultRng(),
  ticker: createRafTicker(),
  clock: createSystemClock(),
});

export const getServices = (): Services => {
  if (services === null) services = buildDefaults();
  return services;
};

export const setServices = (overrides: Partial<Services>): void => {
  const current = services ?? buildDefaults();
  services = { ...current, ...overrides };
};

export const resetServices = (): void => {
  if (services?.ticker) {
    try {
      services.ticker.dispose();
    } catch {}
  }
  services = null;
};
