import { useState } from "react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@oxygen-design/ui";
import "@oxygen-design/ui/styles.css";

export function Example(props: { disabled: boolean }) {
  const [text, setText] = useState<string>("");
  return <div style={{ display: "grid", gap: "var(--oxygen-space-4)", minWidth: 0 }}>
    <Select disabled={props.disabled} value={text} onValueChange={setText}><SelectTrigger aria-label="选择城市"><SelectValue placeholder="请选择" /></SelectTrigger><SelectContent><SelectItem value="beijing">北京</SelectItem><SelectItem value="shanghai">上海</SelectItem><SelectItem value="unavailable" disabled>暂不可选</SelectItem></SelectContent></Select><output aria-live="polite">已选：{text || "无"}</output>
  </div>;
}
