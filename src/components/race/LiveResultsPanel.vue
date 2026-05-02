<script setup lang="ts">
import { computed, ref, watch } from "vue";
import type { Horse } from "../../domain/horse/types";
import type { HorseId } from "../../domain/shared/types";
import type { Round } from "../../domain/schedule/types";
import type { ParticipantRuntime } from "../../domain/race/types";
import type { RoundResult } from "../../domain/results/types";
import Panel from "../ui/Panel.vue";
import Badge from "../ui/Badge.vue";
import ResultRow from "./ResultRow.vue";

interface Props {
  rounds: readonly Round[];
  horsesById: Readonly<Record<HorseId, Horse>>;
  liveRoundIndex: number | null;
  liveStandings: readonly ParticipantRuntime[];
  liveDistance: number;
  results: readonly RoundResult[];
  isLive: boolean;
  isPhotoFinish: boolean;
}

const props = defineProps<Props>();

const completedIndices = computed<readonly number[]>(() =>
  props.results
    .map((r) => r.roundIndex)
    .slice()
    .sort((a, b) => a - b)
);

const tabValues = computed<readonly number[]>(() => {
  const live = props.liveRoundIndex;
  const completed = completedIndices.value;
  const all = new Set<number>(completed);
  if (live !== null) all.add(live);
  return Array.from(all).sort((a, b) => a - b);
});

const selectedTab = ref<number | null>(null);

watch(
  () => [props.liveRoundIndex, props.results.length] as const,
  () => {
    if (props.liveRoundIndex !== null) {
      selectedTab.value = props.liveRoundIndex;
    } else if (props.results.length > 0) {
      const last = props.results[props.results.length - 1];
      if (last) selectedTab.value = last.roundIndex;
    } else {
      selectedTab.value = null;
    }
  },
  { immediate: true }
);

const isLiveTab = computed(
  () => selectedTab.value !== null && selectedTab.value === props.liveRoundIndex
);

const selectedRound = computed<Round | null>(() => {
  if (selectedTab.value === null) return null;
  return props.rounds.find((r) => r.index === selectedTab.value) ?? null;
});

const selectedRoundResult = computed<RoundResult | null>(() => {
  if (selectedTab.value === null) return null;
  return props.results.find((r) => r.roundIndex === selectedTab.value) ?? null;
});

interface RowVm {
  rank: number;
  horse: Horse;
  trailing: string;
}

const fmtMeters = (n: number): string => {
  const v = Math.round(Math.abs(n));
  return `+${v}m`;
};

const fmtDuration = (ms: number): string => {
  const totalSec = ms / 1000;
  const m = Math.floor(totalSec / 60);
  const s = totalSec - m * 60;
  return `${m}:${s.toFixed(3).padStart(6, "0")}`;
};

const liveRows = computed<readonly RowVm[]>(() => {
  if (!isLiveTab.value) return [];
  const sorted = [...props.liveStandings];
  const leader = sorted[0];
  const leaderProgress = leader?.progressMeters ?? 0;
  const out: RowVm[] = [];
  let idx = 0;
  for (const p of sorted) {
    const horse = props.horsesById[p.horseId];
    if (!horse) continue;
    idx += 1;
    const gap = leaderProgress - p.progressMeters;
    out.push({
      rank: idx,
      horse,
      trailing: idx === 1 ? "+0m" : fmtMeters(gap),
    });
  }
  return out;
});

const completedRows = computed<readonly RowVm[]>(() => {
  if (isLiveTab.value) return [];
  const result = selectedRoundResult.value;
  if (!result) return [];
  const out: RowVm[] = [];
  for (const entry of result.finishOrder) {
    const horse = props.horsesById[entry.horseId];
    if (!horse) continue;
    const trailing =
      entry.gapToLeaderMeters === 0
        ? fmtDuration(entry.finishTimeMs)
        : fmtMeters(entry.gapToLeaderMeters);
    out.push({ rank: entry.rank, horse, trailing });
  }
  return out;
});

const rows = computed(() =>
  isLiveTab.value ? liveRows.value : completedRows.value
);

const headerLabel = computed(() => {
  const r = selectedRound.value;
  if (!r) return "";
  return `R${r.index + 1} — ${r.name}`;
});

const headerRight = computed(() => {
  if (isLiveTab.value) return "CANLI SIRALAMA";
  return "BİTİŞ SIRASI";
});

const tabLabel = (n: number): string => `R${n + 1}`;
const isTabLive = (n: number): boolean => n === props.liveRoundIndex;

const handleTabClick = (n: number) => {
  selectedTab.value = n;
};

const panelStatus = computed<{
  label: string;
  variant: "danger" | "warning" | "success" | "info";
  pulse: boolean;
  dot: boolean;
}>(() => {
  if (props.isPhotoFinish) {
    return {
      label: "FOTO FİNİŞ",
      variant: "warning",
      pulse: false,
      dot: true,
    };
  }
  if (props.isLive) {
    return { label: "CANLI", variant: "danger", pulse: true, dot: true };
  }
  return { label: "ROUND BİTTİ", variant: "success", pulse: false, dot: true };
});
</script>

<template>
  <Panel tone="gold" class="lrp">
    <template #title>
      <span>🏆 Sonuçlar</span>
    </template>
    <template #actions>
      <Badge
        :variant="panelStatus.variant"
        :dot="panelStatus.dot"
        :pulse="panelStatus.pulse"
        size="sm"
      >
        {{ panelStatus.label }}
      </Badge>
    </template>

    <div class="lrp__body">
      <nav
        v-if="tabValues.length > 0"
        class="lrp__tabs"
        aria-label="Round seçici"
      >
        <button
          v-for="n in tabValues"
          :key="n"
          type="button"
          class="lrp__tab"
          :class="{
            'lrp__tab--active': selectedTab === n,
            'lrp__tab--live': isTabLive(n),
          }"
          @click="handleTabClick(n)"
        >
          {{ tabLabel(n) }}
          <span v-if="isTabLive(n)" class="lrp__tab-dot" aria-hidden="true" />
        </button>
      </nav>

      <header class="lrp__header" v-if="selectedRound">
        <span class="lrp__title">{{ headerLabel }}</span>
        <span class="lrp__sub mono">{{ headerRight }}</span>
      </header>

      <ol v-if="rows.length > 0" class="lrp__list" role="list">
        <ResultRow
          v-for="row in rows"
          :key="row.horse.id"
          :rank="row.rank"
          :horse="row.horse"
          :trailing="row.trailing"
        />
      </ol>

      <p v-else class="lrp__empty">Henüz sıralama yok.</p>
    </div>
  </Panel>
</template>

<style scoped>
.lrp {
  height: 100%;
}

.lrp :deep(.panel__body) {
  padding: 0;
  display: flex;
  flex-direction: column;
}

.lrp__body {
  display: flex;
  flex-direction: column;
  min-height: 0;
  flex: 1 1 auto;
}

.lrp__tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  padding: 0.55rem 0.75rem 0.45rem;
  background: var(--color-bg);
  border-bottom: 1px solid var(--color-line);
}

.lrp__tab {
  position: relative;
  appearance: none;
  background: transparent;
  border: 1px solid var(--color-line);
  border-radius: 9999px;
  padding: 0.2rem 0.6rem;
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 800;
  color: color-mix(in srgb, var(--color-ink) 60%, white);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  transition: all 160ms ease;
}

.lrp__tab:hover {
  background: color-mix(in srgb, var(--color-ink) 5%, white);
}

.lrp__tab--active {
  background: var(--color-ink);
  color: #fff;
  border-color: var(--color-ink);
}

.lrp__tab--live.lrp__tab--active {
  background: var(--color-finish);
  border-color: var(--color-finish);
}

.lrp__tab-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 9999px;
  background: var(--color-finish);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--color-finish) 25%, transparent);
}

.lrp__tab--active.lrp__tab--live .lrp__tab-dot {
  background: #fff;
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.3);
}

.lrp__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.7rem 0.85rem 0.55rem;
}

.lrp__title {
  font-family: var(--font-display);
  font-size: 14px;
  font-weight: 700;
  color: var(--color-ink);
}

.lrp__sub {
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.08em;
  color: color-mix(in srgb, var(--color-ink) 55%, white);
}

.lrp__list {
  flex: 1 1 auto;
  margin: 0;
  padding: 0;
  list-style: none;
  overflow-y: auto;
  scrollbar-width: thin;
  border-top: 1px solid color-mix(in srgb, var(--color-line) 60%, white);
}

.lrp__empty {
  padding: 1.25rem 0.85rem;
  font-size: 13px;
  text-align: center;
  color: color-mix(in srgb, var(--color-ink) 55%, white);
}
</style>
