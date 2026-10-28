import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@oxygen-design/ui';

const meta = {
  title: '数据展示/基础展示',
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const CardAndBadge: Story = {
  render: () => (
    <section className="story-section">
      <h2 className="story-section__title">
        卡片与徽标
      </h2>
      <p className="story-section__description">展示内容容器和状态标记。</p>
      <div className="story-row">
        <Badge>默认</Badge>
        <Badge variant="success">成功</Badge>
        <Badge variant="warning">警告</Badge>
        <Badge variant="error">错误</Badge>
        <Badge variant="outline">描边</Badge>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>卡片标题</CardTitle>
          <CardDescription>用于展示卡片的辅助说明文字。</CardDescription>
        </CardHeader>
        <CardContent>卡片内容区域。</CardContent>
        <CardFooter>
          <Button size="sm">查看</Button>
        </CardFooter>
      </Card>
    </section>
  ),
};
