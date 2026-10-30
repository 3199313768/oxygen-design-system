import { ConfigProvider, Button, Input } from "@oxygen-design/ui";
import "@oxygen-design/ui/styles.css";

export function Example(props: { density: "default" | "compact"; theme: "light" | "dark" | "system" }) {
  return <div style={{ display: "grid", gap: "var(--oxygen-space-4)", minWidth: 0 }}>
    <ConfigProvider {...props}><Input aria-label="配置示例输入" placeholder="输入内容" /><Button>示例按钮</Button></ConfigProvider>
  </div>;
}
