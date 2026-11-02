import { useState } from 'react';
import {
  Accordion, Button, Collapsible, CollapsibleContent, CollapsibleTrigger, Combobox,
  ConfigProvider, Field, FieldControl, FieldLabel, Form, Input, NavigationMenu,
  NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList,
  NavigationMenuTrigger, NavigationMenuViewport, Notification, Pagination, Progress,
  Space, Timeline, ToastProvider, ToastViewport, Upload,
} from '@oxygen-design/ui';

export function DesignQualityExamples() {
  const [noticeOpen, setNoticeOpen] = useState(false);
  const [notice, setNotice] = useState('导出中');
  return (
    <section className="workbench-panel" aria-label="组件组合回归" data-testid="design-quality">
      <h2>组件组合回归</h2>
      <NavigationMenu aria-label="共享视口导航" delayDuration={0}>
        <NavigationMenuList>
          <NavigationMenuItem value="guide"><NavigationMenuTrigger>共享资源</NavigationMenuTrigger>
            <NavigationMenuContent><NavigationMenuLink href="#guide">共享使用指南</NavigationMenuLink></NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem value="more"><NavigationMenuTrigger>更多共享资源</NavigationMenuTrigger>
            <NavigationMenuContent><NavigationMenuLink href="#more">第二份共享指南</NavigationMenuLink><p>额外的说明内容</p></NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
        <NavigationMenuViewport />
      </NavigationMenu>
      <NavigationMenu aria-label="纵向回归导航" orientation="vertical" delayDuration={0}>
        <NavigationMenuList>
          <NavigationMenuItem><NavigationMenuLink href="#overview">纵向概览</NavigationMenuLink></NavigationMenuItem>
          <NavigationMenuItem><NavigationMenuTrigger>纵向资源</NavigationMenuTrigger>
            <NavigationMenuContent><NavigationMenuLink href="#details">纵向说明</NavigationMenuLink></NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
      <div data-testid="quality-combobox">
        <Combobox aria-label="回归长列表" defaultValue="1" options={Array.from({ length: 30 }, (_, index) => ({ value: String(index + 1), label: `回归选项 ${index + 1}` }))} />
        <Button>回归组合框之后</Button>
      </div>
      <Field required><FieldLabel>回归姓名</FieldLabel><FieldControl><Input /></FieldControl></Field>
      <Form.Item label="回归附件" help="请上传回归附件" validateStatus="error"><Upload /></Form.Item>
      <Button>回归上传之后</Button>
      <Accordion defaultValue="outer" items={[{ key: 'outer', title: '回归外层展开', children:
        <Accordion items={[{ key: 'inner', title: '回归内层关闭', children: '内层内容' }]} /> }]} />
      <Collapsible defaultOpen><CollapsibleTrigger>回归外层折叠展开</CollapsibleTrigger><CollapsibleContent>
        <Collapsible><CollapsibleTrigger>回归内层折叠关闭</CollapsibleTrigger><CollapsibleContent>内层内容</CollapsibleContent></Collapsible>
      </CollapsibleContent></Collapsible>
      <Space><Button loading>回归原生加载</Button><Button asChild loading><a href="#loading">回归组合加载</a></Button></Space>
      <Progress aria-label="回归失败零" percent={0} status="exception" showInfo={false} />
      <div data-testid="quality-pagination" style={{ width: 180, maxWidth: '100%' }}>
        <Pagination total={1000} current={50} showSizeChanger />
      </div>
      <ConfigProvider density="compact"><div data-testid="quality-compact">
        <Space size="small" data-testid="quality-small-space"><span>小一</span><span>小二</span></Space>
        <Space size="middle" data-testid="quality-token-space"><Button>回归紧凑一</Button><Button>回归紧凑二</Button></Space>
        <Space size="large" data-testid="quality-large-space"><span>大一</span><span>大二</span></Space>
        <Space size={13} data-testid="quality-numeric-space"><span>一</span><span>二</span></Space>
        <Timeline items={[{ key: 'first', children: '回归第一项' }, { key: 'second', children: '回归第二项' }]} />
      </div></ConfigProvider>
      <ToastProvider><Button onClick={() => { setNotice('导出中'); setNoticeOpen(true); }}>回归开始导出</Button>
        <Button onClick={() => setNotice('导出完成')}>回归更新完成</Button>
        <Notification open={noticeOpen} onOpenChange={setNoticeOpen} duration={Infinity} title="回归导出状态" description={notice} />
        <ToastViewport />
      </ToastProvider>
    </section>
  );
}
