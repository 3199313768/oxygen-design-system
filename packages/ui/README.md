# @oxygen-design/ui

Oxygen React 基础组件、预编译样式、设计令牌和图标。提供 ESM 和 TypeScript 声明。

```bash
pnpm add @oxygen-design/ui react react-dom
```

```tsx
import { Button } from '@oxygen-design/ui';
import '@oxygen-design/ui/styles.css';

export function Example() {
  return <Button>确认</Button>;
}
```

也可单独引入 `@oxygen-design/ui/tokens.css`。无需安装 Tailwind；交互组件在服务端组件
框架中应从客户端模块使用。

[源码和完整文档](https://github.com/3199313768/oxygen-design-system) ·
[问题反馈](https://github.com/3199313768/oxygen-design-system/issues)

采用 [MIT 许可证](LICENSE)。第三方依赖遵循各自的许可证。
