<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import type { Horse } from "../domain/horse/types";
import { useBarn } from "../composables/useBarn";
import BarnHeader from "../components/barn/BarnHeader.vue";
import HorseCard from "../components/barn/HorseCard.vue";
import BarnDoorsIntro from "../components/barn/BarnDoorsIntro.vue";

const { allHorses, horseCount, isPopulated, generateBarn, resetBarn } =
  useBarn();

const revealed = ref(false);

const onIntroFinished = () => {
  revealed.value = true;
};

onMounted(() => {
  if (!isPopulated.value) generateBarn();

  const mql = window.matchMedia?.("(prefers-reduced-motion: reduce)");
  if (mql?.matches) revealed.value = true;
});

const horses = computed<readonly Horse[]>(() => allHorses.value);

const staggerStep = 22;
const cardDelay = (index: number): string => {
  const max = 24;
  const i = Math.min(index, max);
  return `${i * staggerStep}ms`;
};
</script>

<template>
  <main class="barn-view">
    <BarnDoorsIntro @finished="onIntroFinished" />

    <BarnHeader :horse-count="horseCount" @regenerate="resetBarn" />

    <section class="barn-view__body">
      <div class="barn-view__intro">
        <h2 class="barn-view__heading">Atlarımız</h2>
        <p class="barn-view__subheading">
          Ahırın kapıları az önce açıldı. Pist için hazırlanan
          <strong>{{ horseCount }}</strong> at, kondisyonlarıyla aşağıda.
        </p>
      </div>

      <ul
        class="barn-view__grid"
        :class="{ 'is-revealed': revealed }"
        role="list"
        aria-label="Ahırdaki atlar"
      >
        <li
          v-for="(horse, idx) in horses"
          :key="horse.id"
          class="barn-view__cell"
          :style="{ '--reveal-delay': cardDelay(idx) }"
        >
          <HorseCard :horse="horse" />
        </li>
      </ul>

      <p v-if="!horseCount" class="barn-view__empty" aria-live="polite">
        Ahır boş.
        <button type="button" @click="generateBarn()">Atları üret</button>
      </p>
    </section>
  </main>
</template>

<style scoped>
.barn-view {
  min-height: 100vh;
  background: var(--color-bg);
  color: var(--color-ink);
  display: flex;
  flex-direction: column;
}

.barn-view__body {
  width: 100%;
  max-width: 1320px;
  margin: 0 auto;
  padding: 1.75rem 1.5rem 3rem;
}

.barn-view__intro {
  margin-bottom: 1.5rem;
}

.barn-view__heading {
  font-family: var(--font-display);
  font-size: 28px;
  font-weight: 900;
  letter-spacing: -0.01em;
  margin: 0;
}

.barn-view__subheading {
  margin-top: 0.35rem;
  max-width: 60ch;
  color: color-mix(in srgb, var(--color-ink) 70%, white);
  font-size: 14px;
}

.barn-view__grid {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
}

.barn-view__cell {
  opacity: 0;
  transform: translateY(10px) scale(0.985);
  transition:
    opacity 380ms cubic-bezier(0.4, 0, 0.2, 1),
    transform 420ms cubic-bezier(0.4, 0, 0.2, 1);
  transition-delay: var(--reveal-delay, 0ms);
}

.barn-view__grid.is-revealed .barn-view__cell {
  opacity: 1;
  transform: none;
}

.barn-view__empty {
  margin-top: 1rem;
  color: color-mix(in srgb, var(--color-ink) 60%, white);
}

.barn-view__empty button {
  background: none;
  border: 0;
  color: var(--color-turf-deep);
  font: inherit;
  font-weight: 700;
  cursor: pointer;
  text-decoration: underline;
}

@media (max-width: 720px) {
  .barn-view__body {
    padding: 1.25rem 1rem 2rem;
  }
  .barn-view__heading {
    font-size: 24px;
  }
  .barn-view__grid {
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 0.85rem;
  }
}

@media (max-width: 380px) {
  .barn-view__grid {
    grid-template-columns: 1fr;
  }
}

@media (prefers-reduced-motion: reduce) {
  .barn-view__cell {
    opacity: 1;
    transform: none;
    transition: none;
  }
}
</style>
