<script setup lang="ts">
import { computed } from "vue";
import type { Horse } from "../../domain/horse/types";
import type { HorseId } from "../../domain/shared/types";
import type { ParticipantRuntime } from "../../domain/race/types";
import Badge from "../ui/Badge.vue";
import RaceLane from "./RaceLane.vue";

interface Props {
  title: string;
  distance: number;
  roundNumber: number;
  participants: readonly ParticipantRuntime[];
  horsesById: Readonly<Record<HorseId, Horse>>;
  status: "lineup" | "live" | "photoFinish" | "completed" | "paused";
}

const props = defineProps<Props>();

interface LaneVm {
  laneNumber: number;
  horse: Horse;
  progress: number;
  finished: boolean;
}

const lanes = computed<readonly LaneVm[]>(() => {
  const sorted = [...props.participants].sort((a, b) => a.lane - b.lane);
  const out: LaneVm[] = [];
  for (const p of sorted) {
    const horse = props.horsesById[p.horseId];
    if (!horse) continue;
    const ratio =
      props.distance > 0
        ? Math.min(1, Math.max(0, p.progressMeters / props.distance))
        : 0;
    out.push({
      laneNumber: p.lane + 1,
      horse,
      progress: ratio,
      finished: p.finishedAt !== null,
    });
  }
  return out;
});

const isLive = computed(() => props.status === "live");
const isLineup = computed(() => props.status === "lineup");
const isPhoto = computed(() => props.status === "photoFinish");
const isPaused = computed(() => props.status === "paused");
const isCompleted = computed(() => props.status === "completed");

interface BadgeSpec {
  label: string;
  variant: "danger" | "warning" | "success" | "info" | "neutral";
  dot: boolean;
  pulse: boolean;
}

const statusBadge = computed<BadgeSpec>(() => {
  if (isLive.value) {
    return { label: "CANLI", variant: "danger", dot: true, pulse: true };
  }
  if (isPhoto.value) {
    return { label: "FOTO FİNİŞ", variant: "warning", dot: true, pulse: false };
  }
  if (isCompleted.value) {
    return { label: "TAMAM", variant: "success", dot: true, pulse: false };
  }
  if (isPaused.value) {
    return {
      label: "DURAKLATILDI",
      variant: "warning",
      dot: true,
      pulse: false,
    };
  }
  return { label: "SIRADA", variant: "info", dot: false, pulse: false };
});

const distanceLabel = computed(() => `${props.distance}m`);
const showHorseName = computed(() => !isLineup.value);
</script>

<template>
  <section class="track" :aria-label="`Round ${roundNumber} — ${title}`">
    <header class="track__head">
      <div class="track__title">
        <span class="track__round mono">R{{ roundNumber }}</span>
        <h2 class="track__name">{{ title }}</h2>
      </div>
      <div class="track__meta">
        <Badge
          :variant="statusBadge.variant"
          :dot="statusBadge.dot"
          :pulse="statusBadge.pulse"
          size="sm"
        >
          {{ statusBadge.label }}
        </Badge>
        <span class="track__distance mono">{{ distanceLabel }}</span>
      </div>
    </header>

    <div class="track__body">
      <ol class="track__lanes" role="list" aria-label="Yarış pisti">
        <li v-for="lane in lanes" :key="lane.horse.id" class="track__lane">
          <RaceLane
            :lane-number="lane.laneNumber"
            :horse="lane.horse"
            :progress="lane.progress"
            :finished="lane.finished"
            :static-only="isLineup"
            :show-name="showHorseName"
          />
        </li>
      </ol>
    </div>
  </section>
</template>

<style scoped>
.track {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  background: var(--color-surface);
  border: 1px solid var(--color-line);
  border-radius: 1.25rem;
  overflow: hidden;
  isolation: isolate;
}

.track__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.7rem 1rem;
  background: var(--color-ink);
  color: #fff;
  border-bottom: 1px solid color-mix(in srgb, var(--color-ink) 70%, black);
}

.track__title {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  min-width: 0;
}

.track__round {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.2rem 0.45rem;
  font-family: var(--font-mono);
  font-size: 11.5px;
  font-weight: 800;
  letter-spacing: 0.05em;
  border-radius: 0.35rem;
  background: var(--color-gold);
  color: var(--color-ink);
  flex-shrink: 0;
}

.track__name {
  margin: 0;
  font-family: var(--font-display);
  font-size: 16px;
  font-weight: 700;
  color: #fff;
  letter-spacing: -0.005em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.track__meta {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}

.track__distance {
  display: inline-flex;
  align-items: center;
  padding: 0.18rem 0.55rem;
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.04em;
  background: color-mix(in srgb, #fff 18%, transparent);
  color: #fff;
  border-radius: 9999px;
  border: 1px solid color-mix(in srgb, #fff 25%, transparent);
}

.track__body {
  background: linear-gradient(180deg, #6bba3e 0%, #5aa532 100%);
  padding: 20px 22px;
  border-radius: 0 0 20px 20px;
  border: 3px solid var(--ink);
  box-shadow: var(--shadow-pop-md);
  position: relative;
  overflow: hidden;
  overflow-y: auto;
  scrollbar-width: none;
}

.track__lanes {
  display: flex;
  flex-direction: column;
  gap: 6px;
  position: relative;
}

@media (max-width: 640px) {
  .track__head {
    padding: 0.55rem 0.7rem;
  }

  .track__name {
    font-size: 14px;
  }

  .track__round {
    font-size: 10.5px;
    padding: 0.15rem 0.35rem;
  }

  .track__body {
    padding: 0.55rem;
  }

  .track__lanes {
    gap: 0.35rem;
  }
}
</style>
