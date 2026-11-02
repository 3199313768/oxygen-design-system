# 设计质量专项修复记录

日期：2026-11-02。范围：上一轮设计质量审计 D01–D14。基于 fcf7002 与现有未提交公共 API 修复继续实施；保留之前的改动，不提交、推送、发布或部署。

## 逐项结果

| 编号 | 级别 | 组件与源码位置 | 实现及验证证据 |
| --- | --- | --- | --- |
| D01 | P1 | packages/ui/src/styles/index.css:233 | 共享 NavigationMenuViewport 使用 Radix 内容尺寸，内部 Content 改为参与视口布局。原 2px 裁切复现先失败；修复后 Chrome 视口高 56px、链接高 38px且在边界内。跨浏览器覆盖内容切换、Escape、焦点与可见范围。 |
| D02 | P2 | packages/ui/src/components/Combobox.tsx:130 | 活动选项按实际列表边界滚动，保留输入焦点。30 项中 ArrowDown 至第 20 项后列表 scrollTop=446，选项完整可见。 |
| D03 | P2 | packages/ui/src/components/Combobox.tsx:144 | 组件边界处理 blur；清除后焦点回输入框；列表显式 tabIndex=-1，避免 Chrome 自动生成滚动容器停靠点。清除、继续 Tab、受控拒绝更新及 React 19 callback ref cleanup 均有回归。 |
| D04 | P2 | packages/ui/src/components/Field.tsx:145 | 向实际 FieldControl 继承 aria-required，保留 Slot 与子元素显式 false；不擅自开启原生 required 校验。 |
| D05 | P2 | packages/ui/src/components/Upload.tsx:256 | 隐藏 file input 从顺序导航移除，可见浏览按钮承担键盘入口；保留文件选择与上传流程。 |
| D06 | P2 | packages/ui/src/components/Upload.tsx:92 | Field/Form 标签指向实际浏览按钮，按钮与 file input 关联错误和描述。独立 Upload 的根 id、div ref、上传输入命名及本地化浏览文案均保持兼容。 |
| D07 | P2 | packages/ui/src/styles/index.css:142 | vertical 导航按列布局，就地与共享浮层按方向定位；验证上下箭头与视觉顺序一致。 |
| D08 | P2 | packages/ui/src/styles/disclosure.css:78 | 图标旋转仅匹配自身 trigger 的 aria-expanded，避免父级状态影响内层关闭项；Accordion/Collapsible 均覆盖。 |
| D09 | P2 | packages/ui/src/components/Button.tsx:77；packages/ui/src/styles/index.css:645 | asChild 使用空内容 CSS 伪元素复用加载标记样式与 reduced-motion；完全保留子 children。覆盖子状态、DOM 身份、ref、原生/包装 input、固定 innerHTML 内容与禁用事件，避免注入 children 导致崩溃。 |
| D10 | P2 | packages/ui/src/components/Progress.tsx:37 | showInfo=false 只隐藏百分比，失败/成功状态仍保留形状图标；失败 0% 也可见，原有数值和 aria-valuetext 保留。 |
| D11 | P2 | packages/ui/src/styles/index.css:1440 | 页码组允许在窄容器换行，保留所有页码操作。180px 容器 scrollWidth=clientWidth，末页仍可聚焦且位于边界内。 |
| D12 | P2 | packages/ui/src/components/Toast.tsx:35 | 补充仅播报 title/description 更新的区域，不重复首次播报，排除隐藏文本与操作文案；保留 foreground/background 优先级、计时与焦点。覆盖 Notification、Message、内部状态更新、空文本、forceMount 重开与清理。 |
| D13 | P3 | packages/ui/src/components/Space.tsx:23 | small/middle/large 对应间距 Token，compact 下为 8/12/16px；数值 size={13} 仍为 13px。局部 Token 覆盖为 19px 时语义尺寸响应、数值不变。 |
| D14 | P3 | packages/ui/src/styles/data-display.css:222 | Timeline 连线从节点 Token 与线宽计算中心；compact、局部 16/30px 覆盖及 LTR/RTL 均验证中心差不超过 0.5px。 |

## 文件范围

- 组件：Button、Combobox、Field、Progress、Space、Toast、Upload；样式：index.css、disclosure.css、data-display.css。
- Storybook 人工说明：general.ts、forms.ts、feedback.ts、navigation.ts、layout.ts；执行既有文档生成器同步 API 数据。
- 新增三个 design-quality 单测文件、真实 tarball 消费夹具 DesignQualityExamples.tsx、浏览器回归 design-quality.spec.ts；App.tsx 接入夹具。
- 原 workbench.spec.ts 的分页选择器限定至“记录列表”区域，避免新增独立分页示例重名；static-components.test.tsx 移除固定 24px 的旧实现断言，实际数值/Token 行为由浏览器验证。
- 本轮不改变公开 Props 名称、类型、包入口或导出，不新增依赖、公开组件或 Patterns 业务状态。既有公共 API 修复另见同目录 public-api-repairs 记录。

## 最终验证

| 检查 | 结果 |
| --- | --- |
| UI 单测与覆盖率，单 worker | 21 文件、347 项通过；语句 93.68%、分支 86.57%、函数 94.38%、行 96.18%，满足现有门槛。 |
| Patterns 单测与覆盖率 | 3 文件、12 项通过；语句/函数/行 100%、分支 86.36%，满足现有门槛。 |
| 完整 tarball workbench | 172 项通过：Chromium、Firefox、WebKit、390×844 移动 Chromium；其中新增专项 80 项，均覆盖 Light/Dark。 |
| Storybook 状态 / 无障碍 | 相关组件及匹配复合组件共 84 项通过，覆盖 Light/Dark、交互与 axe 规则；不是全量 348 状态重新验收。 |
| TypeScript / ESLint | 全仓既有 typecheck、浏览器/消费夹具编译以及 lint 通过。 |
| 文档 | 65 families、181 组件导出，67 文档页、174 完整初始/状态源示例编译通过。 |
| 工具 / 静态表面检查 | 45 工具测试通过；60 个 UI 组件被测试引用，后者不代表行覆盖率。 |
| 独立发布包 | UI 与 Patterns 的 tarball 安装、类型、构建、模块、样式与包体预算检查通过。 |
| 构建 | UI、Patterns、Storybook 生产构建通过。 |
| 独立复审 | 复审发现的 asChild void 元素、包装 input、innerHTML 和子状态边界已补失败测试并修复；复核无新增阻断问题。 |

原始执行日志位于 /tmp/oxygen-design-quality-*.log。第一次并发覆盖率运行中，既有大表格测试超过 5s；未提高超时、未更改表格实现，单 worker 完整覆盖率运行通过。浏览器初次集成失败分别定位为夹具重名、macOS WebKit 的按钮 Tab 偏好、移动通知遮挡测试按钮；分别通过限定区域、Option-Tab 和真实键盘激活修正测试路径，没有跳过用例或使用强制点击。

## 浏览器证据及边界

人工 Chrome 截图与 DOM 测量保存于 output/playwright/design-quality-repairs-2026-11-02：04-final-light.png、05-final-dark.png、06-final-navigation.png、evidence.json；长列表滚动截图为 02-combobox-visible.png。最终 CSS 加载标记在真实 Chrome 中为 16×16px、oxygen-spin，子元素数量保持为 0。

1. 尚未执行 VoiceOver/NVDA 真人播报验收。DOM/live region 更新、axe 规则与实际读屏听感分开报告；不把自动通过等同于完整无障碍认证。
2. mobile-chromium 为 390×844 仿真，不代表实体触屏、iOS Safari 或全部缩放/强制颜色组合。
3. input 等不支持 CSS 伪元素的 asChild 宿主保留 aria-busy、aria-disabled 和激活拦截；需要加载图标时使用普通 Button。自定义子组件仍须透传 className、属性与 ref。
4. Space 语义尺寸现在响应 density/局部 Token，这是预期修复；若宿主需要固定像素间距，应继续使用数值 size。
5. 不表示所有任意嵌套/布局组合均无问题。本轮修复与回归对应 D01–D14，未进行新一轮全组件视觉重新设计。
