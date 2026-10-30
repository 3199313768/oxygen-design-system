import { useState } from "react";
import { Combobox } from "@oxygen-design/ui";
import "@oxygen-design/ui/styles.css";

export function Example(props: { placeholder: string; disabled: boolean }) {
  const [text, setText] = useState<string>("");
  return <div style={{ display: "grid", gap: "var(--oxygen-space-4)", minWidth: 0 }}>
    <Combobox {...props} aria-label="选择内容" options={[{ label: "设计", value: "design" }, { label: "工程", value: "engineering" }]} onChange={(value) => setText(value ?? "")} /><output aria-live="polite">已选：{text || "请使用选择控件"}</output>
  </div>;
}
