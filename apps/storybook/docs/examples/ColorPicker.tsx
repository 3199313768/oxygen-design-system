import { useState } from "react";
import { ColorPicker } from "@oxygen-design/ui";
import "@oxygen-design/ui/styles.css";

export function Example(props: { disabled: boolean; loading: boolean }) {
  const [color, setColor] = useState<string>("#336699");
  return <div style={{ display: "grid", gap: "var(--oxygen-space-4)", minWidth: 0 }}>
    <ColorPicker {...props} aria-label="主题色" value={color} onChange={setColor} /><output aria-live="polite">已确认颜色：{color}</output>
  </div>;
}
