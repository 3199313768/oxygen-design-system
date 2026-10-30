import { Spin } from "@oxygen-design/ui";
import "@oxygen-design/ui/styles.css";

export function Example(props: { spinning: boolean; tip: string }) {
  return <div style={{ display: "grid", gap: "var(--oxygen-space-4)", minWidth: 0 }}>
    <Spin {...props}><p>内容区域</p></Spin>
  </div>;
}
