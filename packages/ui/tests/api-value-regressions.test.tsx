import { fireEvent, render, screen, within } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { Accordion } from '../src/components/Accordion';
import { Combobox } from '../src/components/Combobox';
import { Pagination } from '../src/components/Pagination';
import type { Option } from '../src/components/shared';
import { Transfer } from '../src/components/Transfer';

const options = [{ value: 'a', label: 'Alpha' }, { value: 'b', label: 'Beta' }];

function CustomLabel() {
  return <span>Custom label</span>;
}

describe('API value regressions', () => {
  it('shows the accepted controlled value after a rejected selection and clear', () => {
    const onChange = vi.fn();
    render(<Combobox value="a" options={options} onChange={onChange} />);
    const input = screen.getByRole('combobox');
    fireEvent.focus(input);
    fireEvent.click(screen.getByRole('option', { name: 'Beta' }));
    expect(onChange).toHaveBeenLastCalledWith('b', options[1]);
    expect(input).toHaveAttribute('aria-expanded', 'false');
    expect(input).toHaveValue('Alpha');
    fireEvent.click(screen.getByRole('button', { name: '清除' }));
    expect(onChange).toHaveBeenLastCalledWith(undefined);
    expect(input).toHaveValue('Alpha');
    fireEvent.blur(input);
    expect(input).toHaveValue('Alpha');
  });

  it('keeps drafts across parent updates and displays newly accepted values on close', () => {
    const { rerender } = render(<Combobox value="a" options={options} />);
    const input = screen.getByRole('combobox');
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'Bet' } });
    rerender(<Combobox value="b" options={options} />);
    expect(input).toHaveValue('Bet');
    expect(screen.getByRole('option', { name: 'Beta' })).toBeInTheDocument();
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(input).toHaveValue('Beta');
  });

  it('accepts uncontrolled selections and controlled parent acceptance including clear', () => {
    function Parent() {
      const [value, setValue] = useState<string | undefined>('a');
      return <Combobox value={value} options={options} onChange={setValue} />;
    }
    const { unmount } = render(<Parent />);
    fireEvent.focus(screen.getByRole('combobox'));
    fireEvent.click(screen.getByRole('option', { name: 'Beta' }));
    expect(screen.getByRole('combobox')).toHaveValue('Beta');
    fireEvent.click(screen.getByRole('button', { name: '清除' }));
    expect(screen.getByRole('combobox')).toHaveValue('');
    unmount();
    render(<Combobox defaultValue="a" options={options} />);
    fireEvent.focus(screen.getByRole('combobox'));
    fireEvent.click(screen.getByRole('option', { name: 'Beta' }));
    expect(screen.getByRole('combobox')).toHaveValue('Beta');
  });

  it('extracts native and fragment labels and supports custom textValue', () => {
    const richOptions: Option[] = [
      { value: 'a', label: <><span>Alpha</span><span aria-hidden>icon</span></> },
      { value: 'b', label: <CustomLabel />, textValue: 'Searchable custom' },
    ];
    render(<Combobox defaultValue="a" options={richOptions} />);
    const input = screen.getByRole('combobox');
    expect(input).toHaveValue('Alpha');
    fireEvent.change(input, { target: { value: 'searchable' } });
    fireEvent.click(screen.getByRole('option'));
    expect(input).toHaveValue('Searchable custom');
  });

  it('clears both textless selections and drafts without a selection', () => {
    const onSearch = vi.fn();
    const onChange = vi.fn();
    const { rerender } = render(<Combobox value="a" options={[{ value: 'a', label: <CustomLabel /> }]} />);
    expect(screen.getByRole('button', { name: '清除' })).toBeInTheDocument();
    rerender(<Combobox value={undefined} options={options} onChange={onChange} onSearch={onSearch} />);
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'draft' } });
    fireEvent.click(screen.getByRole('button', { name: '清除' }));
    expect(screen.getByRole('combobox')).toHaveValue('');
    expect(onChange).toHaveBeenLastCalledWith(undefined);
    expect(screen.getAllByRole('option')).toHaveLength(2);
    expect(screen.queryByRole('button', { name: '清除' })).not.toBeInTheDocument();
  });

  it('restores the parent selection when clearing a draft is rejected', () => {
    const onChange = vi.fn();
    render(<Combobox value="a" options={options} onChange={onChange} />);
    const input = screen.getByRole('combobox');
    fireEvent.change(input, { target: { value: 'Bet' } });
    fireEvent.click(screen.getByRole('button', { name: '清除' }));
    expect(onChange).toHaveBeenLastCalledWith(undefined);
    expect(input).toHaveValue('Alpha');
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(input).toHaveValue('Alpha');
  });

  it.each([false, true])('notifies once when moving clears selection (controlled=%s)', (controlled) => {
    const onSelectChange = vi.fn();
    const onChange = vi.fn();
    const { container } = render(<Transfer
      dataSource={options}
      defaultTargetKeys={['b']}
      {...(controlled ? { targetKeys: ['b'] } : {})}
      onSelectChange={onSelectChange}
      onChange={onChange}
    />);
    fireEvent.click(screen.getByRole('checkbox', { name: 'Alpha' }));
    fireEvent.click(screen.getByRole('checkbox', { name: 'Beta' }));
    onSelectChange.mockClear();
    fireEvent.click(container.querySelectorAll('.oxygen-transfer__actions button')[0]!);
    expect(onSelectChange.mock.calls).toEqual([[[], ['b']]]);
    expect(onChange).toHaveBeenLastCalledWith(['b', 'a'], 'right', ['a']);
    onSelectChange.mockClear();
    fireEvent.click(container.querySelectorAll('.oxygen-transfer__actions button')[1]!);
    expect(onSelectChange.mock.calls).toEqual([[[], []]]);
    expect(onChange).toHaveBeenLastCalledWith(controlled ? [] : ['a'], 'left', ['b']);
  });

  it('searches rich Transfer labels and uses textValue for accessible names', () => {
    render(<Transfer showSearch sourceItems={[
      { value: 'a', label: <><span>Alpha</span><span aria-hidden>icon</span></> },
      { value: 'b', label: <CustomLabel />, textValue: 'Searchable custom' },
    ]} titles={[<span>Available</span>, <>Chosen</>]} />);
    const search = screen.getByRole('searchbox', { name: 'Available搜索' });
    fireEvent.change(search, { target: { value: 'alpha' } });
    expect(screen.getByRole('checkbox', { name: 'Alpha' })).toBeInTheDocument();
    expect(screen.queryByRole('checkbox', { name: 'Searchable custom' })).not.toBeInTheDocument();
    fireEvent.change(search, { target: { value: 'searchable' } });
    expect(screen.getByRole('checkbox', { name: 'Searchable custom' })).toBeInTheDocument();
  });

  it('rejects reserved empty Accordion keys in single mode', () => {
    expect(() => render(<Accordion items={[{ key: '', title: 'Empty', children: 'Body' }]} />))
      .toThrow(/Accordion.*empty.*reserved/i);
  });

  it('supports empty Accordion keys in multiple mode without changing array callbacks', () => {
    const onValueChange = vi.fn();
    render(<Accordion type="multiple" defaultValue={['']} onValueChange={onValueChange}
      items={[{ key: '', title: 'Empty', children: 'Body' }]} />);
    const trigger = screen.getByRole('button', { name: 'Empty' });
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(onValueChange).toHaveBeenLastCalledWith([]);
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(onValueChange).toHaveBeenLastCalledWith(['']);
  });

  it('retains the single closed sentinel and distinct numeric/string keys', () => {
    const onValueChange = vi.fn();
    function Parent() {
      const [value, setValue] = useState<string | number>(0);
      return <Accordion value={value} onValueChange={(next) => {
        onValueChange(next);
        setValue(next as string | number);
      }} items={[
        { key: 0, title: 'Number', children: 'Numeric body' },
        { key: '0', title: 'String', children: 'String body' },
      ]} />;
    }
    render(<Parent />);
    fireEvent.click(screen.getByRole('button', { name: 'Number' }));
    expect(onValueChange).toHaveBeenLastCalledWith('');
    expect(screen.getByRole('button', { name: 'Number' })).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(screen.getByRole('button', { name: 'String' }));
    expect(onValueChange).toHaveBeenLastCalledWith('0');
  });

  it('normalizes fractional pagination values and deduplicates normalized options', () => {
    const onChange = vi.fn();
    render(<Pagination current={2.8} pageSize={10.9} total={95.9} showSizeChanger
      pageSizeOptions={[10.1, 10.9, 20.8, 0.5, 0, -1, NaN, Infinity]} onChange={onChange} />);
    const nav = screen.getByRole('navigation');
    expect(nav).toHaveAttribute('data-page-size', '10');
    expect(nav).toHaveAttribute('data-total', '95');
    expect(nav.querySelector('[aria-current="page"]')).toHaveTextContent('2');
    expect(within(nav).getAllByRole('option').map((option) => option.getAttribute('value'))).toEqual(['10', '20']);
    fireEvent.click(screen.getByRole('button', { name: '下一页' }));
    expect(onChange).toHaveBeenLastCalledWith(3, 10);
    fireEvent.change(screen.getByRole('combobox'), { target: { value: '20' } });
    expect(onChange).toHaveBeenLastCalledWith(1, 20);
  });

  it.each([NaN, Infinity, -Infinity, -1, 0, 0.5])('falls back for invalid positive pagination input %s', (invalid) => {
    render(<Pagination current={invalid} pageSize={invalid} total={invalid} simple />);
    expect(screen.getByRole('navigation')).toHaveAttribute('data-page-size', '10');
    expect(screen.getByRole('navigation')).toHaveAttribute('data-total', '0');
    expect(screen.getByText('1 / 1')).toBeInTheDocument();
  });

  it('caps pagination counts to safe integers and normalizes defaultCurrent', () => {
    const { rerender } = render(<Pagination defaultCurrent={2.9} total={50} simple />);
    expect(screen.getByText('2 / 5')).toBeInTheDocument();
    rerender(<Pagination current={Number.MAX_VALUE} pageSize={1} total={Number.MAX_VALUE} simple />);
    expect(screen.getByRole('navigation')).toHaveAttribute('data-total', String(Number.MAX_SAFE_INTEGER));
    expect(screen.getByText(`${Number.MAX_SAFE_INTEGER} / ${Number.MAX_SAFE_INTEGER}`)).toBeInTheDocument();
  });
});
