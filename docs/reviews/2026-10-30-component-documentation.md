# 组件文档站交付与验收

日期：2026-10-30。基于用户确认的 Storybook Docs + Controls 方案，本次完成本地文档站建设；公网部署另行配置。

## 需求对应

| 要求 | 实现 |
| --- | --- |
| 组件介绍 | 67 个独立入口，按组件编写中文用途及适用场景 |
| 设计规范 | 组件专属规范、语义 Token 和通用设计规范链接 |
| API 参数 | 从当前公开源码提取 65 个组件族、181 个组件导出，包含复合子组件、类型、必填、默认值、回调和继承属性 |
| 基础示例 | 每个入口有真实组件示例，组合结构、导入及状态逻辑完整 |
| 不同状态 | 按实际能力提供状态变体，初始与状态合计 174 份可编译示例 |
| 交互示例 | 真实输入、选择、弹窗、表格、上传模拟及颜色草稿确认等交互 |
| 使用限制 | 明确格式、受控回写、宿主责任、空值和已知行为边界 |
| 可访问性说明 | 标签、键盘、焦点、错误信息及各组件的实际限制 |
| Playground | Controls 修改 Props，实际预览和完整代码联动；恢复默认同时重置参数和内部状态；复制失败保留代码并提示手动复制；关闭 Storybook 重复源码入口 |
| 公网准备 | 静态构建、直接链接、CI artifact 与托管操作说明；未执行部署 |

FormItem、SpaceCompact 有独立入口，其余组合成员在所属组件页面列 API。图标和静态组件通过 Props 演示内容/布局；不虚构不存在的交互接口。

## 主要文件

- `apps/storybook/docs/content/`、`types.ts`：逐组件说明和人工 API 补充。
- `apps/storybook/docs/examples/`、`playgrounds.json`、`source-code.mjs`：真实示例及对应完整复制代码。
- `apps/storybook/docs/ComponentDocs.tsx`、`component-meta.tsx`、`CodeSample.tsx`：八项文档、参数联动、隔离重置和复制反馈。
- `apps/storybook/stories/components/`、`Introduction.mdx`、`DesignGuide.mdx`：组件路由、快速开始及基础规范。
- `scripts/docs-api.mjs`、`docs-stories.mjs`、`check-docs.mjs`：API/路由生成、覆盖与完整代码类型检查。
- `tests/tooling/docs.test.mjs`、`tests/docs/`、`playwright.docs.config.ts`：生成器及静态站浏览器验收。
- Storybook 配置、根脚本、ESLint 和 CI：集成构建、检查、窄屏排版和产物保存。
- `docs/component-documentation.md`、`README.md`：维护与静态托管说明。

本任务没有修改组件公共 API。工作区原有及并行进行的主题、Foundation、组件、打包与发布检查修改均保留，不计入本文档任务成果。未提交、推送或发布。

## 验证记录

- `pnpm verify`：类型检查、ESLint、文档一致性、32 项 tooling 测试、60 个 UI 组件静态测试引用检查、246 项 UI 单测、8 项 Patterns 单测、两个包构建和 Storybook 静态构建通过。
- `pnpm docs:check`：67 个入口与公开源码对应；174 份初始/状态完整代码全部通过真实公开类型编译。缺失页面、过期 API、缺失依赖和不合法代码有阻断检查。
- `pnpm exec playwright test --config playwright.docs.config.ts`：静态产物执行 73 项 Chromium 验收，覆盖全部入口八项内容、每页参数/真实预览/代码联动与恢复默认、390px 横向溢出、页面错误和资源加载；另覆盖复制成功/拒绝、输入、选择、弹窗焦点返回、表格全选、上传模拟、日期、颜色确认/取消、直接链接刷新、基础规范跳转和深色正文 Token。
- 视觉复核：检查 390px 示例/代码/Controls 局部滚动及桌面深色截图。修正 Storybook 对正文硬编码的浅色文字样式；增加标题、正文和列表实际颜色断言，避免只检查主题属性。
- 回归修正：使用 Storybook 的状态 Hook 隔离同页多个故事，修复恢复默认混入其他状态示例参数的问题；相关失败用例修正后复验。独立审阅还发现链接覆盖参数可能被当成默认值；改用 Storybook 原生 resetArgs，并验收基础故事和具名状态各自的预设值。
- 一个既有大表格单测在与浏览器并发运行时曾超时；顺序重跑完整 `pnpm verify` 通过，未放宽断言或超时。

浏览器截图、trace、最终 73/73 运行日志和 HTML 报告位于 `output/playwright/docs/`；完整项目验证日志为 `output/docs-verify.log`。内容审阅报告为 `output/docs-content-review.md`，实现审阅报告为 `output/docs-implementation-focused-review.md`；两项审阅均已通过。远端 CI 尚未触发。

## 查看与公开发布

```bash
pnpm storybook:build
pnpm docs:preview
```

访问 `http://127.0.0.1:6016/?path=/docs/components-button--docs`。将 `apps/storybook/storybook-static/` 全部内容部署到 HTTPS 静态托管平台即可供公网访问，具体步骤见维护文档。

未验证实际域名、HTTPS、代理子路径、托管权限、远端缓存和部署后的剪贴板权限。文档浏览器验收使用本机 Chromium，未对本次文档站执行 Safari/Firefox、真实移动设备或读屏器验收；也不据此宣称整套组件已满足全部无障碍标准。

## Modern Web Guidance

- **`accessibility`**：我依据 “Use `:focus-visible` when styling focus indicators” 为文档链接、按钮及滚动区域提供键盘焦点样式。
- **`html`**：我依据 “`tabindex="0"` to the `<pre>` element if it becomes scrollable” 让完整代码区可通过键盘进入并滚动；复制失败时继续保留可选择的代码。
