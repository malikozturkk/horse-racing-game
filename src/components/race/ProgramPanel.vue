<script setup lang="ts">
import { computed } from "vue";
import type { Horse } from "../../domain/horse/types";
import type { HorseId } from "../../domain/shared/types";
import type { Round } from "../../domain/schedule/types";
import Badge from "../ui/Badge.vue";
import Panel from "../ui/Panel.vue";
import ProgramRoundItem from "./ProgramRoundItem.vue";

interface Props {
  rounds: readonly Round[];
  horsesById: Readonly<Record<HorseId, Horse>>;
  currentRoundIndex: number | null;
}

const props = defineProps<Props>();

const totalLabel = computed(() => `${props.rounds.length} ROUND`);
</script>

<template>
  <Panel tone="turf" class="program-panel">
    <template #title>
      <span>📋 Program</span>
    </template>
    <template #actions>
      <Badge variant="success" size="sm">{{ totalLabel }}</Badge>
    </template>

    <ol class="program-panel__list" role="list">
      <ProgramRoundItem
        v-for="round in rounds"
        :key="round.id"
        :round="round"
        :horses-by-id="horsesById"
        :is-current="currentRoundIndex === round.index"
      />
    </ol>
  </Panel>
</template>

<style scoped>
.program-panel {
  height: 100%;
}

.program-panel :deep(.panel__body) {
  overflow-y: auto;
  scrollbar-width: thin;
}

.program-panel__list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}
</style>
