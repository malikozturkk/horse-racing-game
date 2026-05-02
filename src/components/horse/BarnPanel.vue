<script setup lang="ts">
import { computed } from "vue";
import { useBarn } from "../../composables/useBarn";
import HorseProfile from "./HorseProfile.vue";
import HorseWithJockey from "./HorseWithJockey.vue";
import ConditionBar from "../ui/ConditionBar.vue";
import Button from "../ui/Button.vue";
import Badge from "../ui/Badge.vue";

const { allHorses, raceEntrants, hasLineup, drawLineup, resetBarn } = useBarn({
  autoTick: true,
  tickInterval: 250,
  maxDecay: 1.4,
});

const sortedBarn = computed(() =>
  [...allHorses.value].sort((a, b) => b.condition - a.condition)
);
</script>

<template>
  <section class="rounded-2xl border border-line bg-surface px-5 py-4">
    <header class="mb-4 flex items-center justify-between gap-4">
      <p class="label uppercase tracking-widest text-ink/60">
        Ahır — 20 At (canlı kondisyon)
      </p>
      <div class="flex gap-2">
        <Button variant="primary" size="sm" @button-click="drawLineup()">
          10 At Seç
        </Button>
        <Button variant="outline" size="sm" @button-click="resetBarn()">
          Sıfırla
        </Button>
      </div>
    </header>

    <ol class="grid grid-cols-1 gap-2 sm:grid-cols-2" role="list">
      <li
        v-for="horse in sortedBarn"
        :key="horse.id"
        v-memo="[horse.condition]"
        class="flex items-center gap-3 rounded-xl border border-line px-3 py-2"
      >
        <Badge
          variant="neutral"
          size="sm"
          :uppercase="false"
          class="w-6 shrink-0 justify-center font-mono"
        >
          {{ horse.id }}
        </Badge>
        <HorseProfile :visual="horse.visual" :size="36" />
        <div class="min-w-0 flex-1">
          <p class="truncate text-sm font-bold text-ink leading-tight">
            {{ horse.name }}
          </p>
          <p class="truncate text-xs text-ink/50 leading-tight">
            {{ horse.visual.coloring.coatName }}
          </p>
        </div>

        <div class="w-32 shrink-0">
          <ConditionBar :value="horse.condition" :show-label="false" />
        </div>
      </li>
    </ol>
  </section>

  <section class="rounded-2xl border border-line bg-surface px-5 py-4">
    <header class="mb-4 flex items-center justify-between gap-4">
      <p class="label uppercase tracking-widest text-ink/60">
        Yarış Kadrosu ({{ raceEntrants.length }} / 10)
      </p>
      <Badge v-if="!hasLineup" variant="neutral">Kadro seçilmedi</Badge>
      <Badge v-else variant="success" dot>Hazır</Badge>
    </header>

    <p v-if="!hasLineup" class="text-sm text-ink/50">
      Yukarıdaki <strong>10 At Seç</strong> butonuna basarak yarış kadrosunu
      oluşturun.
    </p>

    <ol
      v-else
      class="grid gap-4"
      style="grid-template-columns: repeat(auto-fill, minmax(200px, 1fr))"
      role="list"
    >
      <li
        v-for="horse in raceEntrants"
        :key="horse.id"
        class="flex flex-col items-center gap-2 rounded-2xl border border-line bg-bg px-3 pt-4 pb-3"
      >
        <HorseWithJockey
          :horse-number="horse.id"
          :visual="horse.visual"
          :width="200"
        />

        <div class="flex w-full items-center gap-2">
          <HorseProfile :visual="horse.visual" :size="28" />
          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-bold text-ink">{{ horse.name }}</p>
            <p class="truncate text-xs text-ink/50">
              {{ horse.visual.coloring.coatName }}
            </p>
          </div>
          <span
            class="h-5 w-5 shrink-0 rounded-full border border-line"
            :style="{ background: horse.visual.silkColor }"
            :title="`Jokeyformasi: ${horse.visual.silkColor}`"
          />
        </div>

        <div class="w-full">
          <ConditionBar :value="horse.condition" :show-label="false" />
        </div>
      </li>
    </ol>
  </section>
</template>
