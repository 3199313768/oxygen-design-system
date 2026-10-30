# Engineering Foundation · 工程基础规范

制定日期：2026-10-30。本文整理现有工程约定，与 [Design Foundation](design-foundation.md) 共同作为 Oxygen 的基础规范。

本文中的“必须”是开发与验收要求；“现状”描述当前仓库能力；“待落实”表示规则已明确但尚未完成实现或验证。规范确定不等于功能已经交付。历史计划与检查报告保留为过程记录；实现、配置与本规范不一致时，应记录差异并评审修正，不能通过降低要求消除差异。

## 1. Monorepo 目录和包职责

| 目录 | 职责 | 边界 |
|---|---|---|
| `packages/ui` | 基础控件、布局原语、交互能力、类型和设计 Token | 不包含具体产品流程、路由、数据访问、鉴权或业务状态 |
| `packages/patterns` | 通用页面组合，如 AppShell、PageHeader、EmptyState、StatusMessage | 组合基础 UI，通过 props 接收内容和操作，不自行获取业务数据 |
| `apps/storybook` | 组件说明、使用示例、状态展示和设计验收入口 | 私有开发应用，不作为 npm 库发布，不向组件包反向注入依赖 |
| `tests/consumer` | 最小发布包消费契约 | 必须通过真实打包入口验证，不能用源码 alias 替代 |
| `tests/workbench`、`tests/browser` | 完整工作页面及浏览器行为验收 | 演示数据、模拟上传不能被解释为真实业务服务 |
| `scripts` | 构建、打包消费与质量门禁工具 | 失败必须返回非零；不得输出凭据 |
| `docs` | 基础规范、接入说明和历史验证证据索引 | 明确已确认规则、实现现状和验证范围 |

依赖方向为 Storybook/消费应用 → patterns → ui。基础包不得依赖模式包；包内组件避免循环依赖。Foundation、Primitives、Components、Pro Components 是长期能力分层，不表示当前需要新增同名软件包。

## 2. 技术栈与依赖边界

- 工作区使用 pnpm Workspace、TypeScript、Vite，开发基线为 React 19。环境要求 Node >=22.22.2、pnpm 11.9.0；精确依赖以清单与锁文件为准。
- 复杂交互优先复用 Radix；变体使用 CVA，图标使用 Lucide；复用现有工具，避免为单个场景新增依赖或抽象。
- 样式以 CSS Variables 和预编译 CSS 交付。Tailwind v4 参与现有库构建及文档开发，使用方无需安装或编译 Tailwind。
- React、React DOM 是 peerDependencies；当前声明范围为 `>=18`。开发使用 React 19 不等于已经完成所有 peer 版本的运行验证。
- patterns 将 UI 声明为 peerDependency，开发时通过 workspace 引用。运行时依赖必须在对应包的 dependencies 中声明，不能依赖开发环境偶然安装的包。
- 构建必须 externalize React 及声明的运行时依赖；新增依赖应说明必要性、体积影响及消费方约束。
- 网络请求、上传服务、路由、存储和权限策略由宿主提供。Upload 管理选择、校验、状态和取消，通过 `customRequest` 接入上传实现。

## 3. 组件开发规范

每个组件的交付包含：组件实现、可导出的类型、可维护的样式、公开导出、Storybook 示例、使用说明和行为测试。现有样式按主题集中在多个 CSS 文件中，“独立样式”指组件职责和选择器独立，不强制每个组件单独建 CSS 文件。

开发前必须阅读相关组件、依赖、调用模式和现有测试，说明影响的文件及公共 API。优先复用原生语义与现有组件，避免重复实现交互。

- API 延续已有命名和组合模式。`size` 表示尺寸，`variant` 表示外观变体；已有 `tone`、`type` 等组件契约保持兼容，不做全库机械改名。
- 对存在可编辑状态的组件，合理提供受控值、默认值和变化回调；明确空值、清空、取消和提交语义。具体名称沿用组件已有契约，不强行统一为同一组 props。
- 支持合理的 `className`、原生属性与 ref 透传。组合或 `asChild` 模式应验证实际 DOM 的事件、禁用语义及 ref 类型。
- 异步操作应处理重复触发、乱序响应、取消和卸载；失败应提供可理解的反馈。基础组件不将传输错误擅自解释成业务失败。
- 复杂组件必须处理键盘、焦点进入与返回、名称与描述、错误关联、禁用、长内容和窄容器。
- 默认交互文案采用中文通用词，通过现有 locale 接口覆盖；业务标题、业务状态和权限提示由调用方传入。

组件说明至少包含用途与边界、props/类型、受控与非受控用法（适用时）、状态、键盘方式、限制和消费示例。不能用组件枚举名称代替用户可理解的反馈文案。

## 4. TypeScript 类型规范

- 使用严格 TypeScript，遵循 `tsconfig.base.json` 和 ESLint；禁止通过关闭 strict 或扩大忽略范围规避错误。
- 公开组件类型使用清晰的 `ComponentProps` 等命名；原生控件优先继承对应 React HTML 属性，冲突字段显式排除并解释。
- 枚举状态使用字面量联合；互斥组合优先使用可辨识联合。集合组件的泛型应维持值、选项和回调之间的类型关系。
- 明确可选、`undefined`、`null` 和空集合的含义，保持与运行行为一致。回调、事件和 ref 必须对应实际公开能力。
- 避免 `any`；未知输入使用 `unknown` 并收窄。类型断言仅用于已经验证且有明确边界的场景，不能掩盖不兼容的 DOM 或值类型。
- 使用 `import type` 表达纯类型依赖。公开类型不得引用宿主应用、内部源码路径或未发布文件。
- 发布声明必须通过独立消费项目检查。patterns 的开发源码映射只用于开发检查，不能泄漏到发布声明。

现状：strict、类型检查、语义 lint 和打包声明验证已有配置。上述规则不表示仓库内所有历史类型都已逐项迁移。

## 5. CSS 与样式隔离规范

- 组件使用 `oxygen-` 类名前缀，Token 使用 `--oxygen-*` 前缀，样式组织沿用 CSS Layers。避免全局 reset 和无作用域的元素规则影响宿主。
- 颜色、间距、尺寸、圆角、字重、阴影和动效优先引用现有 Token。确有新增语义时再增加 Token；不为每个局部数值制造公共变量。
- 包通过明确的 CSS 入口交付样式，宿主在入口导入；只需要 Token 的使用方可单独导入 `tokens.css`。
- 自定义优先使用 Token 和 `className`。不依赖不断提高选择器权重或增加 `!important` 来覆盖宿主。
- 保持长文案、窄容器、缩放和触屏布局可用；表格滚动应提供名称与键盘访问方式。
- 不自动加载远程字体。正文通过 `--oxygen-font-family-body` 覆盖，未设置时继承宿主；`system`、`mono` 提供明确字体栈。Storybook 展示字体不等于消费应用自动加载字体。

主题工程契约已落实：`ConfigProvider` 支持可选 `theme: light | dark | system`，局部主题与浮层保持来源模式；库不改写宿主根主题或存储。全局 HTML 的初始主题由宿主同步提供。API、CSS 属性、SSR 和 Portal 自定义边界见 [主题接入](../themes.md)，产品规则见 [主题契约](design-foundation.md#6-light--dark-主题)。

## 6. 构建、导出和 Tree Shaking

- 使用 Vite 库模式生成 ESM、类型声明与预编译 CSS，当前不提供 CommonJS `require()` 入口。
- UI 公开入口为包根、`styles.css`、`tokens.css`；patterns 公开入口为包根和 `styles.css`。新增入口应同步清单、声明、文档与契约验证。
- 发布 `dist`、包元数据与 MIT `LICENSE` 等必要文件；使用方不得依赖仓库源码、Storybook 或开发 alias。先构建 UI，再构建 patterns。
- React 和运行时依赖保持 external，不把它们重复打进组件库。`sideEffects` 保留 CSS，避免消费构建错误移除样式。
- 保持 ESM 静态导出，避免模块顶层执行非必要副作用。客户端入口边界保持现有契约；服务端框架按其客户端模块规则接入。
- Tree Shaking 的验收应检查最小消费入口是否带入无关组件与依赖，并记录构建条件；CSS 当前采用整包入口，不承诺逐组件 CSS 剔除。

现状：使用保留模块的 ESM 输出，公开入口保持不变，每个 JS 模块保留客户端边界。`pnpm verify:package` 对真实 tarball 的 Button-only 与 EmptyState-only 产物检查渲染模块、导出及无关 JS；同时检查整包和消费者 JS/CSS 的 raw/gzip 固定预算。预算见 `scripts/package-budgets.json`，按实测加 15% 余量并向上取整 KiB；不能在运行时自动增加，CI 禁止诊断模式跳过预算。CSS 仍为整套交付。详细方法见 [质量门禁](../quality-gates.md)。

## 7. 单元测试、交互测试、E2E 测试

| 层次 | 工具与入口 | 验证重点 |
|---|---|---|
| 单元与组件交互 | Vitest、Testing Library；`pnpm test` / `pnpm test:coverage` | 可观察行为、回调、受控与非受控、键盘、错误与异步生命周期 |
| 类型与发布契约 | `pnpm typecheck`、`pnpm verify:package` | 公开导出、声明、依赖 external、真实 tarball 安装与生产构建 |
| 完整页面 E2E | Playwright；`pnpm verify:workbench` | 查询、分页、空态、校验、取消、保存后重开、上传异常与焦点 |
| 视觉与可访问性 | `pnpm verify:foundation`、Storybook、实际页面截图与人工复核 | 信息层级、所有适用状态、桌面与窄屏、主题、溢出和可读性 |

测试应验证用户行为与真实边界，避免只重复实现细节。修复行为缺陷时，优先用回归用例复现；纯文档或低影响样式改动不增加镜像实现的测试。

完整消费页面必须安装真实 tarball，不能由源码 alias 代替。当前浏览器配置覆盖 Chromium、Firefox、WebKit 和 390px Chromium 触屏模拟；WebKit 不代表实体 Safari 或 iOS 验收。

现有覆盖率门槛、统计范围与报告位置以 [质量门禁](../quality-gates.md) 为准。静态引用面、执行覆盖率、自动可访问性扫描和人工验收各有边界，不能相互替代。Dark 已运行完整消费页面的三浏览器及触屏模拟回归；实际范围与视觉复核见 [主题实施验收](../reviews/2026-10-30-dark-theme.md)，不据此推断实体设备或所有业务宿主已验收。

## 8. CI 质量门禁

- `check` 包含类型、零警告 ESLint、工具自身的行为测试、引用面、执行覆盖率、库与 Storybook 构建、打包消费检查。
- `browser` 运行文档浏览器检查、生产打包消费页面的跨浏览器回归及双主题组件状态扫描，保留截图、trace 和报告；禁止 `.only`，CI 将重试后才通过的 flaky 用例判为失败。
- 工作流支持 PR、main push 和 merge group。不得调低门槛、删除功能或排除失败源码来绕过检查。
- 远端 main 应要求 `check` 与 `browser` 成功，并基于最新目标分支验证；需在工作流可产生对应检查后配置远端约束。

现状：2026-10-30 已通过 `pnpm verify:protection` 只读核实远端有效 Ruleset：check/browser 均必需且要求最新分支。脚本支持环境 Token 或已登录的 GitHub CLI，不导出凭据。远端 main 的已发布检查与本地未提交改动分别记录，远端成功不能代替当前改动验证。具体 revision 与证据见 [收尾验收](../reviews/2026-10-30-foundation-completion.md)。

## 9. Changesets 版本管理和 npm 发布规范

- `@oxygen-design/ui` 与 `@oxygen-design/patterns` 独立版本管理；Storybook 不发布。
- 对外可感知的库变更应提供 changeset：兼容修复用 patch，兼容的新公开功能用 minor，破坏性 API 变更用 major。此为项目约定，不能借 `0.x` 静默破坏已有接口。
- 导出、类型、默认行为、样式契约和 Token 变动都应评估兼容性；必要时提供迁移说明，并检查 patterns 对 UI 的 peer 范围。
- `pnpm verify:release` 在临时副本预演全部 workspace 的实际升级计划并核对结果，不改变工作区版本；旧 `verify:initial-release` 兼容转发。
- 版本 PR 更新版本和 changelog；当前 Release 工作流在 main push 后运行验证，再通过 Changesets 创建版本 PR 或发布。真实发布需要用户明确授权及已配置的发布身份。
- 软件包以 public 权限发布到 npm；优先采用 Trusted Publishing，其他凭据在仓库之外配置，不写入源码、日志或聊天。
- 发布前检查类型、测试、构建、真实打包消费和受影响的页面流程。发布后核对 registry 版本、产物与独立安装结果，不以工作流配置存在作为发布成功证据。

现状：2026-10-30 已核实两个 npm 包 latest 均为 0.1.1，MIT 授权、tarball 完整性及入口有效，当前 npm 身份具有两个包的 read-write 权限。用户已明确批准沿用现有 MIT；仓库及两个包的 LICENSE 与 metadata 已对齐，打包校验会拒绝不一致。源码仓库当前实际公开，文档站是否部署另行记录。OIDC 控制台授权不能由本地 token 有无推断；发布流程与剩余外部边界见 [收尾验收](../reviews/2026-10-30-foundation-completion.md)。本次不发布新版本。

## 交付检查与现存差异

开发交付应说明修改文件、用户可见行为、公共契约影响、执行检查及未覆盖范围；检查最终 diff，保留无关改动，不自动提交、推送或部署。

| 差异 | 处理要求 |
|---|---|
| Dark 已实现并完成本地消费回归 | 按主题接入文档使用；实体设备、人工辅助技术和下游业务宿主分别验收 |
| 字体/动效、模块裁剪与体积预算 | 已实现；按实际报告与固定门槛回归 |
| 远端合并约束与 npm 身份 | 已只读核实；后续状态变化需重新核查，未来发布仍需授权 |
| MIT 授权 | 已按用户选择统一；检查 tarball 中的声明与完整 LICENSE |
| ColorPicker ARIA 规则例外 | 已移除；真实编辑输入承载校验，按钮保留描述与焦点行为 |
| 全组件状态、实体设备与人工读屏 | 参照[状态矩阵](component-state-matrix.md)与[人工验收清单](manual-accessibility-checklist.md)，未执行的项目不能标通过 |
