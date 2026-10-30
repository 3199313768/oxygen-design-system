import {
  Button, ConfigProvider, Dialog, DialogContent, DialogDescription, DialogHeader,
  DialogTitle, DialogTrigger, Input, Popover, PopoverContent, PopoverTrigger,
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue, type OxygenTheme,
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from '@oxygen-design/ui';

export function ThemeExamples({ theme }: { theme: OxygenTheme }) {
  return (
    <ConfigProvider theme={theme}>
      <section className="workbench-panel workbench-theme-example" aria-label="局部主题示例">
        <h2>局部{theme === 'light' ? '浅色' : '深色'}主题</h2>
        <p>这个区域与页面独立设置主题，浮层沿用触发区域的主题。</p>
        <Select defaultValue="design">
          <SelectTrigger aria-label="局部工作空间"><SelectValue /></SelectTrigger>
          <SelectContent aria-label="局部工作空间选项">
            <SelectItem value="design">设计工作空间</SelectItem>
            <SelectItem value="engineering">研发工作空间</SelectItem>
          </SelectContent>
        </Select>
        <div className="workbench-actions">
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild><Button variant="secondary">局部提示</Button></TooltipTrigger>
              <TooltipContent>操作仅影响当前工作空间</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Popover>
            <PopoverTrigger asChild><Button variant="secondary">局部主题说明</Button></PopoverTrigger>
            <PopoverContent aria-label="局部主题气泡">浮层继承局部主题，挂载到页面 body。</PopoverContent>
          </Popover>
          <Dialog>
            <DialogTrigger asChild><Button>打开局部对话框</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>局部主题对话框</DialogTitle>
                <DialogDescription>这里的主题由触发区域决定。</DialogDescription>
              </DialogHeader>
              <Input aria-label="局部对话框备注" placeholder="输入备注" />
            </DialogContent>
          </Dialog>
        </div>
        <ConfigProvider>
          <label className="workbench-theme-inherited" htmlFor="theme-inherited-note">继承主题备注<Input id="theme-inherited-note" placeholder="嵌套 Provider 继承主题" /></label>
        </ConfigProvider>
        <img className="workbench-theme-media" alt="原始红绿蓝色块示例"
          src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='64'%3E%3Cpath fill='%23e63838' d='M0 0h54v64H0z'/%3E%3Cpath fill='%2336a764' d='M54 0h53v64H54z'/%3E%3Cpath fill='%233668de' d='M107 0h53v64h-53z'/%3E%3C/svg%3E" />
      </section>
    </ConfigProvider>
  );
}
