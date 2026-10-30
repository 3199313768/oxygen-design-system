# Packed Consumer Regression Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to execute the approved scope inline. Steps use checkboxes for tracking.

**Goal:** Validate a complete page using installed UI and patterns tarballs, and keep its critical flows in browser CI.

**Architecture:** Add an independent `tests/workbench` Vite consumer. A runner builds and packs both libraries, installs them in a temporary consumer with no workspace aliases, typechecks/builds it, and runs Playwright against the production preview. All demonstration state and upload simulation stay inside the consumer.

**Tech Stack:** React, Vite, TypeScript, Playwright Test, pnpm, GitHub Actions.

## Global Constraints

- Preserve existing public APIs, library source, release behavior, licenses and static coverage semantics.
- Use local deterministic sample data; do not send files or data to a server.
- No commits, pushes, publication or deployment.
- Use the existing checkout; keep all task changes reviewable in its diff.

### Task 1: Browser test contract and package runner

- [x] Add `tests/browser/workbench.spec.ts` with user-visible tests: pagination/filter reset, empty-state reset, editing validation/cancel/save/reopen, upload success/failure/removal/cancel, responsive layout and dialog keyboard focus.
- [x] Add `playwright.config.ts`, `scripts/verify-workbench.mjs`, and `scripts/serve-workbench.mjs`; pack both libraries, install a temporary fixture, and run its typecheck/build/browser checks.
- [x] Run against the existing Button-only fixture copied into `tests/workbench` and observe missing-page assertions fail.

### Task 2: Complete consumer page

- [x] Implement `tests/workbench/src/App.tsx` using exported Form, Input, Select, Table, Pagination, Dialog, Upload and PageHeader/EmptyState.
- [x] Add fixture CSS for scoped host reset, responsive filters and bounded table/dialog layouts.
- [x] Keep submitted filter state separate from input state, reset pagination on query, validate trimmed names, reset editor drafts on reopen, and retain successful edits in session memory.
- [x] Simulate upload completion/failure with an abort-aware timer; block save while files are pending/uploading/failed; cancellation discards drafts and aborts uploads.
- [x] Run browser tests against tarballs and inspect saved desktop/mobile screenshots.

### Task 3: CI, documentation and final verification

- [x] Add `verify:workbench` root script and a separate browser CI job for Chromium, Firefox and WebKit, including a 390px Chromium project and uploaded failure artifacts.
- [x] Document local commands, fixture behavior and limits in README and `docs/consumer-workbench.md`.
- [x] Run `pnpm verify`, `pnpm verify:package`, `pnpm verify:workbench`, and `git diff --check` using Node >=22.22.2.
- [x] Review final diff for unrelated changes and record fresh evidence and remaining limits.

## Verification evidence

- `pnpm verify`: passed (UI 219 tests, patterns 8 tests, typechecks, existing lint/static surface gate and builds).
- `pnpm verify:package`: both isolated package consumers passed.
- `pnpm verify:workbench`: 32/32 checks passed across desktop Chromium/Firefox/WebKit and 390px Chromium; browser and consumer typechecks/build passed.
- Five initial browser cases failed against the original Button-only page; final cases pass against installed tarballs.
- Desktop/mobile page and dialog screenshots inspected. Browser tests collect page runtime errors.
- Read-only reviewer identified signal cleanup; awaited children and signal forwarding now clean temporary consumers. Real preview SIGTERM and SIGINT checks passed: exits 143 and 130 respectively, directories removed, ports released.
- `git diff --check`: passed. No library component implementation or release files changed by this task. Concurrent quality-gate changes belong to a separate task and are preserved; aggregate verification above predates those parallel edits.
- Local evidence: `output/playwright/consumer` and `output/playwright/consumer-evidence`. Remote CI, real Safari/mobile devices and downstream service integrations are outside this local run.

## Authorized integration

The user subsequently authorized committing, pushing and merging this task to main. Only the consumer page/browser regression and their supporting files are included; parallel quality-gate changes remain in the original checkout. Fresh-checkout verification exposed that patterns typechecking requires the built UI declarations, so the aggregate verify script and CI now build packages once before checking types.

Isolated submission verification: `pnpm verify` passed with 227 tests; both `pnpm verify:package` consumers passed; `OXYGEN_WORKBENCH_PORT=4187 pnpm verify:workbench` passed 32 browser cases. The configurable port avoids interfering with existing local services. The final staged set contains 20 task files.
