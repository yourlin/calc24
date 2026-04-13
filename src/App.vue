<script setup lang="ts">
import { useGame } from './composables/useGame'
import { useI18n } from './composables/useI18n'
import FormulaBoard from './components/FormulaBoard.vue'
import BracketPicker from './components/BracketPicker.vue'
import CountdownTimer from './components/CountdownTimer.vue'
import ResultDialog from './components/ResultDialog.vue'

const { t, lang, toggleLang } = useI18n()

const {
  numbers,
  operators,
  bracketMode,
  score,
  moves,
  gamePhase,
  answerFormula,
  result,
  isWin,
  estimatedScore,
  timer,
  startGame,
  nextRound,
  swapNumbers,
  setOperator,
  setBracket,
} = useGame()

function handleRestart() {
  startGame()
}
</script>

<template>
  <div class="top-bar">
    <button class="lang-btn" @click="toggleLang">{{ lang === 'zh' ? 'EN' : '中' }}</button>
  </div>
  <div class="game-title">{{ t.title }}</div>

  <!-- Idle state -->
  <template v-if="gamePhase === 'idle'">
    <div class="intro-card">
      <p>{{ t.introDesc }}</p>
      <ol>
        <li>{{ t.introStep1 }}</li>
        <li>{{ t.introStep2 }}</li>
        <li>{{ t.introStep3 }}</li>
        <li>{{ t.introStep4 }}</li>
      </ol>
    </div>
    <div class="start-section">
      <button class="start-btn" @click="startGame">{{ t.startGame }}</button>
    </div>
  </template>

  <!-- Playing state -->
  <template v-if="gamePhase === 'playing' || gamePhase === 'won' || gamePhase === 'lost'">
    <div class="stats-bar">
      <div class="stat-item">{{ t.moves }}:<span>{{ moves }}</span></div>
      <div class="stat-item">{{ t.score }}:<span>{{ score }}</span></div>
    </div>

    <div class="guide-bar">{{ t.guide }}</div>

    <FormulaBoard
      :numbers="numbers"
      :operators="operators"
      :bracket-mode="bracketMode"
      :result="result"
      :is24="isWin"
      :disabled="gamePhase !== 'playing'"
      @swap="swapNumbers"
      @operator-change="setOperator"
    />

    <BracketPicker
      :model-value="bracketMode"
      :numbers="numbers"
      :operators="operators"
      :no-bracket-label="t.noBracket"
      :disabled="gamePhase !== 'playing'"
      @update:model-value="setBracket"
    />

    <CountdownTimer
      :time-left="timer.timeLeft.value"
      :total="60"
      :estimated-score="estimatedScore"
      :estimated-label="t.estimatedScore"
    />

    <div class="scoring-rules">
      <div class="scoring-title">{{ t.scoringTitle }}</div>
      <ul>
        <li>{{ t.scoringBase }}<span>{{ t.scoringBaseVal }}</span></li>
        <li>{{ t.scoringMoves }}<span>{{ t.scoringMovesVal }}</span></li>
        <li>{{ t.scoringTime }}<span>{{ t.scoringTimeVal }}</span></li>
      </ul>
    </div>
  </template>

  <!-- Result dialog -->
  <ResultDialog
    v-if="gamePhase === 'won' || gamePhase === 'lost'"
    :phase="gamePhase"
    :score="score"
    :answer-formula="answerFormula"
    :t="t"
    @next="nextRound"
    @restart="handleRestart"
  />
</template>
