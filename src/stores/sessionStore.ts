import { defineStore } from "pinia";
import { computed, shallowRef } from "vue";
import type { GamePhase } from "../domain/session/types";
import { assertCanTransition } from "../domain/session/stateMachine";
import type { Result, DomainError, SeasonId } from "../domain/shared/types";
import { asSeasonId, ok, err, domainError } from "../domain/shared/types";
import { getServices } from "../infrastructure/container";
import { useBarnStore } from "./barnStore";
import { useScheduleStore } from "./scheduleStore";
import { useRaceStore } from "./raceStore";
import { useResultsStore } from "./resultsStore";

export const useSessionStore = defineStore("session", () => {
  const _phase = shallowRef<GamePhase>("idle");
  const _seasonId = shallowRef<SeasonId | null>(null);
  const _seasonNumber = shallowRef<number>(0);
  const _seed = shallowRef<number | null>(null);
  const _createdAt = shallowRef<number>(0);
  const _lastError = shallowRef<DomainError | null>(null);

  const phase = computed(() => _phase.value);
  const seasonId = computed(() => _seasonId.value);
  const seasonNumber = computed(() => _seasonNumber.value);
  const seed = computed(() => _seed.value);
  const createdAt = computed(() => _createdAt.value);
  const lastError = computed(() => _lastError.value);

  const canGenerateSchedule = computed(
    () => _phase.value === "idle" || _phase.value === "seasonFinished"
  );
  const canStartRace = computed(() => _phase.value === "scheduled");
  const canPauseRace = computed(() => _phase.value === "racing");
  const canResumeRace = computed(() => _phase.value === "paused");
  const isSeasonOver = computed(() => _phase.value === "seasonFinished");

  const statusLabel = computed<string>(() => {
    switch (_phase.value) {
      case "idle":
        return "Hazır";
      case "scheduled":
        return "Program Hazır";
      case "racing":
        return "Yarış Sürüyor";
      case "paused":
        return "Duraklatıldı";
      case "seasonFinished":
        return "Yarışma Bitti";
    }
  });

  const transitionTo = (
    next: GamePhase,
    reason?: string
  ): Result<true, DomainError> => {
    const guard = assertCanTransition(_phase.value, next);
    if (!guard.ok) {
      _lastError.value = guard.error;
      return guard;
    }
    _phase.value = next;
    void reason;
    return ok(true);
  };

  const generateSeasonId = (): SeasonId => {
    const n = _seasonNumber.value + 1;
    return asSeasonId(`season-${n}-${getServices().clock.now()}`);
  };

  const bootstrapSession = (options?: { seed?: number | null }): void => {
    const barn = useBarnStore();
    const schedule = useScheduleStore();
    const race = useRaceStore();
    const results = useResultsStore();

    race.reset();
    schedule.resetSchedule();
    results.clearResults();
    barn.generateBarn();

    _seed.value = options?.seed ?? null;
    _seasonNumber.value = 0;
    _seasonId.value = null;
    _createdAt.value = getServices().clock.now();
    _lastError.value = null;
    _phase.value = "idle";
  };

  const generateSchedule = (): Result<true, DomainError> => {
    if (!canGenerateSchedule.value) {
      const e = domainError(
        "session/cannot-generate-schedule",
        `Cannot generate schedule from phase=${_phase.value}`
      );
      _lastError.value = e;
      return err(e);
    }
    const barn = useBarnStore();
    const schedule = useScheduleStore();
    const race = useRaceStore();
    const results = useResultsStore();

    if (!barn.isPopulated) barn.generateBarn();
    race.reset();
    if (_phase.value === "seasonFinished") {
      results.clearResults();
    }

    _seasonNumber.value += 1;
    _seasonId.value = generateSeasonId();
    schedule.generateSchedule({
      seasonId: _seasonId.value,
      seed: _seed.value,
    });

    return transitionTo("scheduled", "schedule-generated");
  };

  const startRace = (): Result<true, DomainError> => {
    if (!canStartRace.value) {
      const e = domainError(
        "session/cannot-start",
        `Cannot start race from phase=${_phase.value}`
      );
      _lastError.value = e;
      return err(e);
    }
    const schedule = useScheduleStore();
    const race = useRaceStore();
    const idx = schedule.currentRoundIndex ?? 0;
    race.armRound(idx);
    race.start();
    return transitionTo("racing", "race-started");
  };

  const pauseRace = (): Result<true, DomainError> => {
    if (!canPauseRace.value) {
      const e = domainError(
        "session/cannot-pause",
        `Cannot pause from phase=${_phase.value}`
      );
      _lastError.value = e;
      return err(e);
    }
    useRaceStore().pause();
    return transitionTo("paused", "race-paused");
  };

  const resumeRace = (): Result<true, DomainError> => {
    if (!canResumeRace.value) {
      const e = domainError(
        "session/cannot-resume",
        `Cannot resume from phase=${_phase.value}`
      );
      _lastError.value = e;
      return err(e);
    }
    useRaceStore().resume();
    return transitionTo("racing", "race-resumed");
  };

  const onRoundFinished = (): Result<true, DomainError> => {
    const schedule = useScheduleStore();
    if (schedule.isFullyCompleted) {
      return transitionTo("seasonFinished", "season-completed");
    }
    return transitionTo("scheduled", "round-completed");
  };

  const stopRace = (): Result<true, DomainError> => {
    const race = useRaceStore();
    race.abort();
    if (_phase.value === "racing" || _phase.value === "paused") {
      return transitionTo("scheduled", "race-stopped");
    }
    return ok(true);
  };

  const startNewSeason = (): Result<true, DomainError> => {
    if (_phase.value !== "seasonFinished") {
      const e = domainError(
        "session/cannot-start-new-season",
        `Cannot start new season from phase=${_phase.value}`
      );
      _lastError.value = e;
      return err(e);
    }
    return generateSchedule();
  };

  const resetSession = (): void => {
    bootstrapSession({ seed: _seed.value });
  };

  return {
    phase,
    seasonId,
    seasonNumber,
    seed,
    createdAt,
    lastError,

    canGenerateSchedule,
    canStartRace,
    canPauseRace,
    canResumeRace,
    isSeasonOver,
    statusLabel,

    bootstrapSession,
    generateSchedule,
    startRace,
    pauseRace,
    resumeRace,
    stopRace,
    onRoundFinished,
    startNewSeason,
    resetSession,
  };
});

export type SessionStore = ReturnType<typeof useSessionStore>;
