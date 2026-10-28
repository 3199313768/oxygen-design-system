import type { Meta, StoryObj } from '@storybook/react-vite';

import { Table } from '@oxygen-design/ui';

const meta = {
  title: '数据展示/表格',
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const columns = [
  { dataIndex: 'label' as const, key: 'label', title: '标签' },
  { dataIndex: 'value' as const, key: 'value', title: '值' },
];

const dataSource = [
  { id: 'one', label: '第一项', value: '内容一' },
  { id: 'two', label: '第二项', value: '内容二' },
];

export const Basic: Story = {
  render: () => (
    <section className="story-section">
      <h2 className="story-section__title">
        基础表格
      </h2>
      <p className="story-section__description">展示列定义、空状态和行选择。</p>
      <Table columns={columns} dataSource={dataSource} rowKey="id" rowSelection={{}} />
    </section>
  ),
};

export const Loading: Story = {
  render: () => (
    <section className="story-section">
      <h2 className="story-section__title">
        加载状态
      </h2>
      <Table columns={columns} loading />
    </section>
  ),
};
