import { Divider } from "@oxygen-design/ui";
import "@oxygen-design/ui/styles.css";

export function Example(props: { children: string; orientation: "left" | "center" | "right"; type: "horizontal" | "vertical" }) {
  return <div style={{ display: "grid", gap: "var(--oxygen-space-4)", minWidth: 0 }}>
    <p>第一组内容</p><Divider {...props} /><p>第二组内容</p>
  </div>;
}
