import { useState } from "react";
import { Message, ToastProvider, ToastViewport, Button } from "@oxygen-design/ui";
import "@oxygen-design/ui/styles.css";

export function Example(props: { tone: "default" | "success" | "warning" | "error"; duration: number }) {
  const [open, setOpen] = useState<boolean>(false);
  return <div style={{ display: "grid", gap: "var(--oxygen-space-4)", minWidth: 0 }}>
    <ToastProvider><Button onClick={() => setOpen(true)}>显示通知</Button><Message {...props} open={open} onOpenChange={setOpen}>操作已完成</Message><ToastViewport /></ToastProvider>
  </div>;
}
