# 公共 API 审计修复记录

日期：2026-11-02。基线：fcf7002。用户批准后落实 F01–F12；未新增组件或升级依赖。

## 修复结果

| 编号 | 级别 | 组件 / 范围 | 处理结果 |
| --- | --- | --- | --- |
| F01 | P1 | Slider、Dialog、Sheet、Select、NavigationMenu、Checkbox、Switch 等组合组件 | 用 Slottable 保留自定义根节点及内部轨道、图标、关闭按钮；覆盖 ref、事件、键盘操作与嵌套主题。同步修复同结构的 RadioGroupItem、DropdownMenu 子组件。 |
| F02 | P1 | Combobox | 分离搜索草稿和已提交展示。父级拒绝选择或清除时继续展示受控值；保留未选中时清空搜索草稿的能力。 |
| F03 | P2 | Transfer | 移动清除对应侧临时勾选时，同时通知 onSelectChange；支持受控和非受控目标集合。 |
| F04 | P2 | Dialog、Sheet、AlertDialog、Popover、Tooltip、DropdownMenu | Content.forceMount 传递至内部 Portal；测试关闭状态下的挂载与节点身份保持。 |
| F05 | P2 | Option、Combobox、Transfer | 增加可选 textValue。普通 DOM/Fragment 标签提取文本，复杂组件可指定搜索、展示和辅助文本。 |
| F06 | P2 | Accordion | 单选模式明确拒绝与关闭哨兵冲突的空字符串项键；保留关闭回调空字符串，多选模式继续允许空字符串键。 |
| F07 | P2 | Pagination | 规范化页码、页大小、总数及候选值为安全整数，过滤、去重候选值；覆盖小数、非有限值及超大数值。 |
| F08 | P2 | Button | ButtonProps 与可调用签名使用相同判别联合；默认按钮保留按钮事件/ref，asChild 事件使用 HTMLElement。 |
| F09 | P2 | QRCode | 将既有 ariaLabel 别名纳入命名 QRCodeProps，保持 aria-label、ariaLabel、label 优先级。 |
| F10 | P3 | 四个 Patterns | 根节点支持原生属性、className、style、id、事件及 ref，保留基础样式和现有插槽。 |
| F11 | P3 | patterns/package.json | 删除重复 license 键，保留 MIT 许可。 |
| F12 | P3 | ColorPicker | 兼容保留 defaultDraftValue，文档明确其为非法草稿示例/验证用途；不删除既有属性。 |

源代码仍位于 packages/ui/src/components 与 packages/patterns/src；包入口及公开导出名称未变。Storybook 人工说明、组合示例和自动 API 数据已同步。

## 回归证据

先复现失败，再实现修复。新增 45 项运行时回归测试及 Button/QRCode/ColorPicker 编译期类型夹具：

- packages/ui/tests/api-composition-regressions.test.tsx：21 项。
- packages/ui/tests/api-value-regressions.test.tsx：20 项。
- packages/patterns/tests/api-extension.test.tsx：4 项。
- packages/ui/tests/api-types.fixture.tsx：正向类型透传与负向类型约束。

最终检查：

| 命令 / 检查 | 结果 |
| --- | --- |
| pnpm verify | 通过：全仓类型、lint、文档、工具测试、组件测试覆盖、构建及 Storybook 构建。 |
| 工具测试 | 45 项通过，包含无 dist 环境类型解析检查。 |
| UI / Patterns 单元测试 | 301 / 12 项通过。 |
| UI 覆盖率 | 语句 92.82%，分支 85.44%，函数 93.58%，行 95.53%，通过既有门槛。 |
| Patterns 覆盖率 | 语句 100%，分支 86.36%，函数 100%，行 100%，通过既有门槛。 |
| pnpm docs:check | 67 个组件文档页、174 个初始/状态源示例编译通过。 |
| Playwright Docs，Chromium | 73 项通过，覆盖 390px 文档、控件编辑、浮层焦点及组合示例。 |
| pnpm verify:package | UI、Patterns 独立 tarball 消费类型检查、构建、导出及包体预算通过。 |
| git diff --check | 通过。 |

浏览器初次启动受本地端口沙箱限制，包消费初次安装受 DNS 限制；授权重试后全部通过。Storybook 构建仍输出底层依赖 use client 指令和插件耗时提示，未阻断构建；安装包模块的 use client 边界由包验证检查通过。

## 接入边界

1. 自定义 asChild 元素需透传属性/ref、渲染 children，并保持合适的原生语义。
2. forceMount 保持挂载，宿主管理关闭状态下的动画、可见性与交互。
3. ButtonProps 已精确表达分支；原先使用 interface extends ButtonProps 的包装需改用类型交叉。asChild 回调不能直接假设 currentTarget 是按钮。
4. Accordion 单选项的空字符串键现在会明确报错，接入方应使用非空键；正常非空键与多选行为不变。
5. 本次浏览器验证使用 Chromium；未开展新的跨浏览器矩阵或设计质量专项审计。后者可在此次 API 修复基础上独立进行。

详细契约见 docs/public-api-contracts.md。未提交、推送、发布或部署。
