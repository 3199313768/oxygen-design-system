# @oxygen-design/patterns

## 0.2.0

### Minor Changes

- 8a39a9d: 补充可覆盖的正文/系统/等宽字体和语义动效 Token，沿用既有尺寸与动效节奏，修复减少动态效果时的进度条过渡。ColorPicker 将值校验状态放到真实编辑输入，保留触发按钮、确认提交、取消与焦点行为，移除 ARIA lint 豁免。
  
  保留 ESM 模块输出以支持单组件消费裁剪，加入真实 tarball 的 Tree Shaking 与固定体积预算门禁。两个软件包与 LICENSE 统一沿用现有已发布的 MIT 授权。
  
  补齐 Slider、Transfer、Calendar / DateRangePicker 的具名容器语义；ColorPicker 按钮名称包含原字段标签与当前已确认色值，使用自动化按名称定位时应包含色值或使用字段标签的前缀匹配。跨月可选日期使用语义弱化文字色，避免用整体透明度降低可读性。

### Patch Changes

- 根节点接收 className、style、id、事件和 ref。
- peerDependencies 改为 React 19。发布声明的相对导入带 `.js` 扩展名，样式入口补上类型声明。
- Updated dependencies [8a39a9d]
- Updated dependencies [8a39a9d]
- Updated dependencies
  - @oxygen-design/ui@0.2.0

## 0.1.1

### Patch Changes

- 458e721: 采用 MIT 许可证，补齐包内许可证、安装说明和源码仓库信息，并通过 GitHub Actions OIDC 发布公开包。
- Updated dependencies [458e721]
  - @oxygen-design/ui@0.1.1
