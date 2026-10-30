import { useState } from "react";
import { DateRangePicker, type DateRangeValue } from "@oxygen-design/ui";
import "@oxygen-design/ui/styles.css";

export function Example(props: { disabled: boolean; allowClear: boolean }) {
  const [range, setRange] = useState<DateRangeValue>();
  return <div style={{ display: "grid", gap: "var(--oxygen-space-4)", minWidth: 0 }}>
    <DateRangePicker {...props} aria-label="选择日期范围" defaultMonth={new Date(2026, 9, 1)} value={range} onChange={setRange} presets={[{ label: "示例工作日", value: [new Date(2026, 9, 26), new Date(2026, 9, 30)] }]} /><output aria-live="polite">{range ? range.map((day) => day.toLocaleDateString("zh-CN")).join(" 至 ") : "未完成选择"}</output>
  </div>;
}
