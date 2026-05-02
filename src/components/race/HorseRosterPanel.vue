<script setup lang="ts">
import { computed } from "vue";
import type { Horse } from "../../domain/horse/types";
import type { HorseId } from "../../domain/shared/types";
import Panel from "../ui/Panel.vue";
import Badge from "../ui/Badge.vue";
import HorseRosterRow from "./HorseRosterRow.vue";

interface Props {
  horses: readonly Horse[];
  highlightedIds?: readonly HorseId[];
  title?: string;
}

const props = withDefaults(defineProps<Props>(), {
  highlightedIds: () => [],
  title: undefined,
});

const highlightedSet = computed<ReadonlySet<HorseId>>(
  () => new Set(props.highlightedIds)
);

const titleText = computed(() => {
  if (props.title) return props.title;
  const min = 1;
  const max = props.horses.length;
  return `Atlar (${min}–${max})`;
});

const countLabel = computed(() => `${props.horses.length} ADET`);
</script>

<template>
  <Panel tone="sky" flush scroll-y class="roster-panel">
    <template #title>
      <span class="roster-panel__title-text">🐴 {{ titleText }}</span>
    </template>
    <template #actions>
      <Badge variant="info" size="md">{{ countLabel }}</Badge>
    </template>

    <ol class="roster-panel__list" role="list">
      <HorseRosterRow
        v-for="(horse, idx) in horses"
        :key="horse.id"
        :horse="horse"
        :index="idx"
        :highlighted="highlightedSet.has(horse.id)"
      />
    </ol>
  </Panel>
</template>

<style scoped>
.roster-panel {
  --panel-radius: 1.25rem;
  height: 100%;
  min-height: 0;
}

.roster-panel :deep(.panel__body) {
  display: flex;
  flex-direction: column;
}

.roster-panel__title-text {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 15px;
  letter-spacing: 0;
}

.roster-panel__list {
  margin: 0;
  padding: 0.375rem;
  list-style: none;
  flex: 1 1 auto;
  overflow-y: auto;
  scrollbar-width: none;
}
</style>
