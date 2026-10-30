import { Tabs, TabsList, TabsTrigger, TabsContent } from "@oxygen-design/ui";
import "@oxygen-design/ui/styles.css";

export function Example(props: { orientation: "horizontal" | "vertical" }) {
  return <div style={{ display: "grid", gap: "var(--oxygen-space-4)", minWidth: 0 }}>
    <Tabs {...props} defaultValue="one"><TabsList aria-label="内容切换"><TabsTrigger value="one">概览</TabsTrigger><TabsTrigger value="two">详细信息</TabsTrigger><TabsTrigger value="three" disabled>暂不可用</TabsTrigger></TabsList><TabsContent value="one">概览内容</TabsContent><TabsContent value="two">详细内容</TabsContent></Tabs>
  </div>;
}
