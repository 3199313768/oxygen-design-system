import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent, Button } from "@oxygen-design/ui";
import "@oxygen-design/ui/styles.css";

export function Example(props: { side: "top" | "right" | "bottom" | "left"; children: string }) {
  return <div style={{ display: "grid", gap: "var(--oxygen-space-4)", minWidth: 0 }}>
    <TooltipProvider delayDuration={0}><Tooltip><TooltipTrigger asChild><Button>悬停或聚焦</Button></TooltipTrigger><TooltipContent side={props.side}>{props.children}</TooltipContent></Tooltip></TooltipProvider>
  </div>;
}
