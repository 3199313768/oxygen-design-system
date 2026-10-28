# Oxygen 组件样式优化 · A 方案完成记录

用户已批准直接在当前工作区开发。默认控件 36px、小控件 32px、触屏点击区域至少 44px，保留蓝色品牌方向。本次以修改前文件快照比对，修改 37 个源文件；保留工作区原有改动，未提交、推送或部署。

## 17 项问题对应结果

| 项目 | 最终调整 | 验证依据 |
| --- | --- | --- |
| 1. 半选不可见 | 半选使用蓝底白色减号，与已选勾号区分；保留受控和非受控切换 | 回归测试；树及触屏截图 |
| 2. 图片预览溢出 | 修正专用对话框优先级，图片受容器约束；为关闭按钮保留空间；修正入场动画覆盖居中位移 | 桌面和 390px 预览均无横向滚动，图片未遮挡关闭按钮 |
| 3. 移动穿梭方向 | 采用源/目标的中性操作名称；窄屏与窄容器纵向排列，箭头随布局旋转 | 实际双向移动测试；桌面窄容器及移动端截图 |
| 4. 单选图形混淆 | 用圆点表达单选选中状态 | 回归测试；触屏圆点外缘点击通过 |
| 5. Result 暴露枚举 | 成功、信息、警告、失败使用对应 SVG；403/404/500 保留数字 | 图标语义测试；状态反馈截图 |
| 6. Upload 暴露枚举 | 待上传、上传中、已完成、上传失败支持本地化；上传中带百分比 | 四种状态测试；集中验收页 |
| 7. 表格选择不一致 | 使用共享 Checkbox，选择列固定 48px，触屏增加行内空间 | 实际选择及回调测试；浏览器列宽测量 |
| 8. 标题层级重复 | H1–H5 为 28/36、24/32、20/28、16/24、14/22；示例标题不覆盖组件层级 | 五级字号与行高断言 |
| 9. 字重与正文不一致 | 正文 14/22、标签 14/20 及 500 字重；集中 400/500/600 token；根组件声明字号以减少宿主影响 | 浏览器计算样式；全部示例截图 |
| 10. 按钮图标与加载间距 | 图标 16px，统一 gap，移除加载图标额外 margin；加载状态与禁用状态区分 | 图标及按钮尺寸断言；焦点验证 |
| 11. 树图标和行高 | 16px SVG 箭头/清除，桌面行高 32px；统一选中底色，避免父行与复选框叠加透明度 | 树行高断言；半选树截图 |
| 12. 穿梭行被拉伸 | 列表从顶部排列，常规单行 36px；长文案允许增高和换行 | 源、目标三个条目均为 36px；窄容器示例 |
| 13. 颜色错误无说明 | 显示关联到输入的本地化错误提示；错误焦点环保持语义色；有效值恢复后可确认 | 错误关联、恢复、确认测试与浏览器操作 |
| 14. 阴影过重 | 集中 surface/popup/modal 阴影，统一下拉、菜单、气泡、通知和对话框 | 菜单阴影计算样式；弹层截图 |
| 15. 表单间距缺乏层次 | 标签间距 6px、帮助 4px、字段组 24px；水平标签与控件对齐 | 浏览器测量 6/4/24px |
| 16. 步骤缺少连接 | 添加横向与纵向连接线，窄容器纵向排列；完成/失败使用 SVG | 常规、错误、纵向及窄屏截图 |
| 17. 示例框架不统一 | 独立示例标题、统一框架、修正按钮拉伸，文字标签可点击；新增对齐/状态、窄容器/长文案验收页 | 54 个示例及 24 个补充状态截图 |

## 文件范围

- `packages/ui/src/styles/`：tokens、index、tree、data-display、disclosure。
- `packages/patterns/src/styles/index.css`：页面标题、空态、提示及字重。
- `packages/ui/src/components/`：Checkbox、RadioGroup、Result、Steps、Tree、TreeSelect、Cascader、Table、Transfer、Upload、ColorPicker、ConfigProvider。
- `packages/ui/tests/ui-refinement-regressions.test.tsx`：新增 7 个回归测试；`interactive-components.test.tsx` 仅对齐三处穿梭框操作名称预期。
- `apps/storybook/`：preview.tsx、preview.css、原有示例标题和标签，新增 StyleRefinement.stories.tsx。完整 37 文件列表与相对会话开始时的 diff 保存在下方证据目录。

## 检查结果

| 检查 | 结果 |
| --- | --- |
| UI 单元与交互测试 | 8 文件 / 152 项通过，含新增 7 项 |
| Patterns 测试 | 2 文件 / 7 项通过 |
| UI / Patterns / Storybook TypeScript | 全部通过 |
| UI / Patterns Vite 构建 | 全部通过 |
| 静态 Storybook 构建 | 通过；工具链仍输出 Radix/Lucide 的 use-client 打包提示及构建耗时提示 |
| 浏览器 | Chromium：54 示例 + 24 补充状态截图；桌面与补充状态均无页面横向溢出 |
| 浏览器回归断言 | 26/26 通过，含真实触摸事件、44px 点击范围、20px 复选/单选视觉尺寸、24px 开关视觉高度、键盘焦点、表单间距、图片预览、表格列宽 |
| 源码复查 | 组件语义、CSS 与 Storybook 分别复查；发现的窄屏布局、标签点击、禁用导航 hover 问题均已修复 |
| git diff --check | 通过 |

本机默认 Node 22.14.0 低于项目要求。此次使用已有 `/opt/homebrew/bin/node` 23.11.0 及本地 Vite/Vitest/TypeScript/Storybook 二进制。pnpm 自动安装在无 TTY 环境中中止后未安装依赖；未运行包含重新安装的独立 tarball 消费者验证。

证据目录：`output/playwright/ui-refinement-2026-10-28/`。`after/gallery.html` 可查看截图；`after/browser-assertions.json` 为 26 项断言；`session.diff` 与 `changed-files.json` 记录本次源码修改。原始审查及修改前截图保留在 `output/playwright/ui-audit-2026-10-28/`。

验证范围为本机 Chromium 的桌面、390px 窄屏与触屏模拟；未覆盖实体 iOS/Android、Safari/Firefox 和下游业务应用的集成样式。原生日期/时间控件继续使用系统行为，未引入上传请求、路由或其他业务规则。
