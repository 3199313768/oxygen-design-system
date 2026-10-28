import { createRef, useState } from 'react';
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
  Calendar,
  Cascader,
  Tree,
  TreeSelect,
  Combobox,
  Checkbox,
  ColorPicker,
  ConfigProvider,
  DatePicker,
  DateRangePicker,
  InputNumber,
  Pagination,
  Message,
  Notification,
  TimePicker,
  Breadcrumb,
  Tag,
  TagInput,
  Table,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  RadioGroup,
  RadioGroupItem,
  Popover,
  PopoverContent,
  PopoverTrigger,
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  QRCode,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Slider,
  Spin,
  Switch,
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
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
  Upload as FileUpload,
  Transfer,
} from '../src';

describe('navigation and utility components', () => {
  it('supports keyboard navigation and active link semantics', () => {
    render(
      <NavigationMenu aria-label="主导航">
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuLink href="#home" active>
              首页
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuTrigger>产品</NavigationMenuTrigger>
            <NavigationMenuContent>
              <NavigationMenuLink href="#docs">文档</NavigationMenuLink>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>,
    );

    expect(screen.getByRole('link', { name: '首页' })).toHaveAttribute('aria-current', 'page');
    const trigger = screen.getByRole('button', { name: '产品' });
    trigger.focus();
    fireEvent.keyDown(trigger, { key: 'ArrowDown' });
    expect(screen.getByRole('link', { name: '文档' })).toBeInTheDocument();
  });

  it('opens a closed trigger with ArrowDown without swallowing caller key handlers', () => {
    const onKeyDown = vi.fn();
    render(
      <NavigationMenu aria-label="键盘导航">
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger onKeyDown={onKeyDown}>资源</NavigationMenuTrigger>
            <NavigationMenuContent>
              <NavigationMenuLink href="#docs">文档</NavigationMenuLink>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>,
    );

    const trigger = screen.getByRole('button', { name: '资源' });
    fireEvent.keyDown(trigger, { key: 'ArrowDown' });
    expect(onKeyDown).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('link', { name: '文档' })).toBeInTheDocument();
  });

  it('renders a QR code with custom size and colors', () => {
    render(
      <QRCode
        aria-label="项目二维码"
        bgColor="#ffffff"
        fgColor="#123456"
        includeMargin
        size={192}
        value="https://example.com"
      />,
    );

    const svg = screen.getByRole('img', { name: '项目二维码' });
    expect(svg).toHaveAttribute('width', '192');
    expect(svg).toHaveAttribute('height', '192');
    expect(
      Array.from(svg.querySelectorAll('path')).some(
        (path) => path.getAttribute('fill') === '#123456',
      ),
    ).toBe(true);
  });

  it('renders an accessible empty state instead of generating an empty QR code', () => {
    render(<QRCode aria-label="空二维码" value="   " />);
    expect(screen.getByRole('alert')).toHaveTextContent('暂无数据');
    expect(screen.queryByRole('img', { name: '空二维码' })).not.toBeInTheDocument();
  });
});

describe('interactive components', () => {
  it('increments a slider with the keyboard and emits a range value', () => {
    const onChange = vi.fn();
    render(<Slider aria-label="音量" defaultValue={10} max={20} onChange={onChange} step={5} />);
    const slider = screen.getByRole('slider', { name: '音量' });
    fireEvent.keyDown(slider, { key: 'ArrowRight' });
    expect(onChange).toHaveBeenLastCalledWith(15);
    expect(slider).toHaveValue(15);
  });

  it('keeps range slider callbacks ordered when a thumb moves', () => {
    const onChange = vi.fn();
    render(<Slider aria-label="价格范围" defaultValue={[10, 20]} max={50} onChange={onChange} range step={5} />);
    fireEvent.keyDown(screen.getAllByRole('slider')[0], { key: 'ArrowRight' });
    expect(onChange).toHaveBeenLastCalledWith([15, 20]);
  });

  it('handles color draft validation and cancel', () => {
    const onChange = vi.fn();
    render(<ColorPicker aria-label="主题色" defaultValue="#336699" onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: '主题色' }));
    const input = screen.getByRole('textbox', { name: '主题色' });
    fireEvent.change(input, { target: { value: 'invalid' } });
    expect(onChange).not.toHaveBeenCalled();
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('button', { name: '确定' })).toBeDisabled();
    fireEvent.change(input, { target: { value: '#abcdef' } });
    expect(onChange).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: '取消' }));
    expect(screen.queryByRole('textbox', { name: '主题色' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: '主题色' })).toHaveTextContent('#336699');
  });

  it('discards a valid draft when a controlled color picker is cancelled', () => {
    function ControlledColorPicker() {
      const [color, setColor] = useState('#112233');
      return <ColorPicker aria-label="受控取消颜色" onChange={setColor} value={color} />;
    }

    render(<ControlledColorPicker />);
    fireEvent.click(screen.getByRole('button', { name: '受控取消颜色' }));
    fireEvent.change(screen.getByRole('textbox', { name: '受控取消颜色' }), {
      target: { value: '#abcdef' },
    });
    fireEvent.click(screen.getByRole('button', { name: '取消' }));

    expect(screen.getByRole('button', { name: '受控取消颜色' })).toHaveTextContent('#112233');
  });

  it('keeps a controlled color picker source of truth until the parent updates it', () => {
    const onChange = vi.fn();
    render(<ColorPicker aria-label="受控颜色" onChange={onChange} value="#112233" />);
    fireEvent.click(screen.getByRole('button', { name: '受控颜色' }));
    fireEvent.change(screen.getByRole('textbox', { name: '受控颜色' }), { target: { value: '#abcdef' } });
    fireEvent.click(screen.getByRole('button', { name: '确定' }));
    expect(onChange).toHaveBeenLastCalledWith('#ABCDEF');
    expect(screen.getByRole('button', { name: '受控颜色' })).toHaveTextContent('#112233');
  });

  it('moves numeric transfer options without conflating string keys', () => {
    const onChange = vi.fn();
    render(
      <Transfer<number | string>
        aria-label="分配成员"
        onChange={onChange}
        sourceItems={[{ label: '数字', value: 1 }, { label: '字符串', value: '1' }]}
      />,
    );
    const source = screen.getByRole('group', { name: '分配成员-源列表' });
    fireEvent.click(screen.getByRole('checkbox', { name: '数字' }));
    fireEvent.click(screen.getByRole('button', { name: '移至目标列表' }));
    expect(onChange).toHaveBeenLastCalledWith([1], 'right', [1]);
    expect(source).toHaveTextContent('字符串');
    expect(source).not.toHaveTextContent('数字');
  });

  it('searches and selects all enabled transfer options before moving them', () => {
    const onChange = vi.fn();
    render(
      <Transfer
        aria-label="搜索成员"
        onChange={onChange}
        showSearch
        sourceItems={[{ label: '设计', value: 'design' }, { label: '工程', value: 'engineering' }]}
      />,
    );
    fireEvent.change(screen.getAllByRole('searchbox')[0], { target: { value: '工程' } });
    expect(screen.queryByText('设计')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('checkbox', { name: '源列表全选' }));
    fireEvent.click(screen.getByRole('button', { name: '移至目标列表' }));
    expect(onChange).toHaveBeenLastCalledWith(['engineering'], 'right', ['engineering']);
  });

  it('preserves selected transfer keys hidden by search when selecting all', () => {
    function ControlledTransfer() {
      const [targetKeys, setTargetKeys] = useState<string[]>([]);
      return (
        <Transfer
          aria-label="筛选成员"
          onChange={(next) => setTargetKeys(next)}
          showSearch
          sourceItems={[{ label: '设计', value: 'design' }, { label: '工程', value: 'engineering' }]}
          targetKeys={targetKeys}
        />
      );
    }
    render(<ControlledTransfer />);
    fireEvent.click(screen.getByRole('checkbox', { name: '设计' }));
    fireEvent.change(screen.getAllByRole('searchbox')[0], { target: { value: '工程' } });
    fireEvent.click(screen.getByRole('checkbox', { name: '源列表全选' }));
    fireEvent.click(screen.getByRole('button', { name: '移至目标列表' }));
    expect(screen.getByRole('group', { name: '筛选成员-目标列表' })).toHaveTextContent('设计');
    expect(screen.getByRole('group', { name: '筛选成员-目标列表' })).toHaveTextContent('工程');
  });

  it.each(['Enter', ' '])('restores input focus after %s removal in an uncontrolled token editor', (key) => {
    const ref = createRef<HTMLInputElement>();
    render(<TagInput aria-label="标签" defaultValue={['设计', '开发']} ref={ref} />);
    const button = screen.getByRole('button', { name: '移除 设计' });
    button.focus();
    fireEvent.keyDown(button, { key });
    // jsdom does not synthesize the native button activation click for keyboard events.
    fireEvent.click(button, { detail: 0 });
    fireEvent.keyUp(button, { key });

    expect(screen.queryByText('设计')).not.toBeInTheDocument();
    expect(ref.current).toBe(screen.getByRole('textbox', { name: '标签' }));
    expect(ref.current).toHaveFocus();
    fireEvent.change(ref.current!, { target: { value: '测试' } });
    fireEvent.keyDown(ref.current!, { key: 'Enter' });
    expect(screen.getByText('测试')).toBeInTheDocument();
  });

  it.each(['Enter', ' '])('restores input focus after %s removal in a controlled token editor', (key) => {
    function ControlledTags() {
      const [value, setValue] = useState(['设计']);
      return <TagInput aria-label="标签" onChange={setValue} value={value} />;
    }
    render(<ControlledTags />);
    const button = screen.getByRole('button', { name: '移除 设计' });
    button.focus();
    fireEvent.keyDown(button, { key });
    fireEvent.click(button, { detail: 0 });
    fireEvent.keyUp(button, { key });

    expect(screen.queryByText('设计')).not.toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: '标签' })).toHaveFocus();
  });

  it('localizes breadcrumb navigation and tag removal through ConfigProvider', () => {
    const onClose = vi.fn();
    render(
      <ConfigProvider locale={{ common: { breadcrumb: 'Breadcrumb', remove: 'Remove' } }}>
        <Breadcrumb items={[{ label: 'Home' }]} />
        <Tag closable onClose={onClose}>Ready</Tag>
      </ConfigProvider>,
    );
    expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Remove Ready' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('commits trimmed tag tokens on Enter and ignores blanks and duplicates', () => {
    const onChange = vi.fn();
    render(<TagInput aria-label="标签" defaultValue={['已有']} onChange={onChange} />);
    const input = screen.getByRole('textbox', { name: '标签' });
    fireEvent.change(input, { target: { value: '  新标签  ' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(screen.getByText('新标签')).toBeInTheDocument();
    expect(onChange).toHaveBeenLastCalledWith(['已有', '新标签']);
    expect(input).toHaveValue('');
    fireEvent.change(input, { target: { value: ' 已有 ' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    fireEvent.change(input, { target: { value: '  ' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('keeps controlled tag values until the caller updates them', () => {
    const onChange = vi.fn();
    const { rerender } = render(<TagInput aria-label="标签" onChange={onChange} value={['已有']} />);
    const input = screen.getByRole('textbox', { name: '标签' });
    fireEvent.change(input, { target: { value: '新增' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onChange).toHaveBeenLastCalledWith(['已有', '新增']);
    expect(screen.queryByText('新增')).not.toBeInTheDocument();
    rerender(<TagInput aria-label="标签" onChange={onChange} value={['已有', '新增']} />);
    expect(screen.getByText('新增')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '移除 新增' }));
    expect(onChange).toHaveBeenLastCalledWith(['已有']);
    expect(screen.getByText('新增')).toBeInTheDocument();
  });

  it('limits additions while allowing removal and duplicate opt-in', () => {
    render(<TagInput allowDuplicates aria-label="标签" defaultValue={['重复']} max={2} />);
    const input = screen.getByRole('textbox', { name: '标签' });
    fireEvent.change(input, { target: { value: '重复' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(screen.getAllByText('重复')).toHaveLength(2);
    fireEvent.change(input, { target: { value: '超出' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(screen.queryByText('超出')).not.toBeInTheDocument();
    fireEvent.click(screen.getAllByRole('button', { name: '移除 重复' })[0]!);
    expect(screen.getAllByText('重复')).toHaveLength(1);
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(screen.getByText('超出')).toBeInTheDocument();
  });

  it('does not commit a tag while composing or when a key handler prevents it', () => {
    const onChange = vi.fn();
    const { rerender } = render(<TagInput aria-label="标签" onChange={onChange} />);
    const input = screen.getByRole('textbox', { name: '标签' });
    fireEvent.change(input, { target: { value: '输入中' } });
    fireEvent.keyDown(input, { isComposing: true, key: 'Enter' });
    expect(onChange).not.toHaveBeenCalled();
    rerender(<TagInput aria-label="标签" onChange={onChange} onKeyDown={(event) => event.preventDefault()} />);
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onChange).not.toHaveBeenCalled();
    expect(input).toHaveValue('输入中');
  });

  it('prevents all tag edits when disabled or read-only', () => {
    const onChange = vi.fn();
    const { rerender } = render(<TagInput aria-label="标签" defaultValue={['已有']} disabled onChange={onChange} />);
    const input = screen.getByRole('textbox', { name: '标签' });
    expect(input).toBeDisabled();
    expect(screen.getByRole('button', { name: '移除 已有' })).toBeDisabled();
    fireEvent.change(input, { target: { value: '新增' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    fireEvent.click(screen.getByRole('button', { name: '移除 已有' }));
    expect(onChange).not.toHaveBeenCalled();
    rerender(<TagInput aria-label="标签" defaultValue={['已有']} onChange={onChange} readOnly />);
    expect(input).toHaveAttribute('readonly');
    fireEvent.keyDown(input, { key: 'Enter' });
    fireEvent.click(screen.getByRole('button', { name: '移除 已有' }));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('rejects an upload larger than maxSize', () => {
    render(<FileUpload aria-label="选择文件" maxSize={10} />);

    const file = new File(['01234567890'], 'large.txt', { type: 'text/plain' });
    const input = screen.getByLabelText('选择文件');
    fireEvent.change(input, { target: { files: [file] } });

    expect(screen.queryByText('large.txt')).not.toBeInTheDocument();
  });

  it('calls onRemove when a controlled upload file is removed', () => {
    const onRemove = vi.fn();
    const file = new File(['content'], 'ready.txt', { type: 'text/plain' });

    render(
      <FileUpload
        fileList={[{ file, id: 'ready', name: 'ready.txt', status: 'done' }]}
        onRemove={onRemove}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: '移除 ready.txt' }));
    expect(onRemove).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'ready.txt', id: 'ready' }),
    );
  });

  it('selects a date from the calendar grid', () => {
    const onChange = vi.fn();

    render(
      <Calendar month={new Date(2026, 9, 1)} onSelect={onChange} />,
    );

    fireEvent.click(screen.getByRole('button', { name: /2026年10月28日/ }));
    expect(onChange).toHaveBeenCalledWith(new Date(2026, 9, 28));
  });

  it('calls onChange for a date range only after both endpoints exist', () => {
    const onChange = vi.fn();

    render(
      <DateRangePicker month={new Date(2026, 9, 1)} onChange={onChange} />,
    );

    fireEvent.click(screen.getByRole('button', { name: /2026年10月28日/ }));
    expect(onChange).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: /2026年10月30日/ }));
    expect(onChange).toHaveBeenCalledWith([
      new Date(2026, 9, 28),
      new Date(2026, 9, 30),
    ]);
  });

  it('filters and selects a combobox option with ArrowDown and Enter', () => {
    const onChange = vi.fn();

    render(
      <Combobox
        aria-label="选择城市"
        onChange={onChange}
        options={[
          { label: '北京', value: 'beijing' },
          { label: '上海', value: 'shanghai' },
        ]}
      />,
    );

    const input = screen.getByRole('combobox', { name: '选择城市' });
    fireEvent.change(input, { target: { value: '上' } });
    expect(screen.getByRole('option', { name: '上海' })).toBeInTheDocument();
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onChange).toHaveBeenCalledWith('shanghai', { label: '上海', value: 'shanghai' });
  });

  it('clamps typed input number values to min and max', () => {
    const onChange = vi.fn();

    render(<InputNumber aria-label="数量" max={10} min={1} onChange={onChange} />);

    const input = screen.getByRole('spinbutton', { name: '数量' });
    fireEvent.change(input, { target: { value: '99' } });
    expect(input).toHaveValue('10');
    fireEvent.change(input, { target: { value: '0' } });
    expect(input).toHaveValue('1');
  });

  it('renders and dismisses composed notification and message feedback', async () => {
    render(
      <ToastProvider>
        <Notification defaultOpen description="说明文字" title="通知标题" />
        <Message defaultOpen>消息内容</Message>
        <ToastViewport />
      </ToastProvider>,
    );

    expect(screen.getByText('通知标题')).toBeInTheDocument();
    expect(screen.getByText('消息内容')).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole('button', { name: '关闭' })[0]);
    await waitFor(() => expect(screen.queryByText('通知标题')).not.toBeInTheDocument());
  });

  it('changes a date picker through its native date input', () => {
    const onChange = vi.fn();
    render(
      <DatePicker
        aria-label="日期"
        defaultValue="2026-10-27"
        onChange={onChange}
      />,
    );

    const picker = screen.getByLabelText('日期');
    expect(picker).toHaveValue('2026-10-27');
    fireEvent.change(picker, { target: { value: '2026-10-28' } });
    expect(onChange).toHaveBeenCalledWith('2026-10-28');
  });

  it('changes a time picker and preserves disabled state', () => {
    const onChange = vi.fn();
    render(
      <TimePicker aria-label="时间" disabled onChange={onChange} value="09:30" />,
    );

    const picker = screen.getByLabelText('时间');
    expect(picker).toBeDisabled();
    expect(picker).toHaveValue('09:30');
    fireEvent.change(picker, { target: { value: '10:00' } });
    expect(onChange).toHaveBeenCalledWith('10:00');
  });

  it('reports selected table rows through the row selection callback', () => {
    const onChange = vi.fn();
    render(
      <Table
        columns={[{ dataIndex: 'label', key: 'label', title: '标签' }]}
        dataSource={[{ id: 'one', label: '第一项' }]}
        rowKey="id"
        rowSelection={{ onChange }}
      />,
    );

    fireEvent.click(screen.getByRole('checkbox', { name: '选择第 1 行' }));
    expect(onChange).toHaveBeenCalledWith(['one'], [{ id: 'one', label: '第一项' }]);
  });

  it('does not activate a disabled Button when rendered as a child', () => {
    const onClick = vi.fn();
    render(
      <Button asChild disabled onClick={onClick}>
        <a href="/disabled">不可用</a>
      </Button>,
    );

    const link = screen.getByRole('link', { name: '不可用' });
    expect(link).toHaveAttribute('aria-disabled', 'true');
    fireEvent.click(link);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('preserves numeric row keys in table selection callbacks', () => {
    const onChange = vi.fn();
    render(
      <Table
        columns={[{ dataIndex: 'label', key: 'label', title: '标签' }]}
        dataSource={[{ id: 1, label: '第一项' }]}
        rowKey="id"
        rowSelection={{ defaultSelectedRowKeys: [1], onChange }}
      />,
    );

    const checkbox = screen.getByRole('checkbox', { name: '选择第 1 行' });
    expect(checkbox).toBeChecked();
    fireEvent.click(checkbox);
    expect(onChange).toHaveBeenCalledWith([], []);
  });

  it('changes pagination pages and disables navigation at the last page', () => {
    const onChange = vi.fn();
    render(<Pagination onChange={onChange} pageSize={10} total={25} />);

    const next = screen.getByRole('button', { name: '下一页' });
    expect(screen.getByRole('button', { name: '第 1 页' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    fireEvent.click(next);
    expect(screen.getByRole('button', { name: '第 2 页' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(onChange).toHaveBeenLastCalledWith(2, 10);
    fireEvent.click(next);
    expect(screen.getByRole('button', { name: '第 3 页' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(next).toBeDisabled();
  });

  it('supports controlled pagination and localized navigation labels', () => {
    const onChange = vi.fn();
    render(
      <ConfigProvider
        locale={{ common: { next: '下一条', previous: '上一条' } }}
      >
        <Pagination current={2} onChange={onChange} pageSize={10} total={30} />
      </ConfigProvider>,
    );

    expect(screen.getByRole('button', { name: '第 2 页' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    fireEvent.click(screen.getByRole('button', { name: '下一条' }));
    expect(onChange).toHaveBeenCalledWith(3, 10);
    expect(screen.getByRole('button', { name: '第 2 页' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  it('localizes generic loading, empty, selection, and page-size copy', () => {
    render(
      <ConfigProvider
        locale={{
          common: {
            empty: 'No rows',
            loading: 'Loading',
            pageSizeOption: (size) => `${size} per page`,
            pagination: 'Pager',
            selectRow: (row) => `Select row ${row}`,
          },
        }}
      >
        <Spin />
        <Table
          columns={[{ dataIndex: 'label', key: 'label', title: 'Label' }]}
          dataSource={[{ id: 1, label: 'One' }]}
          rowKey="id"
          rowSelection={{}}
        />
        <Table columns={[{ key: 'label', title: 'Label' }]} dataSource={[]} />
        <Pagination showSizeChanger total={20} />
      </ConfigProvider>,
    );

    expect(screen.getByRole('status', { name: 'Loading' })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Select row 1' })).toBeInTheDocument();
    expect(screen.getByText('No rows')).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Pager' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: '10 per page' })).toBeInTheDocument();
  });

  it('does not emit pagination changes while disabled', () => {
    const onChange = vi.fn();
    render(<Pagination disabled onChange={onChange} total={20} />);

    fireEvent.click(screen.getByRole('button', { name: '下一页' }));
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: '下一页' })).toBeDisabled();
  });

  it('uses ellipsis for large page counts and exposes the total summary', () => {
    render(
      <Pagination pageSize={10} showTotal total={200} />,
    );

    expect(screen.getByText('共 200 条')).toBeInTheDocument();
    expect(screen.getAllByText('…')).toHaveLength(1);
    expect(screen.getByRole('button', { name: '第 1 页' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '第 20 页' })).toBeInTheDocument();
  });

  it('supports custom page size options and hides a single page when requested', () => {
    const { rerender } = render(
      <Pagination
        pageSize={10}
        pageSizeOptions={[10, 25]}
        showSizeChanger
        total={60}
      />,
    );

    const sizeChanger = screen.getByRole('combobox', { name: '每页条数' });
    expect(sizeChanger).toHaveDisplayValue('10 / 页');
    expect(screen.getByRole('option', { name: '25 / 页' })).toBeInTheDocument();

    rerender(<Pagination hideOnSinglePage pageSize={10} total={5} />);
    expect(screen.queryByRole('navigation', { name: '分页' })).not.toBeInTheDocument();
  });

  it('updates page boundaries immediately when the controlled page size changes', () => {
    const { rerender } = render(<Pagination pageSize={10} total={25} />);

    expect(screen.getByRole('button', { name: '第 3 页' })).toBeInTheDocument();
    rerender(<Pagination pageSize={25} total={25} />);
    expect(screen.queryByRole('button', { name: '第 2 页' })).not.toBeInTheDocument();
  });

  it('restores focus after an alert dialog closes', async () => {
    render(
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button>危险操作</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认操作？</AlertDialogTitle>
            <AlertDialogDescription>此操作无法撤销。</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction>确认</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>,
    );

    const trigger = screen.getByRole('button', { name: '危险操作' });
    fireEvent.click(trigger);
    expect(
      screen.getByRole('alertdialog', { name: '确认操作？' }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '取消' }));
    await waitFor(() => expect(trigger).toHaveFocus());
  });

  it('opens a generic dialog and restores focus after closing', async () => {
    render(
      <Dialog>
        <DialogTrigger asChild>
          <Button>打开对话框</Button>
        </DialogTrigger>
        <DialogContent closeLabel="关闭对话框">
          <DialogHeader>
            <DialogTitle>编辑内容</DialogTitle>
            <DialogDescription>更新当前内容。</DialogDescription>
          </DialogHeader>
          <DialogClose asChild>
            <Button variant="secondary">取消</Button>
          </DialogClose>
        </DialogContent>
      </Dialog>,
    );

    const trigger = screen.getByRole('button', { name: '打开对话框' });
    fireEvent.click(trigger);
    const dialog = screen.getByRole('dialog', { name: '编辑内容' });
    expect(dialog).toHaveAccessibleDescription('更新当前内容。');
    expect(screen.getByRole('button', { name: '关闭对话框' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '取消' }));
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
    expect(trigger).toHaveFocus();
  });

  it('uses the Chinese default close label for overlays', () => {
    render(
      <Dialog>
        <DialogTrigger asChild>
          <Button>打开对话框</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogTitle>示例内容</DialogTitle>
        </DialogContent>
      </Dialog>,
    );

    fireEvent.click(screen.getByRole('button', { name: '打开对话框' }));
    expect(screen.getByRole('button', { name: '关闭' })).toBeInTheDocument();
  });

  it('allows a ConfigProvider locale to override generic overlay copy', () => {
    render(
      <ConfigProvider locale={{ common: { close: 'Dismiss' } }}>
        <Sheet>
          <SheetTrigger asChild>
            <Button>打开侧栏</Button>
          </SheetTrigger>
          <SheetContent closeLabel="">
            <SheetTitle>侧栏</SheetTitle>
          </SheetContent>
        </Sheet>
      </ConfigProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: '打开侧栏' }));
    expect(screen.getByRole('button', { name: 'Dismiss' })).toBeInTheDocument();
  });

  it('opens a popover from its anchor and exposes its content', () => {
    render(
      <Popover>
        <PopoverTrigger asChild>
          <Button>打开筛选</Button>
        </PopoverTrigger>
        <PopoverContent>
          <p>筛选条件</p>
        </PopoverContent>
      </Popover>,
    );

    fireEvent.click(screen.getByRole('button', { name: '打开筛选' }));
    expect(screen.getByText('筛选条件')).toBeVisible();
  });

  it('renders and dismisses an accessible toast', async () => {
    render(
      <ToastProvider>
        <Toast defaultOpen>
          <ToastTitle>操作成功</ToastTitle>
          <ToastDescription>内容已更新。</ToastDescription>
          <ToastClose aria-label="关闭通知" />
        </Toast>
        <ToastViewport />
      </ToastProvider>,
    );

    const toast = screen.getByText('内容已更新。').closest('li');
    expect(toast).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '关闭通知' }));
    await waitFor(() => expect(toast).not.toBeInTheDocument());
  });

  it('changes tabs through their accessible triggers', () => {
    const onValueChange = vi.fn();
    render(
      <Tabs defaultValue="all" onValueChange={onValueChange}>
        <TabsList aria-label="内容状态">
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
    render(<Checkbox aria-label="选择项" />);

    const checkbox = screen.getByRole('checkbox', { name: '选择项' });
    expect(checkbox).not.toBeChecked();
    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();
  });

  it('changes the selected radio option through keyboard navigation', () => {
    render(
      <RadioGroup aria-label="选项" defaultValue="a">
        <RadioGroupItem aria-label="选项 A" value="a" />
        <RadioGroupItem aria-label="选项 B" value="b" />
      </RadioGroup>,
    );

    const optionA = screen.getByRole('radio', { name: '选项 A' });
    const optionB = screen.getByRole('radio', { name: '选项 B' });
    expect(optionA).toBeChecked();
    optionA.focus();
    fireEvent.keyDown(optionA, { key: 'ArrowRight' });
    fireEvent.focus(optionB);
    expect(optionB).toBeChecked();
  });

  it('toggles a switch through its accessible control', () => {
    render(<Switch aria-label="启用功能" />);

    const toggle = screen.getByRole('switch', { name: '启用功能' });
    expect(toggle).not.toBeChecked();
    fireEvent.click(toggle);
    expect(toggle).toBeChecked();
  });

  it('selects an option from the accessible select menu', async () => {
    render(
      <Select defaultValue="recent">
        <SelectTrigger aria-label="选择排序">
          <SelectValue placeholder="选择一项" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="recent">最近</SelectItem>
          <SelectItem value="name">名称</SelectItem>
        </SelectContent>
      </Select>,
    );

    const trigger = screen.getByRole('combobox', { name: '选择排序' });
    fireEvent.pointerDown(trigger, {
      button: 0,
      ctrlKey: false,
      pointerId: 1,
      pointerType: 'mouse',
    });
    fireEvent.click(await screen.findByRole('option', { name: '名称' }));
    await waitFor(() => expect(trigger).toHaveTextContent('名称'));
  });

  it('opens a dropdown menu from the keyboard', async () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button>更多操作</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>退出</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );

    const trigger = screen.getByRole('button', { name: '更多操作' });
    trigger.focus();
    fireEvent.keyDown(trigger, { key: 'ArrowDown' });

    expect(
      await screen.findByRole('menuitem', { name: '退出' }),
    ).toBeVisible();
  });

  it('labels a sheet and closes it with an accessible control', async () => {
    render(
      <Sheet>
        <SheetTrigger asChild>
          <Button>打开侧栏</Button>
        </SheetTrigger>
        <SheetContent closeLabel="关闭">
          <SheetTitle>侧栏</SheetTitle>
          <SheetDescription>选择页面</SheetDescription>
        </SheetContent>
      </Sheet>,
    );

    const trigger = screen.getByRole('button', { name: '打开侧栏' });
    fireEvent.click(trigger);
    const dialog = screen.getByRole('dialog', { name: '侧栏' });
    expect(dialog).toHaveAccessibleDescription('选择页面');
    fireEvent.click(screen.getByRole('button', { name: '关闭' }));
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
    expect(trigger).toHaveFocus();
  });

  it('uses the caller-provided sheet close label', () => {
    render(
      <Sheet>
        <SheetTrigger asChild>
          <Button>打开侧栏</Button>
        </SheetTrigger>
        <SheetContent closeLabel="关闭侧栏">
          <SheetTitle>侧栏</SheetTitle>
        </SheetContent>
      </Sheet>,
    );

    fireEvent.click(screen.getByRole('button', { name: '打开侧栏' }));
    expect(screen.getByRole('button', { name: '关闭侧栏' })).toBeInTheDocument();
  });

  it('falls back to the Chinese sheet close label when given an empty label', () => {
    render(
      <Sheet>
        <SheetTrigger asChild>
          <Button>打开侧栏</Button>
        </SheetTrigger>
        <SheetContent closeLabel="">
          <SheetTitle>侧栏</SheetTitle>
        </SheetContent>
      </Sheet>,
    );

    fireEvent.click(screen.getByRole('button', { name: '打开侧栏' }));
    expect(screen.getByRole('button', { name: '关闭' })).toBeInTheDocument();
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
          <TooltipContent>重新加载内容</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    );

    screen.getByRole('button', { name: '刷新' }).focus();
    expect(await screen.findByRole('tooltip')).toHaveTextContent('重新加载内容');
  });
});


describe('hierarchical controls', () => {
  const child = { key: 2, label: '工程' };
  const locked = { key: 3, label: '受限', disabled: true };
  const nodes = [{ key: 1, label: '团队', children: [child, locked] }];

  it('expands and collapses tree nodes while preserving numeric selection keys', () => {
    const onSelect = vi.fn();
    render(<Tree treeData={nodes} onSelect={onSelect} />);
    expect(screen.queryByText('工程')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '展开 团队' }));
    expect(screen.getByRole('treeitem', { name: '工程' })).toHaveAttribute('aria-selected', 'false');
    fireEvent.click(screen.getByText('工程'));
    expect(onSelect).toHaveBeenCalledWith([2], child);
    expect(screen.getByRole('treeitem', { name: '工程' })).toHaveAttribute('aria-selected', 'true');
    fireEvent.click(screen.getByRole('button', { name: '收起 团队' }));
    expect(screen.queryByText('工程')).not.toBeInTheDocument();
  });

  it('honors controlled selection and blocks disabled tree nodes', () => {
    const onSelect = vi.fn();
    render(<Tree defaultExpandAll treeData={nodes} selectedKeys={[1]} onSelect={onSelect} />);
    fireEvent.click(screen.getByText('工程'));
    expect(onSelect).toHaveBeenCalledWith([2], child);
    expect(screen.getByRole('treeitem', { name: '团队' })).toHaveAttribute('aria-selected', 'true');
    fireEvent.click(screen.getByText('受限'));
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('checks enabled descendants and shows partial parent state', () => {
    const onCheck = vi.fn();
    render(<Tree checkable defaultExpandAll treeData={nodes} onCheck={onCheck} />);
    fireEvent.click(screen.getByRole('checkbox', { name: '团队' }));
    expect(onCheck).toHaveBeenLastCalledWith([1, 2], [nodes[0], child]);
    expect(screen.getByRole('checkbox', { name: '工程' })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: '受限' })).toBeDisabled();
  });

  it('shows partial checks and removes a parent when one descendant is unchecked', () => {
    const onCheck = vi.fn();
    const data = [{ key: 1, label: '目录', children: [{ key: 2, label: '甲' }, { key: 3, label: '乙' }] }];
    render(<Tree checkable defaultCheckedKeys={[1]} defaultExpandAll onCheck={onCheck} treeData={data} />);
    fireEvent.click(screen.getByRole('checkbox', { name: '甲' }));
    expect(screen.getByRole('checkbox', { name: '目录' })).toBePartiallyChecked();
    expect(screen.getByRole('checkbox', { name: '乙' })).toBeChecked();
    expect(onCheck).toHaveBeenLastCalledWith([3], [data[0].children[1]]);
  });

  it('keeps controlled expansion and checked keys unchanged until props update', () => {
    const onExpand = vi.fn();
    const onCheck = vi.fn();
    render(<Tree checkable checkedKeys={[]} expandedKeys={[]} onCheck={onCheck} onExpand={onExpand} treeData={nodes} />);
    fireEvent.click(screen.getByRole('button', { name: '展开 团队' }));
    expect(onExpand).toHaveBeenCalledWith([1], nodes[0]);
    expect(screen.queryByText('工程')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('checkbox', { name: '团队' }));
    expect(onCheck).toHaveBeenCalledWith([1, 2], [nodes[0], child]);
    expect(screen.getByRole('checkbox', { name: '团队' })).not.toBeChecked();
  });

  it('keeps numeric and string keys distinct and supports tree keyboard navigation', () => {
    const onSelect = vi.fn();
    render(<Tree<string | number> treeData={[{ key: 1, label: '数字' }, { key: '1', label: '字符串' }]} onSelect={onSelect} />);
    const first = screen.getByRole('treeitem', { name: '数字' });
    first.focus();
    fireEvent.keyDown(first, { key: 'ArrowDown' });
    expect(screen.getByRole('treeitem', { name: '字符串' })).toHaveFocus();
    fireEvent.keyDown(screen.getByRole('treeitem', { name: '字符串' }), { key: 'Enter' });
    expect(onSelect).toHaveBeenCalledWith(['1'], { key: '1', label: '字符串' });
  });

  it('searches nested TreeSelect nodes, expands parents, and clears a numeric value', () => {
    const onChange = vi.fn();
    render(<TreeSelect aria-label="团队选择" treeData={nodes} onChange={onChange} />);
    fireEvent.click(screen.getByRole('combobox', { name: '团队选择' }));
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: '工程' } });
    fireEvent.click(screen.getByText('工程'));
    expect(onChange).toHaveBeenCalledWith(2, child);
    expect(screen.getByRole('combobox', { name: '团队选择' })).toHaveTextContent('工程');
    fireEvent.click(screen.getByRole('button', { name: '清除' }));
    expect(onChange).toHaveBeenLastCalledWith(undefined, undefined);
  });

  it('does not mutate a controlled TreeSelect value or accept disabled selections', () => {
    const onChange = vi.fn();
    render(<TreeSelect aria-label="团队选择" defaultExpandAll treeData={nodes} value={1} onChange={onChange} />);
    fireEvent.click(screen.getByRole('combobox', { name: '团队选择' }));
    fireEvent.click(screen.getByText('受限'));
    expect(onChange).not.toHaveBeenCalled();
    fireEvent.click(screen.getByText('工程'));
    expect(onChange).toHaveBeenCalledWith(2, child);
    expect(screen.getByRole('combobox', { name: '团队选择' })).toHaveTextContent('团队');
  });

  it('selects Cascader paths only at leaves and preserves each key type', () => {
    const leaf = { key: '2', label: '浦东' };
    const parent = { key: 1, label: '上海', children: [leaf] };
    const onChange = vi.fn();
    render(<Cascader<string | number> aria-label="地区" options={[parent, { key: 4, label: '禁用', disabled: true }]} onChange={onChange} />);
    fireEvent.click(screen.getByRole('combobox', { name: '地区' }));
    fireEvent.click(screen.getByRole('button', { name: '上海' }));
    expect(onChange).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: '浦东' }));
    expect(onChange).toHaveBeenCalledWith([1, '2'], [parent, leaf]);
    expect(screen.getByRole('combobox', { name: '地区' })).toHaveTextContent('上海 / 浦东');
  });

  it('exposes empty hierarchy content and prevents disabled Cascader opening', () => {
    const { rerender } = render(<Tree treeData={[]} />);
    expect(screen.getByText('暂无数据')).toBeInTheDocument();
    rerender(<Cascader aria-label="地区" disabled options={nodes} />);
    expect(screen.getByRole('combobox', { name: '地区' })).toBeDisabled();
  });
});

describe('hierarchy review regressions', () => {
  const child = { key: 2, label: 'Child' };
  const nodes = [{ key: 1, label: 'Parent', children: [child] }];

  it.each(['toggle', 'checkbox'])('continues tree keyboard navigation after pointer focus on the %s', (control) => {
    render(<Tree checkable treeData={nodes} />);
    if (control === 'checkbox') fireEvent.click(screen.getByRole('button', { name: '展开 Parent' }));
    const target = control === 'toggle' ? screen.getByRole('button', { name: '展开 Parent' }) : screen.getByRole('checkbox', { name: 'Parent' });
    target.focus();
    fireEvent.click(target);
    expect(screen.getByRole('treeitem', { name: 'Parent' })).toHaveFocus();
    fireEvent.keyDown(document.activeElement!, { key: 'ArrowDown' });
    expect(screen.getByRole('treeitem', { name: 'Child' })).toHaveFocus();
  });

  it('blocks Cascader descendants of a disabled controlled ancestor', () => {
    const onChange = vi.fn();
    render(<Cascader aria-label="Path" onChange={onChange} options={[{ ...nodes[0], disabled: true }]} value={[1]} />);
    fireEvent.click(screen.getByRole('combobox', { name: 'Path' }));
    const target = screen.getByRole('button', { name: 'Child' });
    expect(target).toBeDisabled();
    fireEvent.click(target);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('blocks Cascader paths when an active ancestor becomes disabled', () => {
    const onChange = vi.fn();
    const { rerender } = render(<Cascader aria-label="Path" onChange={onChange} options={nodes} />);
    fireEvent.click(screen.getByRole('combobox', { name: 'Path' }));
    fireEvent.click(screen.getByRole('button', { name: 'Parent' }));
    rerender(<Cascader aria-label="Path" onChange={onChange} options={[{ ...nodes[0], disabled: true }]} />);
    const target = screen.getByRole('button', { name: 'Child' });
    expect(target).toBeDisabled();
    fireEvent.click(target);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('allows pointer and keyboard expansion changes while searching TreeSelect', () => {
    render(<TreeSelect aria-label="Search tree" treeData={nodes} />);
    fireEvent.click(screen.getByRole('combobox', { name: 'Search tree' }));
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'Child' } });
    fireEvent.click(screen.getByRole('button', { name: '收起 Parent' }));
    expect(screen.queryByRole('treeitem', { name: 'Child' })).not.toBeInTheDocument();
    const parent = screen.getByRole('treeitem', { name: 'Parent' });
    fireEvent.keyDown(parent, { key: 'ArrowRight' });
    expect(screen.getByRole('treeitem', { name: 'Child' })).toBeInTheDocument();
    fireEvent.keyDown(parent, { key: 'ArrowLeft' });
    expect(screen.queryByRole('treeitem', { name: 'Child' })).not.toBeInTheDocument();
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'Chil' } });
    expect(screen.getByRole('treeitem', { name: 'Child' })).toBeInTheDocument();
  });

  it('names each treeitem independently from whitespace and punctuation in keys', () => {
    render(<Tree defaultExpandAll treeData={[{ key: 'parent with space\t:<>', label: 'Parent', children: [{ key: 'child with space', label: 'Child' }] }]} />);
    const parent = screen.getByRole('treeitem', { name: 'Parent' });
    expect(parent.getAttribute('aria-labelledby')).not.toMatch(/\s/);
    expect(document.getElementById(parent.getAttribute('aria-labelledby')!)).toHaveTextContent('Parent');
  });

  it('searches ReactNode labels including fragments and arrays', () => {
    render(<TreeSelect aria-label="Rich labels" treeData={[{ key: 1, label: <><span>Engin</span>{['eer', <b key="end">ing</b>]}</> }]} />);
    fireEvent.click(screen.getByRole('combobox', { name: 'Rich labels' }));
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'Engineering' } });
    expect(screen.getByRole('treeitem', { name: 'Engineering' })).toBeInTheDocument();
  });

  it('names controls for ReactNode labels and supports explicit text for opaque labels', () => {
    const OpaqueLabel = () => <span>Shown text</span>;
    render(<Tree checkable treeData={[{ key: 1, label: <span>Engineering</span>, children: [{ key: 2, label: <OpaqueLabel />, textValue: 'Accessible label' }] }]} defaultExpandAll />);
    expect(screen.getByRole('button', { name: '收起 Engineering' })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Engineering' })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Accessible label' })).toBeInTheDocument();
    expect(screen.getByRole('treeitem', { name: 'Accessible label' })).toBeInTheDocument();
  });

  it('searches opaque React labels using their explicit textValue', () => {
    const OpaqueLabel = () => <span>Shown text</span>;
    render(<TreeSelect aria-label="Opaque labels" treeData={[{ key: 1, label: <OpaqueLabel />, textValue: 'Engineering' }]} />);
    fireEvent.click(screen.getByRole('combobox', { name: 'Opaque labels' }));
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'Engineering' } });
    expect(screen.getByRole('treeitem', { name: 'Engineering' })).toBeInTheDocument();
  });
});
