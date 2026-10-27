import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Button,
  Checkbox,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../src';

describe('interactive components', () => {
  it('restores focus after an alert dialog closes', async () => {
    render(
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button>删除</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除？</AlertDialogTitle>
            <AlertDialogDescription>删除后无法恢复。</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction>确认删除</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>,
    );

    const trigger = screen.getByRole('button', { name: '删除' });
    fireEvent.click(trigger);
    expect(
      screen.getByRole('alertdialog', { name: '确认删除？' }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '取消' }));
    await waitFor(() => expect(trigger).toHaveFocus());
  });

  it('changes tabs through their accessible triggers', () => {
    const onValueChange = vi.fn();
    render(
      <Tabs defaultValue="all" onValueChange={onValueChange}>
        <TabsList aria-label="状态筛选">
          <TabsTrigger value="all">全部</TabsTrigger>
          <TabsTrigger value="failed">失败</TabsTrigger>
        </TabsList>
        <TabsContent value="all">全部内容</TabsContent>
        <TabsContent value="failed">失败内容</TabsContent>
      </Tabs>,
    );

    fireEvent.mouseDown(screen.getByRole('tab', { name: '失败' }), {
      button: 0,
      ctrlKey: false,
    });
    expect(onValueChange).toHaveBeenCalledWith('failed');
    expect(screen.getByText('失败内容')).toBeVisible();
  });

  it('updates checkbox state through its accessible control', () => {
    render(<Checkbox aria-label="选择产品方案" />);

    const checkbox = screen.getByRole('checkbox', { name: '选择产品方案' });
    expect(checkbox).not.toBeChecked();
    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();
  });

  it('opens a dropdown menu from the keyboard', async () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button>账号菜单</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>退出当前设备</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );

    const trigger = screen.getByRole('button', { name: '账号菜单' });
    trigger.focus();
    fireEvent.keyDown(trigger, { key: 'ArrowDown' });

    expect(
      await screen.findByRole('menuitem', { name: '退出当前设备' }),
    ).toBeVisible();
  });

  it('labels a sheet and closes it with an accessible control', async () => {
    render(
      <Sheet>
        <SheetTrigger asChild>
          <Button>打开导航</Button>
        </SheetTrigger>
        <SheetContent>
          <SheetTitle>应用导航</SheetTitle>
          <SheetDescription>选择要打开的页面</SheetDescription>
        </SheetContent>
      </Sheet>,
    );

    const trigger = screen.getByRole('button', { name: '打开导航' });
    fireEvent.click(trigger);
    const dialog = screen.getByRole('dialog', { name: '应用导航' });
    expect(dialog).toHaveAccessibleDescription('选择要打开的页面');
    fireEvent.click(screen.getByRole('button', { name: '关闭' }));
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
    expect(trigger).toHaveFocus();
  });

  it('shows tooltip content when its trigger receives keyboard focus', async () => {
    render(
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="icon" aria-label="刷新">
              R
            </Button>
          </TooltipTrigger>
          <TooltipContent>重新加载文件</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    );

    screen.getByRole('button', { name: '刷新' }).focus();
    expect(await screen.findByRole('tooltip')).toHaveTextContent('重新加载文件');
  });
});
