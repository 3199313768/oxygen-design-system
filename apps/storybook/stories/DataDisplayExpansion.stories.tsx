import type { Meta, StoryObj } from '@storybook/react-vite';

import { Alert, AlertDescription, Descriptions, Statistic, Steps, Timeline } from '@oxygen-design/ui';

const meta = { title: '数据展示/结构化展示' } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

const details = [
  { key: 'name', label: '名称', children: '示例条目' },
  { key: 'version', label: '版本', children: '1.0.0' },
  { key: 'count', label: '数量', children: 0 },
  { key: 'notes', label: '说明', children: '内容支持自动换行，并保持标签和值的语义关联。', span: 3 },
];
const steps = [
  { key: 'prepare', title: '准备', description: '检查输入内容' },
  { key: 'process', title: '处理', description: '正在处理内容' },
  { key: 'complete', title: '完成', description: '查看处理结果' },
];

export const Normal: Story = {
  render: () => <div className="story-section">
    <Descriptions bordered items={details} title="基本信息" />
    <div className="story-row">
      <Statistic title="已完成" value={128} suffix="项" trend={{ direction: 'up', label: '较上期上升 5%' }} />
      <Statistic title="平均耗时" value={12.5} precision={2} suffix="秒" trend={{ direction: 'down', label: '较上期下降 2%' }} />
    </div>
    <Steps aria-label="处理进度" current={1} items={steps} />
    <Timeline aria-label="更新记录" items={[
      { key: 1, label: '09:00', children: '已创建条目', status: 'success' },
      { key: 2, label: '10:00', children: '已更新内容' },
      { key: 3, children: '等待下一次更新', status: 'pending' },
    ]} />
  </div>,
};

export const Loading: Story = {
  render: () => <div className="story-section">
    <Descriptions items={details} loading loadingText="正在读取详情" title="基本信息" />
    <Statistic loading loadingText="正在读取统计" title="已完成" value={128} />
    <Steps aria-label="处理进度" current={1} items={steps} />
    <Timeline aria-label="更新记录" loading loadingText="正在读取记录" />
  </div>,
};

export const Empty: Story = {
  render: () => <div className="story-section">
    <Descriptions emptyText="暂无详情" items={[]} title="基本信息" />
    <Statistic emptyText="暂无统计" title="已完成" />
    <Steps aria-label="处理进度" emptyText="暂无步骤" items={[]} />
    <Timeline aria-label="更新记录" emptyText="暂无记录" items={[]} />
  </div>,
};

export const Error: Story = {
  render: () => <div className="story-section">
    <Descriptions error="详情加载失败，请稍后重试" items={details} title="基本信息" />
    <Statistic error="统计暂不可用" title="已完成" />
    <Steps aria-label="处理进度" current={1} status="error" items={[
      steps[0], { ...steps[1], description: '处理失败，请检查输入' }, steps[2],
    ]} />
    <Timeline aria-label="更新记录" items={[
      { key: 1, label: '09:00', children: '已创建条目', status: 'success' },
      { key: 2, label: '10:00', children: <Alert tone="error"><AlertDescription>更新失败，请稍后重试</AlertDescription></Alert>, status: 'error' },
    ]} />
  </div>,
};

export const Responsive: Story = {
  render: () => <div className="story-section" style={{ maxWidth: 320 }}>
    <Descriptions bordered column={3} items={details} title="窄容器详情" />
    <Statistic title="较长统计标题在窄容器下的展示" value="123456789" suffix="项" trend={{ direction: 'neutral', label: '与上期持平，内容会自动换行' }} />
    <Steps aria-label="窄容器处理进度" current={1} items={steps} />
    <Timeline aria-label="窄容器更新记录" items={[
      { key: 1, label: '2026-01-01 09:00', children: '较长的更新说明会随容器宽度换行，避免横向溢出。', status: 'success' },
      { key: 2, children: '等待后续更新', status: 'pending' },
    ]} />
  </div>,
};

export const VerticalSteps: Story = {
  render: () => <Steps aria-label="纵向处理进度" current={2} direction="vertical" items={steps} />,
};
