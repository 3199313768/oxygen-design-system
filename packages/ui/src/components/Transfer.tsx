import { forwardRef, useEffect, useMemo, useState, type HTMLAttributes, type ReactNode } from 'react';

import { ArrowLeft, ArrowRight } from 'lucide-react';

import { cn } from '../lib/cn';
import { Button } from './Button';
import { Checkbox } from './Checkbox';
import { useOxygenLocale } from './ConfigProvider';
import { Input } from './Input';
import type { Option } from './shared';

export type TransferDirection = 'left' | 'right';

export interface TransferProps<T = string> extends Omit<HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'onChange'> {
  dataSource?: Option<T>[];
  defaultTargetKeys?: T[];
  disabled?: boolean;
  filterOption?: (input: string, option: Option<T>) => boolean;
  loading?: boolean;
  onChange?: (targetKeys: T[], direction: TransferDirection, moveKeys: T[]) => void;
  onSearch?: (value: string, direction: TransferDirection) => void;
  onSelectChange?: (sourceSelectedKeys: T[], targetSelectedKeys: T[]) => void;
  renderEmpty?: ReactNode;
  showSearch?: boolean;
  sourceItems?: Option<T>[];
  sourceTitle?: ReactNode;
  targetKeys?: T[];
  targetTitle?: ReactNode;
  titles?: [ReactNode, ReactNode];
}

function same<T>(left: T, right: T) {
  return Object.is(left, right);
}

function includes<T>(values: T[], value: T) {
  return values.some((item) => same(item, value));
}

function without<T>(values: T[], remove: T[]) {
  return values.filter((item) => !includes(remove, item));
}

function equalValues<T>(left: T[], right: T[]) {
  return left.length === right.length && left.every((value, index) => same(value, right[index]!));
}

function optionText(label: ReactNode) {
  return typeof label === 'string' || typeof label === 'number' ? String(label) : '';
}

function TransferInner<T>({
  'aria-label': ariaLabel = '穿梭框',
  className,
  dataSource,
  defaultTargetKeys = [],
  disabled = false,
  filterOption,
  loading = false,
  onChange,
  onSearch,
  onSelectChange,
  renderEmpty = '暂无数据',
  showSearch = false,
  sourceItems,
  sourceTitle = '源列表',
  targetKeys: targetKeysProp,
  targetTitle = '目标列表',
  titles,
  ...props
}: TransferProps<T>, ref: React.ForwardedRef<HTMLDivElement>) {
  const locale = useOxygenLocale();
  const options = sourceItems ?? dataSource ?? [];
  const controlled = targetKeysProp !== undefined;
  const [uncontrolledTargetKeys, setUncontrolledTargetKeys] = useState<T[]>([...defaultTargetKeys]);
  const targetKeys = controlled ? (targetKeysProp ?? []) : uncontrolledTargetKeys;
  const [sourceSelectedKeys, setSourceSelectedKeys] = useState<T[]>([]);
  const [targetSelectedKeys, setTargetSelectedKeys] = useState<T[]>([]);
  const [sourceSearch, setSourceSearch] = useState('');
  const [targetSearch, setTargetSearch] = useState('');
  const sourceLabel = titles?.[0] ?? sourceTitle;
  const targetLabel = titles?.[1] ?? targetTitle;

  const sourceOptions = useMemo(
    () => options.filter((option) => !includes(targetKeys, option.value)),
    [options, targetKeys],
  );
  const targetOptions = useMemo(
    () => targetKeys.flatMap((key) => options.filter((option) => same(option.value, key))),
    [options, targetKeys],
  );

  function filterOptions(items: Option<T>[], query: string) {
    return items.filter((option) => filterOption
      ? filterOption(query, option)
      : optionText(option.label).toLocaleLowerCase().includes(query.toLocaleLowerCase()));
  }

  const visibleSource = filterOptions(sourceOptions, sourceSearch);
  const visibleTarget = filterOptions(targetOptions, targetSearch);

  useEffect(() => {
    const nextSource = sourceSelectedKeys.filter((key) => sourceOptions.some((option) => same(option.value, key)));
    const nextTarget = targetSelectedKeys.filter((key) => targetOptions.some((option) => same(option.value, key)));
    const sourceChanged = !equalValues(nextSource, sourceSelectedKeys);
    const targetChanged = !equalValues(nextTarget, targetSelectedKeys);
    if (sourceChanged) setSourceSelectedKeys(nextSource);
    if (targetChanged) setTargetSelectedKeys(nextTarget);
    if (sourceChanged || targetChanged) onSelectChange?.(nextSource, nextTarget);
  }, [onSelectChange, sourceOptions, sourceSelectedKeys, targetOptions, targetSelectedKeys]);

  function select(direction: TransferDirection, value: T, checked: boolean) {
    const setter = direction === 'right' ? setSourceSelectedKeys : setTargetSelectedKeys;
    const selected = direction === 'right' ? sourceSelectedKeys : targetSelectedKeys;
    const next = checked ? [...selected, value] : without(selected, [value]);
    setter(next);
    onSelectChange?.(direction === 'right' ? next : sourceSelectedKeys, direction === 'left' ? next : targetSelectedKeys);
  }

  function selectAll(direction: TransferDirection, checked: boolean) {
    const visible = direction === 'right' ? visibleSource : visibleTarget;
    const selected = direction === 'right' ? sourceSelectedKeys : targetSelectedKeys;
    const visibleKeys = visible.filter((option) => !option.disabled).map((option) => option.value);
    const next = checked
      ? [...selected, ...visibleKeys.filter((key) => !includes(selected, key))]
      : without(selected, visibleKeys);
    if (direction === 'right') setSourceSelectedKeys(next);
    else setTargetSelectedKeys(next);
    onSelectChange?.(direction === 'right' ? next : sourceSelectedKeys, direction === 'left' ? next : targetSelectedKeys);
  }

  function move(direction: TransferDirection) {
    if (disabled || loading) return;
    const selected = direction === 'right' ? sourceSelectedKeys : targetSelectedKeys;
    const source = direction === 'right' ? sourceOptions : targetOptions;
    const moveKeys = selected.filter((key) => source.some((option) => same(option.value, key) && !option.disabled));
    if (moveKeys.length === 0) return;
    const nextKeys = direction === 'right'
      ? [...targetKeys, ...moveKeys.filter((key) => !includes(targetKeys, key))]
      : without(targetKeys, moveKeys);
    if (!controlled) setUncontrolledTargetKeys(nextKeys);
    if (direction === 'right') setSourceSelectedKeys([]);
    else setTargetSelectedKeys([]);
    onChange?.([...nextKeys], direction, [...moveKeys]);
  }

  function list(
    direction: TransferDirection,
    title: ReactNode,
    items: Option<T>[],
    visible: Option<T>[],
    selected: T[],
    search: string,
  ) {
    const selectable = visible.filter((option) => !option.disabled);
    const allSelected = selectable.length > 0 && selectable.every((option) => includes(selected, option.value));
    return (
      <section className="oxygen-transfer__panel">
        <div className="oxygen-transfer__header">
          <span>{title}</span>
          <span aria-live="polite">{selected.length}/{items.length}</span>
        </div>
        {showSearch ? (
          <Input
            aria-label={`${optionText(title)}搜索`}
            onChange={(event) => {
              const next = event.currentTarget.value;
              if (direction === 'right') setSourceSearch(next);
              else setTargetSearch(next);
              onSearch?.(next, direction);
            }}
            placeholder="搜索"
            type="search"
            value={search}
          />
        ) : null}
        <div className="oxygen-transfer__select-all">
          <Checkbox
            aria-label={`${optionText(title)}全选`}
            checked={allSelected}
            disabled={disabled || loading || selectable.length === 0}
            onCheckedChange={(checked) => selectAll(direction, checked === true)}
          />
          <span>全选</span>
        </div>
        <div aria-busy={loading || undefined} aria-label={`${ariaLabel}-${optionText(title)}`} className="oxygen-transfer__list" role="group">
          {loading ? <span className="oxygen-transfer__empty">加载中</span> : visible.length === 0 ? <span className="oxygen-transfer__empty">{items.length === 0 ? renderEmpty : '无匹配项'}</span> : visible.map((option) => (
            <label className={cn('oxygen-transfer__item', option.disabled && 'oxygen-transfer__item--disabled')} key={`${typeof option.value}:${String(option.value)}`}>
              <Checkbox
                aria-label={optionText(option.label) || undefined}
                checked={includes(selected, option.value)}
                disabled={disabled || loading || option.disabled}
                onCheckedChange={(checked) => select(direction, option.value, checked === true)}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      </section>
    );
  }

  return (
    <div {...props} aria-label={ariaLabel} className={cn('oxygen-transfer', className)} data-disabled={disabled || loading ? 'true' : undefined} ref={ref}>
      {list('right', sourceLabel, sourceOptions, visibleSource, sourceSelectedKeys, sourceSearch)}
      <div className="oxygen-transfer__actions">
        <Button aria-label={locale.transfer.toTarget} disabled={disabled || loading || sourceSelectedKeys.length === 0} onClick={() => move('right')} size="sm"><ArrowRight aria-hidden="true" className="oxygen-transfer__arrow" size={16} /></Button>
        <Button aria-label={locale.transfer.toSource} disabled={disabled || loading || targetSelectedKeys.length === 0} onClick={() => move('left')} size="sm"><ArrowLeft aria-hidden="true" className="oxygen-transfer__arrow" size={16} /></Button>
      </div>
      {list('left', targetLabel, targetOptions, visibleTarget, targetSelectedKeys, targetSearch)}
    </div>
  );
}

const TransferWithRef = forwardRef(TransferInner);
TransferWithRef.displayName = 'Transfer';
export const Transfer = TransferWithRef as <T = string>(props: TransferProps<T> & React.RefAttributes<HTMLDivElement>) => React.ReactElement | null;
