import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { Breadcrumb, Space, Tag, TagInput } from '@oxygen-design/ui';

const meta = {
  title: '导航/路径与标签',
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const BreadcrumbPaths: Story = {
  render: () => (
    <section className="story-section">
      <h2 className="story-section__title">
        页面路径
      </h2>
      <p className="story-section__description">最后一项为当前页；较长路径在有限宽度内换行。</p>
      <Breadcrumb
        items={[
          { href: '#home', label: '首页' },
          { href: '#projects', label: '项目管理' },
          { label: '项目详情' },
        ]}
      />
      <div style={{ maxWidth: 300 }}>
        <Breadcrumb
          aria-label="长页面路径"
          items={[
            { href: '#workspace', label: '团队工作空间' },
            { href: '#library', label: '共享资源与组件库' },
            { href: '#navigation', label: '导航组件' },
            { label: '当前页面与详细配置信息' },
          ]}
          separator="›"
        />
      </div>
    </section>
  ),
};

export const TagStates: Story = {
  render: function TagStatesStory() {
    const [visible, setVisible] = useState(true);
    return (
      <section className="story-section">
        <h2 className="story-section__title">
          状态与可关闭标签
        </h2>
        <Space wrap>
          <Tag>默认</Tag>
          <Tag tone="primary">进行中</Tag>
          <Tag tone="success">已完成</Tag>
          <Tag tone="warning">待审核</Tag>
          <Tag tone="error">失败</Tag>
          <Tag closable disabled>不可移除</Tag>
          {visible ? <Tag closable onClose={() => setVisible(false)}>可移除</Tag> : null}
        </Space>
        <p aria-live="polite">{visible ? '点击关闭按钮移除标签。' : '标签已移除。'}</p>
      </section>
    );
  },
};

export const KeyboardTokenEntry: Story = {
  render: function KeyboardTokenEntryStory() {
    const [value, setValue] = useState(['设计', '开发']);
    return (
      <section className="story-section">
        <h2 className="story-section__title">
          标签输入
        </h2>
        <label className="oxygen-label" htmlFor="story-tag-input">项目标签</label>
        <TagInput
          aria-describedby="story-tag-help"
          id="story-tag-input"
          max={4}
          onChange={setValue}
          placeholder="输入后按 Enter"
          value={value}
        />
        <p className="story-section__description" id="story-tag-help">
          最多 4 个标签，自动去除首尾空格并忽略重复值；Tab 可聚焦移除按钮。
        </p>
        <p aria-live="polite">已选择 {value.length} / 4 个标签：{value.join('、') || '无'}</p>
        <TagInput aria-label="禁用标签输入" defaultValue={['不可修改']} disabled />
        <TagInput aria-label="只读标签输入" defaultValue={['仅供查看']} readOnly />
        <TagInput allowDuplicates aria-label="允许重复标签" placeholder="允许重复输入" />
      </section>
    );
  },
};
