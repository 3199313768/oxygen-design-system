import { Timeline } from "@oxygen-design/ui";
import "@oxygen-design/ui/styles.css";

export function Example(props: { loading: boolean; empty: boolean }) {
  return <div style={{ display: "grid", gap: "var(--oxygen-space-4)", minWidth: 0 }}>
    <Timeline aria-label="更新记录" loading={props.loading} items={props.empty ? [] : [{ key: "created", label: "09:00", children: "已创建", status: "success" }, { key: "pending", label: "10:00", children: "等待更新", status: "pending" }]} />
  </div>;
}
