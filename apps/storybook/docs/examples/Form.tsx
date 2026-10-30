import { useState } from "react";
import { Form, Input, Button } from "@oxygen-design/ui";
import "@oxygen-design/ui/styles.css";

export function Example(props: { layout: "vertical" | "horizontal" | "inline"; required: boolean }) {
  const [count, setCount] = useState<number>(0);
  return <div style={{ display: "grid", gap: "var(--oxygen-space-4)", minWidth: 0 }}>
    <Form layout={props.layout} onSubmit={(event) => { event.preventDefault(); setCount(count + 1); }}><Form.Item label="名称" name="name" required={props.required}><Input name="name" placeholder="填写名称后提交" /></Form.Item><Button type="submit">提交</Button></Form><output aria-live="polite">成功提交 {count} 次</output>
  </div>;
}
