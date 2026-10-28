import { Cascader, Tree, TreeSelect, type TreeNode } from '../src';

const nodes: TreeNode<number>[] = [{ key: 1, label: 'Parent', children: [{ key: 2, label: 'Child' }] }];

export const numericTree = <Tree treeData={nodes} selectedKeys={[1]} onSelect={(keys) => { const key: number | undefined = keys[0]; void key; }} />;
export const numericTreeSelect = <TreeSelect treeData={nodes} value={2} onChange={(key) => { const value: number | undefined = key; void value; }} />;
export const numericCascader = <Cascader options={nodes} value={[1, 2]} onChange={(keys) => { const key: number | undefined = keys[0]; void key; }} />;

// @ts-expect-error Numeric tree keys cannot be replaced with DOM-style strings.
export const invalidTree = <Tree treeData={nodes} selectedKeys={['1']} />;
// @ts-expect-error Numeric TreeSelect values must remain numeric.
export const invalidTreeSelect = <TreeSelect treeData={nodes} value="1" />;
// @ts-expect-error Numeric Cascader path values must remain numeric.
export const invalidCascader = <Cascader options={nodes} value={['1']} />;
