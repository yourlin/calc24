<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  timeLeft: number
  total: number
  estimatedScore: number
  estimatedLabel: string
}>()

const radius = 34
const circumference = 2 * Math.PI * radius

const dashOffset = computed(() => {
  const progress = props.timeLeft / props.total
  return circumference * (1 - progress)
})

const isUrgent = computed(() => props.timeLeft <= 10)
</script>

<template>
  <div class="timer-section">
    <div class="timer-circle">
      <svg viewBox="0 0 76 76">
        <circle class="timer-bg" cx="38" cy="38" :r="radius" />
        <circle
          class="timer-progress"
          cx="38"
          cy="38"
          :r="radius"
          :stroke-dasharray="circumference"
          :stroke-dashoffset="dashOffset"
        />
      </svg>
      <div class="timer-text" :class="{ urgent: isUrgent }">
        {{ timeLeft }}
      </div>
    </div>
    <div class="estimated-score">
      {{ estimatedLabel }}：<span>{{ estimatedScore }}</span>
    </div>
  </div>
</template>
