# 质量门禁

## 本地命令

环境要求 Node >=22.22.2、pnpm 11.9.0。

工作区固定 `enableGlobalVirtualStore: false`，使本地与 CI 使用同一依赖布局，避免 pnpm 因两种环境默认值不同而在执行脚本前尝试重装依赖。

```bash
pnpm lint
pnpm test:tooling
pnpm test:surface
pnpm test:coverage
pnpm verify
pnpm verify:package
pnpm verify:workbench
pnpm verify:foundation
pnpm verify:release
```

`pnpm verify` 包含类型检查、ESLint、门禁自身的行为测试、组件引用面检查、带覆盖率的全部单测、软件包构建和 Storybook 构建。覆盖率执行已经运行全部单测，不再重复执行 `pnpm test`。

patterns 的开发类型检查通过 tsconfig paths 读取 UI 源码，确保干净检出时不依赖尚未生成的 `dist`；声明构建使用单独的 `tsconfig.build.json` 清除开发映射，维持发布入口和 UI peer 引用。独立 tarball 消费验证继续读取真实发布入口，不使用开发映射。门禁测试会在没有 dist 的临时目录中复现该开发检查。

## 真实产物、Tree Shaking 与体积预算

`verify:package` 构建并打包两个库，将 tarball 安装到独立消费者，验证公开入口、声明、CSS、每个模块的客户端边界及 MIT LICENSE。Button-only、EmptyState-only 使用生产构建，记录渲染模块及导出，并拒绝无关组件、Radix 复杂控件、日期/二维码等依赖残留。最小消费者包含 ReactDOM 运行时；CSS 使用完整包入口，不宣称逐组件样式裁剪。

`scripts/package-budgets.json` 固定 JS/CSS raw 与 gzip 上限，按实测值增加 15% 余量并向上取整 KiB。gzip 使用 level 9，对每个产物压缩后求和；source map 不计。缺失类别、非法值、超限、导出缺失或无关 JS 均返回非零。不得在运行时自动抬高预算；修改阈值应附产物变化原因和新测量。

`output/package-budgets/ui.json`、`patterns.json` 保存实际数值和模块证据，CI 保留 14 天。`OXYGEN_PACKAGE_MEASURE_ONLY=1` 仅供本地测量，CI 设置该开关会失败。门禁自身测试覆盖 raw/gzip 超限、缺项、无关模块/JS、CI 绕过和许可证不一致的拒绝路径。

## 执行覆盖率

UI 和 patterns 独立使用与 Vitest 同版本的 V8 provider。统计范围是各包 `src/**/*.{ts,tsx}`，包含从未被测试导入的源文件；只排除声明文件和由包契约测试负责的导出入口 `src/index.ts`。patterns 报告只统计自身源码，避免基础 UI 的执行量掩盖模式包的覆盖情况。

| 包 | 语句门槛 | 分支门槛 | 函数门槛 | 行门槛 |
|---|---:|---:|---:|---:|
| UI | 90% | 82% | 90% | 93% |
| patterns | 100% | 77% | 100% | 100% |

门槛来自当前实测基线的保守取整，没有把未覆盖代码移出统计以提高数字。新增逻辑应有行为测试；覆盖率高不代表所有业务组合正确。调低门槛必须说明原因，不作为修复失败的默认方法。

HTML、LCOV 和 JSON summary 位于 `output/coverage/ui/`、`output/coverage/patterns/`，CI 保留 14 天。`test:surface` 保留原有静态“组件名称在测试中被引用”检查，不表示代码执行覆盖率。

`test:tooling` 会临时创建一个从未导入的源码探针，确认其执行覆盖为零、门槛失败返回非零；探针和独立报告会在 finally 中清理。不要同时在同一个 checkout 执行多次该命令和发布打包。

## 静态规则与已知边界

ESLint 覆盖 UI/patterns 源码、单测、浏览器/消费页面代码和仓库脚本，检查 TypeScript 常见错误、Hooks 调用及依赖、未处理 Promise 和 JSX 无障碍规则；警告也导致命令失败。类型感知规则用于已纳入 TypeScript 项目的库源码、单测和浏览器测试，独立临时安装的 workbench 由消费验证负责类型检查。

使用 ESLint 9 是因为当前安装的 `eslint-plugin-jsx-a11y` 声明支持到 ESLint 9；不忽略 peer 冲突强行升级到 10。升级需同步验证插件兼容性及规则行为测试。

规则例外保持可审查且有限：

- Combobox 候选项由输入框的键盘处理和 `aria-activedescendant` 管理焦点，局部注释解释为什么不为每个 option 增加独立 Tab 停靠点。
- 允许有名称的滚动 region 获得键盘焦点，并让 label 规则识别共享 Checkbox 控件。

ColorPicker 不再豁免 `role-supports-aria-props`。button 保留 ref/id/Field 标签及可访问描述，required/invalid 由真实文本输入表达；描述与外部/草稿错误分别验证，禁止通过虚构 role 消除 lint 错误。人工播报仍需按[辅助技术清单](foundations/manual-accessibility-checklist.md)执行。

门禁行为测试会确认条件 Hook、遗漏依赖、悬空 Promise、缺少图片替代文本、显式 any 及原始 HTML 注入都产生错误，且公开的 `pnpm lint` 命令返回非零；注释与字符串不会被当成可执行违规代码。

## CI 和浏览器

工作流保留稳定的 `check` 与 `browser` job 名称，支持 pull_request、main push 和 merge_group。`check` 执行真实覆盖率及打包校验，`browser` 安装锁定版本的三种浏览器并验证生产构建的独立消费页面。截图、trace 和 HTML 报告由 CI 保留 14 天。CI 禁止 `.only`，并将重试后才通过的 flaky 用例视为失败。

浏览器范围及模拟上传约定见 [完整页面消费验收](consumer-workbench.md)。可通过 `OXYGEN_WORKBENCH_PORT` 指定其他预览端口，避免多个本地验证进程互相干扰。

## 全组件状态自动检查

先运行 `pnpm storybook:build`，再运行 `pnpm verify:foundation`；后者检查 67 个文档组件、107 个具名状态与构建路由的映射，并对 174 个示例分别在 Light/Dark 执行浏览器检查。复合组件与 Icons 等独立文档页导致文档组件数不同于状态矩阵的 60 个源码组件文件 + 4 个 Patterns，两者不混用。

范围为实际组件预览与可见 portal；适用组件还执行展开/打开，再扫描浮层。检查运行时/控制台/本地资源错误、页面溢出，以及 axe WCAG 2 A/AA、2.1 A/AA 自动规则。不会扫描 Storybook 管理工具栏和示例代码；规则没有整类禁用。每项保存阶段、作用域、原始 violations 与 incomplete；incomplete 进入 `manual-review-required` 队列，不代表确定违规，也不能算人工验收通过。确定违规、运行异常及溢出使 CI 失败。已核实的工具限制仅允许精确节点级复核（见下文），不关闭规则。代表组件留存双主题截图，失败保留截图与 trace。报告位于 `output/playwright/foundation/`，CI 保留 14 天，可用 `OXYGEN_FOUNDATION_PORT` 指定端口。

对已核实的 Radix NavigationMenu 空焦点代理（React 委托焦点转发不被 axe 原生 onfocus 启发式识别），每例断言 Tab/Shift+Tab 落在可见目标后，仅精确 1px 空代理节点保留 `reviewedToolFindings`；对 Tree，仅自身行文字与自身标签一致、具有独立子 group 的展开父 treeitem 复核 axe 将子节点文字算入父标签的限制，并验证父子方向键。两者保留原始发现、理由及 `manual-review-required` 状态，其他节点/规则照常失败，不能将组件或整条规则排除。树嵌套结构依据 [W3C APG Tree View](https://www.w3.org/WAI/ARIA/apg/patterns/treeview/)。modal 打开时检查实际浮层内容，初始时检查完整预览；背景焦点约束另由键盘回归负责。有限入场动画结束后再测量最终颜色，扫描实例与 Storybook 自带 axe 隔离。

自动规则不涵盖全部可访问性要求，也不代替 H/A/F 视觉、真实读屏器、原生系统控件及实体设备验收。逐组件适用性和现有行为断言见[状态矩阵](foundations/component-state-matrix.md)，实际人工任务与记录模板见[验收清单](foundations/manual-accessibility-checklist.md)。本轮执行结果以[收尾报告](reviews/2026-10-30-foundation-completion.md)为准。

## 版本预演

`pnpm verify:release` 只读发现全部 workspace 清单，并将实际 Changesets release plan 写入临时目录。版本更新与 changelog 生成仅在清单及 changeset 的临时副本中执行，逐包核对计划版本并报告内部依赖/peer 更新；不改工作区版本、锁文件、changelog 或 Git。无发布计划且无待补发布变更时返回空计划；相对 main 有需发布改动却缺少 changeset 时，保留 Changesets 原生报错。旧 `verify:initial-release` 保留兼容别名，已移除漏掉 Patterns 和写死初始版本号的旧逻辑。脚本需要真实仓库 Git base ref；main 发布候选工作流具备此条件。

## 发布运行环境

Release 在 Changesets 发布前执行 `pnpm verify && pnpm verify:package && pnpm verify:release`。CI 固定 Node 22.22.2，并显式安装 npm 11.5.1，以满足 [npm Trusted Publishing](https://docs.npmjs.com/trusted-publishers/) 的 npm >=11.5.1 / Node >=22.14.0 要求。仅设置 `id-token: write` 不能证明 npm 控制台已经建立对应信任关系；本地 npm 身份、已发布 provenance 元数据和未来 OIDC 授权分别核验。本次不升级开发机全局 npm，不执行发布。

## 远端合并约束

工作流文件存在不代表已经禁止合并失败的 PR。需要仓库管理员在 GitHub 中为 main 启用规则：

- 必须通过 `check` 和 `browser` 两个状态检查。
- 必须基于最新目标分支验证。
- 新增的质量检查规则不设置 bypass actor。

可审查的增量 Ruleset 配置位于 [quality-checks.json](../.github/rulesets/quality-checks.json)。这份配置只增加质量检查要求，不替换现有 review、签名、推送限制等规则。应用前需先检查是否已存在同名规则，避免重复；状态名称应以当前工作流实际成功运行后 GitHub 显示的名称为准。

在已授权且具备仓库管理权限的 GitHub 环境中应用该配置。配置尚未提交/推送时，不应开启一个当前默认分支永远无法产生的必需检查。

```bash
pnpm verify:protection
```

核查脚本优先使用当前环境中的 `GH_TOKEN` 或 `GITHUB_TOKEN`；未配置时通过已登录的 `gh api` 读取，凭据留在 CLI/keyring 内，不导出或打印。它先验证仓库可访问，再汇总经典 branch protection 和有效 Ruleset 的状态检查；缺少检查、未要求最新分支、API 访问失败或没有凭据均返回失败。该命令只读取远端，不创建或覆盖规则，也不放入不具备管理员凭据的 PR CI。

2026-10-30 已通过现有 gh 登录态读取远端：main 的有效 Ruleset 要求 check/browser 且 strict=true，`pnpm verify:protection` 通过。本次未修改远端规则。核查针对当时远端 revision；当前未提交修改仍需自身本地及后续远端验证。详见[Foundation 收尾记录](reviews/2026-10-30-foundation-completion.md)。
