import { useState } from "react";
import { Table } from "@oxygen-design/ui";
import "@oxygen-design/ui/styles.css";

export function Example(props: { loading: boolean; empty: boolean }) {
  const [tags, setTags] = useState<string[]>([]);
  return <div style={{ display: "grid", gap: "var(--oxygen-space-4)", minWidth: 0 }}>
    <Table loading={props.loading} aria-label="示例数据" rowKey="id" columns={[{ key: "label", dataIndex: "label", title: "名称" }, { key: "value", dataIndex: "value", title: "值" }]} dataSource={props.empty ? [] : [{ id: "one", label: "第一项", value: "内容一" }, { id: "two", label: "第二项", value: "内容二" }]} rowSelection={{ selectedRowKeys: tags, onChange: (keys) => setTags(keys.map(String)) }} /><output aria-live="polite">已选 {tags.length} 项</output>
  </div>;
}
