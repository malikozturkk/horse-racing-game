import { defineStore } from "pinia";
import { computed, shallowRef } from "vue";
import type { HorseId, RoundId } from "../domain/shared/types";
import type { RoundResult, Standing } from "../domain/results/types";
import {
  computeStandings,
  defaultScoringPolicy,
} from "../domain/results/scoringPolicy";
import type { ScoringPolicy } from "../domain/results/scoringPolicy";

export const useResultsStore = defineStore("results", () => {
  const _byRoundId = shallowRef<Readonly<Record<RoundId, RoundResult>>>({});
  const _orderedRoundIds = shallowRef<readonly RoundId[]>([]);
  const _standings = shallowRef<readonly Standing[]>([]);
  const _policy = shallowRef<ScoringPolicy>(defaultScoringPolicy);

  const orderedRoundIds = computed(() => _orderedRoundIds.value);
  const policy = computed(() => _policy.value);

  const orderedResults = computed<readonly RoundResult[]>(() =>
    _orderedRoundIds.value
      .map((id) => _byRoundId.value[id])
      .filter((r): r is RoundResult => !!r)
  );

  const latestResult = computed<RoundResult | null>(() => {
    const last = _orderedRoundIds.value[_orderedRoundIds.value.length - 1];
    if (!last) return null;
    return _byRoundId.value[last] ?? null;
  });

  const standings = computed(() => _standings.value);

  const seasonChampion = computed<Standing | null>(
    () => _standings.value[0] ?? null
  );

  const hasAnyResult = computed(() => _orderedRoundIds.value.length > 0);

  const getRoundResult = (id: RoundId): RoundResult | undefined =>
    _byRoundId.value[id];

  const topN = (n: number): readonly Standing[] =>
    _standings.value.slice(0, Math.max(0, n));

  const rankOfHorse = (horseId: HorseId): number => {
    const idx = _standings.value.findIndex((s) => s.horseId === horseId);
    return idx === -1 ? -1 : idx + 1;
  };

  const setScoringPolicy = (next: ScoringPolicy): void => {
    _policy.value = next;
    _standings.value = computeStandings(orderedResults.value);
  };

  const commitRoundResult = (result: RoundResult): boolean => {
    if (_byRoundId.value[result.roundId]) return false;
    _byRoundId.value = { ..._byRoundId.value, [result.roundId]: result };
    _orderedRoundIds.value = [..._orderedRoundIds.value, result.roundId];
    _standings.value = computeStandings(orderedResults.value);
    return true;
  };

  const clearResults = (): void => {
    _byRoundId.value = {};
    _orderedRoundIds.value = [];
    _standings.value = [];
  };

  const exportSnapshot = (): {
    readonly rounds: readonly RoundResult[];
    readonly standings: readonly Standing[];
    readonly policyId: string;
  } => ({
    rounds: orderedResults.value,
    standings: _standings.value,
    policyId: _policy.value.id,
  });

  return {
    orderedRoundIds,
    orderedResults,
    latestResult,
    standings,
    seasonChampion,
    hasAnyResult,
    policy,

    getRoundResult,
    topN,
    rankOfHorse,
    commitRoundResult,
    setScoringPolicy,
    clearResults,
    exportSnapshot,
  };
});

export type ResultsStore = ReturnType<typeof useResultsStore>;
