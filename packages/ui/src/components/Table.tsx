import {
  forwardRef,
  useEffect,
  useRef,
  useState,
  type Key,
  type ReactElement,
  type ReactNode,
  type RefAttributes,
  type TableHTMLAttributes,
} from 'react';

import { cn } from '../lib/cn';
import { Checkbox } from './Checkbox';
import { useOxygenLocale } from './ConfigProvider';

export interface TableColumn<T> {
  align?: 'left' | 'center' | 'right';
  dataIndex?: keyof T;
  ellipsis?: boolean;
  key: Key;
  render?: (value: unknown, record: T, index: number) => ReactNode;
  title: ReactNode;
  width?: number | string;
}

export interface TableRowSelection<T> {
  defaultSelectedRowKeys?: Key[];
  showSelectAll?: boolean;
  onChange?: (selectedRowKeys: Key[], selectedRows: T[]) => void;
  selectedRowKeys?: Key[];
}

export interface TableProps<T> extends Omit<TableHTMLAttributes<HTMLTableElement>, 'children'> {
  columns: TableColumn<T>[];
  dataSource?: T[];
  emptyText?: ReactNode;
  loading?: boolean;
  rowKey?: keyof T | ((record: T) => Key);
  rowSelection?: TableRowSelection<T>;
}

function getRecordKey<T>(record: T, index: number, rowKey?: TableProps<T>['rowKey']): Key {
  if (typeof rowKey === 'function') return rowKey(record);
  if (rowKey) {
    const value = record[rowKey];
    return typeof value === 'string' || typeof value === 'number' ? value : String(value);
  }
  const candidate = (record as Record<string, unknown>).key;
  return typeof candidate === 'string' || typeof candidate === 'number' ? candidate : index;
}

function TableInner<T>(
  {
    className,
    columns,
    dataSource = [],
    emptyText,
    loading = false,
    rowKey,
    rowSelection,
    ...props
  }: TableProps<T>,
  ref: React.ForwardedRef<HTMLTableElement>,
) {
  const locale = useOxygenLocale();
  const tableWrapperRef = useRef<HTMLDivElement>(null);
  const [hasOverflowRight, setHasOverflowRight] = useState(false);
  const [uncontrolledSelectedKeys, setUncontrolledSelectedKeys] = useState<Key[]>(
    rowSelection?.defaultSelectedRowKeys ?? [],
  );
  const selectedKeys = rowSelection?.selectedRowKeys ?? uncontrolledSelectedKeys;
  const selectionColumnCount = rowSelection ? 1 : 0;
  const columnCount = columns.length + selectionColumnCount;
  const selectableKeys = dataSource.map((record, index) => getRecordKey(record, index, rowKey));
  const selectedCount = selectableKeys.filter((key) => selectedKeys.includes(key)).length;
  const allSelected = selectableKeys.length > 0 && selectedCount === selectableKeys.length;
  const partiallySelected = selectedCount > 0 && !allSelected;

  useEffect(() => {
    const node = tableWrapperRef.current;
    if (!node) return undefined;

    const updateOverflow = () => {
      const remainingScroll = node.scrollWidth - node.clientWidth - node.scrollLeft;
      setHasOverflowRight(node.scrollWidth > node.clientWidth + 1 && remainingScroll > 1);
    };

    updateOverflow();
    node.addEventListener('scroll', updateOverflow, { passive: true });
    const observer = typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(updateOverflow);
    observer?.observe(node);
    return () => {
      node.removeEventListener('scroll', updateOverflow);
      observer?.disconnect();
    };
  }, [columns.length, dataSource.length]);

  function toggleRow(record: T, index: number) {
    const key = getRecordKey(record, index, rowKey);
    const nextKeys = selectedKeys.includes(key)
      ? selectedKeys.filter((selectedKey) => selectedKey !== key)
      : [...selectedKeys, key];
    const selectedRows = dataSource.filter((item, itemIndex) =>
      nextKeys.includes(getRecordKey(item, itemIndex, rowKey)),
    );

    if (rowSelection?.selectedRowKeys === undefined) {
      setUncontrolledSelectedKeys(nextKeys);
    }
    rowSelection?.onChange?.(nextKeys, selectedRows);
  }

  function toggleAll() {
    const nextKeys = allSelected ? [] : selectableKeys;
    const selectedRows = allSelected ? [] : dataSource;
    if (rowSelection?.selectedRowKeys === undefined) setUncontrolledSelectedKeys(nextKeys);
    rowSelection?.onChange?.(nextKeys, selectedRows);
  }

  return (
    <div className="oxygen-table" data-overflow-right={hasOverflowRight ? 'true' : undefined} ref={tableWrapperRef}>
      <table
        aria-busy={loading || undefined}
        className={cn('oxygen-table__element', className)}
        ref={ref}
        {...props}
      >
        <thead>
          <tr>
            {rowSelection ? <th aria-label="选择" className="oxygen-table__selection" scope="col">
              {rowSelection.showSelectAll !== false && dataSource.length > 0 ? (
                <Checkbox aria-label={locale.common.selectAll} checked={allSelected ? true : partiallySelected ? 'indeterminate' : false} onCheckedChange={toggleAll} />
              ) : null}
            </th> : null}
            {columns.map((column) => (
              <th key={column.key} scope="col" style={{ width: column.width, textAlign: column.align }}>
                {column.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={columnCount}>
                <span role="status">{locale.common.loading}</span>
              </td>
            </tr>
          ) : dataSource.length === 0 ? (
            <tr>
              <td colSpan={columnCount}>{emptyText ?? locale.common.empty}</td>
            </tr>
          ) : (
            dataSource.map((record, index) => {
              const recordKey = getRecordKey(record, index, rowKey);
              const selected = selectedKeys.includes(recordKey);
              return (
                <tr data-selected={selected ? 'true' : undefined} key={recordKey}>
                  {rowSelection ? (
                    <td className="oxygen-table__selection">
                      <Checkbox
                        aria-label={locale.common.selectRow(index + 1)}
                        checked={selected}
                        onCheckedChange={() => toggleRow(record, index)}
                      />
                    </td>
                  ) : null}
                  {columns.map((column) => {
                    const value = column.dataIndex === undefined
                      ? undefined
                      : record[column.dataIndex];
                    return (
                      <td key={column.key} style={{ width: column.width, textAlign: column.align }} title={column.ellipsis ? String(value ?? '') : undefined}>
                        <span className={column.ellipsis ? 'oxygen-table__ellipsis' : undefined}>{column.render ? column.render(value, record, index) : String(value ?? '')}</span>
                      </td>
                    );
                  })}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
      {rowSelection && selectedCount > 0 ? <div className="oxygen-table__selection-summary" role="status">{locale.common.selected} {selectedCount} 项</div> : null}
    </div>
  );
}

const TableWithRef = forwardRef(TableInner);

export const Table = TableWithRef as <T>(
  props: TableProps<T> & RefAttributes<HTMLTableElement>,
) => ReactElement | null;

TableWithRef.displayName = 'Table';
