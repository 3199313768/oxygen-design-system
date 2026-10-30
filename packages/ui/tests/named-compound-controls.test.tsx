import { fireEvent, render, screen, within } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Root, type RootProps } from 'react-day-picker';

import { Calendar, DateRangePicker, Slider, Transfer } from '../src';

describe('named compound control containers', () => {
  it('names a noninteractive Slider group while retaining distinct range thumb names and the root ref', () => {
    const ref = createRef<HTMLSpanElement>();
    const onChange = vi.fn();
    render(<Slider aria-label="Budget" defaultValue={[20, 50]} onChange={onChange} ref={ref} />);
    const group = screen.getByRole('group', { name: 'Budget' });
    expect(ref.current).toBe(group);
    expect(group).not.toHaveAttribute('tabindex');
    const minimum = within(group).getByRole('slider', { name: 'Budget 最小值' });
    expect(within(group).getByRole('slider', { name: 'Budget 最大值' })).toHaveAttribute('aria-valuenow', '50');
    fireEvent.keyDown(minimum, { key: 'ArrowRight' });
    expect(onChange).toHaveBeenCalledWith([21, 50]);
  });

  it('uses external Slider labels on the group and thumbs and preserves an explicit consumer role', () => {
    const { rerender } = render(<><span id="volume">Volume</span><Slider aria-labelledby="volume" defaultValue={20} /></>);
    expect(screen.getByRole('group', { name: 'Volume' })).toContainElement(screen.getByRole('slider', { name: 'Volume' }));
    rerender(<><span id="volume">Volume</span><Slider aria-labelledby="volume" defaultValue={20} role="region" /></>);
    expect(screen.getByRole('region', { name: 'Volume' })).toContainElement(screen.getByRole('slider', { name: 'Volume' }));
  });

  it('groups Transfer controls under its accessible name without changing list names or moving behavior', () => {
    const onChange = vi.fn();
    render(<Transfer aria-label="Assignments" onChange={onChange} sourceItems={[{ label: 'Design', value: 'design' }]} />);
    const root = screen.getByRole('group', { name: 'Assignments' });
    expect(root).not.toHaveAttribute('tabindex');
    expect(within(root).getByRole('group', { name: 'Assignments-源列表' })).toBeInTheDocument();
    fireEvent.click(within(root).getByRole('checkbox', { name: 'Design' }));
    fireEvent.click(within(root).getByRole('button', { name: '移至目标列表' }));
    expect(onChange).toHaveBeenCalledWith(['design'], 'right', ['design']);
  });

  it('honors Transfer external naming and consumer roles', () => {
    const { rerender } = render(<><span id="teams">Teams</span><Transfer aria-labelledby="teams" sourceItems={[]} /></>);
    expect(screen.getByRole('group', { name: 'Teams' })).toHaveClass('oxygen-transfer');
    rerender(<><span id="teams">Teams</span><Transfer aria-labelledby="teams" role="region" sourceItems={[]} /></>);
    expect(screen.getByRole('region', { name: 'Teams' })).toHaveClass('oxygen-transfer');
  });

  it.each([{ name: 'Calendar', Component: Calendar }, { name: 'DateRangePicker', Component: DateRangePicker }])('gives the named $name container group semantics and preserves day selection', ({ Component }) => {
    const onChange = vi.fn();
    render(<Component aria-label="Schedule" month={new Date(2026, 9, 1)} onChange={onChange} />);
    const group = screen.getByRole('group', { name: 'Schedule' });
    expect(group).toHaveClass('oxygen-calendar');
    expect(group).not.toHaveAttribute('tabindex');
    fireEvent.click(within(group).getByRole('button', { name: /2026年10月28日/ }));
    fireEvent.click(within(group).getByRole('button', { name: /2026年10月30日/ }));
    expect(onChange).toHaveBeenCalled();
  });

  it('uses labelledby on calendar groups and preserves explicit roles and custom Root components', () => {
    const { rerender } = render(<><span id="calendar-name">Delivery date</span><Calendar aria-labelledby="calendar-name" /></>);
    expect(screen.getByRole('group', { name: 'Delivery date' })).toHaveClass('oxygen-calendar');
    rerender(<Calendar aria-label="Delivery date" role="dialog" />);
    expect(screen.getByRole('dialog', { name: 'Delivery date' })).toHaveClass('oxygen-calendar');
    function CustomRoot(props: RootProps) { return <Root {...props} data-testid="custom-calendar" />; }
    rerender(<Calendar aria-label="Custom calendar" components={{ Root: CustomRoot }} role="application" />);
    expect(screen.getByRole('application', { name: 'Custom calendar' })).toHaveAttribute('data-testid', 'custom-calendar');
  });
});
