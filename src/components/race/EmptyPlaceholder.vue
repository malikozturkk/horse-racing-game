<script setup lang="ts">
import Panel from "../ui/Panel.vue";

interface Props {
  title: string;
  message: string;
  tone?: "turf" | "gold";
  icon: string;
}

withDefaults(defineProps<Props>(), {
  tone: "turf",
  iconKind: "program",
});
</script>

<template>
  <Panel :tone="tone" class="empty-pl">
    <template #title>
      <span>{{ icon }} {{ title }}</span>
    </template>

    <div class="empty-pl__body">
      <span class="empty-pl__icon" aria-hidden="true">
        {{ icon }}
      </span>

      <p class="empty-pl__text">{{ message }}</p>
    </div>
  </Panel>
</template>

<style scoped>
.empty-pl {
  height: 100%;
}

.empty-pl__body {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.55rem;
  text-align: center;
  padding: 1rem 0.75rem;
  color: color-mix(in srgb, var(--color-ink) 65%, white);
}

.empty-pl__icon {
  color: color-mix(in srgb, var(--color-ink) 45%, white);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
}

.empty-pl__text {
  font-size: 14px;
  font-weight: 600;
  margin: 0;
  line-height: 1.55;
  max-width: 18rem;
  white-space: pre-line;
}
</style>
