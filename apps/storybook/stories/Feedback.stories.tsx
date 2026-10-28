import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  Alert,
  AlertDescription,
  AlertTitle,
  Message,
  Notification,
  Progress,
  Result,
  Skeleton,
  Spin,
  Toast,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from '@oxygen-design/ui';

const meta = {
  title: '反馈/状态反馈',
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const StatusAndLoading: Story = {
  render: () => (
    <ToastProvider>
      <section className="story-section">
        <h2 className="story-section__title">
          状态反馈
        </h2>
        <p className="story-section__description">展示提示、加载和通知状态。</p>
        <Alert tone="info">
          <AlertTitle>提示</AlertTitle>
          <AlertDescription>这是一条普通提示信息。</AlertDescription>
        </Alert>
        <Alert tone="warning">
          <AlertTitle>警告</AlertTitle>
          <AlertDescription>这是一条需要关注的提示信息。</AlertDescription>
        </Alert>
        <div className="story-row">
          <Skeleton aria-label="加载文本" variant="text" />
          <Skeleton aria-label="加载图形" variant="circle" />
          <Spin tip="加载中" />
        </div>
        <Progress percent={68} showInfo={false} />
        <Result status="success" subTitle="操作已完成" title="操作成功" />
        <Toast defaultOpen tone="success">
          <ToastTitle>操作成功</ToastTitle>
          <ToastDescription>状态已更新。</ToastDescription>
        </Toast>
        <Notification
          description="这是一条通知内容。"
          defaultOpen
          title="通知标题"
        />
        <Message defaultOpen>这是一条消息。</Message>
        <ToastViewport />
      </section>
    </ToastProvider>
  ),
};
