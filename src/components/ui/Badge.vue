<script setup lang="ts">
import { computed } from "vue";

type Variant = "danger" | "warning" | "success" | "info" | "purple" | "neutral";
type Size = "sm" | "md";
type Tag = "span" | "div";

interface Props {
  variant?: Variant;
  size?: Size;
  tag?: Tag;
  pill?: boolean;
  dot?: boolean;
  pulse?: boolean;
  interactive?: boolean;
  active?: boolean;
  disabled?: boolean;
  uppercase?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  variant: "neutral",
  size: "md",
  tag: "span",
  pill: true,
  dot: false,
  pulse: false,
  interactive: false,
  active: false,
  disabled: false,
  uppercase: true,
});

const emit = defineEmits<{
  (e: "badge-click", event: MouseEvent): void;
}>();

const sizeClasses: Record<Size, string> = {
  sm: "text-[11px] px-2 py-0.5 gap-1",
  md: "text-xs px-3 py-1 gap-1.5",
};

const variantClasses: Record<Variant, string> = {
  danger: "badge--danger",
  warning: "badge--warning",
  success: "badge--success",
  info: "badge--info",
  purple: "badge--purple",
  neutral: "badge--neutral",
};

const isInteractive = computed(() => props.interactive && !props.disabled);

const badgeClasses = computed(() =>
  [
    "badge",
    variantClasses[props.variant],
    sizeClasses[props.size],
    props.pill ? "rounded-full" : "rounded-md",
    props.uppercase && "uppercase tracking-wider",
    isInteractive.value && "badge--interactive cursor-pointer",
    props.active && "badge--active",
    props.disabled && "badge--disabled",
  ].filter(Boolean)
);

const dotClasses = computed(() => [
  "badge__dot",
  props.size === "sm" ? "h-1.5 w-1.5" : "h-2 w-2",
  props.pulse && "badge__dot--pulse",
]);

const handleClick = (event: MouseEvent) => {
  if (props.disabled) {
    event.preventDefault();
    event.stopPropagation();
    return;
  }
  emit("badge-click", event);
};
</script>

<template>
  <component
    :is="tag"
    :class="badgeClasses"
    :role="isInteractive ? 'button' : undefined"
    :tabindex="isInteractive ? 0 : -1"
    :aria-disabled="disabled || undefined"
    :aria-pressed="isInteractive ? active : undefined"
    @click="handleClick"
    @keydown.enter="handleClick"
    @keydown.space.prevent="handleClick"
  >
    <span v-if="dot" :class="dotClasses" aria-hidden="true" />

    <span v-if="$slots.icon" class="badge__icon inline-flex shrink-0">
      <slot name="icon" />
    </span>

    <span class="badge__label inline-flex items-center">
      <slot />
    </span>

    <span v-if="$slots.trailing" class="badge__trailing inline-flex shrink-0">
      <slot name="trailing" />
    </span>
  </component>
</template>

<style scoped>
.badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  user-select: none;
  font-family: var(--font-body);
  font-weight: 700;
  line-height: 1;
  letter-spacing: 0.04em;

  background: var(--badge-surface);
  color: var(--badge-text);
  border: 1px solid var(--badge-border);
  transition:
    background-color 140ms ease,
    border-color 140ms ease,
    color 140ms ease,
    transform 120ms cubic-bezier(0.2, 0.8, 0.2, 1);
}

.badge--danger {
  --badge-surface: color-mix(in srgb, var(--color-finish) 14%, white);
  --badge-border: color-mix(in srgb, var(--color-finish) 38%, white);
  --badge-text: color-mix(in srgb, var(--color-finish) 78%, black);
  --badge-dot: var(--color-finish);
}

.badge--warning {
  --badge-surface: color-mix(in srgb, var(--color-gold) 22%, white);
  --badge-border: color-mix(in srgb, var(--color-gold) 55%, white);
  --badge-text: color-mix(in srgb, var(--color-gold) 30%, #5a4a00);
  --badge-dot: var(--color-gold);
}

.badge--success {
  --badge-surface: var(--color-turf-soft);
  --badge-border: color-mix(in srgb, var(--color-turf) 40%, white);
  --badge-text: var(--color-turf-deep);
  --badge-dot: var(--color-turf);
}

.badge--info {
  --badge-surface: color-mix(in srgb, var(--color-sky) 14%, white);
  --badge-border: color-mix(in srgb, var(--color-sky) 38%, white);
  --badge-text: color-mix(in srgb, var(--color-sky) 78%, black);
  --badge-dot: var(--color-sky);
}

.badge--purple {
  --badge-surface: color-mix(in srgb, var(--color-plum) 16%, white);
  --badge-border: color-mix(in srgb, var(--color-plum) 42%, white);
  --badge-text: color-mix(in srgb, var(--color-plum) 70%, black);
  --badge-dot: var(--color-plum);
}

.badge--neutral {
  --badge-surface: var(--color-surface);
  --badge-border: var(--color-line);
  --badge-text: color-mix(in srgb, var(--color-ink) 70%, white);
  --badge-dot: color-mix(in srgb, var(--color-ink) 40%, white);
}

.badge__dot {
  display: inline-block;
  border-radius: 9999px;
  background: var(--badge-dot);
  flex-shrink: 0;
}

.badge__dot--pulse {
  position: relative;
  box-shadow: 0 0 0 0 color-mix(in srgb, var(--badge-dot) 70%, transparent);
  animation: badge-pulse 1.4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes badge-pulse {
  0% {
    box-shadow: 0 0 0 0 color-mix(in srgb, var(--badge-dot) 70%, transparent);
  }
  70% {
    box-shadow: 0 0 0 6px color-mix(in srgb, var(--badge-dot) 0%, transparent);
  }
  100% {
    box-shadow: 0 0 0 0 color-mix(in srgb, var(--badge-dot) 0%, transparent);
  }
}

.badge--interactive:hover {
  background: color-mix(in srgb, var(--badge-surface) 80%, var(--badge-text));
}

.badge--interactive:focus-visible {
  outline: none;
  box-shadow:
    0 0 0 2px var(--color-bg),
    0 0 0 4px var(--badge-border);
}

.badge--interactive:active {
  transform: translateY(1px);
}

.badge--active {
  background: color-mix(in srgb, var(--badge-surface) 60%, var(--badge-text));
  color: var(--color-surface);
  border-color: var(--badge-text);
}

.badge--active .badge__dot {
  background: var(--color-surface);
}

.badge--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.badge__icon :deep(svg),
.badge__trailing :deep(svg) {
  width: 1em;
  height: 1em;
}
</style>
