import { createRef } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import {
  Alert,
  AlertDescription,
  Badge,
  Breadcrumb,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Check,
  Field,
  FieldControl,
  FieldLabel,
  FieldError,
  Input,
  Label,
  Layout,
  Textarea,
  Table,
  Skeleton,
  Space,
  Divider,
  Descriptions,
  Form,
  Message,
  Notification,
  Progress,
  Result,
  Spin,
  Statistic,
  Steps,
  Timeline,
  ConfigProvider,
  Typography,
  Tag,
} from '../src';

describe('static components', () => {
  it('pairs description labels and values without dropping zero values', () => {
    render(<Descriptions title="基本信息" items={[
      { key: 'name', label: '名称', children: '示例项目' },
      { key: 2, label: '重试次数', children: 0, span: 2 },
    ]} />);

    expect(screen.getByRole('heading', { name: '基本信息' })).toBeInTheDocument();
    expect(screen.getAllByRole('term').map((term) => term.textContent)).toEqual(['名称', '重试次数']);
    expect(screen.getAllByRole('definition').map((value) => value.textContent)).toEqual(['示例项目', '0']);
  });

  it('replaces stale descriptions with loading, error, and empty content', () => {
    const items = [{ key: 'old', label: '旧数据', children: '上次结果' }];
    const { rerender } = render(<Descriptions items={items} loading loadingText="正在刷新" />);
    expect(screen.getByRole('status')).toHaveTextContent('正在刷新');
    expect(screen.queryByText('上次结果')).not.toBeInTheDocument();
    rerender(<Descriptions error="加载失败" items={items} />);
    expect(screen.getByRole('alert')).toHaveTextContent('加载失败');
    expect(screen.queryByText('上次结果')).not.toBeInTheDocument();
    rerender(<ConfigProvider locale={{ common: { empty: 'No records' } }}><Descriptions items={[]} /></ConfigProvider>);
    expect(screen.getByText('No records')).toBeInTheDocument();
  });

  it('formats statistics and gives a trend its caller-provided meaning', () => {
    const { rerender } = render(<Statistic title="完成率" value={87.5} precision={2} suffix="%" trend={{ direction: 'up', label: '较上期上升 5%' }} />);
    expect(screen.getByText('87.50')).toBeInTheDocument();
    expect(screen.getByText('%')).toBeInTheDocument();
    expect(screen.getByText('较上期上升 5%')).toBeInTheDocument();
    rerender(<Statistic title="完成率" value={0} />);
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('hides a statistic value and trend while loading or failed', () => {
    const { rerender } = render(<Statistic title="统计值" value={128} loading loadingText="正在统计" trend={{ direction: 'down', label: '下降 2%' }} />);
    expect(screen.getByRole('status')).toHaveTextContent('正在统计');
    expect(screen.queryByText('128')).not.toBeInTheDocument();
    expect(screen.queryByText('下降 2%')).not.toBeInTheDocument();
    rerender(<Statistic title="统计值" value={128} error="统计失败" />);
    expect(screen.getByRole('alert')).toHaveTextContent('统计失败');
    expect(screen.queryByText('128')).not.toBeInTheDocument();
    rerender(<Statistic title="统计值" emptyText="尚无统计" />);
    expect(screen.getByText('尚无统计')).toBeInTheDocument();
  });

  it('marks the current step and exposes completed and error statuses without color', () => {
    render(<Steps aria-label="处理进度" current={1} status="error" items={[
      { key: 'prepare', title: '准备', description: '校验完成' },
      { key: 'run', title: '处理', description: '请重试' },
      { key: 'done', title: '完成' },
    ]} />);
    const list = screen.getByRole('list', { name: '处理进度' });
    const steps = list.querySelectorAll('li');
    expect(steps[0]).toHaveTextContent('已完成');
    expect(steps[1]).toHaveAttribute('aria-current', 'step');
    expect(steps[1]).toHaveTextContent('错误');
    expect(steps[2]).toHaveTextContent('等待中');
    expect(screen.getByText('请重试')).toBeInTheDocument();
  });

  it('respects explicit step status and translated labels, with a useful empty state', () => {
    const { rerender } = render(<ConfigProvider locale={{ steps: { finish: 'Complete', process: 'Current' } }}>
      <Steps current={1} items={[{ key: 0, title: '一' }, { key: 1, title: '二' }, { key: 2, title: '三', status: 'finish' }]} />
    </ConfigProvider>);
    expect(screen.getAllByText('Complete')).toHaveLength(2);
    expect(screen.getByText('Current')).toBeInTheDocument();
    rerender(<Steps items={[]} emptyText="暂无步骤" />);
    expect(screen.getByText('暂无步骤')).toBeInTheDocument();
    expect(screen.getByRole('listitem')).toHaveTextContent('暂无步骤');
  });

  it('renders timeline labels, content, and readable status including pending work', () => {
    render(<Timeline aria-label="更新记录" items={[
      { key: 1, label: '09:00', children: '创建成功', status: 'success' },
      { key: 2, label: '10:00', children: '同步失败', status: 'error' },
      { key: 3, children: '等待同步', status: 'pending' },
    ]} />);
    expect(screen.getByRole('list', { name: '更新记录' })).toBeInTheDocument();
    expect(screen.getByText('09:00')).toBeInTheDocument();
    const entries = screen.getAllByRole('listitem');
    expect(entries[0]).toHaveTextContent('成功');
    expect(entries[1]).toHaveTextContent('错误');
    expect(entries[2]).toHaveTextContent('进行中');
    expect(screen.getByText('同步失败')).toBeInTheDocument();
  });

  it('replaces timeline entries while loading and localizes its empty state', () => {
    const { rerender } = render(<Timeline items={[{ key: 'old', children: '旧记录' }]} loading loadingText="读取记录中" />);
    expect(screen.getByRole('status')).toHaveTextContent('读取记录中');
    expect(screen.queryByText('旧记录')).not.toBeInTheDocument();
    rerender(<ConfigProvider locale={{ common: { empty: 'No history' } }}><Timeline items={[]} /></ConfigProvider>);
    expect(screen.getByText('No history')).toBeInTheDocument();
  });

  it('names close buttons from composed tag label content', () => {
    render(
      <>
        <Tag closable><strong>设计</strong></Tag>
        <Tag closable><span>开发</span></Tag>
        <Tag closable closeLabel="移除已完成状态"><Check aria-hidden="true" /></Tag>
      </>,
    );

    expect(screen.getByRole('button', { name: '移除 设计' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '移除 开发' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '移除已完成状态' })).toBeInTheDocument();
  });

  it('renders breadcrumb links with one current page and hidden separators', () => {
    render(
      <Breadcrumb
        aria-label="页面路径"
        items={[
          { href: '/', label: '首页' },
          { label: '项目' },
          { href: '/details', label: '详情' },
        ]}
        separator=">"
      />,
    );

    expect(screen.getByRole('navigation', { name: '页面路径' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '首页' })).toHaveAttribute('href', '/');
    expect(screen.getByText('详情')).toHaveAttribute('aria-current', 'page');
    expect(screen.queryByRole('link', { name: '详情' })).not.toBeInTheDocument();
    expect(screen.getByText('项目')).not.toHaveAttribute('aria-current');
    screen.getAllByText('>').forEach((separator) => {
      expect(separator).toHaveAttribute('aria-hidden', 'true');
    });
  });

  it('renders tag tone and disables the close control', () => {
    render(<Tag closable disabled tone="warning">待审核</Tag>);

    expect(screen.getByText('待审核').closest('.oxygen-tag')).toHaveAttribute('data-tone', 'warning');
    expect(screen.getByRole('button', { name: '移除 待审核' })).toBeDisabled();
  });

  it('automatically links a field label, control, description, and error', () => {
    render(
      <Field description="请输入有效内容" error="内容格式不正确" invalid>
        <FieldLabel>字段标签</FieldLabel>
        <FieldControl>
          <Input type="email" />
        </FieldControl>
      </Field>,
    );

    const label = screen.getByText('字段标签');
    const control = screen.getByRole('textbox', { name: '字段标签' });
    const description = screen.getByText('请输入有效内容');
    const error = screen.getByText('内容格式不正确');

    expect(label).toHaveAttribute('for', control.id);
    expect(control).toHaveAttribute('aria-invalid', 'true');
    expect(control.getAttribute('aria-describedby')).toBe(
      `${description.id} ${error.id}`,
    );
    expect(error).toHaveAttribute('role', 'alert');
  });

  it('does not render an empty field error', () => {
    render(
      <Field description="请输入有效内容" error="" invalid>
        <FieldLabel>字段标签</FieldLabel>
        <FieldControl>
          <Input type="email" />
        </FieldControl>
      </Field>,
    );

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('preserves explicit field control attributes over generated relationships', () => {
    render(
      <Field description="自动描述" error="自动错误" invalid>
        <FieldLabel htmlFor="custom-field">字段标签</FieldLabel>
        <FieldControl
          aria-describedby=""
          aria-invalid="false"
          id="custom-field"
        >
          <Input type="email" />
        </FieldControl>
      </Field>,
    );

    const control = screen.getByRole('textbox', { name: '字段标签' });
    expect(control).toHaveAttribute('id', 'custom-field');
    expect(control).toHaveAttribute('aria-invalid', 'false');
    expect(control).toHaveAttribute('aria-describedby', '');
    expect(screen.getByText('字段标签')).toHaveAttribute('for', 'custom-field');
  });

  it('links a field error to its input', () => {
    render(
      <Field>
        <Label htmlFor="field">字段标签</Label>
        <Input aria-describedby="field-error" aria-invalid id="field" />
        <FieldError id="field-error">请输入内容</FieldError>
      </Field>,
    );

    expect(screen.getByLabelText('字段标签')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByLabelText('字段标签')).toHaveAccessibleDescription('请输入内容');
    expect(screen.getByText('请输入内容')).toHaveAttribute('role', 'alert');
  });

  it('forwards native input properties and refs', () => {
    const ref = createRef<HTMLInputElement>();
    render(<Input disabled name="query" placeholder="输入内容" ref={ref} />);

    expect(ref.current).toBe(screen.getByPlaceholderText('输入内容'));
    expect(ref.current).toBeDisabled();
    expect(ref.current).toHaveAttribute('name', 'query');
  });

  it('forwards textarea properties and refs', () => {
    const ref = createRef<HTMLTextAreaElement>();
    render(
      <Field description="支持多行内容">
        <FieldLabel>多行字段</FieldLabel>
        <FieldControl>
          <Textarea name="notes" placeholder="填写内容" ref={ref} />
        </FieldControl>
      </Field>,
    );

    const textarea = screen.getByRole('textbox', { name: '多行字段' });
    expect(ref.current).toBe(textarea);
    expect(textarea).toHaveAttribute('name', 'notes');
    expect(textarea).toHaveAccessibleDescription('支持多行内容');
  });

  it('forwards a button ref and exposes destructive intent', () => {
    const ref = createRef<HTMLButtonElement>();
    render(
      <Button ref={ref} variant="destructive">
        危险操作
      </Button>,
    );

    expect(ref.current).toBe(screen.getByRole('button', { name: '危险操作' }));
    expect(ref.current).toHaveAttribute('data-variant', 'destructive');
    expect(ref.current).toHaveAttribute('data-oxygen-control', 'true');
  });

  it('disables a button and exposes busy state while loading', () => {
    render(<Button loading>提交</Button>);

    const button = screen.getByRole('button', { name: '提交' });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(button.querySelector('[data-oxygen-loading-indicator]')).toBeInTheDocument();
  });

  it('prevents activation while a composed button is loading', () => {
    let clicked = false;
    render(
      <Button asChild loading onClick={() => { clicked = true; }}>
        <a href="/example">查看详情</a>
      </Button>,
    );

    const link = screen.getByRole('link', { name: '查看详情' });
    fireEvent.click(link);
    expect(clicked).toBe(false);
    expect(link).toHaveAttribute('aria-disabled', 'true');
  });

  it('supports composing a button style onto a link', () => {
    render(
      <Button asChild>
        <a href="/example">查看详情</a>
      </Button>,
    );

    expect(screen.getByRole('link', { name: '查看详情' })).toHaveAttribute(
      'href',
      '/example',
    );
  });

  it('forwards an asChild ref to the rendered link element', () => {
    const ref = createRef<HTMLAnchorElement>();
    render(
      <Button asChild ref={ref}>
        <a href="/example">查看详情</a>
      </Button>,
    );

    expect(ref.current).toBe(screen.getByRole('link', { name: '查看详情' }));
  });

  it('renders status surfaces with stable semantic attributes', () => {
    render(
      <>
        <Badge variant="success">成功</Badge>
        <Alert tone="error">
          <AlertDescription>网络异常，请重试</AlertDescription>
        </Alert>
      </>,
    );

    expect(screen.getByText('成功')).toHaveAttribute('data-variant', 'success');
    expect(screen.getByRole('alert')).toHaveAttribute('data-tone', 'error');
  });

  it('renders skeleton variants without adding a misleading semantic role', () => {
    render(
      <>
        <Skeleton aria-label="加载文本" variant="text" />
        <Skeleton aria-label="加载图形" variant="circle" />
      </>,
    );

    expect(screen.getByLabelText('加载文本')).toHaveAttribute(
      'data-variant',
      'text',
    );
    expect(screen.getByLabelText('加载图形')).toHaveAttribute(
      'data-variant',
      'circle',
    );
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });

  it('renders card composition and curated icons from the root export', () => {
    render(
      <Card>
        <CardHeader>
          <Check aria-label="已选择" />
          <CardTitle>示例卡片</CardTitle>
          <CardDescription>统一展示相关内容</CardDescription>
        </CardHeader>
        <CardContent>暂无内容</CardContent>
      </Card>,
    );

    expect(screen.getByLabelText('已选择')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '示例卡片' })).toBeInTheDocument();
    expect(screen.getByText('暂无内容')).toBeInTheDocument();
  });

  it('renders semantic typography primitives with caller-provided content', () => {
    const titleRef = createRef<HTMLHeadingElement>();
    render(
      <Typography.Title level={2} ref={titleRef}>
        示例标题
      </Typography.Title>,
    );

    const title = screen.getByRole('heading', { level: 2, name: '示例标题' });
    expect(titleRef.current).toBe(title);
    expect(title).toHaveAttribute('data-level', '2');

    render(
      <Typography.Paragraph code strong>
        示例文本
      </Typography.Paragraph>,
    );
    expect(screen.getByText('示例文本').tagName).toBe('CODE');

    render(<Typography.Link href="/example">查看详情</Typography.Link>);
    expect(screen.getByRole('link', { name: '查看详情' })).toHaveAttribute(
      'href',
      '/example',
    );
  });

  it('renders Space and Space.Compact with layout metadata', () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Space direction="vertical" size="large" ref={ref}>
        <span>第一项</span>
        <span>第二项</span>
      </Space>,
    );

    const space = screen.getByText('第一项').parentElement;
    expect(ref.current).toBe(space);
    expect(space).toHaveAttribute('data-direction', 'vertical');
    expect(space).toHaveAttribute('data-size', 'large');
    expect(space).toHaveStyle('--oxygen-space-gap: 24px');

    render(
      <Space.Compact block>
        <button type="button">一</button>
        <button type="button">二</button>
      </Space.Compact>,
    );
    expect(screen.getByRole('button', { name: '一' }).parentElement).toHaveAttribute(
      'data-block',
      'true',
    );
  });

  it('renders a labeled divider with separator semantics', () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Divider orientation="center" ref={ref}>
        分组
      </Divider>,
    );

    const divider = screen.getByRole('separator');
    expect(ref.current).toBe(divider);
    expect(divider).toHaveAttribute('aria-orientation', 'horizontal');
    expect(divider).toHaveAttribute('data-orientation', 'center');
    expect(screen.getByText('分组')).toBeInTheDocument();
  });

  it('renders the semantic Layout composition and Sider metadata', () => {
    const layoutRef = createRef<HTMLDivElement>();
    const siderRef = createRef<HTMLElement>();
    render(
      <Layout hasSider ref={layoutRef}>
        <Layout.Header>页头</Layout.Header>
        <Layout.Sider ref={siderRef} width={240} collapsed>
          侧栏内容
        </Layout.Sider>
        <Layout.Content>主要内容</Layout.Content>
        <Layout.Footer>页脚</Layout.Footer>
      </Layout>,
    );

    const layout = screen.getByText('主要内容').parentElement;
    expect(layoutRef.current).toBe(layout);
    expect(layout).toHaveAttribute('data-has-sider', 'true');
    const header = screen.getByText('页头').closest('header');
    const sider = screen.getByText('侧栏内容').closest('aside');
    const content = screen.getByText('主要内容').closest('main');
    const footer = screen.getByText('页脚').closest('footer');
    expect(header).toBeInTheDocument();
    expect(sider).toHaveAttribute(
      'data-collapsed',
      'true',
    );
    expect(siderRef.current).toBe(sider);
    expect(content).toBeInTheDocument();
    expect(footer).toBeInTheDocument();
    expect(siderRef.current).toHaveStyle('--oxygen-layout-sider-width: 240px');
  });

  it('renders Ant Design-style Form.Item field semantics and validation status', () => {
    render(
      <Form layout="horizontal">
        <Form.Item
          help="请输入名称"
          label="名称"
          name="name"
          required
          validateStatus="error"
        >
          <Input placeholder="输入名称" />
        </Form.Item>
      </Form>,
    );

    const input = screen.getByRole('textbox', { name: '名称' });
    expect(input).toHaveAttribute('id', 'name');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('aria-required', 'true');
    expect(input).toHaveAccessibleDescription('请输入名称');
    expect(screen.getByRole('alert')).toHaveTextContent('请输入名称');
    expect(input.closest('form')).toHaveAttribute('data-layout', 'horizontal');
    expect(screen.getByText('*')).toHaveAttribute('aria-hidden', 'true');
  });

  it('renders a generic table with headers, cells, and an empty state', () => {
    render(
      <Table
        columns={[
          { dataIndex: 'label', key: 'label', title: '标签' },
          { dataIndex: 'value', key: 'value', title: '值' },
        ]}
        dataSource={[{ id: 1, label: '第一项', value: '内容一' }]}
        rowKey="id"
      />,
    );

    expect(screen.getByRole('columnheader', { name: '标签' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: '第一项' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: '内容一' })).toBeInTheDocument();

    const { rerender } = render(
      <Table columns={[{ key: 'label', title: '标签' }]} dataSource={[]} />,
    );
    expect(screen.getByText('暂无数据')).toBeInTheDocument();
    rerender(
      <Table columns={[{ key: 'label', title: '标签' }]} loading />,
    );
    expect(screen.getByRole('status')).toHaveTextContent('加载中');
  });

  it('renders feedback primitives with accessible status semantics', () => {
    render(
      <>
        <Spin tip="加载中" />
        <Progress percent={75} />
        <Result status="success" subTitle="说明文字" title="操作成功" />
      </>,
    );

    expect(screen.getByRole('status', { name: '加载中' })).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '75');
    expect(screen.getByRole('heading', { name: '操作成功' })).toBeInTheDocument();
  });
});
