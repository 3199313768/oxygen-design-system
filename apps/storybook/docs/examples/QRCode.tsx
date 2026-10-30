import { QRCode } from "@oxygen-design/ui";
import "@oxygen-design/ui/styles.css";

export function Example(props: { value: string; size: number; includeMargin: boolean }) {
  return <div style={{ display: "grid", gap: "var(--oxygen-space-4)", minWidth: 0 }}>
    <QRCode {...props} aria-label="示例地址二维码" /><a href={props.value.startsWith("https://") ? props.value : "#"}>可访问的文本地址</a>
  </div>;
}
