import { useState } from "react";
import { Calendar } from "@oxygen-design/ui";
import "@oxygen-design/ui/styles.css";

export function Example(props: { disabled: boolean; showOutsideDays: boolean }) {
  const [date, setDate] = useState<Date | undefined>(undefined);
  return <div style={{ display: "grid", gap: "var(--oxygen-space-4)", minWidth: 0 }}>
    <Calendar {...props} aria-label="选择日期" defaultMonth={new Date(2026, 9, 1)} value={date} onChange={setDate} /><output aria-live="polite">{date ? date.toLocaleDateString("zh-CN") : "未选择日期"}</output>
  </div>;
}
