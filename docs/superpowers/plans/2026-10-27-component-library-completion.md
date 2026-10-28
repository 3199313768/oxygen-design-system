# Oxygen 基础组件完善实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task with verification checkpoints. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 完成基础组件库的中文文案、表单语义、数据展示、数据录入、反馈和验证能力，保持基础组件与业务模式分离。

**Architecture:** 基础能力继续放在 `@oxygen-design/ui`，页面级组合继续放在 `@oxygen-design/patterns`。新组件只提供结构、样式、可访问交互和受控状态，不内置请求、查询、权限或领域字段。反馈组件优先复用现有 Toast/Alert 原语，日期时间组件使用原生输入语义，Table 保持通用列定义。

**Tech Stack:** React 19、TypeScript、Radix Primitives、原生 HTML 输入、Vitest、Testing Library、Storybook 10。

## Global Constraints

- 所有默认用户可见文案使用中文通用词。
- 不添加项目、文件、团队、报告、账号等业务语义。
- 不引入数据请求、表单状态库、查询状态或上传接口。
- 遵守现有 Node `>=22.22.2`、pnpm `11.9.0` 和包边界。
- 修改前先写失败测试，完成后运行对应测试、类型检查、构建和 `git diff --check`。
- 不提交、不发布、不修改版本号。

---

### Task 1: 统一 Patterns 默认文案和测试夹具

**Files:**
- Modify: `packages/patterns/src/AppShell.tsx`
- Test: `packages/patterns/tests/patterns.test.tsx`
- Modify: `apps/storybook/stories/Patterns.stories.tsx`

**Interfaces:** `AppShell` 默认值改为 `请选择页面`、`打开导航` 和 `${title}导航`，调用方传入的 props 优先级不变。

- [x] 增加默认中文文案测试并确认失败。
- [x] 修改默认值和通用测试夹具。
- [x] 扫描 patterns 与 stories，确认无业务词和英文默认文案。
- [x] 运行 patterns 测试和类型检查。

### Task 2: 完善 Form 无障碍语义

**Files:**
- Modify: `packages/ui/src/components/Form.tsx`
- Modify: `packages/ui/src/components/Field.tsx`
- Test: `packages/ui/tests/static-components.test.tsx`
- Modify: `packages/ui/src/styles/index.css`

**Interfaces:** `Form.Item required` 将 `aria-required="true"` 传给单一控件；现有 `help`、`validateStatus` 和 Field 关联保持兼容。

- [x] 增加 required 控件语义和错误描述测试并确认失败。
- [x] 在 FieldControl/Form.Item 中补充 `aria-required` 透传。
- [x] 运行 UI 静态测试和类型检查。

### Task 3: 新增通用 Table

**Files:**
- Create: `packages/ui/src/components/Table.tsx`
- Modify: `packages/ui/src/index.ts`
- Modify: `packages/ui/src/styles/index.css`
- Test: `packages/ui/tests/static-components.test.tsx`
- Test: `packages/ui/tests/interactive-components.test.tsx`
- Create: `apps/storybook/stories/Table.stories.tsx`

**Interfaces:** `Table<T>` 接受 `columns`, `dataSource`, `rowKey`, `loading`, `rowSelection`, `emptyText`；列支持 `title`, `dataIndex`, `key`, `render`。提供表头、空状态、加载状态、行选择和原生表格语义，不接管请求或分页。

- [x] 增加表格列渲染、空状态、加载和选择测试并确认失败。
- [x] 实现通用表格结构和键盘可访问选择控件。
- [x] 增加中性中文 Storybook 示例。
- [x] 运行 UI 测试、类型检查和构建。

### Task 4: 完善 Pagination

**Files:**
- Modify: `packages/ui/src/components/Pagination.tsx`
- Modify: `packages/ui/src/components/ConfigProvider.tsx`
- Modify: `packages/ui/src/index.ts`
- Modify: `packages/ui/src/styles/index.css`
- Test: `packages/ui/tests/interactive-components.test.tsx`
- Modify: `apps/storybook/stories/Navigation.stories.tsx`

**Interfaces:** 增加 `pageSizeOptions`, `showTotal`, `hideOnSinglePage`, `simple`；大页数使用省略号，`onChange(page,pageSize)` 保持兼容。

- [x] 增加大页数、省略号、每页条数和单页隐藏测试并确认失败。
- [x] 实现页码窗口和中文总数文案。
- [x] 运行 UI 交互测试和类型检查。

### Task 5: 新增 DatePicker 和 TimePicker

**Files:**
- Create: `packages/ui/src/components/DatePicker.tsx`
- Create: `packages/ui/src/components/TimePicker.tsx`
- Modify: `packages/ui/src/index.ts`
- Modify: `packages/ui/src/styles/index.css`
- Test: `packages/ui/tests/interactive-components.test.tsx`
- Create: `apps/storybook/stories/DateTime.stories.tsx`

**Interfaces:** `DatePicker` 使用 `type="date"`，`TimePicker` 使用 `type="time"`，支持 `value`, `defaultValue`, `onChange`, `disabled`, `min`, `max`, `name`, `aria-label` 和原生 ref；不做业务日期规则和请求。

- [x] 增加受控值、禁用和 change 回调测试并确认失败。
- [x] 实现原生输入包装和 tokenized CSS。
- [x] 增加中文 Storybook 示例。
- [x] 运行 UI 测试、类型检查和构建。

### Task 6: 新增反馈组件

**Files:**
- Create: `packages/ui/src/components/Spin.tsx`
- Create: `packages/ui/src/components/Progress.tsx`
- Create: `packages/ui/src/components/Result.tsx`
- Create: `packages/ui/src/components/Notification.tsx`
- Create: `packages/ui/src/components/Message.tsx`
- Modify: `packages/ui/src/index.ts`
- Modify: `packages/ui/src/styles/index.css`
- Test: `packages/ui/tests/static-components.test.tsx`
- Test: `packages/ui/tests/interactive-components.test.tsx`
- Modify: `apps/storybook/stories/Feedback.stories.tsx`

**Interfaces:** `Spin` 提供 `spinning`、`tip`；`Progress` 提供 `percent`, `status`, `showInfo`；`Result` 提供 `status`, `title`, `subTitle`, `extra`；`Notification` 和 `Message` 提供基于现有 Toast 的组合式容器，不创建全局单例或副作用 API。

- [x] 增加反馈语义、百分比边界和关闭行为测试并确认失败。
- [x] 实现组合式反馈原语。
- [x] 增加中文中性 Storybook 示例。
- [x] 运行 UI 全量测试、类型检查和构建。

### Task 7: 组件契约、视觉和发布前验证

**Files:**
- Modify: `packages/ui/tests/package-contract.test.ts`
- Modify: `README.md`
- Modify: `docs/superpowers/plans/2026-10-27-component-library-completion.md`

- [x] 增加新组件公共导出和分类契约。
- [x] 更新 README 组件分类和下一阶段说明。
- [ ] 运行 UI/Patterns 测试、全量类型检查、两个包构建、Storybook 静态构建和 diff 检查。
- [ ] 访问 `http://localhost:6006/`，确认开发服务器返回 HTTP 200。
