import { useState } from "react";
import { Toast, ToastProvider, ToastViewport, Button, ToastTitle, ToastDescription, ToastClose } from "@oxygen-design/ui";
import "@oxygen-design/ui/styles.css";

export function Example(props: { tone: "default" | "success" | "warning" | "error"; duration: number }) {
  const [open, setOpen] = useState<boolean>(false);
  return <div style={{ display: "grid", gap: "var(--oxygen-space-4)", minWidth: 0 }}>
    <ToastProvider><Button onClick={() => setOpen(true)}>显示通知</Button><Toast {...props} open={open} onOpenChange={setOpen}><ToastTitle>提示</ToastTitle><ToastDescription>操作已完成</ToastDescription><ToastClose aria-label="关闭" /></Toast><ToastViewport /></ToastProvider>
  </div>;
}
