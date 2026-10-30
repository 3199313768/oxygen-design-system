import type { Preview } from '@storybook/react-vite';
import { useEffect, type ReactNode } from 'react';
import { ConfigProvider, type OxygenTheme } from '@oxygen-design/ui';
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

function ThemeFrame({ children, theme }: { children: ReactNode; theme: OxygenTheme }) {
  useEffect(() => {
    const root = document.documentElement;
    const previous = root.getAttribute('data-oxygen-theme');
    root.setAttribute('data-oxygen-theme', theme);
    return () => {
      if (previous === null) root.removeAttribute('data-oxygen-theme');
      else root.setAttribute('data-oxygen-theme', previous);
    };
  }, [theme]);
  return <ConfigProvider theme={theme}>{children}</ConfigProvider>;
}

const preview: Preview = {
  initialGlobals: { oxygenTheme: 'light' },
  globalTypes: {
    oxygenTheme: {
      description: 'Oxygen 主题',
      toolbar: {
        icon: 'circlehollow',
        dynamicTitle: true,
        items: [
          { value: 'light', title: '浅色' },
          { value: 'dark', title: '深色' },
          { value: 'system', title: '跟随系统' },
        ],
      },
    },
  },
  decorators: [(Story, context) => {
    const contextBanner = <StoryContextBanner name={context.name} title={context.title} />;
    const theme: OxygenTheme = context.globals.oxygenTheme === 'dark' ? 'dark' : context.globals.oxygenTheme === 'system' ? 'system' : 'light';
    const content = framedGroups.has(context.title) ? (
      <section className="story-section">
        {contextBanner}
        <h2 className="story-section__title">{context.title.split('/')[1]} · {stateNames[context.name] ?? context.name}</h2>
        <Story />
      </section>
    ) : <>{contextBanner}<Story /></>;
    return <ThemeFrame theme={theme}>{content}</ThemeFrame>;
  }],
  parameters: {
    options: { storySort: { order: ['开始使用', '基础规范', '组件', '页面模式', '*'] } },
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
