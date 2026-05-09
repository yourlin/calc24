import { ref } from 'vue'

export type LeaderboardDimension = 'highScore' | 'fastestTime' | 'fewestMoves'

export type LeaderboardEntry = {
  value: number
  date: string
}

export type NewRecordResult = {
  highScore: boolean
  fastestTime: boolean
  fewestMoves: boolean
}

const STORAGE_KEYS: Record<LeaderboardDimension, string> = {
  highScore: 'calc24_highScore',
  fastestTime: 'calc24_fastestTime',
  fewestMoves: 'calc24_fewestMoves',
}

const MAX_ENTRIES = 10

function readFromStorage(dimension: LeaderboardDimension): LeaderboardEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS[dimension])
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed as LeaderboardEntry[]
  } catch {
    return []
  }
}

function writeToStorage(dimension: LeaderboardDimension, entries: LeaderboardEntry[]): void {
  localStorage.setItem(STORAGE_KEYS[dimension], JSON.stringify(entries))
}

function isBetter(dimension: LeaderboardDimension, newValue: number, existingValue: number): boolean {
  if (dimension === 'highScore') {
    return newValue > existingValue
  }
  // For time and moves, lower is better
  return newValue < existingValue
}

function insertSorted(dimension: LeaderboardDimension, entries: LeaderboardEntry[], entry: LeaderboardEntry): LeaderboardEntry[] {
  const result = [...entries]
  let insertIndex = result.length
  for (let i = 0; i < result.length; i++) {
    if (isBetter(dimension, entry.value, result[i].value)) {
      insertIndex = i
      break
    }
  }
  result.splice(insertIndex, 0, entry)
  return result.slice(0, MAX_ENTRIES)
}

function qualifiesForLeaderboard(dimension: LeaderboardDimension, value: number, entries: LeaderboardEntry[]): boolean {
  if (entries.length < MAX_ENTRIES) return true
  const worst = entries[entries.length - 1]
  return isBetter(dimension, value, worst.value)
}

export function useLeaderboard() {
  const records = ref<Record<LeaderboardDimension, LeaderboardEntry[]>>({
    highScore: readFromStorage('highScore'),
    fastestTime: readFromStorage('fastestTime'),
    fewestMoves: readFromStorage('fewestMoves'),
  })

  function refreshRecords() {
    records.value = {
      highScore: readFromStorage('highScore'),
      fastestTime: readFromStorage('fastestTime'),
      fewestMoves: readFromStorage('fewestMoves'),
    }
  }

  function addRecord(score: number, timeUsed: number, movesUsed: number): NewRecordResult {
    const today = new Date().toISOString().slice(0, 10)
    const result: NewRecordResult = {
      highScore: false,
      fastestTime: false,
      fewestMoves: false,
    }

    // High Score
    if (qualifiesForLeaderboard('highScore', score, records.value.highScore)) {
      records.value.highScore = insertSorted('highScore', records.value.highScore, { value: score, date: today })
      writeToStorage('highScore', records.value.highScore)
      result.highScore = true
    }

    // Fastest Time
    if (qualifiesForLeaderboard('fastestTime', timeUsed, records.value.fastestTime)) {
      records.value.fastestTime = insertSorted('fastestTime', records.value.fastestTime, { value: timeUsed, date: today })
      writeToStorage('fastestTime', records.value.fastestTime)
      result.fastestTime = true
    }

    // Fewest Moves
    if (qualifiesForLeaderboard('fewestMoves', movesUsed, records.value.fewestMoves)) {
      records.value.fewestMoves = insertSorted('fewestMoves', records.value.fewestMoves, { value: movesUsed, date: today })
      writeToStorage('fewestMoves', records.value.fewestMoves)
      result.fewestMoves = true
    }

    return result
  }

  function getRecords(dimension: LeaderboardDimension): LeaderboardEntry[] {
    return records.value[dimension]
  }

  return {
    records,
    addRecord,
    getRecords,
    refreshRecords,
  }
}
