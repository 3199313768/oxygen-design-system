import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  Calendar,
  Combobox,
  DateRangePicker,
  InputNumber,
  Upload,
  type DateRangeValue,
} from '@oxygen-design/ui';

const meta = {
  title: '数据录入/扩展控件',
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const UploadStates: Story = {
  render: () => (
    <section className="story-section">
      <h2 className="story-section__title">
        文件上传
      </h2>
      <p className="story-section__description">展示默认、失败和禁用状态。</p>
      <div className="story-grid">
        <Upload aria-label="选择文件" maxSize={1024 * 1024} />
        <Upload
          aria-label="上传失败文件"
          fileList={[
            {
              file: new File([''], '失败文件.txt'),
              id: 'failed-file',
              name: '失败文件.txt',
              status: 'error',
            },
          ]}
        />
        <Upload aria-label="上传附件" disabled />
      </div>
    </section>
  ),
};

export const ComboboxStates: Story = {
  render: () => (
    <section className="story-section">
      <h2 className="story-section__title">
        可搜索选择
      </h2>
      <p className="story-section__description">输入关键词后使用方向键和回车选择。</p>
      <Combobox
        aria-label="选择城市"
        options={[
          { label: '北京', value: 'beijing' },
          { label: '上海', value: 'shanghai' },
          { label: '深圳', value: 'shenzhen' },
        ]}
        placeholder="搜索城市"
      />
      <div className="story-grid">
        <Combobox aria-label="加载城市" loading options={[]} placeholder="加载中" />
        <Combobox aria-label="空城市" options={[]} placeholder="暂无城市" />
      </div>
    </section>
  ),
};

export const InputNumberStates: Story = {
  render: function InputNumberStory() {
    const [value, setValue] = useState(3);
    return (
      <section className="story-section">
        <h2 className="story-section__title">
          数值输入
        </h2>
        <p className="story-section__description">支持步长、边界和受控值。</p>
        <InputNumber
          aria-label="数量"
          max={10}
          min={1}
          onChange={(nextValue) => setValue(nextValue ?? 1)}
          value={value}
        />
        <InputNumber aria-invalid="true" aria-label="错误数量" min={1} />
      </section>
    );
  },
};

export const CalendarStates: Story = {
  render: function CalendarStory() {
    const [selected, setSelected] = useState<Date | undefined>(new Date(2026, 9, 28));
    return (
      <section className="story-section">
        <h2 className="story-section__title">
          日历
        </h2>
        <p className="story-section__description">
          左侧为受控日期，右侧为禁用状态。Tab 进入日历后可用方向键切换日期，回车选择。
        </p>
        <div className="story-grid">
          <Calendar
            aria-label="选择日期"
            defaultMonth={new Date(2026, 9, 1)}
            onChange={setSelected}
            value={selected}
          />
          <Calendar aria-label="不可用日历" defaultMonth={new Date(2026, 9, 1)} disabled />
        </div>
        <p aria-live="polite">
          {selected ? `已选择：${selected.toLocaleDateString('zh-CN')}` : '尚未选择日期'}
        </p>
      </section>
    );
  },
};

export const DateRangeStates: Story = {
  render: function DateRangeStory() {
    const [value, setValue] = useState<DateRangeValue>();
    return (
      <section className="story-section">
        <h2 className="story-section__title">
          日期范围
        </h2>
        <p className="story-section__description">
          依次选择开始和结束日期；也可选择快捷范围或清除。周末不可选，范围也不能跨越周末。
        </p>
        <DateRangePicker
          aria-label="选择日期范围"
          defaultMonth={new Date(2026, 9, 1)}
          disabled={{ dayOfWeek: [0, 6] }}
          onChange={setValue}
          presets={[
            { label: '本周工作日', value: [new Date(2026, 9, 26), new Date(2026, 9, 30)] },
            { label: '本周前三天', value: [new Date(2026, 9, 26), new Date(2026, 9, 28)] },
          ]}
          value={value}
        />
        <p aria-live="polite">
          {value
            ? `已选择：${value[0].toLocaleDateString('zh-CN')} 至 ${value[1].toLocaleDateString('zh-CN')}`
            : '尚未选择完整范围'}
        </p>
        <p className="story-section__description">
          日期按本地年月日传递；例如 2026 年 10 月 28 日使用 new Date(2026, 9, 28)。
        </p>
      </section>
    );
  },
};
