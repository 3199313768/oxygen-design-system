import { NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuLink, NavigationMenuTrigger, NavigationMenuContent } from "@oxygen-design/ui";
import "@oxygen-design/ui/styles.css";

export function Example(props: { orientation: "horizontal" | "vertical" }) {
  return <div style={{ display: "grid", gap: "var(--oxygen-space-4)", minWidth: 0 }}>
    <NavigationMenu {...props} aria-label="文档导航"><NavigationMenuList><NavigationMenuItem><NavigationMenuLink href="#overview">概览</NavigationMenuLink></NavigationMenuItem><NavigationMenuItem><NavigationMenuTrigger>资源</NavigationMenuTrigger><NavigationMenuContent><NavigationMenuLink href="#guide">使用指南</NavigationMenuLink></NavigationMenuContent></NavigationMenuItem></NavigationMenuList></NavigationMenu>
  </div>;
}
