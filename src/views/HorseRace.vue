<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { RouterLink } from "vue-router";
import {
  useBarnStore,
  useScheduleStore,
  useRaceStore,
  useResultsStore,
  useSessionStore,
} from "../stores";
import { useRaceLifecycle } from "../composables/useRaceLifecycle";
import { useSeasonLifecycle } from "../composables/useSeasonLifecycle";
import type { HorseId } from "../domain/shared/types";
import type { Horse } from "../domain/horse/types";
import type { Round } from "../domain/schedule/types";
import type { ParticipantRuntime } from "../domain/race/types";
import AppHeader from "../components/layout/AppHeader.vue";
import Badge from "../components/ui/Badge.vue";
import Button from "../components/ui/Button.vue";
import RoundTimeline from "../components/ui/RoundTimeline.vue";
import HorseRosterPanel from "../components/race/HorseRosterPanel.vue";
import RaceTrack from "../components/race/RaceTrack.vue";
import ProgramPanel from "../components/race/ProgramPanel.vue";
import LiveResultsPanel from "../components/race/LiveResultsPanel.vue";
import EmptyHipodromCenter from "../components/race/EmptyHipodromCenter.vue";
import EmptyPlaceholder from "../components/race/EmptyPlaceholder.vue";
import ChampionCard from "../components/race/ChampionCard.vue";
import SeasonStandings from "../components/race/SeasonStandings.vue";

const barn = useBarnStore();
const schedule = useScheduleStore();
const race = useRaceStore();
const results = useResultsStore();
const session = useSessionStore();

const { allHorses, byId: horseById } = storeToRefs(barn);
const { rounds, currentRoundIndex } = storeToRefs(schedule);
const {
  runtime,
  liveStandings,
  isLive,
  isPaused,
  isPhotoFinish,
  activeRoundIndex,
} = storeToRefs(race);
const { orderedResults, standings, seasonChampion, latestResult } =
  storeToRefs(results);
const { phase, seasonNumber, statusLabel } = storeToRefs(session);

useRaceLifecycle();
const { bootstrap } = useSeasonLifecycle({ autoBootstrap: false });

onMounted(() => {
  if (session.phase === "idle" && session.createdAt === 0) {
    bootstrap();
  }
  race.setAutoAdvance(false);
});

const horsesById = computed<Readonly<Record<HorseId, Horse>>>(
  () => horseById.value as Readonly<Record<HorseId, Horse>>
);

type ViewState =
  | "empty"
  | "scheduled"
  | "racing"
  | "paused"
  | "roundFinished"
  | "seasonFinished";

const viewState = computed<ViewState>(() => {
  switch (phase.value) {
    case "idle":
      return "empty";
    case "scheduled":
      return orderedResults.value.length > 0 && !schedule.isFullyCompleted
        ? "roundFinished"
        : "scheduled";
    case "racing":
      return "racing";
    case "paused":
      return "paused";
    case "seasonFinished":
      return "seasonFinished";
  }
});

const hasSchedule = computed(() => rounds.value.length > 0);

const timelineRounds = computed(() =>
  rounds.value.map((r) => ({
    id: r.id,
    distance: r.distanceMeters,
    label: `ROUND ${r.index + 1}`,
  }))
);

const timelineCurrentIndex = computed<number>(() => {
  if (schedule.isFullyCompleted) return rounds.value.length;
  return currentRoundIndex.value ?? 0;
});

const currentRound = computed<Round | null>(() => {
  if (viewState.value === "racing" || viewState.value === "paused") {
    const idx = activeRoundIndex.value;
    if (idx === null) return null;
    return rounds.value[idx] ?? null;
  }
  if (viewState.value === "roundFinished") {
    const r = latestResult.value;
    if (!r) return null;
    return rounds.value.find((rd) => rd.id === r.roundId) ?? null;
  }
  if (viewState.value === "scheduled") {
    const idx = currentRoundIndex.value ?? 0;
    return rounds.value[idx] ?? null;
  }
  return null;
});

const currentRoundLineupIds = computed<readonly HorseId[]>(() => {
  if (
    viewState.value === "racing" ||
    viewState.value === "paused" ||
    viewState.value === "scheduled"
  ) {
    return currentRound.value?.lineup ?? [];
  }
  return [];
});

interface TrackPropsVm {
  title: string;
  distance: number;
  roundNumber: number;
  participants: readonly ParticipantRuntime[];
  status: "lineup" | "live" | "photoFinish" | "completed" | "paused";
}

const trackProps = computed<TrackPropsVm | null>(() => {
  if (viewState.value === "scheduled") {
    const round = currentRound.value;
    if (!round) return null;
    const participants: ParticipantRuntime[] = round.lineup.map(
      (horseId, idx) => {
        const condition = horseById.value[horseId]?.condition ?? 0;
        return {
          horseId,
          lane: idx,
          conditionAtStart: condition,
          conditionCurrent: condition,
          decayPerMeter: 0,
          progressMeters: 88,
          speedMps: 0,
          finishedAt: null,
          finishRank: null,
        };
      }
    );
    return {
      title: round.name,
      distance: round.distanceMeters,
      roundNumber: round.index + 1,
      participants,
      status: "lineup",
    };
  }

  if (viewState.value === "racing" || viewState.value === "paused") {
    const r = runtime.value;
    const round = currentRound.value;
    if (!r || !round) return null;
    let trackStatus: "live" | "photoFinish" | "paused" = "live";
    if (viewState.value === "paused") trackStatus = "paused";
    else if (isPhotoFinish.value && isLive.value) trackStatus = "photoFinish";
    return {
      title: round.name,
      distance: r.distance,
      roundNumber: round.index + 1,
      participants: r.participants,
      status: trackStatus,
    };
  }

  if (viewState.value === "roundFinished") {
    const round = currentRound.value;
    const r = runtime.value;
    if (!round || !r) return null;
    return {
      title: round.name,
      distance: r.distance,
      roundNumber: round.index + 1,
      participants: r.participants,
      status: "completed",
    };
  }

  return null;
});

interface StatusBadgeVm {
  label: string;
  variant: "neutral" | "success" | "warning" | "danger" | "info";
  dot: boolean;
  pulse: boolean;
}

const statusBadge = computed<StatusBadgeVm>(() => {
  switch (viewState.value) {
    case "empty":
      return {
        label: statusLabel.value,
        variant: "neutral",
        dot: false,
        pulse: false,
      };
    case "scheduled":
      return {
        label: "Program Hazır",
        variant: "info",
        dot: false,
        pulse: false,
      };
    case "racing":
      if (isPhotoFinish.value) {
        return {
          label: "Foto Finiş",
          variant: "warning",
          dot: true,
          pulse: false,
        };
      }
      return {
        label: "Yarış Sürüyor",
        variant: "danger",
        dot: true,
        pulse: true,
      };
    case "paused":
      return {
        label: "Duraklatıldı",
        variant: "warning",
        dot: true,
        pulse: false,
      };
    case "roundFinished":
      return {
        label: "Round Bitti",
        variant: "warning",
        dot: false,
        pulse: false,
      };
    case "seasonFinished":
      return {
        label: "Yarışma Bitti",
        variant: "success",
        dot: false,
        pulse: false,
      };
  }
});

const startButtonLabel = computed(() => {
  if (viewState.value === "racing") return "Duraklat";
  if (viewState.value === "paused") return "Devam Et";
  return "Başlat";
});

const startButtonVariant = computed<"primary" | "danger">(() =>
  viewState.value === "racing" ? "danger" : "primary"
);

const canPressStart = computed(() => {
  if (viewState.value === "scheduled") return true;
  if (viewState.value === "racing") return true;
  if (viewState.value === "paused") return true;
  if (viewState.value === "roundFinished") return true;
  return false;
});

const canPressGenerate = computed(
  () => viewState.value !== "racing" && viewState.value !== "paused"
);

const handleGenerate = () => {
  if (session.phase === "racing" || session.phase === "paused") {
    session.stopRace();
  }
  if (session.phase === "scheduled" || session.phase === "seasonFinished") {
    session.resetSession();
  }
  session.generateSchedule();
};

const handleStart = () => {
  if (viewState.value === "racing") {
    session.pauseRace();
    return;
  }

  if (viewState.value === "paused") {
    session.resumeRace();
    return;
  }

  if (viewState.value === "roundFinished" || viewState.value === "scheduled") {
    session.startRace();
  }
};

const handleNewSeason = () => {
  session.startNewSeason();
};

type MobileTab = "race" | "horses" | "results";
const mobileTab = ref<MobileTab>("race");

watch(viewState, (s) => {
  if (s === "empty") mobileTab.value = "race";
  if (s === "seasonFinished") mobileTab.value = "results";
});

const headerSubtitle = computed(() =>
  seasonNumber.value > 0 ? "Hipodrom" : "Hipodrom"
);

const headerMeta = computed(() =>
  seasonNumber.value > 0 ? `SEZON ${seasonNumber.value}` : null
);

const showRosterSeparate = computed(() => viewState.value !== "seasonFinished");

const showProgramRight = computed(
  () => viewState.value === "scheduled" || viewState.value === "roundFinished"
);
const showResultsRight = computed(
  () =>
    viewState.value === "racing" ||
    viewState.value === "paused" ||
    viewState.value === "roundFinished"
);
</script>

<template>
  <main class="hv">
    <AppHeader
      title="At Yarışı"
      :subtitle="headerSubtitle"
      :meta="headerMeta"
      icon="🏇"
    >
      <template #status>
        <Badge
          :variant="statusBadge.variant"
          :dot="statusBadge.dot"
          :pulse="statusBadge.pulse"
          size="xl"
        >
          {{ statusBadge.label }}
        </Badge>
      </template>

      <template #actions>
        <div class="hv__action-group">
          <Button
            variant="outline"
            size="md"
            :disabled="!canPressGenerate"
            class="hv__btn-generate"
            @button-click="handleGenerate"
          >
            Program Üret
          </Button>

          <Button
            v-if="viewState !== 'seasonFinished'"
            :variant="startButtonVariant"
            size="md"
            :disabled="!canPressStart"
            @button-click="handleStart"
          >
            {{ startButtonLabel }}
          </Button>

          <Button
            v-else
            variant="primary"
            size="md"
            @button-click="handleNewSeason"
          >
            Başlat
          </Button>
        </div>

        <div class="hv__action-divider" aria-hidden="true"></div>

        <RouterLink
          :to="{ name: 'barn' }"
          class="hv__barn-link"
          aria-label="Ahıra git"
        >
          <Button variant="info" size="md" class="hv__btn-barn"> Ahır </Button>
        </RouterLink>
      </template>
    </AppHeader>

    <section class="hv__body">
      <RoundTimeline
        v-if="hasSchedule"
        class="hv__timeline"
        :rounds="timelineRounds"
        :current-index="timelineCurrentIndex"
        :title="null"
      />

      <div class="hv__grid" :class="`hv__grid--${viewState}`">
        <aside
          v-if="showRosterSeparate"
          class="hv__left"
          :data-mobile-active="mobileTab === 'horses'"
        >
          <HorseRosterPanel
            :horses="allHorses"
            :highlighted-ids="currentRoundLineupIds"
          />
        </aside>

        <section class="hv__center" :data-mobile-active="mobileTab === 'race'">
          <EmptyHipodromCenter
            v-if="viewState === 'empty'"
            @generate="handleGenerate"
          />

          <RaceTrack
            v-else-if="trackProps"
            :title="trackProps.title"
            :distance="trackProps.distance"
            :round-number="trackProps.roundNumber"
            :participants="trackProps.participants"
            :horses-by-id="horsesById"
            :status="trackProps.status"
          />

          <ChampionCard
            v-else-if="
              viewState === 'seasonFinished' &&
              seasonChampion &&
              horsesById[seasonChampion.horseId]
            "
            :champion="horsesById[seasonChampion.horseId]!"
            :total-points="seasonChampion.totalPoints"
            :wins="seasonChampion.wins"
            :average-time-ms="seasonChampion.averageTimeMs"
            :season-number="seasonNumber"
          />
        </section>

        <aside
          class="hv__right"
          :class="{ 'hv__right--split': viewState === 'empty' }"
          :data-mobile-active="mobileTab === 'results'"
        >
          <template v-if="viewState === 'empty'">
            <EmptyPlaceholder
              title="Program"
              :message="'Program henüz oluşturulmadı.\nYukarıdan üret.'"
              icon="📋"
              tone="turf"
            />
            <EmptyPlaceholder
              title="Sonuçlar"
              :message="'Henüz tamamlanmış round yok.\nİlk yarışı başlat.'"
              icon="🏆"
              tone="gold"
            />
          </template>

          <ProgramPanel
            v-if="showProgramRight"
            :rounds="rounds"
            :horses-by-id="horsesById"
            :current-round-index="currentRoundIndex"
          />

          <LiveResultsPanel
            v-if="showResultsRight"
            :rounds="rounds"
            :horses-by-id="horsesById"
            :live-round-index="
              viewState === 'racing' || viewState === 'paused'
                ? activeRoundIndex
                : null
            "
            :live-standings="liveStandings"
            :live-distance="runtime?.distance ?? 0"
            :results="orderedResults"
            :is-live="isLive"
            :is-paused="isPaused"
            :is-photo-finish="isPhotoFinish"
          />

          <SeasonStandings
            v-if="viewState === 'seasonFinished'"
            :standings="standings"
            :horses-by-id="horsesById"
          />
        </aside>
      </div>

      <div v-if="viewState === 'seasonFinished'" class="hv__season-actions">
        <RouterLink :to="{ name: 'barn' }" class="hv__barn-link">
          <Button variant="outline" size="md">AHIRI GÖR</Button>
        </RouterLink>
        <Button variant="primary" size="md" @button-click="handleNewSeason">
          YENİ SEZON BAŞLAT
        </Button>
      </div>
    </section>

    <nav
      v-if="hasSchedule || viewState === 'seasonFinished'"
      class="hv__mtabs"
      aria-label="Sayfa sekmeleri"
    >
      <Button
        :variant="mobileTab === 'race' ? 'primary' : 'outline'"
        size="md"
        @button-click="mobileTab = 'race'"
      >
        Yarış
      </Button>

      <Button
        :variant="mobileTab === 'horses' ? 'primary' : 'outline'"
        size="md"
        @button-click="mobileTab = 'horses'"
      >
        Atlar
      </Button>

      <Button
        :variant="mobileTab === 'results' ? 'primary' : 'outline'"
        size="md"
        @button-click="mobileTab = 'results'"
      >
        Sonuç
      </Button>
    </nav>
  </main>
</template>

<style scoped>
.hv {
  height: 100vh;
  height: 100dvh;
  background: var(--color-bg);
  color: var(--color-ink);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.hv__body {
  width: 100%;
  max-width: 1600px;
  margin: 0 auto;
  padding: 1rem 1.25rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  flex: 1 1 auto;
  min-height: 0;
}

.hv__timeline {
  flex-shrink: 0;
}

.hv__grid {
  display: grid;
  grid-template-columns: minmax(260px, 300px) minmax(0, 1fr) minmax(
      280px,
      340px
    );
  gap: 0.85rem;
  align-items: stretch;
  flex: 1 1 auto;
  min-height: 0;
}

.hv__grid--seasonFinished {
  grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr);
}

.hv__grid--seasonFinished .hv__left {
  display: none;
}

.hv__left,
.hv__center,
.hv__right {
  display: flex;
  flex-direction: column;
  min-height: 0;
  min-width: 0;
}

.hv__center > * {
  flex: 1 1 auto;
  min-height: 0;
}

.hv__right {
  gap: 0.7rem;
}

.hv__right > * {
  min-height: 0;
  flex: 1 1 0;
}

.hv__right--split > * {
  flex: 1 1 0;
}

.hv__season-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin-top: 0.25rem;
  flex-wrap: wrap;
  flex-shrink: 0;
}

.hv__barn-link {
  text-decoration: none;
}

.hv__mtabs {
  display: none;
}

.hv__action-group {
  display: flex;
  align-items: center;
  gap: 0.65rem;
}
.hv__action-divider {
  width: 2px;
  height: 24px;
  background-color: color-mix(in srgb, var(--color-ink) 15%, transparent);
  margin: 0 0.5rem;
}
@media (max-width: 720px) {
  .hv__action-divider {
    display: none;
  }
}

@media (max-width: 1024px) {
  .hv__grid {
    grid-template-columns: minmax(0, 1fr) minmax(260px, 320px);
    grid-template-areas: "center right" "left left";
  }

  .hv__grid > .hv__center {
    grid-area: center;
  }

  .hv__grid > .hv__right {
    grid-area: right;
  }

  .hv__grid > .hv__left {
    grid-area: left;
    max-height: 100%;
    flex: 0 0 auto;
  }

  .hv__grid--seasonFinished {
    grid-template-columns: minmax(0, 1fr);
    grid-template-areas: "center" "right";
  }
}

@media (max-width: 720px) {
  .hv {
    height: 100dvh;
    overflow: hidden;
  }

  .hv__body {
    padding: 0.75rem 0.75rem 5.5rem;
    gap: 0.65rem;
    flex: 1;
    min-height: 0;
    overflow: hidden;
  }

  .hv__btn-generate,
  .hv__btn-barn {
    display: none;
  }

  .hv__grid {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
  }

  .hv__left,
  .hv__center,
  .hv__right {
    display: none;
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }

  .hv__left[data-mobile-active="true"],
  .hv__center[data-mobile-active="true"],
  .hv__right[data-mobile-active="true"] {
    display: flex;
  }

  .hv__mtabs {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.4rem;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 0.55rem 0.85rem;
    background: var(--color-surface);
    border-top: 1px solid var(--color-line);
    z-index: 40;
    box-shadow: 0 -4px 16px -8px rgba(0, 0, 0, 0.1);
    width: 100%;
  }

  .hv__mtabs > * {
    flex: 1 1 0;
  }
}

@media (max-width: 480px) {
  .hv__body {
    padding: 0.55rem 0.6rem 5.5rem;
  }
}
</style>
