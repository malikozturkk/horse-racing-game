<script setup lang="ts">
import { computed } from "vue";

type Variant = "high" | "medium" | "low";

interface Props {
  value: number;
  highThreshold?: number;
  mediumThreshold?: number;
  showLabel?: boolean;
  showValue?: boolean;
  labels?: Partial<Record<Variant, string>>;
}

const props = withDefaults(defineProps<Props>(), {
  highThreshold: 70,
  mediumThreshold: 40,
  showLabel: true,
  showValue: true,
  labels: () => ({}),
});

const DEFAULT_LABELS: Readonly<Record<Variant, string>> = Object.freeze({
  high: "Yüksek",
  medium: "Orta",
  low: "Düşük",
});

const VARIANT_CLASS: Readonly<Record<Variant, string>> = Object.freeze({
  high: "condition-bar__fill--high",
  medium: "condition-bar__fill--medium",
  low: "condition-bar__fill--low",
});

const clampedValue = computed(() => {
  const v = props.value;
  if (!Number.isFinite(v) || v <= 0) return 0;
  if (v >= 100) return 100;
  return Math.round(v);
});

const variant = computed<Variant>(() => {
  const v = clampedValue.value;
  if (v >= props.highThreshold) return "high";
  if (v >= props.mediumThreshold) return "medium";
  return "low";
});

const label = computed(
  () => props.labels[variant.value] ?? DEFAULT_LABELS[variant.value]
);

const fillClass = computed(() => VARIANT_CLASS[variant.value]);
const fillStyle = computed(() => {
  const v = clampedValue.value;
  return v > 0
    ? { width: v + "%", minWidth: "var(--cb-min-width)" }
    : { width: "0%" };
});

const ariaValueText = computed(
  () => `${label.value} (${clampedValue.value}/100)`
);
</script>

<template>
  <div
    class="condition-bar"
    role="progressbar"
    :aria-valuenow="clampedValue"
    aria-valuemin="0"
    aria-valuemax="100"
    :aria-valuetext="ariaValueText"
  >
    <span v-if="showLabel" class="condition-bar__label">{{ label }}</span>

    <div class="condition-bar__track" aria-hidden="true">
      <div class="condition-bar__fill" :class="fillClass" :style="fillStyle" />
    </div>

    <span v-if="showValue" class="condition-bar__value mono">
      {{ clampedValue }}
    </span>
  </div>
</template>

<style scoped>
.condition-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--cb-gap);
  width: 100%;
  font-family: var(--font-body);
}

.condition-bar__label {
  font-size: var(--cb-font-size);
  font-weight: 600;
  letter-spacing: 0.01em;
  color: var(--cb-label-color);
  white-space: nowrap;
}

.condition-bar__track {
  width: 100%;
  position: relative;
  height: var(--cb-height);
  background: var(--cb-track-bg);
  border-radius: var(--cb-radius);
  overflow: hidden;
}

.condition-bar__fill {
  height: 100%;
  border-radius: var(--cb-radius);
  background: var(--cb-fill-color);
  transition:
    width var(--cb-transition-duration) var(--cb-transition-easing),
    background-color var(--cb-transition-duration) var(--cb-transition-easing);
  will-change: width;
}

.condition-bar__fill--high {
  --cb-fill-color: var(--cb-color-high);
}
.condition-bar__fill--medium {
  --cb-fill-color: var(--cb-color-medium);
}
.condition-bar__fill--low {
  --cb-fill-color: var(--cb-color-low);
}

.condition-bar__value {
  font-size: var(--cb-font-size);
  font-weight: 700;
  color: var(--cb-value-color);
  text-align: right;
  font-variant-numeric: tabular-nums;
}

@media (prefers-reduced-motion: reduce) {
  .condition-bar__fill {
    transition-duration: 0ms;
  }
}
</style>
