import { useState } from "react";
import { Button } from "@oxygen-design/ui";
import "@oxygen-design/ui/styles.css";

export function Example(props: { children: string; variant: "default" | "secondary" | "ghost" | "link" | "destructive"; size: "default" | "sm" | "icon"; disabled: boolean; loading: boolean }) {
  const [count, setCount] = useState<number>(0);
  return <div style={{ display: "grid", gap: "var(--oxygen-space-4)", minWidth: 0 }}>
    <Button {...props} type="button" onClick={() => setCount(count + 1)} />
      <output aria-live="polite">操作次数：{count}</output>
  </div>;
}
