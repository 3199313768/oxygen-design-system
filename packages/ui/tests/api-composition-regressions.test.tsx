import { createRef } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import {
  AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle,
  Checkbox, ConfigProvider, Dialog, DialogContent, DialogDescription, DialogTitle,
  DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuRadioGroup,
  DropdownMenuRadioItem, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger,
  NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuList, NavigationMenuTrigger, NavigationMenuViewport,
  Popover, PopoverContent, RadioGroup, RadioGroupItem,
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
  Sheet, SheetContent, SheetDescription, SheetTitle, Slider, Switch,
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from '../src';

describe('public asChild composition', () => {
  it.each([
    ['Dialog', Dialog, DialogContent, DialogTitle, DialogDescription],
    ['Sheet', Sheet, SheetContent, SheetTitle, SheetDescription],
    ['AlertDialog', AlertDialog, AlertDialogContent, AlertDialogTitle, AlertDialogDescription],
  ] as const)('%s retains the custom content root, refs, events and generated close control', async (name, Root, Content, Title, Description) => {
    const ref = createRef<HTMLDivElement>();
    const childRef = createRef<HTMLDivElement>();
    const onClick = vi.fn();
    render(<Root defaultOpen><Content asChild ref={ref}>
      <div data-testid="custom-content" onClick={onClick} onKeyDown={vi.fn()} ref={childRef} role={name === 'AlertDialog' ? 'alertdialog' : 'dialog'}>
        <Title>Title</Title><Description>Description</Description>
        {name === 'AlertDialog' ? <AlertDialogCancel>Cancel</AlertDialogCancel> : null}
      </div>
    </Content></Root>);
    const content = screen.getByTestId('custom-content');
    expect(ref.current).toBe(content);
    expect(childRef.current).toBe(content);
    fireEvent.click(content);
    expect(onClick).toHaveBeenCalledOnce();
    fireEvent.click(screen.getByRole('button'));
    await waitFor(() => expect(content).not.toBeInTheDocument());
  });

  it.each([['Checkbox', Checkbox, 'checkbox'], ['Switch', Switch, 'switch']] as const)(
    '%s slots the custom button and preserves refs, events and internal parts', (name, Control, role) => {
      const ref = createRef<HTMLButtonElement>();
      const childRef = createRef<HTMLButtonElement>();
      const onClick = vi.fn();
      const onCheckedChange = vi.fn();
      render(<Control asChild ref={ref} onCheckedChange={onCheckedChange}>
        <button ref={childRef} onClick={onClick}>Custom control</button>
      </Control>);
      const button = screen.getByRole(role, { name: 'Custom control' });
      expect(button.tagName).toBe('BUTTON');
      expect(ref.current).toBe(button);
      expect(childRef.current).toBe(button);
      button.focus();
      fireEvent.click(button);
      expect(button).toBeChecked();
      expect(onCheckedChange).toHaveBeenLastCalledWith(true);
      expect(onClick).toHaveBeenCalledOnce();
      expect(button.querySelector(name === 'Checkbox' ? '.oxygen-checkbox__indicator' : '.oxygen-switch__thumb')).not.toBeNull();
    },
  );

  it('RadioGroupItem retains a custom button, indicator and selection', () => {
    const ref = createRef<HTMLButtonElement>();
    render(<RadioGroup aria-label="Choice"><RadioGroupItem asChild value="one" ref={ref}>
      <button>One</button>
    </RadioGroupItem></RadioGroup>);
    const item = screen.getByRole('radio', { name: 'One' });
    expect(ref.current).toBe(item);
    item.focus();
    fireEvent.click(item);
    expect(item).toBeChecked();
    expect(item.querySelector('.oxygen-radio-group__indicator')).not.toBeNull();
  });

  it.each([['Checkbox', Checkbox, 'checkbox'], ['Switch', Switch, 'switch']] as const)(
    '%s respects a custom child preventing its default click action', (_name, Control, role) => {
      const onClick = vi.fn();
      const onKeyDown = vi.fn();
      const onCheckedChange = vi.fn();
      render(<Control asChild onClick={onClick} onCheckedChange={onCheckedChange}>
        <button onClick={(event) => event.preventDefault()} onKeyDown={onKeyDown}>Cancel toggle</button>
      </Control>);
      const button = screen.getByRole(role);
      fireEvent.keyDown(button, { key: ' ' });
      expect(onKeyDown).toHaveBeenCalledOnce();
      fireEvent.click(button);
      expect(button).not.toBeChecked();
      expect(onClick).toHaveBeenCalledOnce();
      expect(onCheckedChange).not.toHaveBeenCalled();
    },
  );

  it.each([false, true])('Slider retains custom root, track and keyboard-operable thumbs (range=%s)', async (range) => {
    const ref = createRef<HTMLSpanElement>();
    const childRef = createRef<HTMLSpanElement>();
    const onKeyDown = vi.fn();
    const onFocus = vi.fn();
    const onChange = vi.fn();
    render(<Slider asChild range={range} defaultValue={range ? [20, 80] : 20} aria-label="Volume" name="volume" ref={ref} onChange={onChange} onKeyDown={onKeyDown}>
      <span data-testid="slider-root" ref={childRef} onFocus={onFocus}><span>Custom root content</span></span>
    </Slider>);
    const root = screen.getByTestId('slider-root');
    expect(ref.current).toBe(root);
    expect(childRef.current).toBe(root);
    expect(root.querySelector('.oxygen-slider__track')).not.toBeNull();
    expect(root.querySelector('.oxygen-slider__range')).not.toBeNull();
    const thumbs = screen.getAllByRole('slider');
    expect(thumbs).toHaveLength(range ? 2 : 1);
    thumbs[0].focus();
    fireEvent.keyDown(thumbs[0], { key: 'ArrowRight' });
    expect(thumbs[0]).toHaveAttribute('aria-valuenow', '21');
    expect(onChange).toHaveBeenLastCalledWith(range ? [21, 80] : 21);
    expect(onKeyDown).toHaveBeenCalledOnce();
    expect(onFocus).toHaveBeenCalledOnce();
    expect(root.querySelector('input')).toHaveValue('21');
  });

  it('Select trigger, content and item retain custom roots, generated parts and selection', async () => {
    const triggerRef = createRef<HTMLButtonElement>();
    const contentRef = createRef<HTMLDivElement>();
    const itemRef = createRef<HTMLDivElement>();
    const onClick = vi.fn();
    const onValueChange = vi.fn();
    render(<Select defaultValue="one" onValueChange={onValueChange}>
      <SelectTrigger asChild ref={triggerRef}><button data-testid="select-trigger"><SelectValue /></button></SelectTrigger>
      <SelectContent asChild ref={contentRef}><div data-testid="select-content">
        <SelectItem asChild value="one" ref={itemRef}><div data-testid="select-item">One</div></SelectItem>
        <SelectItem asChild value="two"><div onClick={onClick} onKeyDown={vi.fn()} role="option" aria-selected={false} tabIndex={-1}>Two</div></SelectItem>
      </div></SelectContent>
    </Select>);
    const trigger = screen.getByTestId('select-trigger');
    expect(triggerRef.current).toBe(trigger);
    expect(trigger.querySelector('svg')).not.toBeNull();
    trigger.focus();
    fireEvent.keyDown(trigger, { key: 'ArrowDown' });
    const content = await screen.findByTestId('select-content');
    expect(contentRef.current).toBe(content);
    expect(content.querySelector('.oxygen-select__viewport')).not.toBeNull();
    const item = screen.getByTestId('select-item');
    expect(itemRef.current).toBe(item);
    expect(item.querySelector('.oxygen-select__item-indicator')).not.toBeNull();
    fireEvent.click(screen.getByRole('option', { name: 'Two' }));
    expect(onClick).toHaveBeenCalledOnce();
    expect(onValueChange).toHaveBeenCalledWith('two');
    expect(trigger).toHaveTextContent('Two');
  });

  it('NavigationMenu trigger and content preserve custom roots, refs and keyboard opening', () => {
    const triggerRef = createRef<HTMLButtonElement>();
    const contentRef = createRef<HTMLDivElement>();
    const onKeyDown = vi.fn();
    render(<NavigationMenu><NavigationMenuList><NavigationMenuItem>
      <NavigationMenuTrigger asChild ref={triggerRef}><button onKeyDown={onKeyDown}>Products</button></NavigationMenuTrigger>
      <NavigationMenuContent asChild ref={contentRef}><div data-testid="navigation-content"><a href="#docs">Docs</a></div></NavigationMenuContent>
    </NavigationMenuItem></NavigationMenuList></NavigationMenu>);
    const trigger = screen.getByRole('button', { name: 'Products' });
    expect(triggerRef.current).toBe(trigger);
    expect(trigger.querySelector('.oxygen-navigation-menu__chevron')).not.toBeNull();
    fireEvent.keyDown(trigger, { key: 'ArrowDown' });
    expect(onKeyDown).toHaveBeenCalledOnce();
    expect(contentRef.current).toBe(screen.getByTestId('navigation-content'));
    expect(screen.getByRole('link', { name: 'Docs' })).toBeVisible();
  });

  it('DropdownMenu choice items retain custom roots, indicators, refs and selection', async () => {
    const checkboxRef = createRef<HTMLDivElement>();
    const radioRef = createRef<HTMLDivElement>();
    const onCheckedChange = vi.fn();
    const onValueChange = vi.fn();
    const onClick = vi.fn();
    render(<DropdownMenu defaultOpen><DropdownMenuTrigger>Menu</DropdownMenuTrigger><DropdownMenuContent>
      <DropdownMenuCheckboxItem asChild checked ref={checkboxRef} onCheckedChange={onCheckedChange} onSelect={(event) => event.preventDefault()}>
        <div onClick={onClick} onKeyDown={vi.fn()} role="menuitemcheckbox" aria-checked tabIndex={-1}>Checked</div>
      </DropdownMenuCheckboxItem>
      <DropdownMenuRadioGroup value="one" onValueChange={onValueChange}>
        <DropdownMenuRadioItem asChild value="one" ref={radioRef}><div>One</div></DropdownMenuRadioItem>
        <DropdownMenuRadioItem asChild value="two"><div>Two</div></DropdownMenuRadioItem>
      </DropdownMenuRadioGroup>
    </DropdownMenuContent></DropdownMenu>);
    const checkbox = screen.getByRole('menuitemcheckbox', { name: 'Checked' });
    expect(checkboxRef.current).toBe(checkbox);
    expect(checkbox.querySelector('svg')).not.toBeNull();
    const radio = screen.getByRole('menuitemradio', { name: 'One' });
    expect(radioRef.current).toBe(radio);
    expect(radio.querySelector('svg')).not.toBeNull();
    fireEvent.click(checkbox);
    expect(onClick).toHaveBeenCalledOnce();
    expect(onCheckedChange).toHaveBeenCalledWith(false);
    fireEvent.click(screen.getByRole('menuitemradio', { name: 'Two' }));
    expect(onValueChange).toHaveBeenCalledWith('two');
  });

  it('NavigationMenu custom content retains its origin theme in a shared viewport', () => {
    const ref = createRef<HTMLDivElement>();
    render(<ConfigProvider theme="light"><NavigationMenu defaultValue="resources">
      <NavigationMenuList><ConfigProvider theme="dark"><NavigationMenuItem value="resources">
        <NavigationMenuTrigger>Resources</NavigationMenuTrigger>
        <NavigationMenuContent asChild ref={ref}><div data-testid="themed-content">
          <Popover defaultOpen><PopoverContent>Nested overlay</PopoverContent></Popover>
        </div></NavigationMenuContent>
      </NavigationMenuItem></ConfigProvider></NavigationMenuList>
      <NavigationMenuViewport />
    </NavigationMenu></ConfigProvider>);
    const content = screen.getByTestId('themed-content');
    expect(ref.current).toBe(content);
    expect(content.closest('.oxygen-navigation-menu__viewport')).not.toBeNull();
    expect(content).toHaveAttribute('data-oxygen-theme', 'dark');
    expect(screen.getByText('Nested overlay')).toHaveAttribute('data-oxygen-theme', 'dark');
  });

  it('DropdownMenu subtrigger preserves custom root, chevron, ref and keyboard opening', async () => {
    const ref = createRef<HTMLDivElement>();
    render(<DropdownMenu defaultOpen><DropdownMenuTrigger>Menu</DropdownMenuTrigger><DropdownMenuContent>
      <DropdownMenuSub><DropdownMenuSubTrigger asChild ref={ref}><div>More</div></DropdownMenuSubTrigger>
        <DropdownMenuSubContent>Submenu</DropdownMenuSubContent>
      </DropdownMenuSub>
    </DropdownMenuContent></DropdownMenu>);
    const trigger = screen.getByRole('menuitem', { name: 'More' });
    expect(ref.current).toBe(trigger);
    expect(trigger.querySelector('.oxygen-menu__chevron')).not.toBeNull();
    trigger.focus();
    fireEvent.keyDown(trigger, { key: 'ArrowRight' });
    expect(await screen.findByText('Submenu')).toBeVisible();
  });
});

describe('Content forceMount reaches internal portals', () => {
  it.each([
    ['Dialog', Dialog, DialogContent, DialogTitle, DialogDescription],
    ['Sheet', Sheet, SheetContent, SheetTitle, SheetDescription],
    ['AlertDialog', AlertDialog, AlertDialogContent, AlertDialogTitle, AlertDialogDescription],
  ] as const)('%s keeps closed content and overlay mounted and preserves their identity', (name, Root, Content, Title, Description) => {
    const content = (open: boolean) => <Root open={open}><Content forceMount data-testid="mounted">
      <Title>{name}</Title><Description>Description</Description>
      {name === 'AlertDialog' ? <AlertDialogCancel>Cancel</AlertDialogCancel> : null}
    </Content></Root>;
    const { rerender } = render(content(false));
    const node = screen.getByTestId('mounted');
    const overlay = document.querySelector('.oxygen-overlay');
    expect(node).toHaveAttribute('data-state', 'closed');
    expect(node).not.toHaveAttribute('hidden');
    expect(overlay).toHaveAttribute('data-state', 'closed');
    rerender(content(true));
    expect(screen.getByTestId('mounted')).toBe(node);
    rerender(content(false));
    expect(screen.getByTestId('mounted')).toBe(node);
    expect(document.querySelector('.oxygen-overlay')).toBe(overlay);
  });

  it.each([
    ['Popover', Popover, PopoverContent],
    ['DropdownMenu', DropdownMenu, DropdownMenuContent],
  ] as const)('%s keeps a closed custom content root mounted', (_name, Root, Content) => {
    const ref = createRef<HTMLDivElement>();
    const { rerender } = render(<Root open={false}><Content asChild forceMount ref={ref}><div data-testid="mounted">Content</div></Content></Root>);
    const node = screen.getByTestId('mounted');
    expect(ref.current).toBe(node);
    expect(node).toHaveAttribute('data-state', 'closed');
    rerender(<Root open><Content asChild forceMount ref={ref}><div data-testid="mounted">Content</div></Content></Root>);
    rerender(<Root open={false}><Content asChild forceMount ref={ref}><div data-testid="mounted">Content</div></Content></Root>);
    expect(screen.getByTestId('mounted')).toBe(node);
  });

  it('Tooltip keeps closed custom content mounted', () => {
    const ref = createRef<HTMLDivElement>();
    const content = (open: boolean) => <TooltipProvider><Tooltip open={open}><TooltipTrigger>Hint</TooltipTrigger>
      <TooltipContent asChild forceMount ref={ref}><div data-testid="mounted">Help</div></TooltipContent>
    </Tooltip></TooltipProvider>;
    const { rerender } = render(content(false));
    const node = screen.getByTestId('mounted');
    expect(ref.current).toBe(node);
    expect(node).toHaveAttribute('data-state', 'closed');
    rerender(content(true));
    rerender(content(false));
    expect(screen.getByTestId('mounted')).toBe(node);
  });
});
