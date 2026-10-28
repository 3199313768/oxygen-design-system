import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { enUS } from 'react-day-picker/locale';

import { Calendar, ConfigProvider, DateRangePicker } from '../src';

const month = new Date(2026, 9, 1);
const start = new Date(2026, 9, 28);
const end = new Date(2026, 9, 30);

describe('reviewed date component contracts', () => {
  it('supports Calendar value/defaultValue/onChange with local calendar dates', () => {
    const onChange = vi.fn();
    render(<Calendar defaultValue={start} month={month} onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: /2026年10月30日/ }));
    const selected: Date = onChange.mock.lastCall![0];
    expect([selected.getFullYear(), selected.getMonth(), selected.getDate(), selected.getHours()]).toEqual([2026, 9, 30, 0]);
    expect(selected).toEqual(new Date(2026, 9, 30));
  });

  it('preserves a controlled Calendar value using the canonical API', () => {
    const onChange = vi.fn();
    render(<Calendar month={month} onChange={onChange} value={start} />);
    fireEvent.click(screen.getByRole('button', { name: /2026年10月30日/ }));
    expect(onChange).toHaveBeenCalledWith(end);
    expect(screen.getByRole('button', { name: /2026年10月28日/ }).closest('td')).toHaveAttribute('aria-selected', 'true');
  });

  it('uses the active DayPicker locale and retains today/selected cues', () => {
    render(<Calendar locale={enUS} month={month} today={start} value={start} />);
    expect(screen.getByRole('button', { name: /Today, Wednesday, October 28th, 2026, selected/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Go to the Next Month' })).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Navigation bar' })).toBeInTheDocument();
  });

  it('inherits ConfigProvider calendar locale and preserves caller label overrides', () => {
    const { rerender } = render(<ConfigProvider locale={{ calendar: { locale: enUS } }}><Calendar month={month} /></ConfigProvider>);
    expect(screen.getByRole('button', { name: 'Go to the Next Month' })).toBeInTheDocument();
    rerender(<ConfigProvider locale={{ calendar: { locale: enUS } }}><Calendar labels={{ labelNext: () => 'Following month' }} month={month} /></ConfigProvider>);
    expect(screen.getByRole('button', { name: 'Following month' })).toBeInTheDocument();
  });

  it('clears committed and incomplete uncontrolled ranges with localized copy', () => {
    const onChange = vi.fn();
    render(<ConfigProvider locale={{ common: { clear: 'Clear range' } }}><DateRangePicker defaultValue={[start, end]} month={month} onChange={onChange} /></ConfigProvider>);
    fireEvent.click(screen.getByRole('button', { name: 'Clear range' }));
    expect(onChange).toHaveBeenLastCalledWith(undefined);
    expect(screen.getByRole('button', { name: /2026年10月28日/ }).closest('td')).not.toHaveAttribute('aria-selected', 'true');
    fireEvent.click(screen.getByRole('button', { name: /2026年10月28日/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Clear range' }));
    fireEvent.click(screen.getByRole('button', { name: /2026年10月30日/ }));
    expect(onChange).toHaveBeenCalledTimes(2);
  });

  it('requests a controlled clear without replacing the parent value', () => {
    const onChange = vi.fn();
    render(<DateRangePicker month={month} onChange={onChange} value={[start, end]} />);
    fireEvent.click(screen.getByRole('button', { name: '清除' }));
    expect(onChange).toHaveBeenCalledWith(undefined);
    expect(screen.getByRole('button', { name: /2026年10月28日/ }).closest('td')).toHaveAttribute('aria-selected', 'true');
  });

  it('selects a preset as local calendar dates and blocks disabled crossings', () => {
    const onChange = vi.fn();
    render(<DateRangePicker disabled={new Date(2026, 9, 29)} month={month} onChange={onChange} presets={[
      { label: '完整工作日', value: [new Date(2026, 9, 26, 15), new Date(2026, 9, 28, 18)] },
      { label: '跨禁用日期', value: [start, end] },
    ]} />);
    fireEvent.click(screen.getByRole('button', { name: '完整工作日' }));
    expect(onChange).toHaveBeenCalledWith([new Date(2026, 9, 26), start]);
    expect(screen.getByRole('button', { name: '跨禁用日期' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: '跨禁用日期' }));
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('blocks preset values outside range bounds and disables all actions when disabled', () => {
    const onChange = vi.fn();
    const presets = [{ label: '三天', value: [start, end] as [Date, Date] }];
    const { rerender } = render(<DateRangePicker max={1} month={month} onChange={onChange} presets={presets} />);
    expect(screen.getByRole('button', { name: '三天' })).toBeDisabled();
    rerender(<DateRangePicker defaultValue={[start, end]} disabled month={month} onChange={onChange} presets={presets} />);
    expect(screen.getByRole('button', { name: '三天' })).toBeDisabled();
    expect(screen.getByRole('button', { name: '清除' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: '清除' }));
    expect(onChange).not.toHaveBeenCalled();
  });
});
