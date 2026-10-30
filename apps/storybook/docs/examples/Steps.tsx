import { Steps } from "@oxygen-design/ui";
import "@oxygen-design/ui/styles.css";

export function Example(props: { current: number; direction: "horizontal" | "vertical"; status: "wait" | "process" | "finish" | "error" }) {
  return <div style={{ display: "grid", gap: "var(--oxygen-space-4)", minWidth: 0 }}>
    <Steps {...props} aria-label="处理步骤" items={[{ key: "prepare", title: "准备" }, { key: "process", title: "处理" }, { key: "done", title: "完成" }]} />
  </div>;
}
