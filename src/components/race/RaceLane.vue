<script setup lang="ts">
import { computed } from "vue";
import type { Horse } from "../../domain/horse/types";
import HorseWithJockey from "../horse/HorseWithJockey.vue";

interface Props {
  laneNumber: number;
  horse: Horse;
  progress: number;
  finished?: boolean;
  staticOnly?: boolean;
  showName?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  finished: false,
  staticOnly: false,
  showName: true,
});

const horseNumber = computed(() => props.horse.id as unknown as number);

const clampedProgress = computed(() => {
  const v = props.progress;
  if (!Number.isFinite(v) || v <= 0) return 0;
  if (v >= 1) return 1;
  return v;
});

const horseStyle = computed(() => ({
  "--lane-progress": String(clampedProgress.value),
}));

const accent = computed(() => props.horse.visual.coloring.body);
</script>

<template>
  <div
    class="lane"
    :class="{ 'lane--finished': finished, 'lane--static': staticOnly }"
    :style="{ '--lane-accent': accent }"
    :aria-label="`Şerit ${laneNumber} — ${horse.name}`"
  >
    <span class="lane__number mono">{{ laneNumber }}</span>

    <div class="lane__start-line" />

    <div class="lane__horse" :style="horseStyle">
      <span class="lane__horse-svg">
        <HorseWithJockey
          :horse-number="horseNumber"
          :visual="horse.visual"
          :width="56"
        />
      </span>
      <span v-if="showName" class="lane__horse-tag mono">{{ horse.name }}</span>
    </div>

    <div class="lane__finish" />
  </div>
</template>

<style scoped>
.lane {
  position: relative;
  height: 60px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 999px;
  border: 1.5px dashed rgba(255, 255, 255, 0.35);
  display: flex;
  align-items: center;
  padding-left: 8px;
  overflow: hidden;
}

.lane__number {
  width: 28px;
  height: 28px;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
  font-weight: 900;
  font-size: 14px;
  color: var(--ink);
  border: 2px solid var(--ink);
  flex-shrink: 0;
  box-shadow: 0 2px 0 0 rgba(0, 0, 0, 0.25);
  z-index: 2;
}

.lane__start-line {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 44px;
  width: 4px;
  background: white;
  border-radius: 2px;
}

.lane__horse {
  position: absolute;
  top: 50%;
  left: calc(var(--lane-progress, 0) * 100%);
  transform: translate(calc(var(--lane-progress, 0) * -100%), -50%);
  display: inline-flex;
  align-items: center;
  white-space: nowrap;
  z-index: 1;
}

.lane--static .lane__horse {
  transition:
    transform 0.45s cubic-bezier(0.4, 0, 0.2, 1),
    left 0.45s cubic-bezier(0.4, 0, 0.2, 1);
}

.lane__horse-svg {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.lane__horse-svg :deep(svg) {
  display: block;
  filter: drop-shadow(0 2px 2px rgba(0, 0, 0, 0.18));
}

.lane__horse-tag {
  position: absolute;
  top: 50%;
  left: 100%;
  transform: translateY(-50%);
  margin-left: 6px;
  display: inline-flex;
  align-items: center;
  padding: 1px 7px;
  font-family: var(--font-mono);
  font-size: 9.5px;
  font-weight: 700;
  letter-spacing: 0.04em;
  background: #fff;
  color: var(--color-ink);
  border-radius: 9999px;
  border: 1px solid var(--lane-accent);
  white-space: nowrap;
  flex-shrink: 0;
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.08);
  pointer-events: none;
}

.lane__finish {
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  width: 14px;
  background: repeating-linear-gradient(
    45deg,
    white 0,
    white 6px,
    var(--ink) 6px,
    var(--ink) 12px
  );
  border-left: 2px solid var(--ink);
  border-right: 2px solid var(--ink);
  border-radius: 4px;
  z-index: 2;
}

.lane--finished .lane__horse-tag {
  background: var(--color-gold);
  border-color: color-mix(in srgb, var(--color-gold) 60%, black);
}

@media (max-width: 640px) {
  .lane {
    --lane-height: 44px;
    grid-template-columns: 1.85rem 1fr;
    gap: 0.4rem;
  }

  .lane__number {
    width: 1.85rem;
    height: 1.85rem;
    font-size: 11.5px;
    border-width: 2px;
  }

  .lane__horse-svg :deep(svg) {
    width: 44px !important;
    height: auto !important;
  }

  .lane__horse-tag {
    font-size: 8.5px;
    padding: 1px 5px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .lane--static .lane__horse {
    transition: none;
  }
}
</style>
