# Design Quality Repairs Implementation Plan

> 使用 systematic-debugging、test-driven-development 与 dispatching-parallel-agents 执行；用户已批准审计报告中的修复方案，本轮直接完成实施与验证。

**Goal:** 修复审计 D01–D14，保持公共 API、依赖与已有工作区修改。

**Architecture:** 在组件内部修复焦点、上下文与状态反馈；样式仅修复已复现的布局与密度问题。保留 Radix 交互基础，不通过改示例规避缺陷。

**Tech Stack:** React 19、TypeScript、Radix、CSS Variables、Vitest、Testing Library、现有浏览器验收工具。

## Global Constraints

- 不升级依赖，不提交、推送或部署，不新增公开组件，不改已有 Props 名称或类型。
- 已有未提交 API 修复必须保留；直接在当前工作区继续。
- 数值 Space.size 继续按 px；语义枚举改用对应 Token。
- Field.required 表达无障碍必填语义，不强行开启原生校验。
- 通知内容更新不重挂载 Toast，不重置计时或焦点。
- 先证明回归失败，再实施；CSS 布局以真实浏览器测量为准，jsdom 不用于证明尺寸。

## Task 1: 表单焦点与语义（D02–D06）

Files: Combobox.tsx、Field.tsx、Upload.tsx；新增 design-quality-forms.test.tsx。

- [x] 对照既有源码与审计复现，补失败测试：长列表活动项滚动；清除后输入焦点；从清除离开关闭；required 覆盖；Upload 真实入口的标签/错误/Tab 顺序。
- [x] Combobox 采用局部 input/list refs 与组件边界 blur；保留宿主 ref、回调、受控与非受控契约。
- [x] FieldControl 继承 required 且允许显式覆盖；Upload 将实际控件与 Field 上下文关联，隐藏输入移出顺序导航。
- [x] 运行针对性测试并自查受控、disabled/readOnly、显式 ARIA 覆盖。

## Task 2: 可见状态反馈（D09–D10）

Files: Button.tsx、Progress.tsx；新增 design-quality-feedback.test.tsx。

- [x] 先补失败测试：asChild loading 指示可见；showInfo=false 的失败 0% 仍有非颜色状态标记。
- [x] 保持单一组合子节点、宿主事件与禁用拦截；普通按钮与组合按钮使用同样的加载标记。
- [x] 隐藏百分比不移除失败/成功状态图标；保留 progressbar 数值与 aria-valuetext。
- [x] 运行针对性与既有 Button/Progress 测试。

## Task 3: 动态通知播报（D12）

Files: Toast.tsx；新增 design-quality-toast.test.tsx。

- [x] 复现同一打开 Toast 的可见文本更新与播报快照分离。
- [x] 用局部、清理完整的更新播报机制补充动态文本，排除关闭/操作文案与 aria-hidden 内容，不重复初始播报。
- [x] 覆盖首次打开、内容更新、关闭重开、title/description、空/不变内容、unmount 清理与 Toast type 优先级；保留倒计时和焦点。
- [x] 验证 Notification；共享 Toast 的 Message 路径一起回归。

## Task 4: 导航与布局（D01、D07–D08、D11、D13–D14）

Files: NavigationMenu.tsx（若需）、Space.tsx、styles/index.css、styles/disclosure.css、styles/data-display.css；浏览器回归夹具/测试。

- [x] 用审计夹具复现并记录修复前：共享视口 2px、vertical 仍 row、内层箭头误转、180px 分页溢出、compact 间距/连线偏移。
- [x] 为共享 viewport 定义实际尺寸及内部 Content 定位，保持就地 Content 模式；vertical 样式匹配方向语义。
- [x] 箭头旋转绑定自身 trigger 状态；页码组允许窄容器内使用；语义 Space 尺寸用 Token；Timeline 连线从节点尺寸计算。
- [x] Light/Dark 与数字/语义密度覆盖，真实浏览器测量内容可见、滚动、焦点和布局边界。

## Task 5: 集成验证与文档

- [x] 更新必要的行为说明、示例与修复记录；生成文档后核对公共 API 未漂移。
- [x] 完成 UI/Patterns 单测、类型检查、lint、docs:check、构建与相关浏览器回归；真实消费包验证按风险执行。
- [x] 独立代码复核，修正引入的边界问题，检查 git diff 与依赖文件。
- [x] 最终逐项映射 D01–D14，明确已证实结果与真人读屏/实体触屏等未覆盖边界。

## 完成证据

逐项结果及验证边界见 docs/reviews/2026-11-02-design-quality-repairs.md。UI 347 项、Patterns 12 项、真实 tarball 四浏览器配置 172 项通过；类型、lint、文档、工具测试、覆盖率、包预算和生产构建通过。Button 最终使用 CSS 伪元素，不注入或重挂载 asChild 子内容；独立 Upload 根 id 与 ref 保持兼容。
