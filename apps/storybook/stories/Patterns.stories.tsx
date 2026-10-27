import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  AppShell,
  Button,
  EmptyState,
  Files,
  PageHeader,
  StatusMessage,
  Upload,
} from '@oxygen-design/ui';

const meta = {
  title: 'Patterns/Page Composition',
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const navigation = (
  <nav aria-label="应用导航" className="story-stack">
    <Button variant="ghost">所有文件</Button>
    <Button variant="ghost">最近使用</Button>
    <Button variant="ghost">回收站</Button>
    <Button variant="ghost">团队小组</Button>
  </nav>
);

export const PageStates: Story = {
  render: () => (
    <div className="story-stack">
      <PageHeader
        actions={
          <Button>
            <Upload aria-hidden="true" />
            上传文件
          </Button>
        }
        description="集中查看、检索并管理当前团队中的所有知识文件。"
        title="团队知识库"
      />
      <StatusMessage action={<Button size="sm">重试</Button>} tone="warning">
        2 个文件仍在等待处理。
      </StatusMessage>
      <EmptyState
        action={<Button>上传第一个文件</Button>}
        description="支持 PDF 和 DOCX，上传后即可搜索内容。"
        icon={<Files aria-hidden="true" />}
        title="暂无文件"
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
      sidebar={<div style={{ padding: 16 }}>{navigation}</div>}
      title="Oxygen 知识库"
      topbarActions={<Button size="icon" aria-label="账号菜单">O</Button>}
    >
      <PageHeader
        description="This layout keeps the same semantic content across desktop and iPhone widths."
        title="所有文件"
      />
    </AppShell>
  ),
};
