import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  QRCode,
  Space,
} from '@oxygen-design/ui';

const meta = {
  title: '导航/导航菜单与二维码',
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const RouteAgnosticMenu: Story = {
  render: () => (
    <section className="story-section">
      <h2 className="story-section__title">
        导航菜单
      </h2>
      <p className="story-section__description">组件只提供链接与键盘交互，由业务应用决定路由。</p>
      <NavigationMenu aria-label="示例导航">
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuLink active href="#overview">概览</NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuTrigger>资源</NavigationMenuTrigger>
            <NavigationMenuContent>
              <NavigationMenuLink href="#docs">文档</NavigationMenuLink>
              <NavigationMenuLink href="#examples">示例</NavigationMenuLink>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink aria-disabled="true" href="#disabled">暂不可用</NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </section>
  ),
};

export const QRCodeStates: Story = {
  render: () => (
    <section className="story-section">
      <h2 className="story-section__title">
        二维码
      </h2>
      <p className="story-section__description">可调整尺寸、前景色、背景色和留白。</p>
      <Space align="start" wrap>
        <QRCode aria-label="项目地址" size={160} value="https://example.com/project" />
        <QRCode aria-label="品牌二维码" bgColor="#fff7ed" fgColor="#9a3412" includeMargin size={160} value="https://example.com/brand" />
        <QRCode aria-label="空二维码" value="" />
      </Space>
    </section>
  ),
};
