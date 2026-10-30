import { useState } from "react";
import { TagInput } from "@oxygen-design/ui";
import "@oxygen-design/ui/styles.css";

export function Example(props: { disabled: boolean; placeholder: string }) {
  const [tags, setTags] = useState<string[]>([]);
  return <div style={{ display: "grid", gap: "var(--oxygen-space-4)", minWidth: 0 }}>
    <TagInput {...props} aria-label="标签" value={tags} onChange={setTags} /><output aria-live="polite">标签：{tags.join("、") || "无"}</output>
  </div>;
}
