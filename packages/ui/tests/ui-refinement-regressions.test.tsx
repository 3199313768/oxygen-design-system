import { createRef } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Checkbox, ColorPicker, ConfigProvider, Table, Transfer, Upload, Result, RadioGroup, RadioGroupItem, Steps } from '../src';

describe('UI refinement semantics', () => {
  it('distinguishes a mixed checkbox from a check and toggles uncontrolled mixed state', () => {
    render(<Checkbox aria-label="Mixed" defaultChecked="indeterminate" />);
    const checkbox = screen.getByRole('checkbox', { name: 'Mixed' });
    expect(checkbox).toHaveAttribute('aria-checked', 'mixed');
    expect(checkbox.querySelector('svg')).toHaveClass('lucide-minus');
    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();
    expect(checkbox.querySelector('svg')).toHaveClass('lucide-check');
  });
  it('links invalid color text to a localized explanation and allows recovery', () => {
    const onChange = vi.fn();
    render(<ConfigProvider locale={{ colorPicker: { invalid: 'Use six hex digits', nativePicker: 'Native picker', cancel: 'Cancel', confirm: 'Apply' } }}><ColorPicker aria-label="Color" defaultOpen onChange={onChange} /></ConfigProvider>);
    const input = screen.getByRole('textbox', { name: 'Color' });
    fireEvent.change(input, { target: { value: 'bad' } });
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription('Use six hex digits');
    expect(screen.getByRole('alert')).toHaveTextContent('Use six hex digits');
    expect(screen.getByRole('button', { name: 'Apply' })).toBeDisabled();
    expect(screen.getByLabelText('Color Native picker')).toHaveAttribute('type', 'color');
    fireEvent.change(input, { target: { value: '#abcdef' } });
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }));
    expect(onChange).toHaveBeenCalledWith('#ABCDEF');
  });
  it('renders configurable upload status labels with progress', () => {
    render(<ConfigProvider locale={{ upload: { pending: 'Queued', uploading: 'Sending', done: 'Complete', error: 'Failed' } }}><Upload fileList={(['pending', 'uploading', 'done', 'error'] as const).map((status) => ({ id: status, name: status + '.txt', file: new File([], status), status, percent: 40 }))} /></ConfigProvider>);
    for (const text of ['Queued', 'Sending 40%', 'Complete', 'Failed']) expect(screen.getByText(text)).toBeInTheDocument();
  });
  it('uses target/source actions and preserves transfer callbacks', () => {
    const onChange = vi.fn();
    render(<Transfer dataSource={[{ value: 'a', label: 'Alpha' }]} onChange={onChange} />);
    fireEvent.click(screen.getByRole('checkbox', { name: 'Alpha' }));
    fireEvent.click(screen.getByRole('button', { name: '移至目标列表' }));
    expect(onChange).toHaveBeenLastCalledWith(['a'], 'right', ['a']);
    fireEvent.click(screen.getByRole('checkbox', { name: 'Alpha' }));
    fireEvent.click(screen.getByRole('button', { name: '移至源列表' }));
    expect(onChange).toHaveBeenLastCalledWith([], 'left', ['a']);
  });
  it('uses the shared checkbox and retains uncontrolled row selection and table ref', () => {
    const onChange = vi.fn(); const ref = createRef<HTMLTableElement>();
    const record = { key: 'a', name: 'Alpha' };
    render(<Table ref={ref} columns={[{ key: 'name', dataIndex: 'name', title: 'Name' }]} dataSource={[record]} rowSelection={{ onChange }} />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox.tagName).toBe('BUTTON');
    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();
    expect(onChange).toHaveBeenLastCalledWith(['a'], [record]);
    fireEvent.click(checkbox);
    expect(onChange).toHaveBeenLastCalledWith([], []);
    expect(ref.current).toBe(screen.getByRole('table'));
  });
  it('keeps controlled table selection authoritative after a selection request', () => {
    const onChange = vi.fn();
    const record = { key: 'a', name: 'Alpha' };
    const columns = [{ key: 'name', dataIndex: 'name' as const, title: 'Name' }];
    const { rerender } = render(<Table columns={columns} dataSource={[record]} rowSelection={{ selectedRowKeys: [], onChange }} />);
    fireEvent.click(screen.getByRole('checkbox'));
    expect(onChange).toHaveBeenLastCalledWith(['a'], [record]);
    expect(screen.getByRole('checkbox')).not.toBeChecked();
    rerender(<Table columns={columns} dataSource={[record]} rowSelection={{ selectedRowKeys: ['a'], onChange }} />);
    expect(screen.getByRole('checkbox')).toBeChecked();
  });
  it('renders semantic result and step SVGs and a radio dot', () => {
    const { container } = render(<><Result status="success" title="Saved" /><Result status="404" title="Missing" /><RadioGroup defaultValue="a"><RadioGroupItem value="a" aria-label="A" /></RadioGroup><Steps items={[{ key: 'a', title: 'Done', status: 'finish' }, { key: 'b', title: 'Error', status: 'error' }]} /></>);
    expect(container.querySelector('[data-status="success"] .oxygen-result__icon svg')).toBeInTheDocument();
    expect(container.querySelector('[data-status="404"] .oxygen-result__icon')).toHaveTextContent('404');
    expect(screen.getByRole('radio').querySelector('.oxygen-radio-group__dot')).toBeInTheDocument();
    expect(container.querySelectorAll('.oxygen-steps__indicator svg')).toHaveLength(2);
  });
});
