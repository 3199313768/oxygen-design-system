import { useState } from "react";
import { TreeSelect } from "@oxygen-design/ui";
import "@oxygen-design/ui/styles.css";

export function Example(props: { placeholder: string; disabled: boolean }) {
  const [text, setText] = useState<string>("");
  return <div style={{ display: "grid", gap: "var(--oxygen-space-4)", minWidth: 0 }}>
    <TreeSelect {...props} aria-label="选择内容" treeData={[{ key: "design", label: "设计", children: [{ key: "visual", label: "视觉" }] }, { key: "engineering", label: "工程" }]} onChange={(value) => setText(value ?? "")} /><output aria-live="polite">已选：{text || "请使用选择控件"}</output>
  </div>;
}
