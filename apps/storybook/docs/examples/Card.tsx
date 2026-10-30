import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Button } from "@oxygen-design/ui";
import "@oxygen-design/ui/styles.css";

export function Example(props: { title: string; description: string }) {
  const [count, setCount] = useState<number>(0);
  return <div style={{ display: "grid", gap: "var(--oxygen-space-4)", minWidth: 0 }}>
    <Card><CardHeader><CardTitle>{props.title}</CardTitle><CardDescription>{props.description}</CardDescription></CardHeader><CardContent>将内容放入卡片正文，不依赖具体业务。</CardContent><CardFooter><Button onClick={() => setCount(count + 1)}>操作 {count}</Button></CardFooter></Card>
  </div>;
}
