import { Fragment, isValidElement, type ReactNode } from 'react';

import type { TreeNode } from './shared';

export type TreeKey = string | number;

export interface TreeEntry<T extends TreeKey> {
  disabled: boolean;
  node: TreeNode<T>;
  path: TreeNode<T>[];
}

// All consumers share this traversal so keys never round-trip through DOM strings.
export function flattenTree<T extends TreeKey>(nodes: TreeNode<T>[]): TreeEntry<T>[] {
  const entries: TreeEntry<T>[] = [];
  function visit(items: TreeNode<T>[], path: TreeNode<T>[], disabled: boolean) {
    for (const node of items) {
      const nextPath = [...path, node];
      const nextDisabled = disabled || !!node.disabled;
      entries.push({ disabled: nextDisabled, node, path: nextPath });
      if (node.children) visit(node.children, nextPath, nextDisabled);
    }
  }
  visit(nodes, [], false);
  return entries;
}

export function treeLabelText(label: ReactNode): string {
  if (typeof label === 'string' || typeof label === 'number') return String(label);
  if (Array.isArray(label)) return label.map(treeLabelText).join('');
  if (isValidElement<{ children?: ReactNode; 'aria-hidden'?: boolean | 'true' | 'false' }>(label)
    && (typeof label.type === 'string' || label.type === Fragment)) {
    if (label.props['aria-hidden'] === true || label.props['aria-hidden'] === 'true') return '';
    return treeLabelText(label.props.children);
  }
  return '';
}

export function treeNodeText<T>(node: TreeNode<T>) {
  return (node.textValue ?? treeLabelText(node.label)).replace(/\s+/g, ' ').trim();
}

export function treeReactKey(key: TreeKey) {
  return `${typeof key}:${key}`;
}
