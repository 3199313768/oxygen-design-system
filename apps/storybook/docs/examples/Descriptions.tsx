import { Descriptions } from "@oxygen-design/ui";
import "@oxygen-design/ui/styles.css";

export function Example(props: { bordered: boolean; column: 1 | 2 | 3 | 4; loading: boolean; error: boolean; empty: boolean }) {
  return <div style={{ display: "grid", gap: "var(--oxygen-space-4)", minWidth: 0 }}>
    <Descriptions bordered={props.bordered} column={props.column} loading={props.loading} error={props.error ? "详情加载失败" : undefined} title="基本信息" items={props.empty ? [] : [{ key: "name", label: "名称", children: "示例条目" }, { key: "version", label: "版本", children: "1.0.0" }]} />
  </div>;
}
