import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  Button,
  Checkbox,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  RefreshCw,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@oxygen-design/ui';

const meta = {
  title: 'Components/Interactive Controls',
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const AllStates: Story = {
  render: () => (
    <TooltipProvider delayDuration={0}>
      <div className="story-stack">
        <div className="story-row">
          <Checkbox aria-label="选择产品方案" />
          <span>选择产品方案</span>
          <Checkbox aria-label="已选择的文件" defaultChecked />
          <span>已选择的文件</span>
          <Checkbox aria-label="不可选择" disabled />
        </div>
        <Tabs defaultValue="all">
          <TabsList aria-label="文件状态">
            <TabsTrigger value="all">全部 18</TabsTrigger>
            <TabsTrigger value="processing">处理中 3</TabsTrigger>
            <TabsTrigger value="failed">失败 1</TabsTrigger>
          </TabsList>
          <TabsContent value="all">全部文件</TabsContent>
          <TabsContent value="processing">正在处理的文件</TabsContent>
          <TabsContent value="failed">处理失败的文件</TabsContent>
        </Tabs>
        <div className="story-row">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary">账号菜单</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuLabel>oxygen@example.com</DropdownMenuLabel>
              <DropdownMenuCheckboxItem checked>
                接收处理通知
              </DropdownMenuCheckboxItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>退出当前设备</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button aria-label="刷新文件" size="icon" variant="ghost">
                <RefreshCw aria-hidden="true" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>重新加载文件</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  ),
};
