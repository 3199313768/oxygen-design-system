import { act, fireEvent, render, screen } from '@testing-library/react';
import { createRef, useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Combobox } from '../src/components/Combobox';
import { Field, FieldControl, FieldLabel } from '../src/components/Field';
import { Form } from '../src/components/Form';
import { Input } from '../src/components/Input';
import { Upload } from '../src/components/Upload';

const options = Array.from({ length: 30 }, (_, index) => ({
  value: index, label: `Option ${index + 1}`, disabled: index === 1,
}));

afterEach(() => vi.restoreAllMocks());

describe('design quality forms', () => {
  it('scrolls only the popup to reveal keyboard activity, including disabled skips and upward navigation', () => {
    render(<Combobox options={options} />);
    const input = screen.getByRole('combobox');
    act(() => input.focus());
    const popup = screen.getByRole('listbox');
    vi.spyOn(popup, 'getBoundingClientRect').mockReturnValue({ top: 100, bottom: 200 } as DOMRect);
    Object.defineProperty(popup, 'clientHeight', { configurable: true, value: 100 });
    const items = screen.getAllByRole('option');
    items.forEach((item, index) => {
      vi.spyOn(item, 'getBoundingClientRect').mockImplementation(() => ({
        top: 100 + index * 30 - popup.scrollTop,
        bottom: 130 + index * 30 - popup.scrollTop,
      } as DOMRect));
    });
    const documentScroll = document.documentElement.scrollTop;
    fireEvent.keyDown(input, { key: 'ArrowUp' });
    expect(popup.scrollTop).toBe(800);
    expect(input).toHaveAttribute('aria-activedescendant', items[29].id);
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(popup.scrollTop).toBe(0);
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(input).toHaveAttribute('aria-activedescendant', items[2].id);
    expect(popup.scrollTop).toBe(0);
    expect(document.documentElement.scrollTop).toBe(documentScroll);
    expect(input).toHaveFocus();
  });

  it.each(['object', 'callback'] as const)('restores actual input focus after clear with a %s forwarded ref', (kind) => {
    const objectRef = createRef<HTMLInputElement>();
    const callbackRef = vi.fn();
    const onChange = vi.fn();
    render(<Combobox defaultValue={0} options={options} ref={kind === 'object' ? objectRef : callbackRef} onChange={onChange} />);
    const input = screen.getByRole('combobox');
    act(() => input.focus());
    const clear = screen.getByRole('button', { name: '清除' });
    act(() => clear.focus());
    fireEvent.click(clear);
    expect(input).toHaveFocus();
    expect(input).toHaveValue('');
    expect(input).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('listbox')).toHaveAttribute('tabindex', '-1');
    expect(onChange).toHaveBeenLastCalledWith(undefined);
    if (kind === 'object') expect(objectRef.current).toBe(input);
    else expect(callbackRef).toHaveBeenCalledWith(input);
  });

  it('reveals active options in the input owner document', () => {
    const { container } = render(<iframe title="Embedded forms" />);
    const frameDocument = container.querySelector('iframe')!.contentDocument!;
    const frame = render(<Combobox options={options} />, { container: frameDocument.body, baseElement: frameDocument.body });
    const input = frame.getByRole('combobox');
    act(() => input.focus());
    const popup = frame.getByRole('listbox');
    vi.spyOn(popup, 'getBoundingClientRect').mockReturnValue({ top: 100, bottom: 200 } as DOMRect);
    Object.defineProperty(popup, 'clientHeight', { value: 100 });
    vi.spyOn(frame.getByRole('option', { name: 'Option 30' }), 'getBoundingClientRect').mockReturnValue({ top: 970, bottom: 1000 } as DOMRect);
    fireEvent.keyDown(input, { key: 'ArrowUp' });
    expect(popup.scrollTop).toBe(800);
    expect(frameDocument.activeElement).toBe(input);
    frame.unmount();
  });

  it('runs React 19 callback cleanup on ref replacement and unmount', () => {
    const firstCleanup = vi.fn();
    const secondCleanup = vi.fn();
    const firstRef = vi.fn((node: HTMLInputElement | null) => node ? firstCleanup : undefined);
    const secondRef = vi.fn((node: HTMLInputElement | null) => node ? secondCleanup : undefined);
    const { rerender, unmount } = render(<Combobox options={options} ref={firstRef} />);
    const input = screen.getByRole('combobox');
    rerender(<Combobox options={options} ref={secondRef} />);
    expect(firstCleanup).toHaveBeenCalledTimes(1);
    expect(firstRef).toHaveBeenCalledExactlyOnceWith(input);
    expect(secondRef).toHaveBeenCalledExactlyOnceWith(input);
    unmount();
    expect(secondCleanup).toHaveBeenCalledTimes(1);
    expect(secondRef).not.toHaveBeenCalledWith(null);
  });

  it('keeps legacy callback null notifications when no cleanup is returned', () => {
    const ref = vi.fn();
    const { unmount } = render(<Combobox options={options} ref={ref} />);
    const input = screen.getByRole('combobox');
    expect(ref).toHaveBeenCalledExactlyOnceWith(input);
    unmount();
    expect(ref).toHaveBeenLastCalledWith(null);
    expect(ref).toHaveBeenCalledTimes(2);
  });

  it('synchronizes filtered and reopened lists without moving input focus', () => {
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
      if (this.getAttribute('role') === 'listbox') return { top: 100, bottom: 200 } as DOMRect;
      const list = this.parentElement!;
      const index = Array.from(list.children).indexOf(this);
      const top = 100 + index * 30 - list.scrollTop;
      return { top, bottom: top + 30 } as DOMRect;
    });
    render(<Combobox options={options} />);
    const input = screen.getByRole('combobox');
    act(() => input.focus());
    fireEvent.change(input, { target: { value: 'Option 1' } });
    const filteredList = screen.getByRole('listbox');
    Object.defineProperty(filteredList, 'clientHeight', { value: 100 });
    fireEvent.keyDown(input, { key: 'ArrowUp' });
    expect(filteredList.scrollTop).toBe(230);
    expect(document.getElementById(input.getAttribute('aria-activedescendant')!)).toHaveTextContent('Option 19');
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    fireEvent.click(input);
    const reopenedList = screen.getByRole('listbox');
    Object.defineProperty(reopenedList, 'clientHeight', { value: 100 });
    fireEvent.keyDown(input, { key: 'ArrowUp' });
    expect(reopenedList.scrollTop).toBe(800);
    expect(input).toHaveFocus();
  });

  it.each([true, false])('keeps controlled clear acceptance=%s and restores focus', (accept) => {
    function Parent() {
      const [value, setValue] = useState<number | undefined>(0);
      return <Combobox options={options} value={value} onChange={accept ? setValue : undefined} />;
    }
    render(<Parent />);
    const input = screen.getByRole('combobox');
    act(() => input.focus());
    const clear = screen.getByRole('button', { name: '清除' });
    act(() => clear.focus());
    fireEvent.click(clear);
    expect(input).toHaveFocus();
    expect(input).toHaveValue(accept ? '' : 'Option 1');
  });

  it.each(['disabled', 'readOnly'] as const)('keeps %s combobox interaction blocked', (state) => {
    const onChange = vi.fn();
    render(<Combobox options={options} defaultValue={0} {...{ [state]: true }} onChange={onChange} />);
    const input = screen.getByRole('combobox');
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.click(screen.getByRole('button', { name: '清除' }));
    expect(input).toHaveAttribute('aria-expanded', 'false');
    expect(input).toHaveValue('Option 1');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('closes when focus leaves through clear, preserving input blur and internal focus', () => {
    const onBlur = vi.fn();
    render(<><Combobox defaultValue={0} options={options} onBlur={onBlur} /><button>After</button></>);
    const input = screen.getByRole('combobox');
    act(() => input.focus());
    act(() => screen.getByRole('button', { name: '清除' }).focus());
    expect(onBlur).toHaveBeenCalledTimes(1);
    expect(input).toHaveAttribute('aria-expanded', 'true');
    act(() => screen.getByRole('button', { name: 'After' }).focus());
    expect(input).toHaveAttribute('aria-expanded', 'false');
    expect(onBlur).toHaveBeenCalledTimes(1);
  });

  it('inherits Field required semantics without activating native validation', () => {
    const { rerender } = render(<Field required><FieldLabel>Name</FieldLabel><FieldControl><Input /></FieldControl></Field>);
    const input = screen.getByRole('textbox', { name: 'Name' });
    expect(input).toHaveAttribute('aria-required', 'true');
    expect(input).not.toHaveAttribute('required');
    rerender(<Field><FieldLabel>Name</FieldLabel><FieldControl><Input /></FieldControl></Field>);
    expect(input).not.toHaveAttribute('aria-required');
  });

  it.each([false, 'false'] as const)('preserves explicit aria-required=%s on both Slot and child', (required) => {
    render(<Field required><FieldControl aria-required={required}><Input aria-label="Slot override" /></FieldControl><FieldControl><Input aria-label="Child override" aria-required={required} /></FieldControl></Field>);
    expect(screen.getByRole('textbox', { name: 'Slot override' })).toHaveAttribute('aria-required', 'false');
    expect(screen.getByRole('textbox', { name: 'Child override' })).toHaveAttribute('aria-required', 'false');
  });

  it('removes the hidden file input from sequential focus while browse still activates it', () => {
    render(<Upload />);
    const input = screen.getByLabelText('上传');
    expect(input).toHaveAttribute('tabindex', '-1');
    const click = vi.spyOn(input, 'click');
    fireEvent.click(screen.getByRole('button', { name: '浏览' }));
    expect(click).toHaveBeenCalledTimes(1);
  });

  it('keeps standalone aria-label on the file input and preserves browse and custom child names', () => {
    const { rerender } = render(<Upload aria-label="选择文件" />);
    expect(screen.getByLabelText('选择文件')).toHaveAttribute('type', 'file');
    expect(screen.getByRole('button', { name: '浏览' })).not.toHaveAttribute('aria-label', '选择文件');
    rerender(<Upload aria-label="选择文件">Choose a PDF</Upload>);
    expect(screen.getByLabelText('选择文件')).toHaveAttribute('type', 'file');
    expect(screen.getByRole('button', { name: 'Choose a PDF' })).not.toHaveAttribute('aria-label', '选择文件');
  });

  it('preserves standalone root id and div ref while keeping a separate stable trigger id', () => {
    const ref = createRef<HTMLDivElement>();
    const { container, rerender } = render(<Upload id="files" ref={ref} />);
    const root = ref.current!;
    const browse = screen.getByRole('button', { name: '浏览' });
    const triggerId = browse.id;
    expect(root).toBe(container.firstElementChild);
    expect(root.tagName).toBe('DIV');
    expect(root.id).toBe('files');
    expect(document.getElementById('files')).toBe(root);
    expect(triggerId).not.toBe('');
    expect(triggerId).not.toBe('files');
    rerender(<Upload id="documents" ref={ref} />);
    expect(ref.current).toBe(root);
    expect(root.id).toBe('documents');
    expect(document.getElementById('files')).toBeNull();
    expect(browse.id).toBe(triggerId);
  });

  it('associates the actual browse and file controls with Form label and error while keeping the root ref', () => {
    const ref = createRef<HTMLDivElement>();
    const { container } = render(<Form.Item name="attachment" label="Attachment" help="Upload contract" validateStatus="error" required><Upload ref={ref} /></Form.Item>);
    const browse = screen.getByRole('button', { name: 'Attachment' });
    const input = container.querySelector('input[type="file"]')!;
    expect(screen.getByText('Attachment').closest('label')).toHaveAttribute('for', browse.id);
    expect(document.getElementById(browse.id)).toBe(browse);
    for (const control of [browse, input]) {
      expect(control).toHaveAccessibleName('Attachment');
      expect(control).toHaveAccessibleDescription('Upload contract');
      expect(control).toHaveAttribute('aria-invalid', 'true');
    }
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('aria-required', 'true');
    expect(input).not.toHaveAttribute('required');
    expect(ref.current).toBe(browse.parentElement);
    expect(ref.current?.tagName).toBe('DIV');
  });

  it('uses native Field label association on browse without a Form.Item wrapper', () => {
    const { container } = render(<Field description="PDF only" invalid><FieldLabel>Contract</FieldLabel><FieldControl><Upload /></FieldControl></Field>);
    const browse = screen.getByRole('button', { name: 'Contract' });
    expect(browse).toHaveAccessibleDescription('PDF only');
    expect(browse).toHaveAttribute('aria-invalid', 'true');
    const input = container.querySelector('input[type="file"]')!;
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleName('Contract');
    expect(document.getElementById(browse.id)).toBe(browse);
  });

  it('preserves Upload explicit ARIA overrides and includes the drag hint', () => {
    const { container } = render(<><p id="manual">Manual guidance</p><Field description="Automatic" invalid required><FieldControl aria-describedby="manual"><Upload drag aria-label="Pick contract" aria-describedby="manual" aria-invalid={false} aria-required={false} /></FieldControl></Field></>);
    const browse = screen.getByRole('button', { name: 'Pick contract' });
    const input = container.querySelector<HTMLInputElement>('input[type="file"]')!;
    for (const control of [browse, input]) {
      expect(control).toHaveAttribute('aria-invalid', 'false');
      expect(control.getAttribute('aria-describedby')?.split(' ')).toContain('manual');
      expect(control).not.toHaveAccessibleDescription(expect.stringContaining('Automatic'));
    }
    expect(input).toHaveAttribute('aria-invalid', 'false');
    expect(input).toHaveAttribute('aria-required', 'false');
    const hint = container.querySelector('.oxygen-upload__hint')!;
    expect(browse.getAttribute('aria-describedby')?.split(' ')).toContain(hint.id);
  });

  it('preserves custom browse text, explicit labelling and disabled activation', () => {
    const { container } = render(<><span id="upload-label">Manual name</span><Upload aria-labelledby="upload-label" disabled>Choose a PDF</Upload></>);
    const browse = screen.getByRole('button', { name: 'Manual name' });
    const input = container.querySelector<HTMLInputElement>('input[type="file"]')!;
    expect(input).toHaveAccessibleName('Manual name');
    expect(browse).toHaveTextContent('Choose a PDF');
    expect(browse).toBeDisabled();
    expect(input).toBeDisabled();
    const click = vi.spyOn(input, 'click');
    fireEvent.click(browse);
    expect(click).not.toHaveBeenCalled();
  });
});
