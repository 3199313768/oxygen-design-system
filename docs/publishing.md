# 公开发布指南

Oxygen 使用 MIT 许可证，GitHub 仓库和两个 npm 包公开。根 workspace、Storybook 和
测试项目不发布到 npm。使用 GitHub Free、公开 npm 包和标准 `ubuntu-latest` runner，
不需要为这条发布链路购买订阅。

## 一次性 GitHub 设置

1. 确认所有贡献的代码可按 MIT 发布，并检查完整 Git 历史中的凭据、内部资料与第三方署名。
   当前本地历史的定向凭据扫描未发现匹配项；定向扫描不能替代贡献来源核查。
2. 使用有仓库管理员权限的账号运行 `gh auth login`。浏览器登录与 Git SSH 权限都不能
   代替 GitHub API 授权；不要把密码或 Token 发到聊天或提交进仓库。
3. 推送并合并本次许可证和发布配置改动，通过 `check`、`browser` 两个必需检查。
4. 将 `3199313768/oxygen-design-system` 设为公开，并读取实际结果：

   ```bash
   gh repo edit 3199313768/oxygen-design-system --visibility public --accept-visibility-change-consequences
   gh api repos/3199313768/oxygen-design-system --jq '.visibility'
   ```

5. 核实 `main` 的规则仍启用，并要求最新提交通过 `check` 和 `browser`。
   保留 Actions 默认只读和审查权限设置。版本 PR 由维护者账号创建；发布 job 仅申请
   推送版本 tag 所需的 `contents: write` 和 npm OIDC 所需的 `id-token: write`。

仓库公开会使 Git 历史可见。npm 包也包含构建后的 JavaScript、类型、CSS 和携带源码内容的
sourcemap。MIT 允许在保留许可证声明的条件下使用、修改和商业分发。

## 一次性 npm 设置

确认 npm 账号具有 `oxygen-design` scope 的包发布及设置权限；选择公开包，不开通付费
私有包套餐。分别打开以下两个包的 Settings → Trusted publishing，选择 GitHub Actions：

| 字段 | 值 |
| --- | --- |
| npm 包 | `@oxygen-design/ui`、`@oxygen-design/patterns`，各配置一次 |
| Organization or user | `3199313768` |
| Repository | `oxygen-design-system` |
| Workflow filename | `release.yml` |
| Environment name | 留空，当前工作流没有 GitHub Environment |

只有实际生成发布凭据的工作流文件需要匹配，不能填写 `check.yml`。仓库与 npm 包都应公开，
包清单的 `repository` URL 必须与 GitHub 仓库一致，以支持 provenance 验证。

### 尚未存在的包

2026-10-30 核实公开注册表：`@oxygen-design/ui@0.1.0` 已存在且标为 `UNLICENSED`，
不得覆盖它；MIT 许可信息通过后续新版本发布。`@oxygen-design/patterns` 的匿名查询返回
404，需管理员确认它是否尚未创建，或是否为受限包。

先检查 npm 后台是否允许为包直接配置 Trusted Publisher。如果后台要求包先存在，由维护者
通过浏览器登录 npm 并完成一次交互式首发，然后立即为两个包配置上述 Trusted Publisher。
此操作不需要创建长期发布 Token，也不把个人登录信息提供给 CI。

先合并本次带 MIT 的配置 PR，暂不合并后续的 Changesets 版本 PR。在这个 main 检出中执行：

```bash
npm login --registry=https://registry.npmjs.org/
pnpm install --frozen-lockfile
pnpm verify
pnpm verify:package
pnpm build
oxygen_bootstrap_dir="$(mktemp -d)"
pnpm --dir packages/ui pack --pack-destination "$oxygen_bootstrap_dir"
pnpm --dir packages/patterns pack --pack-destination "$oxygen_bootstrap_dir"
```

仅对 npm 上尚不存在的对应版本执行以下命令。当前 UI 的 `0.1.0` 已存在，因此跳过其
发布命令；如果管理员确认 patterns 尚未创建，可先发布带 MIT 的 patterns `0.1.0`，
它引用已经存在的 UI peer。若 npm 要求二次验证，由维护者在本地完成。交互式本地首发
不生成 Actions provenance；后续工作流发布统一要求 OIDC 和 provenance。

```bash
npm publish "$oxygen_bootstrap_dir"/oxygen-design-ui-*.tgz --access public --ignore-scripts --provenance=false
npm publish "$oxygen_bootstrap_dir"/oxygen-design-patterns-*.tgz --access public --ignore-scripts --provenance=false
```

如果版本已经存在，不能覆盖或为迁移而删除它；通过新的 changeset 发布后续版本。
两个包均存在并配置好 Trusted Publisher 后，再合并版本 PR，用同一次 Release 为两个包
发布新的 MIT 版本。新建 Trusted Publisher 需要在 npm 要求的验证时限内完成首次成功
发布；当前官方说明的期限是两天，过期需重新创建。保存后台配置本身不会验证权限。
验证成功后，按 npm 的建议启用 “Require two-factor authentication and disallow tokens”。

## 日常发布

1. 改动附带 changeset，并通过 PR 的 `check`、`browser`。
2. 合入 `main` 后，Release 工作流发现未处理的 changeset，会在 summary 提示维护者创建
   版本 PR，并跳过发布。维护者从最新 main 创建 `codex/release-versions` 分支，运行
   `pnpm changeset version`，提交生成的版本号、changelog 和 changeset 删除，再用自己的
   GitHub 账号推送分支及创建 PR。工作流不创建或批准 PR。
3. 维护者创建的版本 PR 正常触发 `check`、`browser`。必要时可在 Actions → Check →
   Run workflow 中选择版本 PR 的分支重试。若 main 又有变更，先更新版本分支，再重新检查。
4. 合并检查通过的版本 PR，Release 使用 npm 11.5.1 的 OIDC 支持发布对应版本。
   Changesets 负责发布计划、依赖顺序及 tarball；发布脚本校验每个归档的 SHA-256，再逐个
   调用 npm CLI。某次发布失败即停止，不继续发布其后依赖包；全部成功后创建 Git tag。
5. 在 npm 后台核对版本、MIT 许可证和 provenance。需要重试时，在 Actions → Release →
   Run workflow 选择 `main`；已经发布的版本由 Changesets 计划跳过。

工作流不引用 `NPM_TOKEN` 或 `NODE_AUTH_TOKEN`。OIDC 由 job 的 `id-token: write` 和 npm
后台的 Trusted Publisher 配置共同授权；仅添加工作流权限不会自动配置 npm。
确认 OIDC 真正发布成功后，再撤销不再使用的旧发布 Token。

## 本地演练与验证边界

`pnpm verify:package` 验证实际 tarball 的安装及消费能力。若已有 Changesets pack 计划，
还可以演练 npm 对同一归档的处理，不向注册表发布：

```bash
pnpm build
pnpm changeset pack --out-dir output/release
node scripts/publish-npm.mjs output/release/publish-plan.json --dry-run
```

Changesets 生成计划时仍需读取 npm 注册表。离线环境只能验证手工生成的本地计划与 tarball，
不能验证远端版本是否存在。dry run 不请求 OIDC，不生成 provenance，也不证明账号权限、
后台配置或真实发布已经成功。

参考：[npm Trusted Publishing](https://docs.npmjs.com/trusted-publishers/)、
[npm provenance](https://docs.npmjs.com/generating-provenance-statements/)、
[GitHub Actions 事件触发限制](https://docs.github.com/en/actions/how-tos/writing-workflows/choosing-when-your-workflow-runs/triggering-a-workflow)。
