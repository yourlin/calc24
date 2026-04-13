import { ref, computed } from 'vue'
import { solve24, safeEval } from '../utils/solver'
import { useTimer } from './useTimer'

export type GamePhase = 'idle' | 'playing' | 'won' | 'lost'

export function useGame() {
  const numbers = ref<number[]>([1, 2, 3, 4])
  const operators = ref<string[]>(['+', '+', '+'])
  const bracketMode = ref(0)
  const score = ref(0)
  const moves = ref(0)
  const gamePhase = ref<GamePhase>('idle')
  const answerFormula = ref('')

  const timer = useTimer(60)

  const result = computed(() => {
    return safeEval(numbers.value, operators.value, bracketMode.value)
  })

  const isWin = computed(() => {
    return result.value !== null && Math.abs(result.value - 24) < 1e-9
  })

  function generateNumbers(): number[] {
    while (true) {
      const nums = Array.from({ length: 4 }, () => Math.floor(Math.random() * 13) + 1)
      const { solvable, formula } = solve24(nums)
      if (solvable) {
        answerFormula.value = formula
        return nums
      }
    }
  }

  function startGame() {
    score.value = 0
    startRound()
  }

  function startRound() {
    numbers.value = generateNumbers()
    operators.value = ['+', '+', '+']
    bracketMode.value = 0
    moves.value = 0
    gamePhase.value = 'playing'
    timer.reset(60)
    timer.start(() => {
      gamePhase.value = 'lost'
    })
  }

  function swapNumbers(i: number, j: number) {
    if (gamePhase.value !== 'playing') return
    const temp = numbers.value[i]
    numbers.value[i] = numbers.value[j]
    numbers.value[j] = temp
    moves.value++
    checkWin()
  }

  function setOperator(index: number, op: string) {
    if (gamePhase.value !== 'playing') return
    operators.value[index] = op
    moves.value++
    checkWin()
  }

  function setBracket(mode: number) {
    if (gamePhase.value !== 'playing') return
    bracketMode.value = mode
    moves.value++
    checkWin()
  }

  function checkWin() {
    if (isWin.value) {
      timer.stop()
      const baseScore = 20
      const movesBonus = moves.value > 40 ? 0 : Math.round((40 - moves.value) / 5)
      const timeBonus = Math.round(timer.timeLeft.value / 10)
      const roundScore = baseScore + movesBonus + timeBonus
      score.value += roundScore
      gamePhase.value = 'won'
    }
  }

  function nextRound() {
    startRound()
  }

  return {
    numbers,
    operators,
    bracketMode,
    score,
    moves,
    gamePhase,
    answerFormula,
    result,
    isWin,
    timer,
    startGame,
    nextRound,
    swapNumbers,
    setOperator,
    setBracket,
  }
}
