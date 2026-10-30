import { useState } from "react";
import { Input } from "@oxygen-design/ui";
import "@oxygen-design/ui/styles.css";

export function Example(props: { placeholder: string; disabled: boolean; readOnly: boolean; required: boolean }) {
  const [text, setText] = useState<string>("");
  return <div style={{ display: "grid", gap: "var(--oxygen-space-4)", minWidth: 0 }}>
    <Input {...props} aria-label="示例输入" value={text} onChange={(event) => setText(event.target.value)} /><output aria-live="polite">当前值：{text || "未输入"}</output>
  </div>;
}
