import { Tree } from "@oxygen-design/ui";
import "@oxygen-design/ui/styles.css";

export function Example(props: { disabled: boolean; checkable: boolean }) {
  return <div style={{ display: "grid", gap: "var(--oxygen-space-4)", minWidth: 0 }}>
    <Tree {...props} aria-label="目录" defaultExpandAll treeData={[{ key: "design", label: "设计", children: [{ key: "visual", label: "视觉" }, { key: "disabled", label: "停用目录", disabled: true }] }, { key: "engineering", label: "工程" }]} />
  </div>;
}
