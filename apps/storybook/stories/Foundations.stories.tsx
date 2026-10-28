import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  Button,
  Divider,
  Space,
  Typography,
} from '@oxygen-design/ui';

const meta = {
  title: '通用/基础组件',
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const ButtonVariants: Story = {
  render: () => (
    <section className="story-section">
      <h2 className="story-section__title">
        按钮
      </h2>
      <p className="story-section__description">展示常用按钮类型和加载状态。</p>
      <div className="story-row">
        <Button>主要按钮</Button>
        <Button variant="secondary">次要按钮</Button>
        <Button variant="ghost">幽灵按钮</Button>
        <Button variant="destructive">危险按钮</Button>
        <Button loading>加载中</Button>
      </div>
    </section>
  ),
};

export const TypographyAndSpacing: Story = {
  render: () => (
    <section className="story-section">
      <h2 className="story-section__title">
        排版与间距
      </h2>
      <p className="story-section__description">展示基础排版、间距和分隔线。</p>
      <Typography.Title level={1}>一级标题 · 28 / 36</Typography.Title>
      <Typography.Title level={2}>二级标题 · 24 / 32</Typography.Title>
      <Typography.Title level={3}>三级标题 · 20 / 28</Typography.Title>
      <Typography.Title level={4}>四级标题 · 16 / 24</Typography.Title>
      <Typography.Title level={5}>五级标题 · 14 / 22</Typography.Title>
      <Typography.Paragraph type="secondary">
        这是一段用于展示排版层级和辅助文字的示例内容。
      </Typography.Paragraph>
      <Space size="middle">
        <Button>操作一</Button>
        <Button variant="secondary">操作二</Button>
      </Space>
      <Divider orientation="center">分组</Divider>
    </section>
  ),
};
