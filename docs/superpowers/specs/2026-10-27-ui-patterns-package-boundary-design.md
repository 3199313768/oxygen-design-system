# 基础组件与业务模式拆包设计

**日期：** 2026-10-27

**状态：** 待用户审阅

## 目标

将 Oxygen 组件库整理为“基础组件包 + 业务模式包”的清晰边界，同时解决公共组件中的中文硬编码、`Button` 多态类型、Node 工程约束和 Field 语义关联问题。

本次范围不包含许可证选择、视觉主题大改、全量组件扩充和实际 npm 发布。

## 包边界

### `@oxygen-design/ui`

只包含无业务文案、可跨产品复用的基础能力：

- Button、Input、Label、Field 及表单辅助组件
- Alert、Badge、Card、Checkbox、DropdownMenu、Tabs、Tooltip
- AlertDialog、Sheet 等交互基础组件
- Lucide 图标导出
- `styles.css` 和 `tokens.css`

基础包不能导入 `@oxygen-design/patterns`，也不能包含应用导航、页面标题、空状态等产品流程语义。

### `@oxygen-design/patterns`

作为独立 workspace/npm 包，依赖 `@oxygen-design/ui`，包含：

- AppShell
- PageHeader
- EmptyState
- StatusMessage

模式包只通过基础包提供的组件和样式工作，不反向修改基础组件的 API。模式包的默认文案使用英文中性默认值，业务应用通过 props 传入中文或其他语言。

## 公共 API 设计

### 国际化和无障碍文案

`AppShell` 新增可覆盖文案：

- `navigationTriggerLabel`
- `navigationTitle`
- `navigationDescription`

默认值为英文中性文案。Storybook 示例显式传入中文，组件实现不再写死中文。

`SheetContent` 新增 `closeLabel`，默认值为 `Close`，用于生成关闭按钮的 accessible name。调用方传入空字符串不被接受，避免产生无名称图标按钮。

### Button

保留现有视觉 variants 和 `asChild` 行为，但重新声明多态类型：

- 默认渲染时 ref 为 `HTMLButtonElement`。
- `asChild` 时要求传入单一可接受元素，并将 ref 类型声明为 `HTMLElement`，不再错误承诺一定是 `HTMLButtonElement`。
- `data-variant`、`data-size` 和 className 行为保持兼容。

测试覆盖默认 button ref、`asChild` 链接渲染和类型边界。

### Field

基础包新增字段语义组件：

- `Field`
- `FieldLabel`
- `FieldControl`
- `FieldDescription`
- `FieldError`

`Field` 接受 `description`、`error` 和 `invalid` props，并使用 `React.useId()` 生成稳定字段 ID，也支持显式 `id`。调用方式为：

```tsx
<Field description="请输入团队邮箱" error={emailError} invalid={Boolean(emailError)}>
  <FieldLabel>邮箱</FieldLabel>
  <FieldControl>
    <Input type="email" />
  </FieldControl>
</Field>
```

Field 通过内部 context 为子组件提供关联关系，并由 Field 根据 props 渲染描述和错误内容：

- `FieldLabel` 自动设置 `htmlFor`。
- `FieldControl` 自动设置 `id`、`aria-invalid` 和 `aria-describedby`。
- `FieldDescription` 和 `FieldError` 自动生成描述 ID；它们也作为可复用的内部渲染单元导出。
- `FieldError` 只有存在内容时才渲染；`invalid` 状态由 Field 统一传递。

仍允许显式 props 覆盖自动生成的属性，便于接入表单库。

## 工程结构

```text
packages/
  ui/
    src/components/
    src/styles/
    src/Icons.ts
    src/index.ts
  patterns/
    src/AppShell.tsx
    src/PageHeader.tsx
    src/EmptyState.tsx
    src/StatusMessage.tsx
    src/index.ts
```

`packages/ui/src/patterns/` 中的文件迁移到 `packages/patterns/src/`。基础包入口删除模式导出；模式包入口只导出四个页面模式及其 props 类型。

两个包都提供 `build`、`typecheck` 和 `test` 脚本。模式包将 `@oxygen-design/ui` 声明为 peerDependency，并在自身 devDependencies 中通过 workspace 引用它；这样消费者显式安装并控制基础包版本。模式包同时输出自己的 `styles.css`，消费者需要分别导入 `@oxygen-design/ui/styles.css` 和 `@oxygen-design/patterns/styles.css`。

## Node 和 CI 约束

- 根 package、`@oxygen-design/ui` 和 `@oxygen-design/patterns` 均声明 `engines.node: ">=22.22.2"`。
- CI 使用 Node 22.22.2 或更高的 Node 22 版本，并使用 `pnpm install --frozen-lockfile`。
- 根 `verify` 同时检查两个包的类型、测试、构建和 Storybook。
- README、package manifest 和 CI 使用同一版本下限，避免“文档通过、工程失败”。

## Storybook 和测试

Storybook 分为：

- `Foundations`：tokens、Button、Input、Label、Field、Badge、Card、Alert
- `Components`：Checkbox、DropdownMenu、Tabs、Tooltip、AlertDialog、Sheet
- `Patterns`：AppShell、PageHeader、EmptyState、StatusMessage

测试边界如下：

- 基础包测试基础组件交互、键盘行为、ref、aria 关系和包导出契约。
- 模式包测试默认文案可覆盖、移动端导航、页面标题/空状态/状态反馈和组合行为。
- 打包检查分别验证两个 tarball 不包含测试、Storybook 构建目录或本地绝对路径。

## 验收标准

1. `@oxygen-design/ui` 的入口不再导出 AppShell、PageHeader、EmptyState、StatusMessage。
2. `@oxygen-design/patterns` 可独立构建，并从 `@oxygen-design/ui` 获取基础组件。
3. 基础组件源代码中不出现 AppShell 这类业务模式的默认文案。
4. AppShell 和 Sheet 的 accessible name 均可由调用方覆盖。
5. Button 的默认 ref 和 `asChild` ref 类型与实际 DOM 一致。
6. Field 的 label、control、description、error 在不手写 ID 的情况下建立正确 aria 关系。
7. Node 22.14.0 不再被文档或工程配置宣称为受支持版本。
8. 两个包的类型检查、测试、构建和 Storybook 构建通过。

## 不在本次范围

- 许可证和法律授权策略
- 暗色主题和全量 token 重构
- 新增 Select、Table、Toast 等尚未存在的组件
- npm 组织、Trusted Publishing、实际发布和远端操作
