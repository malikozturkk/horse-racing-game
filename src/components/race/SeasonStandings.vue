<script setup lang="ts">
import { computed } from "vue";
import type { Horse } from "../../domain/horse/types";
import type { HorseId } from "../../domain/shared/types";
import type { Standing } from "../../domain/results/types";
import Panel from "../ui/Panel.vue";
import ResultRow from "./ResultRow.vue";

interface Props {
  standings: readonly Standing[];
  horsesById: Readonly<Record<HorseId, Horse>>;
  limit?: number;
}

const props = withDefaults(defineProps<Props>(), { limit: 6 });

interface RowVm {
  rank: number;
  horse: Horse;
  trailing: string;
  points: number;
  highlighted: boolean;
}

const rows = computed<readonly RowVm[]>(() => {
  const out: RowVm[] = [];
  const top = props.standings.slice(0, props.limit);
  let rank = 0;
  for (const s of top) {
    rank += 1;
    const horse = props.horsesById[s.horseId];
    if (!horse) continue;
    out.push({
      rank,
      horse,
      trailing: `${s.wins} birincilik`,
      points: s.totalPoints,
      highlighted: rank === 1,
    });
  }
  return out;
});
</script>

<template>
  <Panel tone="default" class="standings">
    <template #title>
      <span class="standings__title">Genel Sıralama</span>
    </template>

    <ol v-if="rows.length > 0" class="standings__list" role="list">
      <ResultRow
        v-for="row in rows"
        :key="row.horse.id"
        :rank="row.rank"
        :horse="row.horse"
        :trailing="row.trailing"
      >
        <template #trailing>
          <span class="standings__points mono">
            <strong>{{ row.points }}</strong>
            <span>PT</span>
          </span>
        </template>
      </ResultRow>
    </ol>

    <p v-else class="standings__empty">Henüz sıralama yok.</p>
  </Panel>
</template>

<style scoped>
.standings {
  height: 100%;
  padding: 1rem;
  border: 2px solid var(--line);
}

.standings :deep(.panel__body) {
  padding: 0;
}

.standings__title {
  font-size: 20px;
  font-weight: 900;
}

.standings__list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.standings__points {
  display: inline-flex;
  align-items: baseline;
  gap: 0.25rem;
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.05em;
  color: color-mix(in srgb, var(--color-ink) 65%, white);
  text-transform: uppercase;
  padding-right: 0.25rem;
}

.standings__points strong {
  font-size: 18px;
  font-weight: 800;
  color: var(--color-ink);
  font-variant-numeric: tabular-nums;
}

.standings__empty {
  padding: 1rem;
  text-align: center;
  color: color-mix(in srgb, var(--color-ink) 55%, white);
}
</style>
