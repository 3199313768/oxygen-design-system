import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  Alert,
  AlertDescription,
  AlertTitle,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Field,
  FieldError,
  Input,
  Label,
} from '@oxygen-design/ui';

const meta = {
  title: 'Foundations/Overview',
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const ControlsAndSurfaces: Story = {
  render: () => (
    <div className="story-stack">
      <div className="story-row">
        <Button>主要操作</Button>
        <Button variant="secondary">次要操作</Button>
        <Button variant="ghost">文字操作</Button>
        <Button variant="destructive">永久删除</Button>
        <Button disabled>正在保存</Button>
      </div>
      <div className="story-row">
        <Badge>处理中</Badge>
        <Badge variant="success">已完成</Badge>
        <Badge variant="warning">需要关注</Badge>
        <Badge variant="error">处理失败</Badge>
        <Badge variant="outline">草稿</Badge>
      </div>
      <Field>
        <Label htmlFor="story-email">邮箱</Label>
        <Input
          aria-describedby="story-email-error"
          aria-invalid="true"
          id="story-email"
          placeholder="name@example.com"
        />
        <FieldError id="story-email-error">请输入有效邮箱</FieldError>
      </Field>
      <Alert tone="error">
        <AlertTitle>连接失败</AlertTitle>
        <AlertDescription>请检查网络后重试，已填写的内容不会丢失。</AlertDescription>
      </Alert>
      <Card>
        <CardHeader>
          <CardTitle>团队知识文件</CardTitle>
          <CardDescription>
            A deliberately long English description demonstrates wrapping without
            changing the surrounding control geometry.
          </CardDescription>
        </CardHeader>
        <CardContent>当前共有 128 个文件。</CardContent>
        <CardFooter>
          <Button size="sm">查看文件</Button>
        </CardFooter>
      </Card>
    </div>
  ),
};
