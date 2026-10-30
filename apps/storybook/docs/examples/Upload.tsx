import { Upload } from "@oxygen-design/ui";
import "@oxygen-design/ui/styles.css";

export function Example(props: { disabled: boolean; multiple: boolean; maxSize: number }) {
  return <div style={{ display: "grid", gap: "var(--oxygen-space-4)", minWidth: 0 }}>
    <Upload {...props} aria-label="选择附件" customRequest={(_file, handlers) => { handlers.onProgress(100); handlers.onSuccess("https://example.com/mock-file"); }} /><p>示例只模拟成功回调，不发送网络请求。</p>
  </div>;
}
