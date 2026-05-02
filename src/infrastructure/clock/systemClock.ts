import type { Clock } from "./types";

export const createSystemClock = (): Clock => ({
  now: () => Date.now(),
});
