# Ant Design Foundations Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task with verification checkpoints.

**Goal:** Add the first Ant Design-inspired foundation primitives—Typography, Space, and Divider—without changing Oxygen's Radix-based implementation model or business-component boundary.

**Architecture:** Implement small native React wrappers with forwarded refs and tokenized Oxygen CSS. Typography exposes semantic heading/body/link primitives, Space owns only gap/direction/alignment/wrap layout, and Divider owns only visual separation. All visible content remains caller-provided.

**Tech Stack:** React 19, TypeScript, CSS custom properties, Vitest, Testing Library, Storybook 10.

## Global Constraints

- Preserve existing public component APIs and package boundaries.
- Do not add Ant Design as a runtime dependency.
- Use Oxygen tokens and `cn`; do not add product-specific copy.
- New behavior must have focused tests before implementation.
- Keep components accessible by default and forward refs.
- Do not commit, publish, or change package versions.

---

### Task 1: Add Typography primitives

**Files:**
- Create: `packages/ui/src/components/Typography.tsx`
- Modify: `packages/ui/src/index.ts`
- Modify: `packages/ui/src/styles/index.css`
- Test: `packages/ui/tests/static-components.test.tsx`
- Modify: `apps/storybook/stories/Foundations.stories.tsx`

**Interfaces:**
- `Typography.Text` renders a `span` with `type?: 'secondary' | 'success' | 'warning' | 'danger'` and `strong?: boolean`.
- `Typography.Title` renders an `h1`–`h5` selected by `level?: 1 | 2 | 3 | 4 | 5`.
- `Typography.Paragraph` renders a `p` with optional `type`, `strong`, and `code`.
- `Typography.Link` renders an anchor and preserves native anchor props.
- All four primitives accept `className`, forward refs, and use semantic HTML.

- [x] Write failing semantic/ref/variant tests.
- [x] Run the focused test and confirm failure.
- [x] Implement the primitives and tokenized styles.
- [x] Export runtime components and public prop types.
- [x] Add a neutral Storybook example and run UI tests/typecheck/build.

### Task 2: Add Space and Divider layout primitives

**Files:**
- Create: `packages/ui/src/components/Space.tsx`
- Create: `packages/ui/src/components/Divider.tsx`
- Modify: `packages/ui/src/index.ts`
- Modify: `packages/ui/src/styles/index.css`
- Test: `packages/ui/tests/static-components.test.tsx`
- Modify: `apps/storybook/stories/Foundations.stories.tsx`

**Interfaces:**
- `Space` renders a `div` with `size?: 'small' | 'middle' | 'large' | number`, `direction?: 'horizontal' | 'vertical'`, `align?: 'start' | 'end' | 'center' | 'baseline'`, `wrap?: boolean`, and `split?: ReactNode`.
- `Space.Compact` renders a grouped `div` with `block?: boolean` and preserves child layout without product semantics.
- `Divider` renders an `hr` by default, with `type?: 'horizontal' | 'vertical'`, `orientation?: 'left' | 'center' | 'right'`, and optional children for labeled dividers.
- Both components forward refs and expose correct `role`/native semantics.

- [x] Write failing layout/semantic/ref tests.
- [x] Run the focused tests and confirm failure.
- [x] Implement the primitives and responsive tokenized styles.
- [x] Export runtime components and public prop types.
- [x] Add neutral Storybook examples and run UI tests/typecheck/build.

### Task 3: Update package contract and documentation

**Files:**
- Modify: `packages/ui/tests/package-contract.test.ts`
- Modify: `README.md`
- Modify: `docs/superpowers/plans/2026-10-27-antd-alignment.md`

- [x] Add contract coverage for Typography, Space, Divider, and their public types.
- [x] Update Ant Design-inspired category inventory and next priorities.
- [x] Run UI/patterns tests, all typechecks, builds, Storybook build, and `git diff --check`.
