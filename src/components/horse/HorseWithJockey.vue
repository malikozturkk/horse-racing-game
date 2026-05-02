<script setup lang="ts">
import { computed } from "vue";
import type { HorseVisual } from "../../domain/horse";

const STROKE = "#1D1A2E";

interface Props {
  horseNumber: number;
  visual: HorseVisual;
  width?: number;
}

const props = withDefaults(defineProps<Props>(), {
  width: 260,
});

const height = computed(() => Math.round((props.width * 160) / 260));

const c = computed(() => props.visual.coloring);
const silk = computed(() => props.visual.silkColor);
const silkAccent = computed(() => props.visual.silkAccentColor);
const pattern = computed(() => props.visual.silkPatternIndex);
</script>

<template>
  <svg
    :viewBox="`0 0 260 160`"
    :width="width"
    :height="height"
    :aria-label="`At ${horseNumber} görseli`"
    role="img"
    style="display: block; overflow: visible"
  >
    <ellipse cx="130" cy="152" rx="90" ry="4" fill="rgba(0,0,0,0.25)" />
    <path
      d="M 60 76 C 42 70, 22 80, 8 100 C 4 106, 8 108, 16 104
         C 30 96, 46 88, 58 86 C 64 84, 64 80, 60 76 Z"
      :fill="c.mane"
      :stroke="STROKE"
      stroke-width="2"
      stroke-linejoin="round"
    />
    <path
      d="M 76 88 C 78 100, 76 112, 72 122 C 70 128, 66 132, 60 134
         L 64 138 C 72 138, 78 134, 82 126 C 86 116, 88 100, 86 88 Z"
      :fill="c.bodyDark"
      :stroke="STROKE"
      stroke-width="2"
      stroke-linejoin="round"
    />
    <path
      d="M 60 134 L 56 138 L 62 142 L 68 140 L 64 138 Z"
      fill="#0A0508"
      :stroke="STROKE"
      stroke-width="1.5"
    />
    <path
      d="M 84 88 C 86 98, 84 110, 80 122 C 78 130, 74 134, 68 138
         L 72 142 C 80 142, 88 136, 92 126 C 96 114, 96 100, 94 88 Z"
      :fill="c.body"
      :stroke="STROKE"
      stroke-width="2"
      stroke-linejoin="round"
    />
    <ellipse cx="86" cy="118" rx="5" ry="3" :fill="c.bodyDark" opacity="0.55" />
    <path
      d="M 72 142 L 68 146 L 74 150 L 82 148 L 78 144 Z"
      fill="#0A0508"
      :stroke="STROKE"
      stroke-width="1.5"
    />
    <path
      d="M 60 76 C 56 64, 64 54, 78 50 C 96 46, 118 44, 140 44
         C 164 44, 184 50, 198 60 C 208 68, 210 78, 204 88
         C 198 96, 188 98, 174 96 L 100 96
         C 80 96, 66 90, 60 84 C 56 80, 56 78, 60 76 Z"
      :fill="c.body"
      :stroke="STROKE"
      stroke-width="2.5"
      stroke-linejoin="round"
    />
    <path
      d="M 78 92 C 110 96, 160 96, 184 92 C 180 95, 168 96,
         156 96 L 100 96 C 90 96, 82 95, 78 92 Z"
      :fill="c.bodyDark"
      opacity="0.45"
    />
    <path
      d="M 76 52 C 110 48, 160 48, 192 56 C 178 52, 150 50,
         120 50 C 100 50, 84 52, 76 54 Z"
      :fill="c.bodyLight"
      opacity="0.6"
    />
    <path
      d="M 168 64 C 174 70, 178 78, 178 88"
      :stroke="STROKE"
      stroke-width="1.2"
      fill="none"
      opacity="0.35"
    />
    <path
      d="M 84 60 C 78 70, 76 80, 78 90"
      :stroke="STROKE"
      stroke-width="1.2"
      fill="none"
      opacity="0.35"
    />

    <path
      d="M 174 84 C 178 96, 184 108, 190 118 C 194 124, 196 128,
         198 132 L 194 136 C 188 132, 180 122, 172 110
         C 166 100, 162 92, 162 86 Z"
      :fill="c.bodyDark"
      :stroke="STROKE"
      stroke-width="2"
      stroke-linejoin="round"
    />
    <path
      d="M 194 136 L 198 140 L 196 144 L 188 142 Z"
      fill="#0A0508"
      :stroke="STROKE"
      stroke-width="1.5"
    />

    <path
      d="M 182 84 C 188 96, 196 108, 204 118 C 210 126, 214 130,
         218 134 L 214 138 C 206 134, 196 122, 186 108
         C 178 98, 172 90, 172 86 Z"
      :fill="c.body"
      :stroke="STROKE"
      stroke-width="2"
      stroke-linejoin="round"
    />
    <ellipse
      cx="200"
      cy="120"
      rx="4.5"
      ry="3"
      :fill="c.bodyDark"
      opacity="0.55"
    />
    <path
      d="M 214 138 L 218 142 L 216 146 L 208 144 Z"
      fill="#0A0508"
      :stroke="STROKE"
      stroke-width="1.5"
    />

    <path
      d="M 188 56 C 196 46, 208 36, 220 30 C 228 26, 234 30,
         234 38 C 232 48, 224 58, 216 64 C 206 70, 196 70, 190 66
         C 184 62, 184 58, 188 56 Z"
      :fill="c.body"
      :stroke="STROKE"
      stroke-width="2.5"
      stroke-linejoin="round"
    />
    <path
      d="M 196 50 C 206 42, 216 36, 224 32"
      :stroke="c.bodyLight"
      stroke-width="3"
      fill="none"
      opacity="0.7"
      stroke-linecap="round"
    />

    <path
      d="M 192 54 C 202 44, 214 34, 224 28 C 230 26, 232 30,
         230 36 C 222 46, 212 56, 202 62 C 196 64, 192 62, 192 58 Z"
      :fill="c.mane"
      :stroke="STROKE"
      stroke-width="2"
      stroke-linejoin="round"
    />
    <path
      d="M 218 32 C 218 38, 216 44, 212 50"
      :stroke="STROKE"
      stroke-width="1"
      fill="none"
      opacity="0.55"
    />
    <path
      d="M 210 38 C 210 44, 208 50, 204 56"
      :stroke="STROKE"
      stroke-width="1"
      fill="none"
      opacity="0.55"
    />
    <path
      d="M 202 44 C 202 50, 200 54, 198 58"
      :stroke="STROKE"
      stroke-width="1"
      fill="none"
      opacity="0.55"
    />

    <path
      d="M 218 30 C 230 22, 244 24, 250 32 C 254 38, 254 48,
         250 54 C 244 60, 236 62, 228 60 C 222 58, 216 54,
         214 48 C 210 40, 212 32, 218 30 Z"
      :fill="c.body"
      :stroke="STROKE"
      stroke-width="2.5"
      stroke-linejoin="round"
    />
    <path
      d="M 226 32 C 234 28, 242 28, 246 32"
      :stroke="c.bodyLight"
      stroke-width="2.5"
      fill="none"
      opacity="0.6"
      stroke-linecap="round"
    />
    <path
      d="M 244 52 C 252 52, 254 48, 252 44 C 248 42, 244 44, 242 48 C 240 50, 240 52, 244 52 Z"
      :fill="c.bodyDark"
      opacity="0.55"
    />
    <path
      d="M 226 58 C 234 60, 240 58, 244 56"
      :stroke="STROKE"
      stroke-width="1.4"
      fill="none"
      opacity="0.5"
    />

    <template v-if="c.blaze === 'blaze'">
      <path
        d="M 234 34 C 238 42, 240 50, 240 54 C 238 55, 236 54,
           235 51 C 232 44, 230 38, 230 34 Z"
        fill="#F5EBDD"
        :stroke="STROKE"
        stroke-width="0.6"
      />
    </template>
    <template v-else-if="c.blaze === 'stripe'">
      <path
        d="M 235 32 C 236 40, 237 48, 237 54 L 235 54
           C 234 48, 233 40, 233 32 Z"
        fill="#F5EBDD"
        :stroke="STROKE"
        stroke-width="0.5"
      />
    </template>
    <template v-else-if="c.blaze === 'star'">
      <ellipse
        cx="235"
        cy="38"
        rx="2.6"
        ry="3"
        fill="#F5EBDD"
        :stroke="STROKE"
        stroke-width="0.5"
      />
    </template>

    <ellipse
      cx="232"
      cy="42"
      rx="2"
      ry="2.4"
      fill="white"
      :stroke="STROKE"
      stroke-width="1"
    />
    <ellipse cx="232.5" cy="42.5" rx="1.2" ry="1.6" fill="#1A0F08" />
    <circle cx="233" cy="41.5" r="0.5" fill="white" />
    <ellipse cx="246" cy="48" rx="1.2" ry="1.6" fill="#1A0F08" />
    <path
      d="M 241 53 C 245 55, 250 54, 252 53"
      :stroke="STROKE"
      stroke-width="1"
      fill="none"
      opacity="0.6"
    />
    <path
      d="M 218 28 C 218 16, 222 14, 226 18 C 226 26, 224 30, 220 30 Z"
      :fill="c.bodyDark"
      :stroke="STROKE"
      stroke-width="1.5"
      stroke-linejoin="round"
    />
    <path
      d="M 224 26 C 224 12, 230 12, 232 18 C 232 26, 230 30, 226 30 Z"
      :fill="c.body"
      :stroke="STROKE"
      stroke-width="1.8"
      stroke-linejoin="round"
    />
    <path
      d="M 240 50 C 220 56, 195 58, 165 56"
      stroke="#0A0508"
      stroke-width="2"
      fill="none"
    />
    <path
      d="M 224 36 L 244 38"
      stroke="#0A0508"
      stroke-width="1.4"
      fill="none"
    />

    <path
      d="M 110 50 C 110 46, 114 44, 120 44 L 152 44
         C 158 44, 162 46, 162 50 L 162 56
         C 150 58, 122 58, 110 56 Z"
      fill="#3A2412"
      :stroke="STROKE"
      stroke-width="2"
      stroke-linejoin="round"
    />
    <ellipse cx="136" cy="50" rx="24" ry="3" fill="#1A0F08" />
    <line
      x1="146"
      y1="56"
      x2="146"
      y2="74"
      stroke="#0A0508"
      stroke-width="2.5"
    />
    <ellipse
      cx="146"
      cy="76"
      rx="4"
      ry="2"
      fill="#0A0508"
      :stroke="STROKE"
      stroke-width="1"
    />
    <line
      x1="124"
      y1="56"
      x2="122"
      y2="68"
      stroke="#0A0508"
      stroke-width="2"
      opacity="0.6"
    />

    <g transform="rotate(-22 138 36)">
      <path
        d="M 122 40 L 152 40 L 148 56 L 126 56 Z"
        fill="white"
        :stroke="STROKE"
        stroke-width="2"
        stroke-linejoin="round"
      />
      <line
        x1="137"
        y1="40"
        x2="137"
        y2="56"
        :stroke="STROKE"
        stroke-width="0.8"
        opacity="0.5"
      />

      <path
        d="M 116 14 C 120 10, 128 8, 138 8 C 148 8, 156 10,
           160 14 L 160 40 C 148 42, 130 42, 116 40 Z"
        :fill="silk"
        :stroke="STROKE"
        stroke-width="2"
        stroke-linejoin="round"
      />

      <g transform="translate(138, 24)">
        <template v-if="pattern === 0">
          <rect x="-10" y="-13" width="2.8" height="30" :fill="silkAccent" />
          <rect x="-2" y="-13" width="2.8" height="30" :fill="silkAccent" />
          <rect x="6" y="-13" width="2.8" height="30" :fill="silkAccent" />
        </template>
        <template v-else-if="pattern === 1">
          <rect x="-12" y="-2" width="24" height="6" :fill="silkAccent" />
        </template>
        <template v-else-if="pattern === 2">
          <circle cx="-6" cy="-6" r="1.8" :fill="silkAccent" />
          <circle cx="4" cy="-3" r="1.8" :fill="silkAccent" />
          <circle cx="-2" cy="4" r="1.8" :fill="silkAccent" />
          <circle cx="7" cy="7" r="1.8" :fill="silkAccent" />
          <circle cx="-7" cy="3" r="1.8" :fill="silkAccent" />
        </template>
        <template v-else-if="pattern === 4">
          <polygon points="-12,-13 12,9 12,16 -12,-7" :fill="silkAccent" />
        </template>
      </g>

      <path
        d="M 130 9 C 134 7, 142 7, 146 9 L 144 14 L 132 14 Z"
        fill="white"
        :stroke="STROKE"
        stroke-width="1.2"
      />

      <g transform="rotate(-32 122 24)">
        <path
          d="M 116 20 L 130 22 L 128 38 L 112 34 Z"
          :fill="silk"
          :stroke="STROKE"
          stroke-width="1.5"
          stroke-linejoin="round"
        />
        <ellipse
          cx="112"
          cy="36"
          rx="3.5"
          ry="4"
          :fill="silk"
          :stroke="STROKE"
          stroke-width="1.5"
        />
      </g>
      <g transform="rotate(-15 156 24)">
        <path
          d="M 148 20 L 162 22 L 160 38 L 146 34 Z"
          :fill="silk"
          :stroke="STROKE"
          stroke-width="1.5"
          stroke-linejoin="round"
        />
        <ellipse
          cx="160"
          cy="36"
          rx="3.5"
          ry="4"
          :fill="silk"
          :stroke="STROKE"
          stroke-width="1.5"
        />
      </g>

      <path
        d="M 126 56 L 134 56 L 132 68 L 124 68 Z"
        fill="#0A0508"
        :stroke="STROKE"
        stroke-width="1.5"
      />
      <path
        d="M 138 56 L 148 56 L 146 68 L 138 68 Z"
        fill="#0A0508"
        :stroke="STROKE"
        stroke-width="1.5"
      />
      <line
        x1="129"
        y1="58"
        x2="128"
        y2="66"
        :stroke="c.bodyLight"
        stroke-width="1"
        opacity="0.5"
      />

      <g transform="translate(138, 26)">
        <circle r="7" fill="white" :stroke="STROKE" stroke-width="1.5" />
        <text
          y="3"
          font-size="9"
          font-weight="900"
          text-anchor="middle"
          :fill="STROKE"
          font-family="DM Sans, sans-serif"
        >
          {{ horseNumber }}
        </text>
      </g>

      <g transform="translate(138, 0)">
        <ellipse
          cx="0"
          cy="0"
          rx="6"
          ry="7"
          fill="#E8C5A0"
          :stroke="STROKE"
          stroke-width="1.5"
        />
        <path
          d="M -8 -2 C -8 -12, -4 -14, 0 -14 C 4 -14, 8 -12,
             8 -2 C 8 1, 8 2, 8 3 L -8 3 Z"
          :fill="silk"
          :stroke="STROKE"
          stroke-width="1.8"
          stroke-linejoin="round"
        />
        <ellipse
          cx="0"
          cy="3"
          rx="9"
          ry="2"
          :fill="silk"
          :stroke="STROKE"
          stroke-width="1.5"
        />
        <rect x="-7" y="-7" width="14" height="3" :fill="silkAccent" />
        <ellipse
          cx="-3"
          cy="-9"
          rx="2.5"
          ry="1.4"
          fill="white"
          opacity="0.55"
        />
        <path
          d="M -5 4 C 0 8, 5 8, 5 4"
          :stroke="STROKE"
          stroke-width="1"
          fill="none"
        />
        <circle cx="3" cy="2" r="0.7" :fill="STROKE" />
      </g>

      <line
        x1="162"
        y1="20"
        x2="174"
        y2="6"
        :stroke="STROKE"
        stroke-width="1.8"
        stroke-linecap="round"
      />
      <circle cx="174" cy="6" r="1.5" :fill="STROKE" />
    </g>
  </svg>
</template>
