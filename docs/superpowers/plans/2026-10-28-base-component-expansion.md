# Oxygen 基础组件扩展实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为 `@oxygen-design/ui` 补齐三批基础组件，并为每个组件提供稳定类型、无障碍交互、Storybook 示例、测试和 packed consumer 验证。

**Architecture:** 组件继续放在 `packages/ui/src/components`，复用现有 Radix/Oxygen 样式和 `ConfigProvider` locale。复杂日期和二维码规则使用成熟运行时依赖；上传、异步选项和路由导航通过回调或 children 注入，基础包不执行业务请求。

**Tech Stack:** React 19, TypeScript, Radix Primitives, Vite, Vitest, Testing Library, Storybook 10, pnpm, `react-day-picker`, `qrcode.react`。

## Global Constraints

- 不新增业务组件，不把路由、鉴权、HTTP 请求或领域状态放进基础包。
- 所有有状态组件支持受控和非受控用法，使用 `value`/`onChange` 与 `defaultValue`。
- 所有可交互组件支持 `disabled`；异步或提交态支持 `loading`。
- 列表、树和 Transfer 的 key 保留字符串和数字，不强制转成字符串。
- 新增默认文案必须进入 `ConfigProvider` locale，并允许调用方覆盖。
- `Upload` 通过 `customRequest` 接入服务端，不内置上传 URL 或鉴权。
- `QRCode` 使用 `qrcode.react`，不手写二维码编码算法。
- 不修改公开包许可证，不提交、发布或推送。
- 每个组件必须有入口导出、公开类型、Storybook 示例和至少一个测试。

---

### Task 1: Shared models, dependencies, and locale surface

**Files:**
- Modify: `packages/ui/package.json`
- Modify: `packages/ui/src/components/ConfigProvider.tsx`
- Create: `packages/ui/src/components/shared.ts`
- Modify: `packages/ui/tests/package-contract.test.ts`
- Modify: `pnpm-lock.yaml`

**Interfaces:**
- Produces `Option<T>`, `TreeNode<T>`, `UploadFile`, `UploadFileStatus` and locale keys reused by later tasks.

- [ ] **Step 1: Add failing package and locale contract tests**

```ts
it('declares runtime dependencies required by the component expansion', () => {
  expect(manifest.dependencies).toEqual(
    expect.objectContaining({
      'qrcode.react': expect.any(String),
      'react-day-picker': expect.any(String),
    }),
  );
});

it('exposes locale fallbacks for new generic labels', () => {
  expect(defaultLocale.common).toEqual(
    expect.objectContaining({
      browse: expect.any(String),
      clear: expect.any(String),
      collapse: expect.any(String),
      expand: expect.any(String),
      remove: expect.any(String),
      upload: expect.any(String),
    }),
  );
});
```

- [ ] **Step 2: Run the contract test and verify it fails**

Run: `env PATH=/opt/homebrew/bin:$PATH pnpm --filter @oxygen-design/ui test -- package-contract.test.ts`

Expected: FAIL because the dependencies and locale keys do not exist yet.

- [ ] **Step 3: Add dependencies and shared types**

Add `react-day-picker` and `qrcode.react` to `packages/ui/package.json`, update the lockfile, and create shared types with these exact shapes:

```ts
export interface Option<T = string> {
  disabled?: boolean;
  label: ReactNode;
  value: T;
}

export interface TreeNode<T = string> {
  children?: TreeNode<T>[];
  disabled?: boolean;
  key: T;
  label: ReactNode;
}

export type UploadFileStatus = 'error' | 'done' | 'uploading' | 'pending';

export interface UploadFile {
  file: File;
  id: string;
  name: string;
  percent?: number;
  status: UploadFileStatus;
  url?: string;
}
```

- [ ] **Step 4: Add locale defaults and partial overrides**

Extend `OxygenLocale['common']` with `browse`, `clear`, `collapse`, `expand`, `remove`, `search`, `upload`, `selected`, and `noOptions`, keeping `OxygenLocaleConfig` partial and preserving existing defaults.

- [ ] **Step 5: Run the contract test and typecheck**

Run: `env PATH=/opt/homebrew/bin:$PATH pnpm --filter @oxygen-design/ui test -- package-contract.test.ts && env PATH=/opt/homebrew/bin:$PATH pnpm --filter @oxygen-design/ui typecheck`

Expected: PASS.

---

### Task 2: Data-entry components

**Files:**
- Create: `packages/ui/src/components/Upload.tsx`
- Create: `packages/ui/src/components/Calendar.tsx`
- Create: `packages/ui/src/components/DateRangePicker.tsx`
- Create: `packages/ui/src/components/Combobox.tsx`
- Create: `packages/ui/src/components/InputNumber.tsx`
- Modify: `packages/ui/src/index.ts`
- Modify: `packages/ui/tests/interactive-components.test.tsx`
- Create: `apps/storybook/stories/DataEntryExpansion.stories.tsx`

**Interfaces:**
- Consumes: shared `Option`, `UploadFile`, `TreeNode`-independent locale keys from Task 1.
- Produces: controlled/uncontrolled data-entry components with native event and keyboard behavior.

- [ ] **Step 1: Write failing interaction tests**

Cover these cases: Upload rejects a file over `maxSize`, controlled file removal calls `onRemove`, Calendar selects a date, DateRangePicker calls `onChange` only after both endpoints exist, Combobox filters and selects with ArrowDown/Enter, and InputNumber clamps typed values to `min`/`max`.

```tsx
it('selects a complete date range', () => {
  const onChange = vi.fn();
  render(<DateRangePicker onChange={onChange} />);
  fireEvent.click(screen.getByRole('button', { name: '选择 2026年10月28日' }));
  fireEvent.click(screen.getByRole('button', { name: '选择 2026年10月30日' }));
  expect(onChange).toHaveBeenCalledWith([new Date('2026-10-28'), new Date('2026-10-30')]);
});
```

- [ ] **Step 2: Run focused tests and verify they fail**

Run: `env PATH=/opt/homebrew/bin:$PATH pnpm --filter @oxygen-design/ui test -- interactive-components.test.tsx`

Expected: FAIL because the five components are not exported or implemented.

- [ ] **Step 3: Implement the minimal component APIs**

Use `react-day-picker` for the calendar grid and range keyboard behavior. Keep `Upload` request-agnostic with `customRequest(file, handlers)`, where handlers expose `onProgress`, `onSuccess`, and `onError`. Use an ARIA combobox/listbox pair for `Combobox`; render a spinbutton for `InputNumber` and validate both keyboard and button changes.

- [ ] **Step 4: Add exports, stories, and locale usage**

Export each runtime component and its public props from `src/index.ts`; add neutral Chinese Storybook stories for normal, empty, loading, disabled, error, controlled, and keyboard states. Use `ConfigProvider` labels for upload, search, clear, and empty options.

- [ ] **Step 5: Run focused tests, typecheck, and Storybook build**

Run: `env PATH=/opt/homebrew/bin:$PATH pnpm --filter @oxygen-design/ui test -- interactive-components.test.tsx && env PATH=/opt/homebrew/bin:$PATH pnpm --filter @oxygen-design/ui typecheck && env PATH=/opt/homebrew/bin:$PATH pnpm --filter @oxygen-design/storybook build-storybook`

Expected: PASS.

---

### Task 3: Navigation and compact status components

**Files:**
- Create: `packages/ui/src/components/Breadcrumb.tsx`
- Create: `packages/ui/src/components/Tag.tsx`
- Create: `packages/ui/src/components/TagInput.tsx`
- Modify: `packages/ui/src/index.ts`
- Modify: `packages/ui/tests/static-components.test.tsx`
- Modify: `packages/ui/tests/interactive-components.test.tsx`
- Create: `apps/storybook/stories/NavigationExpansion.stories.tsx`

**Interfaces:**
- Consumes: `ConfigProvider` locale and existing `Button`, `Input`, `Typography` styles.
- Produces: `Breadcrumb` with links/current item and `Tag`/`TagInput` with controlled values.

- [ ] **Step 1: Add failing tests**

Assert Breadcrumb exposes `aria-current="page"`, Tag supports tone/closable/disabled, and TagInput commits a trimmed token on Enter while ignoring duplicates.

- [ ] **Step 2: Run focused tests and verify they fail**

Run: `env PATH=/opt/homebrew/bin:$PATH pnpm --filter @oxygen-design/ui test -- static-components.test.tsx interactive-components.test.tsx`

Expected: FAIL because the components and exports do not exist.

- [ ] **Step 3: Implement components and styles**

Keep Breadcrumb route-agnostic by accepting `items: Array<{ href?: string; label: ReactNode }>` and an optional separator. Keep TagInput as a controlled token editor with `value`, `defaultValue`, `onChange`, `max`, `allowDuplicates`, and `disabled`.

- [ ] **Step 4: Add stories and verify**

Add stories for current/disabled/closable tags, keyboard token entry, and breadcrumb overflow. Run the focused tests and UI typecheck.

---

### Task 4: Tree and hierarchical selection

**Files:**
- Create: `packages/ui/src/components/Tree.tsx`
- Create: `packages/ui/src/components/TreeSelect.tsx`
- Create: `packages/ui/src/components/Cascader.tsx`
- Modify: `packages/ui/src/index.ts`
- Modify: `packages/ui/tests/interactive-components.test.tsx`
- Create: `apps/storybook/stories/TreeExpansion.stories.tsx`

**Interfaces:**
- Consumes: `TreeNode<T>` from Task 1 and existing `Popover`, `Select`, `Checkbox` primitives.
- Produces: numeric/string-safe tree selection callbacks and reusable node rendering.

- [ ] **Step 1: Add failing tests**

Test expand/collapse, disabled nodes, numeric keys, controlled selected keys, TreeSelect search/clear, and Cascader path selection.

- [ ] **Step 2: Run focused tests and verify they fail**

Run: `env PATH=/opt/homebrew/bin:$PATH pnpm --filter @oxygen-design/ui test -- interactive-components.test.tsx`

Expected: FAIL because the hierarchy components are absent.

- [ ] **Step 3: Implement shared tree traversal and components**

Use a single internal traversal helper for flattening, descendant selection, and parent expansion. Preserve `Key` values exactly. Render nested lists with `role="tree"`, `role="treeitem"`, `aria-expanded`, and `aria-selected`; do not add virtualization until a measured data-size requirement exists.

- [ ] **Step 4: Add exports, stories, and verify**

Add stories for flat, nested, checkable, disabled, searchable, and empty states. Run tests and typecheck.

---

### Task 5: Data-display and progressive disclosure components

**Files:**
- Create: `packages/ui/src/components/Descriptions.tsx`
- Create: `packages/ui/src/components/Statistic.tsx`
- Create: `packages/ui/src/components/Steps.tsx`
- Create: `packages/ui/src/components/Timeline.tsx`
- Create: `packages/ui/src/components/Accordion.tsx`
- Create: `packages/ui/src/components/Collapsible.tsx`
- Create: `packages/ui/src/components/Image.tsx`
- Create: `packages/ui/src/components/ImagePreview.tsx`
- Modify: `packages/ui/src/index.ts`
- Modify: `packages/ui/tests/static-components.test.tsx`
- Modify: `packages/ui/tests/interactive-components.test.tsx`
- Create: `apps/storybook/stories/DataDisplayExpansion.stories.tsx`

**Interfaces:**
- Consumes: existing `Dialog`, `Button`, `Typography`, `ConfigProvider`, and Radix disclosure primitives where available.
- Produces: reusable display layouts and accessible disclosure/preview interactions.

- [ ] **Step 1: Add failing tests**

Test description labels/values, statistic loading and trend, current/completed/error steps, timeline status, accordion keyboard toggling, collapsible controlled state, image fallback, and Escape/close behavior for ImagePreview.

- [ ] **Step 2: Run focused tests and verify they fail**

Run: `env PATH=/opt/homebrew/bin:$PATH pnpm --filter @oxygen-design/ui test -- static-components.test.tsx interactive-components.test.tsx`

Expected: FAIL because the display components are absent.

- [ ] **Step 3: Implement components using focused files and shared style tokens**

Use data arrays for Descriptions, Steps, Timeline, and Accordion. Keep ImagePreview as a thin dialog wrapper around Image, with `alt`, `open`, `onOpenChange`, and `closeLabel`; no image fetching or caching logic beyond the browser image element.

- [ ] **Step 4: Add stories and verify**

Show normal, loading, empty, error, disabled, responsive, and keyboard states. Run focused tests and typecheck.

---

### Task 6: Enhanced controls

**Files:**
- Create: `packages/ui/src/components/Slider.tsx`
- Create: `packages/ui/src/components/ColorPicker.tsx`
- Create: `packages/ui/src/components/Transfer.tsx`
- Modify: `packages/ui/src/index.ts`
- Modify: `packages/ui/tests/interactive-components.test.tsx`
- Create: `apps/storybook/stories/ControlExpansion.stories.tsx`

**Interfaces:**
- Consumes: `Option<T>` from Task 1 and existing `Popover`, `Checkbox`, `Input`, and Button primitives.
- Produces: single/range slider values, validated color values, and string/number-safe Transfer selections.

- [ ] **Step 1: Add failing tests**

Test slider keyboard increments and range callbacks, ColorPicker valid/invalid input and cancel, Transfer search/select-all/move behavior, and numeric option keys.

- [ ] **Step 2: Run focused tests and verify they fail**

Run: `env PATH=/opt/homebrew/bin:$PATH pnpm --filter @oxygen-design/ui test -- interactive-components.test.tsx`

Expected: FAIL because the controls are absent.

- [ ] **Step 3: Implement controls**

Use `@radix-ui/react-slider` for keyboard-correct slider behavior. Keep ColorPicker output in `#RRGGBB` form and reject malformed values before `onChange`. Transfer maintains `sourceItems`, `targetKeys`, search text, disabled options, and controlled callbacks without mutating caller arrays.

- [ ] **Step 4: Add stories and verify**

Add normal, disabled, controlled, range, error, and empty stories. Run focused tests and typecheck.

---

### Task 7: Navigation menu and QR code

**Files:**
- Create: `packages/ui/src/components/NavigationMenu.tsx`
- Create: `packages/ui/src/components/QRCode.tsx`
- Modify: `packages/ui/src/index.ts`
- Modify: `packages/ui/tests/interactive-components.test.tsx`
- Modify: `packages/ui/tests/package-contract.test.ts`
- Create: `apps/storybook/stories/NavigationAndUtilityExpansion.stories.tsx`

**Interfaces:**
- Consumes: `qrcode.react`, existing Button/Popover styles, and locale close/copy labels.
- Produces: route-agnostic navigation primitives and a QRCode component with `value`, `size`, `fgColor`, `bgColor`, and `includeMargin`.

- [ ] **Step 1: Add failing tests**

Test menu keyboard navigation and active item semantics, QRCode rendering with a value, custom size/colors, and empty/error state.

- [ ] **Step 2: Run focused tests and verify they fail**

Run: `env PATH=/opt/homebrew/bin:$PATH pnpm --filter @oxygen-design/ui test -- interactive-components.test.tsx package-contract.test.ts`

Expected: FAIL because the components and dependency contract are absent.

- [ ] **Step 3: Implement and export the components**

Use Radix NavigationMenu where its primitives match the required semantics. Wrap `QRCodeSVG` from `qrcode.react` without adding data transport or persistence. Validate an empty value before rendering and expose an accessible label.

- [ ] **Step 4: Add stories and verify package output**

Run UI tests, typecheck, build, pack, and the isolated consumer verification. Confirm the new dependency is externalized and present in the packed manifest.

---

### Task 8: Full verification and documentation

**Files:**
- Modify: `README.md`
- Modify: `apps/storybook/stories/*`
- Modify: `packages/ui/tests/package-contract.test.ts`
- Modify: `scripts/verify-package.mjs`

- [ ] **Step 1: Update component inventory documentation**

Add the new components to the README's category list and document the Upload `customRequest`, date range value shape, and QRCode dependency boundary.

- [ ] **Step 2: Run the complete verification suite**

Run:

```bash
env PATH=/opt/homebrew/bin:$PATH pnpm verify
env PATH=/opt/homebrew/bin:$PATH pnpm verify:package
git diff --check
```

Expected: typecheck, tests, UI/patterns builds, Storybook build, packed UI consumer, and packed patterns consumer all pass.

- [ ] **Step 3: Inspect package size and public surface**

Check that `dist/index.js`, CSS, declaration files, and packed manifests contain all intended exports, no source/tests/absolute paths, and no unintended bundled copy of external runtime dependencies.

- [ ] **Step 4: Review final diff**

Confirm only the approved component expansion, docs, tests, dependencies, and generated lockfile changes are present. Leave the public package license unchanged and do not commit or publish.
