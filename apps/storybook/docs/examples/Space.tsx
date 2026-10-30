import { Space, Button } from "@oxygen-design/ui";
import "@oxygen-design/ui/styles.css";

export function Example(props: { direction: "horizontal" | "vertical"; size: "small" | "middle" | "large"; wrap: boolean }) {
  return <div style={{ display: "grid", gap: "var(--oxygen-space-4)", minWidth: 0 }}>
    <Space {...props}><Button>操作一</Button><Button variant="secondary">操作二</Button><Button variant="ghost">操作三</Button></Space>
  </div>;
}
