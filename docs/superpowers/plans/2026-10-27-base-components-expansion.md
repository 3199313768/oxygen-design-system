# Base Components Expansion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task with verification checkpoints.

**Goal:** Expand `@oxygen-design/ui` with the first high-reuse set of form, overlay, feedback, and layout primitives while preserving the package's base-component boundary.

**Architecture:** Continue the existing Radix wrapper pattern for interactive primitives and the existing CSS token/class pattern for native controls and visual utilities. Each component has a focused source file, is exported from the package entrypoint, and receives a Storybook example plus focused interaction/type coverage. Business composition remains in `@oxygen-design/patterns`.

**Tech Stack:** React 19, TypeScript, Radix UI primitives, class-variance-authority, Tailwind CSS v4 utility layer, Vitest, Testing Library, Storybook 10.

## Global Constraints

- Keep new exports in `packages/ui`; do not move business patterns into the base package.
- Preserve React 18+ peer compatibility and the existing `forwardRef`/controlled-uncontrolled API conventions.
- Use the existing Oxygen CSS tokens and `cn` helper; do not introduce component-local color literals when a token exists.
- Interactive primitives must expose keyboard-accessible Radix behavior and forward refs.
- Form controls must support `disabled`; controls that can be invalid must preserve `aria-invalid` and Field-generated descriptions/errors.
- Add focused tests before implementation for each component family.
- Do not commit, publish, or change package versioning as part of this plan.

## Component Classification

`@oxygen-design/ui` contains reusable primitives whose API is independent of the Oxygen product domain. The inventory uses Ant Design-inspired responsibility groups while retaining Oxygen's Radix-based implementation and public names:

| Category | Responsibility | Current/planned components | Boundary rule |
| --- | --- | --- | --- |
| Foundations | Tokens, icons, class composition, shared CSS | `tokens.css`, `Icons`, `cn` | No product workflow or data fetching |
| Forms & Controls | One input/action or a small accessible control group | `Button`, `Input`, `Textarea`, `Label`, `Field`, `Checkbox`, `RadioGroup`, `Switch`, `Select` | Must work with arbitrary labels, values, and form libraries |
| Surfaces & Layout | Generic visual containers and loading geometry | `Card`, `Separator`, `Skeleton` | No page-specific layout or navigation state |
| Feedback & Status | Generic user feedback and progress state | `Alert`, `Badge`, `Toast`, `Progress`, `Spinner` | Receives state/content; does not own requests or retries |
| Overlays | Focus-managed transient UI | `Dialog`, `AlertDialog`, `Popover`, `DropdownMenu`, `Sheet`, `Tooltip` | Owns interaction and focus, not business decisions |
| Navigation | Generic wayfinding controls | `Tabs`, future `Breadcrumb`, future `Pagination` | Receives routes/values; does not fetch domain data |
| Patterns | Product-level composition of primitives | `AppShell`, `PageHeader`, `EmptyState`, `StatusMessage` | May compose several primitives and encode page/workflow language |
| Application features | Domain data and workflows | Uploaders, filter bars, permission matrices, data tables with query state | Stay in the consuming application or a future domain package |

The first expansion follows this boundary: `Textarea`, `RadioGroup`, `Switch`, and `Select` are Forms & Controls; `Dialog` and `Popover` are Overlays; `Toast` is Feedback & Status; `Skeleton` is Surfaces & Layout. Storybook titles and README sections will use these same categories. The physical `components/` directory remains flat for this pass to avoid unrelated import churn; category boundaries are enforced by package ownership, public exports, API contracts, and documentation.

---

### Task 1: Add missing form controls

**Files:**
- Create: `packages/ui/src/components/Textarea.tsx`
- Create: `packages/ui/src/components/RadioGroup.tsx`
- Create: `packages/ui/src/components/Switch.tsx`
- Create: `packages/ui/src/components/Select.tsx`
- Modify: `packages/ui/package.json`
- Modify: `pnpm-lock.yaml`
- Modify: `packages/ui/src/index.ts`
- Test: `packages/ui/tests/interactive-components.test.tsx`
- Test: `packages/ui/tests/static-components.test.tsx`

**Interfaces:**
- `TextareaProps` extends `TextareaHTMLAttributes<HTMLTextAreaElement>` and follows `Input` class, ref, disabled, and `aria-invalid` behavior.
- `RadioGroup`, `RadioGroupItem`, `RadioGroupIndicator` wrap `@radix-ui/react-radio-group` and preserve controlled/uncontrolled `value`/`defaultValue` plus keyboard navigation.
- `Switch` wraps `@radix-ui/react-switch` with a forwarded ref and `checked`/`defaultChecked` support.
- `Select`, `SelectTrigger`, `SelectValue`, `SelectContent`, `SelectItem`, `SelectGroup`, `SelectLabel`, `SelectSeparator` wrap `@radix-ui/react-select`; trigger and item styles use Oxygen tokens.

- [ ] Write failing tests for textarea semantics, radio keyboard selection, switch toggling, select value selection, disabled states, and forwarded refs.
- [ ] Run the focused UI test file and confirm the new imports/components fail before implementation.
- [ ] Add the four component files using the existing wrapper conventions and add Radix dependencies for radio-group, switch, and select.
- [ ] Add shared CSS classes for control sizing, focus, invalid, disabled, radio indicators, switch thumb/track, and select content/items.
- [ ] Export runtime components and public prop types from `packages/ui/src/index.ts`.
- [ ] Run focused tests, package typecheck, and package build; resolve any public type or CSS export errors.

### Task 2: Add generic dialog and popover primitives

**Files:**
- Create: `packages/ui/src/components/Dialog.tsx`
- Create: `packages/ui/src/components/Popover.tsx`
- Modify: `packages/ui/package.json`
- Modify: `pnpm-lock.yaml`
- Modify: `packages/ui/src/index.ts`
- Test: `packages/ui/tests/interactive-components.test.tsx`
- Test: `packages/ui/tests/static-components.test.tsx`

**Interfaces:**
- `Dialog`, `DialogTrigger`, `DialogPortal`, `DialogOverlay`, `DialogContent`, `DialogHeader`, `DialogFooter`, `DialogTitle`, `DialogDescription`, and `DialogClose` wrap the existing `@radix-ui/react-dialog` dependency and share the dialog visual language with `AlertDialog`/`Sheet`.
- `DialogContent` accepts a `closeLabel` prop defaulting to an accessible English fallback, matching `SheetContent` behavior.
- `Popover`, `PopoverTrigger`, `PopoverAnchor`, `PopoverContent`, and `PopoverClose` wrap `@radix-ui/react-popover` with a portal, collision-aware content, and tokenized border/shadow.

- [ ] Write failing tests for opening/closing, title/description semantics, escape handling, focus return, and custom close labels.
- [ ] Run the focused tests and confirm failure.
- [ ] Implement the wrappers with forwarded refs, portal/overlay behavior, and consistent data attributes.
- [ ] Add Popover dependency and CSS for content/arrow/close states.
- [ ] Export all public primitives and prop types.
- [ ] Run focused tests, typecheck, and build.

### Task 3: Add feedback and loading primitives

**Files:**
- Create: `packages/ui/src/components/Toast.tsx`
- Create: `packages/ui/src/components/Skeleton.tsx`
- Modify: `packages/ui/package.json`
- Modify: `pnpm-lock.yaml`
- Modify: `packages/ui/src/index.ts`
- Test: `packages/ui/tests/interactive-components.test.tsx`
- Test: `packages/ui/tests/static-components.test.tsx`

**Interfaces:**
- `ToastProvider`, `ToastViewport`, `Toast`, `ToastTitle`, `ToastDescription`, `ToastAction`, and `ToastClose` wrap `@radix-ui/react-toast`; no global singleton is introduced in the base package.
- `Skeleton` is a forwarded `HTMLDivElement` component with a `variant` limited to `text`, `rectangle`, and `circle`, plus an optional `asChild`-free simple block API.
- Toast tone variants are `default`, `success`, `warning`, and `error`, mapped to existing semantic tokens.

- [ ] Write failing tests for toast rendering/dismissal, provider viewport semantics, action/close controls, skeleton role-free rendering, and variant classes.
- [ ] Run focused tests and confirm failure.
- [ ] Implement the Radix toast wrappers and the CSS-only Skeleton component.
- [ ] Add the toast dependency and animation/token styles without creating a separate business notification service.
- [ ] Export components and types.
- [ ] Run focused tests, typecheck, and build.

### Task 4: Storybook coverage and contract verification

**Files:**
- Modify: `apps/storybook/stories/Controls.stories.tsx`
- Modify: `apps/storybook/stories/Overlays.stories.tsx`
- Modify: `apps/storybook/stories/Foundations.stories.tsx`
- Modify: `packages/ui/tests/package-contract.test.ts`
- Modify: `packages/ui/tests/interactive-components.test.tsx`
- Modify: `packages/ui/tests/static-components.test.tsx`
- Modify: `README.md`

**Interfaces:**
- Storybook must show usable examples for every new export, including disabled, invalid, loading, long-content, narrow-width, and keyboard-relevant states where applicable.
- Package contract tests must verify every new public export is present in the built entry and that CSS is included in the package artifact.

- [ ] Add stories for form controls, dialog/popover, toast provider, and skeleton variants.
- [ ] Add package contract assertions for all eight new component families and CSS selectors.
- [ ] Run UI tests, UI typecheck, UI build, Storybook build, and `git diff --check`.
- [ ] Confirm the running Storybook serves the new stories at `http://localhost:6006/` when launched with the existing script.
- [ ] Update the Chinese README component inventory and usage guidance without adding business components to the UI package.

## Verification Checklist

- `pnpm --filter @oxygen-design/ui test`
- `pnpm --filter @oxygen-design/ui typecheck`
- `pnpm --filter @oxygen-design/ui build`
- `pnpm --filter @oxygen-design/storybook build-storybook`
- `git diff --check`
