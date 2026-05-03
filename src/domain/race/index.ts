export type {
  RaceStatus,
  ParticipantRuntime,
  RaceRuntime,
  RaceTickInput,
} from "./types";

export {
  RACE_SPEED_BASE_MPS,
  RACE_SPEED_FROM_CONDITION_MPS,
  RACE_JITTER_MPS,
  RACE_MOMENTUM,
  RACE_TIME_SCALE,
  RACE_MAX_DELTA_MS,
  RACE_CONDITION_DECAY_MIN_PER_METER,
  RACE_CONDITION_DECAY_MAX_PER_METER,
  RACE_CONDITION_DECAY_TICK_JITTER,
} from "./constants";

export type {
  InitRuntimeInput,
  InitParticipantInput,
  InitRuntimeDeps,
  AdvanceDeps,
} from "./simulationEngine";

export { initRuntime, advance, computeLiveStandings } from "./simulationEngine";

export type {
  TickConditionDecayInput,
  TickConditionDecayDeps,
} from "./conditionDecay";

export { sampleDecayPerMeter, tickConditionDecay } from "./conditionDecay";
