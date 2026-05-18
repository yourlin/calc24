<script setup lang="ts">
import { computed } from 'vue'
import { useStats } from '../composables/useStats'
import { useCountUp } from '../composables/useCountUp'
import RadarChart from './RadarChart.vue'
import TrendChart from './TrendChart.vue'

const props = defineProps<{
  t: Record<string, string>
}>()

const emit = defineEmits<{
  close: []
}>()

const { stats, getRadarData, getTrendData } = useStats()

// 数字滚动动画
const animatedTotalGames = useCountUp(computed(() => stats.value.totalGames))
const animatedWinRate = useCountUp(computed(() => stats.value.winRate))
const animatedStreak = useCountUp(computed(() => stats.value.longestStreak))

const radarData = computed(() => getRadarData())
const trendData = computed(() => getTrendData())

const radarLabels = computed(() => [
  props.t.radarSpeed || '速度',
  props.t.radarPrecision || '精准',
  props.t.radarEndurance || '耐力',
  props.t.radarStability || '稳定',
  props.t.radarIntuition || '直觉',
])

const unlockMessage = computed(() => {
  const wins = stats.value.totalWins
  if (wins >= 5) return ''
  const remaining = 5 - wins
  const template = props.t.unlockRadar || '再玩 {n} 局解锁能力分析'
  return template.replace('{n}', String(remaining))
})

function formatPlayTime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) {
    const secs = seconds % 60
    return `${minutes}m ${secs}s`
  }
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours}h ${mins}m`
}
</script>

<template>
  <div class="stats-overlay" @click.self="emit('close')">
    <div class="stats-panel">
      <!-- Header -->
      <div class="stats-header">
        <span class="stats-title">📊 {{ t.statsTitle || '个人统计' }}</span>
        <button class="stats-close" @click="emit('close')">✕</button>
      </div>

      <!-- Overview Cards -->
      <div class="stats-cards">
        <div class="stats-card">
          <div class="stats-card-value">{{ animatedTotalGames }}</div>
          <div class="stats-card-label">{{ t.totalGames || '总局数' }}</div>
        </div>
        <div class="stats-card">
          <div class="stats-card-value">{{ animatedWinRate }}%</div>
          <div class="stats-card-label">{{ t.winRate || '胜率' }}</div>
        </div>
        <div class="stats-card">
          <div class="stats-card-value">{{ animatedStreak }}</div>
          <div class="stats-card-label">{{ t.longestStreak || '最长连胜' }}</div>
        </div>
      </div>

      <!-- Radar Chart -->
      <div class="stats-section">
        <div class="stats-section-title">🕸️ {{ t.radarTitle || '能力雷达图' }}</div>
        <RadarChart
          v-if="radarData"
          :data="radarData"
          :labels="radarLabels"
        />
        <div v-else class="stats-empty">{{ unlockMessage }}</div>
      </div>

      <!-- Trend Chart -->
      <div class="stats-section">
        <div class="stats-section-title">📈 {{ t.trendTitle || '近期趋势' }}</div>
        <TrendChart
          v-if="trendData.length > 0"
          :data="trendData"
          :score-label="t.trendScore || '得分'"
          :time-label="t.trendTime || '用时'"
          :avg-label="t.trendAvgLine || '平均'"
        />
        <div v-else class="stats-empty">{{ t.dataAccumulating || '数据积累中...' }}</div>
      </div>

      <!-- Footer Stats -->
      <div class="stats-footer">
        <div class="stats-footer-item">
          <span class="stats-footer-label">{{ t.avgTime || '平均用时' }}:</span>
          <span class="stats-footer-value">{{ stats.totalWins > 0 ? stats.avgTime + 's' : '--' }}</span>
        </div>
        <div class="stats-footer-item">
          <span class="stats-footer-label">{{ t.avgMoves || '平均步数' }}:</span>
          <span class="stats-footer-value">{{ stats.totalWins > 0 ? String(stats.avgMoves) : '--' }}</span>
        </div>
        <div class="stats-footer-item">
          <span class="stats-footer-label">{{ t.totalPlayTime || '总时长' }}:</span>
          <span class="stats-footer-value">{{ formatPlayTime(stats.totalPlayTime) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
