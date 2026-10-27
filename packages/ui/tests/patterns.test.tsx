import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import {
  AppShell,
  Button,
  EmptyState,
  PageHeader,
  StatusMessage,
} from '../src';

describe('generic page patterns', () => {
  it('renders a page heading with long text and optional actions', () => {
    render(
      <PageHeader
        actions={<Button>新建</Button>}
        description="集中查看并管理当前团队中的所有知识文件。"
        title="这是一个需要正确换行而不能遮挡右侧操作区域的较长页面标题"
      />,
    );

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: '这是一个需要正确换行而不能遮挡右侧操作区域的较长页面标题',
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '新建' })).toBeInTheDocument();
  });

  it('renders an unframed empty state with or without an action', () => {
    const { rerender } = render(
      <EmptyState description="上传文件后会显示在这里" title="暂无文件" />,
    );

    expect(screen.getByRole('heading', { name: '暂无文件' })).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();

    rerender(
      <EmptyState
        action={<Button>上传文件</Button>}
        description="上传文件后会显示在这里"
        title="暂无文件"
      />,
    );
    expect(screen.getByRole('button', { name: '上传文件' })).toBeInTheDocument();
  });

  it('maps errors to alerts and other feedback to status', () => {
    const { rerender } = render(
      <StatusMessage tone="error" title="加载失败">
        请检查网络后重试
      </StatusMessage>,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('请检查网络后重试');

    rerender(<StatusMessage tone="success">文件已上传</StatusMessage>);
    expect(screen.getByRole('status')).toHaveTextContent('文件已上传');
  });

  it('provides desktop slots and accessible mobile navigation', () => {
    render(
      <AppShell
        mobileNavigation={
          <nav aria-label="应用导航">
            <Button>回收站</Button>
          </nav>
        }
        sidebar={<nav aria-label="应用导航">桌面导航</nav>}
        title="Oxygen 知识库"
        topbarActions={<Button size="icon" aria-label="账号菜单">A</Button>}
      >
        <p>页面内容</p>
      </AppShell>,
    );

    expect(screen.getAllByRole('navigation', { name: '应用导航' })).toHaveLength(1);
    expect(screen.getByText('页面内容')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '打开导航' }));

    const dialog = screen.getByRole('dialog', { name: 'Oxygen 知识库导航' });
    expect(within(dialog).getByRole('navigation', { name: '应用导航' })).toBeInTheDocument();
  });
});
