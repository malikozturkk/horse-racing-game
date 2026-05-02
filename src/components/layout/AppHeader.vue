<script setup lang="ts">
import { computed, useSlots } from "vue";

interface Props {
  title: string;
  subtitle?: string | null;
  icon: string;
  meta?: string | null;
}

const props = withDefaults(defineProps<Props>(), {
  subtitle: null,
  meta: null,
});

const slots = useSlots();
const hasSubtitle = computed(
  () => Boolean(props.subtitle) || Boolean(props.meta)
);
const hasActions = computed(() => Boolean(slots.actions || slots.status));
</script>

<template>
  <header class="app-header" role="banner">
    <div class="app-header__brand">
      <span class="app-header__logo" aria-hidden="true">{{ props.icon }}</span>

      <div class="app-header__title">
        <h1>{{ title }}</h1>
        <p v-if="hasSubtitle" class="app-header__subtitle">
          <span v-if="subtitle">{{ subtitle }}</span>
          <span
            v-if="subtitle && meta"
            aria-hidden="true"
            class="app-header__sep"
            >•</span
          >
          <span v-if="meta" class="mono">{{ meta }}</span>
        </p>
      </div>
    </div>

    <div v-if="hasActions" class="app-header__actions">
      <slot name="status" />
      <slot name="actions" />
    </div>
  </header>
</template>

<style scoped>
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  padding: 1.1rem 1.5rem;
  background: var(--color-surface);
  border-bottom: 3px solid var(--color-ink);
  position: sticky;
  top: 0;
  z-index: 30;
  backdrop-filter: saturate(160%) blur(6px);
}

.app-header__brand {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  min-width: 0;
}

.app-header__logo {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--color-turf);
  border: 2px solid var(--ink);
  box-shadow: 0 3px 0 0 var(--turf-deep);
  flex-shrink: 0;
}

.app-header__title {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.app-header__title h1 {
  font-size: 28px;
  line-height: 1;
  letter-spacing: -0.01em;
}

.app-header__subtitle {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.2rem;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--color-ink) 55%, white);
}

.app-header__sep {
  color: color-mix(in srgb, var(--color-ink) 25%, white);
}

.app-header__actions {
  display: inline-flex;
  align-items: center;
  gap: 0.65rem;
  flex-shrink: 0;
}

@media (max-width: 720px) {
  .app-header {
    padding: 0.85rem 1rem;
    gap: 0.75rem;
  }
  .app-header__title h1 {
    font-size: 20px;
  }
  .app-header__subtitle {
    display: none;
  }
  .app-header__logo {
    width: 32px;
    height: 32px;
    border-radius: 9px;
  }
  .app-header__actions {
    gap: 0.4rem;
  }
}

@media (max-width: 480px) {
  .app-header {
    padding: 0.75rem 0.85rem;
  }
  .app-header__title h1 {
    font-size: 18px;
  }
}
</style>
