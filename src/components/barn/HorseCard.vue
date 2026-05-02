<script setup lang="ts">
import { computed } from "vue";
import type { Horse } from "../../domain/horse/types";
import HorseProfile from "../horse/HorseProfile.vue";
import HorseWithJockey from "../horse/HorseWithJockey.vue";
import ConditionBar from "../ui/ConditionBar.vue";

interface Props {
  horse: Horse;
}

const props = defineProps<Props>();
const horseNumber = computed<number>(() => props.horse.id as unknown as number);
const coatLabel = computed<string>(() => props.horse.visual.coloring.coatName);
const accentColor = computed<string>(() => props.horse.visual.coloring.body);

const cardStyle = computed(() => ({
  "--card-accent": accentColor.value,
  "--card-accent-soft": `color-mix(in srgb, ${accentColor.value} 16%, white)`,
  "--card-accent-deep": `color-mix(in srgb, ${accentColor.value} 60%, black)`,
}));
</script>

<template>
  <article
    class="horse-card"
    :style="cardStyle"
    :aria-label="`At #${horseNumber} — ${horse.name}`"
  >
    <header class="horse-card__head">
      <HorseProfile :visual="horse.visual" :size="44" />

      <div class="horse-card__identity">
        <h3 class="horse-card__name">{{ horse.name }}</h3>
        <p class="horse-card__meta">
          <span class="horse-card__coat">{{ coatLabel }}</span>
        </p>
      </div>

      <span class="horse-card__number mono" aria-label="At numarası">
        #{{ horseNumber }}
      </span>
    </header>

    <div class="horse-card__condition">
      <ConditionBar :value="horse.condition" :show-label="false" />
    </div>

    <div class="horse-card__track" aria-hidden="true">
      <div class="horse-card__rail horse-card__rail--top"></div>
      <div class="horse-card__lane">
        <HorseWithJockey
          :horse-number="horseNumber"
          :visual="horse.visual"
          :width="190"
        />
      </div>
      <div class="horse-card__rail horse-card__rail--bottom"></div>
    </div>

    <footer class="horse-card__footer">
      <span class="horse-card__status">Pistte</span>
      <span class="horse-card__jockey mono">Jokey · #{{ horseNumber }}</span>
    </footer>
  </article>
</template>

<style scoped>
.horse-card {
  --card-radius: 1.25rem;
  position: relative;
  display: flex;
  flex-direction: column;
  background: var(--color-surface);
  border: 1px solid var(--color-line);
  border-radius: var(--card-radius);
  overflow: hidden;
  isolation: isolate;
  transition:
    transform 220ms cubic-bezier(0.4, 0, 0.2, 1),
    box-shadow 220ms cubic-bezier(0.4, 0, 0.2, 1),
    border-color 220ms ease;
  box-shadow: 0 1px 0 0 var(--color-line);
}

.horse-card::before {
  content: "";
  position: absolute;
  inset: 0 0 auto 0;
  height: 4px;
  background: var(--card-accent);
  z-index: 1;
}

.horse-card:hover {
  transform: translateY(-2px);
  border-color: color-mix(in srgb, var(--card-accent) 40%, var(--color-line));
  box-shadow:
    0 6px 20px -8px color-mix(in srgb, var(--card-accent) 35%, transparent),
    0 1px 0 0 var(--color-line);
}

.horse-card__head {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 0.75rem;
  padding: 0.9rem 0.95rem 0.6rem;
}

.horse-card__identity {
  min-width: 0;
}

.horse-card__name {
  font-family: var(--font-display);
  font-size: 17px;
  font-weight: 700;
  line-height: 1.15;
  letter-spacing: -0.01em;
  color: var(--color-ink);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.horse-card__meta {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  margin-top: 0.15rem;
  font-size: 11.5px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--color-ink) 55%, white);
}

.horse-card__coat {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}

.horse-card__coat::before {
  content: "";
  width: 8px;
  height: 8px;
  border-radius: 9999px;
  background: var(--card-accent);
  border: 1.5px solid var(--card-accent-deep);
  box-shadow: 0 0 0 2px var(--card-accent-soft);
}

.horse-card__number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 38px;
  height: 26px;
  padding: 0 0.55rem;
  border-radius: 9999px;
  background: var(--card-accent);
  color: #fff;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.02em;
  text-shadow: 0 1px 0 rgba(0, 0, 0, 0.18);
  box-shadow: 0 2px 0 0 var(--card-accent-deep);
}

.horse-card__condition {
  padding: 0 0.95rem 0.7rem;
}

.horse-card__track {
  position: relative;
  background: linear-gradient(
    180deg,
    color-mix(in srgb, var(--color-turf) 86%, white) 0%,
    color-mix(in srgb, var(--color-turf) 70%, black) 100%
  );
  padding: 0.85rem 0.5rem 0.7rem;
}

.horse-card__rail {
  height: 2px;
  background: rgba(255, 255, 255, 0.55);
  border-radius: 999px;
  margin: 0 0.35rem;
}

.horse-card__rail--top {
  margin-bottom: 0.45rem;
}
.horse-card__rail--bottom {
  margin-top: 0.45rem;
  background: rgba(0, 0, 0, 0.18);
}

.horse-card__lane {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 136px;
  background-image:
    linear-gradient(
      90deg,
      rgba(255, 255, 255, 0.06) 0 28px,
      transparent 28px 56px
    ),
    radial-gradient(
      ellipse at 50% 110%,
      color-mix(in srgb, var(--color-turf) 30%, black) 0%,
      transparent 70%
    );
  border-radius: 8px;
  overflow: hidden;
}

.horse-card__lane :deep(svg) {
  filter: drop-shadow(0 4px 4px rgba(0, 0, 0, 0.15));
}

.horse-card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.55rem 0.95rem 0.75rem;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--color-ink) 55%, white);
}

.horse-card__status {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}

.horse-card__status::before {
  content: "";
  width: 6px;
  height: 6px;
  border-radius: 9999px;
  background: var(--color-turf);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--color-turf) 25%, white);
}

@media (max-width: 480px) {
  .horse-card__name {
    font-size: 16px;
  }
}
</style>
