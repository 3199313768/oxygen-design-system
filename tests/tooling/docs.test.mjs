import assert from 'node:assert/strict';
import { mkdtemp, writeFile, mkdir, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';

const load = () => import('../../scripts/docs-api.mjs');

test('API extraction resolves workspace source types before package dist exists', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'oxygen-docs-workspace-'));
  try {
    await mkdir(path.join(root, 'packages/ui/src/components'), { recursive: true });
    await mkdir(path.join(root, 'packages/patterns/src/components'), { recursive: true });
    await writeFile(path.join(root, 'packages/ui/src/index.ts'), "export type { SharedProps } from './components/Shared';");
    await writeFile(path.join(root, 'packages/ui/src/components/Shared.ts'), 'export interface SharedProps { label: string; disabled?: boolean }');
    await writeFile(path.join(root, 'packages/patterns/src/index.ts'), "export { Sample } from './components/Sample';");
    await writeFile(path.join(root, 'packages/patterns/src/components/Sample.ts'), "import type { SharedProps } from '@oxygen-design/ui'; export function Sample(props: SharedProps) { return props.label; }");
    const { extractApi } = await load();
    const [family] = extractApi(root);
    const props = family.exports[0].props;
    assert.equal(family.module, '@oxygen-design/patterns');
    assert.equal(props.find((prop) => prop.name === 'label').required, true);
    assert.equal(props.find((prop) => prop.name === 'disabled').type, 'boolean | undefined');
  } finally { await rm(root, { recursive: true, force: true }); }
});

test('API extraction preserves required, inherited and callback props, defaults and compound exports', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'oxygen-docs-api-'));
  try {
    await mkdir(path.join(root, 'packages/ui/src/components'), { recursive: true });
    await writeFile(path.join(root, 'packages/ui/src/index.ts'), "export { Sample, SampleChild } from './components/Sample'; export type { Item } from './components/Sample';");
    await writeFile(path.join(root, 'packages/ui/src/components/Sample.ts'), `
      interface Native { id?: string }
      export interface Item { key: string; label: string }
      interface Props extends Native { label: string; disabled?: boolean; onChange?: (value: string) => void; items?: Item[] }
      export function Sample({label, disabled = false}: Props) { return label + disabled; }
      export function SampleChild(props: { required: number }) { return props.required; }
    `);
    const { extractApi } = await load();
    const [family] = extractApi(root);
    assert.equal(family.name, 'Sample');
    assert.deepEqual(family.exports.map((entry) => entry.name), ['Sample', 'SampleChild']);
    const properties = family.exports[0].props;
    assert.equal(properties.find((entry) => entry.name === 'label').required, true);
    assert.equal(properties.find((entry) => entry.name === 'disabled').defaultValue, 'false');
    assert.equal(properties.find((entry) => entry.name === 'id').required, false);
    assert.match(properties.find((entry) => entry.name === 'onChange').type, /value: string/);
    assert.equal(family.exports[1].props[0].name, 'required');
    assert.equal(family.types.find((entry) => entry.name === 'Item').declaration.includes('key: string'), true);
    assert.equal(JSON.stringify(family).includes(root), false, 'public data must not leak a local absolute path');
  } finally { await rm(root, { recursive: true, force: true }); }
});

test('copy source retains the real implementation and safely quotes edited text', async () => {
  const { exampleSource } = await import('../../apps/storybook/docs/source-code.mjs');
  const source = exampleSource('export function Example(props: { children: string }) { return <button>{props.children}</button>; }', { children: '"quoted"\n</script><script>alert(1)</script>' });
  assert.match(source, /export function Example/);
  assert.match(source, /export default function Playground/);
  assert.equal(source.includes('"children": "\\"quoted\\"\\n</script><script>alert(1)</script>"'), true);
});

test('documentation gate catches an undocumented public family and missing playground', async () => {
  const { validateCoverage } = await import('../../scripts/check-docs.mjs');
  const errors = validateCoverage([{ name: 'Button' }, { name: 'Select' }], [{ name: 'Button' }], {});
  assert.equal(errors.some((error) => error.includes('Select') && error.includes('文档')), true);
  assert.equal(errors.some((error) => error.includes('Button') && error.includes('Playground')), true);
});

test('API generation refuses incomplete types when a runtime dependency cannot resolve', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'oxygen-docs-missing-'));
  try {
    await mkdir(path.join(root, 'packages/ui/src/components'), { recursive: true });
    await writeFile(path.join(root, 'packages/ui/src/index.ts'), "export { Sample } from './components/Sample';");
    await writeFile(path.join(root, 'packages/ui/src/components/Sample.ts'), "import type { Props } from 'missing-docs-dependency'; export function Sample(props: Props) { return props; }");
    const { extractApi } = await load();
    assert.throws(() => extractApi(root), /missing-docs-dependency/);
  } finally { await rm(root, { recursive: true, force: true }); }
});
