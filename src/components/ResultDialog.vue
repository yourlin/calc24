<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue'

const props = defineProps<{
  phase: 'won' | 'lost'
  score: number
  answerFormula: string
  t: Record<string, string>
}>()

const emit = defineEmits<{
  next: []
  restart: []
}>()

const countdown = ref(10)
let timer: ReturnType<typeof setInterval> | null = null

watch(
  () => props.phase,
  (phase) => {
    if (phase === 'won') {
      countdown.value = 10
      timer = setInterval(() => {
        countdown.value--
        if (countdown.value <= 0) {
          clearTimer()
          emit('next')
        }
      }, 1000)
    } else {
      clearTimer()
    }
  },
  { immediate: true }
)

function clearTimer() {
  if (timer !== null) {
    clearInterval(timer)
    timer = null
  }
}

function handleNext() {
  clearTimer()
  emit('next')
}

function handleRestart() {
  clearTimer()
  emit('restart')
}

onUnmounted(() => clearTimer())
</script>

<template>
  <div class="result-overlay">
    <div class="result-card">
      <template v-if="phase === 'won'">
        <div class="result-title" style="color: var(--success)">
          {{ t.winTitle }}
        </div>
        <div class="result-detail">
          {{ t.totalScore }}<span>{{ score }}</span>
        </div>
        <button class="result-btn" @click="handleNext">
          {{ t.nextRound }}
        </button>
        <div class="countdown-hint">
          {{ t.autoCountdown }}<em>{{ countdown }}</em> {{ t.seconds }}
        </div>
      </template>
      <template v-else>
        <div class="result-title" style="color: var(--warning)">
          {{ t.loseTitle }}
        </div>
        <div class="answer-text">
          {{ t.referenceAnswer }}{{ answerFormula }}
        </div>
        <button class="result-btn" @click="handleRestart">
          {{ t.playAgain }}
        </button>
      </template>
    </div>
  </div>
</template>
