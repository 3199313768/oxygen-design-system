import { useState } from "react";
import { Slider } from "@oxygen-design/ui";
import "@oxygen-design/ui/styles.css";

export function Example(props: { min: number; max: number; step: number; disabled: boolean; loading: boolean }) {
  const [quantity, setQuantity] = useState<number | undefined>(3);
  return <div style={{ display: "grid", gap: "var(--oxygen-space-4)", minWidth: 0 }}>
    <Slider {...props} aria-label="音量" value={quantity ?? 40} onChange={(value) => setQuantity(Array.isArray(value) ? value[0] : value)} /><output aria-live="polite">当前值：{quantity ?? 40}</output>
  </div>;
}
