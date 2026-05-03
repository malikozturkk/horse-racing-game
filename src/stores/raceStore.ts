import { defineStore } from "pinia";
import { computed, shallowRef } from "vue";
import type { HorseId } from "../domain/shared/types";
import type {
  ParticipantRuntime,
  RaceRuntime,
  RaceStatus,
} from "../domain/race/types";
import {
  advance,
  computeLiveStandings,
  initRuntime,
} from "../domain/race/simulationEngine";
import { buildFinishOrder } from "../domain/results/scoringPolicy";
import type { Round } from "../domain/schedule/types";
import { getServices } from "../infrastructure/container";
import type { Unsubscribe } from "../infrastructure/ticker/types";
import { useBarnStore } from "./barnStore";
import { useScheduleStore } from "./scheduleStore";
import { useResultsStore } from "./resultsStore";

export const useRaceStore = defineStore("race", () => {
  const _runtime = shallowRef<RaceRuntime | null>(null);
  const _status = shallowRef<RaceStatus>("idle");
  const _activeRoundIndex = shallowRef<number | null>(null);
  const _error = shallowRef<string | null>(null);
  const _autoAdvance = shallowRef<boolean>(true);

  let unsubscribeTicker: Unsubscribe | null = null;

  const runtime = computed(() => _runtime.value);
  const status = computed(() => _status.value);
  const activeRoundIndex = computed(() => _activeRoundIndex.value);
  const error = computed(() => _error.value);
  const autoAdvance = computed(() => _autoAdvance.value);

  const isLive = computed(() => _status.value === "running");
  const isPaused = computed(() => _status.value === "paused");
  const isArmed = computed(() => _status.value === "arming");
  const isCompleted = computed(() => _status.value === "completed");

  const canStart = computed(
    () => _status.value === "arming" || _status.value === "paused"
  );
  const canPause = computed(() => _status.value === "running");
  const canResume = computed(() => _status.value === "paused");

  const liveStandings = computed<readonly ParticipantRuntime[]>(() => {
    const r = _runtime.value;
    return r ? computeLiveStandings(r) : [];
  });

  const leader = computed<ParticipantRuntime | null>(
    () => liveStandings.value[0] ?? null
  );

  const progressRatio = computed(() => {
    const r = _runtime.value;
    if (!r || r.distance === 0) return 0;
    const p = liveStandings.value[0]?.progressMeters ?? 0;
    return Math.min(1, p / r.distance);
  });

  const isPhotoFinish = computed(() => {
    const r = _runtime.value;
    if (!r) return false;
    const remaining = r.participants
      .filter((p) => p.finishedAt === null)
      .map((p) => r.distance - p.progressMeters);
    if (remaining.length < 2) return false;
    const min = Math.min(...remaining);
    const max = Math.max(...remaining);
    return min < 30 && max - min < 15;
  });

  const detachTicker = (): void => {
    if (unsubscribeTicker) {
      unsubscribeTicker();
      unsubscribeTicker = null;
    }
  };

  const syncBarnConditions = (next: RaceRuntime): void => {
    const updates = new Map<HorseId, number>();
    for (const p of next.participants) {
      updates.set(p.horseId, p.conditionCurrent);
    }
    useBarnStore().setConditions(updates);
  };

  const handleTick = (rawDeltaMs: number): void => {
    if (_status.value !== "running") return;
    const r = _runtime.value;
    if (!r) return;
    const { rng } = getServices();
    const next = advance(r, rawDeltaMs, { rng });
    _runtime.value = next;
    syncBarnConditions(next);
    if (next.isComplete) {
      finishRound();
    }
  };

  const armRound = (roundIndex: number): void => {
    detachTicker();
    const schedule = useScheduleStore();
    const barn = useBarnStore();
    const round: Round | undefined = schedule.rounds[roundIndex];
    if (!round) {
      _error.value = `armRound: no round at index ${roundIndex}`;
      _status.value = "idle";
      _runtime.value = null;
      _activeRoundIndex.value = null;
      return;
    }
    const horses = barn.getByIds(round.lineup);
    if (horses.length !== round.lineup.length) {
      _error.value = `armRound: barn missing horses for round ${roundIndex}`;
      _status.value = "idle";
      _runtime.value = null;
      _activeRoundIndex.value = null;
      return;
    }
    const { clock, rng } = getServices();
    const newRuntime = initRuntime(
      {
        roundId: round.id,
        distance: round.distanceMeters,
        startedAt: clock.now(),
        participants: horses.map((h, i) => ({
          horseId: h.id,
          lane: i,
          conditionAtStart: h.condition,
        })),
      },
      { rng }
    );
    _runtime.value = newRuntime;
    _status.value = "arming";
    _activeRoundIndex.value = roundIndex;
    _error.value = null;
    schedule.setRoundStatus(round.id, "queued");
  };

  const start = (): void => {
    if (_runtime.value === null) return;
    if (_status.value !== "arming" && _status.value !== "paused") return;
    const schedule = useScheduleStore();
    const r = _runtime.value;
    schedule.setRoundStatus(r.roundId, "live");
    _status.value = "running";
    detachTicker();
    unsubscribeTicker = getServices().ticker.subscribe(handleTick);
  };

  const pause = (): void => {
    if (_status.value !== "running") return;
    _status.value = "paused";
    detachTicker();
  };

  const resume = (): void => {
    if (_status.value !== "paused" || _runtime.value === null) return;
    _status.value = "running";
    detachTicker();
    unsubscribeTicker = getServices().ticker.subscribe(handleTick);
  };

  const finishRound = (): void => {
    const r = _runtime.value;
    if (!r) return;
    if (
      _status.value !== "running" &&
      _status.value !== "finishing" &&
      _status.value !== "paused"
    ) {
      return;
    }
    detachTicker();
    _status.value = "finishing";

    const schedule = useScheduleStore();
    const results = useResultsStore();
    const round = schedule.rounds.find((rd) => rd.id === r.roundId);

    const progressByHorseId = new Map<HorseId, number>();
    const finishTimes = new Map<HorseId, number>();
    for (const p of r.participants) {
      progressByHorseId.set(p.horseId, p.progressMeters);
      if (p.finishedAt !== null) finishTimes.set(p.horseId, p.finishedAt);
    }

    const finishOrder = buildFinishOrder({
      finishedOrder: r.finishedOrder,
      finishTimes,
      progressByHorseId,
      distance: r.distance,
      totalParticipants: r.participants.length,
      policy: results.policy,
    });

    if (round) {
      results.commitRoundResult({
        roundId: round.id,
        roundIndex: round.index,
        distance: round.distanceMeters,
        completedAt: getServices().clock.now(),
        finishOrder,
      });
      schedule.setRoundStatus(round.id, "completed");
    }

    schedule.advanceCursor();

    _status.value = "completed";

    if (_autoAdvance.value) {
      const nextIdx = schedule.currentRoundIndex;
      if (nextIdx !== null) {
        armRound(nextIdx);
        start();
      }
    }
  };

  const abort = (): void => {
    detachTicker();
    _status.value = "idle";
    _runtime.value = null;
    _activeRoundIndex.value = null;
  };

  const setAutoAdvance = (value: boolean): void => {
    _autoAdvance.value = value;
  };

  const reset = (): void => {
    detachTicker();
    _runtime.value = null;
    _status.value = "idle";
    _activeRoundIndex.value = null;
    _error.value = null;
  };

  const dispose = (): void => {
    detachTicker();
  };

  return {
    runtime,
    status,
    activeRoundIndex,
    error,
    autoAdvance,

    isLive,
    isPaused,
    isArmed,
    isCompleted,
    canStart,
    canPause,
    canResume,
    liveStandings,
    leader,
    progressRatio,
    isPhotoFinish,

    armRound,
    start,
    pause,
    resume,
    finishRound,
    abort,
    setAutoAdvance,
    reset,
    dispose,
  };
});

export type RaceStore = ReturnType<typeof useRaceStore>;
