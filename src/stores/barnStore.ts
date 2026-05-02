import { defineStore } from "pinia";
import { shallowRef, computed, readonly } from "vue";
import type { Horse } from "../domain/horse/types";
import {
  createBarn,
  pickRaceEntrants,
  tickCondition,
} from "../domain/horse/factory";
import { RACE_SIZE } from "../domain/horse/constants";

export const useBarnStore = defineStore("barn", () => {
  const _barn = shallowRef<Horse[]>(createBarn());
  const _entrants = shallowRef<Horse[]>([]);

  const allHorses = computed(() => readonly(_barn.value));
  const raceEntrants = computed(() => readonly(_entrants.value));
  const hasLineup = computed(() => _entrants.value.length > 0);

  function resetBarn(): void {
    _barn.value = createBarn();
    _entrants.value = [];
  }

  function drawLineup(count: number = RACE_SIZE): void {
    _entrants.value = pickRaceEntrants(_barn.value, count);
  }

  function tickBarnConditions(maxDecay = 1.4): void {
    _barn.value = _barn.value.map((horse) => ({
      ...horse,
      condition: tickCondition(horse.condition, Math.random() * maxDecay),
    }));

    if (_entrants.value.length > 0) {
      const barnById = new Map(_barn.value.map((h) => [h.id, h]));
      _entrants.value = _entrants.value.map((e) => barnById.get(e.id) ?? e);
    }
  }

  function recoverHorse(horseId: number): void {
    _barn.value = _barn.value.map((h) =>
      h.id === horseId ? { ...h, condition: 100 } : h
    );
  }

  return {
    allHorses,
    raceEntrants,
    hasLineup,

    resetBarn,
    drawLineup,
    tickBarnConditions,
    recoverHorse,
  };
});
