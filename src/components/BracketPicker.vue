<script setup lang="ts">
import { computed } from 'vue'
import { getBracketLabels } from '../utils/solver'
import { useI18n } from '../composables/useI18n'

const { t } = useI18n()

const props = defineProps<{
  modelValue: number
  numbers: number[]
  operators: string[]
  noBracketLabel: string
  disabled: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: number]
}>()

const labels = computed(() => {
  const list = getBracketLabels(props.numbers, props.operators)
  list[0] = props.noBracketLabel
  return list
})
</script>

<template>
  <div class="bracket-picker">
    <div class="bracket-label">{{ t.bracketMode }}</div>
    <div class="bracket-options">
      <button
        v-for="(label, idx) in labels"
        :key="idx"
        class="bracket-btn"
        :class="{ active: modelValue === idx }"
        :disabled="disabled"
        @click="emit('update:modelValue', idx)"
      >
        {{ label }}
      </button>
    </div>
  </div>
</template>
