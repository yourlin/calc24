import { ref, computed } from 'vue'

// === 类型定义 ===

export interface GameRecord {
  id: string
  date: string
  timestamp: number
  won: boolean
  timeUsed: number
  moves: number
  score: number
  numbers: number[]
}

export interface PlayerStats {
  totalGames: number
  totalWins: number
  winRate: number
  totalPlayTime: number
  longestStreak: number
  currentStreak: number
  avgTime: number
  avgMoves: number
  avgScore: number
}

export interface RadarData {
  speed: number
  precision: number
  endurance: number
  stability: number
  intuition: number
}

export interface TrendPoint {
  index: number
  score: number
  timeUsed: number
  won: boolean
}

// === 常量 ===

const STORAGE_KEY = 'calc24_gameRecords'
const MAX_RECORDS = 500

// === 存储操作 ===

function readRecords(): GameRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed as GameRecord[]
  } catch {
    return []
  }
}

function writeRecords(records: GameRecord[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
}

// === 聚合计算 ===

function calcStats(records: GameRecord[]): PlayerStats {
  if (records.length === 0) {
    return {
      totalGames: 0,
      totalWins: 0,
      winRate: 0,
      totalPlayTime: 0,
      longestStreak: 0,
      currentStreak: 0,
      avgTime: 0,
      avgMoves: 0,
      avgScore: 0,
    }
  }

  const totalGames = records.length
  const wins = records.filter(r => r.won)
  const totalWins = wins.length
  const winRate = totalGames > 0 ? Math.round((totalWins / totalGames) * 100) : 0
  const totalPlayTime = records.reduce((sum, r) => sum + r.timeUsed, 0)

  // 连胜计算
  let longestStreak = 0
  let currentStreak = 0
  let streak = 0

  // 从头遍历计算最长连胜
  for (const r of records) {
    if (r.won) {
      streak++
      longestStreak = Math.max(longestStreak, streak)
    } else {
      streak = 0
    }
  }

  // 从末尾计算当前连胜
  for (let i = records.length - 1; i >= 0; i--) {
    if (records[i].won) {
      currentStreak++
    } else {
      break
    }
  }

  // 平均值（仅胜利局）
  const avgTime = wins.length > 0
    ? Math.round(wins.reduce((sum, r) => sum + r.timeUsed, 0) / wins.length)
    : 0
  const avgMoves = wins.length > 0
    ? Math.round(wins.reduce((sum, r) => sum + r.moves, 0) / wins.length)
    : 0
  const avgScore = wins.length > 0
    ? Math.round(wins.reduce((sum, r) => sum + r.score, 0) / wins.length)
    : 0

  return {
    totalGames,
    totalWins,
    winRate,
    totalPlayTime,
    longestStreak,
    currentStreak,
    avgTime,
    avgMoves,
    avgScore,
  }
}

// === Composable ===

export function useStats() {
  const records = ref<GameRecord[]>(readRecords())

  const stats = computed<PlayerStats>(() => calcStats(records.value))

  function recordGame(data: { won: boolean; timeUsed: number; moves: number; score: number; numbers: number[] }): void {
    const now = Date.now()
    const record: GameRecord = {
      id: String(now),
      date: new Date(now).toISOString().slice(0, 10),
      timestamp: now,
      won: data.won,
      timeUsed: data.timeUsed,
      moves: data.moves,
      score: data.score,
      numbers: [...data.numbers],
    }

    const updated = [...records.value, record]
    // FIFO 淘汰
    if (updated.length > MAX_RECORDS) {
      updated.splice(0, updated.length - MAX_RECORDS)
    }

    records.value = updated
    writeRecords(updated)
  }

  function getRadarData(): RadarData | null {
    const wins = records.value.filter(r => r.won)
    if (wins.length < 5) return null

    // 速度：基于平均用时（60s 满分 0，0s 满分 100）
    const avgTime = wins.reduce((sum, r) => sum + r.timeUsed, 0) / wins.length
    const speed = Math.max(0, Math.min(100, Math.round(100 - (avgTime / 60) * 100)))

    // 精准：基于平均步数（40 步满分 0，0 步满分 100）
    const avgMoves = wins.reduce((sum, r) => sum + r.moves, 0) / wins.length
    const precision = Math.max(0, Math.min(100, Math.round(100 - (avgMoves / 40) * 100)))

    // 耐力：基于总局数（50 局满分）
    const endurance = Math.min(100, Math.round((records.value.length / 50) * 100))

    // 稳定：基于得分标准差（标准差越小越稳定）
    const scores = wins.map(r => r.score)
    const meanScore = scores.reduce((a, b) => a + b, 0) / scores.length
    const variance = scores.reduce((sum, s) => sum + (s - meanScore) ** 2, 0) / scores.length
    const stdDev = Math.sqrt(variance)
    const stability = Math.max(0, Math.min(100, Math.round(100 - (stdDev / 10) * 100)))

    // 直觉：步数 ≤ 8 的胜率
    const quickGames = records.value.filter(r => r.won && r.moves <= 8)
    const intuition = wins.length > 0
      ? Math.min(100, Math.round((quickGames.length / wins.length) * 100))
      : 0

    return { speed, precision, endurance, stability, intuition }
  }

  function getTrendData(limit: number = 20): TrendPoint[] {
    if (records.value.length < 3) return []

    const recent = records.value.slice(-limit)
    return recent.map((r, i) => ({
      index: i + 1,
      score: r.score,
      timeUsed: r.timeUsed,
      won: r.won,
    }))
  }

  function clearAll(): void {
    records.value = []
    localStorage.removeItem(STORAGE_KEY)
  }

  return {
    records,
    stats,
    recordGame,
    getRadarData,
    getTrendData,
    clearAll,
  }
}
