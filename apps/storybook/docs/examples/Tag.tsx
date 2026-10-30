import { useState } from "react";
import { Tag } from "@oxygen-design/ui";
import "@oxygen-design/ui/styles.css";

export function Example(props: { children: string; closable: boolean; tone: "default" | "primary" | "success" | "warning" | "error" }) {
  const [count, setCount] = useState<number>(0);
  return <div style={{ display: "grid", gap: "var(--oxygen-space-4)", minWidth: 0 }}>
    <Tag {...props} onClose={() => setCount(count + 1)} /><output aria-live="polite">移除事件：{count} 次；是否保留由宿主决定</output>
  </div>;
}
