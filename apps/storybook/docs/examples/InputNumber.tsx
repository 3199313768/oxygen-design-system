import { useState } from "react";
import { InputNumber } from "@oxygen-design/ui";
import "@oxygen-design/ui/styles.css";

export function Example(props: { min: number; max: number; step: number; disabled: boolean }) {
  const [quantity, setQuantity] = useState<number | undefined>(3);
  return <div style={{ display: "grid", gap: "var(--oxygen-space-4)", minWidth: 0 }}>
    <InputNumber {...props} aria-label="数量" value={quantity} onChange={setQuantity} /><output aria-live="polite">数量：{quantity ?? "未填写"}</output>
  </div>;
}
