import { Popover, PopoverTrigger, PopoverContent, PopoverClose, Button } from "@oxygen-design/ui";
import "@oxygen-design/ui/styles.css";

export function Example(props: { side: "top" | "right" | "bottom" | "left"; align: "start" | "center" | "end" }) {
  return <div style={{ display: "grid", gap: "var(--oxygen-space-4)", minWidth: 0 }}>
    <Popover><PopoverTrigger asChild><Button>打开气泡</Button></PopoverTrigger><PopoverContent {...props} aria-label="补充信息"><p>补充说明或轻量操作</p><PopoverClose asChild><Button variant="secondary">关闭气泡</Button></PopoverClose></PopoverContent></Popover>
  </div>;
}
