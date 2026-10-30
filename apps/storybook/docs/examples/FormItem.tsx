import { Form, Input } from "@oxygen-design/ui";
import "@oxygen-design/ui/styles.css";

export function Example(props: { label: string; required: boolean; validateStatus: "success" | "warning" | "error" }) {
  return <div style={{ display: "grid", gap: "var(--oxygen-space-4)", minWidth: 0 }}>
    <Form.Item {...props} help={props.validateStatus === "error" ? "请输入有效内容" : "字段帮助信息"}><Input placeholder="输入名称" /></Form.Item>
  </div>;
}
