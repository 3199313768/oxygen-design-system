import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription, Button, Input } from "@oxygen-design/ui";
import "@oxygen-design/ui/styles.css";

export function Example(props: { title: string; description: string; side: "top" | "right" | "bottom" | "left" }) {
  return <div style={{ display: "grid", gap: "var(--oxygen-space-4)", minWidth: 0 }}>
    <Sheet><SheetTrigger asChild><Button>打开Sheet</Button></SheetTrigger><SheetContent side={props.side}><SheetHeader><SheetTitle>{props.title}</SheetTitle><SheetDescription>{props.description}</SheetDescription></SheetHeader><Input aria-label="弹窗备注" placeholder="输入备注" /></SheetContent></Sheet>
  </div>;
}
