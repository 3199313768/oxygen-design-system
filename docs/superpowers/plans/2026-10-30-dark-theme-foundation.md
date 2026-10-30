# Dark Theme Foundation Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans for the tightly coupled theme/portal work. Use superpowers:dispatching-parallel-agents for independent CSS and demo work. Steps use checkbox syntax for tracking. Do not commit or publish.

**Goal:** Deliver the approved light/dark/system contract with scoped themes, body-mounted portals, retained interaction state, documentation and real browser evidence.

**Architecture:** Extend `ConfigProvider` with optional `theme?: OxygenTheme`, where `OxygenTheme = 'light' | 'dark' | 'system'`. An internal React context carries the nearest explicit mode; unspecified nested providers inherit, while an unspecified root leaves the host DOM theme intact and otherwise defaults to light. Scoped CSS Token maps and `color-scheme` implement the three modes synchronously, including live system changes, without JS media listeners or storage. Portal content receives the originating context's theme attribute without introducing extra wrapper DOM, remounting content or changing Radix focus behavior.

**Tech Stack:** React, TypeScript, CSS Variables/OKLCH, Radix, Vitest/Testing Library, Playwright, Vite, Changesets.

## Global Constraints

- Preserve the existing foundation documents and other uncommitted changes; work on `codex/dark-theme-foundation` in the current checkout.
- Retain blue direction, 36px default / 32px compact / >=44px touch target, 6px/8px radius and existing typography.
- No new dependency, global class mutation, storage writes, remote changes, commits or publication.
- Default stays light; `system` is explicit. Local theme and Portal content must not modify the host theme.
- Raw images and videos remain unchanged. The host owns preferences, persistence, initial HTML and chart palettes.
- Use explicit token maps and scoped media queries rather than requiring `light-dark()`, retaining compatibility with the current browser matrix.

## Task 1: Theme context and Portal behavior

**Files:** create `packages/ui/src/components/theme-context.ts`; modify ConfigProvider, index exports, Dialog, AlertDialog, Sheet, Popover, Tooltip, Select, DropdownMenu and Toast; create `packages/ui/tests/theme.test.tsx`.

**Interface:** `ConfigProviderProps.theme?: OxygenTheme`; wrapper/content attribute `data-oxygen-theme`; internal `useOxygenThemeAttributes()` returns the inherited optional attribute. Existing `density` and `locale` behavior remains intact. No new public hook or storage API.

- [x] Add behavior tests: render `ConfigProvider theme="dark"` with Input and nested providers, expect nearest theme on the existing wrapper and portaled Dialog/Popover/Select content; default provider must not stamp light over a host theme. Assert no document-root mutation, cancellation/focus return, and retained input value/open content across rerender. Render explicit system mode using `renderToString` to prove SSR-safe attribute output.
- [x] Run `pnpm --filter @oxygen-design/ui exec vitest run tests/theme.test.tsx`; observe failure because the mode is ignored.
- [x] Implement context inheritance and apply attributes directly to existing content/overlay DOM, preserving props/ref and Radix Portal aliases. Export `OxygenTheme` through the public entry.
- [x] Repeat focused tests and run typecheck/lint; fix only theme-related errors.

## Task 2: Semantic dark palette and component styles

**Files:** modify `packages/ui/src/styles/tokens.css`, affected component CSS and patterns CSS only as needed.

**Interface:** `[data-oxygen-theme='light'|'dark'|'system']` is a CSS-only theme boundary; `:root` defaults light. System uses `(prefers-color-scheme: dark)`; explicit light resets inherited dark color tokens. Add `surface-popup`, `error-foreground`, `overlay` and brand/semantic foreground roles if needed without removing existing names.

- [x] Retain light token values; add separately calibrated dark colors for every semantic color role, overlay and shadow. Scope `color-scheme` for native controls. Do not override spacing in the theme maps.
- [x] Replace white-tinted semantic surfaces and hardcoded destructive foreground with role tokens; assign popup surface to all menus/dialogs/notifications and equivalent popovers.
- [x] Verify actual computed styles and contrast in Task 3 browser tests; pure palette declarations do not need source-grep tests.

## Task 3: Examples and browser acceptance

**Files:** create `apps/storybook/stories/Themes.stories.tsx`, update preview only if needed; extend `tests/workbench/src/App.tsx` and host styles, add `tests/workbench/src/ThemeExamples.tsx`, create `tests/browser/theme.spec.ts`.

**Interface:** host theme selector is a labeled native select `页面主题` controlling ConfigProvider and the host HTML attribute. Local preview is a named section with an explicit alternate mode and themed Select/Popover/Dialog. No library persistence. Existing workbench record interactions stay intact.

- [x] Add browser expectations for default light under dark system; explicit dark; system changes while selected vs stable explicit selection; nested local light/dark; body-mounted menu/dialog color; no document mutation from local providers; open dialog/form values/focus retained across theme change.
- [x] Validate actual paired colors using computed styles/canvas conversion, text contrast, surface hierarchy, native color-scheme, desktop/mobile overflow and untouched media. Capture light/dark desktop/mobile and open-portal screenshots.
- [x] Run focused production tarball consumer tests, then the full browser matrix.

## Task 4: Documentation, release metadata and complete verification

**Files:** create `docs/themes.md`, add minor UI changeset, update README and foundation status only for verified functionality; record results in `docs/reviews/2026-10-30-dark-theme.md`.

- [x] Document controlled host mode, global initial HTML attribute/meta, system fallback, nested inheritance, custom Token/Portal boundaries and SSR responsibilities; include executable usage with the exported type and no imaginary APIs.
- [x] Run `pnpm verify`, `pnpm verify:package`, `pnpm verify:workbench`, inspect actual screenshots and final diff.
- [x] Obtain an independent review, resolve actionable findings, rerun affected checks. Report exact local results and remaining real-device/assistive-technology/remote boundaries.
