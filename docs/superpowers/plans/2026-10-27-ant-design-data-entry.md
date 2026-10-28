# Ant Design Data Entry Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task with verification checkpoints.

**Goal:** Add generic `Form` and `Pagination` primitives that follow Ant Design's data-entry naming and Chinese interaction copy while keeping Oxygen's existing field and Radix implementation boundaries.

**Architecture:** `Form` provides semantic form/layout wrappers and `Form.Item` composes the existing `Field` primitives without owning validation or requests. `Pagination` owns only page state and accessible navigation; it emits `onChange` and leaves data fetching to consumers. Shared labels come from the existing `ConfigProvider` locale context.

**Tech Stack:** React 19, TypeScript, Radix-compatible Oxygen primitives, CSS custom properties, Vitest, Testing Library, Storybook 10.

## Global Constraints

- Preserve existing `Field` APIs and do not introduce a form state library.
- Do not add data fetching, table query state, upload handling, or business copy.
- Use Chinese generic defaults and allow locale overrides through `ConfigProvider`.
- Add focused tests before implementation.
- Do not commit, publish, or change package versions.

---

### Task 1: Add Form and Form.Item

**Files:**
- Create: `packages/ui/src/components/Form.tsx`
- Modify: `packages/ui/src/index.ts`
- Modify: `packages/ui/src/styles/index.css`
- Test: `packages/ui/tests/static-components.test.tsx`
- Modify: `apps/storybook/stories/Controls.stories.tsx`

**Interfaces:**
- `Form` renders a native `form` with `layout?: 'horizontal' | 'vertical' | 'inline'`.
- `Form.Item` accepts `label?: ReactNode`, `name?: string`, `required?: boolean`, `help?: ReactNode`, `validateStatus?: 'success' | 'warning' | 'error'`, and a single control child.
- `Form.Item` renders a label and help/error content while preserving the child control's native props/ref.
- The component does not submit data or validate values; native form events remain available to the caller.

- [x] Write failing semantic/layout/status tests.
- [x] Run the focused test and confirm failure.
- [x] Implement Form and Form.Item with existing Field conventions.
- [x] Export public runtime components and types; add a neutral Storybook example.
- [x] Run UI tests/typecheck/build.

### Task 2: Add Pagination

**Files:**
- Create: `packages/ui/src/components/Pagination.tsx`
- Modify: `packages/ui/src/components/ConfigProvider.tsx`
- Modify: `packages/ui/src/index.ts`
- Modify: `packages/ui/src/styles/index.css`
- Test: `packages/ui/tests/interactive-components.test.tsx`
- Modify: `apps/storybook/stories/Controls.stories.tsx`

**Interfaces:**
- `Pagination` accepts `current`, `defaultCurrent`, `total`, `pageSize`, `onChange`, `disabled`, and `showSizeChanger`.
- It renders accessible previous/next controls and page buttons, clamps page state to valid bounds, and emits `(page, pageSize)`.
- `ConfigProvider` adds generic `common.previous`, `common.next`, and `common.page` labels with Chinese defaults.

- [x] Write failing controlled/uncontrolled, disabled, boundary, and locale tests.
- [x] Run the focused tests and confirm failure.
- [x] Implement page state and accessible controls.
- [x] Export public runtime components and types; add a neutral Storybook example.
- [x] Run UI tests/typecheck/build and Storybook build.

### Task 3: Update package contract and documentation

**Files:**
- Modify: `packages/ui/tests/package-contract.test.ts`
- Modify: `README.md`
- Modify: `docs/superpowers/plans/2026-10-27-ant-design-layout.md`

- [x] Add contract coverage for Form, Form.Item, and Pagination.
- [x] Update the data-entry category and next priorities.
- [x] Run patterns tests, full typechecks/builds, Storybook build, and `git diff --check`.
