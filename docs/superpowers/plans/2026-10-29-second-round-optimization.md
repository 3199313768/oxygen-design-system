# Second Round Design Optimization Implementation Plan

> **For agentic workers:** Inline execution with test-first checkpoints.

**Goal:** 完成上一轮审查提出的六项优化：层级、筛选栅格、表格批量操作、统一密度、token 收敛和真实业务示例。

**Architecture:** 保留 Oxygen 现有组件 API，在 Table 增加可选列布局和全选能力；ConfigProvider 增加 default/compact 密度上下文并通过继承 token 生效；验收页用 pattern 级布局约束展示真实组合。所有行为变更先写回归测试。

**Tech Stack:** React 19, TypeScript, CSS custom properties, Vitest, Storybook, Playwright。

## Tasks

- [x] Table selection and column layout: add `width`, `align`, `ellipsis`, select-all/indeterminate header, selection summary; test controlled/uncontrolled behavior.
- [x] Density context: add `density` to ConfigProvider and compact token overrides; test DOM contract and default preservation.
- [x] Visual hierarchy and filter layout: add title/motion/z-index tokens, replace local title sizes, and refactor Storybook filter grid.
- [x] Realistic examples: add long-data/bulk-action table story and improve form/filter validation examples.
- [x] Verification: tests, type checks, builds, screenshots, overflow/axe checks, diff review, commit and push.
