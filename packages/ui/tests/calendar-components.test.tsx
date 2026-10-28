import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Calendar, DateRangePicker } from '../src';

const month = new Date(2026, 9, 1);
const start = new Date(2026, 9, 28);
const end = new Date(2026, 9, 30);

describe('calendar components', () => {
  it('updates an uncontrolled selection and preserves a controlled calendar value', () => {
    const onSelect = vi.fn();
    const { rerender } = render(<Calendar defaultSelected={start} month={month} onSelect={onSelect} />);
    fireEvent.click(screen.getByRole('button', { name: /2026年10月30日/ }));
    expect(screen.getByRole('button', { name: /2026年10月30日/ }).closest('td')).toHaveAttribute('aria-selected', 'true');

    rerender(<Calendar month={month} onSelect={onSelect} selected={start} />);
    fireEvent.click(screen.getByRole('button', { name: /2026年10月30日/ }));
    expect(onSelect).toHaveBeenLastCalledWith(end);
    expect(screen.getByRole('button', { name: /2026年10月28日/ }).closest('td')).toHaveAttribute('aria-selected', 'true');
  });

  it('does not select disabled dates', () => {
    const onSelect = vi.fn();
    render(<Calendar disabled={start} month={month} onSelect={onSelect} />);
    const day = screen.getByRole('button', { name: /2026年10月28日/ });
    expect(day).toBeDisabled();
    fireEvent.click(day);
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('moves day focus with the keyboard', () => {
    render(<Calendar defaultSelected={start} month={month} />);
    const day = screen.getByRole('button', { name: /2026年10月28日/ });
    act(() => day.focus());
    fireEvent.keyDown(day, { key: 'ArrowRight' });
    expect(screen.getByRole('button', { name: /2026年10月29日/ })).toHaveFocus();
  });

  it('starts a fresh range after completion and permits same-day endpoints', () => {
    const onChange = vi.fn();
    render(<DateRangePicker month={month} onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: /2026年10月28日/ }));
    fireEvent.click(screen.getByRole('button', { name: /2026年10月30日/ }));
    expect(onChange).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole('button', { name: /2026年10月28日/ }));
    expect(onChange).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole('button', { name: /2026年10月28日/ }));
    expect(onChange).toHaveBeenLastCalledWith([start, start]);
  });

  it('finishes a controlled range without replacing its committed value', () => {
    const onChange = vi.fn();
    render(<DateRangePicker month={month} onChange={onChange} value={[start, end]} />);
    fireEvent.click(screen.getByRole('button', { name: /2026年10月20日/ }));
    expect(onChange).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: /2026年10月22日/ }));
    expect(onChange).toHaveBeenLastCalledWith([new Date(2026, 9, 20), new Date(2026, 9, 22)]);
    expect(screen.getByRole('button', { name: /2026年10月28日/ }).closest('td')).toHaveAttribute('aria-selected', 'true');
  });

  it('resets an unfinished draft when the controlled value changes', () => {
    const onChange = vi.fn();
    const { rerender } = render(<DateRangePicker month={month} onChange={onChange} value={undefined} />);
    fireEvent.click(screen.getByRole('button', { name: /2026年10月20日/ }));
    rerender(<DateRangePicker month={month} onChange={onChange} value={[start, end]} />);
    fireEvent.click(screen.getByRole('button', { name: /2026年10月22日/ }));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('restarts ranges that cross a disabled date', () => {
    const onChange = vi.fn();
    render(<DateRangePicker disabled={new Date(2026, 9, 29)} month={month} onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: /2026年10月28日/ }));
    fireEvent.click(screen.getByRole('button', { name: /2026年10月30日/ }));
    expect(onChange).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: /2026年10月31日/ }));
    expect(onChange).toHaveBeenLastCalledWith([end, new Date(2026, 9, 31)]);
  });
});
