<script setup lang="ts">
import type { HorseVisual } from "../../domain/horse/types";

const STROKE = "#1D1A2E";

interface Props {
  visual: HorseVisual;
  size?: number;
}

const props = withDefaults(defineProps<Props>(), { size: 40 });
const c = props.visual.coloring;
</script>

<template>
  <div
    :style="{
      width: `${size}px`,
      height: `${size}px`,
      borderRadius: '50%',
      background: '#F5EBDD',
      border: `2px solid ${STROKE}`,
      boxShadow: '0 2px 0 0 rgba(29,26,46,0.18)',
      overflow: 'hidden',
      flexShrink: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }"
  >
    <svg
      viewBox="0 0 60 60"
      :width="size"
      :height="size"
      style="display: block"
      role="img"
      aria-hidden="true"
    >
      <path
        d="M 6 56 C 6 44, 12 36, 20 30 C 24 24, 30 20, 36 18 L 44 18
           C 42 28, 38 36, 32 42 C 28 48, 26 52, 24 58 L 6 58 Z"
        :fill="c.body"
        :stroke="STROKE"
        stroke-width="1.6"
        stroke-linejoin="round"
      />
      <path
        d="M 14 32 C 18 24, 26 18, 36 16 C 40 14, 42 16, 42 20
           C 38 28, 32 36, 26 42 C 22 44, 18 42, 16 38 Z"
        :fill="c.mane"
        :stroke="STROKE"
        stroke-width="1.2"
        stroke-linejoin="round"
      />
      <path
        d="M 30 22 C 30 28, 28 32, 26 36"
        :stroke="STROKE"
        stroke-width="0.7"
        fill="none"
        opacity="0.55"
      />
      <path
        d="M 24 28 C 24 32, 22 36, 20 38"
        :stroke="STROKE"
        stroke-width="0.7"
        fill="none"
        opacity="0.55"
      />
      <path
        d="M 36 18 C 44 14, 52 16, 54 22 C 56 28, 54 36, 50 38
           C 44 40, 38 38, 34 34 C 30 28, 30 22, 36 18 Z"
        :fill="c.body"
        :stroke="STROKE"
        stroke-width="1.6"
        stroke-linejoin="round"
      />
      <path
        d="M 38 19 C 44 16, 50 17, 52 20"
        :stroke="c.bodyLight"
        stroke-width="1.6"
        fill="none"
        opacity="0.65"
        stroke-linecap="round"
      />
      <path
        d="M 48 34 C 54 34, 54 30, 52 28 C 48 30, 46 32, 48 34 Z"
        :fill="c.bodyDark"
        opacity="0.5"
      />

      <template v-if="c.blaze === 'blaze'">
        <path
          d="M 42 22 C 44 28, 46 34, 46 38 C 44 39, 42 38, 42 36 C 40 30, 40 26, 40 22 Z"
          fill="#F5EBDD"
          :stroke="STROKE"
          stroke-width="0.4"
        />
      </template>
      <template v-else-if="c.blaze === 'stripe'">
        <path
          d="M 43 20 C 44 26, 45 32, 45 38 L 43 38 C 42 32, 41 26, 41 20 Z"
          fill="#F5EBDD"
          :stroke="STROKE"
          stroke-width="0.4"
        />
      </template>
      <template v-else-if="c.blaze === 'star'">
        <ellipse
          cx="43"
          cy="24"
          rx="2"
          ry="2.4"
          fill="#F5EBDD"
          :stroke="STROKE"
          stroke-width="0.4"
        />
      </template>

      <ellipse
        cx="42"
        cy="26"
        rx="1.5"
        ry="1.7"
        fill="white"
        :stroke="STROKE"
        stroke-width="0.7"
      />
      <ellipse cx="42.4" cy="26.2" rx="0.9" ry="1.1" fill="#1A0F08" />
      <ellipse cx="50" cy="30" rx="1" ry="1.3" fill="#1A0F08" />
      <path
        d="M 47 33 C 50 34, 52 33, 53 32"
        :stroke="STROKE"
        stroke-width="0.7"
        fill="none"
        opacity="0.55"
      />
      <path
        d="M 36 16 C 36 8, 40 8, 42 12 C 41 17, 38 18, 36 18 Z"
        :fill="c.bodyDark"
        :stroke="STROKE"
        stroke-width="1"
        stroke-linejoin="round"
      />
      <path
        d="M 41 14 C 41 6, 46 7, 47 12 C 45 17, 42 18, 41 18 Z"
        :fill="c.body"
        :stroke="STROKE"
        stroke-width="1.2"
        stroke-linejoin="round"
      />
    </svg>
  </div>
</template>
