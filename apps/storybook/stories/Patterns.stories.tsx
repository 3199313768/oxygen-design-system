import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  AppShell,
  EmptyState,
  PageHeader,
  StatusMessage,
} from '@oxygen-design/patterns';
import {
  Button,
  Files,
  Settings,
} from '@oxygen-design/ui';
import '@oxygen-design/patterns/styles.css';

const meta = {
  title: '布局/页面模式',
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const navigation = (
  <nav aria-label="主导航" className="story-stack">
    <Button variant="ghost">导航项一</Button>
    <Button variant="ghost">导航项二</Button>
    <Button variant="ghost">导航项三</Button>
    <Button variant="ghost">更多导航项</Button>
  </nav>
);

export const PageStates: Story = {
  render: () => (
    <div className="story-stack">
      <PageHeader
        actions={
          <Button>
            <Settings aria-hidden="true" />
            操作
          </Button>
        }
        description="用于演示页面头部、操作和说明区域。"
        title="页面标题"
      />
      <StatusMessage action={<Button size="sm">重试</Button>} tone="warning">
        部分内容仍在处理中。
      </StatusMessage>
      <EmptyState
        action={<Button>新增项</Button>}
        description="当前没有可展示的数据。"
        icon={<Files aria-hidden="true" />}
        title="暂无数据"
      />
    </div>
  ),
};

export const ResponsiveShell: Story = {
  parameters: {
    layout: 'fullscreen',
  },
  render: () => (
    <AppShell
      mobileNavigation={navigation}
      navigationDescription="选择页面"
      navigationTitle="页面导航"
      navigationTriggerLabel="打开导航"
      sidebar={<div style={{ padding: 16 }}>{navigation}</div>}
      title="页面布局"
      topbarActions={
        <Button aria-label="更多操作" size="icon" variant="ghost">
          <Settings aria-hidden="true" />
        </Button>
      }
    >
      <PageHeader
        description="在不同宽度下保持一致的页面结构。"
        title="内容区域"
      />
    </AppShell>
  ),
};
