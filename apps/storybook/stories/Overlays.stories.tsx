import type { Meta, StoryObj } from '@storybook/react-vite';

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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@oxygen-design/ui';

const meta = {
  title: '反馈/浮层反馈',
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Dialogs: Story = {
  render: () => (
    <section className="story-section">
      <h2 className="story-section__title">
        对话框
      </h2>
      <p className="story-section__description">展示普通对话框和确认对话框。</p>
      <div className="story-row">
        <Dialog>
          <DialogTrigger asChild>
            <Button>打开对话框</Button>
          </DialogTrigger>
          <DialogContent closeLabel="关闭对话框">
            <DialogHeader>
              <DialogTitle>对话框标题</DialogTitle>
              <DialogDescription>对话框说明文字。</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="secondary">取消</Button>
              <Button>确认</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">打开确认框</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>确认操作？</AlertDialogTitle>
              <AlertDialogDescription>请确认是否继续当前操作。</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>取消</AlertDialogCancel>
              <AlertDialogAction variant="destructive">确认</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </section>
  ),
};

export const SheetAndPopover: Story = {
  render: () => (
    <section className="story-section">
      <h2 className="story-section__title">
        侧栏与气泡
      </h2>
      <p className="story-section__description">展示补充信息和辅助操作。</p>
      <div className="story-row">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="secondary">打开侧栏</Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>侧栏标题</SheetTitle>
              <SheetDescription>侧栏说明文字。</SheetDescription>
            </SheetHeader>
          </SheetContent>
        </Sheet>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="secondary">打开气泡</Button>
          </PopoverTrigger>
          <PopoverContent>
            <strong>气泡标题</strong>
            <p>气泡说明文字。</p>
          </PopoverContent>
        </Popover>
      </div>
    </section>
  ),
};

export const TooltipExample: Story = {
  render: () => (
    <TooltipProvider delayDuration={0}>
      <section className="story-section">
        <h2 className="story-section__title">
          工具提示
        </h2>
        <p className="story-section__description">用于补充说明图标或控件的含义。</p>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button aria-label="刷新" variant="ghost">
              刷新
            </Button>
          </TooltipTrigger>
          <TooltipContent>刷新内容</TooltipContent>
        </Tooltip>
      </section>
    </TooltipProvider>
  ),
};
