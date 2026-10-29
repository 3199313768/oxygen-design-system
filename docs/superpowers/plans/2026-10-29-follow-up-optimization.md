# Follow-up Optimization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Harden pagination inputs, reduce large-list selection work, complete remaining locale coverage, remove duplicate CI builds, and add static quality gates.

**Architecture:** Keep the public component APIs stable. Normalize invalid numeric inputs at the Pagination boundary, use `Set` and value indexes for local lookup, and express remaining generic copy through `ConfigProvider`. CI keeps the existing release behavior while separating package builds from Storybook-only builds.

**Tech Stack:** React, TypeScript, Vitest, Vite, Storybook, GitHub Actions, pnpm.

## Global Constraints

- Do not modify public package license fields or the release workflow's `NPM_TOKEN` behavior.
- Preserve the existing uncommitted worktree changes.
- Do not add runtime dependencies.
- Keep existing public component props backward compatible.
- Write regression tests before production changes and verify each failure before implementation.

### Task 1: Pagination Input Safety

**Files:**
- Modify: `packages/ui/src/components/Pagination.tsx`
- Test: `packages/ui/tests/interactive-components.test.tsx`

- [x] Add tests proving `NaN`, `Infinity`, negative totals, invalid page sizes, and invalid current pages render finite safe pagination values.
- [x] Run the focused tests and confirm the invalid-input cases fail before implementation.
- [x] Add small numeric normalization helpers and use them for total, current, page size, and page-size options.
- [x] Run the focused tests and the UI typecheck.

### Task 2: Table Selection Scaling

**Files:**
- Modify: `packages/ui/src/components/Table.tsx`
- Test: `packages/ui/tests/ui-refinement-regressions.test.tsx`

- [x] Add a regression test for selecting a row from a large data source and asserting selected rows remain correct.
- [x] Run the focused test and confirm it fails if the optimized lookup contract is not present.
- [x] Build a `Set<Key>` for selected keys and use it for selected counts and row rendering; use a `Set` for selected-row reporting.
- [x] Run Table regression tests and the full UI test file.

### Task 3: Transfer Value Indexing

**Files:**
- Modify: `packages/ui/src/components/Transfer.tsx`
- Test: `packages/ui/tests/ui-refinement-regressions.test.tsx`

- [x] Add a regression test covering many target keys and duplicate-looking option labels while preserving source/target selection behavior.
- [x] Run the focused test and confirm the baseline behavior is covered before implementation.
- [x] Memoize a value-to-options index and use it for source and target derivation while preserving `Object.is`-style value matching.
- [x] Run Transfer tests and the full UI test file.

### Task 4: Remaining Locale Coverage

**Files:**
- Modify: `packages/ui/src/components/ConfigProvider.tsx`
- Modify: `packages/ui/src/components/Table.tsx`
- Modify: `packages/patterns/src/AppShell.tsx`
- Modify: `packages/ui/tests/ui-refinement-regressions.test.tsx`
- Modify: `packages/patterns/tests/patterns.test.tsx`

- [x] Add locale function tests for the selected-count summary and navigation title.
- [x] Run the focused tests and confirm the hardcoded-copy assertions fail before implementation.
- [x] Add `common.selectedCount` and `common.navigationTitle` locale functions and consume them in Table and AppShell.
- [x] Run UI and patterns locale tests.

### Task 5: CI Build De-duplication

**Files:**
- Modify: `package.json`
- Modify: `.github/workflows/check.yml`
- Test: `packages/ui/tests/package-contract.test.ts`

- [x] Add a `storybook:build-only` script that invokes Storybook without rebuilding packages.
- [x] Change `storybook:build` to compose the package build and build-only script, then use the build-only script after the explicit package build in `verify` and CI.
- [x] Add a package script contract assertion so the duplicate-build prevention remains intentional.
- [x] Run the script contract test and a Storybook build.

### Task 6: Static Quality Gates

**Files:**
- Modify: `package.json`
- Modify: `packages/ui/vitest.config.ts`
- Modify: `packages/patterns/vitest.config.ts`
- Test: existing Vitest suites

- [x] Add a repository lint entry using the already-installed TypeScript compiler API without adding runtime dependencies.
- [x] Add a deterministic static test-surface coverage command because the existing Vitest runner has no installed coverage provider; it reports that no line percentage is claimed.
- [x] Add the quality gates to `verify` and CI.
- [x] Run the quality gates and record the coverage-provider limitation instead of hiding it.

### Task 7: Final Verification

- [x] Run `pnpm typecheck`.
- [x] Run `pnpm test` under Node `22.22.2` or newer.
- [x] Run `pnpm lint` and the configured coverage check.
- [x] Run `pnpm build` and `pnpm storybook:build-only`.
- [x] Run `git diff --check` and confirm license and release workflow files remain untouched.
