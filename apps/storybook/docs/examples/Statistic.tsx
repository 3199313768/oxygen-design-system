import { Statistic } from "@oxygen-design/ui";
import "@oxygen-design/ui/styles.css";

export function Example(props: { value: number; precision: number; loading: boolean; error: boolean }) {
  return <div style={{ display: "grid", gap: "var(--oxygen-space-4)", minWidth: 0 }}>
    <Statistic title="已完成" value={props.value} precision={props.precision} suffix="项" loading={props.loading} error={props.error ? "统计不可用" : undefined} />
  </div>;
}
