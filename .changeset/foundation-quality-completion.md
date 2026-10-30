---
"@oxygen-design/ui": minor
"@oxygen-design/patterns": minor
---

补充可覆盖的正文/系统/等宽字体和语义动效 Token，沿用既有尺寸与动效节奏，修复减少动态效果时的进度条过渡。ColorPicker 将值校验状态放到真实编辑输入，保留触发按钮、确认提交、取消与焦点行为，移除 ARIA lint 豁免。

保留 ESM 模块输出以支持单组件消费裁剪，加入真实 tarball 的 Tree Shaking 与固定体积预算门禁。两个软件包与 LICENSE 统一沿用现有已发布的 MIT 授权。

补齐 Slider、Transfer、Calendar / DateRangePicker 的具名容器语义；ColorPicker 按钮名称包含原字段标签与当前已确认色值，使用自动化按名称定位时应包含色值或使用字段标签的前缀匹配。跨月可选日期使用语义弱化文字色，避免用整体透明度降低可读性。
