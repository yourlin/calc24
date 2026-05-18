# 技术架构文档：个人技术统计

> 项目：Calc24 | 类型：增量架构设计 | 作者：Architect Agent (Winston)
> 日期：2026-05-18

---

## 1. 现有架构概览

### 1.1 组件树

```
App.vue
├── FormulaBoard.vue      — 算式展示 + 数字拖拽 + 运算符切换
├── BracketPicker.vue     — 括号模式选择
├── CountdownTimer.vue    — 倒计时环形进度
├── ResultDialog.vue      — 胜利/失败弹窗
└── LeaderboardPanel.vue  — 排行榜面板（overlay）
```

### 1.2 Composables 层

```
useGame.ts          — 游戏状态机（idle → playing → won/lost）
useTimer.ts         — 倒计时逻辑（start/stop/reset）
useI18n.ts          — 中英文切换（响应式 computed）
useLeaderboard.ts   — 排行榜 CRUD（localStorage）
```

### 1.3 数据流

```
用户操作 → useGame (状态变更) → 组件响应式更新
                ↓ (gamePhase === 'won')
         useLeaderboard.addRecord()
                ↓
         localStorage 持久化
```

### 1.4 设计模式

| 模式 | 应用 |
|------|------|
| Composition API | 所有逻辑封装为 `useXxx()` composable |
| 单向数据流 | App.vue 持有状态，子组件通过 props/emit 通信 |
| Overlay 模式 | 弹窗类 UI 用 fixed overlay + 卡片动画 |
| localStorage 持久化 | 各模块独立 key，JSON 序列化 |

---

## 2. 增量架构设计

### 2.1 新增组件

```
App.vue
├── ... (现有组件不变)
├── StatsPanel.vue          — 统计面板主容器（overlay）
│   ├── StatsOverview.vue   — 累计数据卡片区（可选拆分）
│   ├── RadarChart.vue      — 五维能力雷达图（SVG）
│   └── TrendChart.vue      — 近期趋势折线图（SVG）
```

### 2.2 新增 Composable

```
useStats.ts — 统计数据管理
├── recordGame()        — 记录单局数据
├── getPlayerStats()    — 计算聚合统计
├── getRadarData()      — 计算雷达图五维数据
├── getTrendData()      — 获取最近 N 局趋势
└── clearStats()        — 清除所有统计（可选）
```

### 2.3 数据流（增量）

```
游戏结束 (won/lost)
    ↓
useGame → watch(gamePhase)
    ↓
useStats.recordGame({won, timeUsed, moves, score, numbers})
    ↓
localStorage('calc24_gameRecords') 追加记录
    ↓
用户打开统计面板
    ↓
useStats.getPlayerStats() → 按需聚合计算
    ↓
StatsPanel.vue 渲染
```

---

## 3. 详细设计

### 3.1 useStats.ts 接口设计

```typescript
// === 类型定义 ===

interface GameRecord {
  id: string              // `${Date.now()}`
  date: string            // YYYY-MM-DD
  timestamp: number       // Date.now()
  won: boolean
  timeUsed: number        // 秒（0-60）
  moves: number
  score: number
  numbers: number[]       // 本局 4 张牌
}

interface PlayerStats {
  totalGames: number
  totalWins: number
  winRate: number          // 0-100
  totalPlayTime: number    // 秒
  longestStreak: number
  currentStreak: number
  avgTime: number          // 仅胜利局
  avgMoves: number         // 仅胜利局
  avgScore: number         // 仅胜利局
}

interface RadarData {
  speed: number       // 0-100，基于平均用时
  precision: number   // 0-100，基于平均步数
  endurance: number   // 0-100，基于连续游戏局数
  stability: number   // 0-100，基于得分标准差
  intuition: number   // 0-100，基于首次操作正确率（步数≤5的胜率）
}

interface TrendPoint {
  index: number
  score: number
  timeUsed: number
  won: boolean
}

// === Composable 接口 ===

function useStats() {
  // 响应式状态
  const records: Ref<GameRecord[]>
  const stats: ComputedRef<PlayerStats>

  // 方法
  function recordGame(data: Omit<GameRecord, 'id' | 'date' | 'timestamp'>): void
  function getRadarData(): RadarData
  function getTrendData(limit?: number): TrendPoint[]  // 默认 20
  function clearAll(): void

  return { records, stats, recordGame, getRadarData, getTrendData, clearAll }
}
```

### 3.2 存储策略

| Key | 内容 | 大小估算 |
|-----|------|----------|
| `calc24_gameRecords` | GameRecord[] | ~150 bytes/条 × 500 = ~75KB |

**淘汰策略**：超过 500 条时，删除最早的记录（FIFO）。

**读写时机**：
- 写入：每局结束时追加 1 条
- 读取：打开统计面板时一次性加载，计算后缓存

**向后兼容**：使用独立 key，不影响现有 `calc24_highScore` / `calc24_fastestTime` / `calc24_fewestMoves`。

### 3.3 RadarChart.vue 设计

```
技术方案：纯 SVG 实现
尺寸：280 × 280（viewBox，实际响应式缩放）
结构：
  - 五边形网格背景（3 层同心五边形）
  - 数据多边形（填充 + 描边）
  - 5 个轴标签（中/英文）
  - 5 个数据点圆点

动画：数据多边形从中心展开到目标位置（CSS transition on points）
```

**雷达图五维计算逻辑**：

| 维度 | 计算方式 | 满分条件 |
|------|----------|----------|
| 速度 | `100 - (avgTime / 60 * 100)` | 平均 0 秒 |
| 精准 | `100 - (avgMoves / 40 * 100)` | 平均 0 步 |
| 耐力 | `min(100, totalGames / 50 * 100)` | 累计 50 局 |
| 稳定 | `100 - min(100, scoreStdDev / 10 * 100)` | 标准差为 0 |
| 直觉 | `quickWinRate * 100`（步数 ≤ 8 的胜率） | 100% 快速胜利 |

### 3.4 TrendChart.vue 设计

```
技术方案：纯 SVG 实现
尺寸：100% 宽度 × 160px 高度
结构：
  - X 轴：局数序号（最近 20 局）
  - Y 轴：得分 或 用时（可切换）
  - 折线 + 数据点
  - 平均线（虚线）
  - 胜/负标记（绿点/红点）

交互：点击切换 [得分] / [用时] 标签
动画：折线从左到右逐步绘制（stroke-dasharray 动画）
```

### 3.5 StatsPanel.vue 布局

```
┌─────────────────────────────────────┐
│ 📊 个人统计              [× 关闭]   │  ← header（flex between）
├─────────────────────────────────────┤
│ ┌─────────┐ ┌─────────┐ ┌────────┐ │
│ │ 总局数  │ │  胜率   │ │ 连胜   │ │  ← overview cards（flex）
│ │   42    │ │  78%    │ │  12    │ │
│ └─────────┘ └─────────┘ └────────┘ │
├─────────────────────────────────────┤
│          🕸️ 能力雷达图              │  ← RadarChart（居中）
│         [SVG 280×280]               │
├─────────────────────────────────────┤
│  📈 近期趋势  [得分|用时]           │  ← TrendChart + tab 切换
│  [SVG 折线图 100%×160]              │
├─────────────────────────────────────┤
│  平均用时: 28s │ 平均步数: 12       │  ← footer stats
│  总游戏时长: 2h 15m                 │
└─────────────────────────────────────┘
```

---

## 4. 集成点

### 4.1 useGame.ts 修改（最小侵入）

```typescript
// 在 App.vue 的 watch(gamePhase) 中添加，不修改 useGame 内部
watch(gamePhase, (phase) => {
  if (phase === 'won') {
    newRecords.value = addRecord(estimatedScore.value, lastRoundTime.value, lastRoundMoves.value)
    // 新增：记录统计
    recordGame({
      won: true,
      timeUsed: lastRoundTime.value,
      moves: lastRoundMoves.value,
      score: estimatedScore.value,
      numbers: [...numbers.value],
    })
  }
  if (phase === 'lost') {
    // 新增：记录失败
    recordGame({
      won: false,
      timeUsed: 60,
      moves: moves.value,
      score: 0,
      numbers: [...numbers.value],
    })
  }
})
```

**设计决策**：在 App.vue 层集成而非修改 useGame 内部，保持 useGame 的单一职责。

### 4.2 App.vue 修改

```typescript
// 新增 import
import StatsPanel from './components/StatsPanel.vue'
import { useStats } from './composables/useStats'

// 新增状态
const showStats = ref(false)
const { recordGame } = useStats()
```

```html
<!-- 在 start-section 中添加统计按钮 -->
<button class="stats-btn" @click="showStats = true">{{ t.stats }}</button>

<!-- 统计面板 -->
<StatsPanel v-if="showStats" :t="t" @close="showStats = false" />
```

### 4.3 useI18n.ts 新增文案

```typescript
// zh
stats: '统计',
statsTitle: '个人统计',
totalGames: '总局数',
winRate: '胜率',
longestStreak: '最长连胜',
avgTime: '平均用时',
avgMoves: '平均步数',
totalPlayTime: '总时长',
radarSpeed: '速度',
radarPrecision: '精准',
radarEndurance: '耐力',
radarStability: '稳定',
radarIntuition: '直觉',
trendScore: '得分',
trendTime: '用时',
trendAvgLine: '平均',
unlockRadar: '再玩 {n} 局解锁能力分析',
dataAccumulating: '数据积累中...',

// en
stats: 'Stats',
statsTitle: 'Personal Stats',
totalGames: 'Games',
winRate: 'Win Rate',
longestStreak: 'Best Streak',
avgTime: 'Avg Time',
avgMoves: 'Avg Moves',
totalPlayTime: 'Play Time',
radarSpeed: 'Speed',
radarPrecision: 'Precision',
radarEndurance: 'Endurance',
radarStability: 'Stability',
radarIntuition: 'Intuition',
trendScore: 'Score',
trendTime: 'Time',
trendAvgLine: 'Average',
unlockRadar: 'Play {n} more to unlock',
dataAccumulating: 'Accumulating data...',
```

---

## 5. 文件清单

### 新增文件

| 文件 | 职责 | 预估行数 |
|------|------|----------|
| `src/composables/useStats.ts` | 统计数据管理 | ~120 行 |
| `src/components/StatsPanel.vue` | 统计面板主容器 | ~100 行 |
| `src/components/RadarChart.vue` | SVG 雷达图 | ~130 行 |
| `src/components/TrendChart.vue` | SVG 趋势图 | ~110 行 |

### 修改文件

| 文件 | 修改内容 | 影响范围 |
|------|----------|----------|
| `src/App.vue` | 添加统计按钮 + 面板 + watch 集成 | 低风险 |
| `src/composables/useI18n.ts` | 添加统计相关文案 | 无风险 |
| `src/styles/main.scss` | 添加统计面板样式 | 无风险 |

---

## 6. 技术决策记录

| 决策 | 选择 | 理由 |
|------|------|------|
| 图表实现 | 纯 SVG | 无新依赖，包体积不增长，项目规模不需要 Chart.js |
| 数据聚合 | 按需计算 | 500 条记录的聚合计算 < 1ms，无需预计算缓存 |
| 集成方式 | App.vue watch | 不侵入 useGame 内部，保持现有 composable 的单一职责 |
| 存储格式 | 独立 key | 与排行榜数据隔离，互不影响 |
| 雷达图最低局数 | 5 局 | 少于 5 局统计意义不大，避免误导 |
| 记录上限 | 500 条 | ~75KB localStorage，远低于 5MB 限制 |
| 失败局也记录 | 是 | 胜率、耐力等维度需要完整数据 |

---

## 7. 风险与缓解

| 风险 | 影响 | 缓解 |
|------|------|------|
| localStorage 被清除 | 统计数据丢失 | 提示用户这是本地数据；未来可加导出功能 |
| SVG 雷达图在低端设备卡顿 | 体验下降 | 控制动画复杂度，使用 CSS transition 而非 JS 动画 |
| 旧用户无历史数据 | 统计面板空白 | 显示友好的"开始游戏积累数据"引导 |
| 数据模型变更 | 旧数据不兼容 | 加 version 字段，读取时做迁移 |

---

## 8. 实现顺序建议

```
Story 1: useStats.ts + 数据采集集成        (P0, 30min)
    ↓
Story 2: StatsPanel.vue + 累计数据展示     (P0, 20min)
    ↓
Story 3: RadarChart.vue                    (P1, 40min)
    ↓
Story 4: TrendChart.vue                    (P1, 30min)
    ↓
Story 5: 多语言 + 动画打磨                 (P2, 25min)
```
