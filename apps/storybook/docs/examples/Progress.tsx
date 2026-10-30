import { Progress } from "@oxygen-design/ui";
import "@oxygen-design/ui/styles.css";

export function Example(props: { percent: number; status: "normal" | "active" | "success" | "exception"; showInfo: boolean }) {
  return <div style={{ display: "grid", gap: "var(--oxygen-space-4)", minWidth: 0 }}>
    <Progress {...props} aria-label="处理进度" />
  </div>;
}
