import { useState } from 'react';
import { PageHeader } from '@oxygen-design/patterns';
import {
  Accordion, Button, ColorPicker, ConfigProvider, Form, Collapsible, CollapsibleContent, CollapsibleTrigger,
  Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger, Input,
  NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink,
  NavigationMenuList, NavigationMenuTrigger, Popover, PopoverContent, PopoverTrigger,
  Progress, Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger,
  Skeleton, Spin, Switch, Typography,
} from '@oxygen-design/ui';

export function FoundationExamples() {
  const [percent, setPercent] = useState(25);
  const [color, setColor] = useState('#336699');
  const [colorCommits, setColorCommits] = useState(0);
  return (
    <section className="workbench-panel" aria-label="字体与动效示例" data-testid="foundation">
      <h2>字体与动效</h2>
      <div data-testid="foundation-host" style={{ fontFamily: 'serif' }}>
        <p data-testid="foundation-host-text">宿主正文不受组件字体覆盖影响。</p>
        <div data-testid="foundation-fonts">
          <Button data-testid="foundation-font-button">字体按钮</Button>
          <Input aria-label="字体输入" />
          <Typography.Text data-testid="foundation-font-body">组件正文</Typography.Text>
          <Typography.Paragraph code>const oxygen = true;</Typography.Paragraph>
          {([1, 2, 3, 4, 5] as const).map((level) => (
            <Typography.Title key={level} level={level}>排版层级 {level}</Typography.Title>
          ))}
          <PageHeader title="字体页面标题" description="模式正文说明" />
        </div>
      </div>
      <div data-testid="foundation-motion" style={{ display: 'grid', gap: 16 }}>
        <Button data-testid="foundation-motion-button">动效按钮</Button>
        <Button loading>动效加载按钮</Button>
        <Spin tip="正在加载动效示例" />
        <Skeleton style={{ height: 20, width: 180 }} />
        <Switch aria-label="动效开关" />
        <Progress aria-label="动效进度" percent={percent} />
        <Button onClick={() => setPercent(75)}>更新动效进度</Button>
        <Accordion items={[{ key: 'motion', title: '动效折叠项', children: '展开内容仍然可读。' }]} />
        <Collapsible>
          <CollapsibleTrigger>动效收起项</CollapsibleTrigger>
          <CollapsibleContent>收起内容仍然可读。</CollapsibleContent>
        </Collapsible>
        <NavigationMenu delayDuration={0}>
          <NavigationMenuList><NavigationMenuItem>
            <NavigationMenuTrigger>动效导航</NavigationMenuTrigger>
            <NavigationMenuContent><NavigationMenuLink href="#foundation">导航说明</NavigationMenuLink></NavigationMenuContent>
          </NavigationMenuItem></NavigationMenuList>
        </NavigationMenu>
        <Dialog>
          <DialogTrigger asChild><Button>打开动效对话框</Button></DialogTrigger>
          <DialogContent><DialogTitle>动效对话框</DialogTitle><DialogDescription>关闭后焦点返回触发按钮。</DialogDescription></DialogContent>
        </Dialog>
        <Popover>
          <PopoverTrigger asChild><Button>打开动效气泡</Button></PopoverTrigger>
          <PopoverContent aria-label="动效气泡">气泡内容仍然可读。</PopoverContent>
        </Popover>
        <Sheet>
          <SheetTrigger asChild><Button>打开动效抽屉</Button></SheetTrigger>
          <SheetContent><SheetTitle>动效抽屉</SheetTitle><SheetDescription>抽屉内容仍然可读。</SheetDescription></SheetContent>
        </Sheet>
      </div>
      <ConfigProvider locale={{ colorPicker: {
        required: 'Required color', invalidDescription: 'Invalid color selection',
        invalid: 'Use six hex digits', confirm: 'Apply color', cancel: 'Cancel color',
      } }}>
        <div data-testid="foundation-color">
          <Form.Item label="Foundation color" name="foundation-color" required validateStatus="error" help="Choose an approved brand color">
            <ColorPicker value={color} onChange={(next) => { setColor(next); setColorCommits((count) => count + 1); }} />
          </Form.Item>
          <p data-testid="foundation-color-committed">{color} / {colorCommits}</p>
          <ColorPicker aria-label="Disabled foundation color" disabled />
          <ColorPicker aria-label="Loading foundation color" loading />
        </div>
      </ConfigProvider>
    </section>
  );
}
