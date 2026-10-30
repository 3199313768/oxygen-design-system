# @oxygen-design/patterns

Oxygen 通用页面组合：AppShell、EmptyState、PageHeader 和 StatusMessage。
不包含具体业务的数据访问、路由或状态管理。

```bash
pnpm add @oxygen-design/patterns @oxygen-design/ui react react-dom
```

```tsx
import { PageHeader } from '@oxygen-design/patterns';
import '@oxygen-design/ui/styles.css';
import '@oxygen-design/patterns/styles.css';

export function Example() {
  return <PageHeader title="项目列表" />;
}
```

提供 ESM 和 TypeScript 声明；交互组件在服务端组件框架中应从客户端模块使用。

[源码和完整文档](https://github.com/3199313768/oxygen-design-system) ·
[问题反馈](https://github.com/3199313768/oxygen-design-system/issues)

采用 [MIT 许可证](LICENSE)。第三方依赖遵循各自的许可证。
