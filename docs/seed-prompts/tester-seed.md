# 测试工程师 — Quinn + TEA Agent Seed Prompt
> 备选方案：如果 BMAD 已安装，直接在 AI IDE 中输入 `/qa` → 选择 `UT` / `CT` / `E2E` 即可。

## Prompt
```
QA

As a Test Engineer, create comprehensive test suites for Calc24.

Focus areas:
- Solver algorithm correctness (all valid 4-number combinations)
- Game state management (useGame composable)
- Timer accuracy (useTimer composable)
- Leaderboard persistence (useLeaderboard composable)
- UI component rendering and interaction
- Edge cases: all same numbers, max/min values, rapid clicks

Tools: Vitest + @vue/test-utils + Playwright (E2E)

Deliverables:
1. Unit tests for solver (src/__tests__/solver.test.ts)
2. Component tests (src/__tests__/components/)
3. E2E tests for full game flow (e2e/)
4. Test configuration (vitest.config.ts)
```
