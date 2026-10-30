import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { Button } from '../src/components/Button';
import { ColorPicker } from '../src/components/ColorPicker';
import { Field, FieldControl, FieldDescription, FieldError, FieldLabel } from '../src/components/Field';
import { Form } from '../src/components/Form';
import { Input } from '../src/components/Input';
import { Slider } from '../src/components/Slider';
import { Transfer } from '../src/components/Transfer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../src/components/Tabs';

describe('design system control accessibility', () => {
  it('keeps Form.Item labels associated with explicit child IDs', () => {
    render(<Form.Item label="Account" name="account"><Input id="account-input" /></Form.Item>);
    expect(screen.getByRole('textbox', { name: 'Account' })).toHaveAttribute('id', 'account-input');
  });

  it('preserves external descriptions while announcing Field errors', () => {
    render(<><p id="external">External help</p><Field error="Required" invalid><FieldLabel>Account</FieldLabel><FieldControl><Input aria-describedby="external" /></FieldControl></Field></>);
    expect(screen.getByRole('textbox', { name: 'Account' })).toHaveAccessibleDescription('External help Required');
  });

  it('associates a Form.Item ColorPicker trigger with its label and error', () => {
    render(<Form.Item help="Choose a valid color" label="Brand" name="brand" validateStatus="error"><ColorPicker /></Form.Item>);
    const trigger = screen.getByRole('button', { name: 'Brand #000000' });
    expect(trigger).toHaveAccessibleDescription('Choose a valid color');
    expect(trigger).not.toHaveAttribute('aria-invalid');
    fireEvent.click(trigger);
    expect(screen.getByRole('textbox', { name: 'Brand' })).toHaveAttribute('aria-invalid', 'true');
  });

  it('forwards form label and descriptions to the interactive slider thumb', () => {
    render(<><span id="volume-label">Volume</span><p id="volume-help">Adjust volume</p><Slider aria-describedby="volume-help" aria-labelledby="volume-label" defaultValue={20} /></>);
    const slider = screen.getByRole('slider', { name: 'Volume' });
    expect(slider).toHaveAccessibleDescription('Adjust volume');
    fireEvent.keyDown(slider, { key: 'ArrowRight' });
    expect(slider).toHaveAttribute('aria-valuenow', '21');
  });

  it('announces partially selected Transfer lists as mixed', () => {
    render(<Transfer dataSource={[{ value: 'a', label: 'Alpha' }, { value: 'b', label: 'Beta' }]} />);
    fireEvent.click(screen.getByRole('checkbox', { name: 'Alpha' }));
    expect(screen.getByRole('checkbox', { name: '源列表全选' })).toHaveAttribute('aria-checked', 'mixed');
    fireEvent.click(screen.getByRole('checkbox', { name: '源列表全选' }));
    expect(screen.getByRole('checkbox', { name: 'Beta' })).toBeChecked();
  });

  it('blocks disabled slotted button child handlers and removes them from tab order', () => {
    const childClick = vi.fn();
    render(<Button asChild disabled><a href="#destination" onClick={childClick}>Continue</a></Button>);
    const link = screen.getByRole('link', { name: 'Continue' });
    fireEvent.click(link);
    expect(childClick).not.toHaveBeenCalled();
    expect(link).toHaveAttribute('tabindex', '-1');
  });
});

describe('compound control form integration', () => {
  it('announces Form.Item labels and errors on a slider', () => {
    render(<Form.Item help="Set the volume" label="Volume" name="volume" validateStatus="error"><Slider defaultValue={20} /></Form.Item>);
    const thumb = screen.getByRole('slider', { name: 'Volume' });
    expect(thumb).toHaveAccessibleDescription('Set the volume');
    expect(thumb).toHaveAttribute('aria-invalid', 'true');
  });

  it('retains fractional slider minima when snapping decimal steps', () => {
    render(<Slider aria-label="Fraction" defaultValue={0.15} min={0.05} step={0.1} />);
    expect(screen.getByRole('slider', { name: 'Fraction' })).toHaveAttribute('aria-valuenow', '0.15');
  });

  it('retains scientific-notation steps when normalizing slider values', () => {
    render(<Slider aria-label="Precision" defaultValue={0.0000002} step={0.0000001} />);
    expect(screen.getByRole('slider', { name: 'Precision' })).toHaveAttribute('aria-valuenow', '2e-7');
  });

  it('removes an explicit child tabIndex from a loading slotted Button', () => {
    render(<Button asChild loading><a href="#destination" tabIndex={0}>Continue</a></Button>);
    expect(screen.getByRole('link', { name: 'Continue' })).toHaveAttribute('tabindex', '-1');
  });
});

  it('distinguishes labelled range slider thumbs for assistive technology', () => {
    render(<><span id="price-label">Price</span><Slider aria-labelledby="price-label" defaultValue={[10, 20]} range /></>);
    expect(screen.getByRole('slider', { name: 'Price 最小值' })).toHaveAttribute('aria-valuenow', '10');
    expect(screen.getByRole('slider', { name: 'Price 最大值' })).toHaveAttribute('aria-valuenow', '20');
  });


describe('vertical Tabs integration', () => {
  it('preserves consumer classes and ref while exposing the vertical root style hook', () => {
    const ref = createRef<HTMLDivElement>();
    render(<Tabs className="consumer-tabs" defaultValue="first" orientation="vertical" ref={ref}><TabsList aria-label="Sections"><TabsTrigger value="first">First</TabsTrigger></TabsList><TabsContent value="first">First section</TabsContent></Tabs>);
    expect(ref.current).toHaveClass('oxygen-tabs', 'consumer-tabs');
    expect(ref.current).toHaveAttribute('data-orientation', 'vertical');
    expect(screen.getByRole('tablist', { name: 'Sections' })).toHaveAttribute('aria-orientation', 'vertical');
  });

  it('moves focus and selection down to the next enabled vertical tab', async () => {
    const onValueChange = vi.fn();
    render(<Tabs defaultValue="first" onValueChange={onValueChange} orientation="vertical"><TabsList aria-label="Sections"><TabsTrigger value="first">First</TabsTrigger><TabsTrigger disabled value="disabled">Unavailable</TabsTrigger><TabsTrigger value="last">Last</TabsTrigger></TabsList><TabsContent value="first">First section</TabsContent><TabsContent value="last">Last section</TabsContent></Tabs>);
    const first = screen.getByRole('tab', { name: 'First' });
    act(() => first.focus());
    fireEvent.keyDown(first, { key: 'ArrowDown' });
    await waitFor(() => expect(screen.getByRole('tab', { name: 'Last' })).toHaveFocus());
    expect(screen.getByRole('tab', { name: 'Last' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Last section');
    expect(onValueChange).toHaveBeenCalledWith('last');
  });
});

describe('slotted button activation guards', () => {
  it.each(['disabled', 'loading'] as const)('suppresses child capture and bubble handlers while %s', (state) => {
    const capture = vi.fn();
    const click = vi.fn();
    const keyCapture = vi.fn();
    const keyDown = vi.fn();
    const keyUp = vi.fn();
    const keyUpCapture = vi.fn();
    render(<Button asChild {...{ [state]: true }}><a href="#target" onClick={click} onClickCapture={capture} onKeyDown={keyDown} onKeyDownCapture={keyCapture} onKeyUp={keyUp} onKeyUpCapture={keyUpCapture}>Go</a></Button>);
    const link = screen.getByRole('link', { name: 'Go' });
    fireEvent.click(link);
    expect(fireEvent.keyDown(link, { key: 'Enter' })).toBe(false);
    expect(fireEvent.keyDown(link, { key: ' ' })).toBe(false);
    expect(fireEvent.keyUp(link, { key: ' ' })).toBe(false);
    expect(fireEvent.keyDown(link, { key: 'Tab' })).toBe(true);
    expect(capture).not.toHaveBeenCalled();
    expect(click).not.toHaveBeenCalled();
    expect(keyCapture).not.toHaveBeenCalled();
    expect(keyDown).not.toHaveBeenCalled();
    expect(keyUp).not.toHaveBeenCalled();
    expect(keyUpCapture).not.toHaveBeenCalled();
  });

  it('preserves the enabled child and parent event chain', () => {
    const events: string[] = [];
    render(<Button asChild onClick={() => events.push('parent click')} onClickCapture={() => events.push('parent capture')} onKeyDown={() => events.push('parent key')}><a href="#target" onClick={() => events.push('child click')} onClickCapture={() => events.push('child capture')} onKeyDown={() => events.push('child key')}>Go</a></Button>);
    const link = screen.getByRole('link', { name: 'Go' });
    fireEvent.keyDown(link, { key: 'Enter' });
    fireEvent.click(link);
    expect(events).toEqual(['child key', 'parent key', 'child capture', 'parent capture', 'child click', 'parent click']);
  });
});

describe('slider numeric keyboard interaction', () => {
  it('moves by one decimal step from a fractional minimum and respects Home/End', () => {
    const onChange = vi.fn();
    const onValueCommit = vi.fn();
    render(<Slider aria-label="Offset" defaultValue={0.15} min={0.05} max={0.55} step={0.1} onChange={onChange} onValueCommit={onValueCommit} />);
    const thumb = screen.getByRole('slider', { name: 'Offset' });
    fireEvent.keyDown(thumb, { key: 'ArrowRight' });
    expect(thumb).toHaveAttribute('aria-valuenow', '0.25');
    expect(onChange).toHaveBeenLastCalledWith(0.25);
    expect(onValueCommit).toHaveBeenLastCalledWith([0.25]);
    fireEvent.keyDown(thumb, { key: 'ArrowLeft' });
    expect(thumb).toHaveAttribute('aria-valuenow', '0.15');
    fireEvent.keyDown(thumb, { key: 'End' });
    expect(thumb).toHaveAttribute('aria-valuenow', '0.55');
    fireEvent.keyDown(thumb, { key: 'ArrowRight' });
    expect(thumb).toHaveAttribute('aria-valuenow', '0.55');
    fireEvent.keyDown(thumb, { key: 'Home' });
    expect(thumb).toHaveAttribute('aria-valuenow', '0.05');
    fireEvent.keyDown(thumb, { key: 'ArrowLeft' });
    expect(thumb).toHaveAttribute('aria-valuenow', '0.05');
    expect(thumb).toHaveAttribute('aria-valuemin', '0.05');
    expect(thumb).toHaveAttribute('aria-valuemax', '0.55');
  });

  it('moves scientific-notation steps by keyboard without losing precision', () => {
    const onChange = vi.fn();
    render(<Slider aria-label="Tiny" defaultValue={0.00000025} min={0.00000005} max={0.00000055} step={0.0000001} onChange={onChange} />);
    const thumb = screen.getByRole('slider', { name: 'Tiny' });
    fireEvent.keyDown(thumb, { key: 'ArrowRight' });
    expect(thumb).toHaveAttribute('aria-valuenow', '3.5e-7');
    expect(onChange).toHaveBeenLastCalledWith(0.00000035);
    fireEvent.keyDown(thumb, { key: 'ArrowLeft' });
    expect(thumb).toHaveAttribute('aria-valuenow', '2.5e-7');
    fireEvent.keyDown(thumb, { key: 'Home' });
    expect(thumb).toHaveAttribute('aria-valuenow', '5e-8');
    fireEvent.keyDown(thumb, { key: 'End' });
    expect(thumb).toHaveAttribute('aria-valuenow', '5.5e-7');
  });

  it('exposes actual values in range ARIA, callbacks and named form data', () => {
    const onChange = vi.fn();
    render(<form aria-label="Price form"><Slider aria-label="Price" defaultValue={[0.15, 0.45]} min={0.05} max={0.55} name="price" step={0.1} onChange={onChange} /></form>);
    const low = screen.getByRole('slider', { name: 'Price 最小值' });
    act(() => low.focus());
    fireEvent.keyDown(low, { key: 'ArrowRight' });
    expect(low).toHaveAttribute('aria-valuenow', '0.25');
    expect(low).toHaveAttribute('aria-valuemin', '0.05');
    expect(low).toHaveAttribute('aria-valuemax', '0.55');
    expect(onChange).toHaveBeenLastCalledWith([0.25, 0.45]);
    expect(new FormData(screen.getByRole('form', { name: 'Price form' }) as HTMLFormElement).getAll('price[]')).toEqual(['0.25', '0.45']);
  });
});

it('translates a fractional slider track pointer position into actual units', () => {
  const onChange = vi.fn();
  render(<Slider aria-label="Pointer offset" defaultValue={0.15} min={0.05} max={0.55} step={0.1} onChange={onChange} />);
  const thumb = screen.getByRole('slider', { name: 'Pointer offset' });
  const root = thumb.closest('.oxygen-slider') as HTMLElement;
  vi.spyOn(root, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 0, 500, 20));
  fireEvent(root, new MouseEvent('pointerdown', { bubbles: true, clientX: 200, clientY: 10 }));
  expect(thumb).toHaveAttribute('aria-valuenow', '0.25');
  expect(onChange).toHaveBeenLastCalledWith(0.25);
});


describe('declarative Field descriptions', () => {
  it('associates directly declared help and error with an invalid control', () => {
    render(<Field invalid><FieldLabel>Email</FieldLabel><FieldControl><Input /></FieldControl><FieldDescription>Use your work address</FieldDescription><FieldError>Address is required</FieldError></Field>);
    const input = screen.getByRole('textbox', { name: 'Email' });
    expect(input).toHaveAccessibleDescription('Use your work address Address is required');
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('recognizes descriptions and custom IDs inside nested Fragments', () => {
    render(<Field invalid><FieldLabel>Email</FieldLabel><FieldControl><Input /></FieldControl><><FieldDescription id="custom-help">Work address</FieldDescription><><FieldError id="custom-error">Required</FieldError></></></Field>);
    expect(screen.getByRole('textbox', { name: 'Email' })).toHaveAttribute('aria-describedby', 'custom-help custom-error');
    expect(screen.getByRole('textbox', { name: 'Email' })).toHaveAccessibleDescription('Work address Required');
  });

  it('does not reference absent, empty or conditionally removed descriptions', () => {
    const showDescription = false;
    const { rerender } = render(<Field><FieldLabel>Email</FieldLabel><FieldControl><Input /></FieldControl>{showDescription && <FieldDescription>Hidden</FieldDescription>}<FieldDescription>{[]}</FieldDescription><FieldError><></></FieldError></Field>);
    expect(screen.getByRole('textbox', { name: 'Email' })).not.toHaveAttribute('aria-describedby');
    expect(document.querySelector('.oxygen-field-description')).toBeNull();
    expect(document.querySelector('.oxygen-field-error')).toBeNull();
    rerender(<Field><FieldLabel>Email</FieldLabel><FieldControl><Input /></FieldControl><FieldDescription>Now visible</FieldDescription></Field>);
    expect(screen.getByRole('textbox', { name: 'Email' })).toHaveAccessibleDescription('Now visible');
    rerender(<Field><FieldLabel>Email</FieldLabel><FieldControl><Input /></FieldControl>{null}</Field>);
    expect(screen.getByRole('textbox', { name: 'Email' })).not.toHaveAttribute('aria-describedby');
  });

  it('preserves explicit FieldControl aria-describedby priority', () => {
    render(<><p id="manual-description">Manual guidance</p><Field invalid><FieldLabel>Email</FieldLabel><FieldControl aria-describedby="manual-description"><Input /></FieldControl><FieldDescription>Automatic guidance</FieldDescription><FieldError>Automatic error</FieldError></Field></>);
    expect(screen.getByRole('textbox', { name: 'Email' })).toHaveAttribute('aria-describedby', 'manual-description');
    expect(screen.getByRole('textbox', { name: 'Email' })).toHaveAccessibleDescription('Manual guidance');
  });
});


it('keeps hidden and nested-field descriptions out of the outer control references', () => {
  render(<Field><FieldLabel>Outer</FieldLabel><FieldControl><Input /></FieldControl><FieldDescription hidden>Hidden outer help</FieldDescription><Field><FieldLabel>Inner</FieldLabel><FieldControl><Input /></FieldControl><FieldDescription>Inner guidance</FieldDescription></Field></Field>);
  expect(screen.getByRole('textbox', { name: 'Outer' })).not.toHaveAttribute('aria-describedby');
  expect(screen.getByRole('textbox', { name: 'Inner' })).toHaveAccessibleDescription('Inner guidance');
});

describe('Field message ID ownership', () => {
  it.each(['description', 'error'] as const)('does not let hidden %s claim the visible message ID', (kind) => {
    const Message = kind === 'description' ? FieldDescription : FieldError;
    render(<Field invalid><FieldLabel>Email</FieldLabel><FieldControl><Input /></FieldControl><Message hidden>Hidden guidance</Message><Message>Visible guidance</Message></Field>);
    const input = screen.getByRole('textbox', { name: 'Email' });
    expect(input).toHaveAccessibleDescription('Visible guidance');
    const referenced = document.getElementById(input.getAttribute('aria-describedby')!);
    expect(referenced).toHaveTextContent('Visible guidance');
    expect(referenced).not.toHaveAttribute('hidden');
    const hidden = screen.getByText('Hidden guidance');
    expect(hidden.id).not.toBe(referenced!.id);
  });

  it.each(['description', 'error'] as const)('keeps the %s prop primary when a declaration also exists', (kind) => {
    const Message = kind === 'description' ? FieldDescription : FieldError;
    render(<Field {...{ [kind]: 'Primary guidance' }} invalid><FieldLabel>Email</FieldLabel><FieldControl><Input /></FieldControl><Message>Supplemental guidance</Message></Field>);
    const input = screen.getByRole('textbox', { name: 'Email' });
    expect(input).toHaveAccessibleDescription('Primary guidance');
    const primary = document.getElementById(input.getAttribute('aria-describedby')!);
    expect(primary).toHaveTextContent('Primary guidance');
    expect(screen.getByText('Supplemental guidance').id).not.toBe(primary!.id);
  });
});
