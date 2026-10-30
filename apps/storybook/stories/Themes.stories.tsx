import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Alert, Button, Checkbox, ConfigProvider, Dialog, DialogContent, DialogDescription,
  DialogHeader, DialogTitle, DialogTrigger, Input, Popover, PopoverContent,
  PopoverTrigger, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Switch,
  type OxygenTheme,
} from '@oxygen-design/ui';

function ThemePanel({ title }: { title: string }) {
  return (
    <section className="story-section" style={{ padding: 24, borderRadius: 8, background: 'var(--oxygen-color-surface)', color: 'var(--oxygen-color-text)' }}>
      <h2 className="story-section__title">{title}</h2>
      <p style={{ color: 'var(--oxygen-color-text-muted)' }}>主题只影响当前区域及其浮层。切换主题不会清除输入内容。</p>
      <div className="story-stack">
        <Input aria-label={`${title}备注`} placeholder="输入一些内容后切换主题" />
        <Select defaultValue="design">
          <SelectTrigger aria-label={`${title}工作空间`}><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="design">设计工作空间</SelectItem>
            <SelectItem value="engineering">研发工作空间</SelectItem>
          </SelectContent>
        </Select>
        <Alert tone="success">已同步设计资源</Alert>
        <div className="story-row">
          <Button>主要操作</Button>
          <Button variant="destructive">危险操作</Button>
          <Popover>
            <PopoverTrigger asChild><Button variant="secondary">主题说明</Button></PopoverTrigger>
            <PopoverContent>气泡继承触发区域的主题。</PopoverContent>
          </Popover>
          <Dialog>
            <DialogTrigger asChild><Button variant="secondary">打开对话框</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{title}对话框</DialogTitle>
                <DialogDescription>Portal 内容沿用当前区域的主题。</DialogDescription>
              </DialogHeader>
              <Input aria-label={`${title}对话框备注`} placeholder="输入备注" />
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </section>
  );
}

function StateMatrix() {
  return (
    <section aria-label="主题状态矩阵" style={{ display: 'grid', gap: 16, padding: 24, borderRadius: 8, background: 'var(--oxygen-color-surface)', color: 'var(--oxygen-color-text)' }}>
      <h2 className="story-section__title">状态与长内容</h2>
      <div className="story-row">
        <Button loading>正在保存</Button>
        <Button disabled>不可操作</Button>
        <Button variant="secondary" disabled>次要禁用</Button>
        <Button variant="destructive" disabled>危险禁用</Button>
      </div>
      <Input aria-label="校验失败示例" aria-invalid="true" defaultValue="需要修正的内容" />
      <Input aria-label="只读示例" readOnly value="只读内容仍然可选择" />
      <Input aria-label="禁用示例" disabled value="暂不可编辑" />
      <div className="story-row">
        <Checkbox aria-label="已选示例" defaultChecked />
        <Checkbox aria-label="混合选择示例" defaultChecked="indeterminate" />
        <Checkbox aria-label="禁用选择示例" disabled defaultChecked />
        <Switch aria-label="启用示例" defaultChecked />
        <Switch aria-label="禁用开关示例" disabled />
      </div>
      {(['info', 'success', 'warning', 'error'] as const).map((tone) => (
        <Alert key={tone} tone={tone}>{({ info: '提示', success: '成功', warning: '警告', error: '失败' })[tone]}：工作空间中的设计资源、组件和版本信息将在这里展示。较长的说明文字应在窄屏下自然换行，并保留可读的层次与边界。</Alert>
      ))}
    </section>
  );
}

function ThemeDemo({ theme }: { theme: OxygenTheme }) {
  return (
    <ConfigProvider theme={theme}>
      <div style={{ display: 'grid', gap: 24, padding: 24, background: 'var(--oxygen-color-background)', color: 'var(--oxygen-color-text)' }}>
        <ThemePanel title="当前主题" />
        <StateMatrix />
        <ConfigProvider theme={theme === 'dark' ? 'light' : 'dark'}>
          <ThemePanel title="局部相反主题" />
          <ConfigProvider>
            <div style={{ padding: 24, background: 'var(--oxygen-color-surface)', color: 'var(--oxygen-color-text)' }}>
              <Input aria-label="继承局部主题的输入框" placeholder="未指定主题的 Provider 继承上层" />
            </div>
          </ConfigProvider>
        </ConfigProvider>
      </div>
    </ConfigProvider>
  );
}

const meta = {
  title: '基础/主题',
  component: ThemeDemo,
  args: { theme: 'light' },
  argTypes: { theme: { control: 'select', options: ['light', 'dark', 'system'] } },
  parameters: { docs: { description: { component: '默认浅色；system 显式跟随操作系统。局部 Provider 与 Portal 不修改 Storybook 页面根主题。' } } },
} satisfies Meta<typeof ThemeDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Light: Story = {};
export const Dark: Story = { args: { theme: 'dark' } };
export const System: Story = { args: { theme: 'system' } };
