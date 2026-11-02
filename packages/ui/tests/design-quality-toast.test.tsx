import { act, fireEvent, render, screen } from '@testing-library/react';
import { createRef, StrictMode, useState, type ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Message } from '../src/components/Message';
import { Notification } from '../src/components/Notification';
import { Toast, ToastAction, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from '../src/components/Toast';

function Feedback({ children }: { children: ReactNode }) {
  return <ToastProvider>{children}<ToastViewport /></ToastProvider>;
}

async function settle(milliseconds = 50) {
  await act(async () => { await vi.advanceTimersByTimeAsync(milliseconds); });
}

function updates(root: HTMLElement) {
  return root.querySelector('[role="status"][aria-live]');
}

describe('dynamic toast announcements', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => { vi.useRealTimers(); });

  it.each(['foreground', 'background'] as const)('announces Notification title and description updates with %s priority without repeating the initial announcement', async (type) => {
    const ref = createRef<HTMLLIElement>();
    const view = (title: string, description: string) => <Feedback><Notification ref={ref} open duration={Infinity} type={type} title={title} description={description} /></Feedback>;
    const { rerender } = render(view('导出状态', '导出中'));
    await settle();
    const root = ref.current!;
    expect(screen.getAllByRole('status').filter((region) => region.textContent?.includes('导出中'))).toHaveLength(1);
    expect(updates(root)?.textContent ?? '').toBe('');
    rerender(view('导出状态', '导出完成'));
    await settle();
    expect(ref.current).toBe(root);
    expect(root.querySelector('.oxygen-toast__description')).toHaveTextContent('导出完成');
    expect(screen.getAllByRole('status').some((region) => region.textContent?.includes('导出完成'))).toBe(true);
    expect(updates(root)).toHaveTextContent('导出状态 导出完成');
    expect(updates(root)).toHaveAttribute('aria-live', type === 'foreground' ? 'assertive' : 'polite');
    expect(updates(root)).toHaveAttribute('aria-atomic', 'true');
    rerender(view('下载状态', '导出完成'));
    await settle();
    expect(updates(root)).toHaveTextContent('下载状态 导出完成');
  });

  it('handles nested Message state updates and does not publish the same text or control/hidden text again', async () => {
    let change: (text: string) => void = () => undefined;
    function Content() {
      const [text, setText] = useState('处理中');
      change = setText;
      return <><span>{text}</span><span aria-hidden="true">装饰</span></>;
    }
    const ref = createRef<HTMLLIElement>();
    const view = (label: string) => <Feedback><Message ref={ref} defaultOpen duration={Infinity}><Content /><ToastAction altText="快捷操作">{label}</ToastAction><ToastClose>关闭消息</ToastClose></Message></Feedback>;
    const { rerender } = render(view('撤销'));
    await settle();
    await act(async () => change('已完成'));
    await settle();
    const region = updates(ref.current!)!;
    expect(region).toHaveTextContent(/^已完成$/);
    const mutations: MutationRecord[] = [];
    const observer = new MutationObserver((records) => mutations.push(...records));
    observer.observe(region, { childList: true, characterData: true, subtree: true });
    rerender(view('重试'));
    await act(async () => change('已完成'));
    await settle(1200);
    expect(mutations).toHaveLength(0);
    observer.disconnect();
  });

  it('ignores hidden ancestors, clears empty content, and announces text when it becomes accessible', async () => {
    const ref = createRef<HTMLLIElement>();
    const view = (hidden: boolean, text: string) => <Feedback><Toast ref={ref} open duration={Infinity}><div aria-hidden={hidden}><ToastTitle>{text}</ToastTitle></div><ToastDescription><span hidden>隐藏</span><span style={{ display: 'none' }}>不可见</span></ToastDescription></Toast></Feedback>;
    const { rerender } = render(view(true, '准备'));
    rerender(view(true, '完成'));
    await settle();
    expect(updates(ref.current!)?.textContent ?? '').toBe('');
    rerender(view(false, '完成'));
    await settle();
    expect(updates(ref.current!)).toHaveTextContent(/^完成$/);
    rerender(view(false, ''));
    await settle();
    expect(updates(ref.current!)).toBeEmptyDOMElement();
    rerender(view(false, '完成'));
    await settle();
    expect(updates(ref.current!)).toHaveTextContent(/^完成$/);
  });

  it('clears on force-mounted close and announces reopening without relying on a Radix remount', async () => {
    const ref = createRef<HTMLLIElement>();
    const view = (open: boolean, text: string) => <Feedback><Toast ref={ref} forceMount open={open} duration={Infinity}><ToastDescription>{text}</ToastDescription></Toast></Feedback>;
    const { rerender, unmount } = render(view(true, '准备'));
    rerender(view(true, '完成'));
    await settle();
    const root = ref.current!;
    const region = updates(root)!;
    expect(region).toHaveTextContent('完成');
    rerender(view(false, '关闭期间'));
    await settle();
    expect(region).toBeEmptyDOMElement();
    rerender(view(true, '重开'));
    await settle();
    expect(region).toHaveTextContent('重开');
    rerender(view(true, '新结果'));
    await settle();
    expect(region).toHaveTextContent('新结果');
    unmount();
    root.querySelector('.oxygen-toast__description')!.textContent = '卸载后';
    await settle();
    expect(region).toBeEmptyDOMElement();
    expect(ref.current).toBeNull();
  });

  it('lets Radix announce a normally remounted Toast once on reopening, then announces further updates', async () => {
    const ref = createRef<HTMLLIElement>();
    const view = (open: boolean, text: string) => <Feedback><Toast ref={ref} open={open} duration={Infinity}><ToastTitle>{text}</ToastTitle><ToastClose /></Toast></Feedback>;
    const { rerender } = render(view(true, '准备'));
    await settle();
    rerender(view(true, '完成'));
    await settle();
    const oldRoot = ref.current!;
    const oldRegion = updates(oldRoot)!;
    expect(oldRegion).toHaveTextContent('完成');
    rerender(view(false, '关闭期间'));
    await settle();
    expect(oldRegion).toBeEmptyDOMElement();
    expect(ref.current).toBeNull();
    rerender(view(true, '重新准备'));
    await settle();
    expect(ref.current).not.toBe(oldRoot);
    expect(updates(ref.current!)).toBeEmptyDOMElement();
    expect(screen.getAllByRole('status').filter((region) => region.textContent?.includes('重新准备'))).toHaveLength(1);
    rerender(view(true, '重新完成'));
    await settle();
    expect(updates(ref.current!)).toHaveTextContent('重新完成');
  });

  it('preserves asChild, props, ref cleanup and focused controls through updates in StrictMode', async () => {
    const cleanup = vi.fn();
    const ref = vi.fn((_node: HTMLLIElement | null) => cleanup);
    const onClick = vi.fn();
    const view = (text: string) => <StrictMode><Feedback><Toast asChild ref={ref} defaultOpen duration={Infinity} className="custom" data-testid="toast" tone="success" onClick={onClick}><li><ToastDescription>{text}</ToastDescription><ToastClose /></li></Toast></Feedback></StrictMode>;
    const { rerender, unmount } = render(view('准备'));
    await settle();
    const root = screen.getByTestId('toast');
    const close = screen.getByRole('button', { name: '关闭' });
    act(() => close.focus());
    const cleanupCount = cleanup.mock.calls.length;
    rerender(view('完成'));
    await settle();
    expect(updates(root)).toHaveTextContent('完成');
    expect(screen.getByTestId('toast')).toBe(root);
    expect(close).toHaveFocus();
    expect(root).toHaveClass('custom', 'oxygen-toast');
    expect(root).toHaveAttribute('data-tone', 'success');
    expect(cleanup).toHaveBeenCalledTimes(cleanupCount);
    fireEvent.click(root);
    expect(onClick).toHaveBeenCalledOnce();
    unmount();
    expect(cleanup).toHaveBeenCalledTimes(cleanupCount + 1);
  });

  it('does not restart the auto-close timer and stops announcing after uncontrolled close', async () => {
    const onOpenChange = vi.fn();
    const ref = createRef<HTMLLIElement>();
    const view = (text: string) => <Feedback><Toast ref={ref} defaultOpen duration={1000} onOpenChange={onOpenChange}><ToastDescription>{text}</ToastDescription><ToastClose /></Toast></Feedback>;
    const { rerender } = render(view('准备'));
    await settle(600);
    const root = ref.current!;
    rerender(view('完成'));
    await settle(50);
    expect(updates(root)).toHaveTextContent('完成');
    await settle(400);
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(ref.current).toBeNull();
    rerender(view('关闭后的结果'));
    await settle();
    expect(document.querySelector('[role="status"]')?.textContent ?? '').not.toContain('关闭后的结果');
  });
});
