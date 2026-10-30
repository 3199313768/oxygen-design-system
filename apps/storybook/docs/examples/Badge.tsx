import { Badge } from "@oxygen-design/ui";
import "@oxygen-design/ui/styles.css";

export function Example(props: { children: string; variant: "default" | "secondary" | "outline" | "success" | "warning" | "error" }) {
  return <div style={{ display: "grid", gap: "var(--oxygen-space-4)", minWidth: 0 }}>
    <Badge {...props} />
  </div>;
}
