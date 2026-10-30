import { useState } from "react";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@oxygen-design/ui";
import "@oxygen-design/ui/styles.css";

export function Example(props: { disabled: boolean }) {
  const [open, setOpen] = useState<boolean>(false);
  return <div style={{ display: "grid", gap: "var(--oxygen-space-4)", minWidth: 0 }}>
    <Collapsible {...props} open={open} onOpenChange={setOpen}><CollapsibleTrigger>显示更多信息</CollapsibleTrigger><CollapsibleContent>这里是补充内容。</CollapsibleContent></Collapsible><output aria-live="polite">{open ? "已展开" : "已收起"}</output>
  </div>;
}
