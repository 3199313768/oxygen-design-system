import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, Button, Input } from "@oxygen-design/ui";
import "@oxygen-design/ui/styles.css";

export function Example(props: { title: string; description: string }) {
  return <div style={{ display: "grid", gap: "var(--oxygen-space-4)", minWidth: 0 }}>
    <Dialog><DialogTrigger asChild><Button>打开Dialog</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>{props.title}</DialogTitle><DialogDescription>{props.description}</DialogDescription></DialogHeader><Input aria-label="弹窗备注" placeholder="输入备注" /></DialogContent></Dialog>
  </div>;
}
