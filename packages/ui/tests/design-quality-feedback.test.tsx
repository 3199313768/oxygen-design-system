import { createElement, createRef, forwardRef, useEffect, useState, type InputHTMLAttributes } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Button } from '../src/components/Button';
import { Progress } from '../src/components/Progress';

describe('loading button feedback', () => {
  it.each([false, true])('preserves wrapped input children semantics with loading=%s', (loading) => {
    const WrappedInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>((props, ref) => <input {...props} ref={ref} />);
    render(<Button asChild loading={loading}><WrappedInput type="submit" value="包装保存" /></Button>);
    expect(screen.getByRole('button', { name: '包装保存' })).toHaveValue('包装保存');
  });

  it.each([false, true])('preserves inner HTML content with loading=%s', (loading) => {
    const link = createElement('a', { href: '#save', dangerouslySetInnerHTML: { __html: '保存内容' } });
    render(<Button asChild loading={loading}>{link}</Button>);
    expect(screen.getByRole('link', { name: '保存内容' })).toHaveTextContent('保存内容');
  });

  it('keeps void slotted controls valid when loading', () => {
    const { rerender } = render(<Button asChild><input type="submit" value="保存" /></Button>);
    const control = screen.getByRole('button', { name: '保存' });
    rerender(<Button asChild loading><input type="submit" value="保存" /></Button>);
    expect(screen.getByRole('button', { name: '保存' })).toBe(control);
    expect(control).toHaveAttribute('aria-busy', 'true');
    expect(control).toHaveAttribute('aria-disabled', 'true');
    expect(control.children).toHaveLength(0);
  });

  it('preserves stateful slotted content across loading transitions', () => {
    let mounts = 0;
    let increment: () => void = () => undefined;
    function Label() {
      const [count, setCount] = useState(0);
      useEffect(() => {
        mounts += 1;
        increment = () => setCount((previous) => previous + 1);
      }, []);
      return <span>次数 {count}</span>;
    }
    const content = (loading: boolean) => <Button asChild loading={loading}><a href="#counter"><Label /></a></Button>;
    const { rerender } = render(content(false));
    act(() => increment());
    expect(screen.getByRole('link')).toHaveTextContent('次数 1');
    rerender(content(true));
    expect(screen.getByRole('link')).toHaveTextContent('次数 1');
    rerender(content(false));
    expect(screen.getByRole('link')).toHaveTextContent('次数 1');
    expect(mounts).toBe(1);
  });

  it('preserves the slotted link DOM, refs and loading semantics', () => {
    const ref = createRef<HTMLAnchorElement>();
    const childRef = createRef<HTMLAnchorElement>();
    const { container } = render(<>
      <Button loading>提交</Button>
      <Button asChild loading ref={ref}><a href="#submit" ref={childRef}>继续</a></Button>
    </>);
    const button = screen.getByRole('button', { name: '提交' });
    const link = screen.getByRole('link', { name: '继续' });
    expect(button.querySelector('[data-oxygen-loading-indicator]')).toBeVisible();
    expect(link.children).toHaveLength(0);
    expect(container.children).toHaveLength(2);
    expect(ref.current).toBe(link);
    expect(childRef.current).toBe(link);
    expect(link).toHaveAttribute('href', '#submit');
    expect(link).toHaveAttribute('aria-busy', 'true');
    expect(link).toHaveAttribute('aria-disabled', 'true');
    expect(link).toHaveAttribute('tabindex', '-1');
  });

  it('restores child and parent handlers when loading ends', () => {
    const events: string[] = [];
    const content = (loading: boolean) => (
      <Button asChild loading={loading} onClick={() => events.push('parent click')} onClickCapture={() => events.push('parent capture')} onKeyDown={() => events.push('parent key')}>
        <a href="#submit" tabIndex={0} onClick={() => events.push('child click')} onClickCapture={() => events.push('child capture')} onKeyDown={() => events.push('child key')}>
          <span>继续</span>
        </a>
      </Button>
    );
    const { rerender } = render(content(true));
    const link = screen.getByRole('link', { name: '继续' });
    const label = link.firstElementChild;
    expect(fireEvent.click(link)).toBe(false);
    expect(fireEvent.keyDown(link, { key: 'Enter' })).toBe(false);
    expect(events).toEqual([]);
    rerender(content(false));
    expect(screen.getByRole('link', { name: '继续' })).toBe(link);
    expect(link.firstElementChild).toBe(label);
    expect(link).not.toHaveAttribute('aria-busy');
    expect(link).not.toHaveAttribute('aria-disabled');
    expect(link).toHaveAttribute('tabindex', '0');
    fireEvent.keyDown(link, { key: 'Enter' });
    fireEvent.click(link);
    expect(events).toEqual(['child key', 'parent key', 'child capture', 'parent capture', 'child click', 'parent click']);
  });

  it.each(['label', 'title'] as const)('preserves a slotted icon button name from its %s while loading', (nameSource) => {
    render(<Button asChild loading size="icon">
      <button aria-label={nameSource === 'label' ? '刷新' : undefined}>
        <svg role="img" aria-hidden={nameSource === 'label' ? true : undefined}>
          <title>刷新</title><path d="M0 0h10" />
        </svg>
      </button>
    </Button>);
    const button = screen.getByRole('button', { name: '刷新' });
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(button.querySelector('svg')).toBeInTheDocument();
  });
});

describe('progress feedback without percentages', () => {
  it.each([
    ['exception', 0, 'circle-x', '错误 0%'],
    ['exception', 40, 'circle-x', '错误 40%'],
    ['success', 100, 'circle-check', '已完成 100%'],
  ] as const)('keeps a visible %s shape at %s percent without showing the percentage', (status, percent, icon, valueText) => {
    render(<Progress percent={percent} showInfo={false} status={status} aria-label="导出" />);
    const progress = screen.getByRole('progressbar', { name: '导出' });
    const marker = progress.querySelector(`.lucide-${icon}`);
    expect(marker).toBeVisible();
    expect(marker).toHaveAttribute('aria-hidden', 'true');
    expect(progress.textContent).toBe('');
    expect(progress).toHaveAttribute('aria-valuenow', String(percent));
    expect(progress).toHaveAttribute('aria-valuemin', '0');
    expect(progress).toHaveAttribute('aria-valuemax', '100');
    expect(progress).toHaveAttribute('aria-valuetext', valueText);
    expect(progress.querySelector('.oxygen-progress__bar')).toHaveStyle({ width: `${percent}%` });
  });

  it.each(['normal', 'active'] as const)('keeps hidden %s progress free of info and status shapes', (status) => {
    render(<Progress percent={40} showInfo={false} status={status} />);
    const progress = screen.getByRole('progressbar');
    expect(progress.querySelector('.oxygen-progress__info')).toBeNull();
    expect(progress.querySelector('svg')).toBeNull();
    expect(progress).toHaveAttribute('aria-valuenow', '40');
  });

  it('keeps the status marker when toggling percentage visibility and removes stale status shapes', () => {
    const { rerender } = render(<Progress percent={40} status="exception" />);
    const progress = screen.getByRole('progressbar');
    expect(progress).toHaveTextContent('40%');
    rerender(<Progress percent={40} status="exception" showInfo={false} />);
    expect(progress.querySelector('.lucide-circle-x')).toBeVisible();
    expect(progress.textContent).toBe('');
    rerender(<Progress percent={100} status="success" showInfo={false} />);
    expect(progress.querySelector('.lucide-circle-check')).toBeVisible();
    expect(progress.querySelector('.lucide-circle-x')).toBeNull();
    rerender(<Progress percent={0} showInfo={false} />);
    expect(progress.querySelector('svg')).toBeNull();
    expect(progress).not.toHaveAttribute('aria-valuetext');
  });
});
