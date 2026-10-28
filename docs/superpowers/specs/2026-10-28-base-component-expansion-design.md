# Oxygen 基础组件扩展设计

## 目标

补齐 Oxygen 设计系统在数据录入、导航、结构化数据展示和增强型通用能力上的基础组件，保持 `@oxygen-design/ui` 只提供结构、样式、交互和无障碍能力，不绑定业务请求、路由或领域模型。

## 范围

### 第一批：高频基础能力

- `Upload`
- `Calendar`
- `DateRangePicker`
- `Combobox`
- `InputNumber`
- `Breadcrumb`
- `Tag`
- `TagInput`

### 第二批：结构化数据与页面表达

- `Tree`
- `TreeSelect`
- `Cascader`
- `Descriptions`
- `Statistic`
- `Steps`
- `Timeline`
- `Accordion`
- `Collapsible`
- `Image`
- `ImagePreview`

### 第三批：增强型通用组件

- `Slider`
- `ColorPicker`
- `Transfer`
- `NavigationMenu`
- `QRCode`

不新增业务组件，不把 `AppShell`、`PageHeader`、`EmptyState` 等页面模式重新放回基础包。现有 `Sheet` 继续承担 Drawer 类场景，现有 `Select`、`Popover`、`Dialog` 等原语不重复实现。

## API 约定

- 遵循现有 Radix/Oxygen 组合式组件风格，并从 `packages/ui/src/index.ts` 导出运行时组件和公开类型。
- 需要状态的组件同时支持受控和非受控用法，使用 `value`/`onChange` 与 `defaultValue` 对应命名。
- 所有可交互组件提供 `disabled`，异步或提交态提供 `loading`，并保留原生事件透传能力。
- 列表、树和穿梭框统一使用 `Key` 作为节点或选项标识，保留字符串和数字，不强制转换为字符串。
- 默认文案进入 `ConfigProvider` 的 locale；新增文案必须支持调用方覆盖。
- 默认状态覆盖加载中、空数据、错误、禁用、只读和无障碍名称，Storybook 示例显式传入业务中性文案。

## 组件边界

### Upload

`Upload` 只管理文件选择、文件列表、校验、状态、进度、重试和移除。通过 `customRequest` 或等价回调注入上传实现，不内置 `fetch`、鉴权、对象存储和服务端 URL。支持单文件、多文件、拖拽和受控文件列表。

### 日期组件

`Calendar` 提供月视图、日期选择、键盘导航、禁用日期和 locale。`DateRangePicker` 复用日期网格和范围状态，统一输入输出格式，支持受控值、快捷范围和清空。第一版只支持日期范围，不扩展时间范围。

### 搜索和数值输入

`Combobox` 支持本地过滤、异步选项、清空、空状态和键盘选择；异步请求由调用方提供。`InputNumber` 支持最小值、最大值、步长、精度、格式化和解析，不能通过键盘输入绕过边界校验。

### 导航和结构化数据

`Breadcrumb` 和 `NavigationMenu` 不管理路由，只提供链接、当前项、菜单展开和键盘交互。`Tree` 支持展开、选择、复选、禁用和受控选中节点；`TreeSelect` 和 `Cascader` 复用节点模型，但分别提供树形下拉和路径级联交互。

### 数据展示

`Descriptions`、`Statistic`、`Steps`、`Timeline` 只负责布局和状态表达。`Image` 提供加载失败占位和替代文本，`ImagePreview` 负责预览层、关闭和键盘退出。`Accordion` 与 `Collapsible` 提供可访问的折叠关系，不携带业务内容。

### 增强型组件

`Slider` 支持单值和范围值；`ColorPicker` 输出标准颜色值并提供输入校验；`Transfer` 支持双栏选择、搜索、全选和受控值；`QRCode` 使用成熟二维码运行时依赖，只负责二维码生成、尺寸、颜色和错误状态，不上传或解析内容。

## 依赖策略

- 优先复用现有 Radix primitives、React 原生能力和项目已有样式工具。
- 日期网格、二维码等复杂规则不手写算法；使用体积可控、维护活跃的成熟依赖，并把依赖放在包的 `dependencies` 中。
- 新依赖必须在 package contract、packed consumer 和生产构建中验证，并保持 Vite external 配置同步。
- 不引入完整 UI 框架，不把 Ant Design 作为运行时依赖。

## 验收标准

- 每个组件拥有公开类型、入口导出、Storybook 示例和至少一个交互或静态测试。
- 关键键盘行为、ARIA 关系、受控/非受控切换、禁用和错误状态有测试覆盖。
- UI 包、patterns 包、Storybook 和 packed consumer 均可构建。
- 新增组件不会将业务文案、网络请求、路由或鉴权逻辑带入基础包。
- 完成后运行 `pnpm typecheck`、`pnpm test`、`pnpm build`、`pnpm storybook:build` 和 `pnpm verify:package`。

## 实施顺序

1. 先实现第一批，稳定日期、文件、选项和基础交互的类型约定。
2. 基于第一批的节点、选项和 locale 抽象实现第二批。
3. 最后实现增强型组件，并单独验证新运行时依赖、包体积和 packed consumer。
