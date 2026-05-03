<script setup lang="ts">
import { computed } from "vue";
import type { Horse } from "../../domain/horse/types";
import HorseProfile from "../horse/HorseProfile.vue";
import ConditionBar from "../ui/ConditionBar.vue";

interface Props {
  champion: Horse;
  totalPoints: number;
  wins: number;
  averageTimeMs: number;
  seasonNumber: number;
}

const props = defineProps<Props>();

const winsLabel = computed(() => `${props.wins} birincilik`);
const pointsLabel = computed(() => `${props.totalPoints} puan`);
const formLabel = computed(
  () => `FORMA #${props.champion.id as unknown as number}`
);

const fmtAvg = (ms: number): string => {
  const totalSec = ms / 1000;
  const m = Math.floor(totalSec / 60);
  const s = totalSec - m * 60;
  return `${m}:${s.toFixed(3).padStart(6, "0")}`;
};
</script>

<template>
  <article
    class="champ"
    data-testid="champion-card"
    :aria-label="`Sezon şampiyonu: ${champion.name}`"
  >
    <header class="champ__head">
      <span class="champ__eyebrow mono">SEZON ŞAMPİYONU</span>
      <span class="champ__season mono">#{{ seasonNumber }}</span>
    </header>

    <div class="champ__body">
      <div class="champ__avatar">
        <HorseProfile :visual="champion.visual" :size="78" />
      </div>

      <div class="champ__identity">
        <h2 class="champ__name">{{ champion.name }}</h2>
        <p class="champ__meta mono">
          <span>{{ winsLabel }}</span>
          <span aria-hidden="true">·</span>
          <span>{{ pointsLabel }}</span>
          <span aria-hidden="true">·</span>
          <span>ortalama {{ fmtAvg(averageTimeMs) }}</span>
        </p>
      </div>
    </div>

    <div class="champ__separator"></div>

    <footer class="champ__foot">
      <ConditionBar :value="champion.condition" :show-label="false" />
      <span class="champ__form mono">{{ formLabel }}</span>
    </footer>
  </article>
</template>

<style scoped>
.champ {
  background: linear-gradient(180deg, var(--gold-soft), var(--surface));
  border: 2px solid var(--color-line);
  border-radius: 1.375rem;
  padding: 1.25rem 1.4rem;
  display: flex;
  flex-direction: column;
  gap: 0.95rem;
  box-shadow: 0 6px 0 0 rgba(43, 36, 64, 0.15);
}

.champ__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 11px;
  letter-spacing: 0.12em;
  color: color-mix(in srgb, var(--color-ink) 60%, white);
  font-weight: 800;
}

.champ__season {
  background: var(--color-ink);
  color: #fff;
  padding: 0.15rem 0.45rem;
  border-radius: 9999px;
  font-size: 10.5px;
  letter-spacing: 0.04em;
}

.champ__body {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.champ__separator {
  height: 1px;
  background: var(--line);
  margin: 20px 0px;
}

.champ__avatar {
  flex-shrink: 0;
}

.champ__identity {
  min-width: 0;
}

.champ__name {
  margin: 0;
  font-family: var(--font-display);
  font-size: 38px;
  font-weight: 900;
  letter-spacing: -0.015em;
  color: var(--color-ink);
  line-height: 1;
}

.champ__meta {
  margin: 0.35rem 0 0;
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.4rem;
  font-size: 11.5px;
  font-weight: 700;
  letter-spacing: 0.04em;
  color: color-mix(in srgb, var(--color-ink) 60%, white);
}

.champ__foot {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 66%);
  align-items: center;
  gap: 0.85rem;
}

.champ__form {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.06em;
  color: color-mix(in srgb, var(--color-ink) 60%, white);
}

@media (max-width: 640px) {
  .champ {
    padding: 1rem;
  }

  .champ__name {
    font-size: 28px;
  }
}
</style>
