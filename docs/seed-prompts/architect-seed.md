# 运维/架构 — Winston Agent Seed Prompt
> 备选方案：如果 BMAD 已安装，直接在 AI IDE 中输入 `/architect` → 选择 `CA` 即可。

## Prompt
```
CA

Analyze the existing Calc24 architecture and create an incremental 
architecture document.

Current stack: Vue 3 + TypeScript + Vite + SCSS
Existing patterns:
- Composables: useGame, useTimer, useI18n, useLeaderboard
- Components: FormulaBoard, CountdownTimer, BracketPicker, etc.
- Utils: solver.ts (24-point algorithm)

Focus on:
- Current architecture overview (component tree + data flow)
- Proposed improvements (state management, component optimization)
- Performance considerations
- Testing architecture (Vitest integration)

Output: Architecture delta document (what changes, what stays)
```
