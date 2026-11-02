# 公共 API 边界与兼容规则

## 组合与挂载

支持 `asChild` 的组件接收一个能够透传属性和 ref 的 React 元素。调用方提供根元素，Oxygen 保留所需的图标、指示器、轨道或关闭按钮；不要在自定义根中嵌套交互根。组合后的元素仍需具有合适的原生语义与键盘能力，例如 Checkbox/Switch 使用 button。

浮层 Content 的 `forceMount` 同时传递至内部 Portal，关闭时仍可挂载以支持宿主动画。保留挂载不等于自动隐藏；调用方需要根据 `data-state` 管理动画结束后的可见性和交互，不应把关闭的内容作为可操作面板。

## 值与通知

- Combobox 的搜索草稿与已提交值分离；受控选择和清空请求由父级接受后更新展示。`Option.textValue` 为复杂标签提供搜索与选中展示文本；普通 DOM 元素和 Fragment 可提取原生文字，自定义组件应提供 textValue。
- Transfer 的 `onChange` 通知目标集合变化；`onSelectChange` 通知两侧临时勾选变化，包括移动成功后清空对应侧勾选。
- Accordion 单选模式保留空字符串作为关闭状态，项键不能使用空字符串。保持原有关闭回调签名，不切换为 undefined。
- Pagination 的页码、页大小和页大小候选为正整数；非整数向下取整，非法输入使用安全默认值。总条数为非负整数。

## 类型与扩展

Button 默认分支使用按钮事件和 ref；asChild 分支不承诺实际节点为 button。QRCode 保留 aria-label、ariaLabel 和 label，按此顺序决定辅助名称，命名 Props 与组件实际能力保持一致。

ButtonProps 通过 asChild 区分两个分支。包装组件直接接收并透传 ButtonProps；扩展时使用类型交叉，而不是 interface extends ButtonProps。asChild 事件中如需具体节点能力，应先收窄 currentTarget，或将事件写在对应的原生子元素上。

Patterns 仅提供通用布局和 UI 组合，通过根节点的原生属性和 className/style 扩展，不引入请求、业务状态或路由策略。

ColorPicker 的 defaultDraftValue 兼容保留，只用于文档和验证中的非法初始草稿。正常接入使用 value/defaultValue；此参数不会改变“确定才提交、关闭丢弃草稿”的语义。
