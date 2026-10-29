import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { Combobox } from '../src/components/Combobox';
import { InputNumber } from '../src/components/InputNumber';
import { Upload, type UploadRequestHandlers } from '../src/components/Upload';

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => { resolve = done; });
  return { promise, resolve };
}

describe('data-entry regressions', () => {
  it('merges concurrent upload progress and ignores removed request callbacks', async () => {
    const requests = new Map<string, UploadRequestHandlers>();
    const onChange = vi.fn();
    render(<Upload multiple onChange={onChange} customRequest={(file, handlers) => { requests.set(file.name, handlers); }} />);
    fireEvent.change(screen.getByLabelText('上传'), { target: { files: [new File(['a'], 'a.txt'), new File(['b'], 'b.txt')] } });
    await waitFor(() => expect(requests.size).toBe(2));
    act(() => requests.get('b.txt')!.onProgress(50));
    act(() => requests.get('a.txt')!.onProgress(25));
    expect(onChange.mock.lastCall![0]).toEqual(expect.arrayContaining([expect.objectContaining({ name: 'b.txt', percent: 50 })]));
    fireEvent.click(screen.getByRole('button', { name: '移除 a.txt' }));
    await waitFor(() => expect(screen.queryByText('a.txt')).not.toBeInTheDocument());
    act(() => requests.get('a.txt')!.onSuccess('/a'));
    expect(screen.queryByText('a.txt')).not.toBeInTheDocument();
    expect(screen.getByText('b.txt')).toBeInTheDocument();
  });

  it('aborts a custom upload when its file is removed', async () => {
    let signal!: AbortSignal;
    render(<Upload customRequest={(_file, handlers) => { signal = handlers.signal; }} />);
    fireEvent.change(screen.getByLabelText('上传'), { target: { files: [new File(['a'], 'cancel.txt')] } });
    await waitFor(() => expect(signal).toBeInstanceOf(AbortSignal));
    expect(signal.aborted).toBe(false);
    fireEvent.click(screen.getByRole('button', { name: '移除 cancel.txt' }));
    await waitFor(() => expect(signal.aborted).toBe(true));
  });

  it('merges async validation and removal against the latest list', async () => {
    const validation = deferred<boolean>();
    const removal = deferred<boolean>();
    render(<Upload multiple beforeUpload={(file) => file.name === 'slow.txt' ? validation.promise : true} onRemove={() => removal.promise} />);
    const input = screen.getByLabelText('上传');
    fireEvent.change(input, { target: { files: [new File(['s'], 'slow.txt')] } });
    fireEvent.change(input, { target: { files: [new File(['f'], 'fast.txt')] } });
    await screen.findByText('fast.txt');
    await act(async () => validation.resolve(true));
    expect(screen.getByText('fast.txt')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '移除 slow.txt' }));
    fireEvent.change(input, { target: { files: [new File(['n'], 'new.txt')] } });
    await screen.findByText('new.txt');
    await act(async () => removal.resolve(true));
    expect(screen.getByText('new.txt')).toBeInTheDocument();
    expect(screen.queryByText('slow.txt')).not.toBeInTheDocument();
  });

  it('gives same-metadata file selections separate identities', async () => {
    const onChange = vi.fn();
    render(<Upload multiple onChange={onChange} />);
    const first = new File(['a'], 'same.txt', { lastModified: 1 });
    const second = new File(['b'], 'same.txt', { lastModified: 1 });
    fireEvent.change(screen.getByLabelText('上传'), { target: { files: [first, second] } });
    const files = onChange.mock.lastCall![0];
    expect(new Set(files.map((file: { id: string }) => file.id)).size).toBe(2);
    fireEvent.click(screen.getAllByRole('button', { name: '移除 same.txt' })[0]);
    await waitFor(() => expect(screen.getAllByText('same.txt')).toHaveLength(1));
  });

  it('accepts dropped files only on an enabled drag target', async () => {
    const { rerender } = render(<Upload drag />);
    fireEvent.drop(screen.getByRole('button', { name: '浏览' }), { dataTransfer: { files: [new File(['a'], 'drop.txt')] } });
    await screen.findByText('drop.txt');
    rerender(<Upload drag disabled />);
    fireEvent.drop(screen.getByRole('button', { name: '浏览' }), { dataTransfer: { files: [new File(['b'], 'disabled.txt')] } });
    expect(screen.queryByText('disabled.txt')).not.toBeInTheDocument();
  });

  it('preserves decimal and negative drafts, commits bounds, and clears', () => {
    const onChange = vi.fn();
    render(<InputNumber min={-2} max={2} onChange={onChange} />);
    const input = screen.getByRole('spinbutton');
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: '1.' } });
    expect(input).toHaveValue('1.');
    fireEvent.change(input, { target: { value: '1.5' } });
    expect(input).toHaveValue('1.5');
    fireEvent.change(input, { target: { value: '-' } });
    expect(input).toHaveValue('-');
    fireEvent.change(input, { target: { value: '-1.5' } });
    fireEvent.blur(input);
    expect(input).toHaveValue('-1.5');
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: '99' } });
    fireEvent.blur(input);
    expect(input).toHaveValue('2');
    fireEvent.change(input, { target: { value: '' } });
    expect(onChange).toHaveBeenLastCalledWith(undefined);
  });

  it('allows editing a fractional value below a minimum before commit', () => {
    render(<InputNumber min={0.1} />);
    const input = screen.getByRole('spinbutton');
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: '0' } });
    expect(input).toHaveValue('0');
    fireEvent.change(input, { target: { value: '0.5' } });
    fireEvent.blur(input);
    expect(input).toHaveValue('0.5');
  });

  it('renders and parses currency formatting', () => {
    const onChange = vi.fn();
    render(<InputNumber defaultValue={1000} formatter={(value) => value === undefined ? '' : `$${value.toLocaleString('en-US')}`} parser={(raw) => raw.trim() === '' ? undefined : Number(raw.replace(/[$,]/g, ''))} onChange={onChange} />);
    const input = screen.getByRole('spinbutton');
    expect(input).toHaveValue('$1,000');
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: '$2,500' } });
    fireEvent.blur(input);
    expect(input).toHaveValue('$2,500');
    expect(onChange).toHaveBeenLastCalledWith(2500);
  });

  it('normalizes button and keyboard steps using precision', () => {
    const onChange = vi.fn();
    render(<InputNumber defaultValue={0} precision={1} step={0.1} onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: '增加' }));
    fireEvent.click(screen.getByRole('button', { name: '增加' }));
    fireEvent.keyDown(screen.getByRole('spinbutton'), { key: 'ArrowUp' });
    expect(onChange).toHaveBeenLastCalledWith(0.3);
  });

  it('opens with ArrowUp, clears active state on Escape, and reopens all options', () => {
    const onChange = vi.fn();
    const options = [{ label: '北京', value: 1 }, { label: '上海', value: 2 }];
    render(<Combobox options={options} onChange={onChange} />);
    const input = screen.getByRole('combobox');
    fireEvent.keyDown(input, { key: 'ArrowUp' });
    expect(input).toHaveAttribute('aria-expanded', 'true');
    expect(document.getElementById(input.getAttribute('aria-activedescendant')!)).toBeInTheDocument();
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(input).not.toHaveAttribute('aria-activedescendant');
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onChange).toHaveBeenLastCalledWith(1, options[0]);
    fireEvent.focus(input);
    expect(screen.getAllByRole('option')).toHaveLength(2);
  });
  it('invalidates a request when a controlled list removes and reintroduces its file', async () => {
    const onChange = vi.fn();
    let request!: UploadRequestHandlers;
    const customRequest = (_file: File, handlers: UploadRequestHandlers) => { request = handlers; };
    const { rerender } = render(<Upload fileList={[]} onChange={onChange} customRequest={customRequest} />);
    fireEvent.change(screen.getByLabelText('上传'), { target: { files: [new File(['a'], 'controlled.txt')] } });
    await waitFor(() => expect(request).toBeDefined());
    const files = onChange.mock.lastCall![0];
    rerender(<Upload fileList={files} onChange={onChange} customRequest={customRequest} />);
    rerender(<Upload fileList={[]} onChange={onChange} customRequest={customRequest} />);
    rerender(<Upload fileList={files} onChange={onChange} customRequest={customRequest} />);
    onChange.mockClear();
    act(() => request.onSuccess('/late'));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('syncs controlled numeric values without suppressing the next edit', () => {
    const onChange = vi.fn();
    const { rerender } = render(<InputNumber value={1} onChange={onChange} />);
    rerender(<InputNumber value={2} onChange={onChange} />);
    const input = screen.getByRole('spinbutton');
    expect(input).toHaveValue('2');
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: '1' } });
    expect(onChange).toHaveBeenLastCalledWith(1);
    rerender(<InputNumber value={undefined} onChange={onChange} />);
    expect(input).toHaveValue('');
  });

  it('preserves drafts when a controlled parent echoes each numeric edit', () => {
    function ControlledNumber() {
      const [value, setValue] = useState<number | undefined>(1);
      return <InputNumber value={value} onChange={setValue} />;
    }
    render(<ControlledNumber />);
    const input = screen.getByRole('spinbutton');
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: '1.' } });
    expect(input).toHaveValue('1.');
    fireEvent.change(input, { target: { value: '1.5' } });
    expect(input).toHaveValue('1.5');
    fireEvent.blur(input);
    expect(input).toHaveValue('1.5');
  });

});
