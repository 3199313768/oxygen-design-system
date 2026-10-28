# Ant Design Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task with verification checkpoints.

**Goal:** Add a semantic, composable `Layout` primitive family that follows Ant Design's layout naming and composition habits while keeping Oxygen's native React/CSS implementation.

**Architecture:** `Layout` is a lightweight `div` root with attached `Header`, `Sider`, `Content`, and `Footer` components. Each subcomponent renders the matching semantic HTML element, forwards refs, and accepts native HTML attributes. `Sider` exposes only generic width/collapsed metadata in this pass; navigation, permissions, and responsive state remain with the consuming application.

**Tech Stack:** React 19, TypeScript, CSS custom properties, Vitest, Testing Library, Storybook 10.

## Global Constraints

- Preserve existing package boundaries and Radix/Oxygen implementation patterns.
- Do not add Ant Design as a dependency.
- Keep Layout free of routes, navigation labels, permissions, and data fetching.
- Use tokenized CSS and generic caller-provided children.
- Add focused tests before implementation.
- Do not commit, publish, or change package versions.

---

### Task 1: Add Layout primitives

**Files:**
- Create: `packages/ui/src/components/Layout.tsx`
- Modify: `packages/ui/src/index.ts`
- Modify: `packages/ui/src/styles/index.css`
- Test: `packages/ui/tests/static-components.test.tsx`
- Create: `apps/storybook/stories/Layout.stories.tsx`

**Interfaces:**
- `Layout` renders a `div` and accepts `hasSider?: boolean`.
- `Layout.Header` renders `header` and accepts native `HTMLAttributes<HTMLElement>`.
- `Layout.Sider` renders `aside` and accepts `width?: number | string`, `collapsed?: boolean`, and native `HTMLAttributes<HTMLElement>`.
- `Layout.Content` renders `main` and accepts native `HTMLAttributes<HTMLElement>`.
- `Layout.Footer` renders `footer` and accepts native `HTMLAttributes<HTMLElement>`.
- All components forward refs and are exported from the root entrypoint.

- [x] Write failing semantic/ref/metadata tests.
- [x] Run the focused test and confirm failure.
- [x] Implement Layout components and tokenized styles.
- [x] Add public exports and a neutral Storybook example.
- [x] Run UI tests/typecheck/build and Storybook typecheck/build.

### Task 2: Update documentation and package contract

**Files:**
- Modify: `packages/ui/tests/package-contract.test.ts`
- Modify: `README.md`
- Modify: `docs/superpowers/plans/2026-10-27-ant-design-foundations.md`

- [x] Add contract coverage for `Layout` and its attached components.
- [x] Add Layout to the Ant Design-inspired layout category and identify the next `Form`/`Pagination` batch.
- [x] Run patterns tests, full typechecks/builds, Storybook build, and `git diff --check`.
