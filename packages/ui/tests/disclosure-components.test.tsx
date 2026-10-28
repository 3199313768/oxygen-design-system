import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import {
  Accordion,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  Image,
  ImagePreview,
} from '../src';

describe('disclosure and image components', () => {
  it('toggles accordion items with a keyboard button', () => {
    render(<Accordion items={[{ key: 'one', title: '第一项', children: '第一项内容' }]} />);

    const trigger = screen.getByRole('button', { name: '第一项' });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText('第一项内容')).not.toBeVisible();

    trigger.focus();
    fireEvent.keyDown(trigger, { key: 'Enter' });
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('第一项内容')).toBeVisible();
  });

  it('keeps numeric Accordion keys distinct and honors root disabled state', () => {
    const onValueChange = vi.fn();
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    render(<Accordion disabled onValueChange={onValueChange} items={[
      { key: 1, title: '数字键', children: '数字内容' },
      { key: '1', title: '字符串键', children: '字符串内容' },
    ]} />);

    const triggers = screen.getAllByRole('button');
    expect(triggers[0]).toBeDisabled();
    expect(triggers[1]).toBeDisabled();
    expect(screen.getAllByRole('button').map((trigger) => trigger.getAttribute('aria-controls'))[0]).not.toBe(
      screen.getAllByRole('button').map((trigger) => trigger.getAttribute('aria-controls'))[1],
    );
    expect(onValueChange).not.toHaveBeenCalled();
    expect(consoleError).not.toHaveBeenCalledWith(expect.stringContaining('Each child in a list should have a unique "key" prop'));
    consoleError.mockRestore();
  });

  it('keeps a controlled collapsible closed until its parent updates it', () => {
    const onOpenChange = vi.fn();
    const { rerender } = render(
      <Collapsible open={false} onOpenChange={onOpenChange}>
        <CollapsibleTrigger>显示详情</CollapsibleTrigger>
        <CollapsibleContent>详情内容</CollapsibleContent>
      </Collapsible>,
    );

    fireEvent.click(screen.getByRole('button', { name: '显示详情' }));
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(screen.queryByText('详情内容')).not.toBeInTheDocument();
    rerender(
      <Collapsible open onOpenChange={onOpenChange}>
        <CollapsibleTrigger>显示详情</CollapsibleTrigger>
        <CollapsibleContent>详情内容</CollapsibleContent>
      </Collapsible>,
    );
    expect(screen.getByText('详情内容')).toBeVisible();
  });

  it('renders fallback content when an image fails to load', () => {
    render(<Image alt="示例图片" fallback={<span>图片不可用</span>} src="/broken.png" />);
    fireEvent.error(screen.getByRole('img', { name: '示例图片' }));
    expect(screen.getByText('图片不可用')).toBeVisible();
    expect(screen.getByRole('img', { name: '示例图片' })).toBeInTheDocument();
  });

  it('marks an empty-alt fallback as decorative', () => {
    render(<Image alt="" fallback="图片不可用" src="/broken.png" />);
    fireEvent.error(document.querySelector('img')!);
    expect(screen.getByText('图片不可用')).toHaveAttribute('aria-hidden', 'true');
  });

  it('closes a preview on Escape and uses the caller close label', () => {
    render(<ImagePreview alt="预览图片" closeLabel="关闭图片预览" src="/preview.png" />);
    fireEvent.click(screen.getByRole('button', { name: '预览图片' }));
    expect(screen.getByRole('dialog')).toBeVisible();
    expect(screen.getByRole('button', { name: '关闭图片预览' })).toBeInTheDocument();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
