# 完整页面消费验收

`tests/workbench` 是独立的 Vite 使用方，组合基础包与 patterns 的公开入口。运行时会构建、打包两个包，复制页面到临时目录，再通过 `file:*.tgz` 安装；不使用 workspace 链接或源码 alias。原有 `tests/consumer` 和 `verify:package` 继续验证最小安装契约。

## 本地使用

要求 Node >=22.22.2、pnpm 11.9.0。首次使用安装依赖与浏览器：

```bash
pnpm install --frozen-lockfile
pnpm exec playwright install chromium firefox webkit
```

交互预览：

```bash
pnpm workbench
```

访问终端中的 `http://127.0.0.1:4173`。端口占用时明确失败，不复用其他服务；可使用 `OXYGEN_WORKBENCH_PORT=4187 pnpm workbench` 或 `OXYGEN_WORKBENCH_PORT=4187 pnpm verify:workbench` 指定其他端口。退出时清理临时消费目录。

执行浏览器回归：

```bash
pnpm verify:workbench
pnpm verify:workbench --project=chromium
pnpm exec playwright show-report output/playwright/consumer/report
```

验证命令同时检查浏览器测试的 TypeScript、独立消费页面的 TypeScript 和生产构建。浏览器测试使用构建产物，不读取源组件。不要直接执行 `playwright test`，它需要 runner 提供临时构建路径。

## 页面交互约定

- 12 条确定的演示记录，默认每页 5 条。关键词和状态在点击“查询”后生效，同时回到第一页；重置和空态操作清除筛选。
- 编辑的名称去除首尾空格后必填，长度限制为 80 字符。取消、Escape 和关闭按钮丢弃草稿；保存更新内存记录，重新打开显示已保存值。
- 上传仅用本地计时器模拟，不发出请求。单个 `.txt` 文件最大 1 MB，可勾选“模拟上传失败”。上传中及失败附件阻止保存，移除文件后可重新选择；关闭编辑窗取消计时器。
- 名称、状态和附件元数据只保留在本次页面内存中，刷新恢复演示数据，不提供服务端存储或鉴权。
- 弹窗关闭后焦点回到编辑按钮；编辑导致记录不再匹配筛选时，回到关键词输入框。
- 窄屏筛选区按容器宽度堆叠，表格在命名且可聚焦的区域内滚动，保留表头语义；弹窗高度约束使用 `dvh`。

## 回归与证据

Playwright 配置包括桌面 Chromium、Firefox、WebKit 以及 390px Chromium 触屏模拟。检查筛选、分页、空态、编辑校验与草稿、保存后重新打开、附件成功/失败/移除/取消，以及页面溢出、弹窗边界和 Tab 焦点。

`output/playwright/consumer` 中生成 HTML 报告、桌面/窄屏截图及失败 trace。截图供人工复核，没有把截图生成称为像素基线比对。CI 的独立 `browser` job 安装相同锁定版本的浏览器，运行完整打包消费验收并保留 14 天证据。

WebKit 测试不代表真实 Safari 或 iOS 设备验收；本地通过也不代表远端 CI 已执行。该页验证完整的本地消费流程，真实业务应用的宿主样式、接口、权限和数据持久化仍需在相应应用中验收。

## 布局指导

- `responsive-table`：依据 “Use standard `<table>` elements” 保留既有组件的原生表头语义，并给外部滚动区名称与键盘焦点，避免窄屏内容只能用指针访问。
- `responsive-design`：依据 “Use dynamic viewport units” 用 `dvh` 约束弹窗高度；筛选布局使用容器查询，按容器可用宽度堆叠。
