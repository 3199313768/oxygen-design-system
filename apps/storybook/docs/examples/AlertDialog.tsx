import { useState } from "react";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, Button, Input, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@oxygen-design/ui";
import "@oxygen-design/ui/styles.css";

export function Example(props: { title: string; description: string }) {
  const [count, setCount] = useState<number>(0);
  return <div style={{ display: "grid", gap: "var(--oxygen-space-4)", minWidth: 0 }}>
    <AlertDialog><AlertDialogTrigger asChild><Button>打开AlertDialog</Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>{props.title}</AlertDialogTitle><AlertDialogDescription>{props.description}</AlertDialogDescription></AlertDialogHeader><Input aria-label="弹窗备注" placeholder="输入备注" /><AlertDialogFooter><AlertDialogCancel>取消</AlertDialogCancel><AlertDialogAction onClick={() => setCount(count + 1)}>确认</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog><output aria-live="polite">确认次数：{count}</output>
  </div>;
}
