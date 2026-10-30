import { useState } from "react";
import { Result, Button } from "@oxygen-design/ui";
import "@oxygen-design/ui/styles.css";

export function Example(props: { status: "success" | "error" | "info" | "warning" | "403" | "404" | "500"; title: string; subTitle: string }) {
  const [count, setCount] = useState<number>(0);
  return <div style={{ display: "grid", gap: "var(--oxygen-space-4)", minWidth: 0 }}>
    <Result {...props} extra={<Button onClick={() => setCount(count + 1)}>继续 {count}</Button>} />
  </div>;
}
