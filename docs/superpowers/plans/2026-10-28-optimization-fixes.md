# Oxygen Optimization Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task with verification checkpoints. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Resolve the identified component behavior, package compatibility, CI duplication, localization, and bundle delivery issues while leaving public-package licensing unchanged.

**Architecture:** Keep the existing React/Radix component boundaries. Fix behavior at the component boundary with regression tests, centralize generic UI copy in the existing `ConfigProvider`, make package metadata and peer ranges match independent releases, and reduce duplicate CI work without changing the release trigger.

**Tech Stack:** React 19, TypeScript, Vite, Vitest, Testing Library, pnpm, Changesets, GitHub Actions.

## Global Constraints

- Do not modify package license fields or add a license file.
- Preserve unrelated dirty-worktree changes.
- Keep public component APIs backward compatible except for correcting the disabled `asChild` behavior and key preservation.
- Use failing tests before production behavior changes.
- Do not commit, publish, push, or change release versions.
- Keep the public package usable by supported React consumers; Node version requirements are for repository tooling, not browser runtime.

### Task 1: Fix Button and Table behavior

**Files:**
- Modify: `packages/ui/src/components/Button.tsx`
- Modify: `packages/ui/src/components/Table.tsx`
- Test: `packages/ui/tests/interactive-components.test.tsx`

- [x] Add failing tests for disabled `Button asChild` and numeric `Table` row keys.
- [x] Run the focused tests and verify each fails for the current behavior.
- [x] Add disabled guards/semantics for `Button asChild` and preserve numeric row keys in `Table`.
- [x] Run the focused tests and the UI typecheck.

### Task 2: Make generic copy consistently localizable

**Files:**
- Modify: `packages/ui/src/components/ConfigProvider.tsx`
- Modify: `packages/ui/src/components/Spin.tsx`
- Modify: `packages/ui/src/components/Table.tsx`
- Modify: `packages/ui/src/components/Pagination.tsx`
- Modify: `packages/ui/tests/interactive-components.test.tsx`
- Modify: `packages/ui/tests/static-components.test.tsx`

- [x] Extend locale types/defaults for navigation, loading, empty-state, pagination, and page-size copy.
- [x] Add tests proving `ConfigProvider` overrides all new copy.
- [x] Consume locale values in the components and memoize the resolved context value.
- [x] Run focused tests and typecheck.

### Task 3: Align package metadata and independent package compatibility

**Files:**
- Modify: `package.json`
- Modify: `packages/ui/package.json`
- Modify: `packages/patterns/package.json`
- Create: `.node-version`
- Modify: `packages/ui/tests/package-contract.test.ts`
- Modify: `packages/patterns/tests/package-contract.test.ts`

- [x] Add repository Node version pin and keep package engine declarations consistent with the supported toolchain.
- [x] Adjust the patterns UI peer range so future compatible UI minor releases do not immediately become invalid.
- [x] Add package contract assertions for the compatibility policy and metadata that is intentionally supported.
- [x] Run package contract tests and typechecks.

### Task 4: Remove duplicate CI work and improve package verification

**Files:**
- Modify: `.github/workflows/check.yml`
- Modify: `scripts/verify-package.mjs`
- Modify: `scripts/verify-patterns-package.mjs`

- [x] Keep one pull-request verification workflow for typecheck, tests, build, Storybook, and packed consumers.
- [x] Keep release-specific checks on the main branch without running the same full suite twice.
- [x] Make packed-consumer dependency installation use offline cache behavior where possible while retaining isolated tarball verification.
- [x] Run the verification scripts locally and inspect the final workflow diff.

### Task 5: Reduce the published entry bundle and verify consumer output

**Files:**
- Modify: `packages/ui/vite.config.ts`
- Modify: `packages/ui/package.json`
- Modify: `packages/ui/tests/package-contract.test.ts`
- Modify: `tests/consumer/src/main.tsx`

- [x] Externalize runtime dependencies already declared by the package instead of bundling Radix and icon implementations into the root entry.
- [x] Keep the root entrypoint and CSS exports unchanged so consumers do not need an API migration.
- [x] Add packed-consumer imports that exercise the existing root contract.
- [x] Build, pack, typecheck, and build the isolated consumer; compare artifact sizes.

### Task 6: Final verification

- [x] Run `pnpm typecheck`.
- [x] Run `pnpm test` under a Node version with the repository's required zstd runtime support.
- [x] Run `pnpm build`, `pnpm storybook:build`, and `pnpm verify:package`.
- [x] Run `git diff --check` and inspect the final diff for unrelated changes.
