import { ImagePreview } from "@oxygen-design/ui";
import "@oxygen-design/ui/styles.css";

export function Example(props: { alt: string; width: number }) {
  return <div style={{ display: "grid", gap: "var(--oxygen-space-4)", minWidth: 0 }}>
    <ImagePreview {...props} src={"data:image/svg+xml,%3Csvg xmlns=\"http://www.w3.org/2000/svg\" width=\"320\" height=\"180\"%3E%3Crect width=\"320\" height=\"180\" fill=\"%23336699\"/%3E%3Ctext x=\"24\" y=\"100\" fill=\"white\" font-size=\"28\"%3EOxygen%3C/text%3E%3C/svg%3E"} fallback="图片不可用" />
  </div>;
}
