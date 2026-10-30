import { Breadcrumb } from "@oxygen-design/ui";
import "@oxygen-design/ui/styles.css";

export function Example(props: { separator: string }) {
  return <div style={{ display: "grid", gap: "var(--oxygen-space-4)", minWidth: 0 }}>
    <Breadcrumb {...props} items={[{ label: "首页", href: "#home" }, { label: "组件库", href: "#library" }, { label: "当前页面" }]} />
  </div>;
}
