# Ant Design Alignment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task with verification checkpoints.

**Goal:** Align Oxygen's component taxonomy, Chinese default copy, and common interaction conventions with Ant Design while retaining Oxygen's Radix-based implementation and existing public component names.

**Architecture:** Add a small locale context to `@oxygen-design/ui` for generic component fallback labels, then consume it in overlay primitives. Keep product copy outside the base package. Reorganize documentation and Storybook labels around Ant Design's General, Layout, Navigation, Data Entry, Data Display, and Feedback groupings without moving source files or introducing Ant Design as a runtime dependency.

**Tech Stack:** React 19, TypeScript, Radix Primitives, Vitest, Testing Library, Storybook 10.

## Global Constraints

- Preserve the existing Radix/Oxygen implementation and public component names.
- Do not add Ant Design as a dependency.
- Default base-component copy must be generic Chinese and overridable by the consuming application.
- Business nouns and workflow copy stay outside `@oxygen-design/ui`.
- New behavior requires focused tests before implementation.
- Do not commit, publish, or change package versions.

---

### Task 1: Add locale context and Chinese overlay defaults

**Files:**
- Create: `packages/ui/src/components/ConfigProvider.tsx`
- Modify: `packages/ui/src/index.ts`
- Modify: `packages/ui/src/components/Button.tsx`
- Modify: `packages/ui/src/components/Dialog.tsx`
- Modify: `packages/ui/src/components/Sheet.tsx`
- Modify: `packages/ui/src/styles/index.css`
- Test: `packages/ui/tests/interactive-components.test.tsx`
- Test: `packages/ui/tests/static-components.test.tsx`

**Interfaces:**
- `OxygenLocale` exposes `common.close`, defaulting to `关闭`.
- `ConfigProvider` accepts `locale?: OxygenLocaleConfig` and merges it with the default locale.
- `DialogContent` and `SheetContent` read the locale only when `closeLabel` is omitted or empty; explicit caller labels still win.
- `Button` accepts `loading?: boolean`; native buttons become disabled and busy, while `asChild` buttons expose `aria-disabled` and prevent activation.

- [x] Add failing tests for default Chinese close labels and caller locale overrides.
- [x] Run the focused UI tests and confirm the new provider import/behavior fails.
- [x] Implement the context/provider and consume it in Dialog and Sheet.
- [x] Export `ConfigProvider`, `OxygenLocale`, and `defaultLocale` from the package entrypoint.
- [x] Run focused tests and UI typecheck.
- [x] Add and verify Ant Design-style `Button` loading behavior without changing existing `variant` or `size` props.

### Task 2: Align taxonomy and examples with Ant Design terminology

**Files:**
- Modify: `README.md`
- Modify: `apps/storybook/stories/Foundations.stories.tsx`
- Modify: `apps/storybook/stories/Controls.stories.tsx`
- Modify: `apps/storybook/stories/Overlays.stories.tsx`
- Modify: `apps/storybook/stories/Patterns.stories.tsx`

**Interfaces:**
- Documentation maps Oxygen components to Ant Design-inspired groups: General, Layout, Navigation, Data Entry, Data Display, Feedback, and Other.
- Storybook titles use the same groups in Chinese: 通用、布局、导航、数据录入、数据展示、反馈、其他。
- All examples remain neutral and pass visible copy as children/props.

- [x] Update the README inventory and boundary rules with the Ant Design-inspired groups.
- [x] Rename Storybook categories and split stories only where needed; keep component implementations flat.
- [x] Scan Storybook and package tests for product nouns and replace them with neutral examples.
- [x] Run Storybook typecheck and static build.

### Task 3: Document the compatibility boundary

**Files:**
- Modify: `README.md`
- Modify: `docs/superpowers/plans/2026-10-27-base-components-expansion.md`

**Interfaces:**
- Documentation explicitly states that Oxygen follows Ant Design's taxonomy, copy defaults, and interaction conventions, not its exact API or implementation.
- The existing `variant`/`tone`/Radix composition APIs remain supported and are not renamed in this pass.

- [x] Add the compatibility statement and next component priorities (`Typography`, `Space`, `Divider`, `Layout`, `Form`, `Pagination`, `Table`, `Upload`).
- [x] Run `git diff --check` and the focused UI/patterns/Storybook verification commands.
