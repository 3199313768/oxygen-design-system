# Component Documentation Implementation Plan

> **For agentic workers:** Use superpowers:subagent-driven-development for scoped documentation work and review. No commits or deployment are authorized.

**Goal:** Cover every public component family with eight documentation sections and a working Props/code Playground in the existing Storybook.

**Architecture:** Keep authored Chinese component guidance separate from executable examples and source-derived API data. A common DocsPage renders the eight sections; individual CSF entries provide discoverable component routes and Controls. Generate API data from the installed TypeScript checker so Radix, native props, compound exports and public data types remain traceable.

**Tech Stack:** Existing React, Storybook Docs/Controls, TypeScript compiler, Node test runner, Playwright. No new runtime dependencies.

## Global Constraints

- Preserve existing dirty theme changes and public component APIs.
- Work in the current approved checkout; no commits, pushes, external account edits or deployment.
- All current public component families and compound children are in scope.
- Use real source defaults, document inherited native/Radix props and known accessibility limits.
- Playground must change preview, generate complete corresponding code, reset and report clipboard failure.
- Reuse theme toolbar and design tokens. Static production output must work at direct routes.

### Task 1: Documentation content

Files: `apps/storybook/docs/content/*.ts`, `apps/storybook/docs/types.ts`.
Interface: `ComponentDoc { name: string; title: string; category: string; description: string; design: string[]; restrictions: string[]; accessibility: string[]; interaction: string; stateNotes: string; propNotes: Record<string, { description: string; default?: string }> }`.

- [x] Read every public component source and relevant tests, including compound children.
- [x] Author component-specific Chinese guidance for all eight sections; API, basic, states and interaction sections are completed by the renderer and executable examples.
- [x] Explain static component interaction limits, host responsibilities, local-date contracts and current ColorPicker accessibility semantics and browser-dependent native-picker limits.
- [x] Review descriptions against actual defaults and behavior, not roadmaps.

### Task 2: Source API and coverage gate

Files: `scripts/docs-api.mjs`, `scripts/check-docs.mjs`, `tests/tooling/docs.test.mjs`, generated `apps/storybook/docs/api.generated.json`.
Interface: `extractApi(root)` returns public export groups with property name/type/required/default/source, and public data-type declarations. `check-docs` exits nonzero on missing documentation or invalid examples.

- [x] Write tests with real fixture modules: optional/required props, inherited props, callback types, defaults and compound exports; watch failure before implementation.
- [x] Implement TypeScript checker extraction and deterministic generation. Keep generated type/source strings free of local absolute paths.
- [x] Verify the gate rejects missing family content and broken source examples.

### Task 3: Executable examples and Playground

Files: `apps/storybook/docs/examples/*.tsx`, `apps/storybook/docs/CodeSample.tsx`, `apps/storybook/stories/components/*.stories.tsx`.
Interface: each example has initial args, argTypes, React render function, complete source generator and named state variants. CSF uses `component`, `args`, `argTypes`, and args-consuming render.

- [x] Write a browser acceptance test for Button label/disabled, matching generated source, reset and clipboard rejection; run against the old static Storybook to confirm absence of the new behavior.
- [x] Add runnable examples for every family using real source props and complete composite structures. Keep callbacks and ReactNode out of directly editable Controls.
- [x] Add applicable states and working interactions; serialize strings safely with JSON.stringify, without evaluating user text.
- [x] Copy success/failure is announced and code remains selectable. Reset restores args and example state.

### Task 4: Unified docs and onboarding

Files: `apps/storybook/docs/ComponentDocs.tsx`, `apps/storybook/.storybook/{main.ts,preview.tsx,preview.css}`, `apps/storybook/stories/Introduction.mdx`, `README.md`, `docs/component-documentation.md`.

- [x] Render the eight headings, API/compound/data tables, examples, source, state stories and component-specific notes.
- [x] Add introductory install/theme/usage/static-host instructions and sidebar sorting; retain all old stories and themes.
- [x] Make tables and code locally scrollable with keyboard access and visible focus. Use theme tokens and no raw HTML injection.

### Task 5: Integrated verification and review

Files: `scripts/serve-storybook.mjs`, `playwright.docs.config.ts`, `tests/docs/`, `.github/workflows/check.yml`, validation report in `docs/reviews/`.

- [x] Run typecheck, lint, documentation extraction/content checks, relevant tests, package build and static Storybook build.
- [x] Serve static output; visit all component Docs routes, change each Playground parameter, inspect code, test reset/copy, check desktop and 390px layouts and theme behavior.
- [x] Test complex input/select/dialog/table/date/upload flows and direct static routes. Compile generated example code against real public types.
- [x] Request focused independent review, fix findings and verify affected checks.
- [x] Record exact outcomes and remaining real-device/screen-reader/deployment limits. Review task-only diff and preserve unrelated changes.

## Completion evidence

2026-10-30: `pnpm verify` passed (32 tooling, 246 UI and 8 Patterns tests, builds); final documentation browser suite passed 73/73 tests. All 67 pages and 174 complete examples were checked. Detailed outcomes and validation limits: `docs/reviews/2026-10-30-component-documentation.md`. No commit, push or deployment.
