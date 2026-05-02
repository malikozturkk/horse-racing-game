<script setup lang="ts">
import { computed } from "vue";
import { RouterLink } from "vue-router";
import AppHeader from "../layout/AppHeader.vue";
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
  <AppHeader title="Ahır" :subtitle="subtitle" :meta="countLabel" icon="🐴">
    <template #status>
      <Badge variant="success" size="xl" dot>Ahır Açık</Badge>
    </template>
    <template #actions>
      <div class="hv__action-group">
        <Button
          class="barn-header__regenerate"
          variant="outline"
          size="md"
          @button-click="emit('regenerate')"
        >
          Yeniden Üret
        </Button>
      </div>
      <div class="hv__action-divider" aria-hidden="true"></div>
      <RouterLink
        :to="{ name: 'home' }"
        class="barn-header__home"
        aria-label="Hipodroma dön"
      >
        <Button variant="info" size="md">Hipodrom</Button>
      </RouterLink>
    </template>
  </AppHeader>
</template>

<style scoped>
.barn-header__home {
  text-decoration: none;
}

@media (max-width: 720px) {
  .barn-header__regenerate {
    display: none;
  }
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
</style>
