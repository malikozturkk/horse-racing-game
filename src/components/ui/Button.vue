<script setup lang="ts">
import { computed } from "vue";

type Variant = "primary" | "info" | "danger" | "outline";
type Size = "sm" | "md" | "lg";
type NativeType = "button" | "submit" | "reset";

interface Props {
  variant?: Variant;
  size?: Size;
  type?: NativeType;
  disabled?: boolean;
  loading?: boolean;
  block?: boolean;
  uppercase?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  variant: "primary",
  size: "md",
  type: "button",
  disabled: false,
  loading: false,
  block: false,
  uppercase: true,
});

const emit = defineEmits<{
  (e: "button-click", event: MouseEvent): void;
}>();

const sizeClasses: Record<Size, string> = {
  sm: "text-xs px-3 py-1.5 rounded-lg gap-1.5",
  md: "text-sm px-5 py-2.5 rounded-xl gap-2",
  lg: "text-base px-6 py-3 rounded-2xl gap-2",
};

const variantClasses: Record<Variant, string> = {
  primary: "btn--primary",
  info: "btn--info",
  danger: "btn--danger",
  outline: "btn--outline",
};

const isInteractive = computed(() => !props.disabled && !props.loading);

const buttonClasses = computed(() => [
  "btn",
  "btn--" + props.size,
  variantClasses[props.variant],
  sizeClasses[props.size],
  props.uppercase && "uppercase",
  props.block && "w-full",
  !isInteractive.value && "btn--disabled",
]);

const handleClick = (event: MouseEvent) => {
  if (!isInteractive.value) {
    event.preventDefault();
    event.stopPropagation();
    return;
  }
  emit("button-click", event);
};
</script>

<template>
  <button
    :type="type"
    :class="buttonClasses"
    :disabled="disabled || loading"
    :aria-busy="loading || undefined"
    :aria-disabled="disabled || undefined"
    @click="handleClick"
  >
    <span v-if="loading" class="btn__spinner" aria-hidden="true" />

    <span v-if="$slots.leading && !loading" class="inline-flex shrink-0">
      <slot name="leading" />
    </span>

    <span class="inline-flex">
      <slot />
    </span>

    <span v-if="$slots.trailing" class="inline-flex shrink-0">
      <slot name="trailing" />
    </span>
  </button>
</template>

<style scoped>
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  user-select: none;
  cursor: pointer;
  font-family: var(--font-body);
  font-weight: 800;
  letter-spacing: 0.02em;

  background: var(--btn-surface);
  color: var(--btn-text);
  box-shadow: 0 var(--btn-depth) 0 0 var(--btn-shadow);
  transition:
    transform 120ms cubic-bezier(0.2, 0.8, 0.2, 1),
    box-shadow 120ms cubic-bezier(0.2, 0.8, 0.2, 1),
    background-color 120ms ease;
}

.btn:focus-visible {
  outline: none;
  box-shadow:
    0 var(--btn-depth) 0 0 var(--btn-shadow),
    0 0 0 3px var(--color-bg),
    0 0 0 5px var(--btn-shadow);
}

.btn:active:not(.btn--disabled) {
  transform: translateY(var(--btn-depth));
  box-shadow: 0 0 0 0 var(--btn-shadow);
}

.btn--sm {
  --btn-depth: 3px;
}
.btn--md {
  --btn-depth: 4px;
}
.btn--lg {
  --btn-depth: 5px;
}

.btn--primary {
  --btn-surface: var(--color-turf);
  --btn-shadow: var(--color-turf-deep);
  --btn-text: #ffffff;
}
.btn--primary:hover:not(.btn--disabled) {
  --btn-surface: color-mix(in srgb, var(--color-turf) 92%, black);
}

.btn--info {
  --btn-surface: var(--color-sky);
  --btn-shadow: color-mix(in srgb, var(--color-sky) 78%, black);
  --btn-text: #ffffff;
}
.btn--info:hover:not(.btn--disabled) {
  --btn-surface: color-mix(in srgb, var(--color-sky) 92%, black);
}

.btn--danger {
  --btn-surface: var(--color-finish);
  --btn-shadow: color-mix(in srgb, var(--color-finish) 78%, black);
  --btn-text: #ffffff;
}
.btn--danger:hover:not(.btn--disabled) {
  --btn-surface: color-mix(in srgb, var(--color-finish) 92%, black);
}

.btn--outline {
  --btn-surface: var(--color-surface);
  --btn-shadow: var(--color-line);
  --btn-text: var(--color-ink);
  border: 1px solid var(--color-line);
}
.btn--outline:hover:not(.btn--disabled) {
  --btn-surface: var(--color-bg);
}

.btn--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn__spinner {
  width: 1em;
  height: 1em;
  border-radius: 9999px;
  border: 2px solid currentColor;
  border-top-color: transparent;
  animation: btn-spin 600ms linear infinite;
}

@keyframes btn-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
