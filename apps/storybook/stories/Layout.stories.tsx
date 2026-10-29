import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  Button,
  Layout,
  Space,
  Typography,
} from '@oxygen-design/ui';

const meta = {
  title: '布局/布局',
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Composition: Story = {
  render: () => (
    <section className="story-section">
      <h2 className="story-section__title">
        布局组合
      </h2>
      <p className="story-section__description">展示页头、侧栏、内容和页脚的组合关系。</p>
      <Layout className="story-layout-demo" hasSider style={{ minHeight: 360, border: '1px solid var(--oxygen-color-border-subtle)' }}>
        <Layout.Sider style={{ padding: 16 }}>
          <Typography.Text strong>侧栏区域</Typography.Text>
        </Layout.Sider>
        <Layout>
          <Layout.Header style={{ borderBottom: '1px solid var(--oxygen-color-border)' }}>
            <Space wrap style={{ justifyContent: 'space-between', width: '100%' }}>
              <Typography.Title level={4}>页头区域</Typography.Title>
              <Button size="sm" variant="secondary">次要操作</Button>
            </Space>
          </Layout.Header>
          <Layout.Content>
            <Typography.Paragraph>内容区域。</Typography.Paragraph>
          </Layout.Content>
          <Layout.Footer>页脚区域</Layout.Footer>
        </Layout>
      </Layout>
    </section>
  ),
};
