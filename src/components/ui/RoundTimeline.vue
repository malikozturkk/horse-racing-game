<script setup lang="ts">
import { computed } from "vue";

type RoundStatus = "completed" | "current" | "upcoming";

interface Round {
  id?: number | string;
  label?: string;
  distance: number | string;
}

interface Props {
  rounds: Round[];
  currentIndex: number;
  distanceUnit?: string;
  labelPrefix?: string;
  title?: string | null;
  ariaLabel?: string;
}

const props = withDefaults(defineProps<Props>(), {
  distanceUnit: "m",
  labelPrefix: "ROUND",
  title: "ROUND TIMELINE",
  ariaLabel: "Round timeline",
});

interface ResolvedRound {
  key: string | number;
  index: number;
  number: number;
  label: string;
  distance: string;
  status: RoundStatus;
}

const STATUS_CLASS: Readonly<Record<RoundStatus, string>> = Object.freeze({
  completed: "is-completed",
  current: "is-current",
  upcoming: "is-upcoming",
});

const items = computed<ResolvedRound[]>(() => {
  const current = Number.isFinite(props.currentIndex) ? props.currentIndex : 0;

  return props.rounds.map((round, idx): ResolvedRound => {
    let status: RoundStatus = "upcoming";
    if (idx < current) status = "completed";
    else if (idx === current) status = "current";

    const number = idx + 1;
    const distance =
      typeof round.distance === "number"
        ? `${round.distance}${props.distanceUnit}`
        : round.distance;

    return {
      key: round.id ?? idx,
      index: idx,
      number,
      label: round.label ?? `${props.labelPrefix} ${number}`,
      distance,
      status,
    };
  });
});

function statusClass(status: RoundStatus) {
  return STATUS_CLASS[status];
}
</script>

<template>
  <section class="round-timeline" :aria-label="ariaLabel">
    <header v-if="title" class="round-timeline__header">
      <span class="round-timeline__title">{{ title }}</span>
    </header>

    <ol class="round-timeline__list" role="list">
      <li
        v-for="(item, i) in items"
        :key="item.key"
        class="round-timeline__item"
        :class="statusClass(item.status)"
        :aria-current="item.status === 'current' ? 'step' : undefined"
      >
        <div class="round-timeline__head">
          <span
            v-if="i > 0"
            class="round-timeline__line round-timeline__line--left"
            :class="{ 'is-filled': item.status === 'completed' }"
            aria-hidden="true"
          />

          <span class="round-timeline__circle">
            <slot
              v-if="item.status === 'completed'"
              name="completed-icon"
              :item="item"
            >
              <svg
                class="round-timeline__check"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path
                  d="M5 10.5l3.2 3.2L15 6.8"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.6"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </slot>
            <span v-else class="round-timeline__number">
              {{ item.number }}
            </span>
          </span>

          <span
            v-if="i < items.length - 1"
            class="round-timeline__line round-timeline__line--right"
            :class="{ 'is-filled': item.status === 'completed' }"
            aria-hidden="true"
          />
        </div>

        <span class="round-timeline__label">{{ item.label }}</span>
        <span class="round-timeline__distance">{{ item.distance }}</span>
      </li>
    </ol>
  </section>
</template>

<style scoped>
.round-timeline {
  --rt-circle-size: 2.5rem;
  --rt-circle-border: 3px;
  --rt-line-height: 4px;
  --rt-radius: 1.25rem;
  --rt-padding-x: 1.5rem;
  --rt-padding-y: 1.25rem;
  --rt-gap-y: 0.35rem;

  --rt-color-completed: var(--color-turf);
  --rt-color-completed-deep: var(--color-turf-deep);
  --rt-color-completed-on: #ffffff;

  --rt-color-current: var(--color-gold);
  --rt-color-current-deep: color-mix(in srgb, var(--color-gold) 55%, #4a3800);
  --rt-color-current-on: var(--color-ink);
  --rt-color-current-glow: color-mix(
    in srgb,
    var(--color-gold) 22%,
    transparent
  );

  --rt-color-upcoming-bg: var(--color-surface);
  --rt-color-upcoming-border: var(--color-line);
  --rt-color-upcoming-on: color-mix(in srgb, var(--color-ink) 35%, white);

  --rt-color-line-empty: var(--color-line);
  --rt-color-label: color-mix(in srgb, var(--color-ink) 55%, white);
  --rt-color-ink: var(--color-ink);

  --rt-transition: 220ms cubic-bezier(0.4, 0, 0.2, 1);

  width: 100%;
  box-sizing: border-box;
  font-family: var(--font-body);
  background: var(--color-surface);
  border: 1px solid var(--color-line);
  border-radius: var(--rt-radius);
  padding: var(--rt-padding-y) var(--rt-padding-x);
}

.round-timeline__header {
  margin-bottom: 1rem;
}

.round-timeline__title {
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--rt-color-label);
}

.round-timeline__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  align-items: flex-start;
  width: 100%;
}

.round-timeline__item {
  flex: 1 1 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: var(--rt-gap-y);
}

.round-timeline__head {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: var(--rt-circle-size);
  margin-bottom: 0.55rem;
}

.round-timeline__line {
  position: absolute;
  top: 50%;
  height: var(--rt-line-height);
  width: 50%;
  background: var(--rt-color-line-empty);
  transform: translateY(-50%);
  transition: background-color var(--rt-transition);
}

.round-timeline__line--left {
  left: 0;
}

.round-timeline__line--right {
  right: 0;
}

.round-timeline__line.is-filled {
  background: var(--rt-color-completed);
}

.round-timeline__circle {
  position: relative;
  z-index: 1;
  flex-shrink: 0;
  width: var(--rt-circle-size);
  height: var(--rt-circle-size);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  background: var(--rt-color-upcoming-bg);
  border: var(--rt-circle-border) solid var(--rt-color-upcoming-border);
  color: var(--rt-color-upcoming-on);
  font-family: var(--font-mono);
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  transition:
    background-color var(--rt-transition),
    border-color var(--rt-transition),
    color var(--rt-transition),
    box-shadow var(--rt-transition);
}

.round-timeline__check {
  width: 58%;
  height: 58%;
  display: block;
  color: var(--rt-color-completed-on);
}

.round-timeline__number {
  font-family: var(--font-mono);
  font-size: 0.95rem;
  font-weight: 700;
  line-height: 1;
}

.round-timeline__label {
  font-family: var(--font-body);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--rt-color-label);
  white-space: nowrap;
}

.round-timeline__distance {
  font-family: var(--font-mono);
  font-size: 0.95rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: var(--rt-color-ink);
  white-space: nowrap;
}

.round-timeline__item.is-completed .round-timeline__circle {
  background: var(--rt-color-completed);
  border-color: var(--rt-color-completed);
  color: var(--rt-color-completed-on);
}

.round-timeline__item.is-completed .round-timeline__distance {
  color: var(--rt-color-completed-deep);
}

.round-timeline__item.is-current .round-timeline__circle {
  background: var(--rt-color-current);
  border-color: var(--rt-color-current);
  color: var(--rt-color-current-on);
  box-shadow: 0 0 0 4px var(--rt-color-current-glow);
}

.round-timeline__item.is-current .round-timeline__number {
  color: var(--rt-color-current-on);
}

.round-timeline__item.is-current .round-timeline__distance {
  color: var(--rt-color-current-deep);
}

@media (max-width: 640px) {
  .round-timeline {
    --rt-circle-size: 1.75rem;
    --rt-circle-border: 2.5px;
    --rt-line-height: 3px;
    --rt-padding-x: 1rem;
    --rt-padding-y: 0.875rem;
    --rt-radius: 1rem;
    --rt-gap-y: 0.25rem;
  }

  .round-timeline__title {
    font-size: 11px;
    letter-spacing: 0.12em;
  }

  .round-timeline__number,
  .round-timeline__distance {
    font-size: 0.8rem;
  }

  .round-timeline__label {
    font-size: 9.5px;
    letter-spacing: 0.05em;
  }
}

@media (max-width: 380px) {
  .round-timeline {
    --rt-circle-size: 1.5rem;
    --rt-circle-border: 2px;
    --rt-line-height: 2.5px;
    --rt-padding-x: 0.625rem;
  }

  .round-timeline__number,
  .round-timeline__distance {
    font-size: 0.72rem;
  }

  .round-timeline__label {
    font-size: 9px;
    letter-spacing: 0.03em;
  }
}

@media (prefers-reduced-motion: reduce) {
  .round-timeline__circle,
  .round-timeline__line {
    transition-duration: 0ms;
  }
}
</style>
