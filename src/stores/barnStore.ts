import { defineStore } from "pinia";
import { computed, readonly, shallowRef } from "vue";
import type { Horse } from "../domain/horse/types";
import { clampCondition } from "../domain/horse/types";
import { createBarn } from "../domain/horse/factory";
import { BARN_SIZE } from "../domain/horse/constants";
import type { HorseId } from "../domain/shared/types";
import { getServices } from "../infrastructure/container";

export const useBarnStore = defineStore("barn", () => {
  const byId = shallowRef<Readonly<Record<HorseId, Horse>>>({});
  const allIds = shallowRef<readonly HorseId[]>([]);
  const _entrants = shallowRef<readonly HorseId[]>([]);

  const indexHorses = (
    horses: readonly Horse[]
  ): {
    byId: Record<HorseId, Horse>;
    ids: HorseId[];
  } => {
    const map: Record<HorseId, Horse> = {} as Record<HorseId, Horse>;
    const ids: HorseId[] = [];
    for (const h of horses) {
      map[h.id] = h;
      ids.push(h.id);
    }
    return { byId: map, ids };
  };

  const allHorses = computed<readonly Horse[]>(() =>
    allIds.value.map((id) => byId.value[id]).filter((h): h is Horse => !!h)
  );

  const horseCount = computed(() => allIds.value.length);

  const isPopulated = computed(() => allIds.value.length > 0);

  const getById = (id: HorseId): Horse | undefined => byId.value[id];

  const getByIds = (ids: readonly HorseId[]): Horse[] => {
    const out: Horse[] = [];
    for (const id of ids) {
      const h = byId.value[id];
      if (h) out.push(h);
    }
    return out;
  };

  const snapshot = (): readonly Horse[] =>
    Object.freeze(
      allIds.value.map((id) => byId.value[id]).filter((h): h is Horse => !!h)
    );

  const generateBarn = (size: number = BARN_SIZE): void => {
    const { rng } = getServices();
    const fresh = createBarn({ size, rng });
    const indexed = indexHorses(fresh);
    byId.value = indexed.byId;
    allIds.value = indexed.ids;
    _entrants.value = [];
  };

  const replaceBarn = (horses: readonly Horse[]): void => {
    const indexed = indexHorses(horses);
    byId.value = indexed.byId;
    allIds.value = indexed.ids;
    _entrants.value = [];
  };

  const resetBarn = (): void => generateBarn();

  const applyConditionDelta = (id: HorseId, delta: number): void => {
    const horse = byId.value[id];
    if (!horse) return;
    const next: Horse = {
      ...horse,
      condition: clampCondition(horse.condition + delta),
    };
    byId.value = { ...byId.value, [id]: next };
  };

  const setCondition = (id: HorseId, condition: number): void => {
    const horse = byId.value[id];
    if (!horse) return;
    byId.value = {
      ...byId.value,
      [id]: { ...horse, condition: clampCondition(condition) },
    };
  };

  const applyConditionDeltas = (deltas: ReadonlyMap<HorseId, number>): void => {
    if (deltas.size === 0) return;
    const next: Record<HorseId, Horse> = { ...byId.value };
    for (const [id, delta] of deltas) {
      const horse = next[id];
      if (!horse) continue;
      next[id] = {
        ...horse,
        condition: clampCondition(horse.condition + delta),
      };
    }
    byId.value = next;
  };

  const recoverHorse = (horseId: HorseId): void => setCondition(horseId, 100);

  return {
    byId: readonly(byId),
    allIds: readonly(allIds),

    allHorses,
    horseCount,
    isPopulated,

    getById,
    getByIds,
    snapshot,

    generateBarn,
    replaceBarn,
    resetBarn,
    setCondition,
    applyConditionDelta,
    applyConditionDeltas,
    recoverHorse,
  };
});

export type BarnStore = ReturnType<typeof useBarnStore>;
