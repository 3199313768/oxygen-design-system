import { forwardRef, useEffect, useMemo, useState, type HTMLAttributes, type Key, type ReactNode } from 'react';

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
  itemKey?: (option: Option<T>) => Key;
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

interface OptionIndex<T> {
  negativeZero: Option<T>[];
  values: Map<T, Option<T>[]>;
}

function isNegativeZero<T>(value: T) {
  return typeof value === 'number' && Object.is(value, -0);
}

function createOptionIndex<T>(options: Option<T>[]): OptionIndex<T> {
  const index: OptionIndex<T> = { negativeZero: [], values: new Map() };
  options.forEach((option) => {
    if (isNegativeZero(option.value)) {
      index.negativeZero.push(option);
      return;
    }
    const matchingOptions = index.values.get(option.value) ?? [];
    matchingOptions.push(option);
    index.values.set(option.value, matchingOptions);
  });
  return index;
}

function getIndexedOptions<T>(index: OptionIndex<T>, value: T) {
  return isNegativeZero(value) ? index.negativeZero : index.values.get(value) ?? [];
}

interface ValueLookup<T> {
  negativeZero: boolean;
  values: Set<T>;
}

function createValueLookup<T>(values: T[]): ValueLookup<T> {
  const lookup: ValueLookup<T> = { negativeZero: false, values: new Set() };
  values.forEach((value) => {
    if (isNegativeZero(value)) lookup.negativeZero = true;
    else lookup.values.add(value);
  });
  return lookup;
}

function hasValue<T>(lookup: ValueLookup<T>, value: T) {
  return isNegativeZero(value) ? lookup.negativeZero : lookup.values.has(value);
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
  'aria-label': ariaLabel,
  className,
  dataSource,
  defaultTargetKeys = [],
  disabled = false,
  filterOption,
  loading = false,
  onChange,
  onSearch,
  onSelectChange,
  renderEmpty,
  showSearch = false,
  sourceItems,
  sourceTitle,
  targetKeys: targetKeysProp,
  targetTitle,
  itemKey,
  titles,
  ...props
}: TransferProps<T>, ref: React.ForwardedRef<HTMLDivElement>) {
  const locale = useOxygenLocale();
  const ariaLabelText = ariaLabel ?? locale.transfer.label;
  const options = useMemo(() => sourceItems ?? dataSource ?? [], [sourceItems, dataSource]);
  const controlled = targetKeysProp !== undefined;
  const [uncontrolledTargetKeys, setUncontrolledTargetKeys] = useState<T[]>([...defaultTargetKeys]);
  const targetKeys = targetKeysProp ?? uncontrolledTargetKeys;
  const [sourceSelectedKeys, setSourceSelectedKeys] = useState<T[]>([]);
  const [targetSelectedKeys, setTargetSelectedKeys] = useState<T[]>([]);
  const [sourceSearch, setSourceSearch] = useState('');
  const [targetSearch, setTargetSearch] = useState('');
  const sourceLabel = titles?.[0] ?? sourceTitle ?? locale.transfer.source;
  const targetLabel = titles?.[1] ?? targetTitle ?? locale.transfer.target;

  function optionKey(option: Option<T>, index: number) {
    if (itemKey) return itemKey(option);
    if (typeof option.value === 'string' || typeof option.value === 'number') {
      return `${typeof option.value}:${String(option.value)}`;
    }
    return `index:${index}`;
  }

  const optionIndex = useMemo(() => createOptionIndex(options), [options]);
  const targetValueLookup = useMemo(() => createValueLookup(targetKeys), [targetKeys]);
  const sourceOptions = useMemo(
    () => options.filter((option) => !hasValue(targetValueLookup, option.value)),
    [options, targetValueLookup],
  );
  const targetOptions = useMemo(
    () => targetKeys.flatMap((key) => getIndexedOptions(optionIndex, key)),
    [optionIndex, targetKeys],
  );
  const sourceOptionIndex = useMemo(() => createOptionIndex(sourceOptions), [sourceOptions]);
  const targetOptionIndex = useMemo(() => createOptionIndex(targetOptions), [targetOptions]);

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
    const sourceIndex = direction === 'right' ? sourceOptionIndex : targetOptionIndex;
    const moveKeys = selected.filter((key) => getIndexedOptions(sourceIndex, key).some((option) => !option.disabled));
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
    const partiallySelected = !allSelected && selectable.some((option) => includes(selected, option.value));
    return (
      <section className="oxygen-transfer__panel">
        <div className="oxygen-transfer__header">
          <span>{title}</span>
          <span aria-live="polite">{selected.length}/{items.length}</span>
        </div>
        {showSearch ? (
          <Input
            aria-label={`${optionText(title)}${locale.common.search}`}
            onChange={(event) => {
              const next = event.currentTarget.value;
              if (direction === 'right') setSourceSearch(next);
              else setTargetSearch(next);
              onSearch?.(next, direction);
            }}
            placeholder={locale.common.search}
            type="search"
            value={search}
          />
        ) : null}
        <div className="oxygen-transfer__select-all">
          <Checkbox
            aria-label={`${optionText(title)}${locale.transfer.selectAll}`}
            checked={partiallySelected ? 'indeterminate' : allSelected}
            disabled={disabled || loading || selectable.length === 0}
            onCheckedChange={(checked) => selectAll(direction, checked === true)}
          />
          <span>{locale.transfer.selectAll}</span>
        </div>
        <div aria-busy={loading || undefined} aria-label={`${ariaLabelText}-${optionText(title)}`} className="oxygen-transfer__list" role="group">
          {loading ? <span className="oxygen-transfer__empty">{locale.common.loading}</span> : visible.length === 0 ? <span className="oxygen-transfer__empty">{items.length === 0 ? renderEmpty ?? locale.common.empty : locale.transfer.noMatch}</span> : visible.map((option, index) => (
            <label className={cn('oxygen-transfer__item', option.disabled && 'oxygen-transfer__item--disabled')} key={optionKey(option, index)}>
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
    <div {...props} aria-label={ariaLabelText} className={cn('oxygen-transfer', className)} data-disabled={disabled || loading ? 'true' : undefined} ref={ref}>
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
