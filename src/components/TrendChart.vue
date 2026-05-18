<script setup lang="ts">
import { computed, ref } from 'vue'
import type { TrendPoint } from '../composables/useStats'

const props = defineProps<{
  data: TrendPoint[]
  scoreLabel: string
  timeLabel: string
  avgLabel: string
}>()

const mode = ref<'score' | 'time'>('score')

// SVG 参数
const width = 320
const height = 160
const padX = 30
const padY = 20
const chartW = width - padX * 2
const chartH = height - padY * 2

const values = computed(() => {
  return props.data.map(p => mode.value === 'score' ? p.score : p.timeUsed)
})

const minVal = computed(() => {
  if (values.value.length === 0) return 0
  return Math.max(0, Math.min(...values.value) - 5)
})

const maxVal = computed(() => {
  if (values.value.length === 0) return 100
  return Math.max(...values.value) + 5
})

const range = computed(() => maxVal.value - minVal.value || 1)

const avgVal = computed(() => {
  if (values.value.length === 0) return 0
  return values.value.reduce((a, b) => a + b, 0) / values.value.length
})

// 坐标转换
function getX(index: number): number {
  if (props.data.length <= 1) return padX + chartW / 2
  return padX + (index / (props.data.length - 1)) * chartW
}

function getY(value: number): number {
  return padY + chartH - ((value - minVal.value) / range.value) * chartH
}

// 折线 points
const polylinePoints = computed(() => {
  return values.value.map((v, i) => `${getX(i)},${getY(v)}`).join(' ')
})

// 平均线 Y 坐标
const avgY = computed(() => getY(avgVal.value))

// 数据点
const dots = computed(() => {
  return props.data.map((p, i) => ({
    x: getX(i),
    y: getY(values.value[i]),
    won: p.won,
  }))
})
</script>

<template>
  <div class="trend-chart">
    <!-- 模式切换 -->
    <div class="trend-tabs">
      <button
        class="trend-tab"
        :class="{ active: mode === 'score' }"
        @click="mode = 'score'"
      >{{ scoreLabel }}</button>
      <button
        class="trend-tab"
        :class="{ active: mode === 'time' }"
        @click="mode = 'time'"
      >{{ timeLabel }}</button>
    </div>

    <svg :viewBox="`0 0 ${width} ${height}`" class="trend-svg">
      <!-- 平均线 -->
      <line
        :x1="padX"
        :y1="avgY"
        :x2="padX + chartW"
        :y2="avgY"
        class="trend-avg-line"
      />
      <text
        :x="padX + chartW + 4"
        :y="avgY + 3"
        class="trend-avg-label"
      >{{ avgLabel }}</text>

      <!-- 折线 -->
      <polyline
        v-if="data.length > 0"
        :points="polylinePoints"
        class="trend-line"
      />

      <!-- 数据点 -->
      <circle
        v-for="(dot, i) in dots"
        :key="i"
        :cx="dot.x"
        :cy="dot.y"
        r="3.5"
        :class="['trend-dot', dot.won ? 'won' : 'lost']"
      />

      <!-- Y 轴标注 -->
      <text :x="padX - 4" :y="padY + 4" class="trend-axis-label" text-anchor="end">
        {{ Math.round(maxVal) }}
      </text>
      <text :x="padX - 4" :y="padY + chartH + 4" class="trend-axis-label" text-anchor="end">
        {{ Math.round(minVal) }}
      </text>
    </svg>
  </div>
</template>
