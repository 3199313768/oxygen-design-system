import { useState } from "react";
import { RadioGroup, RadioGroupItem } from "@oxygen-design/ui";
import "@oxygen-design/ui/styles.css";

export function Example(props: { disabled: boolean; orientation: "horizontal" | "vertical" }) {
  const [text, setText] = useState<string>("");
  return <div style={{ display: "grid", gap: "var(--oxygen-space-4)", minWidth: 0 }}>
    <RadioGroup {...props} aria-label="通知频率" value={text} onValueChange={setText}><label><RadioGroupItem value="daily" /> 每天</label><label><RadioGroupItem value="weekly" /> 每周</label><label><RadioGroupItem value="never" disabled /> 暂不可选</label></RadioGroup><output aria-live="polite">已选：{text || "无"}</output>
  </div>;
}
