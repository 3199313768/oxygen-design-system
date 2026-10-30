import { useState } from "react";
import { Pagination } from "@oxygen-design/ui";
import "@oxygen-design/ui/styles.css";

export function Example(props: { total: number; pageSize: number; disabled: boolean; showSizeChanger: boolean }) {
  const [page, setPage] = useState<number>(1);
  return <div style={{ display: "grid", gap: "var(--oxygen-space-4)", minWidth: 0 }}>
    <Pagination {...props} current={page} onChange={setPage} />
  </div>;
}
