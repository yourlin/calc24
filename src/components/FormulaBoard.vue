<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  numbers: number[]
  operators: string[]
  bracketMode: number
  result: number | null
  is24: boolean
  disabled: boolean
}>()

/**
 * Compute prefix/suffix brackets for each number position based on bracketMode.
 * Returns [prefix, suffix] for each of the 4 positions.
 *
 * Mode 0: a ○ b ○ c ○ d         → no brackets
 * Mode 1: (a ○ (b ○ c)) ○ d     → pos0:'(' pos1:'(' pos2:'))' pos3:''
 * Mode 2: (a ○ b) ○ (c ○ d)     → pos0:'(' pos1:')' pos2:'(' pos3:')'
 * Mode 3: a ○ ((b ○ c) ○ d)     → pos0:'' pos1:'((' pos2:')' pos3:')'
 * Mode 4: a ○ (b ○ (c ○ d))     → pos0:'' pos1:'(' pos2:'(' pos3:'))'
 */
const brackets = computed<[string, string][]>(() => {
  switch (props.bracketMode) {
    case 1: return [['(', ''], ['(', ''], ['', '))'], ['', '']]
    case 2: return [['(', ''], ['', ')'], ['(', ''], ['', ')']]
    case 3: return [['', ''], ['((', ''], ['', ')'], ['', ')']]
    case 4: return [['', ''], ['(', ''], ['(', ''], ['', '))']]
    default: return [['', ''], ['', ''], ['', ''], ['', '']]
  }
})

const emit = defineEmits<{
  swap: [i: number, j: number]
  operatorChange: [index: number, op: string]
}>()

const dragIndex = ref<number | null>(null)
const dragOverIndex = ref<number | null>(null)

const opSymbols: Record<string, string> = {
  '+': '+',
  '-': '-',
  '*': '\u00d7',
  '/': '\u00f7',
}

const opList = ['+', '-', '*', '/']

function onDragStart(index: number) {
  if (props.disabled) return
  dragIndex.value = index
}

function onDragOver(index: number) {
  if (props.disabled || dragIndex.value === null || dragIndex.value === index) return
  dragOverIndex.value = index
}

function onDragEnd() {
  if (dragIndex.value !== null && dragOverIndex.value !== null) {
    emit('swap', dragIndex.value, dragOverIndex.value)
  }
  dragIndex.value = null
  dragOverIndex.value = null
}

// Touch drag support
let touchStartIndex: number | null = null
function onTouchStart(index: number, _e: TouchEvent) {
  if (props.disabled) return
  touchStartIndex = index
  dragIndex.value = index
}

function onTouchMove(e: TouchEvent) {
  if (touchStartIndex === null) return
  e.preventDefault()
  const touch = e.touches[0]
  const elements = document.querySelectorAll('.number-card')
  let overIndex: number | null = null

  elements.forEach((el, idx) => {
    const rect = el.getBoundingClientRect()
    if (
      touch.clientX >= rect.left &&
      touch.clientX <= rect.right &&
      touch.clientY >= rect.top &&
      touch.clientY <= rect.bottom
    ) {
      overIndex = idx
    }
  })

  dragOverIndex.value = overIndex !== touchStartIndex ? overIndex : null
}

function onTouchEnd() {
  if (touchStartIndex !== null && dragOverIndex.value !== null) {
    emit('swap', touchStartIndex, dragOverIndex.value)
  }
  touchStartIndex = null
  dragIndex.value = null
  dragOverIndex.value = null
}

function cycleOperator(index: number) {
  if (props.disabled) return
  const currentIdx = opList.indexOf(props.operators[index])
  const nextIdx = (currentIdx + 1) % opList.length
  emit('operatorChange', index, opList[nextIdx])
}

function formatResult(val: number | null): string {
  if (val === null) return '?'
  if (Number.isInteger(val)) return String(val)
  return val.toFixed(2)
}
</script>

<template>
  <div class="formula-board">
    <div class="formula-row">
      <template v-for="(num, idx) in numbers" :key="idx">
        <span v-if="brackets[idx][0]" class="bracket">{{ brackets[idx][0] }}</span>
        <div
          class="number-card"
          :class="{
            dragging: dragIndex === idx,
            'drag-over': dragOverIndex === idx
          }"
          draggable="true"
          @dragstart="onDragStart(idx)"
          @dragover.prevent="onDragOver(idx)"
          @dragend="onDragEnd"
          @touchstart="onTouchStart(idx, $event)"
          @touchmove="onTouchMove"
          @touchend="onTouchEnd"
        >
          {{ num }}
        </div>
        <span v-if="brackets[idx][1]" class="bracket">{{ brackets[idx][1] }}</span>
        <button
          v-if="idx < 3"
          class="operator-select"
          :disabled="disabled"
          @click="cycleOperator(idx)"
        >
          {{ opSymbols[operators[idx]] }}
        </button>
      </template>
      <span class="equal-sign">=</span>
      <span class="result-display" :class="{ 'is-24': is24 }">
        {{ formatResult(result) }}
      </span>
    </div>
  </div>
</template>
