<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import type { RadarData } from '../composables/useStats'

const props = defineProps<{
  data: RadarData | null
  labels: string[]
}>()

// SVG 参数
const cx = 140
const cy = 140
const maxR = 100
const levels = 3
const sides = 5

const animated = ref(false)

onMounted(() => {
  // 延迟触发动画
  setTimeout(() => {
    animated.value = true
  }, 100)
})

// 计算五边形顶点坐标
function getPoint(index: number, radius: number): { x: number; y: number } {
  const angle = (Math.PI * 2 * index) / sides - Math.PI / 2
  return {
    x: cx + radius * Math.cos(angle),
    y: cy + radius * Math.sin(angle),
  }
}

// 生成多边形 points 字符串
function polygonPoints(radius: number): string {
  return Array.from({ length: sides }, (_, i) => {
    const p = getPoint(i, radius)
    return `${p.x},${p.y}`
  }).join(' ')
}

// 网格层
const gridLevels = computed(() => {
  return Array.from({ length: levels }, (_, i) => {
    const r = (maxR / levels) * (i + 1)
    return polygonPoints(r)
  })
})

// 轴线
const axisLines = computed(() => {
  return Array.from({ length: sides }, (_, i) => {
    const p = getPoint(i, maxR)
    return { x1: cx, y1: cy, x2: p.x, y2: p.y }
  })
})

// 标签位置
const labelPositions = computed(() => {
  return Array.from({ length: sides }, (_, i) => {
    const p = getPoint(i, maxR + 20)
    return { x: p.x, y: p.y, text: props.labels[i] || '' }
  })
})

// 数据多边形
const dataPoints = computed(() => {
  if (!props.data) return polygonPoints(0)

  const values = [
    props.data.speed,
    props.data.precision,
    props.data.endurance,
    props.data.stability,
    props.data.intuition,
  ]

  return values.map((v, i) => {
    const r = (v / 100) * maxR
    const p = getPoint(i, r)
    return `${p.x},${p.y}`
  }).join(' ')
})

// 数据点圆点
const dataCircles = computed(() => {
  if (!props.data) return []

  const values = [
    props.data.speed,
    props.data.precision,
    props.data.endurance,
    props.data.stability,
    props.data.intuition,
  ]

  return values.map((v, i) => {
    const r = (v / 100) * maxR
    return getPoint(i, r)
  })
})
</script>

<template>
  <div class="radar-chart">
    <svg viewBox="0 0 280 280" class="radar-svg">
      <!-- 网格背景 -->
      <polygon
        v-for="(points, i) in gridLevels"
        :key="'grid-' + i"
        :points="points"
        class="radar-grid"
      />

      <!-- 轴线 -->
      <line
        v-for="(line, i) in axisLines"
        :key="'axis-' + i"
        :x1="line.x1"
        :y1="line.y1"
        :x2="line.x2"
        :y2="line.y2"
        class="radar-axis"
      />

      <!-- 数据多边形 -->
      <polygon
        v-if="data"
        :points="dataPoints"
        class="radar-data"
        :class="{ animated }"
      />

      <!-- 数据点 -->
      <circle
        v-for="(point, i) in dataCircles"
        :key="'dot-' + i"
        :cx="point.x"
        :cy="point.y"
        r="4"
        class="radar-dot"
        :class="{ animated }"
      />

      <!-- 标签 -->
      <text
        v-for="(label, i) in labelPositions"
        :key="'label-' + i"
        :x="label.x"
        :y="label.y"
        class="radar-label"
        text-anchor="middle"
        dominant-baseline="middle"
      >{{ label.text }}</text>
    </svg>
  </div>
</template>
