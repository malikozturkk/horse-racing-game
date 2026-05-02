import type { Clock } from "./types";

export interface FakeClock extends Clock {
  set(value: number): void;
  advance(ms: number): void;
}

export const createFakeClock = (initial = 0): FakeClock => {
  let t = initial;
  return {
    now: () => t,
    set: (value: number) => {
      t = value;
    },
    advance: (ms: number) => {
      t += ms;
    },
  };
};
