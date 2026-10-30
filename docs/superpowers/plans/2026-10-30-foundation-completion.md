# Foundation Completion Implementation Plan

> **For agentic workers:** Use dispatching-parallel-agents for the three independent implementation domains; root integrates shared scripts, docs and verification. Preserve dirty changes. Do not commit or publish.

**Goal:** Close the locally actionable Foundation gaps with measured gates, compatible design tokens and accessible controls, and establish precise external-state evidence.

**Architecture:** Extend existing tarball checks and CSS token conventions rather than add a second toolchain. Keep public component interfaces and host responsibilities intact. Three agents own separate code scopes; root owns shared package scripts, CI and canonical docs.

**Tech Stack:** pnpm, Vite/Rolldown, Node test runner, Vitest/Testing Library, Playwright, CSS Variables, GitHub CLI.

## Global constraints

- Keep existing dimensions, typography, light/dark maps and motion-fast/base override behavior.
- No dependency install in a temporary workspace sharing or linking repository node_modules. Root alone runs install/build/package/tooling commands that mutate shared outputs.
- No remote writes, publish, commit or license selection without an explicit decision; read-only identity/API checks may proceed.
- Budget thresholds must derive from measured production outputs and remain fixed at runtime.

## Task 1: Production package gates

**Files:** `scripts/package-budgets.mjs`, budget JSON, `tests/tooling/package-budgets.test.mjs`, `scripts/verify-package.mjs`, `scripts/verify-patterns-package.mjs`, consumer fixtures/config, package build configuration only if real shaking fails.

- [x] Add behavior tests that fail when a sample exceeds raw or gzip limits, a category is absent, or unrelated rendered exports/modules remain. Demonstrate nonzero command failure.
- [x] Build actual UI and Patterns tarballs; construct Button-only and single-Pattern production consumers, inspect emitted JS/module evidence, preserve full CSS as documented.
- [x] Resolve actual export-retention issues if found, retest, measure baseline, and store conservative explicit budgets. Emit machine-readable reports under output.
- [x] Root wires package gates into existing CI/release validation; test tooling and packed consumers.

## Task 2: Typography and motion tokens

**Files:** UI tokens/index/disclosure CSS, Patterns CSS, `tests/workbench/src/FoundationExamples.tsx`, minimal App integration, `tests/browser/foundation.spec.ts`.

- [x] Add browser tests for host inheritance, scoped font overrides, mono/system roles, unchanged typography/dimensions, durations/easings, old token overrides and reduced-motion.
- [x] Observe failure for missing tokens and Progress motion preference behavior.
- [x] Implement equivalent-value token replacements and scoped inheritance. Disable nonessential transitions per component under reduce; do not add global motion overrides.
- [x] Root executes all four browser projects against production tarballs and inspects screenshots.

## Task 3: ColorPicker accessibility

**Files:** ColorPicker, optional locale fields in ConfigProvider, `eslint.config.mjs`, relevant existing unit tests, new focused accessibility tests; one root-integrated browser scenario.

- [x] Test Field/consumer descriptions, required/invalid states, false overrides, local error coexistence, button ref/id, confirm/cancel/Escape and focus behavior; observe failing cases before implementation.
- [x] Keep native button trigger; attach value-state semantics to actual input, merge IDs referencing existing nodes, use localized persistent closed-state descriptions.
- [x] Remove ARIA rule exception, preserve existing visual invalid state via data attribute if needed, run focused unit/lint/type checks.
- [x] Verify keyboard and computed accessible names/descriptions in real browsers; no manual screen-reader claim.

## Task 4: External checks and evidence

**Files:** `scripts/verify-merge-gate.mjs`, merge-gate tests, release read-only check/docs if needed, `docs/foundations/*`, `docs/reviews/2026-10-30-foundation-completion.md`, changeset.

- [x] Check authenticated GitHub repository visibility, current main rules, workflow checks/runs and npm package/version/auth evidence without credentials in output.
- [x] Make protection verifier use authorized gh keyring fallback, with repository-access checks before interpreting a 404. Test failure paths and do not infer successful enforcement from config files.
- [x] Record the user-approved alignment with published MIT, include matching licenses in both packages, and document real-device and assistive-technology acceptance tasks as unexecuted.
- [x] Build a component-by-state matrix tied to actual test/story evidence and mark unexecuted states honestly.
- [x] Run complete local verify, tarball package gates, browser suite and relevant docs checks after integration. Review final diff and update canonical status based on actual results.

## 验证补充（2026-10-30）

- 原 ColorPicker 回归后，全状态扫描发现并修复可见值与名称不一致；新增 7 项 red→green 名称回归。
- Slider、Transfer、Calendar/Range 的具名容器语义补充 7 项 red→green 回归；跨月可选日期不再整体透明。
- 双主题全状态运行 349 项通过，36 个主题案例保留人工复核状态；四配置 tarball 消费回归 92 项通过。不得将工具执行通过等同于人工无障碍验收完成。
- 发现历史 `verify:initial-release` 漏掉 Patterns 且硬编码初始版本，追加通用临时副本版本预演，验证实际 Changesets plan 与内部 peer 更新；完成结果记录在收尾报告。
