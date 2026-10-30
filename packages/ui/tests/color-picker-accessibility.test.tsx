import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { createRef, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { ColorPicker, ConfigProvider, Field, FieldControl, FieldLabel, Form } from '../src';

describe('ColorPicker value-control accessibility', () => {
  it.each([
    { kind: 'default', label: '颜色', element: <ColorPicker defaultValue="#336699" /> },
    { kind: 'aria-label', label: 'Accent', element: <ColorPicker aria-label="Accent" defaultValue="#336699" /> },
    { kind: 'blank aria-labelledby fallback', label: 'Accent', element: <ColorPicker aria-label="Accent" aria-labelledby="  " defaultValue="#336699" /> },
    { kind: 'aria-labelledby', label: 'Brand accent', element: <><span id="brand-name">Brand</span><span id="accent-name">accent</span><ColorPicker aria-label="Ignored label" aria-labelledby="brand-name accent-name brand-name" defaultValue="#336699" /></> },
    { kind: 'Field native label', label: 'Brand', element: <Field><FieldLabel>Brand</FieldLabel><FieldControl><ColorPicker defaultValue="#336699" /></FieldControl></Field> },
    { kind: 'Form label', label: 'Brand', element: <Form.Item label="Brand" name="brand"><ColorPicker defaultValue="#336699" /></Form.Item> },
  ])('includes the visible committed color alongside the $kind name', ({ element, label }) => {
    render(element);
    const trigger = screen.getByRole('button', { name: `${label} #336699` });
    expect(trigger).toHaveTextContent('#336699');
    expect(trigger.querySelector('span:last-child')).not.toHaveAttribute('aria-hidden');
    const references = trigger.getAttribute('aria-labelledby')!.split(/\s+/);
    expect(new Set(references).size).toBe(references.length);
    for (const id of references) expect(document.getElementById(id)).not.toBeNull();
  });

  it('changes the accessible color only after confirmation while retaining the caller label', () => {
    render(<ColorPicker aria-label="Accent" defaultValue="#336699" />);
    const trigger = screen.getByRole('button', { name: 'Accent #336699' });
    fireEvent.click(trigger);
    fireEvent.change(screen.getByRole('textbox', { name: 'Accent' }), { target: { value: '#abcdef' } });
    expect(trigger).toHaveAccessibleName('Accent #336699');
    fireEvent.click(screen.getByRole('button', { name: '确定' }));
    expect(trigger).toHaveAccessibleName('Accent #ABCDEF');
  });

  it('describes a closed required field and puts value states on its real editor', () => {
    render(<Form.Item help="Use an approved color" label="Brand" name="brand" required validateStatus="error"><ColorPicker /></Form.Item>);
    const trigger = screen.getByRole('button', { name: 'Brand #000000' });
    expect(trigger).not.toHaveAttribute('aria-required');
    expect(trigger).not.toHaveAttribute('aria-invalid');
    expect(trigger).toHaveAttribute('data-invalid', 'true');
    expect(trigger).toHaveAccessibleDescription('Use an approved color 必填');
    fireEvent.click(trigger);
    const editor = screen.getByRole('textbox', { name: 'Brand' });
    expect(editor).toHaveAttribute('aria-required', 'true');
    expect(editor).toHaveAttribute('aria-invalid', 'true');
    expect(editor).toHaveAccessibleDescription('Use an approved color');
  });

  it('merges consumer and Field descriptions once and retains external errors after draft recovery', () => {
    render(<><p id="outside">External hint</p><Field description="Field hint" error="Server rejected color" invalid required><FieldLabel>Brand</FieldLabel><FieldControl><ColorPicker aria-describedby="outside outside" /></FieldControl></Field></>);
    const trigger = screen.getByRole('button', { name: 'Brand #000000' });
    expect(trigger).toHaveAccessibleDescription('External hint Field hint Server rejected color 必填');
    fireEvent.click(trigger);
    const editor = screen.getByRole('textbox', { name: 'Brand' });
    fireEvent.change(editor, { target: { value: 'bad' } });
    expect(editor).toHaveAccessibleDescription('External hint Field hint Server rejected color 请输入有效的六位十六进制颜色，例如 #1677FF');
    fireEvent.change(editor, { target: { value: '#abcdef' } });
    expect(editor).toHaveAttribute('aria-invalid', 'true');
    expect(editor).toHaveAccessibleDescription('External hint Field hint Server rejected color');
    for (const control of [trigger, editor]) {
      const ids = control.getAttribute('aria-describedby')!.split(/\s+/);
      expect(new Set(ids).size).toBe(ids.length);
      for (const id of ids) expect(document.getElementById(id)).not.toBeNull();
    }
    expect(screen.getByLabelText('颜色 颜色选择器')).not.toHaveAttribute('aria-invalid');
  });

  it.each([false, 'false'] as const)('lets explicit %s value states override Field defaults', (state) => {
    render(<Field invalid required><FieldLabel>Override</FieldLabel><FieldControl><ColorPicker aria-invalid={state} aria-required={state} /></FieldControl></Field>);
    const trigger = screen.getByRole('button', { name: 'Override #000000' });
    expect(trigger).not.toHaveAttribute('data-invalid', 'true');
    expect(trigger).not.toHaveAttribute('aria-describedby');
    fireEvent.click(trigger);
    const editor = screen.getByRole('textbox', { name: 'Override' });
    expect(editor).toHaveAttribute('aria-invalid', 'false');
    expect(editor).toHaveAttribute('aria-required', 'false');
    fireEvent.change(editor, { target: { value: 'bad' } });
    expect(editor).toHaveAttribute('aria-invalid', 'true');
  });

  it('localizes persistent closed-state feedback and keeps it outside the transient popover', () => {
    render(<ConfigProvider locale={{ colorPicker: { required: 'Required color', invalidDescription: 'Invalid selection' } }}><ColorPicker aria-label="Color" aria-invalid="true" aria-required="true" /></ConfigProvider>);
    const trigger = screen.getByRole('button', { name: 'Color #000000' });
    expect(trigger).toHaveAccessibleDescription('Required color Invalid selection');
    fireEvent.click(trigger);
    expect(screen.getByRole('textbox', { name: 'Color' })).toHaveAccessibleDescription('Invalid selection');
    fireEvent.click(screen.getByRole('button', { name: '取消' }));
    expect(trigger).toHaveAccessibleDescription('Required color Invalid selection');
  });

  it('keeps the button ref, explicit ID and consumer label when editing', () => {
    const ref = createRef<HTMLButtonElement>();
    render(<><span id="color-name">Accent</span><ColorPicker aria-labelledby="color-name" id="accent-trigger" ref={ref} /></>);
    const trigger = screen.getByRole('button', { name: 'Accent #000000' });
    expect(ref.current).toBe(trigger);
    expect(trigger).toHaveAttribute('id', 'accent-trigger');
    fireEvent.click(trigger);
    expect(screen.getByRole('textbox', { name: 'Accent' })).not.toHaveAttribute('id', 'accent-trigger');
  });

  it('returns focus and discards a draft on Escape and Cancel, and commits only on Confirm', async () => {
    const onChange = vi.fn();
    render(<ColorPicker aria-label="Accent" defaultValue="#112233" onChange={onChange} />);
    const trigger = screen.getByRole('button', { name: 'Accent #112233' });
    act(() => trigger.focus());
    fireEvent.click(trigger);
    fireEvent.change(screen.getByRole('textbox', { name: 'Accent' }), { target: { value: '#abcdef' } });
    fireEvent.keyDown(screen.getByRole('textbox', { name: 'Accent' }), { key: 'Escape' });
    await waitFor(() => expect(trigger).toHaveFocus());
    expect(trigger).toHaveTextContent('#112233');
    fireEvent.click(trigger);
    expect(screen.getByRole('textbox', { name: 'Accent' })).toHaveValue('#112233');
    fireEvent.change(screen.getByRole('textbox', { name: 'Accent' }), { target: { value: '#445566' } });
    fireEvent.click(screen.getByRole('button', { name: '取消' }));
    await waitFor(() => expect(trigger).toHaveFocus());
    expect(onChange).not.toHaveBeenCalled();
    fireEvent.click(trigger);
    fireEvent.change(screen.getByRole('textbox', { name: 'Accent' }), { target: { value: '#aabbcc' } });
    fireEvent.click(screen.getByRole('button', { name: '确定' }));
    await waitFor(() => expect(trigger).toHaveFocus());
    expect(onChange).toHaveBeenCalledExactlyOnceWith('#AABBCC');
    expect(trigger).toHaveTextContent('#AABBCC');
  });

  it('keeps controlled open and value ownership with the parent', () => {
    const onChange = vi.fn();
    const onOpenChange = vi.fn();
    function Example() {
      const [open, setOpen] = useState(false);
      return <ColorPicker aria-label="Controlled" onChange={onChange} onOpenChange={(next) => { onOpenChange(next); setOpen(next); }} open={open} value="#112233" />;
    }
    render(<Example />);
    const trigger = screen.getByRole('button', { name: 'Controlled #112233' });
    fireEvent.click(trigger);
    fireEvent.change(screen.getByRole('textbox', { name: 'Controlled' }), { target: { value: '#abcdef' } });
    fireEvent.click(screen.getByRole('button', { name: '确定' }));
    expect(trigger).toHaveTextContent('#112233');
    expect(onChange).toHaveBeenCalledExactlyOnceWith('#ABCDEF');
    expect(onOpenChange.mock.calls).toEqual([[true], [false]]);
  });

  it.each(['disabled', 'loading'] as const)('keeps %s controls unavailable even with defaultOpen', (state) => {
    render(<ColorPicker aria-label="Unavailable" defaultOpen {...{ [state]: true }} />);
    expect(screen.getByRole('button', { name: 'Unavailable #000000' })).toBeDisabled();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });
});
