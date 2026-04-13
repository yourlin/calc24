import { ref, onUnmounted } from 'vue'

export function useTimer(initialSeconds: number = 60) {
  const timeLeft = ref(initialSeconds)
  const isRunning = ref(false)
  let timer: ReturnType<typeof setInterval> | null = null

  function start(onTimeout?: () => void) {
    stop()
    isRunning.value = true
    timer = setInterval(() => {
      timeLeft.value--
      if (timeLeft.value <= 0) {
        stop()
        onTimeout?.()
      }
    }, 1000)
  }

  function stop() {
    isRunning.value = false
    if (timer !== null) {
      clearInterval(timer)
      timer = null
    }
  }

  function reset(seconds?: number) {
    stop()
    timeLeft.value = seconds ?? initialSeconds
  }

  onUnmounted(() => stop())

  return { timeLeft, isRunning, start, stop, reset }
}
