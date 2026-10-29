# Oxygen 全组件设计规范检查与修正

> **For agentic workers:** Use superpowers:executing-plans for shared styling and browser integration; use dispatching-parallel-agents for the three independently owned component groups.

**Goal:** 对全部组件按 Arco Design / Ant Design 的共同原则检查并修正视觉、交互、状态、响应式与可访问性。

**Architecture:** 保留 Oxygen API、包边界、蓝色品牌及已批准的 36/32/44px 高度和 6/8px 圆角。扩展语义 token，修改现有规则而非引入第三方组件。设计依据与逐组件检查结果记录在同日检查报告。

**Tech Stack:** React / TypeScript / Radix / Lucide / CSS layers / Vitest / Storybook / Playwright。

## Global Constraints

- 用户已明确批准直接调整全部组件，本轮不重复设计确认。不因两套规范的不同默认尺寸引入混用的密度。
- 所有导出组件均需代码检查，所有 Storybook story 均需实际浏览器检查。区分组件问题与示例组合问题。
- 无新增依赖、无上传服务、无路由/权限业务、无发布部署。保留当前仓库修改。
- 行为缺陷先写回归测试并确认失败；纯视觉修改用实际截图、尺寸、颜色与溢出检查验证。
- 暂存证据位于 output/playwright/design-system-2026-10-29/；对外可审阅报告位于 docs/reviews/2026-10-29-design-system.md。

## 检查矩阵

每个组件检查：文字层级与字体继承 / 尺寸比例与密度 / 边框圆角阴影 / 品牌与语义色 / hover focus selected disabled loading error readOnly / 键盘与名称关联 / 长文案与窄容器 / reduced motion。组件不适用的状态标注为不适用，不增加虚构业务状态。

### Task 1: 控件、表单与导航

- [x] 审查所有输入、选择、树、穿梭框、分页、按钮及导航组件。
- [x] 修复显式 id 的 label 关联、组合控件内部 ARIA 传递、半选和禁用事件等已复现问题。
- [x] 独立测试 design-system-controls.test.tsx 验证真实用户行为，记录红绿结果。

### Task 2: 展示、披露与页面布局

- [x] 审查表格、描述、统计、步骤、时间线、图片、折叠与全部 patterns。
- [x] 修复折叠键盘导航、窄容器/长文本、禁用与选中样式，修改 data-display/tree/disclosure.css 和 patterns CSS。
- [x] 独立测试 design-system-display.test.tsx 验证行为变更。

### Task 3: 反馈、上传与弹层

- [x] 审查全部反馈、弹层、标签、排版及基础布局组件。
- [x] Alert 增加形状提示；Toast 默认关闭按钮具备图标与名称；Upload 区分普通/拖拽、进度和文件状态；Progress 规范有限值与状态描述。
- [x] 独立测试 design-system-feedback.test.tsx 验证行为变更。

### Task 4: 统一视觉与组合示例

- [x] 扩展 border-subtle/strong、placeholder、disabled、hover、primary-subtle/border、success/warning/error 的 bg/border/text token。
- [x] 区分禁用与加载，补全控件 hover/invalid/focus；统一 ghost 中性操作与 link 品牌色。
- [x] 容器与分隔线降噪；选中和悬停区分；状态标签、提示和进度采用语义 token。
- [x] 补全弹层滚动/长文本/焦点，水平表单窄屏折行，控制默认和紧凑高度不变。
- [x] 修验收页按钮网格拉伸与表单宽度，增加状态/色板/组合页面示例。

### Task 5: 验证与报告

- [x] 全量 typecheck、测试、UI/patterns 构建、Storybook 构建、包导出检查。
- [x] 截图并检查全部 stories 的桌面与窄屏；检查关键弹层打开/关闭、Tab/方向键、错误恢复、44px 触屏目标与 reduced motion。
- [x] 记录颜色对比度，区分禁用豁免和正常文本；运行可用的自动无障碍检查并修复真实问题。
- [x] 独立审查 diff，解决重要问题，再运行对应回归。
- [x] 更新逐组件检查报告、证据链接和实际限制；git diff --check。
