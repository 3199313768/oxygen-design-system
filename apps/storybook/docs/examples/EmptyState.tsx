import { useState } from "react";
import { EmptyState } from "@oxygen-design/patterns";
import "@oxygen-design/ui/styles.css";
import "@oxygen-design/patterns/styles.css";

export function Example(props: { title: string; description: string }) {
  const [count, setCount] = useState<number>(0);
  return <div style={{ display: "grid", gap: "var(--oxygen-space-4)", minWidth: 0 }}>
    <EmptyState {...props} action={<button type="button" onClick={() => setCount(count + 1)}>新增 {count}</button>} />
  </div>;
}
