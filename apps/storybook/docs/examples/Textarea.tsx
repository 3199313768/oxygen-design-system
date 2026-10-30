import { useState } from "react";
import { Textarea } from "@oxygen-design/ui";
import "@oxygen-design/ui/styles.css";

export function Example(props: { placeholder: string; disabled: boolean; readOnly: boolean; rows: number }) {
  const [text, setText] = useState<string>("");
  return <div style={{ display: "grid", gap: "var(--oxygen-space-4)", minWidth: 0 }}>
    <Textarea {...props} aria-label="示例说明" value={text} onChange={(event) => setText(event.target.value)} /><output aria-live="polite">已输入 {text.length} 个字符</output>
  </div>;
}
