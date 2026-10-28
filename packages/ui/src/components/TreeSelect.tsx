import { ChevronDown, X } from 'lucide-react';
import { useId, useMemo, useState, type ButtonHTMLAttributes, type ReactNode } from 'react';

import { cn } from '../lib/cn';
import { useOxygenLocale } from './ConfigProvider';
import { Input } from './Input';
import { Popover, PopoverContent, PopoverTrigger } from './Popover';
import type { TreeNode } from './shared';
import { Tree } from './Tree';
import { flattenTree, treeNodeText, type TreeKey } from './tree-utils';

export interface TreeSelectProps<T extends TreeKey = string>
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'defaultValue' | 'onChange' | 'value'> {
  allowClear?: boolean;
  defaultExpandAll?: boolean;
  defaultValue?: NoInfer<T>;
  emptyContent?: ReactNode;
  onChange?: (value: T | undefined, node?: TreeNode<T>) => void;
  onSearch?: (query: string) => void;
  placeholder?: ReactNode;
  searchable?: boolean;
  treeData: TreeNode<T>[];
  value?: NoInfer<T>;
}

export function TreeSelect<T extends TreeKey = string>(allProps: TreeSelectProps<T>) {
  const {
    allowClear = true, className, defaultExpandAll, defaultValue, disabled, emptyContent,
    onChange, onSearch, placeholder, searchable = true, treeData, value, ...props
  } = allProps;
  const locale = useOxygenLocale();
  const treeId = useId();
  const controlled = 'value' in allProps;
  const [internalValue, setInternalValue] = useState(defaultValue);
  const selectedValue = controlled ? value : internalValue;
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [searchExpandedKeys, setSearchExpandedKeys] = useState<T[]>();
  const entries = useMemo(() => flattenTree(treeData), [treeData]);
  const selectedNode = entries.find((entry) => entry.node.key === selectedValue)?.node;
  const matches = entries.filter((entry) => treeNodeText(entry.node).toLocaleLowerCase().includes(query.toLocaleLowerCase()));
  const visibleKeys = new Set(matches.flatMap((entry) => entry.path.map((node) => node.key)));
  const expandedKeys = Array.from(new Set(matches.flatMap((entry) => entry.path.slice(0, -1).map((node) => node.key))));

  function filter(nodes: TreeNode<T>[]): TreeNode<T>[] {
    return nodes.filter((node) => visibleKeys.has(node.key)).map((node) => ({
      ...node, children: node.children ? filter(node.children) : undefined,
    }));
  }

  function change(next: T | undefined) {
    const entry = entries.find((item) => item.node.key === next);
    if (disabled || entry?.disabled) return;
    if (!controlled) setInternalValue(next);
    onChange?.(next, entry?.node);
    setOpen(false);
    setQuery('');
  }

  return <Popover open={open && !disabled} onOpenChange={(next) => { setOpen(next); if (!next) setQuery(''); }}>
    <div className={cn('oxygen-hierarchy-select', className)}>
      <PopoverTrigger asChild>
        <button {...props} aria-controls={open ? treeId : undefined} aria-expanded={open && !disabled} aria-haspopup="tree" className="oxygen-hierarchy-select__trigger" disabled={disabled} role="combobox" type="button">
          <span className={cn(!selectedNode && 'oxygen-hierarchy-select__placeholder')}>{selectedNode?.label ?? placeholder ?? locale.common.search}</span>
          <ChevronDown aria-hidden="true" size={16} />
        </button>
      </PopoverTrigger>
      {allowClear && selectedValue !== undefined ? <button aria-label={locale.common.clear} className="oxygen-hierarchy-select__clear" disabled={disabled} onClick={() => change(undefined)} type="button"><X aria-hidden="true" size={16} /></button> : null}
    </div>
    <PopoverContent align="start" aria-label={props['aria-label'] ?? locale.common.search} className="oxygen-hierarchy-select__popup">
      {searchable ? <Input aria-label={locale.common.search} onChange={(event) => { setQuery(event.currentTarget.value); setSearchExpandedKeys(undefined); onSearch?.(event.currentTarget.value); }} placeholder={locale.common.search} type="search" value={query} /> : null}
      <Tree
        aria-label={props['aria-label'] ?? locale.common.search}
        defaultExpandAll={defaultExpandAll}
        emptyContent={emptyContent ?? locale.common.noOptions}
        expandedKeys={query ? searchExpandedKeys ?? expandedKeys : undefined}
        id={treeId}
        onExpand={(keys) => { if (query) setSearchExpandedKeys(keys); }}
        onSelect={(keys) => change(keys[0])}
        selectedKeys={selectedValue === undefined ? [] : [selectedValue]}
        treeData={query ? filter(treeData) : treeData}
      />
    </PopoverContent>
  </Popover>;
}
