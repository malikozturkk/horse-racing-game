<script setup lang="ts">
import { computed } from "vue";
import type { Horse } from "../../domain/horse/types";
import HorseProfile from "../horse/HorseProfile.vue";
import ConditionBar from "../ui/ConditionBar.vue";

interface Props {
  horse: Horse;
  index: number;
  highlighted?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  highlighted: false,
});

const number = computed(() => props.index + 1);
</script>

<template>
  <li
    class="roster-row"
    :class="{ 'roster-row--highlighted': highlighted }"
    :aria-label="`At #${number} — ${horse.name}`"
  >
    <span class="roster-row__index mono">{{ number }}</span>

    <span class="roster-row__avatar">
      <HorseProfile :visual="horse.visual" :size="34" />
    </span>

    <span class="roster-row__name">{{ horse.name }}</span>

    <ConditionBar :value="horse.condition" :show-label="false" />
  </li>
</template>

<style scoped>
.roster-row {
  --row-bg: transparent;
  display: grid;
  grid-template-columns: 1.6rem 32px minmax(0, 1fr) 7rem;
  align-items: center;
  gap: 0.55rem;
  padding: 0.55rem 0.75rem;
  background: var(--row-bg);
  border-bottom: 1px dashed var(--color-line);
  list-style: none;
  transition: background-color 160ms ease;
  --cb-label-width: 0;
  --cb-value-width: 1.75rem;
}

.roster-row:last-child {
  border-bottom: 0;
}

.roster-row--highlighted {
  --row-bg: color-mix(in srgb, var(--color-gold) 18%, white);
}

.roster-row__index {
  font-size: 12px;
  font-weight: 800;
  color: var(--color-surface);
  text-align: center;
  font-variant-numeric: tabular-nums;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 9999px;
  background: var(--color-ink);
}

.roster-row--highlighted .roster-row__index {
  background: var(--color-gold);
  color: var(--color-ink);
}

.roster-row__avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.roster-row__name {
  font-family: var(--font-body);
  font-size: 13.5px;
  font-weight: 700;
  color: var(--color-ink);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  letter-spacing: -0.005em;
}

.roster-row__condition {
  display: block;
  width: 100%;
}

@media (max-width: 640px) {
  .roster-row {
    grid-template-columns: 1.4rem 28px minmax(0, 1fr) 5.5rem;
    gap: 0.45rem;
    padding: 0.45rem 0.6rem;
  }

  .roster-row__name {
    font-size: 12.5px;
  }
}
</style>
