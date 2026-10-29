import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Alert, AlertDescription, AlertTitle, Badge, Button, Checkbox, ColorPicker, DatePicker, Field, FieldControl, FieldDescription,
  FieldLabel, Form, Input, InputNumber, RadioGroup, RadioGroupItem, Search, Select,
  SelectContent, SelectItem, SelectTrigger, SelectValue, Steps, Switch, Table,
  Tabs, TabsContent, TabsList, TabsTrigger, Tag, Textarea, TimePicker, Transfer, Tree, Typography, Upload,
} from '@oxygen-design/ui';

const meta = { title: '通用/样式验收' } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

export const AlignmentReference: Story = {
  name: '控件对齐与状态',
  render: () => (
    <div className="story-reference">
      <h2 className="story-section__title">控件对齐与状态</h2>
      <p className="story-section__description">默认控件 36px，小尺寸 32px。使用 Tab 检查焦点；触屏保留 44px 点击区域。</p>
      <section className="story-reference__panel">
        <Typography.Title level={3}>常用控件</Typography.Title>
        <div className="story-reference__controls">
          <Field><FieldLabel>名称</FieldLabel><FieldControl><Input placeholder="输入名称" /></FieldControl></Field>
          <Field><FieldLabel>数量</FieldLabel><FieldControl><InputNumber defaultValue={12} /></FieldControl></Field>
          <Field><FieldLabel>日期</FieldLabel><FieldControl><DatePicker /></FieldControl></Field>
          <Field><FieldLabel>时间</FieldLabel><FieldControl><TimePicker /></FieldControl></Field>
          <Field><FieldLabel>类型</FieldLabel><FieldControl><Select defaultValue="default"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="default">默认类型</SelectItem><SelectItem value="other">其他类型</SelectItem></SelectContent></Select></FieldControl></Field>
          <Button><Search aria-hidden="true" />查询</Button>
        </div>
        <div className="story-row">
          <Button>主要操作</Button><Button variant="secondary">次要操作</Button>
          <Button loading>正在保存</Button><Button disabled>暂不可用</Button>
          <Button size="sm">小尺寸</Button><Button aria-label="搜索" size="icon" variant="secondary"><Search aria-hidden="true" /></Button>
        </div>
        <div className="story-row">
          <label className="story-choice"><Checkbox />未选择</label>
          <label className="story-choice"><Checkbox defaultChecked />已选择</label>
          <label className="story-choice"><Checkbox defaultChecked="indeterminate" />部分选择</label>
          <label className="story-choice"><Checkbox disabled />禁用</label>
          <RadioGroup aria-label="选择方式" defaultValue="one" style={{ display: 'flex', gap: 16 }}>
            <label className="story-choice"><RadioGroupItem value="one" />方式一</label>
            <label className="story-choice"><RadioGroupItem value="two" />方式二</label>
          </RadioGroup>
          <label className="story-choice"><Switch defaultChecked />启用</label>
        </div>
      </section>
      <section className="story-reference__panel">
        <Typography.Title level={3}>标签、帮助与校验</Typography.Title>
        <Form className="story-reference__form">
          <Form.Item label="项目名称" help="2–30 个字符，便于团队识别。"><Input placeholder="输入项目名称" /></Form.Item>
          <Form.Item label="项目说明" validateStatus="error" help="请补充说明后再保存。"><Textarea defaultValue="内容过短" /></Form.Item>
        </Form>
        <ColorPicker aria-label="示例颜色" defaultValue="#336699" />
        <Upload className="story-reference__upload" fileList={[
          { file: new File([], '等待上传.pdf'), id: 'pending', name: '等待上传.pdf', status: 'pending' },
          { file: new File([], '设计稿.fig'), id: 'uploading', name: '设计稿.fig', status: 'uploading', percent: 45 },
          { file: new File([], '已完成.png'), id: 'done', name: '已完成.png', status: 'done' },
          { file: new File([], '失败文件.zip'), id: 'error', name: '失败文件.zip', status: 'error' },
        ]} />
      </section>
      <section className="story-reference__panel">
        <Typography.Title level={3}>表格选择与进度</Typography.Title>
        <Table columns={[{ key: 'name', title: '名称', dataIndex: 'name' }, { key: 'status', title: '状态', dataIndex: 'status' }]} dataSource={[{ key: 'one', name: '组件规范', status: '已完成' }, { key: 'two', name: '交互说明', status: '处理中' }]} rowKey="key" rowSelection={{ defaultSelectedRowKeys: ['one'] }} />
        <Steps current={1} items={[{ key: 1, title: '准备', description: '确认内容' }, { key: 2, title: '处理', description: '正在处理' }, { key: 3, title: '完成', description: '查看结果' }]} />
      </section>
    </div>
  ),
};

export const SemanticStates: Story = {
  name: '颜色层级与状态辨识',
  render: () => (
    <section className="story-reference">
      <h2 className="story-section__title">颜色层级与状态辨识</h2>
      <p className="story-section__description">品牌色、语义色和中性色各自承担明确角色；状态同时通过文字、图标与底色表达。</p>
      <div className="story-reference__palette">
        {[
          ['primary', '品牌与选中', '主要操作、选中项'],
          ['success', '成功', '已完成、校验通过'],
          ['warning', '警告', '需要关注、可继续'],
          ['error', '错误', '操作失败、需要修正'],
        ].map(([tone, title, description]) => (
          <dl className="story-reference__swatch" key={tone}>
            <div aria-hidden="true" className="story-reference__swatch-color" style={{ background: `var(--oxygen-color-${tone})` }} />
            <dt>{title}</dt><dd>{description}</dd>
          </dl>
        ))}
      </div>
      <div className="story-reference__alerts">
        <Alert><AlertTitle>信息提示</AlertTitle><AlertDescription>保存后将同步更新当前内容。</AlertDescription></Alert>
        <Alert tone="success"><AlertTitle>保存成功</AlertTitle><AlertDescription>内容已保存，可以继续操作。</AlertDescription></Alert>
        <Alert tone="warning"><AlertTitle>请检查内容</AlertTitle><AlertDescription>部分信息尚未补充，提交前请再次确认。</AlertDescription></Alert>
        <Alert tone="error"><AlertTitle>保存失败</AlertTitle><AlertDescription>请检查标记的字段后重试。</AlertDescription></Alert>
      </div>
      <div className="story-row"><Tag tone="primary">已选中</Tag><Tag tone="success">已完成</Tag><Tag tone="warning">待确认</Tag><Tag tone="error">需修正</Tag><Tag disabled>不可用</Tag><Badge variant="secondary">草稿</Badge></div>
      <div className="story-row"><Button>保存更改</Button><Button variant="secondary">取消</Button><Button variant="ghost">更多操作</Button><Button variant="link">查看说明</Button><Button loading>正在保存</Button><Button disabled>暂不可用</Button></div>
      <Upload drag aria-label="拖拽上传示例" />
      <Tabs defaultValue="general" orientation="vertical">
        <TabsList aria-label="设置分类"><TabsTrigger value="general">常规设置</TabsTrigger><TabsTrigger value="advanced">高级设置</TabsTrigger><TabsTrigger disabled value="unavailable">暂不可用</TabsTrigger></TabsList>
        <TabsContent value="general">常规设置内容。使用上下方向键切换分类，Tab 进入内容区域。</TabsContent><TabsContent value="advanced">高级设置内容。</TabsContent>
      </Tabs>
    </section>
  ),
};

export const NarrowAndLongContent: Story = {
  name: '窄容器与长文案',
  render: () => (
    <section className="story-section story-reference__narrow">
      <h2 className="story-section__title">窄容器与长文案</h2>
      <Field><FieldLabel>较长的字段标题保持清晰的阅读顺序</FieldLabel><FieldControl><Input placeholder="输入需要展示的内容" /></FieldControl><FieldDescription>辅助说明会自然换行，字段之间仍保持分组距离。</FieldDescription></Field>
      <Tree aria-label="长文案目录" checkable defaultExpandAll treeData={[{ key: 'root', label: '团队目录', children: [{ key: 'long', label: '一个需要自动换行的超长团队名称及补充说明' }] }]} />
      <Transfer aria-label="窄容器团队" sourceItems={[{ value: 'one', label: '需要保留完整名称的团队成员' }, { value: 'two', label: '停用成员', disabled: true }]} />
      <Steps current={1} items={[{ key: 1, title: '准备阶段', description: '确认所有必填内容已补全' }, { key: 2, title: '正在处理', description: '较长的说明会换行并保留进度连接线' }, { key: 3, title: '处理完成' }]} />
    </section>
  ),
};
