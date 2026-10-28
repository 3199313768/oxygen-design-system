import { ChevronDown, ChevronRight, X } from 'lucide-react';
import { useId, useMemo, useState, type ButtonHTMLAttributes, type ReactNode } from 'react';

import { cn } from '../lib/cn';
import { useOxygenLocale } from './ConfigProvider';
import { Popover, PopoverContent, PopoverTrigger } from './Popover';
import type { TreeNode } from './shared';
import { flattenTree, treeReactKey, type TreeKey } from './tree-utils';

export interface CascaderProps<T extends TreeKey = string>
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'defaultValue' | 'onChange' | 'value'> {
  allowClear?: boolean;
  changeOnSelect?: boolean;
  defaultValue?: NoInfer<T>[];
  displayRender?: (labels: ReactNode[], nodes: TreeNode<T>[]) => ReactNode;
  emptyContent?: ReactNode;
  onChange?: (value: T[], nodes: TreeNode<T>[]) => void;
  options: TreeNode<T>[];
  placeholder?: ReactNode;
  value?: NoInfer<T>[];
}

export function Cascader<T extends TreeKey = string>({
  allowClear = true, changeOnSelect = false, className, defaultValue = [], disabled,
  displayRender, emptyContent, onChange, options, placeholder, value, ...props
}: CascaderProps<T>) {
  const locale = useOxygenLocale();
  const popupId = useId();
  const entries = useMemo(() => flattenTree(options), [options]);
  const [internalValue, setInternalValue] = useState(defaultValue);
  const selected = value ?? internalValue;
  const [open, setOpen] = useState(false);
  const [activePath, setActivePath] = useState<T[]>(selected);

  function resolvePath(keys: T[]) {
    return entries.find((entry) => entry.path.length === keys.length && entry.path.every((node, index) => node.key === keys[index]))?.path ?? [];
  }
  const selectedNodes = resolvePath(selected);
  const activeNodes = resolvePath(activePath);
  const columns: TreeNode<T>[][] = [options];
  for (const node of activeNodes) if (node.children?.length) columns.push(node.children);

  function change(nodes: TreeNode<T>[]) {
    if (disabled || nodes.some((node) => node.disabled)) return;
    const keys = nodes.map((node) => node.key);
    if (value === undefined) setInternalValue(keys);
    onChange?.(keys, nodes);
  }

  const selectedLabels = selectedNodes.map((node) => node.label);
  const label = displayRender ? displayRender(selectedLabels, selectedNodes)
    : selectedLabels.map((item, index) => <span key={index}>{index ? ' / ' : ''}{item}</span>);

  return <Popover open={open && !disabled} onOpenChange={(next) => { setOpen(next); if (next) setActivePath(selected); }}>
    <div className={cn('oxygen-hierarchy-select', className)}>
      <PopoverTrigger asChild>
        <button {...props} aria-controls={open ? popupId : undefined} aria-expanded={open && !disabled} aria-haspopup="dialog" className="oxygen-hierarchy-select__trigger" disabled={disabled} role="combobox" type="button">
          <span className={cn(!selectedNodes.length && 'oxygen-hierarchy-select__placeholder')}>{selectedNodes.length ? label : placeholder ?? locale.common.search}</span><ChevronDown aria-hidden="true" size={16} />
        </button>
      </PopoverTrigger>
      {allowClear && selected.length ? <button aria-label={locale.common.clear} className="oxygen-hierarchy-select__clear" disabled={disabled} onClick={() => { if (!disabled) { change([]); setActivePath([]); } }} type="button"><X aria-hidden="true" size={16} /></button> : null}
    </div>
    <PopoverContent align="start" aria-label={props['aria-label'] ?? locale.common.browse} className="oxygen-cascader__popup" id={popupId}>
      {options.length ? <div className="oxygen-cascader__columns">{columns.map((nodes, depth) => <ul aria-label={`${depth + 1}`} className="oxygen-cascader__column" key={depth}>
        {nodes.map((node) => <li key={treeReactKey(node.key)}><button
          aria-expanded={node.children?.length ? activePath[depth] === node.key : undefined}
          aria-current={selected[depth] === node.key && selected.slice(0, depth).every((key, index) => key === activePath[index]) ? 'true' : undefined}
          className="oxygen-cascader__option" data-active={activePath[depth] === node.key || undefined} disabled={disabled || node.disabled || activeNodes.slice(0, depth).some((parent) => parent.disabled)}
          onClick={() => {
            if (node.disabled || disabled) return;
            const keys = [...activePath.slice(0, depth), node.key];
            const path = resolvePath(keys);
            if (!path.length || path.some((parent) => parent.disabled)) return;
            setActivePath(keys);
            if (!node.children?.length || changeOnSelect) change(path);
            if (!node.children?.length) setOpen(false);
          }} type="button"
        >{node.label}{node.children?.length ? <ChevronRight aria-hidden="true" size={16} /> : null}</button></li>)}
      </ul>)}</div> : <div className="oxygen-tree__empty">{emptyContent ?? locale.common.noOptions}</div>}
    </PopoverContent>
  </Popover>;
}
