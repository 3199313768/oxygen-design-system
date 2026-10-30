import { TimePicker } from "@oxygen-design/ui";
import "@oxygen-design/ui/styles.css";

export function Example(props: { disabled: boolean; required: boolean }) {
  return <div style={{ display: "grid", gap: "var(--oxygen-space-4)", minWidth: 0 }}>
    <TimePicker {...props} aria-label="选择日期时间" /><p>使用浏览器原生选择器，显示与键盘操作随浏览器及操作系统变化。</p>
  </div>;
}
