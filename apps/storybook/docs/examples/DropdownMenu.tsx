import { useState } from "react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, Button } from "@oxygen-design/ui";
import "@oxygen-design/ui/styles.css";

export function Example(props: { disabled: boolean }) {
  const [count, setCount] = useState<number>(0);
  return <div style={{ display: "grid", gap: "var(--oxygen-space-4)", minWidth: 0 }}>
    <DropdownMenu><DropdownMenuTrigger asChild><Button disabled={props.disabled}>更多操作</Button></DropdownMenuTrigger><DropdownMenuContent><DropdownMenuItem onSelect={() => setCount(count + 1)}>复制条目</DropdownMenuItem><DropdownMenuSeparator /><DropdownMenuItem disabled>不可用操作</DropdownMenuItem></DropdownMenuContent></DropdownMenu><output aria-live="polite">已操作 {count} 次</output>
  </div>;
}
