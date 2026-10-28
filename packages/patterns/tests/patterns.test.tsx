import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Button } from '@oxygen-design/ui';
import {
  AppShell,
  EmptyState,
  PageHeader,
  StatusMessage,
} from '../src';

describe('patterns', () => {
  it('uses Chinese generic defaults for mobile navigation', () => {
    render(
      <AppShell
        mobileNavigation={<nav aria-label="导航">导航项</nav>}
        sidebar={<nav aria-label="导航">导航项</nav>}
        title="页面"
      >
        <p>内容区域</p>
      </AppShell>,
    );

    fireEvent.click(screen.getByRole('button', { name: '打开导航' }));
    const dialog = screen.getByRole('dialog', { name: '页面导航' });
    expect(within(dialog).getByText('请选择页面')).toBeInTheDocument();
  });

  it('uses caller-provided navigation labels in AppShell', () => {
    render(
      <AppShell
        mobileNavigation={<nav aria-label="导航">导航项</nav>}
        navigationDescription="选择工作区页面"
        navigationTitle="工作区导航"
        navigationTriggerLabel="打开工作区导航"
        sidebar={<nav aria-label="导航">导航项</nav>}
        title="页面"
      >
        <p>页面内容</p>
      </AppShell>,
    );

    fireEvent.click(screen.getByRole('button', { name: '打开工作区导航' }));
    const dialog = screen.getByRole('dialog', { name: '工作区导航' });
    expect(
      within(dialog).getByText('选择工作区页面'),
    ).toBeInTheDocument();
  });

  it('renders a page heading with long text and optional actions', () => {
    render(
      <PageHeader
        actions={<Button>新建</Button>}
        description="集中查看并管理当前内容。"
        title="这是一个需要正确换行的较长页面标题"
      />,
    );

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: '这是一个需要正确换行的较长页面标题',
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '新建' })).toBeInTheDocument();
  });

  it('renders an unframed empty state with or without an action', () => {
    const { rerender } = render(
      <EmptyState description="当前没有可展示的数据" title="暂无数据" />,
    );

    expect(screen.getByRole('heading', { name: '暂无数据' })).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();

    rerender(
      <EmptyState
        action={<Button>新增项</Button>}
        description="当前没有可展示的数据"
        title="暂无数据"
      />,
    );
    expect(screen.getByRole('button', { name: '新增项' })).toBeInTheDocument();
  });

  it('maps errors to alerts and other feedback to status', () => {
    const { rerender } = render(
      <StatusMessage tone="error" title="加载失败">
        请检查网络后重试
      </StatusMessage>,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('请检查网络后重试');

    rerender(<StatusMessage tone="success">内容已更新</StatusMessage>);
    expect(screen.getByRole('status')).toHaveTextContent('内容已更新');
  });

  it('provides desktop slots and accessible mobile navigation', () => {
    render(
      <AppShell
        mobileNavigation={
          <nav aria-label="导航">
            <Button>导航项</Button>
          </nav>
        }
        navigationDescription="选择要打开的页面"
        navigationTitle="页面导航"
        navigationTriggerLabel="打开导航"
        sidebar={<nav aria-label="导航">导航项</nav>}
        title="页面布局"
        topbarActions={<Button size="icon" aria-label="更多操作">更多</Button>}
      >
        <p>页面内容</p>
      </AppShell>,
    );

    expect(screen.getAllByRole('navigation', { name: '导航' })).toHaveLength(1);
    expect(screen.getByText('页面内容')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '打开导航' }));

    const dialog = screen.getByRole('dialog', { name: '页面导航' });
    expect(within(dialog).getByRole('navigation', { name: '导航' })).toBeInTheDocument();
  });
});
