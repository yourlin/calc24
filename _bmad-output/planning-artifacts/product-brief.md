# Product Brief: Calc24 — 24 点计算器游戏

## Overview
一个基于 Vue 3 的移动端 24 点计算器游戏，支持倒计时挑战、排行榜和多语言。
用户从 4 张数字牌中选择数字和运算符，组合出结果为 24 的算式。

## Target Users
- 数学爱好者
- 休闲游戏玩家
- 教育场景（数学思维训练）

## Core Features
1. 随机生成 4 张数字牌（1-13）
2. 用户通过选择数字和运算符构建算式
3. 支持括号改变运算优先级
4. 倒计时挑战模式
5. 本地排行榜
6. 中英文双语支持
7. 自动求解器（验证是否有解）

## Technical Stack
- 前端框架：Vue 3 (Composition API)
- 语言：TypeScript
- 构建工具：Vite
- 样式：SCSS
- 移动端适配：@vant/touch-emulator
- 部署：GitHub Pages

## Success Criteria
- 游戏核心逻辑正确（所有有解的牌组都能被求解器验证）
- 移动端体验流畅
- 倒计时和排行榜功能完整
- 支持中英文切换

## Scale
- 小型项目（单页应用）
- 纯前端，无后端依赖
