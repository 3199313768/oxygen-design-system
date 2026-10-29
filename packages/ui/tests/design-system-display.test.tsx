import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import {
  Accordion, Field, FieldControl, FieldLabel, Form, Select, SelectTrigger, SelectValue,
  Steps, Timeline, Tree,
} from '../src';

describe('display component accessibility', () => {
  it('presents an empty tree as a named group without selection semantics', () => {
    const { rerender } = render(<Tree aria-label="Resources" multiple treeData={[]} emptyContent="No resources" />);
    expect(screen.queryByRole('tree')).not.toBeInTheDocument();
    const empty = screen.getByRole('group', { name: 'Resources' });
    expect(empty).toHaveTextContent('No resources');
    expect(empty).not.toHaveAttribute('aria-multiselectable');
    expect(screen.queryByRole('treeitem')).not.toBeInTheDocument();
    rerender(<Tree aria-label="Resources" multiple treeData={[{ key: 'one', label: 'Resource' }]} />);
    expect(screen.getByRole('tree', { name: 'Resources' })).toHaveAttribute('aria-multiselectable', 'true');
    expect(screen.getByRole('treeitem', { name: 'Resource' })).toBeInTheDocument();
  });

  it('connects a Field label, description and error to the Select button through its Root', () => {
    render(<Field id="category" invalid description="Choose a category" error="Category is required">
      <FieldLabel>Category</FieldLabel>
      <FieldControl>
        <Select><SelectTrigger><SelectValue placeholder="Choose" /></SelectTrigger></Select>
      </FieldControl>
    </Field>);
    const select = screen.getByRole('combobox', { name: 'Category' });
    expect(select.tagName).toBe('BUTTON');
    expect(select).toHaveAttribute('id', 'category');
    expect(select).toHaveAttribute('aria-invalid', 'true');
    expect(select).toHaveAccessibleDescription('Choose a category Category is required');
  });

  it('connects a Form.Item Select to its generated label and validation help', () => {
    render(<Form><Form.Item required label="Environment" name="environment" validateStatus="error" help="Select an environment">
      <Select><SelectTrigger><SelectValue placeholder="Choose" /></SelectTrigger></Select>
    </Form.Item></Form>);
    const select = screen.getByRole('combobox', { name: 'Environment' });
    expect(select).toHaveAttribute('id', 'environment');
    expect(select).toHaveAttribute('aria-invalid', 'true');
    expect(select).toHaveAttribute('aria-required', 'true');
    expect(select).toHaveAccessibleDescription('Select an environment');
  });

  it('honors an explicit false required state on SelectTrigger inside a required Form.Item', () => {
    render(<Form><Form.Item required label="Environment" name="environment">
      <Select><SelectTrigger aria-required={false}><SelectValue placeholder="Choose" /></SelectTrigger></Select>
    </Form.Item></Form>);
    expect(screen.getByRole('combobox', { name: 'Environment' })).toHaveAttribute('aria-required', 'false');
  });

  it('preserves explicit SelectTrigger accessibility overrides inside Field', () => {
    render(<Field id="generated" invalid description="Automatic help" error="Automatic error">
      <FieldLabel>Generated label</FieldLabel>
      <p id="manual-help">Manual help</p>
      <Select><SelectTrigger id="manual" aria-label="Manual label" aria-invalid={false} aria-describedby="manual-help">
        <SelectValue placeholder="Choose" />
      </SelectTrigger></Select>
    </Field>);
    const select = screen.getByRole('combobox', { name: 'Manual label' });
    expect(select).toHaveAttribute('id', 'manual');
    expect(select).toHaveAttribute('aria-invalid', 'false');
    expect(select).toHaveAccessibleDescription('Manual help');
  });

  it('preserves an accessible list item for empty steps', () => {
    render(<Steps aria-label="Progress" items={[]} emptyText="No steps" />);
    expect(within(screen.getByRole('list', { name: 'Progress' })).getByRole('listitem'))
      .toHaveTextContent('No steps');
  });

  it('preserves an accessible list item and status for a loading timeline', () => {
    render(<Timeline aria-label="History" loading loadingText="Loading records" />);
    const list = screen.getByRole('list', { name: 'History' });
    expect(list).toHaveAttribute('aria-busy', 'true');
    expect(within(within(list).getByRole('listitem')).getByRole('status'))
      .toHaveTextContent('Loading records');
  });

  it('preserves an accessible list item for an empty timeline', () => {
    render(<Timeline aria-label="History" items={[]} emptyText="No records" />);
    expect(within(screen.getByRole('list', { name: 'History' })).getByRole('listitem'))
      .toHaveTextContent('No records');
  });

  it('navigates accordion headers with arrows and skips disabled items', () => {
    const onValueChange = vi.fn();
    render(<Accordion onValueChange={onValueChange} items={[
      { key: 'one', title: 'First', children: 'One' },
      { key: 'two', title: 'Disabled', children: 'Two', disabled: true },
      { key: 'three', title: 'Last', children: 'Three' },
    ]} />);
    const first = screen.getByRole('button', { name: 'First' });
    const last = screen.getByRole('button', { name: 'Last' });
    first.focus();
    fireEvent.keyDown(first, { key: 'ArrowDown' });
    expect(last).toHaveFocus();
    fireEvent.keyDown(last, { key: 'ArrowDown' });
    expect(first).toHaveFocus();
    fireEvent.keyDown(first, { key: 'ArrowUp' });
    expect(last).toHaveFocus();
    expect(onValueChange).not.toHaveBeenCalled();
    expect(first).toHaveAttribute('aria-expanded', 'false');
  });

  it('moves to the first and last enabled header with Home and End', () => {
    render(<Accordion items={[
      { key: 'one', title: 'First', children: 'One' },
      { key: 'two', title: 'Middle', children: 'Two' },
      { key: 'three', title: 'Last', children: 'Three' },
    ]} />);
    const middle = screen.getByRole('button', { name: 'Middle' });
    middle.focus();
    fireEvent.keyDown(middle, { key: 'End' });
    expect(screen.getByRole('button', { name: 'Last' })).toHaveFocus();
    fireEvent.keyDown(screen.getByRole('button', { name: 'Last' }), { key: 'Home' });
    expect(screen.getByRole('button', { name: 'First' })).toHaveFocus();
  });

  it('keeps nested accordion keyboard navigation within its own headers', () => {
    render(<Accordion defaultValue="outer" items={[
      { key: 'outer', title: 'Outer', children: <Accordion items={[
        { key: 'inner', title: 'Inner', children: 'Details' },
      ]} /> },
      { key: 'last', title: 'Outer last', children: 'Other details' },
    ]} />);
    const inner = screen.getByRole('button', { name: 'Inner' });
    inner.focus();
    fireEvent.keyDown(inner, { key: 'ArrowDown' });
    expect(inner).toHaveFocus();
    const outer = screen.getByRole('button', { name: 'Outer' });
    outer.focus();
    fireEvent.keyDown(outer, { key: 'ArrowDown' });
    expect(screen.getByRole('button', { name: 'Outer last' })).toHaveFocus();
  });

  it('does not apply listbox-only multiselection semantics to an accordion', () => {
    const { container } = render(<Accordion type="multiple" items={[
      { key: 'one', title: 'First', children: 'One' },
    ]} />);
    expect(container.firstElementChild).not.toHaveAttribute('aria-multiselectable');
  });
});
