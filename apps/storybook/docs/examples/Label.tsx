import { Label, Input } from "@oxygen-design/ui";
import "@oxygen-design/ui/styles.css";

export function Example(props: { children: string; required: boolean }) {
  return <div style={{ display: "grid", gap: "var(--oxygen-space-4)", minWidth: 0 }}>
    <Label htmlFor="example-name">{props.children}{props.required ? "（必填）" : ""}</Label><Input id="example-name" required={props.required} placeholder="点击标签可聚焦" />
  </div>;
}
