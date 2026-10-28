import type { Meta, StoryObj } from '@storybook/react-vite';

import { DatePicker, TimePicker } from '@oxygen-design/ui';

const meta = {
  title: '数据录入/日期时间',
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  render: () => (
    <section className="story-section">
      <h2 className="story-section__title">
        日期与时间
      </h2>
      <p className="story-section__description">展示原生日期和时间输入。</p>
      <div className="story-control-grid">
        <DatePicker aria-label="日期" defaultValue="2026-10-27" />
        <TimePicker aria-label="时间" defaultValue="09:30" />
      </div>
    </section>
  ),
};
