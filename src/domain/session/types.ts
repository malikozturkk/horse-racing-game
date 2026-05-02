export type GamePhase =
  | "idle"
  | "scheduled"
  | "racing"
  | "paused"
  | "seasonFinished";

export interface TransitionRequest {
  readonly to: GamePhase;
  readonly reason?: string;
}
