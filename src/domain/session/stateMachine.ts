import type { Result } from "../shared/types";
import { domainError, err, ok } from "../shared/types";
import type { GamePhase } from "./types";

const TRANSITIONS: Readonly<Record<GamePhase, readonly GamePhase[]>> = {
  idle: ["scheduled"],
  scheduled: ["racing", "idle"],
  racing: ["paused", "scheduled", "racing", "seasonFinished", "idle"],
  paused: ["racing", "idle"],
  seasonFinished: ["idle", "scheduled"],
};

export const canTransition = (from: GamePhase, to: GamePhase): boolean => {
  if (from === to) return false;
  const allowed = TRANSITIONS[from];
  return allowed.includes(to);
};

export const assertCanTransition = (
  from: GamePhase,
  to: GamePhase
): Result<true, ReturnType<typeof domainError>> => {
  if (canTransition(from, to)) return ok(true);
  return err(
    domainError(
      "session/illegal-transition",
      `Illegal phase transition: ${from} → ${to}`
    )
  );
};
