# Oxygen UI Style Refinement Implementation Plan

> **For agentic workers:** Use superpowers:subagent-driven-development for the independent component task, followed by scoped review; execute the shared CSS and Storybook integration in this session.

**Goal:** Apply the approved A direction and resolve all 17 findings in the 2026-10-28 UI audit.

**Architecture:** Keep public component APIs and package boundaries. Correct state semantics in existing components, centralize typography/density/elevation tokens, and apply these consistently to UI, patterns, and Storybook. Browser screenshots and computed dimensions verify visual regressions that jsdom cannot detect.

**Tech Stack:** React, TypeScript, Radix, Lucide, CSS layers, Vitest, Storybook, Playwright.

## Global Constraints

- User explicitly requested direct development in the current dirty checkout; preserve all pre-existing changes. Do not create a worktree, commit, push, or deploy.
- Default controls 36px, small 32px, touch targets at least 44px. Use per-component rules for calendar, tree, and table.
- Body 14/22, label 14/20 at weight 500, caption 12/18, page 24/32, section 18/26, group 16/24. Typography levels 28/36, 24/32, 20/28, 16/24, 14/22 at weight 600.
- Keep blue brand, 6px control radius and 8px surface radius. Use existing dependencies and configurable generic Chinese text.
- No new product behavior such as table select-all, routing, upload networking, or replacing native date/time APIs.
- Scratch evidence and progress live under output/playwright/ui-refinement-2026-10-28/.

### Task 1: Correct component state and visual semantics

**Files:** Checkbox.tsx, RadioGroup.tsx, Result.tsx, Upload.tsx, Table.tsx, ColorPicker.tsx, ConfigProvider.tsx, Transfer.tsx, Tree.tsx, TreeSelect.tsx, Cascader.tsx, Steps.tsx under packages/ui/src/components; packages/ui/tests/ui-refinement-regressions.test.tsx.

**Interfaces:** Keep existing props; add optional locale configuration through the existing ConfigProvider merge pattern. Transfer accessible actions say move to target/source rather than fixed directions; CSS rotates existing icon geometry for vertical layout.

- [ ] Add behavioral tests: mixed checkbox renders a visible-state-specific minus; ColorPicker invalid text has a linked error explanation; Upload renders configurable human status labels; Transfer buttons have layout-neutral target/source names; Table uses the shared checkbox without changing selection behavior. Assert actual interactions rather than CSS source strings.
- [ ] Run the new tests first with `PATH=/opt/homebrew/bin:$PATH pnpm --filter @oxygen-design/ui exec vitest run tests/ui-refinement-regressions.test.tsx` and record expected failures.
- [ ] Implement with existing Lucide icons: Checkbox Check/Minus, Radio inner dot, Result semantic icon or numeric error code, Tree/Cascader/TreeSelect chevrons and close, Steps Check/X, Transfer ArrowRight/ArrowLeft. Add state classes for shared CSS.
- [ ] Give Table selection cells a dedicated class and reuse Checkbox; retain existing controlled/uncontrolled selection callbacks and ref.
- [ ] Link ColorPicker invalid input to a localized role=alert explanation using useId; localize native-picker suffix and action labels through ConfigProvider.
- [ ] Run focused tests and UI typecheck; record touched files, red/green evidence, and concerns in task-1-report.md. No commit.

### Task 2: Apply approved typography, density, and surface rules

**Files:** packages/ui/src/styles/{tokens,index,tree,data-display,disclosure}.css; packages/patterns/src/styles/index.css.

**Interfaces:** Consume Task 1's existing BEM component classes plus selection-cell, radio-dot, transfer arrow, result glyph, and color error elements. Keep CSS scoped to Oxygen.

- [ ] Add tokens for typography weights, icon sizes, section sizes, compact row height, field spacing, and popup/modal shadows; set default control 36px and body line-height 22px.
- [ ] Adjust vertical paddings so 36px controls do not become 40px from border/padding arithmetic. Keep 32px small controls and 44px coarse-pointer targets; do not stretch visible 18px checkbox/radio glyphs into ovals.
- [ ] Unify buttons, inputs, Select, InputNumber, Combobox, calendar, tags, loading/disabled/read-only/error/focus/hover rules. Use 16px button icons and one 8px icon gap.
- [ ] Correct mixed colors, 48px table selection column, fixed Transfer row rhythm, consistent 16px chevrons, disabled tree styling without multiplied opacity, and clear selected backgrounds.
- [ ] Add Steps connector lines that follow wrapped and vertical layouts, use consistent number alignment, and unify empty/loading text spacing.
- [ ] Fix image preview with a more specific dialog rule, 960px/90vw maximum and images constrained to the actual container. Keep close control outside image content and avoid horizontal scrolling.
- [ ] Apply lighter popup/modal shadows via tokens to all overlays, and keep patterns spacing and typography aligned.
- [ ] Build packages and verify actual browser dimensions, hover/focus/error and coarse-pointer targets using Playwright. Save measurements and screenshots.

### Task 3: Make Storybook a consistent visual acceptance surface

**Files:** apps/storybook/.storybook/{preview.tsx,preview.css}; apps/storybook/stories/*.stories.tsx as needed; add StyleRefinement.stories.tsx.

- [ ] Use a shared visual frame for examples that lack one; remove Typography.Title from demo headings so demo CSS never overrides the component being demonstrated. Preserve fullscreen stories.
- [ ] Stop grid-stretching direct trigger buttons; retain full-width form fields and proper form layouts. Use native label elements for checkbox/radio/switch examples.
- [ ] Add a style reference showing all five heading levels, default/small/icon and loading/disabled buttons, same-row form controls, invalid focused controls, long text, narrow containers, and compact data content.
- [ ] Ensure examples use generic Chinese text and label state variants. Reuse existing assets rather than introduce images or dependencies.
- [ ] Run Storybook typecheck and static build, then inspect every story at desktop and relevant narrow/touch states.

### Task 4: Review, verify, and close all findings

**Files:** output/playwright/ui-refinement-2026-10-28/{completion.md,measurements.json,screenshots}; docs/superpowers/plans/2026-10-28-ui-style-refinement.md.

- [ ] Review Task 1 against its scope and tests; resolve correctness issues before final integration.
- [ ] Run `PATH=/opt/homebrew/bin:$PATH pnpm typecheck`, `pnpm test`, `pnpm build`, `pnpm storybook:build`, and `pnpm verify:package`. Report package-consumer install limitations separately if network access fails.
- [ ] Capture all existing examples after changes plus critical states. Assert no page-level horizontal overflow, clear mixed-state colors, bounded preview image, 36/32px desktop controls, stable table/Transfer row sizes, and 44px coarse-pointer target boxes.
- [ ] Perform final independent review using the actual session diff (baseline snapshots include untracked files). Fix material findings, then rerun only relevant checks.
- [ ] Compare final file hashes with the saved baseline to identify this turn's files; check `git diff --check` and preserve unrelated edits.
- [ ] Save a 17-item completion table linking evidence; summarize changes, tests, and remaining real-device/consumer limitations. No additional approval checkpoint.
