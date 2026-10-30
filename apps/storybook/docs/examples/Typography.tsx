import { Typography } from "@oxygen-design/ui";
import "@oxygen-design/ui/styles.css";

export function Example(props: { children: string; type: "secondary" | "success" | "warning" | "danger"; strong: boolean }) {
  return <div style={{ display: "grid", gap: "var(--oxygen-space-4)", minWidth: 0 }}>
    <Typography.Paragraph><Typography.Text {...props} /></Typography.Paragraph>
  </div>;
}
