import { describe, expect, it } from 'vitest';

import { createTreeIndex } from '../src/components/tree-utils';

describe('tree index', () => {
  it('indexes direct children and descendants for one-pass tree state derivation', () => {
    const root = { key: 'root', label: 'Root', children: [
      { key: 'child', label: 'Child', children: [{ key: 'leaf', label: 'Leaf' }] },
    ] };
    const index = createTreeIndex([root]);

    expect(index.entryByNode.get(root)).toEqual(index.entries[0]);
    expect(index.childrenByNode.get(root)?.map(({ node }) => node.key)).toEqual(['child']);
    expect(index.descendantsByNode.get(root)?.map(({ node }) => node.key)).toEqual(['child', 'leaf']);
  });
});
