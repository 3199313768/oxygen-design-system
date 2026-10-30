# 质量门禁落地结果

日期：2026-10-30。前四项已完成本地实现及验证；第五项的规则与只读核查脚本已备好，远端尚未应用。所有变更保留在工作区，未提交、推送或发布。

## 变更范围

| 项目 | 主要文件 | 结果 |
|---|---|---|
| 执行覆盖率 | 两个包的 `vitest.config.ts`、`package.json`，根脚本及锁文件 | V8 全源码统计，独立门槛、HTML/LCOV/JSON 报告，包含未导入文件 |
| 语义 lint | `eslint.config.mjs`、`scripts/quality-gate.mjs`、`tests/tooling/` | TypeScript、Hooks、Promise、无障碍及原始 HTML 注入规则；错误必须阻断命令 |
| 行为回归 | `packages/ui/tests/upload-lifecycle.test.tsx`、`Upload.tsx` | 增加四个上传生命周期用例；修复卸载后验证/移除 Promise 拒绝仍回调 onError 的问题 |
| 本地与 CI | `.github/workflows/check.yml`、`playwright.config.ts`、`tests/browser/runtime.spec.ts`、`pnpm-workspace.yaml` | 在已有完整页面消费测试上增加运行时错误与键盘验证、稳定 job 名、覆盖率产物及 flaky 阻断；统一依赖布局 |
| 合并约束 | `.github/rulesets/quality-checks.json`、`scripts/verify-merge-gate.mjs` | 准备 main 的 check/browser 必需检查、最新分支策略及只读核查；远端待配置 |

Hooks/lint 的必要修复涉及 InputNumber、Transfer、TreeSelect、Upload；显式传递 children 的修复涉及 Alert、Card、Typography。Combobox 保留输入框管理键盘焦点的模式，并解释局部规则例外。

patterns 的开发 `tsconfig.json` 映射 UI 源码以支持无 dist 的新检出目录；`tsconfig.build.json` 和 `vite.config.ts` 保持声明构建读取 UI 发布类型，避免开发映射泄漏到 tarball。新增临时目录测试验证前者，原有独立消费验证覆盖后者。

主线程已有的独立消费页面、服务脚本和完整流程测试得到保留和复用，未重做这些实现。

## 验证证据

- 普通 `pnpm verify`：成功退出。三项目类型检查、零警告 ESLint、15 项门禁测试、60 个组件的静态引用面检查、231 项单测、两个库构建和 Storybook 构建均通过。
- `pnpm verify:package`：两个 tarball 在临时消费项目中完成独立安装、类型检查和生产构建；发布声明入口正常，patterns 保留 `@oxygen-design/ui` peer 类型引用。
- `CI=true OXYGEN_WORKBENCH_PORT=4184 pnpm verify:workbench`：36 项测试通过，覆盖 Chromium、Firefox、WebKit 和移动视口 Chromium。验证包含生产页面、真实打包消费入口、保存后重开、上传异常及键盘焦点。
- 覆盖率负例确认未导入源码得到零执行统计，达不到门槛返回非零；临时探针已清理。
- `pnpm verify:protection`：按预期失败，明确提示没有 GH_TOKEN/GITHUB_TOKEN；没有将此结果算作远端门禁通过。
- `git diff --check`：通过。

| 包 | 语句 | 分支 | 函数 | 行 |
|---|---:|---:|---:|---:|
| UI | 90.87% | 82.59% | 90.76% | 93.53% |
| patterns | 100% | 77.27% | 100% | 100% |

可重看证据：`output/coverage/` 与 `output/playwright/quality-ci/`。完整命令及门槛说明见 `docs/quality-gates.md`。

## 未覆盖与后续条件

- 当前没有可用的 GitHub 管理连接，远端 protection/Ruleset 无法核实且尚未应用。需先让工作流在默认分支产生检查，再在已授权环境应用增量规则并执行只读复查，避免要求一个默认分支尚不能产生的检查。
- 远端 GitHub Actions 未运行；本地为 Node 23.11.0，CI 配置为 Node 22.22.2。真实移动设备、真实 Safari 和辅助技术用户测试未执行。
- ColorPicker 的 `role-supports-aria-props` 存在明确记录的局部例外，保留现有 Field 按钮契约；需要单独的角色语义和兼容性迁移。lint 通过不等于完整无障碍验收。
- Storybook/消费构建仍有现存 chunk 大小等构建警告，未通过调高限制掩盖。
