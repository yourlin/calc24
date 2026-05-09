<script setup lang="ts">
import { ref } from 'vue'
import { useLeaderboard } from '../composables/useLeaderboard'
import type { LeaderboardDimension } from '../composables/useLeaderboard'

const props = defineProps<{
  t: Record<string, string>
}>()

const emit = defineEmits<{
  close: []
}>()

const { getRecords } = useLeaderboard()

const activeTab = ref<LeaderboardDimension>('highScore')

const tabs: LeaderboardDimension[] = ['highScore', 'fastestTime', 'fewestMoves']

function getTabLabel(dim: LeaderboardDimension): string {
  return props.t[dim] || dim
}

function getUnit(dim: LeaderboardDimension): string {
  if (dim === 'highScore') return props.t.scoreUnit
  if (dim === 'fastestTime') return props.t.timeUnit
  return props.t.movesUnit
}
</script>

<template>
  <div class="leaderboard-overlay" @click.self="emit('close')">
    <div class="leaderboard-panel">
      <div class="leaderboard-header">
        <h2 class="leaderboard-title">{{ t.leaderboard }}</h2>
        <button class="leaderboard-close" @click="emit('close')">✕</button>
      </div>

      <div class="leaderboard-tabs">
        <button
          v-for="tab in tabs"
          :key="tab"
          class="leaderboard-tab"
          :class="{ active: activeTab === tab }"
          @click="activeTab = tab"
        >
          {{ getTabLabel(tab) }}
        </button>
      </div>

      <div class="leaderboard-list">
        <template v-if="getRecords(activeTab).length > 0">
          <div class="leaderboard-list-header">
            <span class="lb-col-rank">{{ t.rank }}</span>
            <span class="lb-col-value">{{ getTabLabel(activeTab) }}</span>
            <span class="lb-col-date">{{ t.dateLabel }}</span>
          </div>
          <div
            v-for="(entry, index) in getRecords(activeTab)"
            :key="index"
            class="leaderboard-row"
            :class="{ 'top-three': index < 3 }"
          >
            <span class="lb-col-rank">{{ index + 1 }}</span>
            <span class="lb-col-value">{{ entry.value }}{{ getUnit(activeTab) }}</span>
            <span class="lb-col-date">{{ entry.date }}</span>
          </div>
        </template>
        <div v-else class="leaderboard-empty">
          {{ t.noRecords }}
        </div>
      </div>
    </div>
  </div>
</template>
