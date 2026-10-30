# Foundation 未完成项收尾验收

日期：2026-10-30。范围为 Engineering Foundation / Design Foundation 上轮列出的缺口。保留同期组件文档改动；未执行提交、推送、发布、部署、仓库可见性或远端规则修改。

## 本轮实现

| 缺口 | 实施与证据 |
|---|---|
| 字体角色 | 正文默认继承宿主，支持作用域 `--oxygen-font-family-body` 覆盖，系统/等宽字体角色独立；不加载外部字体。既有字号、行高、圆角与尺寸沿用 |
| 动效角色 | 交互、退出、面板、旋转、脉冲及对应缓动统一为 Token；兼容原有 scoped fast/base 覆盖。Progress 等非必要过渡响应 reduced-motion，内容与功能保留 |
| ColorPicker ARIA 例外 | 删除整文件豁免；真实文本输入表达 required/invalid，按钮保留 id/ref/标签与持续描述；外部错误、草稿错误和 false 覆盖分别处理。确认才提交，取消/Escape 不提交并返回焦点 |
| 单组件裁剪 | 实测旧单入口保留无关组件与复杂交互依赖，改为保留模块的 ESM 输出并保留每个模块的客户端指令；公开入口不变 |
| 体积预算 | 两个真实 tarball、Button-only / EmptyState-only 生产消费者检查模块/导出及 JS 标记，固定 raw/gzip JS/CSS 预算，CI 禁止测量模式绕过，报告保留 14 天 |
| Changesets 预演 | 通用临时副本预演代替漏掉 Patterns、写死 0.1.0 的历史脚本；兼容旧命令，纳入 Release 候选门禁，工作区版本不变 |
| MIT | 用户明确批准沿用已发布 MIT。根目录、UI、Patterns 含同一完整 LICENSE，两个 manifest 声明 MIT；打包检查拒绝缺失或不一致 |
| 状态与人工验收 | [64 行源组件/Patterns 矩阵](../foundations/component-state-matrix.md)关联实际测试断言与具名 Story；另有 67 个文档组件、174 个示例的双主题自动检查。人工读屏/实体设备见[执行清单](../foundations/manual-accessibility-checklist.md) |
| 远端证据 | 已登录 gh 只读核实有效 Ruleset 与当前远端检查；只读核实 npm 身份、已发布版本与产物；凭据未导出。后续 CI 发布环境补齐 npm Trusted Publishing CLI 最低版本 |

全状态扫描追加发现并修复：Slider、Transfer、Calendar/DateRangePicker 的具名容器采用非交互 group 承载标签；ColorPicker 按钮名称包含可见已确认色值；跨月可选日期保留语义弱化但不再整体透明。相关变更有回归用例，尺寸与操作契约保留。

扫描等待有限入场动画结束，避免把淡入中间态误当最终对比度；modal 打开时检查活动浮层；扫描器与 Storybook 自带 axe 实例隔离。原始结果完整保留，incomplete 列人工复核，不作为确定违规。两类精确工具限制（Radix 1px 空焦点代理、Tree 展开父节点的子组文字归属）经源码与实际键盘操作确认，仅符合形态及行为断言的节点记录 reviewedToolFindings，仍列人工验收队列；其他违规使 CI 失败，不整类关闭规则。具体限制、范围和 [W3C 树模式](https://www.w3.org/WAI/ARIA/apg/patterns/treeview/)依据见[质量门禁](../quality-gates.md)。

## 生产产物测量

字节数，JS/CSS 分别统计 raw 与 gzip level 9；多个文件压缩后求和，不计 source map。消费者包含 ReactDOM，CSS 为完整入口，不承诺逐组件 CSS 剔除。预算按实测 +15% 向上取整 KiB 固定在 `scripts/package-budgets.json`，不能自动增加。

| 产物 | JS raw / gzip | CSS raw / gzip |
|---|---:|---:|
| UI 包 | 135457 / 55173 | 100606 / 14172 |
| Button-only 消费 | 253362 / 78457 | 99507 / 13669 |
| Patterns 包 | 4509 / 1930 | 3778 / 863 |
| EmptyState-only 消费 | 220544 / 68165 | 103253 / 14146 |

旧 Button-only JS 为 505123 / 153221，修复后为 253362 / 78457，且模块证据确认无关组件已被剔除。当前详细报告位于 `output/package-budgets/{ui,patterns}.json`；预算不是性能体验或宿主页面总大小承诺。

## 执行结果

- `pnpm verify`：类型、lint、文档、门禁自身行为测试、静态引用面、268 项组件测试与覆盖率、两包及 Storybook 构建通过。UI 语句/分支/函数/行覆盖率为 91.06% / 83.29% / 91.07% / 93.68%；Patterns 为 100% / 77.27% / 100% / 100%。
- `pnpm verify:package`：两个真实 tarball 独立安装、类型、构建、MIT、客户端边界、Tree Shaking 与固定预算检查通过。
- `OXYGEN_WORKBENCH_PORT=4196 pnpm verify:workbench --workers=1`：92 项通过，包含 Chromium、Firefox、WebKit 与 390px Chromium 触屏模拟四种配置，全部消费真实 tarball。字体/动效/ColorPicker 每配置 5 项；查询、保存重开、上传失败、焦点、Dark/局部主题与 portal 等既有回归一并通过。
- `pnpm verify:foundation`：349 项测试通过（1 清单 + 174 示例 × 2 主题），共 414 次阶段扫描；312 个主题案例自动结果清晰，36 个明确保留 `manual-review-required`，原始 incomplete 38 条、精确复核工具限制 14 条（按规则/阶段计，非缺陷数）。无未处理的确定违规、运行错误或页面溢出。
- 修复后再次运行 `pnpm typecheck && pnpm lint && pnpm test:tooling` 通过，最终工具回归为 35/35。240 个本地文档链接与 `git diff --check` 通过。
- 人工查看实际双主题 Dialog 截图及移动配置字体/ColorPicker 截图，焦点、层级、文字与操作区未见新增溢出；这是静态视觉复核，不作为真实读屏或实体设备结论。
- `pnpm verify:release`：全部 workspace 升级计划、版本结果和内部 peer 更新预演通过；旧 `verify:initial-release` 兼容转发。对应新增 3 项工具回归验证真实两包升级、错误计划拒绝、无待发版本计划及源文件不变。
- `pnpm verify:protection`：实际远端 check/browser 必需且 strict=true，通过。
- 独立只读评审：未发现本轮生产实现、打包门禁、gh 读取路径或通用版本预演的阻塞/重要问题；两处测试盲点已补强，实际执行结果如上。

完整自动状态扫描仅覆盖示例及打开浮层的 WCAG 自动规则、运行时与溢出检查，不等于全部 WCAG 要求合规。每项 axe incomplete 保留人工复核状态，不当作自动通过。

## 远端与发布核实

2026-10-30 只读核实：

- `3199313768/oxygen-design-system` 当前为公开仓库。main 的有效 Ruleset `26177447` 要求 `check`、`browser` 且基于最新目标分支。经典 branch protection 返回 404，但有效 Ruleset 存在，不能把经典 API 的 404 解释成“没有保护”。
- 当时远端 main 为 `6338b7ad66cafc22d46c21b84c7a6d17f758ff9c`，`check`、`browser`、`release` 均已成功。该结果只证明这一远端 revision，不代表本轮未提交修改已上远端运行。
- 两个 npm 包 latest 均为 `0.1.1`、MIT；下载 tarball 后校验 registry 的 SHA-512 integrity、必需入口和 LICENSE 一致性。当前 `oxygen_yang` 身份对两包均为 read-write。provenance attestation URL 与 predicateType 存在，本轮未做 attestation 的密码学验证。
- 本地清单仍是现有开发版本，由 Changesets 后续版本 PR 更新；本轮新增兼容能力有 minor changeset。`pnpm verify:release` 实际预演两包 0.1.0 → 0.2.0，并核对 Patterns UI peer 下限更新至 >=0.2.0；version/changelog 写入仅在临时副本，工作区版本未改变，未执行 publish。
- [npm Trusted Publishing](https://docs.npmjs.com/trusted-publishers/) 要求 npm >=11.5.1、Node >=22.14.0。Release 保持 Node 22.22.2，并显式安装 npm 11.5.1；registry 已只读确认该版本支持当前 Node。未改开发机全局 CLI。工作流仍允许现有 NPM_TOKEN 路径；npm 控制台信任关系未独立核实，不能据 provenance 或本地 token 推断完成 OIDC 配置。

机器可读快照：`output/release-readiness/github.json`、`published.json`。这些是本次核查时间点证据，未来操作前需重新核验。

## 保留的外部验收边界

人工 Safari + VoiceOver、NVDA、实体 iOS/Android + VoiceOver/TalkBack、系统原生色板/日期/文件选择器、真实扫码和业务宿主接入未执行。WebKit 与移动视口模拟不替代这些验收。按人工清单记录设备/版本、操作、实际播报、截图与结果；缺设备/未执行保持待验收。

本轮新增 CI 配置和能力尚在本地工作区，后续远端运行与正式发版必须以各自实际结果为准。当前 npm 0.1.1 不包含本轮未发布修改。

## 推送前同步补充

用户随后授权提交与推送。工作分支同步远端 main 的 9 个后续提交，保留 0.1.1 版本、仓库元数据、维护者版本 PR、OIDC 发布与干净检出类型修复；本轮规范、预演和预算门禁共同保留。同步后两包当前版本均为 0.1.1，当前 changeset 的预演目标仍为 0.2.0。前文未提交/未推送及 NPM_TOKEN 路径描述属于同步前快照；当前 Release 工作流不引用 NPM_TOKEN，使用已合入 main 的 OIDC 流程。仍未执行正式版本更新、npm 发布或主分支合并。

同步后的干净检出回归发现：临时 Storybook fixture 原来只复制 stories，现有 stories 已依赖新增 docs 目录。补齐 fixture 的 docs 复制，保留“不构建 dist 直接类型检查”的原断言；修复前真实失败，修复后定向用例通过。

同步后最终验证：`pnpm verify` 通过（44 项工具测试、260 项 UI 与 8 项 Patterns 测试、类型/lint/文档/覆盖率/两包及 Storybook 构建）；`pnpm verify:package` 与 `pnpm verify:release` 通过；文档浏览器 73/73 通过。文档中的 ColorPicker 定位断言同步包含可见 HEX 值的新按钮名称；对应失败复现后修正并完整复验。
