# 主题接入

Oxygen 支持浅色、深色和显式跟随系统。默认浅色；主题切换只改变表现，不重置组件值、打开状态或焦点。

## 应用接入

```tsx
import { useState } from 'react';
import { ConfigProvider, Input, type OxygenTheme } from '@oxygen-design/ui';
import '@oxygen-design/ui/styles.css';

export function App() {
  const [theme, setTheme] = useState<OxygenTheme>('light');
  return (
    <ConfigProvider theme={theme}>
      <main style={{ background: 'var(--oxygen-color-background)', color: 'var(--oxygen-color-text)' }}>
        <label htmlFor="theme">主题</label>
        <select id="theme" value={theme} onChange={(event) => {
          const value = event.target.value;
          if (value === 'light' || value === 'dark' || value === 'system') setTheme(value);
        }}>
          <option value="light">浅色</option>
          <option value="dark">深色</option>
          <option value="system">跟随系统</option>
        </select>
        <Input aria-label="备注" />
      </main>
    </ConfigProvider>
  );
}
```

`ConfigProviderProps.theme` 为可选的 `OxygenTheme = 'light' | 'dark' | 'system'`。该 Provider 是受控配置，不提供内置切换按钮、存储或账户偏好服务。未指定 theme 的嵌套 Provider 继承最近的显式模式；没有 React 模式时保持宿主 CSS 主题边界，宿主未配置则为浅色。

Provider 继续使用 `display: contents`，不新增布局盒或替宿主绘制整页背景。页面、卡片等实际容器应使用语义 Token 设置背景与文字，不能只改文字而保留另一主题的背景。

## 全局主题与首次加载

只包裹应用不能改变 Provider 外部的页面背景、根滚动条或浏览器初始画布。全局模式由宿主同时设置 HTML 属性和 Provider；初始化必须在首次渲染前完成，不能等异步恢复偏好后才首次确定主题。

```html
<html lang="zh-CN" data-oxygen-theme="dark">
  <head>
    <meta name="color-scheme" content="dark">
    <!-- 在页面初次绘制前加载预编译样式 -->
  </head>
</html>
```

初始化策略：浅色对应 `data-oxygen-theme="light"` 与 meta `light`；深色对应 `dark` 与 meta `dark`；跟随系统对应 `system` 与 meta `light dark`。宿主负责根据偏好生成初始 HTML，并使用相同初值渲染 `<ConfigProvider theme={initialTheme}>`。SSR 与 hydration 的初始选择应一致。客户端应用如需从存储恢复，应在宿主启动脚本中完成，遵循宿主 CSP；库不注入启动脚本。

用户改变模式时，宿主可以在自己的事件处理中同步根属性与受控值：

```tsx
function changeTheme(next: OxygenTheme) {
  document.documentElement.dataset.oxygenTheme = next;
  setTheme(next); // 宿主自身的 React state setter
}
```

这段事件处理仅在浏览器执行；服务端生成 HTML 时不访问 `document`。库自身不修改 HTML、body、宿主 class 或 localStorage。示例 workbench 和 Storybook 的根属性更新属于宿主演示代码。

## 局部主题与 Portal

```tsx
<ConfigProvider theme="dark">
  <section style={{ background: 'var(--oxygen-color-surface)', color: 'var(--oxygen-color-text)' }}>
    <Input aria-label="深色区域备注" />
    <ConfigProvider locale={{ common: { close: '关闭' } }}>
      {/* 未指定 theme，继续继承 dark */}
    </ConfigProvider>
    <ConfigProvider theme="light">
      <section style={{ background: 'var(--oxygen-color-surface)', color: 'var(--oxygen-color-text)' }}>
        <Input aria-label="浅色区域备注" />
      </section>
    </ConfigProvider>
  </section>
</ConfigProvider>
```

局部主题不修改 HTML。Oxygen 的 Dialog、AlertDialog、Sheet、Popover、Tooltip、Select、DropdownMenu（含子菜单）及 Toast 内容携带 React 来源区域的主题属性，因此挂载到 body 或其他 Portal 容器后仍使用所属模式。Notification 和 Message 复用 Toast，同样遵循该行为。主题变化更新已有节点，不以 theme 作为 key 重新挂载组件。

CSS 属性 `data-oxygen-theme` 也可用于非 React 的 Token 消费方；但纯 DOM 局部属性不能跨越 React Portal 传递。需要浮层的 React 区域应使用 `ConfigProvider theme`；全局 HTML 属性则自然覆盖 body 下的默认浮层。

Portal 传递的是主题模式，不会复制触发器区域任意 CSS 变量、字体、密度或宿主选择器。自定义 Token 若需跨 Portal 生效，可在库样式之后加载的全局样式表中同时匹配 `:root` 与 `[data-oxygen-theme]` 边界进行覆盖（只改 `:root` 会被局部映射重置），或给对应 Content/Toast 的 `className`、`style` 配置同样的覆盖。不要假定 `.local-region .oxygen-dialog` 能匹配挂在 body 的弹窗。

## 跟随系统与原生控件

`system` 通过作用域内的 `prefers-color-scheme` 媒体查询及 `color-scheme: light dark` 实现，无需 JS 媒体订阅；系统变化自动更新 Token 和原生表单控件。显式 light/dark 不受系统变化影响。浅色与深色 Token 使用明确的映射，不依赖 `light-dark()` 支持，也不对整页应用滤镜。

日期、时间、选择和滚动条采用浏览器相应的原生配色能力。浏览器与操作系统仍决定原生控件的具体外观，不承诺跨平台逐像素一致。业务图表需要宿主自行提供对应配色与系统偏好订阅；图片、视频和二维码数据色不被全局反色。

## Token 与覆盖

颜色、尺寸等公共变量沿用 `--oxygen-*` 命名。新增主题角色包括浮层表面 `--oxygen-color-surface-popup`、危险操作前景 `--oxygen-color-error-foreground`、遮罩 `--oxygen-color-overlay`、Tooltip 前景/背景与状态填充等；完整值见 [tokens.css](../packages/ui/src/styles/tokens.css)。

浅色沿用原有色值，深色采用冷中性背景、略亮内容表面和更亮的浮层。主要与危险按钮的前景在深色中分别校准，不固定使用白字。Tooltip 保持稳定的深底浅字配对。

同时导入 `styles.css` 和 `tokens.css` 的既有用法保持支持；只需组件样式时，`styles.css` 已包含 Token，无需重复导入。Token-only 消费方单独导入 `tokens.css` 后也可使用主题边界。

## 示例与验证

- Storybook 工具栏可切换所有示例的浅色、深色和跟随系统；“基础/主题”提供主题隔离与状态示例。
- `pnpm workbench` 提供完整打包消费页面、页面主题选择及相反局部主题。
- `pnpm verify:workbench` 验证实际 tarball 消费的完整流程和主题行为；`--project=chromium` 可用于针对性验证。
- 主题单测位于 `packages/ui/tests/theme.test.tsx`；浏览器行为与配色回归位于 `tests/browser/theme.spec.ts`。

具体执行结果与截图索引见 [实施验收记录](reviews/2026-10-30-dark-theme.md)。浏览器引擎与触屏模拟不替代实体设备、人工读屏或所有宿主业务应用验收。
