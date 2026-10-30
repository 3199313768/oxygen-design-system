import { Layout } from "@oxygen-design/ui";
import "@oxygen-design/ui/styles.css";

export function Example(props: { hasSider: boolean }) {
  return <div style={{ display: "grid", gap: "var(--oxygen-space-4)", minWidth: 0 }}>
    <Layout hasSider={props.hasSider}>{props.hasSider && <Layout.Sider>侧栏</Layout.Sider>}<Layout><Layout.Header>页头</Layout.Header><Layout.Content>内容区域</Layout.Content><Layout.Footer>页脚</Layout.Footer></Layout></Layout>
  </div>;
}
