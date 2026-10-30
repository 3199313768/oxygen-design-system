import { Field, FieldLabel, FieldControl, FieldDescription, FieldError, Input } from "@oxygen-design/ui";
import "@oxygen-design/ui/styles.css";

export function Example(props: { disabled: boolean; invalid: boolean }) {
  return <div style={{ display: "grid", gap: "var(--oxygen-space-4)", minWidth: 0 }}>
    <Field><FieldLabel>名称</FieldLabel><FieldControl><Input disabled={props.disabled} aria-invalid={props.invalid || undefined} placeholder="输入名称" /></FieldControl>{props.invalid ? <FieldError>请填写有效名称</FieldError> : <FieldDescription>标签、帮助信息与控件关联</FieldDescription>}</Field>
  </div>;
}
