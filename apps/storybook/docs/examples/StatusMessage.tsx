import { useState } from "react";
import { StatusMessage } from "@oxygen-design/patterns";
import "@oxygen-design/ui/styles.css";
import "@oxygen-design/patterns/styles.css";

export function Example(props: { tone: "info" | "success" | "warning" | "error"; children: string }) {
  const [count, setCount] = useState<number>(0);
  return <div style={{ display: "grid", gap: "var(--oxygen-space-4)", minWidth: 0 }}>
    <StatusMessage {...props} action={<button type="button" onClick={() => setCount(count + 1)}>重试 {count}</button>} />
  </div>;
}
