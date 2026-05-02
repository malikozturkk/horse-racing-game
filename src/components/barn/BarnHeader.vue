<script setup lang="ts">
import { computed } from "vue";
import { RouterLink } from "vue-router";
import Badge from "../ui/Badge.vue";
import Button from "../ui/Button.vue";

interface Props {
  horseCount: number;
  subtitle?: string;
}

const props = withDefaults(defineProps<Props>(), {
  subtitle: "Aktif Kadro",
});

const emit = defineEmits<{
  (e: "regenerate"): void;
}>();

const countLabel = computed(() => `${props.horseCount} ATLI KADRO`);
</script>

<template>
  <header class="barn-header" role="banner">
    <div class="barn-header__brand">
      <span class="barn-header__logo" aria-hidden="true">
        <svg viewBox="0 0 32 32" width="22" height="22">
          <path
            d="M4 14 L16 5 L28 14 L28 27 L4 27 Z"
            fill="#fff"
            stroke="#2B2440"
            stroke-width="2.4"
            stroke-linejoin="round"
          />
          <path
            d="M16 5 L16 27 M4 14 L28 14 M16 14 L16 27 M10 27 L10 18 L22 18 L22 27"
            stroke="#2B2440"
            stroke-width="1.8"
            fill="none"
            stroke-linejoin="round"
          />
        </svg>
      </span>

      <div class="barn-header__title">
        <h1>Ahır</h1>
        <p class="barn-header__subtitle">
          <span>{{ subtitle }}</span>
          <span aria-hidden="true" class="barn-header__sep">•</span>
          <span class="mono">{{ countLabel }}</span>
        </p>
      </div>
    </div>

    <div class="barn-header__actions">
      <Badge variant="success" dot>Ahır Açık</Badge>
      <Button variant="outline" size="md" @button-click="emit('regenerate')">
        Yeniden Üret
      </Button>
      <RouterLink
        :to="{ name: 'home' }"
        class="barn-header__home"
        aria-label="Hipodroma dön"
      >
        <Button variant="primary" size="md">Hipodrom</Button>
      </RouterLink>
    </div>
  </header>
</template>

<style scoped>
.barn-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  padding: 1.1rem 1.5rem;
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-line);
  position: sticky;
  top: 0;
  z-index: 30;
  backdrop-filter: saturate(160%) blur(6px);
}

.barn-header__brand {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  min-width: 0;
}

.barn-header__logo {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--color-turf-soft);
  border: 1.5px solid color-mix(in srgb, var(--color-turf) 38%, white);
  box-shadow: 0 2px 0 0 color-mix(in srgb, var(--color-turf) 30%, white);
  flex-shrink: 0;
}

.barn-header__title {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.barn-header__title h1 {
  font-size: 28px;
  line-height: 1;
  letter-spacing: -0.01em;
}

.barn-header__subtitle {
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

.barn-header__sep {
  color: color-mix(in srgb, var(--color-ink) 25%, white);
}

.barn-header__actions {
  display: inline-flex;
  align-items: center;
  gap: 0.65rem;
  flex-shrink: 0;
}

.barn-header__home {
  text-decoration: none;
}

@media (max-width: 720px) {
  .barn-header {
    padding: 0.9rem 1rem;
    flex-wrap: wrap;
  }
  .barn-header__title h1 {
    font-size: 22px;
  }
  .barn-header__actions :nth-child(2) {
    display: none;
  }
}

@media (max-width: 480px) {
  .barn-header__subtitle {
    font-size: 10.5px;
    letter-spacing: 0.05em;
  }
}
</style>
