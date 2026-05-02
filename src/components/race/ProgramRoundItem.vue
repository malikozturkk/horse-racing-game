<script setup lang="ts">
import { computed } from "vue";
import type { Horse } from "../../domain/horse/types";
import type { HorseId } from "../../domain/shared/types";
import type { Round, RoundStatus } from "../../domain/schedule/types";
import Badge from "../ui/Badge.vue";
import ProgramHorseStrip from "./ProgramHorseStrip.vue";

interface Props {
  round: Round;
  horsesById: Readonly<Record<HorseId, Horse>>;
  isCurrent: boolean;
}

const props = defineProps<Props>();

const number = computed(() => props.round.index + 1);

interface BadgeSpec {
  label: string;
  variant: "success" | "warning" | "danger" | "neutral" | "info";
  dot: boolean;
  pulse: boolean;
}

const badge = computed<BadgeSpec>(() => {
  const status: RoundStatus = props.round.status;
  if (status === "completed") {
    return { label: "TAMAM", variant: "success", dot: false, pulse: false };
  }
  if (status === "live") {
    return { label: "CANLI", variant: "danger", dot: true, pulse: true };
  }
  if (status === "photoFinish") {
    return { label: "FOTO FİNİŞ", variant: "warning", dot: true, pulse: false };
  }
  if (props.isCurrent || status === "queued") {
    return { label: "SIRADA", variant: "warning", dot: true, pulse: false };
  }
  return { label: "BEKLİYOR", variant: "neutral", dot: false, pulse: false };
});

const isCompleted = computed(() => props.round.status === "completed");
const lineupCount = computed(() => props.round.lineup.length);
const distanceLabel = computed(() => `${props.round.distanceMeters}m`);
</script>

<template>
  <li
    class="prg-item"
    :class="{
      'prg-item--current': isCurrent,
      'prg-item--completed': isCompleted,
    }"
    :aria-current="isCurrent ? 'step' : undefined"
  >
    <div class="prg-item__head">
      <span class="prg-item__number mono">{{
        isCompleted ? "✓" : number
      }}</span>

      <div class="prg-item__title">
        <h3 class="prg-item__name">{{ round.name }}</h3>
        <p class="prg-item__meta mono">
          <span>{{ distanceLabel }}</span>
          <span aria-hidden="true">·</span>
          <span>{{ lineupCount }} KOŞUCU</span>
        </p>
      </div>

      <Badge
        :variant="badge.variant"
        :dot="badge.dot"
        :pulse="badge.pulse"
        size="sm"
      >
        {{ badge.label }}
      </Badge>
    </div>

    <ProgramHorseStrip :horse-ids="round.lineup" :horses-by-id="horsesById" />
  </li>
</template>

<style scoped>
.prg-item {
  --item-accent: var(--color-line);
  --item-bg: var(--color-surface);
  list-style: none;
  border: 2px solid var(--item-accent);
  background: var(--item-bg);
  border-radius: 0.85rem;
  padding: 0.65rem 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  transition:
    border-color 200ms ease,
    background-color 200ms ease,
    box-shadow 200ms ease;
}

.prg-item--current {
  --item-accent: color-mix(in srgb, var(--color-gold) 70%, white);
  --item-bg: color-mix(in srgb, var(--color-gold) 12%, white);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-gold) 18%, transparent);
}

.prg-item--completed {
  --item-accent: color-mix(in srgb, var(--color-turf) 50%, white);
  --item-bg: color-mix(in srgb, var(--color-turf) 8%, white);
}

.prg-item__head {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 0.6rem;
  align-items: start;
}

.prg-item__number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.6rem;
  height: 1.6rem;
  border: 2px solid var(--color-ink);
  border-radius: 6px;
  background: var(--color-ink);
  color: #fff;
  font-size: 11.5px;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
}

.prg-item--current .prg-item__number {
  background: var(--color-gold);
  color: var(--color-ink);
}

.prg-item--completed .prg-item__number {
  background: var(--color-turf);
}

.prg-item__title {
  min-width: 0;
}

.prg-item__name {
  margin: 0;
  font-family: var(--font-display);
  font-size: 14.5px;
  font-weight: 700;
  letter-spacing: -0.005em;
  color: var(--color-ink);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.prg-item__meta {
  margin: 0.15rem 0 0;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 10.5px;
  font-weight: 800;
  letter-spacing: 0.06em;
  color: color-mix(in srgb, var(--color-ink) 55%, white);
}
</style>
