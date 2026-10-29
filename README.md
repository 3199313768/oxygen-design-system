# Oxygen 设计系统

面向 Oxygen 项目的 React 设计系统。GitHub 仓库和 Storybook 保持私有；可发布的
软件包是公开的作用域包 `@oxygen-design/ui` 和 `@oxygen-design/patterns`。

## 软件包内容

- 基于 shadcn/ui 模式和 Radix Primitives 构建的无障碍基础控件。
- `@oxygen-design/patterns` 提供不包含路由、数据访问或业务状态的通用页面模式。
- 预编译的组件 CSS，使用方无需安装 Tailwind。
- 独立且与框架无关的设计令牌。
- 按 Lucide 原始组件名称整理并导出的图标。

基础组件采用 Ant Design 的职责分组方式，但保留 Oxygen 的组件实现和公开命名。当前
`@oxygen-design/ui` 的组件清单如下：

- 通用：Button、ConfigProvider、Typography、Icons、Field、Label、Form、FormItem。
- 布局与间距：Layout、Space、SpaceCompact、Divider。
- 导航：Breadcrumb、Tabs、DropdownMenu、NavigationMenu、Pagination。
- 数据录入：Input、Textarea、InputNumber、Select、Combobox、Cascader、Checkbox、
  RadioGroup、Switch、Slider、ColorPicker、TagInput、Transfer、Upload。
- 日期与时间：Calendar、DatePicker、DateRangePicker、TimePicker。
- 数据展示：Card、Badge、Table、Descriptions、Statistic、Steps、Timeline、Tree、
  TreeSelect、Image、ImagePreview、Tag。
- 反馈与浮层：Alert、Toast、Message、Notification、Dialog、AlertDialog、Popover、
  Sheet、Tooltip、Skeleton、Spin、Progress、Result、Accordion、Collapsible。
- 其他：QRCode 和预编译样式入口。

`Upload` 只管理文件选择、校验、文件列表和状态，不发起网络请求或处理鉴权。调用方通过
`customRequest(file, handlers)` 注入上传实现，并使用 `handlers.signal` 响应移除或卸载时的
取消信号，再通过 `handlers.onProgress(percent)`、`handlers.onSuccess(url?)` 和
`handlers.onError(error?)` 回传进度与结果。

`DateRangePicker` 的值是本地日期二元组 `[Date, Date]`；未选中或清空时，`value` 和
`onChange` 使用 `undefined`。组件不输出时间范围，也不负责时区转换。

`QRCode` 使用 `qrcode.react` 作为 `@oxygen-design/ui` 的运行时依赖，构造 SVG 二维码并
提供尺寸、颜色、边距和空值错误态。依赖保持在已发布包的 `dependencies` 中并在构建产物中
externalize；组件不上传、解析或持久化二维码内容。

页面级组合属于独立的 `@oxygen-design/patterns` 包，包括 AppShell、EmptyState、PageHeader
和 StatusMessage。模式包只依赖基础包、React 和 React DOM，不包含路由、数据访问或业务状态。

基础组件和页面模式只提供结构、样式、交互与无障碍能力，不内置文件、项目、团队、报告等
产品语义或业务流程；标题、描述、按钮文案和状态内容均由使用方传入。默认交互文案采用
中文通用词（例如“关闭”），并可通过 `ConfigProvider` 的 `locale` 覆盖。

Oxygen 对齐的是 Ant Design 的分类、中文文案和常见交互习惯，不承诺 Ant Design 的 API
兼容性；当前 `variant`、`tone`、Radix 组合式 API 等 Oxygen 公开接口保持不变。

## 本地开发

环境要求：Node.js 22 系列中的 `22.22.2` 或更高版本，以及 pnpm `11.9.0`。

```bash
pnpm install --frozen-lockfile
pnpm typecheck
pnpm test
pnpm build
pnpm storybook
```

启动后访问 <http://localhost:6006> 查看组件和页面模式。

构建静态 Storybook，并使用以下命令验证实际的软件包 tarball：

```bash
pnpm storybook:build
pnpm verify:package
pnpm verify
```

## 使用方安装

安装前请确认 npm 组织和对应版本已经发布。由于该软件包是公开的，使用方无需
npm token：

```ini
@oxygen-design:registry=https://registry.npmjs.org/
```

```bash
pnpm add @oxygen-design/ui@0.1.0 @oxygen-design/patterns@0.1.0 --save-exact
```

在应用入口处一次性导入组件和预编译样式：

```tsx
import { Button } from '@oxygen-design/ui';
import { EmptyState, PageHeader } from '@oxygen-design/patterns';
import '@oxygen-design/ui/styles.css';
import '@oxygen-design/patterns/styles.css';
```

基础组件默认使用中文通用文案，也可以在应用根部覆盖：

```tsx
import { ConfigProvider } from '@oxygen-design/ui';

<ConfigProvider locale={{ common: { close: '关闭' } }}>
  <App />
</ConfigProvider>;
```

与框架无关的使用方也可以只导入设计令牌：

```css
@import '@oxygen-design/ui/tokens.css';
```

React 和 React DOM 是 peerDependencies。使用方无需安装 Tailwind CSS，也无需访问
本仓库的源文件。

发布包提供 ESM 入口，使用 `import` 或 bundler 消费；当前不提供 CommonJS `require()`
入口。组件包包含客户端交互边界，服务端组件框架请从客户端模块引入并按框架规则渲染。

## 发布流程

当前 `@oxygen-design/ui` 和 `@oxygen-design/patterns` 的版本均为 `0.1.0`，两个
软件包独立版本管理。后续兼容性修复使用 patch changeset，兼容的公开功能新增使用
minor changeset，破坏性 API 变更使用 major changeset。

发布工作流会创建版本更新拉取请求，并在合并后运行 `pnpm release`。优先使用 npm
Trusted Publishing。如果 npm 账号无法使用 Trusted Publishing，请在本仓库之外配置
权限范围明确的 `NPM_TOKEN`。软件包将以公开权限发布。

本地脚手架不会自动创建 GitHub remote、npm 组织、Trusted Publisher、token 或软件包
发布记录。
