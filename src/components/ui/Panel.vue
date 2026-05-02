<script setup lang="ts">
import { computed, useSlots } from "vue";

type Tone = "default" | "ink" | "turf" | "gold" | "finish" | "sky";

interface Props {
  tone?: Tone;
  title?: string | null;
  scrollY?: boolean;
  flush?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  tone: "default",
  title: null,
  scrollY: false,
  flush: false,
});

const slots = useSlots();
const hasHeader = computed(
  () => Boolean(slots.title) || Boolean(props.title) || Boolean(slots.actions)
);

const panelClass = computed(() => ["panel", `panel--${props.tone}`]);
</script>

<template>
  <section :class="panelClass">
    <header v-if="hasHeader" class="panel__head">
      <h2 class="panel__title">
        <slot name="title">{{ title }}</slot>
      </h2>
      <div v-if="$slots.actions" class="panel__actions">
        <slot name="actions" />
      </div>
    </header>

    <div
      class="panel__body"
      :class="{
        'panel__body--scroll': scrollY,
        'panel__body--flush': flush,
      }"
    >
      <slot />
    </div>

    <footer v-if="$slots.footer" class="panel__footer">
      <slot name="footer" />
    </footer>
  </section>
</template>

<style scoped>
.panel {
  --panel-radius: 1.25rem;
  --panel-bg: var(--color-surface);
  --panel-border: var(--ink);
  --panel-head-bg: var(--color-surface);
  --panel-head-text: var(--color-ink);

  display: flex;
  flex-direction: column;
  background: var(--panel-bg);
  border: 2.5px solid var(--panel-border);
  border-radius: var(--panel-radius);
  overflow: hidden;
  position: relative;
  isolation: isolate;
}

.panel--ink {
  --panel-head-bg: var(--color-ink);
  --panel-head-text: #fff;
}

.panel--turf {
  --panel-head-bg: var(--color-turf);
  --panel-head-text: var(--color-surface);
  --panel-border: var(--color-turf-deep);
}

.panel--gold {
  --panel-head-bg: var(--color-gold);
  --panel-head-text: var(--color-ink);
  --panel-border: var(--color-gold-deep);
}

.panel--finish {
  --panel-head-bg: color-mix(in srgb, var(--color-finish) 14%, white);
  --panel-head-text: color-mix(in srgb, var(--color-finish) 78%, black);
  --panel-border: color-mix(
    in srgb,
    var(--color-finish) 30%,
    var(--color-line)
  );
}

.panel--sky {
  --panel-head-bg: var(--color-sky);
  --panel-head-text: var(--color-surface);
  --panel-border: var(--color-ink);
}

.panel__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.6rem;
  padding: 0.875rem 1rem;
  background: var(--panel-head-bg);
  color: var(--panel-head-text);
  border-bottom: 2.5px solid var(--panel-border);
}

.panel__title {
  font-family: var(--font-display);
  font-size: 17px;
  font-weight: 900;
  letter-spacing: 0;
  margin: 0;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: inherit;
  min-width: 0;
}

.panel__actions {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.panel__body {
  padding: 1rem;
  flex: 1 1 auto;
  min-height: 0;
}

.panel__body--flush {
  padding: 0;
}

.panel__body--scroll {
  overflow-y: auto;
}

.panel__footer {
  padding: 0.6rem 1rem;
  border-top: 1px solid var(--color-line);
  background: var(--color-bg);
}
</style>
