import { Alert, AlertTitle, AlertDescription } from "@oxygen-design/ui";
import "@oxygen-design/ui/styles.css";

export function Example(props: { tone: "info" | "success" | "warning" | "error"; title: string; description: string }) {
  return <div style={{ display: "grid", gap: "var(--oxygen-space-4)", minWidth: 0 }}>
    <Alert tone={props.tone}><AlertTitle>{props.title}</AlertTitle><AlertDescription>{props.description}</AlertDescription></Alert>
  </div>;
}
