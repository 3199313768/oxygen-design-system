import { type ReactNode } from 'react';
import { renderToString } from 'react-dom/server';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogTitle,
  ConfigProvider, Dialog, DialogContent, DialogDescription, DialogTitle,
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
  Input, NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuList, NavigationMenuTrigger, NavigationMenuViewport, Popover, PopoverContent, PopoverTrigger,
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
  Sheet, SheetContent, SheetDescription, SheetTitle,
  Toast, ToastProvider, ToastTitle, ToastViewport,
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from '../src';

const layers: [string, ReactNode, string][] = [
  ['dialog', <Dialog defaultOpen><DialogContent><DialogTitle>编辑</DialogTitle><DialogDescription>编辑说明</DialogDescription></DialogContent></Dialog>, '.oxygen-dialog'],
  ['alert dialog', <AlertDialog defaultOpen><AlertDialogContent><AlertDialogTitle>确认</AlertDialogTitle><AlertDialogDescription>确认说明</AlertDialogDescription></AlertDialogContent></AlertDialog>, '.oxygen-alert-dialog'],
  ['sheet', <Sheet defaultOpen><SheetContent><SheetTitle>侧栏</SheetTitle><SheetDescription>侧栏说明</SheetDescription></SheetContent></Sheet>, '.oxygen-sheet'],
  ['popover', <Popover defaultOpen><PopoverTrigger>打开内容</PopoverTrigger><PopoverContent>浮层内容</PopoverContent></Popover>, '.oxygen-popover'],
  ['menu', <DropdownMenu defaultOpen><DropdownMenuTrigger>打开菜单</DropdownMenuTrigger><DropdownMenuContent><DropdownMenuItem>操作</DropdownMenuItem></DropdownMenuContent></DropdownMenu>, '.oxygen-menu__content'],
  ['select', <Select defaultOpen><SelectTrigger aria-label="选择"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="a">候选项</SelectItem></SelectContent></Select>, '.oxygen-select__content'],
  ['tooltip', <TooltipProvider><Tooltip defaultOpen><TooltipTrigger>提示触发器</TooltipTrigger><TooltipContent>提示内容</TooltipContent></Tooltip></TooltipProvider>, '.oxygen-tooltip'],
];

describe('scoped theme contract', () => {
  it('keeps unspecified providers transparent to the host theme and leaves the document untouched', () => {
    document.documentElement.setAttribute('data-oxygen-theme', 'dark');
    try {
      const { container, unmount } = render(<ConfigProvider><Input aria-label="Host field" /></ConfigProvider>);
      expect(container.querySelector('[data-oxygen-density]')).not.toHaveAttribute('data-oxygen-theme');
      expect(document.documentElement).toHaveAttribute('data-oxygen-theme', 'dark');
      unmount();
      expect(document.documentElement).toHaveAttribute('data-oxygen-theme', 'dark');
    } finally {
      document.documentElement.removeAttribute('data-oxygen-theme');
    }
  });

  it('inherits the nearest explicit mode and allows a light region inside dark', () => {
    render(<ConfigProvider theme="dark">
      <Input aria-label="Outer" />
      <ConfigProvider locale={{ common: { close: 'Dismiss' } }}><Input aria-label="Inherited" /></ConfigProvider>
      <ConfigProvider theme="light"><Input aria-label="Local" /></ConfigProvider>
    </ConfigProvider>);
    expect(screen.getByLabelText('Outer').closest('[data-oxygen-theme]')).toHaveAttribute('data-oxygen-theme', 'dark');
    expect(screen.getByLabelText('Inherited').closest('[data-oxygen-theme]')).toHaveAttribute('data-oxygen-theme', 'dark');
    expect(screen.getByLabelText('Local').closest('[data-oxygen-theme]')).toHaveAttribute('data-oxygen-theme', 'light');
    expect(document.documentElement).not.toHaveAttribute('data-oxygen-theme');
  });

  it.each(layers)('carries the origin theme into body-mounted %s content', (_name, layer, selector) => {
    const { container } = render(<ConfigProvider theme="light"><ConfigProvider theme="dark">{layer}</ConfigProvider></ConfigProvider>);
    const content = document.querySelector(selector);
    expect(content).toBeInTheDocument();
    expect(container.contains(content)).toBe(false);
    expect(content).toHaveAttribute('data-oxygen-theme', 'dark');
    for (const overlay of document.querySelectorAll('.oxygen-overlay')) {
      expect(overlay).toHaveAttribute('data-oxygen-theme', 'dark');
    }
  });

  it('preserves a portaled dialog, uncontrolled draft and focus while its inherited theme changes', () => {
    const view = (theme: 'light' | 'dark') => <ConfigProvider theme={theme}>
      <ConfigProvider locale={{ common: { close: 'Dismiss' } }}>
        <Dialog defaultOpen><DialogContent><DialogTitle>草稿</DialogTitle><DialogDescription>草稿说明</DialogDescription><Input aria-label="Draft" defaultValue="Original" /></DialogContent></Dialog>
      </ConfigProvider>
    </ConfigProvider>;
    const { rerender } = render(view('light'));
    const dialog = screen.getByRole('dialog');
    const field = screen.getByLabelText('Draft');
    fireEvent.change(field, { target: { value: 'Unsaved draft' } });
    field.focus();
    rerender(view('dark'));
    expect(screen.getByRole('dialog')).toBe(dialog);
    expect(dialog).toHaveAttribute('data-oxygen-theme', 'dark');
    expect(field).toHaveValue('Unsaved draft');
    expect(field).toHaveFocus();
    expect(screen.getByRole('button', { name: 'Dismiss' })).toBeInTheDocument();
  });

  it('uses the toast origin theme even when its viewport belongs to an outer provider', async () => {
    render(<ConfigProvider theme="light"><ToastProvider>
      <ConfigProvider theme="dark"><Toast open duration={Infinity}><ToastTitle>已完成</ToastTitle></Toast></ConfigProvider>
      <ToastViewport />
    </ToastProvider></ConfigProvider>);
    expect(await screen.findByText('已完成')).toBeInTheDocument();
    expect(document.querySelector('.oxygen-toast')).toHaveAttribute('data-oxygen-theme', 'dark');
  });

  it('keeps a local navigation item theme after content relocates into a shared viewport', () => {
    render(<ConfigProvider theme="light"><NavigationMenu defaultValue="resources">
      <NavigationMenuList><ConfigProvider theme="dark"><NavigationMenuItem value="resources">
        <NavigationMenuTrigger>资源</NavigationMenuTrigger>
        <NavigationMenuContent>
          <Popover defaultOpen><PopoverTrigger>更多资源</PopoverTrigger><PopoverContent>导航中的浮层</PopoverContent></Popover>
        </NavigationMenuContent>
      </NavigationMenuItem></ConfigProvider></NavigationMenuList>
      <NavigationMenuViewport />
    </NavigationMenu></ConfigProvider>);
    const content = document.querySelector('.oxygen-navigation-menu__content');
    expect(content?.closest('.oxygen-navigation-menu__viewport')).toBeInTheDocument();
    expect(content).toHaveAttribute('data-oxygen-theme', 'dark');
    expect(document.querySelector('.oxygen-popover')).toHaveAttribute('data-oxygen-theme', 'dark');
  });

  it('renders system mode synchronously on the server without changing host state', () => {
    const html = renderToString(<ConfigProvider theme="system"><Input aria-label="Server field" /></ConfigProvider>);
    expect(html).toContain('data-oxygen-theme="system"');
    expect(document.documentElement).not.toHaveAttribute('data-oxygen-theme');
  });
});
