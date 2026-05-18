# Epics & Stories：个人技术统计

> 项目：Calc24 | 基于：PRD + 架构文档
> 日期：2026-05-18

---

## Epic 1: 统计数据基础设施

> 建立数据采集和持久化能力，为所有统计功能提供数据基础。

### Story 1.1: 创建 useStats composable

**描述**：实现统计数据管理的核心 composable，包括数据模型定义、localStorage 读写、记录追加和聚合计算。

**验收标准**：
- [ ] 定义 `GameRecord` 和 `PlayerStats` TypeScript 接口
- [ ] 实现 `recordGame()` 方法，将单局数据追加到 localStorage
- [ ] 实现 `getPlayerStats()` 计算聚合统计（总局数、胜率、连胜、平均值）
- [ ] 实现 FIFO 淘汰策略（超过 500 条删除最早记录）
- [ ] localStorage key 为 `calc24_gameRecords`，不影响现有数据
- [ ] 通过 `vue-tsc` 类型检查

**技术备注**：
- 文件：`src/composables/useStats.ts`
- 连胜计算需要从最新记录向前遍历
- 平均值仅基于胜利局计算

**估算**：30 分钟

---

### Story 1.2: 集成数据采集到游戏流程

**描述**：在游戏结束时（胜利或失败）自动调用 `useStats().recordGame()` 记录本局数据。

**验收标准**：
- [ ] 胜利时记录：won=true, timeUsed, moves, score, numbers
- [ ] 失败（超时）时记录：won=false, timeUsed=60, moves, score=0, numbers
- [ ] 集成在 `App.vue` 的 `watch(gamePhase)` 中，不修改 `useGame.ts` 内部
- [ ] 刷新页面后数据仍然存在
- [ ] 现有排行榜功能不受影响

**技术备注**：
- 修改文件：`src/App.vue`
- 在现有 `watch(gamePhase)` 回调中追加逻辑

**估算**：15 分钟

---

## Epic 2: 统计面板 UI

> 创建统计面板的容器和基础数据展示。

### Story 2.1: 创建 StatsPanel 组件框架

**描述**：创建统计面板的 overlay 容器，包含头部（标题 + 关闭按钮）和内容区域骨架。

**验收标准**：
- [ ] 面板以 overlay 形式展示（与排行榜面板风格一致）
- [ ] 包含标题"📊 个人统计"和关闭按钮
- [ ] 内容区域可滚动
- [ ] 打开/关闭有 slideUp 动画
- [ ] 移动端布局正常

**技术备注**：
- 文件：`src/components/StatsPanel.vue`
- 复用 `.leaderboard-overlay` 的样式模式
- 接收 `t`（i18n）prop

**估算**：15 分钟

---

### Story 2.2: 添加统计入口按钮

**描述**：在主界面 idle 状态下添加"📊 统计"按钮，点击打开统计面板。

**验收标准**：
- [ ] 按钮在 idle 状态的 start-section 中显示（与排行榜按钮并列）
- [ ] 按钮样式与排行榜按钮一致
- [ ] 点击打开 StatsPanel
- [ ] 支持中英文文案切换

**技术备注**：
- 修改文件：`src/App.vue`、`src/composables/useI18n.ts`
- 新增 i18n key：`stats`、`statsTitle`

**估算**：10 分钟

---

### Story 2.3: 累计数据卡片展示

**描述**：在统计面板顶部展示三个核心数据卡片：总局数、胜率、最长连胜。

**验收标准**：
- [ ] 三个卡片横向排列（flex）
- [ ] 显示：总局数（数字）、胜率（百分比）、最长连胜（数字）
- [ ] 数据从 `useStats().stats` 读取
- [ ] 无数据时显示 0 / 0% / 0
- [ ] 支持中英文

**技术备注**：
- 在 `StatsPanel.vue` 中实现
- 新增 i18n keys：`totalGames`、`winRate`、`longestStreak`

**估算**：15 分钟

---

### Story 2.4: 底部详细统计展示

**描述**：在面板底部展示平均用时、平均步数、总游戏时长。

**验收标准**：
- [ ] 显示：平均用时（秒）、平均步数（次）、总游戏时长（格式化为 Xh Xm）
- [ ] 无胜利局时平均值显示 "--"
- [ ] 支持中英文

**技术备注**：
- 在 `StatsPanel.vue` 中实现
- 新增 i18n keys：`avgTime`、`avgMoves`、`totalPlayTime`
- 时长格式化：`≥60min` 显示 `Xh Xm`，`<60min` 显示 `Xm Xs`

**估算**：10 分钟

---

## Epic 3: 能力雷达图

> 用可视化雷达图展示玩家五维能力。

### Story 3.1: 实现雷达图五维数据计算

**描述**：在 `useStats` 中实现 `getRadarData()` 方法，计算速度、精准、耐力、稳定、直觉五个维度的分值。

**验收标准**：
- [ ] 返回 `RadarData` 对象，每个维度 0-100
- [ ] 速度：基于平均用时（越快越高）
- [ ] 精准：基于平均步数（越少越高）
- [ ] 耐力：基于总局数（50 局满分）
- [ ] 稳定：基于得分标准差（越小越高）
- [ ] 直觉：基于步数 ≤ 8 的胜率
- [ ] 不足 5 局时返回 null

**技术备注**：
- 在 `src/composables/useStats.ts` 中添加
- 标准差计算：`sqrt(sum((x - mean)^2) / n)`

**估算**：20 分钟

---

### Story 3.2: 实现 RadarChart SVG 组件

**描述**：创建纯 SVG 雷达图组件，渲染五边形网格和数据多边形。

**验收标准**：
- [ ] 渲染 3 层同心五边形网格背景
- [ ] 渲染数据多边形（填充半透明 + 描边）
- [ ] 5 个轴线从中心到顶点
- [ ] 5 个轴标签（中/英文，根据 i18n）
- [ ] 5 个数据点圆点
- [ ] 响应式尺寸（viewBox 280×280）
- [ ] 数据不足时显示"再玩 N 局解锁"提示

**技术备注**：
- 文件：`src/components/RadarChart.vue`
- Props：`data: RadarData | null`、`labels: string[]`
- 五边形顶点计算：`(cx + r*sin(i*72°), cy - r*cos(i*72°))`

**估算**：40 分钟

---

### Story 3.3: 雷达图展开动画

**描述**：面板打开时，雷达图数据多边形从中心点展开到目标位置。

**验收标准**：
- [ ] 初始状态：数据多边形收缩在中心
- [ ] 动画：0.6s ease-out 展开到目标位置
- [ ] 使用 CSS transition（不用 JS 动画）

**技术备注**：
- 通过 `mounted` 后延迟设置目标 points 触发 transition
- SVG polygon 的 points 属性不支持 CSS transition，改用 `transform: scale()` 或逐帧更新

**估算**：15 分钟

---

## Epic 4: 近期趋势图

> 用折线图展示最近 20 局的表现趋势。

### Story 4.1: 实现趋势数据获取

**描述**：在 `useStats` 中实现 `getTrendData()` 方法，返回最近 N 局的趋势数据点。

**验收标准**：
- [ ] 返回 `TrendPoint[]`，包含 index、score、timeUsed、won
- [ ] 默认返回最近 20 局
- [ ] 不足 3 局时返回空数组
- [ ] 按时间正序排列（最早在左）

**技术备注**：
- 在 `src/composables/useStats.ts` 中添加

**估算**：10 分钟

---

### Story 4.2: 实现 TrendChart SVG 组件

**描述**：创建纯 SVG 折线图组件，展示得分或用时的趋势。

**验收标准**：
- [ ] 渲染折线 + 数据点
- [ ] 胜利局绿点，失败局红点
- [ ] 平均线（虚线）+ 标签
- [ ] X 轴：局数序号
- [ ] Y 轴：自适应范围（min-max 留 10% padding）
- [ ] 响应式宽度（100%）× 固定高度（160px）
- [ ] 数据不足时显示"数据积累中..."

**技术备注**：
- 文件：`src/components/TrendChart.vue`
- Props：`data: TrendPoint[]`、`mode: 'score' | 'time'`
- SVG polyline 绘制折线

**估算**：35 分钟

---

### Story 4.3: 趋势图模式切换

**描述**：添加 [得分] / [用时] 切换标签，允许用户在两种视图间切换。

**验收标准**：
- [ ] 两个 tab 按钮：得分 / 用时
- [ ] 点击切换折线图数据源
- [ ] 当前选中 tab 高亮
- [ ] 切换时折线平滑过渡
- [ ] 支持中英文

**技术备注**：
- 在 `StatsPanel.vue` 中管理 `trendMode` 状态
- 新增 i18n keys：`trendScore`、`trendTime`

**估算**：10 分钟

---

## Epic 5: 多语言与体验打磨

> 完善多语言支持和交互细节。

### Story 5.1: 完善 i18n 文案

**描述**：为统计功能添加所有中英文文案。

**验收标准**：
- [ ] 所有统计面板文案支持中英文切换
- [ ] 雷达图五维标签中英文
- [ ] 趋势图标签中英文
- [ ] 空状态提示中英文
- [ ] 切换语言后统计面板实时更新

**技术备注**：
- 修改文件：`src/composables/useI18n.ts`
- 参考架构文档中的完整文案列表

**估算**：10 分钟

---

### Story 5.2: 数字滚动动画（可选）

**描述**：统计面板打开时，数字从 0 滚动到实际值。

**验收标准**：
- [ ] 总局数、胜率、连胜数字有滚动动画
- [ ] 动画时长 0.8s，ease-out 缓动
- [ ] 不影响性能

**技术备注**：
- 使用 `requestAnimationFrame` 实现
- 可封装为 `useCountUp(target, duration)` composable

**估算**：15 分钟

---

## Sprint 计划建议

### Sprint 1（核心功能，~1.5h）

| Story | 优先级 | 估算 | 依赖 |
|-------|--------|------|------|
| 1.1 useStats composable | P0 | 30min | — |
| 1.2 集成数据采集 | P0 | 15min | 1.1 |
| 2.1 StatsPanel 框架 | P0 | 15min | — |
| 2.2 统计入口按钮 | P0 | 10min | 2.1 |
| 2.3 累计数据卡片 | P0 | 15min | 1.1, 2.1 |
| 2.4 底部详细统计 | P0 | 10min | 1.1, 2.1 |

### Sprint 2（可视化，~1.5h）

| Story | 优先级 | 估算 | 依赖 |
|-------|--------|------|------|
| 3.1 雷达图数据计算 | P1 | 20min | 1.1 |
| 3.2 RadarChart 组件 | P1 | 40min | 3.1 |
| 4.1 趋势数据获取 | P1 | 10min | 1.1 |
| 4.2 TrendChart 组件 | P1 | 35min | 4.1 |
| 4.3 趋势图模式切换 | P1 | 10min | 4.2 |

### Sprint 3（打磨，~40min）

| Story | 优先级 | 估算 | 依赖 |
|-------|--------|------|------|
| 5.1 完善 i18n | P2 | 10min | 全部 |
| 3.3 雷达图动画 | P2 | 15min | 3.2 |
| 5.2 数字滚动动画 | P2 | 15min | 2.3 |

---

## 依赖关系图

```
1.1 useStats ──┬──→ 1.2 集成采集
               ├──→ 2.3 累计卡片 ──→ 5.2 数字动画
               ├──→ 2.4 详细统计
               ├──→ 3.1 雷达数据 ──→ 3.2 RadarChart ──→ 3.3 动画
               └──→ 4.1 趋势数据 ──→ 4.2 TrendChart ──→ 4.3 模式切换

2.1 StatsPanel ──→ 2.2 入口按钮
                    ↑
              (所有子组件挂载于此)
```
