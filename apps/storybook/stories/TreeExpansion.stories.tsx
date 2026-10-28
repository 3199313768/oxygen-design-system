import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { Cascader, Tree, TreeSelect, type TreeNode } from '@oxygen-design/ui';

const meta = { title: '数据录入/树与级联' } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

const nodes: TreeNode<string | number>[] = [
  { key: 1, label: '产品团队', children: [
    { key: 11, label: '设计', children: [{ key: 'visual', label: '视觉设计' }, { key: 'interaction', label: '交互设计' }] },
    { key: 12, label: '工程', children: [{ key: 'frontend', label: '前端工程' }, { key: 'backend', label: '后端工程' }] },
    { key: 13, label: '停用团队', disabled: true },
  ] },
  { key: '1', label: '数字与字符串 key 保持独立' },
];

export const Flat: Story = { render: () => <Tree aria-label="平级目录" treeData={[{ key: 'a', label: '设计规范' }, { key: 'b', label: '组件文档' }]} /> };
export const Nested: Story = { render: () => <Tree aria-label="团队目录" defaultExpandAll treeData={nodes} /> };
export const Checkable: Story = { render: () => <Tree aria-label="选择团队" checkable defaultCheckedKeys={['visual']} defaultExpandAll treeData={nodes} /> };
export const Disabled: Story = { render: () => <Tree aria-label="只读团队" defaultExpandAll defaultSelectedKeys={[11]} disabled treeData={nodes} /> };
export const Controlled: Story = {
  render: function ControlledTree() {
    const [keys, setKeys] = useState<(string | number)[]>([11]);
    return <Tree aria-label="受控目录" defaultExpandAll onSelect={setKeys} selectedKeys={keys} treeData={nodes} />;
  },
};
export const Searchable: Story = { render: () => <TreeSelect aria-label="搜索并选择团队" defaultExpandAll placeholder="选择团队" treeData={nodes} /> };
export const Cascading: Story = { render: () => <Cascader aria-label="团队路径" options={nodes} placeholder="选择团队路径" /> };
export const Empty: Story = {
  render: () => <div className="story-grid"><Tree aria-label="空目录" treeData={[]} /><TreeSelect aria-label="空树选项" treeData={[]} /><Cascader aria-label="空级联选项" options={[]} /></div>,
};
