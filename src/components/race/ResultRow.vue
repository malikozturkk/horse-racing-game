<script setup lang="ts">
import type { Horse } from "../../domain/horse/types";
import HorseProfile from "../horse/HorseProfile.vue";

interface Props {
  rank: number;
  horse: Horse;
  trailing?: string | null;
  highlighted?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  trailing: null,
  highlighted: false,
});

const podiumClass = (): string => {
  if (props.rank === 1) return "result-row--gold";
  if (props.rank === 2) return "result-row--silver";
  if (props.rank === 3) return "result-row--bronze";
  return "";
};
</script>

<template>
  <li
    class="result-row"
    :class="[podiumClass(), { 'result-row--highlighted': highlighted }]"
  >
    <span class="result-row__rank mono">{{ rank }}</span>
    <span class="result-row__avatar">
      <HorseProfile :visual="horse.visual" :size="28" />
    </span>
    <span class="result-row__body">
      <span class="result-row__name">{{ horse.name }}</span>
      <span v-if="trailing" class="result-row__trailing mono">{{
        trailing
      }}</span>
    </span>
    <slot name="trailing" />
  </li>
</template>

<style scoped>
.result-row {
  --row-bg: transparent;
  display: grid;
  grid-template-columns: 1.6rem 32px minmax(0, 1fr) auto;
  align-items: center;
  gap: 0.55rem;
  padding: 0.55rem 0.7rem;
  list-style: none;
  background: var(--row-bg);
  border-bottom: 2px dashed var(--line);
  transition: background-color 160ms ease;
}

.result-row:first-child {
  border-radius: 12px;
}

.result-row:last-child {
  border-bottom: 0;
}

.result-row--gold {
  --row-bg: color-mix(in srgb, var(--color-gold) 18%, white);
}

.result-row--silver {
  --row-bg: color-mix(in srgb, var(--color-line) 60%, white);
}

.result-row--bronze {
  --row-bg: color-mix(in srgb, var(--color-finish) 14%, white);
}

.result-row--highlighted {
  outline: 2px solid var(--color-gold);
  outline-offset: -2px;
}

.result-row__rank {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.6rem;
  height: 1.6rem;
  border-radius: 9999px;
  background: var(--color-ink);
  color: #fff;
  font-size: 11.5px;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
}

.result-row--gold .result-row__rank {
  background: var(--color-gold);
  color: var(--color-ink);
}

.result-row--silver .result-row__rank {
  background: color-mix(in srgb, var(--color-ink) 35%, white);
}

.result-row--bronze .result-row__rank {
  background: color-mix(in srgb, var(--color-finish) 80%, white);
}

.result-row__avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.result-row__body {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.result-row__name {
  font-family: var(--font-body);
  font-size: 13.5px;
  font-weight: 700;
  color: var(--color-ink);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  letter-spacing: -0.005em;
}

.result-row__trailing {
  font-size: 11px;
  font-weight: 700;
  color: color-mix(in srgb, var(--color-ink) 55%, white);
  letter-spacing: 0.04em;
}
</style>
