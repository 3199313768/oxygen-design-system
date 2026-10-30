import { Search, Check, Button } from "@oxygen-design/ui";
import "@oxygen-design/ui/styles.css";

export function Example(props: { size: number; strokeWidth: number }) {
  return <div style={{ display: "grid", gap: "var(--oxygen-space-4)", minWidth: 0 }}>
    <Search {...props} aria-hidden="true" /><Check {...props} aria-hidden="true" /><Button aria-label="搜索" size="icon"><Search {...props} aria-hidden="true" /></Button>
  </div>;
}
