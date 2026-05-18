import { ref, watch, onUnmounted } from 'vue'
import type { Ref } from 'vue'

/**
 * 数字滚动动画 composable
 * @param target 目标值（响应式）
 * @param duration 动画时长（毫秒）
 */
export function useCountUp(target: Ref<number>, duration: number = 800) {
  const display = ref(0)
  let animationId: number | null = null

  function animate(from: number, to: number) {
    if (animationId !== null) {
      cancelAnimationFrame(animationId)
    }

    const startTime = performance.now()
    const diff = to - from

    function step(currentTime: number) {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)

      // ease-out 缓动
      const eased = 1 - (1 - progress) ** 3

      display.value = Math.round(from + diff * eased)

      if (progress < 1) {
        animationId = requestAnimationFrame(step)
      } else {
        display.value = to
        animationId = null
      }
    }

    animationId = requestAnimationFrame(step)
  }

  watch(target, (newVal, oldVal) => {
    animate(oldVal ?? 0, newVal)
  }, { immediate: true })

  onUnmounted(() => {
    if (animationId !== null) {
      cancelAnimationFrame(animationId)
    }
  })

  return display
}
