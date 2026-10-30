# 组件文档站维护与公开托管

文档站基于现有 Storybook，提供 67 个组件/组件族入口、八项说明、181 个组件导出的 API，以及 Props/预览/完整代码联动的 Playground。原有综合示例与主题示例继续保留。

## 内容与源码

- `apps/storybook/docs/content/*.ts`：组件专属中文介绍、设计、限制、键盘/焦点说明和人工 API 注释。`propNotes` 支持 `属性` 及 `子组件名.属性`，后者优先。
- `apps/storybook/docs/examples/<Name>.tsx`：真实渲染和复制代码共用的示例实现，必须仅依赖公开包及 React，不能导入文档站内部辅助模块。
- `apps/storybook/docs/playgrounds.json`：初始参数、Controls 和状态示例。部分参数用于演示组合结构，实际组件/子组件的属性映射以完整代码为准。
- `apps/storybook/docs/api.generated.json`：TypeScript 编译器解析公开组件及类型，合并原生、Radix、CVA 属性；继承属性按需展开。不要手改生成文件。
- `apps/storybook/stories/components/*.stories.tsx`：稳定的独立组件路由，由内容和 Playground 清单生成；不要手改。

复合组件的参数在父组件页面按导出列出。FormItem、SpaceCompact 有独立入口。Icons 展示公开导出的 Lucide 图标，不承诺导出完整上游图标库。

复制的代码包含示例函数、所需导入、样式、状态和以当前参数调用的默认导出。它是当前工作区 API 的完整用法，使用前确认所安装的 npm 版本包含这些 API。Props 的文本只序列化为代码，不会在页面中求值执行。复制失败时保留可选中的完整代码并提示手动复制。

## 修改和检查

```bash
pnpm docs:generate
pnpm docs:check
pnpm typecheck
pnpm lint
pnpm test:tooling
pnpm storybook:build
pnpm verify:docs
```

新增公开组件时，同时维护内容、实际示例与 Playground 清单，再运行生成命令。`docs:check` 比较公开导出、人工文档、生成 API 及 Story；缺页、过期数据、重复名称、缺少状态或无法编译的复制代码均失败。它使用真实 TypeScript 类型校验初始值和每个状态的完整代码。

浏览器验收读取静态构建，覆盖全部入口的八项内容、参数与预览/代码更新、恢复默认、390px 布局和资源加载，并覆盖剪贴板成功/拒绝与复杂组件交互。日志、截图、trace、HTML 报告位于 `output/playwright/docs/`。

根目录 `pnpm verify` 包含文档一致性检查；现有 CI 的 `check` 和 `browser` 名称保留。CI 额外保存静态站与文档浏览器报告，尚未在本任务中触发远端运行。

## 本地查看

```bash
pnpm storybook
```

开发地址：`http://localhost:6006`。

```bash
pnpm storybook:build
pnpm docs:preview
```

静态预览：`http://127.0.0.1:6016`。用 `OXYGEN_DOCS_PORT` 可替换静态预览与文档浏览器测试端口。组件直接链接示例：`/?path=/docs/components-button--docs`。

## 公网托管

将 `apps/storybook/storybook-static/` 全部内容作为网站根目录发布到支持 HTTPS 的静态托管服务，包含 `index.html`、`iframe.html`、`index.json` 与 `assets/`。不要只上传首页，也不要把 workspace 源码目录作为网站根目录。

Storybook 的路由通过查询参数表达；测试首页及 `/?path=/docs/components-button--docs` 的直接访问与刷新。若平台配置了 SPA fallback，不能把缺失的 JS/CSS 也重写成 HTML。保留所有静态资源的正确 Content-Type。

发布到域名子路径时，在目标路径重新检查资源 URL、MDX 链接及刷新行为；本地根路径验证不代表已验证任意代理或子路径。剪贴板写入依赖 HTTPS/可信本机环境及浏览器权限，拒绝时页面提供手动复制。

源码仓库可以保持私有；构建站点里的组件实现、示例和文档会通过浏览器资源公开。本站示例不发起真实上传，不包含业务鉴权、生产凭证或私有 API 配置。

平台、域名和部署凭证尚未确定，本次只准备静态产物、CI artifact 和操作说明，不表示已经发布到公网。实际部署后还需验证域名、HTTPS、资源、直接链接和复制权限。
