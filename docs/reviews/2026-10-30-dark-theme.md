# Dark 主题实施验收 · 2026-10-30

本次落实已确认的品牌方向与 Light / Dark 契约，保留既有尺寸、圆角、排版和默认浅色行为。工程与设计规则分别见 [Engineering Foundation](../foundations/engineering-foundation.md)、[Design Foundation](../foundations/design-foundation.md)，接入方式见 [主题接入](../themes.md)。

## 实施范围

| 文件范围 | 交付行为 |
|---|---|
| `packages/ui/src/components/ConfigProvider.tsx`、`theme-context.ts`、`src/index.ts` | 新增可选 `theme` 和导出类型 `OxygenTheme`；支持 light / dark / system；未指定的后代继承，库不修改 HTML 根主题或用户存储 |
| Dialog、AlertDialog、Sheet、Popover、Tooltip、Select、DropdownMenu、Toast、NavigationMenu | 在原有浮层节点传递来源模式，保留公开 Props、ref 和 Portal 结构；NavigationMenu 共享 Viewport 中的后代也保留来源上下文 |
| `packages/ui/src/styles/tokens.css`、`index.css` | 冷中性深灰层级、独立校准的品牌与状态颜色、浮层背景和前景角色；系统模式通过 CSS 媒体查询同步；显式局部浅色重置外层深色 |
| Storybook preview、`Themes.stories.tsx` | 全局主题工具栏与三个主题示例；包含相反局部主题、嵌套继承及常用状态矩阵 |
| `tests/workbench/`、`tests/browser/theme.spec.ts` | 实际打包消费页面的主题入口、局部区域、浮层和跨浏览器验收 |
| `packages/ui/tests/theme.test.tsx` | 13 个新增行为测试，覆盖默认行为、嵌套、浮层、交互状态保留及服务端静态输出 |
| `.changeset/cool-oxygen-themes.md` | UI 包 minor 变更说明；未执行版本升级或发布 |

默认仍为浅色，跟随系统需显式选择。主题变更不新增持久化机制；偏好、初始 HTML、账户同步与业务图表配色由宿主负责。Portal 传递的是主题模式，局部任意自定义变量不会自动复制到 body；限制和覆盖方式已在接入文档说明。

## 执行结果

以下均为本地本次执行结果，不表示远端 CI、npm 发布或实体设备已验收。

| 命令 / 检查 | 结果 |
|---|---|
| `pnpm verify` | 通过：类型、lint、工具测试、组件引用面、覆盖率、UI / Patterns 构建和 Storybook 静态构建 |
| UI 单元与交互测试 | 236 / 236 通过，含新增 13 个主题测试；语句 / 分支 / 函数 / 行覆盖率为 90.97% / 82.61% / 91.01% / 93.62% |
| Patterns 单元测试 | 8 / 8 通过；对应覆盖率为 100% / 77.27% / 100% / 100% |
| `pnpm verify:package` | 通过：UI、Patterns 分别打包，在独立临时消费项目中安装、类型检查与构建 |
| `CI=true OXYGEN_WORKBENCH_PORT=4186 pnpm verify:workbench` | 72 / 72 通过；Chromium、Firefox、WebKit、390px 移动 Chromium 模拟四个项目，含 36 个主题回归执行实例 |
| Storybook 深色批量浏览 | 60 个 story 均完成渲染和截图，未发现运行时错误或页面水平溢出；逐张缩略总览复核，另放大检查主题示例与完整工作台 |

已有构建仍有大 chunk 和插件计时提示，构建结果成功；本次未开展构建体积优化。

最终复查期间，另一项并行组件文档工作持续向工作区新增文件。上表完整验证与 60-story 截图对应其新增前的主题实现快照；最新再次执行 `pnpm typecheck` 时，UI、Patterns 均通过，Storybook 被并行新增的 `stories/components/Skeleton.stories.tsx:15` 中 `"rect"`（现有 API 为 `"rectangle"`）阻断。全库 lint 与再次执行的 13 个主题测试通过。并行文件未由本次主题任务修改；当前混合工作区不能据上表宣称完整门禁全部通过，应在该项工作完成后重新执行。

### 已验证的主题行为

- 系统偏好为深色时，未配置的页面仍保持浅色；显式浅色 / 深色不受系统变化覆盖；system 模式实时响应系统变化。
- 相反局部模式独立显示，body 中的 Select、Popover、Dialog 和 Tooltip 保持来源主题；Toast、导航共享 Viewport 及其他浮层另有单元行为覆盖。
- 切换主题时已打开 Dialog 的 DOM 节点、输入草稿及焦点保留；关闭与焦点返回遵循既有行为。
- 检查页面、容器和模态浮层的实际明度层级；以浏览器计算色值和 Canvas 转换到 sRGB，检查主按钮、输入文字、占位、徽标、表格文字和 Tooltip 等采样组合的最终稳定对比度至少为 4.5:1。
- 浅深色检查原生 `color-scheme`，媒体未使用反色滤镜；主题切换不改变原始媒体内容。
- 完整消费页面保留原有查询、分页、编辑与附件流程，桌面及窄屏回归通过。

对比度结果针对测试中明确采样的文字 / 背景组合及稳定状态，不代表全部组件、所有自定义颜色或动画中间帧均已满足要求。禁用控件和非文字边界未按同一文字阈值推断。

### 评审后修正

独立审查发现并修正两个问题：同时导入 `styles.css` 与单独 `tokens.css` 时，未分层的主题文字规则可能覆盖 Tooltip 前景；现将规则放入 theme 层，并以真实消费页验证。NavigationMenu 将内容迁移到共享 Viewport 时可能丢失局部来源；现保留内容和后代上下文，并增加含嵌套 Popover 的回归用例。

## 截图与复核索引

以下文件由本地浏览器验证生成，位于忽略的 `output/` 目录，可重新运行验证生成，未纳入发布包。

- [桌面深色完整页面](../../output/playwright/consumer/results/theme-dark-page-keeps-oppo-b6a8c-es-and-body-mounted-portals-chromium/dark-page.png)
- [桌面浅色完整页面](../../output/playwright/consumer/results/theme-light-page-keeps-opp-38151-es-and-body-mounted-portals-chromium/light-page.png)
- [移动深色与局部浅色](../../output/playwright/consumer/results/theme-dark-page-keeps-oppo-b6a8c-es-and-body-mounted-portals-mobile-chromium/dark-page.png)
- [移动局部对话框](../../output/playwright/consumer/results/theme-dark-page-keeps-oppo-b6a8c-es-and-body-mounted-portals-mobile-chromium/dark-local-dialog.png)
- Storybook 总览：[1](../../output/playwright/dark-theme/storybook/contact-1.png)、[2](../../output/playwright/dark-theme/storybook/contact-2.png)、[3](../../output/playwright/dark-theme/storybook/contact-3.png)、[4](../../output/playwright/dark-theme/storybook/contact-4.png)、[5](../../output/playwright/dark-theme/storybook/contact-5.png)；[批量结果](../../output/playwright/dark-theme/storybook/results.json)。显式 Light 和 System story 保持各自模式，其余示例使用全局深色。

## 验收边界

尚未覆盖实体手机 / 平板、人工读屏、所有宿主业务应用、完整像素基线对比或框架级 SSR hydration 集成。服务端测试证明静态输出不依赖浏览器环境，不替代各宿主首次加载和偏好恢复验收。

正式基础规范已整理，并明确现有能力与后续工作；字体 Token、完整缓动体系、远端分支保护、许可和 npm 发布状态仍按各自规范独立处理。工作区并行出现的组件文档改动保留，不计入本次主题交付；本次未提交、推送或发布。
