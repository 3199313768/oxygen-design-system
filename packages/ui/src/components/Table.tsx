import {
  forwardRef,
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
  dataIndex?: keyof T;
  key: Key;
  render?: (value: unknown, record: T, index: number) => ReactNode;
  title: ReactNode;
}

export interface TableRowSelection<T> {
  defaultSelectedRowKeys?: Key[];
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
  const [uncontrolledSelectedKeys, setUncontrolledSelectedKeys] = useState<Key[]>(
    rowSelection?.defaultSelectedRowKeys ?? [],
  );
  const selectedKeys = rowSelection?.selectedRowKeys ?? uncontrolledSelectedKeys;
  const selectionColumnCount = rowSelection ? 1 : 0;
  const columnCount = columns.length + selectionColumnCount;

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

  return (
    <div className="oxygen-table">
      <table
        aria-busy={loading || undefined}
        className={cn('oxygen-table__element', className)}
        ref={ref}
        {...props}
      >
        <thead>
          <tr>
            {rowSelection ? <th aria-label="选择" className="oxygen-table__selection" scope="col" /> : null}
            {columns.map((column) => (
              <th key={column.key} scope="col">
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
                      <td key={column.key}>
                        {column.render ? column.render(value, record, index) : String(value ?? '')}
                      </td>
                    );
                  })}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

const TableWithRef = forwardRef(TableInner);

export const Table = TableWithRef as <T>(
  props: TableProps<T> & RefAttributes<HTMLTableElement>,
) => ReactElement | null;

TableWithRef.displayName = 'Table';
