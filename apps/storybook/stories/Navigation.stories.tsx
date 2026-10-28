import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Pagination,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@oxygen-design/ui';

const meta = {
  title: '导航/导航控件',
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const TabsNavigation: Story = {
  render: () => (
    <section className="story-section">
      <h2 className="story-section__title">
        标签页
      </h2>
      <p className="story-section__description">用于切换同一层级的内容视图。</p>
      <Tabs defaultValue="one">
        <TabsList aria-label="内容视图">
          <TabsTrigger value="one">视图一</TabsTrigger>
          <TabsTrigger value="two">视图二</TabsTrigger>
          <TabsTrigger value="three">视图三</TabsTrigger>
        </TabsList>
        <TabsContent value="one">视图一内容</TabsContent>
        <TabsContent value="two">视图二内容</TabsContent>
        <TabsContent value="three">视图三内容</TabsContent>
      </Tabs>
    </section>
  ),
};

export const DropdownMenuNavigation: Story = {
  render: () => (
    <section className="story-section">
      <h2 className="story-section__title">
        下拉菜单
      </h2>
      <p className="story-section__description">用于承载一组相关操作。</p>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary">打开菜单</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuLabel>菜单示例</DropdownMenuLabel>
          <DropdownMenuItem>菜单项一</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>菜单项二</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </section>
  ),
};

export const PaginationNavigation: Story = {
  render: () => (
    <section className="story-section">
      <h2 className="story-section__title">
        分页
      </h2>
      <p className="story-section__description">用于切换分段内容。</p>
      <Pagination
        pageSize={10}
        pageSizeOptions={[10, 20, 50]}
        showSizeChanger
        showTotal
        total={56}
      />
    </section>
  ),
};
