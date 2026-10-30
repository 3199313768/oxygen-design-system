import { useState } from "react";
import { Checkbox } from "@oxygen-design/ui";
import "@oxygen-design/ui/styles.css";

export function Example(props: { disabled: boolean }) {
  const [checked, setChecked] = useState<boolean>(false);
  return <div style={{ display: "grid", gap: "var(--oxygen-space-4)", minWidth: 0 }}>
    <label><Checkbox {...props} checked={checked} onCheckedChange={(value) => setChecked(value === true)} /> 接收更新</label><output aria-live="polite">{checked ? "已勾选" : "未勾选"}</output>
  </div>;
}
