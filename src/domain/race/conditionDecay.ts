import type { Rng } from "../shared/rng";
import { MIN_CONDITION } from "../horse/types";
import {
  RACE_CONDITION_DECAY_MAX_PER_METER,
  RACE_CONDITION_DECAY_MIN_PER_METER,
  RACE_CONDITION_DECAY_TICK_JITTER,
} from "./constants";

export const sampleDecayPerMeter = (rng: Rng): number =>
  rng.float(
    RACE_CONDITION_DECAY_MIN_PER_METER,
    RACE_CONDITION_DECAY_MAX_PER_METER
  );

export interface TickConditionDecayInput {
  readonly current: number;
  readonly decayPerMeter: number;
  readonly metersTraveled: number;
}

export interface TickConditionDecayDeps {
  readonly rng: Rng;
}

export const tickConditionDecay = (
  input: TickConditionDecayInput,
  deps: TickConditionDecayDeps
): number => {
  if (input.metersTraveled <= 0) return input.current;
  const jitter = deps.rng.float(
    1 - RACE_CONDITION_DECAY_TICK_JITTER,
    1 + RACE_CONDITION_DECAY_TICK_JITTER
  );
  const next =
    input.current - input.decayPerMeter * input.metersTraveled * jitter;
  return Math.max(MIN_CONDITION, next);
};
