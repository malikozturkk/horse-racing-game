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
} from "./constants";

export type {
  InitRuntimeInput,
  InitParticipantInput,
  AdvanceDeps,
} from "./simulationEngine";

export { initRuntime, advance, computeLiveStandings } from "./simulationEngine";
