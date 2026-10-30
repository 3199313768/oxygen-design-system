import { useState } from "react";
import { Transfer } from "@oxygen-design/ui";
import "@oxygen-design/ui/styles.css";

export function Example(props: { disabled: boolean; showSearch: boolean }) {
  const [tags, setTags] = useState<string[]>([]);
  return <div style={{ display: "grid", gap: "var(--oxygen-space-4)", minWidth: 0 }}>
    <Transfer {...props} aria-label="分配选项" sourceItems={[{ label: "设计", value: "design" }, { label: "工程", value: "engineering" }, { label: "停用选项", value: "disabled", disabled: true }]} targetKeys={tags} onChange={setTags} /><output aria-live="polite">目标项：{tags.join("、") || "无"}</output>
  </div>;
}
