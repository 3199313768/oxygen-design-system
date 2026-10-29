import { createRef } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Checkbox, ColorPicker, ConfigProvider, Image, InputNumber, QRCode, Slider, Table, Transfer, Upload, Result, RadioGroup, RadioGroupItem, Steps } from '../src';

describe('UI refinement semantics', () => {
  it('distinguishes a mixed checkbox from a check and toggles uncontrolled mixed state', () => {
    render(<Checkbox aria-label="Mixed" defaultChecked="indeterminate" />);
    const checkbox = screen.getByRole('checkbox', { name: 'Mixed' });
    expect(checkbox).toHaveAttribute('aria-checked', 'mixed');
    expect(checkbox.querySelector('svg')).toHaveClass('lucide-minus');
    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();
    expect(checkbox.querySelector('svg')).toHaveClass('lucide-check');
  });
  it('links invalid color text to a localized explanation and allows recovery', () => {
    const onChange = vi.fn();
    render(<ConfigProvider locale={{ colorPicker: { invalid: 'Use six hex digits', nativePicker: 'Native picker', cancel: 'Cancel', confirm: 'Apply' } }}><ColorPicker aria-label="Color" defaultOpen onChange={onChange} /></ConfigProvider>);
    const input = screen.getByRole('textbox', { name: 'Color' });
    fireEvent.change(input, { target: { value: 'bad' } });
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription('Use six hex digits');
    expect(screen.getByRole('alert')).toHaveTextContent('Use six hex digits');
    expect(screen.getByRole('button', { name: 'Apply' })).toBeDisabled();
    expect(screen.getByLabelText('Color Native picker')).toHaveAttribute('type', 'color');
    fireEvent.change(input, { target: { value: '#abcdef' } });
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }));
    expect(onChange).toHaveBeenCalledWith('#ABCDEF');
  });
  it('renders configurable upload status labels with progress', () => {
    render(<ConfigProvider locale={{ upload: { pending: 'Queued', uploading: 'Sending', done: 'Complete', error: 'Failed' } }}><Upload fileList={(['pending', 'uploading', 'done', 'error'] as const).map((status) => ({ id: status, name: status + '.txt', file: new File([], status), status, percent: 40 }))} /></ConfigProvider>);
    for (const text of ['Queued', 'Sending 40%', 'Complete', 'Failed']) expect(screen.getByText(text)).toBeInTheDocument();
  });
  it('uses target/source actions and preserves transfer callbacks', () => {
    const onChange = vi.fn();
    render(<Transfer dataSource={[{ value: 'a', label: 'Alpha' }]} onChange={onChange} />);
    fireEvent.click(screen.getByRole('checkbox', { name: 'Alpha' }));
    fireEvent.click(screen.getByRole('button', { name: '移至目标列表' }));
    expect(onChange).toHaveBeenLastCalledWith(['a'], 'right', ['a']);
    fireEvent.click(screen.getByRole('checkbox', { name: 'Alpha' }));
    fireEvent.click(screen.getByRole('button', { name: '移至源列表' }));
    expect(onChange).toHaveBeenLastCalledWith([], 'left', ['a']);
  });
  it('uses ConfigProvider labels for transfer and numeric controls', () => {
    render(
      <ConfigProvider locale={{
        common: {
          decrease: 'Decrease',
          empty: 'No options',
          imageError: 'Image failed',
          increase: 'Increase',
          maximum: 'Maximum',
          minimum: 'Minimum',
          noOptions: 'No options',
          qrcode: 'QR code',
          search: 'Find',
          selectAll: 'Select all',
        },
        transfer: { label: 'Transfer', noMatch: 'No matches', selectAll: 'Select all', source: 'Source', target: 'Target' },
      }}>
        <Transfer showSearch sourceItems={[]} />
        <InputNumber />
        <Slider aria-label="Price" range defaultValue={[10, 20]} />
        <Image alt="Preview" src="/missing.png" />
        <QRCode value="oxygen" />
      </ConfigProvider>,
    );
    expect(screen.getAllByText('Select all')).toHaveLength(2);
    expect(screen.getAllByPlaceholderText('Find')).toHaveLength(2);
    expect(screen.getAllByText('No options')).toHaveLength(2);
    expect(screen.getByRole('button', { name: 'Increase' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Decrease' })).toBeInTheDocument();
    expect(screen.getByRole('slider', { name: 'Price Minimum' })).toBeInTheDocument();
    expect(screen.getByRole('slider', { name: 'Price Maximum' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'QR code' })).toBeInTheDocument();
    fireEvent.error(screen.getByRole('img', { name: 'Preview' }));
    expect(screen.getByText('Image failed')).toBeInTheDocument();
  });
  it('uses the shared checkbox and retains uncontrolled row selection and table ref', () => {
    const onChange = vi.fn(); const ref = createRef<HTMLTableElement>();
    const record = { key: 'a', name: 'Alpha' };
    render(<Table ref={ref} columns={[{ key: 'name', dataIndex: 'name', title: 'Name' }]} dataSource={[record]} rowSelection={{ onChange }} />);
    const checkbox = screen.getByRole('checkbox', { name: '选择第 1 行' });
    expect(checkbox.tagName).toBe('BUTTON');
    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();
    expect(onChange).toHaveBeenLastCalledWith(['a'], [record]);
    fireEvent.click(checkbox);
    expect(onChange).toHaveBeenLastCalledWith([], []);
    expect(ref.current).toBe(screen.getByRole('table'));
  });
  it('keeps controlled table selection authoritative after a selection request', () => {
    const onChange = vi.fn();
    const record = { key: 'a', name: 'Alpha' };
    const columns = [{ key: 'name', dataIndex: 'name' as const, title: 'Name' }];
    const { rerender } = render(<Table columns={columns} dataSource={[record]} rowSelection={{ selectedRowKeys: [], onChange }} />);
    fireEvent.click(screen.getByRole('checkbox', { name: '选择第 1 行' }));
    expect(onChange).toHaveBeenLastCalledWith(['a'], [record]);
    expect(screen.getByRole('checkbox', { name: '选择第 1 行' })).not.toBeChecked();
    rerender(<Table columns={columns} dataSource={[record]} rowSelection={{ selectedRowKeys: ['a'], onChange }} />);
    expect(screen.getByRole('checkbox', { name: '选择第 1 行' })).toBeChecked();
  });
  it('uses indexed selection checks for large table selections', () => {
    const selectedKeys = Array.from({ length: 1000 }, (_, index) => `selected-${index}`);
    const includesSpy = vi.spyOn(selectedKeys, 'includes');
    const records = Array.from({ length: 1200 }, (_, index) => ({ id: `selected-${index}`, label: `Row ${index}` }));

    render(
      <Table
        columns={[{ key: 'label', dataIndex: 'label', title: 'Label' }]}
        dataSource={records}
        rowKey="id"
        rowSelection={{ selectedRowKeys: selectedKeys }}
      />,
    );

    expect(screen.getByText('已选择 1000 项')).toBeInTheDocument();
    expect(includesSpy).not.toHaveBeenCalled();
  });
  it('indexes transfer option values instead of rescanning all options per target key', () => {
    let valueReads = 0;
    const options = Array.from({ length: 200 }, (_, index) => {
      const option = { label: `Option ${index}` } as { label: string; value: string };
      Object.defineProperty(option, 'value', {
        configurable: true,
        get: () => {
          valueReads += 1;
          return `value-${index}`;
        },
      });
      return option;
    });

    render(<Transfer sourceItems={options} targetKeys={options.slice(0, 100).map((option) => option.value)} />);

    expect(screen.getByRole('group', { name: '穿梭框-目标列表' })).toHaveTextContent('Option 99');
    expect(valueReads).toBeLessThan(5000);
  });
  it('tracks a right-side scroll cue for wide tables', () => {
    render(
      <Table
        columns={[{ key: 'label', dataIndex: 'label', title: '标签' }]}
        dataSource={[{ label: '第一项' }]}
      />,
    );
    const tableWrapper = document.querySelector('.oxygen-table') as HTMLDivElement;
    Object.defineProperty(tableWrapper, 'scrollWidth', { configurable: true, value: 640 });
    Object.defineProperty(tableWrapper, 'clientWidth', { configurable: true, value: 320 });
    Object.defineProperty(tableWrapper, 'scrollLeft', { configurable: true, value: 0, writable: true });

    fireEvent.scroll(tableWrapper);
    expect(tableWrapper).toHaveAttribute('data-overflow-right', 'true');

    Object.defineProperty(tableWrapper, 'scrollLeft', { configurable: true, value: 320, writable: true });
    fireEvent.scroll(tableWrapper);
    expect(tableWrapper).not.toHaveAttribute('data-overflow-right');
  });
  it('renders semantic result and step SVGs and a radio dot', () => {
    const { container } = render(<><Result status="success" title="Saved" /><Result status="404" title="Missing" /><RadioGroup defaultValue="a"><RadioGroupItem value="a" aria-label="A" /></RadioGroup><Steps items={[{ key: 'a', title: 'Done', status: 'finish' }, { key: 'b', title: 'Error', status: 'error' }]} /></>);
    expect(container.querySelector('[data-status="success"] .oxygen-result__icon svg')).toBeInTheDocument();
    expect(container.querySelector('[data-status="404"] .oxygen-result__icon')).toHaveTextContent('404');
    expect(screen.getByRole('radio').querySelector('.oxygen-radio-group__dot')).toBeInTheDocument();
    expect(container.querySelectorAll('.oxygen-steps__indicator svg')).toHaveLength(2);
  });
});

  it('selects all table rows and reports mixed state with a summary', () => {
    const onChange = vi.fn();
    const records = [{ id: 'one', label: '第一项' }, { id: 'two', label: '第二项' }];
    render(<Table columns={[{ key: 'label', dataIndex: 'label', title: '标签' }]} dataSource={records} rowKey="id" rowSelection={{ onChange }} />);
    const selectAll = screen.getByRole('checkbox', { name: '选择全部' });
    expect(selectAll).not.toBeChecked();
    fireEvent.click(screen.getByRole('checkbox', { name: '选择第 1 行' }));
    expect(selectAll).toHaveAttribute('aria-checked', 'mixed');
    expect(screen.getByText('已选择 1 项')).toBeInTheDocument();
    fireEvent.click(selectAll);
    expect(onChange).toHaveBeenLastCalledWith(['one', 'two'], records);
    expect(screen.getByText('已选择 2 项')).toBeInTheDocument();
  });
  it('uses localized selected-count copy for table summaries', () => {
    render(
      <ConfigProvider locale={{ common: { selectedCount: (count) => `Selected ${count} records` } }}>
        <Table
          columns={[{ key: 'label', dataIndex: 'label', title: 'Label' }]}
          dataSource={[{ id: 'one', label: 'One' }]}
          rowKey="id"
          rowSelection={{}}
        />
      </ConfigProvider>,
    );

    fireEvent.click(screen.getByRole('checkbox', { name: '选择第 1 行' }));
    expect(screen.getByText('Selected 1 records')).toBeInTheDocument();
  });

  it('keeps rows with object row keys distinct', () => {
    const onChange = vi.fn();
    const records = [{ id: { value: 'same' }, label: '第一项' }, { id: { value: 'same' }, label: '第二项' }];
    render(<Table columns={[{ key: 'label', dataIndex: 'label', title: '标签' }]} dataSource={records} rowKey="id" rowSelection={{ onChange }} />);
    fireEvent.click(screen.getByRole('checkbox', { name: '选择第 2 行' }));
    expect(onChange).toHaveBeenLastCalledWith([1], [records[1]]);
    expect(screen.getByText('已选择 1 项')).toBeInTheDocument();
  });

  it('exposes column alignment and compact density through public contracts', () => {
    const { rerender } = render(<Table columns={[{ key: 'value', dataIndex: 'value', title: '金额', width: 120, align: 'right', ellipsis: true }]} dataSource={[{ value: '123456789' }]} />);
    const cell = screen.getByRole('cell', { name: '123456789' });
    expect(cell).toHaveStyle({ width: '120px', textAlign: 'right' });
    expect(cell).toHaveAttribute('title', '123456789');
    rerender(<ConfigProvider density="compact"><Table columns={[{ key: 'value', dataIndex: 'value', title: '值' }]} dataSource={[{ value: '内容' }]} /></ConfigProvider>);
    expect(document.querySelector('[data-oxygen-density="compact"]')).toBeInTheDocument();
  });
