# Oxygen 下一步工作实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 完成 Oxygen 设计系统的本地质量验证、中文文档校正、首次发布准备检查，并识别组件质量的下一步工作。

**Architecture:** 先运行仓库已有的聚合验证脚本，建立当前质量基线；再根据实际 manifest、脚本和组件目录修正文档；最后运行首次发布检查，并基于现有测试与 Storybook 内容做范围审查。除 README 和本计划文件外，不扩大修改范围；不会执行发布、推送或提交。

**Tech Stack:** pnpm 11.9.0、TypeScript、Vitest、Vite、Storybook、Changesets。

## Global Constraints

- 保留用户已有的 README 修改和其他未提交改动。
- 不执行 `pnpm release`、npm 发布、Git push 或提交。
- 不修改公共组件实现，除非验证发现明确的、可独立复现的缺陷。
- 所有完成状态必须由本轮新运行的命令或 diff 检查证明。

---

### Task 1: 建立本地质量基线

**Files:**
- Read: `package.json`
- Read: `packages/ui/package.json`

- [x] **Step 1: 安装锁定依赖**

Run: `pnpm install --frozen-lockfile`

- [x] **Step 2: 运行完整验证**

Run: `pnpm verify`

Expected: typecheck、test、build 和 Storybook 静态构建均返回退出码 0。

- [x] **Step 3: 验证实际软件包内容**

Run: `pnpm verify:package`

Expected: 软件包 tarball 校验返回退出码 0；若 consumer 安装受外部 registry 阻塞，记录阻塞位置，不修改包内容校验逻辑。

### Task 2: 校正文档并补充可执行入口

**Files:**
- Modify: `README.md`

- [x] **Step 1: 对照实际 manifest 和目录检查文档漂移**

核对版本、可用脚本、组件目录和 Storybook 入口，保留包名、命令和代码示例原样。

- [x] **Step 2: 更新中文 README**

修正已过期的版本描述，并补充当前组件范围、Storybook 启动方式和验证命令；不添加未经仓库事实支持的发布承诺。

- [x] **Step 3: 检查 Markdown 和 diff**

Run: `git diff --check && git diff -- README.md`

Expected: 无空白错误，diff 仅包含本次文档范围内的修改。

### Task 3: 检查首次发布准备

**Files:**
- Read: `.changeset/config.json`
- Read: `scripts/verify-initial-release.mjs`
- Read: `packages/ui/package.json`

- [x] **Step 1: 运行首次发布校验**

Run: `pnpm verify:initial-release`

Expected: 校验脚本确认初始 changeset 产出 `@oxygen-design/ui@0.1.0`；若仓库已完成初始发布且没有未发布 changeset，记录脚本与当前阶段不匹配。

- [x] **Step 2: 记录发布前未覆盖的外部条件**

只报告仓库内可验证的配置；npm 组织、Trusted Publishing、凭据和实际发布状态不在本地检查中臆测。

### Task 4: 审查组件质量下一步

**Files:**
- Read: `packages/ui/tests/*.test.tsx`
- Read: `apps/storybook/stories/*.stories.tsx`
- Read: `packages/ui/src/components/*.tsx`

- [x] **Step 1: 统计现有测试和 Storybook 覆盖范围**

区分静态渲染、交互行为、公共包契约和 Storybook 展示覆盖。

- [x] **Step 2: 只在发现明确缺口时提出最小后续修改**

若没有可复现缺陷，则输出建议清单，不为了“增强质量”而无依据修改组件实现。

- [x] **Step 3: 汇总全部验证证据和残余风险**

分别报告通过项、失败项、未运行的外部发布条件和建议的后续工作。

## 执行记录

- Node `22.14.0` 无法启动 Vitest，因为 `undici@8.12.3` 使用了该版本尚未提供的 `createZstdDecompress`。
- 使用本机 Node `23.11.0` 后，类型检查、17 个测试、组件构建和 Storybook 构建均通过。
- `verify:package` 已生成并检查 `@oxygen-design/ui@0.1.0` tarball，但 consumer 依赖安装受 npm registry DNS `ENOTFOUND` 阻塞。
- `verify:initial-release` 因没有未发布 changeset 退出；当前仓库已处于 `0.1.0` 发布后的状态。
