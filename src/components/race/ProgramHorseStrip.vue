<script setup lang="ts">
import type { Horse } from "../../domain/horse/types";
import type { HorseId } from "../../domain/shared/types";
import HorseProfile from "../horse/HorseProfile.vue";

interface Props {
  horseIds: readonly HorseId[];
  horsesById: Readonly<Record<HorseId, Horse>>;
}

const props = defineProps<Props>();

const horses = (): readonly Horse[] => {
  const out: Horse[] = [];
  for (const id of props.horseIds) {
    const h = props.horsesById[id];
    if (h) out.push(h);
  }
  return out;
};
</script>

<template>
  <ul class="hstrip" role="list" aria-label="Round katılımcıları">
    <li
      v-for="horse in horses()"
      :key="horse.id"
      class="hstrip__item"
      :title="horse.name"
      :aria-label="horse.name"
      :style="{
        '--strip-bg': horse.visual.coloring.body,
        '--strip-mane': horse.visual.coloring.mane,
      }"
    >
      <span class="hstrip__avatar" aria-hidden="true">
        <HorseProfile :visual="horse.visual" :size="24" />
      </span>
    </li>
  </ul>
</template>

<style scoped>
.hstrip {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.hstrip__item {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 9999px;
  background: color-mix(in srgb, var(--strip-bg, var(--color-turf)) 18%, white);
  border: 1.5px solid
    color-mix(in srgb, var(--strip-bg, var(--color-turf)) 55%, white);
}

.hstrip__avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
</style>
