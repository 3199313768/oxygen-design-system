import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { ColorPicker, Slider, Transfer } from '@oxygen-design/ui';

const meta = { title: '数据录入/增强控件' } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

const people = [
  { label: '设计', value: 'design' },
  { label: '工程', value: 'engineering' },
  { disabled: true, label: '外部协作者（停用）', value: 'external' },
];

export const SliderStates: Story = {
  render: function SliderStory() {
    const [value, setValue] = useState(40);
    return (
      <section className="story-section">
        <h2 className="story-section__title">滑块</h2>
        <p className="story-section__description">支持单值、范围、禁用和加载状态，方向键可调整步长。</p>
        <div className="story-grid">
          <Slider aria-label="单值" max={100} onChange={(next) => setValue(Array.isArray(next) ? next[0] : next)} value={value} />
          <Slider aria-label="范围" defaultValue={[20, 70]} max={100} range />
          <Slider aria-label="禁用" defaultValue={30} disabled />
          <Slider aria-label="加载中" defaultValue={60} loading />
        </div>
        <p aria-live="polite">当前值：{value}</p>
      </section>
    );
  },
};

export const ColorPickerStates: Story = {
  render: () => (
    <section className="story-section">
      <h2 className="story-section__title">颜色选择</h2>
      <p className="story-section__description">输入框只接受 #RRGGBB 格式，取消会关闭编辑面板。</p>
      <div className="story-grid">
        <ColorPicker aria-label="主题色" defaultValue="#336699" />
        <ColorPicker aria-label="禁用颜色" defaultValue="#7C3AED" disabled />
        <ColorPicker aria-label="加载颜色" defaultValue="#0F766E" loading />
      </div>
    </section>
  ),
};

export const ColorPickerError: Story = {
  render: () => (
    <section className="story-section">
      <h2 className="story-section__title">颜色校验错误</h2>
      <p className="story-section__description">输入非六位十六进制颜色时显示错误状态，确定按钮保持禁用。</p>
      <ColorPicker aria-label="错误颜色" defaultDraftValue="invalid" defaultOpen defaultValue="#336699" />
    </section>
  ),
};

export const TransferStates: Story = {
  render: function TransferStory() {
    const [targetKeys, setTargetKeys] = useState<string[]>(['engineering']);
    return (
      <section className="story-section">
        <h2 className="story-section__title">穿梭框</h2>
        <p className="story-section__description">可搜索、全选并在两侧移动，停用选项不可操作。</p>
        <Transfer
          aria-label="团队成员"
          onChange={(next) => setTargetKeys(next)}
          onSelectChange={() => undefined}
          showSearch
          sourceItems={people}
          targetKeys={targetKeys}
        />
      </section>
    );
  },
};

export const DisabledAndEmpty: Story = {
  render: () => (
    <section className="story-section">
      <h2 className="story-section__title">穿梭框 · 空与禁用状态</h2>
      <div className="story-grid">
        <Transfer aria-label="空列表" sourceItems={[]} />
        <Transfer aria-label="禁用列表" disabled sourceItems={people} />
      </div>
    </section>
  ),
};
