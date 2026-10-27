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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@oxygen-design/ui';

const meta = {
  title: 'Components/Overlays',
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const DialogAndSheet: Story = {
  render: () => (
    <div className="story-row">
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive">删除文件</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>删除文件？</AlertDialogTitle>
            <AlertDialogDescription>
              “2026 年度产品知识库规划与跨团队协作说明.pdf”将移入回收站。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction variant="destructive">
              移入回收站
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="secondary">打开详情</Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>文件详情</SheetTitle>
            <SheetDescription>
              View metadata and processing information for the selected file.
            </SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    </div>
  ),
};
