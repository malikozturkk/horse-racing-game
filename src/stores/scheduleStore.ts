import { defineStore } from "pinia";
import { computed, shallowRef } from "vue";
import type { HorseId, RoundId } from "../domain/shared/types";
import type {
  Round,
  RoundIndex,
  RoundStatus,
  ScheduleGenerationMeta,
} from "../domain/schedule/types";
import { buildSchedule } from "../domain/schedule/factory";
import { HORSES_PER_ROUND, TOTAL_ROUNDS } from "../domain/schedule/constants";
import { getServices } from "../infrastructure/container";
import { useBarnStore } from "./barnStore";

export const useScheduleStore = defineStore("schedule", () => {
  const _rounds = shallowRef<readonly Round[]>([]);
  const _currentRoundIndex = shallowRef<number | null>(null);
  const _meta = shallowRef<ScheduleGenerationMeta | null>(null);
  const rounds = computed<readonly Round[]>(() => _rounds.value);
  const meta = computed(() => _meta.value);
  const currentRoundIndex = computed(() => _currentRoundIndex.value);

  const isGenerated = computed(() => _rounds.value.length > 0);

  const currentRound = computed<Round | null>(() => {
    const idx = _currentRoundIndex.value;
    if (idx === null) return null;
    return _rounds.value[idx] ?? null;
  });

  const nextRound = computed<Round | null>(() => {
    const idx = _currentRoundIndex.value;
    if (idx === null) return _rounds.value[0] ?? null;
    return _rounds.value[idx + 1] ?? null;
  });

  const completedRounds = computed<readonly Round[]>(() =>
    _rounds.value.filter((r) => r.status === "completed")
  );

  const pendingRounds = computed<readonly Round[]>(() =>
    _rounds.value.filter((r) => r.status === "pending")
  );

  const isFullyCompleted = computed(
    () =>
      _rounds.value.length === TOTAL_ROUNDS &&
      _rounds.value.every((r) => r.status === "completed")
  );

  const progressRatio = computed(() => {
    if (_rounds.value.length === 0) return 0;
    return completedRounds.value.length / _rounds.value.length;
  });

  const lineupForRound = (index: number) => {
    const round = _rounds.value[index];
    if (!round) return null;
    const barn = useBarnStore();
    return {
      round,
      horses: barn.getByIds(round.lineup),
    };
  };

  const generateSchedule = (options: {
    seasonId: string;
    seed?: number | null;
    horsesPerRound?: number;
  }): void => {
    const barn = useBarnStore();
    const { rng } = getServices();
    const horseIds = barn.allIds as readonly HorseId[];
    if (horseIds.length === 0) {
      throw new Error("scheduleStore.generateSchedule: barn is empty");
    }
    const result = buildSchedule({
      horseIds,
      rng,
      horsesPerRound: options.horsesPerRound ?? HORSES_PER_ROUND,
      seasonId: options.seasonId,
      seed: options.seed ?? null,
    });
    _rounds.value = result.rounds;
    _meta.value = result.meta;
    _currentRoundIndex.value = 0;
  };

  const setRoundStatus = (roundId: RoundId, status: RoundStatus): void => {
    const idx = _rounds.value.findIndex((r) => r.id === roundId);
    if (idx === -1) return;
    const next: Round[] = _rounds.value.map((r, i) =>
      i === idx ? { ...r, status } : r
    );
    _rounds.value = next;
  };

  const setRoundStatusByIndex = (
    index: RoundIndex,
    status: RoundStatus
  ): void => {
    const target = _rounds.value[index];
    if (!target) return;
    setRoundStatus(target.id, status);
  };

  const advanceCursor = (): void => {
    const idx = _currentRoundIndex.value;
    if (idx === null) return;
    const next = idx + 1;
    _currentRoundIndex.value = next < _rounds.value.length ? next : null;
  };

  const setCursor = (index: number | null): void => {
    if (index === null) {
      _currentRoundIndex.value = null;
      return;
    }
    if (index < 0 || index >= _rounds.value.length) return;
    _currentRoundIndex.value = index;
  };

  const resetSchedule = (): void => {
    _rounds.value = [];
    _meta.value = null;
    _currentRoundIndex.value = null;
  };

  return {
    rounds,
    meta,
    currentRoundIndex,

    isGenerated,
    currentRound,
    nextRound,
    completedRounds,
    pendingRounds,
    isFullyCompleted,
    progressRatio,

    lineupForRound,
    generateSchedule,
    setRoundStatus,
    setRoundStatusByIndex,
    advanceCursor,
    setCursor,
    resetSchedule,
  };
});

export type ScheduleStore = ReturnType<typeof useScheduleStore>;
