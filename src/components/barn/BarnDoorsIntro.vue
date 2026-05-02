<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";

interface Props {
  duration?: number;
  delay?: number;
}

const props = withDefaults(defineProps<Props>(), {
  duration: 1400,
  delay: 120,
});

const emit = defineEmits<{
  (e: "finished"): void;
}>();

type Phase = "closed" | "opening" | "fading" | "gone";

const phase = ref<Phase>("closed");
const reduced = ref(false);

let openTimer: ReturnType<typeof setTimeout> | null = null;
let fadeTimer: ReturnType<typeof setTimeout> | null = null;
let endTimer: ReturnType<typeof setTimeout> | null = null;

const finish = () => {
  phase.value = "gone";
  emit("finished");
};

onMounted(() => {
  const mql = window.matchMedia?.("(prefers-reduced-motion: reduce)");
  reduced.value = !!mql?.matches;
  if (reduced.value) {
    finish();
    return;
  }

  const openAt = Math.max(0, props.delay);
  const fadeAt = Math.max(openAt + 200, props.duration - 320);
  const endAt = Math.max(fadeAt + 280, props.duration);

  openTimer = setTimeout(() => (phase.value = "opening"), openAt);
  fadeTimer = setTimeout(() => (phase.value = "fading"), fadeAt);
  endTimer = setTimeout(finish, endAt);
});

onBeforeUnmount(() => {
  if (openTimer) clearTimeout(openTimer);
  if (fadeTimer) clearTimeout(fadeTimer);
  if (endTimer) clearTimeout(endTimer);
});
</script>

<template>
  <Teleport to="body">
    <div
      v-if="phase !== 'gone'"
      class="barn-doors"
      :class="[`barn-doors--${phase}`]"
      role="presentation"
      aria-hidden="true"
    >
      <div class="barn-doors__panel barn-doors__panel--left">
        <div class="barn-doors__plank" />
        <div class="barn-doors__plank" />
        <div class="barn-doors__plank" />
        <span class="barn-doors__handle" />
      </div>

      <div class="barn-doors__panel barn-doors__panel--right">
        <div class="barn-doors__plank" />
        <div class="barn-doors__plank" />
        <div class="barn-doors__plank" />
        <span class="barn-doors__handle" />
      </div>

      <div class="barn-doors__beam" />
    </div>
  </Teleport>
</template>

<style scoped>
.barn-doors {
  position: fixed;
  inset: 0;
  z-index: 100;
  pointer-events: none;
  perspective: 1400px;
  transform-style: preserve-3d;
  transition: opacity 280ms ease-out;
  opacity: 1;
}

.barn-doors--fading {
  opacity: 0;
}

.barn-doors__panel {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 50%;
  background:
    repeating-linear-gradient(
      90deg,
      #6c3a1a 0 8px,
      #5a2f14 8px 9px,
      #6c3a1a 9px 16px
    ),
    linear-gradient(180deg, #7a4220 0%, #4f2a10 100%);
  background-blend-mode: multiply;
  box-shadow:
    inset 0 0 0 4px rgba(0, 0, 0, 0.35),
    inset 0 0 80px rgba(0, 0, 0, 0.45);
  transform-origin: 0% 50%;
  will-change: transform;
  transition: transform 1100ms cubic-bezier(0.6, 0, 0.2, 1);
}

.barn-doors__panel--left {
  left: 0;
  transform-origin: 0% 50%;
  border-right: 2px solid rgba(0, 0, 0, 0.4);
}

.barn-doors__panel--right {
  right: 0;
  transform-origin: 100% 50%;
  border-left: 2px solid rgba(0, 0, 0, 0.4);
}

.barn-doors--opening .barn-doors__panel--left {
  transform: rotateY(-105deg);
}

.barn-doors--opening .barn-doors__panel--right {
  transform: rotateY(105deg);
}

.barn-doors__plank {
  position: absolute;
  left: 8%;
  right: 8%;
  height: 18px;
  background: rgba(0, 0, 0, 0.45);
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  border-bottom: 1px solid rgba(0, 0, 0, 0.6);
}

.barn-doors__plank:nth-child(1) {
  top: 14%;
}
.barn-doors__plank:nth-child(2) {
  top: 50%;
  transform: translateY(-50%);
}
.barn-doors__plank:nth-child(3) {
  bottom: 14%;
}

.barn-doors__handle {
  position: absolute;
  top: 50%;
  width: 14px;
  height: 56px;
  border-radius: 6px;
  background: linear-gradient(180deg, #d6b06b 0%, #8b6a2c 100%);
  box-shadow:
    0 0 0 2px rgba(0, 0, 0, 0.4),
    inset 0 0 0 1px rgba(255, 255, 255, 0.25);
  transform: translateY(-50%);
}

.barn-doors__panel--left .barn-doors__handle {
  right: 18px;
}
.barn-doors__panel--right .barn-doors__handle {
  left: 18px;
}

.barn-doors__beam {
  position: absolute;
  inset: 0;
  background: radial-gradient(
    ellipse at 50% 50%,
    color-mix(in srgb, var(--color-gold) 35%, transparent) 0%,
    transparent 55%
  );
  opacity: 0;
  transition: opacity 900ms ease-out;
  mix-blend-mode: screen;
}

.barn-doors--opening .barn-doors__beam {
  opacity: 1;
}

@media (prefers-reduced-motion: reduce) {
  .barn-doors {
    display: none;
  }
}
</style>
