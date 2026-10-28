import { ChevronDown, ChevronRight } from 'lucide-react';
import { useId, useMemo, useRef, useState, type HTMLAttributes, type ReactNode } from 'react';

import { cn } from '../lib/cn';
import { Checkbox } from './Checkbox';
import { useOxygenLocale } from './ConfigProvider';
import type { TreeNode } from './shared';
import { flattenTree, treeNodeText, treeReactKey, type TreeKey } from './tree-utils';

export interface TreeProps<T extends TreeKey = string>
  extends Omit<HTMLAttributes<HTMLUListElement>, 'onSelect'> {
  checkable?: boolean;
  checkedKeys?: NoInfer<T>[];
  defaultCheckedKeys?: NoInfer<T>[];
  defaultExpandAll?: boolean;
  defaultExpandedKeys?: NoInfer<T>[];
  defaultSelectedKeys?: NoInfer<T>[];
  disabled?: boolean;
  emptyContent?: ReactNode;
  expandedKeys?: NoInfer<T>[];
  multiple?: boolean;
  onCheck?: (keys: T[], nodes: TreeNode<T>[]) => void;
  onExpand?: (keys: T[], node: TreeNode<T>) => void;
  onSelect?: (keys: T[], node: TreeNode<T>) => void;
  selectedKeys?: NoInfer<T>[];
  treeData: TreeNode<T>[];
}

export function Tree<T extends TreeKey = string>({
  checkable = false, checkedKeys, className, defaultCheckedKeys = [], defaultExpandAll = false,
  defaultExpandedKeys = [], defaultSelectedKeys = [], disabled = false, emptyContent,
  expandedKeys, multiple = false, onCheck, onExpand, onSelect, selectedKeys, treeData, ...props
}: TreeProps<T>) {
  const locale = useOxygenLocale();
  const id = useId();
  const entries = useMemo(() => flattenTree(treeData), [treeData]);
  const labelIds = useMemo(() => new Map(entries.map(({ node }, index) => [node.key, `${id}-label-${index}`])), [entries, id]);
  const [internalExpanded, setInternalExpanded] = useState<T[]>(() => defaultExpandAll
    ? entries.filter(({ node }) => node.children?.length).map(({ node }) => node.key)
    : defaultExpandedKeys);
  const [internalSelected, setInternalSelected] = useState(defaultSelectedKeys);
  const [internalChecked, setInternalChecked] = useState(defaultCheckedKeys);
  const [activeKey, setActiveKey] = useState<T>();
  const itemRefs = useRef(new Map<T, HTMLLIElement>());
  const expanded = expandedKeys ?? internalExpanded;
  const selected = selectedKeys ?? internalSelected;
  const rawChecked = checkedKeys ?? internalChecked;
  const checked = new Set<T>();
  for (const entry of entries) {
    if (!entry.disabled && entry.path.some((node) => rawChecked.includes(node.key))) checked.add(entry.node.key);
  }
  for (const entry of [...entries].reverse()) {
    const children = entries.filter((child) => !child.disabled && child.path.at(-2) === entry.node);
    if (!entry.disabled && children.length && children.every((child) => checked.has(child.node.key))) checked.add(entry.node.key);
  }
  const visible = entries.filter((entry) => entry.path.slice(0, -1).every((node) => expanded.includes(node.key)));
  const focusable = visible.filter((entry) => !disabled && !entry.disabled);
  const focusKey = focusable.some(({ node }) => node.key === activeKey) ? activeKey : focusable[0]?.node.key;

  function expand(node: TreeNode<T>, next: boolean) {
    const keys = next ? [...expanded, node.key] : expanded.filter((key) => key !== node.key);
    if (expandedKeys === undefined) setInternalExpanded(keys);
    onExpand?.(keys, node);
  }

  function select(node: TreeNode<T>) {
    const keys = multiple ? selected.includes(node.key)
      ? selected.filter((key) => key !== node.key) : [...selected, node.key] : [node.key];
    if (selectedKeys === undefined) setInternalSelected(keys);
    onSelect?.(keys, node);
  }

  function check(node: TreeNode<T>) {
    const next = new Set(checked);
    const remove = checked.has(node.key);
    for (const entry of entries) {
      if (!entry.disabled && entry.path.includes(node)) {
        if (remove) next.delete(entry.node.key);
        else next.add(entry.node.key);
      }
    }
    for (const entry of [...entries].reverse()) {
      const children = entries.filter((child) => !child.disabled && child.path.at(-2) === entry.node);
      if (!entry.disabled && children.length) {
        if (children.every((child) => next.has(child.node.key))) next.add(entry.node.key);
        else next.delete(entry.node.key);
      }
    }
    const checkedEntries = entries.filter((entry) => next.has(entry.node.key));
    const keys = checkedEntries.map((entry) => entry.node.key);
    if (checkedKeys === undefined) setInternalChecked(keys);
    onCheck?.(keys, checkedEntries.map((entry) => entry.node));
  }

  function focus(key: T | undefined) {
    if (key === undefined) return;
    setActiveKey(key);
    itemRefs.current.get(key)?.focus();
  }

  function renderNodes(nodes: TreeNode<T>[], inheritedDisabled = false): ReactNode {
    return nodes.map((node) => {
      const isDisabled = disabled || inheritedDisabled || !!node.disabled;
      const hasChildren = !!node.children?.length;
      const isExpanded = expanded.includes(node.key);
      const labelId = labelIds.get(node.key);
      const partial = !checked.has(node.key) && entries.some((entry) => !entry.disabled && entry.path.includes(node) && checked.has(entry.node.key));
      return (
        <li
          aria-checked={checkable ? partial ? 'mixed' : checked.has(node.key) : undefined}
          aria-disabled={isDisabled || undefined}
          aria-expanded={hasChildren ? isExpanded : undefined}
          aria-labelledby={labelId}
          aria-selected={selected.includes(node.key)}
          className="oxygen-tree__item"
          key={treeReactKey(node.key)}
          onFocus={(event) => { if (event.target === event.currentTarget) setActiveKey(node.key); }}
          onKeyDown={(event) => {
            if (event.target !== event.currentTarget || isDisabled) return;
            const index = focusable.findIndex((entry) => entry.node === node);
            const handled = ['ArrowDown', 'ArrowUp', 'ArrowRight', 'ArrowLeft', 'Home', 'End', 'Enter', ' '].includes(event.key);
            if (handled) { event.preventDefault(); event.stopPropagation(); }
            if (event.key === 'ArrowDown') focus(focusable[index + 1]?.node.key);
            if (event.key === 'ArrowUp') focus(focusable[index - 1]?.node.key);
            if (event.key === 'Home') focus(focusable[0]?.node.key);
            if (event.key === 'End') focus(focusable.at(-1)?.node.key);
            if (event.key === 'ArrowRight' && hasChildren) {
              if (!isExpanded) expand(node, true);
              else focus(focusable[index + 1]?.node.key);
            }
            if (event.key === 'ArrowLeft') {
              if (hasChildren && isExpanded) expand(node, false);
              else focus(entries.find((entry) => entry.node === node)?.path.at(-2)?.key);
            }
            if (event.key === 'Enter' || (event.key === ' ' && !checkable)) select(node);
            if (event.key === ' ' && checkable) check(node);
          }}
          ref={(element) => { if (element) itemRefs.current.set(node.key, element); else itemRefs.current.delete(node.key); }}
          role="treeitem"
          tabIndex={focusKey === node.key ? 0 : -1}
        >
          <div className="oxygen-tree__row" data-disabled={isDisabled || undefined} data-selected={selected.includes(node.key) || undefined}>
            {hasChildren ? <button
              aria-label={`${isExpanded ? locale.common.collapse : locale.common.expand} ${treeNodeText(node)}`}
              className="oxygen-tree__toggle" disabled={isDisabled} tabIndex={-1} type="button"
              onClick={() => { focus(node.key); expand(node, !isExpanded); }}
            >{isExpanded ? <ChevronDown aria-hidden="true" size={16} /> : <ChevronRight aria-hidden="true" size={16} />}</button> : <span className="oxygen-tree__spacer" />}
            {checkable ? <Checkbox aria-label={treeNodeText(node) || undefined} aria-labelledby={treeNodeText(node) ? undefined : labelId} checked={partial ? 'indeterminate' : checked.has(node.key)} disabled={isDisabled} onCheckedChange={() => { focus(node.key); check(node); }} tabIndex={-1} /> : null}
            <button aria-label={treeNodeText(node) || undefined} className="oxygen-tree__label" disabled={isDisabled} id={labelId} onClick={() => { focus(node.key); select(node); }} tabIndex={-1} type="button">{node.label}</button>
          </div>
          {hasChildren && isExpanded ? <ul className="oxygen-tree__group" role="group">{renderNodes(node.children!, isDisabled)}</ul> : null}
        </li>
      );
    });
  }

  return <ul {...props} aria-disabled={disabled || undefined} aria-multiselectable={multiple || undefined} className={cn('oxygen-tree', className)} role="tree">
    {treeData.length ? renderNodes(treeData) : <li className="oxygen-tree__empty" role="none">{emptyContent ?? locale.common.empty}</li>}
  </ul>;
}
