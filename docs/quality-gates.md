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
```

`pnpm verify` 包含类型检查、ESLint、门禁自身的行为测试、组件引用面检查、带覆盖率的全部单测、软件包构建和 Storybook 构建。覆盖率执行已经运行全部单测，不再重复执行 `pnpm test`。

patterns 的开发类型检查通过 tsconfig paths 读取 UI 源码，确保干净检出时不依赖尚未生成的 `dist`；声明构建使用单独的 `tsconfig.build.json` 清除开发映射，维持发布入口和 UI peer 引用。独立 tarball 消费验证继续读取真实发布入口，不使用开发映射。门禁测试会在没有 dist 的临时目录中复现该开发检查。

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
- ColorPicker 现有 Field 按钮保留 `aria-invalid`/`aria-required` 契约，该文件暂不应用 `role-supports-aria-props`。这是已知的语义债务，后续需要针对颜色值控件角色、读屏器行为及消费方兼容性单独迁移；不将 lint 通过表述为完整无障碍验收。

门禁行为测试会确认条件 Hook、遗漏依赖、悬空 Promise、缺少图片替代文本、显式 any 及原始 HTML 注入都产生错误，且公开的 `pnpm lint` 命令返回非零；注释与字符串不会被当成可执行违规代码。

## CI 和浏览器

工作流保留稳定的 `check` 与 `browser` job 名称，支持 pull_request、main push 和 merge_group。`check` 执行真实覆盖率及打包校验，`browser` 安装锁定版本的三种浏览器并验证生产构建的独立消费页面。截图、trace 和 HTML 报告由 CI 保留 14 天。CI 禁止 `.only`，并将重试后才通过的 flaky 用例视为失败。

浏览器范围及模拟上传约定见 [完整页面消费验收](consumer-workbench.md)。可通过 `OXYGEN_WORKBENCH_PORT` 指定其他预览端口，避免多个本地验证进程互相干扰。

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

核查脚本使用当前环境中的 `GH_TOKEN` 或 `GITHUB_TOKEN`，不会打印凭据。它先验证仓库可访问，再汇总经典 branch protection 和有效 Ruleset 的状态检查；缺少检查、未要求最新分支、API 访问失败或没有凭据均返回失败。该命令只读取远端，不创建或覆盖规则，也不放入不具备管理员凭据的 PR CI。

当前环境没有配置可用的 GitHub 管理连接或上述凭据，因此远端状态仍为**无法核实，尚未应用**。需在已授权环境完成配置和复查，才能将“合并约束”标记完成。不要把凭据写入仓库或聊天。
