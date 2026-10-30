# Quality Gates Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans inline; no subagents or commits.

**Goal:** Enforce real execution coverage, semantic lint, behavior regressions, browser CI and required-check configuration.

**Architecture:** Keep the existing packed-consumer browser work intact. Replace text-based lint with ESLint flat configuration and measure all executable UI/patterns sources with the Vitest V8 provider. Establish thresholds from measured per-package baselines. Use executable lint fixtures and negative coverage checks to prove failures block checks.

**Tech Stack:** TypeScript, ESLint, Vitest/V8, Playwright, GitHub Actions.

## Global Constraints

- Preserve main-thread changes and existing public APIs.
- Do not commit, push, publish, deploy, replace branch protection, or expose credentials.
- Add development dependencies only; no runtime dependencies.
- Remote protection requires authenticated access and must preserve current settings.

### Task 1: Execution coverage

- [x] Measure UI and patterns with `vitest run --coverage --coverage.provider=v8`; include `src/**/*.{ts,tsx}` and exclude declarations and export-only entrypoints.
- [x] Add text, HTML, JSON summary and LCOV reports under ignored `output/coverage/`.
- [x] Set conservative measured thresholds for statements, branches, functions and lines separately for each package.
- [x] Prove an impossible threshold returns nonzero and an uncovered temporary source is included, then remove the temporary source.

### Task 2: Semantic lint

- [x] Add flat ESLint config for library sources, tests and browser/workbench sources using TypeScript, Hooks and JSX accessibility rules.
- [x] Run in-memory invalid fixtures (conditional Hook, stale dependency, floating Promise, missing image alternative, explicit any) and verify rule diagnostics; verify valid examples pass.
- [x] Fix validated library violations narrowly and rerun lint with zero warnings.
- [x] Retain static component-reference checking as `test:surface`, with execution coverage exposed as `test:coverage`.

### Task 3: Behavior gaps

- [x] Inspect measured uncovered upload/pagination/selection branches and existing regressions.
- [x] Add tests for actual missing contracts, prioritizing abort-on-unmount, stale completion and rejected asynchronous callbacks.
- [x] Confirm the late validation/removal tests fail against the original behavior and pass with the unmount guards; preserve the original red-run log.

### Task 4: CI

- [x] Preserve existing browser job; add coverage artifacts and stable required-check names.
- [x] Make CI and release validation run the same lint/coverage commands without redundant unit runs.
- [x] Run complete local quality checks and packed-consumer browser checks without sharing the main thread's artifact directory.

### Task 5: Merge enforcement

- [x] Inspect available authenticated GitHub access without exposing credentials; run the remote inspector and record unverified state when access is absent.
- [x] Prepare concrete protection configuration/documentation requiring `check` and `browser`, strict up-to-date checks, preserving existing review rules.
- [ ] Apply a preservation-safe authenticated update and verify it remotely. Pending: no authenticated GitHub management connection or GH_TOKEN/GITHUB_TOKEN is available; configuration and inspector are prepared.
- [x] Record verification evidence, changed files and remaining remote/device limitations.
