import { Accordion } from "@oxygen-design/ui";
import "@oxygen-design/ui/styles.css";

export function Example(props: { type: "single" | "multiple"; collapsible: boolean; disabled: boolean }) {
  return <div style={{ display: "grid", gap: "var(--oxygen-space-4)", minWidth: 0 }}>
    <Accordion {...props} items={[{ key: "overview", title: "概览", children: "概览内容" }, { key: "details", title: "详细信息", children: "详细内容" }, { key: "disabled", title: "不可用项", children: "暂不可用", disabled: true }]} />
  </div>;
}
