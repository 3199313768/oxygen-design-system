import { Skeleton } from "@oxygen-design/ui";
import "@oxygen-design/ui/styles.css";

export function Example(props: { variant: "text" | "circle" | "rectangle" }) {
  return <div style={{ display: "grid", gap: "var(--oxygen-space-4)", minWidth: 0 }}>
    <Skeleton {...props} aria-label="正在加载内容" />
  </div>;
}
