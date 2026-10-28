# 基础组件与业务模式拆包实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将基础组件与业务模式拆成两个可构建、可测试、可发布的 workspace 包，并修正公共 API、无障碍文案、Field 关系和 Node 工程约束。

**Architecture:** `@oxygen-design/ui` 保留低耦合基础组件、tokens 和基础样式；新增 `@oxygen-design/patterns`，通过 peerDependency 使用 UI 包并提供页面模式及独立模式样式。Storybook 同时消费两个包，根验证脚本覆盖两个包。

**Tech Stack:** React 19、TypeScript、Vite、Vitest、Testing Library、Radix Primitives、pnpm workspace、Storybook、Changesets。

## Global Constraints

- 保留现有 `README.md`、设计规格和其他用户修改，不覆盖无关内容。
- 基础包不得导入模式包；模式包只能依赖基础包。
- Node 支持下限统一为 `>=22.22.2`；验证使用 `pnpm install --frozen-lockfile`。
- 不修改许可证、不执行 npm 发布、Git commit、Git push 或远端操作。
- 每个公共行为先写失败测试，再写最小实现；每个任务结束都运行对应的聚焦验证。

---

### Task 1: 锁定拆包和公共 API 的失败测试

**Files:**
- Modify: `packages/ui/tests/package-contract.test.ts`
- Modify: `packages/ui/tests/static-components.test.tsx`
- Modify: `packages/ui/tests/interactive-components.test.tsx`
- Create: `packages/patterns/tests/patterns.test.tsx`
- Create: `packages/patterns/tests/package-contract.test.ts`

- [x] **Step 1: 写基础包不再导出模式的失败断言**

在 `packages/ui/tests/package-contract.test.ts` 读取构建前入口或 manifest 约束，断言公共入口不包含 `AppShell`、`PageHeader`、`EmptyState`、`StatusMessage`。

- [x] **Step 2: 写模式包入口和包契约的失败测试**

新增测试读取 `packages/patterns/package.json`，断言包名为 `@oxygen-design/patterns`、声明 `@oxygen-design/ui` peerDependency，并导出 `.` 与 `./styles.css`。

- [x] **Step 3: 写 AppShell/Sheet 文案覆盖的失败测试**

渲染模式包的 `AppShell`，传入自定义 `navigationTriggerLabel`、`navigationTitle`、`navigationDescription`，断言按钮和 dialog 使用传入文案；渲染 `SheetContent` 时传入 `closeLabel`，断言关闭按钮 accessible name 使用该值。

- [x] **Step 4: 写 Button 多态 ref 的失败类型/行为测试**

保留默认 button ref 测试，新增 `asChild` 链接渲染测试；在类型检查 fixture 中确保 asChild ref 不再被声明为 `HTMLButtonElement`。

- [x] **Step 5: 写 Field 自动 aria 关联的失败测试**

使用 `Field description error invalid` API，断言 label 的 `htmlFor`、control 的 `id`、`aria-invalid`、`aria-describedby` 与描述和错误节点的 ID 自动一致；无错误时错误节点不渲染。

- [x] **Step 6: 运行聚焦测试确认失败原因正确**

Run: `env PATH="/opt/homebrew/bin:$PATH" pnpm --filter @oxygen-design/ui test`

Expected: 新增断言因实现尚未迁移或 API 尚不存在而失败，不得出现测试配置或依赖启动错误。

### Task 2: 创建模式包并迁移页面模式

**Files:**
- Create: `packages/patterns/package.json`
- Create: `packages/patterns/tsconfig.json`
- Create: `packages/patterns/vite.config.ts`
- Create: `packages/patterns/vitest.config.ts`
- Create: `packages/patterns/tests/setup.ts`
- Move: `packages/ui/src/patterns/*.tsx` -> `packages/patterns/src/*.tsx`
- Move: `packages/ui/tests/patterns.test.tsx` -> `packages/patterns/tests/patterns.test.tsx`
- Modify: `packages/ui/src/index.ts`
- Modify: `pnpm-workspace.yaml`

- [x] **Step 1: 创建模式包 manifest 和构建配置**

配置 `@oxygen-design/patterns`、`version: 0.1.0`、`private: false`、`type: module`、`files: ["dist"]`、`main/types/exports`，并声明 `@oxygen-design/ui` 为 peerDependency、workspace devDependency。Vite 只 externalize React、React DOM 和 `@oxygen-design/ui`，同时生成 ESM、声明文件和 `styles.css`。

- [x] **Step 2: 迁移源文件和模式测试**

将四个模式组件和对应测试迁移到新包，修正相对导入为 `@oxygen-design/ui`，确保 UI 包不再包含 `src/patterns`。

- [x] **Step 3: 移除基础包模式导出**

从 `packages/ui/src/index.ts` 删除四个模式组件及其类型导出；保留所有基础组件和图标导出。

- [ ] **Step 4: 运行模式包类型检查和测试确认失败测试进入预期范围**

Run: `env PATH="/opt/homebrew/bin:$PATH" pnpm --filter @oxygen-design/patterns typecheck && env PATH="/opt/homebrew/bin:$PATH" pnpm --filter @oxygen-design/patterns test`

Expected: 只剩文案、Button、Field 等未实现行为失败；包结构和导入链本身通过。

### Task 3: 抽离模式样式并接入 Storybook

**Files:**
- Create: `packages/patterns/src/styles/index.css`
- Modify: `packages/ui/src/styles/index.css`
- Modify: `apps/storybook/package.json`
- Modify: `apps/storybook/stories/Patterns.stories.tsx`
- Modify: `apps/storybook/stories/Foundations.stories.tsx`
- Modify: `apps/storybook/stories/Overlays.stories.tsx`
- Modify: `apps/storybook/stories/Controls.stories.tsx`

- [x] **Step 1: 将页面模式 CSS 从 UI 样式中迁移出来**

迁移 `.oxygen-page-header*`、`.oxygen-empty-state*`、`.oxygen-status-message*`、`.oxygen-app-shell*` 及其响应式媒体查询到模式包样式；保留 Button、表单、overlay、dialog、menu、tabs、sheet、tooltip 和 token 样式在基础包。

- [x] **Step 2: 让模式包输出独立 styles.css**

模式包入口导入自己的样式，构建产物提供 `./styles.css`；模式样式只引用 UI 包定义的 `--oxygen-*` tokens，不重复声明 tokens。

- [x] **Step 3: 更新 Storybook 依赖和导入**

Storybook 增加 `@oxygen-design/patterns: workspace:*`，Patterns stories 从模式包导入；示例显式传入中文文案。Foundations、Controls、Overlays 继续从 UI 包导入。

- [ ] **Step 4: 运行 Storybook 构建检查 CSS 和入口**

Run: `env PATH="/opt/homebrew/bin:$PATH" pnpm storybook:build`

Expected: Storybook 静态构建成功，基础组件和模式样式均被打包。

### Task 4: 实现国际化文案和 Button 类型契约

**Files:**
- Modify: `packages/ui/src/components/Sheet.tsx`
- Modify: `packages/patterns/src/AppShell.tsx`
- Modify: `packages/ui/src/components/Button.tsx`
- Modify: `packages/ui/tests/interactive-components.test.tsx`
- Modify: `packages/patterns/tests/patterns.test.tsx`

- [x] **Step 1: 实现 Sheet closeLabel**

从 `SheetContentProps` 接收 `closeLabel = 'Close'`，将其传给关闭按钮的 `aria-label`；空字符串回退为 `Close`，不产生空 accessible name。

- [x] **Step 2: 实现 AppShell 文案 props**

新增 `navigationTriggerLabel = 'Open navigation'`、默认标题模板为 `"${title} navigation"`，以及 `navigationDescription = 'Choose a page'`；所有值可被调用方覆盖，默认实现不出现中文。

- [x] **Step 3: 实现 Button asChild 的安全类型**

保留现有视觉和运行时行为，使用可调用的组件类型为默认 button ref 声明 `HTMLButtonElement`，为 `asChild` 声明 `HTMLElement`，并要求 asChild 有单一 React element 子节点。

- [ ] **Step 4: 运行相关测试和类型检查**

Run: `env PATH="/opt/homebrew/bin:$PATH" pnpm --filter @oxygen-design/ui typecheck && env PATH="/opt/homebrew/bin:$PATH" pnpm --filter @oxygen-design/ui test && env PATH="/opt/homebrew/bin:$PATH" pnpm --filter @oxygen-design/patterns typecheck && env PATH="/opt/homebrew/bin:$PATH" pnpm --filter @oxygen-design/patterns test`

Expected: UI 和模式包测试全部通过，新增文案和 Button 类型断言为绿色。

### Task 5: 实现 Field 语义关联 API

**Files:**
- Modify: `packages/ui/src/components/Field.tsx`
- Modify: `packages/ui/src/index.ts`
- Modify: `packages/ui/tests/static-components.test.tsx`
- Create: `packages/ui/src/components/field-context.ts`

- [x] **Step 1: 实现 Field context 和 ID 生成**

使用 `React.useId()` 生成 field、description、error IDs；显式 `id` 优先。`Field` 接收 `description?: ReactNode`、`error?: ReactNode`、`invalid?: boolean`，并向子组件提供关联信息。

- [x] **Step 2: 实现 FieldLabel 和 FieldControl**

`FieldLabel` 基于 UI Label 设置 `htmlFor`；`FieldControl` 使用 Radix Slot 要求单一子元素，并合并 id、`aria-invalid` 和 `aria-describedby`，显式调用方属性优先。

- [x] **Step 3: 实现 FieldDescription 和 FieldError 渲染**

Field 根据 `description`/`error` props 渲染带自动 ID 的描述和错误；无内容的 error 不渲染；导出组件和对应 props 类型。

- [ ] **Step 4: 运行 Field 聚焦测试**

Run: `env PATH="/opt/homebrew/bin:$PATH" pnpm --filter @oxygen-design/ui test -- static-components.test.tsx`

Expected: Field 关联测试通过，原有 Input、Label、Alert、Card 测试保持通过。

### Task 6: 固化 Node 版本和根验证链

**Files:**
- Modify: `package.json`
- Modify: `packages/ui/package.json`
- Modify: `packages/patterns/package.json`
- Create: `.github/workflows/ci.yml`
- Modify: `README.md`
- Modify: `.changeset/README.md`

- [x] **Step 1: 声明 Node engines**

在根工程、UI 包和模式包加入 `"engines": { "node": ">=22.22.2" }`，README 和 CI 使用相同下限。

- [x] **Step 2: 更新根 scripts**

让 `build` 同时构建 UI 与 patterns；让 `verify:package` 对两个 tarball 执行包内容检查，根 `verify` 覆盖两个包的类型、测试、构建和 Storybook。

- [x] **Step 3: 添加最小 CI 工作流**

使用 Node 22.22.2+、pnpm 11.9.0、`pnpm install --frozen-lockfile` 和 `pnpm verify`；不在 CI 中执行 npm publish。

- [x] **Step 4: 更新 changeset 说明**

说明基础包和模式包均需为公共 API/行为/样式变更添加 changeset，模式包使用独立版本。

- [ ] **Step 5: 运行完整验证**

Run: `env PATH="/opt/homebrew/bin:$PATH" pnpm install --frozen-lockfile && env PATH="/opt/homebrew/bin:$PATH" pnpm verify`

Expected: 两个包类型检查、测试、构建和 Storybook 构建全部成功。

### Task 7: 生成两个包并验证发布契约

**Files:**
- Modify: `scripts/verify-package.mjs`
- Create: `scripts/verify-patterns-package.mjs`
- Modify: `packages/ui/tests/package-contract.test.ts`
- Modify: `packages/patterns/tests/package-contract.test.ts`

- [x] **Step 1: 扩展 UI tarball 黑名单和入口断言**

确保 UI tarball 不含 `patterns` 源码、测试、Storybook 输出和绝对本地路径；入口只暴露基础组件和 styles/tokens。

- [x] **Step 2: 为 patterns 添加 tarball 验证**

验证 patterns tarball 包含其 ESM、声明文件和 `styles.css`，不含 tests、Storybook 输出或绝对本地路径，并使用 consumer fixture 检查其 peerDependency 安装契约。

- [ ] **Step 3: 运行最终聚焦验证和 diff 检查**

Run: `git diff --check && env PATH="/opt/homebrew/bin:$PATH" pnpm --filter @oxygen-design/ui test && env PATH="/opt/homebrew/bin:$PATH" pnpm --filter @oxygen-design/patterns test`

Expected: 两个包测试通过、diff 无空白错误、未出现与本次拆包无关的文件修改。
