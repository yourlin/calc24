# QA — Quinn Agent Seed Prompt
> 备选方案：如果 BMAD 已安装，直接在 AI IDE 中输入 `/qa` → 选择 `TS` 即可。

## Prompt
```
QA

Generate test strategy and test cases for Calc24.

Focus areas:
- Unit tests for solver algorithm (src/utils/solver.ts)
- Component tests for Vue components
- Game flow integration tests
- Edge cases: boundary numbers, no-solution hands, timer expiry

Tools: Vitest + @vue/test-utils
Output: Test strategy + acceptance test cases
```
