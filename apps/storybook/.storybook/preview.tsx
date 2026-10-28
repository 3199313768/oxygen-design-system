import type { Preview } from '@storybook/react-vite';

import '@oxygen-design/ui/styles.css';
import './preview.css';

const framedGroups = new Set(['数据录入/树与级联', '数据展示/结构化展示', '数据展示/渐进式披露']);
const stateNames: Record<string, string> = {
  Flat: '平级目录', Nested: '嵌套目录', Checkable: '勾选与半选', Disabled: '禁用状态',
  Controlled: '受控状态', Searchable: '搜索选择', Cascading: '级联选择', Empty: '空状态',
  Normal: '基础展示', Loading: '加载状态', Error: '错误状态', Responsive: '窄容器适配',
  'Vertical Steps': '纵向步骤', Fallback: '加载失败', Keyboard: '键盘操作',
};

const preview: Preview = {
  decorators: [(Story, context) => framedGroups.has(context.title) ? (
    <section className="story-section">
      <h2 className="story-section__title">{context.title.split('/')[1]} · {stateNames[context.name] ?? context.name}</h2>
      <Story />
    </section>
  ) : <Story />],
  parameters: {
    a11y: {
      test: 'error',
    },
    controls: {
      expanded: true,
    },
    layout: 'padded',
    viewport: {
      options: {
        desktop: {
          name: 'Desktop',
          styles: { height: '900px', width: '1440px' },
        },
        iphone: {
          name: 'iPhone',
          styles: { height: '844px', width: '390px' },
        },
      },
    },
  },
  tags: ['autodocs'],
};

export default preview;
