import { SpaceCompact, Input, Button } from "@oxygen-design/ui";
import "@oxygen-design/ui/styles.css";

export function Example(props: { block: boolean }) {
  return <div style={{ display: "grid", gap: "var(--oxygen-space-4)", minWidth: 0 }}>
    <SpaceCompact {...props}><Input aria-label="查询关键词" placeholder="输入关键词" /><Button>查询</Button></SpaceCompact>
  </div>;
}
