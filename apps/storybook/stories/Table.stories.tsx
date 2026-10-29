import { useState, type Key } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button, Table } from '@oxygen-design/ui';

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

export const BulkSelection: Story = {
  name: '长数据与批量操作',
  render: () => {
    const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);
    const data = [
      { id: 'one', name: '华东区域设计系统治理与组件升级项目', owner: '林晓', amount: '¥128,000', status: '进行中' },
      { id: 'two', name: '运营后台无障碍与移动端适配专项', owner: '陈默', amount: '¥86,500', status: '待确认' },
      { id: 'three', name: '数据分析工作台年度体验优化', owner: '周宁', amount: '¥240,000', status: '已完成' },
    ];
    return (
      <section className="story-section story-table-demo">
        <h2 className="story-section__title">长数据与批量操作</h2>
        <p className="story-section__description">验证长名称、省略、金额右对齐、全选半选和批量操作反馈。</p>
        <div className="story-table-demo__toolbar">
          <span role="status">已选择 {selectedRowKeys.length} 项</span>
          <Button size="sm" disabled={!selectedRowKeys.length}>批量归档</Button>
          <Button size="sm" variant="secondary" disabled={!selectedRowKeys.length}>导出清单</Button>
        </div>
        <Table
          columns={[
            { key: 'name', dataIndex: 'name', title: '项目名称', ellipsis: true, width: 360 },
            { key: 'owner', dataIndex: 'owner', title: '负责人', width: 100 },
            { key: 'amount', dataIndex: 'amount', title: '预算', align: 'right', width: 120 },
            { key: 'status', dataIndex: 'status', title: '状态', width: 100 },
          ]}
          dataSource={data}
          rowKey="id"
          rowSelection={{ selectedRowKeys, onChange: (keys) => setSelectedRowKeys(keys) }}
        />
      </section>
    );
  },
};
