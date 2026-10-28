import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  Accordion,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  Image,
  ImagePreview,
} from '@oxygen-design/ui';

const meta = { title: '数据展示/渐进式披露' } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

const accordionItems = [
  { key: 'overview', title: '概览', children: '这里展示条目的简要说明。' },
  { key: 'details', title: '详细信息', children: '展开后可以查看完整的配置和历史记录。' },
  { key: 'disabled', title: '无权限内容', children: '当前账号没有查看权限。', disabled: true },
];
const imageSrc = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="640" height="360" viewBox="0 0 640 360"%3E%3Crect width="640" height="360" fill="%235a67d8"/%3E%3Ccircle cx="480" cy="110" r="72" fill="%23f6ad55"/%3E%3Ctext x="32" y="310" fill="white" font-size="32"%3EOxygen%20Image%3C/text%3E%3C/svg%3E';

export const Normal: Story = {
  render: () => <div className="story-section">
    <Accordion aria-label="项目详情" items={accordionItems} />
    <ImagePreview alt="示例图" src={imageSrc} />
  </div>,
};

export const Controlled: Story = {
  render: function ControlledStory() {
    const [open, setOpen] = useState(false);
    return <div className="story-section">
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger>显示高级设置</CollapsibleTrigger>
        <CollapsibleContent>这里的内容由外部状态控制。</CollapsibleContent>
      </Collapsible>
      <p>当前状态：{open ? '已展开' : '已收起'}</p>
      <Accordion type="multiple" defaultValue={['overview']} items={accordionItems} />
    </div>;
  },
};

export const Fallback: Story = {
  render: () => <div className="story-section story-row">
    <Image alt="加载失败的示例图" fallback="暂时无法加载" src="/missing-image.png" />
    <ImagePreview alt="可预览图片" fallback="预览不可用" src="/missing-preview.png" />
  </div>,
};

export const Keyboard: Story = {
  render: () => <div className="story-section">
    <p>聚焦标题后按 Enter 或空格键切换内容。</p>
    <Accordion aria-label="键盘操作示例" items={[{ key: 'keyboard', title: '键盘可操作标题', children: '内容支持键盘访问。' }]} />
  </div>,
};
