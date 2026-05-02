<script setup lang="ts">
import Button from "../ui/Button.vue";
import Badge from "../ui/Badge.vue";
import Panel from "../ui/Panel.vue";

interface Props {
  busy?: boolean;
}

withDefaults(defineProps<Props>(), { busy: false });

const emit = defineEmits<{
  (e: "generate"): void;
}>();
</script>

<template>
  <Panel tone="ink" class="empty-hippo">
    <template #title>
      <span>Hipodrom Hazır</span>
    </template>
    <template #actions>
      <Badge variant="neutral" size="lg">BEKLİYOR</Badge>
    </template>

    <div class="empty-hippo__body">
      <span class="empty-hippo__flag" aria-hidden="true">
        <svg viewBox="0 0 64 64" width="56" height="56">
          <rect
            x="8"
            y="8"
            width="48"
            height="48"
            rx="4"
            fill="white"
            stroke="#2B2440"
            stroke-width="3"
          />
          <g fill="#2B2440">
            <rect x="8" y="8" width="12" height="12" />
            <rect x="32" y="8" width="12" height="12" />
            <rect x="20" y="20" width="12" height="12" />
            <rect x="44" y="20" width="12" height="12" />
            <rect x="8" y="32" width="12" height="12" />
            <rect x="32" y="32" width="12" height="12" />
            <rect x="20" y="44" width="12" height="12" />
            <rect x="44" y="44" width="12" height="12" />
          </g>
        </svg>
      </span>

      <h2 class="empty-hippo__title">Programı oluştur</h2>
      <p class="empty-hippo__text">
        Sağdaki veya aşağıdaki <strong>PROGRAM ÜRET</strong> butonuna basarak 6
        round'luk yarışmayı oluştur. Her round için 20 atın 10'u rastgele
        seçilir.
      </p>

      <Button
        size="lg"
        variant="primary"
        :loading="busy"
        @button-click="emit('generate')"
      >
        <template #leading>
          <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
            <path
              d="M5 4 H19 V8 H5 Z M5 10 H19 V14 H5 Z M5 16 H19 V20 H5 Z"
              fill="currentColor"
            />
          </svg>
        </template>
        Program Üret
      </Button>
    </div>
  </Panel>
</template>

<style scoped>
.empty-hippo {
  height: 100%;
}

.empty-hippo :deep(.panel__body) {
  background: linear-gradient(180deg, #6bba3e 0%, #5aa532 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1.25rem;
}

.empty-hippo__body {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  max-width: 32rem;
  color: #fff;
}

.empty-hippo__flag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  filter: drop-shadow(0 4px 4px rgba(0, 0, 0, 0.18));
  margin-bottom: 0.4rem;
}

.empty-hippo__title {
  font-family: var(--font-display);
  font-size: 32px;
  font-weight: 900;
  letter-spacing: -0.01em;
  margin: 0;
  color: #fff;
  text-shadow: 0 2px 0 rgba(0, 0, 0, 0.18);
}

.empty-hippo__text {
  font-size: 15px;
  font-weight: 600;
  margin: 0;
  max-width: 22.5rem;
  color: rgba(255, 255, 255, 0.92);
}

.empty-hippo__text strong {
  font-weight: 800;
}

@media (max-width: 640px) {
  .empty-hippo :deep(.panel__body) {
    padding: 1.5rem 1rem;
  }

  .empty-hippo__title {
    font-size: 22px;
  }

  .empty-hippo__text {
    font-size: 13.5px;
  }
}
</style>
