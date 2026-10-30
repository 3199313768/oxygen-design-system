import { AppShell, PageHeader } from "@oxygen-design/patterns";
import "@oxygen-design/ui/styles.css";
import "@oxygen-design/patterns/styles.css";

export function Example(props: { title: string; navigationTitle: string }) {
  return <div style={{ display: "grid", gap: "var(--oxygen-space-4)", minWidth: 0 }}>
    <AppShell {...props} sidebar={<nav aria-label="桌面导航"><a href="#overview">概览</a></nav>} mobileNavigation={<nav aria-label="移动导航"><a href="#overview">概览</a></nav>}><PageHeader title="内容区域" description="缩小浏览器宽度可测试导航抽屉" /></AppShell>
  </div>;
}
