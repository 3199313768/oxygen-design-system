import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Alert, AlertDescription, AlertTitle } from '../src/components/Alert';
import { ConfigProvider } from '../src/components/ConfigProvider';
import { Skeleton } from '../src/components/Skeleton';
import { Progress } from '../src/components/Progress';
import { Toast, ToastClose, ToastDescription, ToastProvider, ToastViewport } from '../src/components/Toast';
import { Upload } from '../src/components/Upload';

describe('feedback semantics', () => {
  it.each([['info', 'info'], ['error', 'circle-x'], ['success', 'circle-check'], ['warning', 'triangle-alert']] as const)('distinguishes %s alerts with a decorative shape and a single live region', (tone, icon) => {
    const { container } = render(<Alert tone={tone}><AlertTitle>提示</AlertTitle><AlertDescription>操作结果</AlertDescription></Alert>);
    expect(container.querySelector(`.lucide-${icon}`)).toHaveAttribute('aria-hidden', 'true');
    expect(container.querySelectorAll('[role="status"], [role="alert"]')).toHaveLength(1);
    expect(screen.getByText('操作结果')).toBeVisible();
  });

  it('can omit the alert icon and preserve custom roles', () => {
    const { container } = render(<Alert showIcon={false} role="note">普通内容</Alert>);
    expect(container.querySelector('svg')).toBeNull();
    expect(screen.getByRole('note')).toHaveTextContent('普通内容');
  });

  it('gives the default toast close control a visible icon and accessible name', () => {
    render(<ToastProvider><Toast defaultOpen><ToastDescription>保存成功</ToastDescription><ToastClose /></Toast><ToastViewport /></ToastProvider>);
    const close = screen.getByRole('button', { name: '关闭' });
    expect(close.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
    fireEvent.click(close);
    expect(screen.queryByText('保存成功')).not.toBeInTheDocument();
  });

  it('normalizes invalid progress and describes exceptional states without relying on color', () => {
    const { rerender } = render(<Progress percent={Number.NaN} status="exception" aria-label="导出" />);
    expect(screen.getByRole('progressbar', { name: '导出' })).toHaveAttribute('aria-valuenow', '0');
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuetext', '错误 0%');
    expect(screen.getByRole('progressbar').querySelector('svg')).not.toBeNull();
    rerender(<Progress percent={100} status="success" />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuetext', '已完成 100%');
  });

  it('shows distinct default button and drop zone guidance while preserving custom content', () => {
    const { rerender } = render(<Upload />);
    expect(screen.getByRole('button', { name: '浏览' }).querySelector('svg')).not.toBeNull();
    rerender(<Upload drag />);
    expect(screen.getByText('点击或拖拽文件到此处上传')).toBeVisible();
    rerender(<Upload drag>自定义上传内容</Upload>);
    expect(screen.queryByText('点击或拖拽文件到此处上传')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: '自定义上传内容' })).toBeVisible();
  });

  it('renders file progress and only makes a file name interactive when preview is provided', () => {
    const file = { file: new File([], 'report.pdf'), id: 'a', name: 'report.pdf', status: 'uploading' as const, percent: 48 };
    const { rerender } = render(<Upload fileList={[file]} />);
    expect(screen.queryByRole('button', { name: 'report.pdf' })).not.toBeInTheDocument();
    expect(screen.getByRole('progressbar', { name: 'report.pdf' })).toHaveAttribute('aria-valuenow', '48');
    const onPreview = vi.fn();
    rerender(<Upload fileList={[file]} onPreview={onPreview} />);
    fireEvent.click(screen.getByRole('button', { name: 'report.pdf' }));
    expect(onPreview).toHaveBeenCalledWith(file);
    expect(within(screen.getByRole('listitem')).getByText('上传中 48%')).toBeVisible();
  });
});


describe('feedback accessible names', () => {
  it('gives unnamed Progress a localized default name', () => {
    const { rerender } = render(<Progress percent={25} />);
    expect(screen.getByRole('progressbar', { name: '进度' })).toHaveAttribute('aria-valuenow', '25');
    rerender(<ConfigProvider locale={{ common: { progress: 'Progress' } }}><Progress /></ConfigProvider>);
    expect(screen.getByRole('progressbar', { name: 'Progress' })).toBeVisible();
  });

  it('prioritizes consumer progress labels over the default name', () => {
    const { rerender } = render(<Progress aria-label="文件上传" />);
    expect(screen.getByRole('progressbar', { name: '文件上传' })).toBeVisible();
    rerender(<><span id="task-label">导出报表</span><Progress aria-labelledby="task-label" /></>);
    expect(screen.getByRole('progressbar', { name: '导出报表' })).not.toHaveAttribute('aria-label');
  });

  it('gives a labelled Skeleton image semantics and keeps unnamed skeletons decorative', () => {
    const { container, rerender } = render(<Skeleton aria-label="加载占位" />);
    expect(screen.getByRole('img', { name: '加载占位' })).not.toHaveAttribute('aria-hidden', 'true');
    rerender(<Skeleton />);
    expect(container.querySelector('.oxygen-skeleton')).toHaveAttribute('aria-hidden', 'true');
    expect(container.querySelector('.oxygen-skeleton')).not.toHaveAttribute('role');
  });

  it('preserves explicit Skeleton roles and supports external labels', () => {
    const { rerender } = render(<Skeleton aria-label="载入中" role="status" />);
    expect(screen.getByRole('status', { name: '载入中' })).toBeVisible();
    rerender(<><span id="placeholder-label">图像占位</span><Skeleton aria-labelledby="placeholder-label" /></>);
    expect(screen.getByRole('img', { name: '图像占位' })).toBeVisible();
  });
});
