import type { Preview } from '@storybook/react-vite';
import { Controls, Description, Primary, Stories, Title } from '@storybook/addon-docs/blocks';

import '@oxygen-design/ui/styles.css';
import './preview.css';

const framedGroups = new Set(['数据录入/树与级联', '数据展示/结构化展示', '数据展示/渐进式披露']);
const stateNames: Record<string, string> = {
  Flat: '平级目录', Nested: '嵌套目录', Checkable: '勾选与半选', Disabled: '禁用状态',
  Controlled: '受控状态', Searchable: '搜索选择', Cascading: '级联选择', Empty: '空状态',
  Normal: '基础展示', Loading: '加载状态', Error: '错误状态', Responsive: '窄容器适配',
  'Vertical Steps': '纵向步骤', Fallback: '加载失败', Keyboard: '键盘操作',
};

function DocsPage() {
  return (
    <>
      <Title />
      <Description />
      <Primary />
      <Controls />
      <Stories includePrimary={false} />
    </>
  );
}

function StoryContextBanner({ title, name }: { title: string; name: string }) {
  const groupName = title.split('/').at(-1) ?? title;
  const stateName = stateNames[name] ?? name;
  return (
    <div aria-label="当前组件" className="story-context-banner">
      <span>{groupName}</span>
      <strong>{stateName}</strong>
    </div>
  );
}

const preview: Preview = {
  decorators: [(Story, context) => {
    const contextBanner = <StoryContextBanner name={context.name} title={context.title} />;
    return framedGroups.has(context.title) ? (
      <section className="story-section">
        {contextBanner}
        <h2 className="story-section__title">{context.title.split('/')[1]} · {stateNames[context.name] ?? context.name}</h2>
        <Story />
      </section>
    ) : <>{contextBanner}<Story /></>;
  }],
  parameters: {
    a11y: {
      test: 'error',
    },
    controls: {
      expanded: true,
    },
    docs: {
      page: DocsPage,
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
