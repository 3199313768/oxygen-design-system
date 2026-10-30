import { useState } from "react";
import { Switch } from "@oxygen-design/ui";
import "@oxygen-design/ui/styles.css";

export function Example(props: { disabled: boolean }) {
  const [checked, setChecked] = useState<boolean>(false);
  return <div style={{ display: "grid", gap: "var(--oxygen-space-4)", minWidth: 0 }}>
    <label><Switch {...props} checked={checked} onCheckedChange={setChecked} /> 启用提醒</label><output aria-live="polite">{checked ? "已启用" : "已关闭"}</output>
  </div>;
}
