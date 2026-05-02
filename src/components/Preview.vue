<script setup lang="ts">
import { ref } from "vue";
import Button from "./ui/Button.vue";
import Badge from "./ui/Badge.vue";
import RoundTimeline from "./ui/RoundTimeline.vue";
import BarnPanel from "./horse/BarnPanel.vue";

const isRunning = ref(false);
const isLoading = ref(false);

const generateProgram = () => console.log("Program üretildi");
const start = () => {
  isRunning.value = true;
};
const stop = () => {
  isRunning.value = false;
};
const reset = () => {
  isRunning.value = false;
};

const showResults = async () => {
  isLoading.value = true;
  await new Promise((r) => setTimeout(r, 1200));
  isLoading.value = false;
};

const rounds = [
  { distance: 1200 },
  { distance: 1400 },
  { distance: 1600 },
  { distance: 1800 },
  { distance: 2000 },
  { distance: 2200 },
];
const currentRound = ref(2);

const filters = ["Tümü", "Sıradaki", "Tamamlandı", "Bekliyor"] as const;
type Filter = (typeof filters)[number];
const activeFilter = ref<Filter>("Tümü");
const setFilter = (f: Filter) => {
  activeFilter.value = f;
};
</script>

<template>
  <section class="space-y-6 p-8">
    <RoundTimeline :rounds="rounds" :current-index="currentRound" />

    <div class="rounded-2xl border border-line bg-surface px-5 py-4">
      <p class="label mb-3 uppercase tracking-widest text-ink/60">Butonlar</p>
      <div class="flex flex-wrap items-center gap-3">
        <Button variant="primary" size="lg" @button-click="generateProgram"
          >Program Üret</Button
        >
        <Button variant="primary" size="md" @button-click="start"
          >Başlat</Button
        >
        <Button
          variant="info"
          size="md"
          :loading="isLoading"
          @button-click="showResults"
          >Sonuçlar</Button
        >
        <Button
          variant="danger"
          size="md"
          :disabled="!isRunning"
          @button-click="stop"
          >Durdur</Button
        >
        <Button variant="outline" size="md" @button-click="reset"
          >Sıfırla</Button
        >
        <Button variant="primary" size="sm">Küçük</Button>
      </div>
    </div>

    <div class="rounded-2xl border border-line bg-surface px-5 py-4">
      <p class="label mb-3 uppercase tracking-widest text-ink/60">
        Badge / Chip
      </p>

      <div class="flex flex-wrap items-center gap-2">
        <Badge variant="danger" dot pulse>CANLI</Badge>
        <Badge variant="warning">1. SIRA</Badge>
        <Badge variant="success">TAMAMLANDI</Badge>
        <Badge variant="info">SIRADAKİ</Badge>
        <Badge variant="purple">YENİ</Badge>
        <Badge variant="neutral">BEKLİYOR</Badge>
      </div>
    </div>

    <div class="rounded-2xl border border-line bg-surface px-5 py-4">
      <p class="label mb-3 uppercase tracking-widest text-ink/60">Boyutlar</p>

      <div class="flex flex-wrap items-center gap-3">
        <Badge variant="success" size="sm">Small</Badge>
        <Badge variant="success" size="md">Medium</Badge>
        <Badge variant="info" size="sm" dot>Sıradaki</Badge>
        <Badge variant="info" size="md" dot>Sıradaki</Badge>
      </div>
    </div>

    <div class="rounded-2xl border border-line bg-surface px-5 py-4">
      <p class="label mb-3 uppercase tracking-widest text-ink/60">
        Dot + Icon + Text Kombinasyonları
      </p>

      <div class="flex flex-wrap items-center gap-2">
        <Badge variant="purple">SADECE TEXT</Badge>
        <Badge variant="success" dot>YAYINDA</Badge>
        <Badge variant="warning" dot>BEKLEMEDE</Badge>
        <Badge variant="danger" dot pulse>HATA</Badge>

        <Badge variant="info">
          <template #icon>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </template>
          ONAYLANDI
        </Badge>

        <Badge variant="purple">
          <template #icon>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <polygon
                points="12 2 15 8.5 22 9.3 17 14 18.2 21 12 17.8 5.8 21 7 14 2 9.3 9 8.5 12 2"
              />
            </svg>
          </template>
          PREMIUM
        </Badge>

        <Badge variant="neutral">
          v1.0.4
          <template #trailing>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </template>
        </Badge>
      </div>
    </div>

    <div class="rounded-2xl border border-line bg-surface px-5 py-4">
      <p class="label mb-3 uppercase tracking-widest text-ink/60">
        Interactive Chips (filter)
      </p>

      <div class="flex flex-wrap items-center gap-2">
        <Badge
          v-for="f in filters"
          :key="f"
          variant="info"
          interactive
          :active="activeFilter === f"
          :uppercase="false"
          @badge-click="setFilter(f)"
        >
          {{ f }}
        </Badge>
      </div>

      <p class="mt-3 text-sm text-ink/60">
        Seçili: <strong>{{ activeFilter }}</strong>
      </p>
    </div>

    <div class="rounded-2xl border border-line bg-surface px-5 py-4">
      <p class="label mb-3 uppercase tracking-widest text-ink/60">State'ler</p>
      <div class="flex flex-wrap items-center gap-3">
        <Badge variant="success" interactive>Default</Badge>
        <Badge variant="success" interactive active>Active</Badge>
        <Badge variant="success" disabled>Disabled</Badge>
        <Badge variant="danger" disabled dot>Disabled + Dot</Badge>
      </div>
    </div>

    <BarnPanel />
  </section>
</template>
