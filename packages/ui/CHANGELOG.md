# @oxygen-design/ui

## 0.2.0

### Minor Changes

- 8a39a9d: 新增 ConfigProvider 的 light/dark/system 主题配置与 OxygenTheme 类型，支持局部主题、嵌套继承和 Portal 浮层保持来源主题。补充深色语义 Token、原生控件 color-scheme 和浮层层级，沿用默认浅色及现有尺寸、圆角和排版。
- 8a39a9d: 补充可覆盖的正文/系统/等宽字体和语义动效 Token，沿用既有尺寸与动效节奏，修复减少动态效果时的进度条过渡。ColorPicker 将值校验状态放到真实编辑输入，保留触发按钮、确认提交、取消与焦点行为，移除 ARIA lint 豁免。
  
  保留 ESM 模块输出以支持单组件消费裁剪，加入真实 tarball 的 Tree Shaking 与固定体积预算门禁。两个软件包与 LICENSE 统一沿用现有已发布的 MIT 授权。
  
  补齐 Slider、Transfer、Calendar / DateRangePicker 的具名容器语义；ColorPicker 按钮名称包含原字段标签与当前已确认色值，使用自动化按名称定位时应包含色值或使用字段标签的前缀匹配。跨月可选日期使用语义弱化文字色，避免用整体透明度降低可读性。

### Patch Changes

- 修复组合组件的 asChild 插槽、Combobox 受控展示、Transfer 勾选通知，以及 Dialog、Sheet、Popover、Tooltip、DropdownMenu 的 forceMount。Accordion 单选模式拒绝空字符串项键。ButtonProps 改为判别联合，不能再用 interface extends 扩展。
- peerDependencies 改为 React 19。发布声明的相对导入带 `.js` 扩展名，样式入口补上类型声明。

## 0.1.1

### Patch Changes

- 458e721: 采用 MIT 许可证，补齐包内许可证、安装说明和源码仓库信息，并通过 GitHub Actions OIDC 发布公开包。

## 0.1.0

### Minor Changes

- e2b9bf5: 发布首个 Oxygen Design System 私有组件包，包含基础组件、通用页面模式、预编译样式与框架无关设计令牌。
