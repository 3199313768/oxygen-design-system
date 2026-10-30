import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';
import test from 'node:test';
import * as tooling from '../../scripts/package-budgets.mjs';
const sizes = { js: { raw: 100, gzip: 60 }, css: { raw: 80, gzip: 50 } };
const limits = { js: { raw: 110, gzip: 65 }, css: { raw: 90, gzip: 55 } };
const options = { packageName: '@oxygen-design/ui', exportName: 'Button' };
const evidence = [{ id: '/consumer/node_modules/@oxygen-design/ui/dist/index.js', renderedExports: ['Button'] }];

test('measures emitted JS and CSS recursively, excluding sourcemaps and metadata', async () => {
  assert.equal(typeof tooling.measureArtifacts, 'function');
  const root = await mkdtemp(join(tmpdir(), 'oxygen-budget-test-'));
  try {
    await mkdir(join(root, 'assets'));
    await writeFile(join(root, 'assets/a.js'), 'const answer = 42;');
    await writeFile(join(root, 'assets/a.css'), '.button { color: red; }');
    await writeFile(join(root, 'assets/a.js.map'), 'not delivered code');
    await writeFile(join(root, 'report.json'), '{}');
    const actual = await tooling.measureArtifacts(root);
    assert.deepEqual(actual.js, { raw: 18, gzip: gzipSync('const answer = 42;', { level: 9 }).length });
    assert.deepEqual(actual.css, { raw: 23, gzip: gzipSync('.button { color: red; }', { level: 9 }).length });
    await rm(join(root, 'assets/a.css'));
    await assert.rejects(tooling.measureArtifacts(root), /Missing CSS/);
  } finally { await rm(root, { recursive: true, force: true }); }
});

test('fixed budgets reject raw and gzip overages independently and reject missing categories', () => {
  assert.equal(typeof tooling.assertBudgets, 'function');
  assert.doesNotThrow(() => tooling.assertBudgets(sizes, limits, 'button'));
  assert.throws(() => tooling.assertBudgets({ ...sizes, js: { ...sizes.js, raw: 111 } }, limits, 'button'), /button.*js.raw.*111.*110/);
  assert.throws(() => tooling.assertBudgets({ ...sizes, css: { ...sizes.css, gzip: 56 } }, limits, 'button'), /button.*css.gzip.*56.*55/);
  assert.throws(() => tooling.assertBudgets({ js: sizes.js }, limits, 'button'), /Missing.*css/);
  assert.throws(() => tooling.assertBudgets(sizes, { js: limits.js }, 'button'), /Missing.*css/);
  assert.throws(() => tooling.assertBudgets(sizes, { ...limits, js: { raw: null, gzip: 65 } }, 'button'), /Invalid.*js.raw/);
});

test('minimal consumer requires its selected export and rejects other rendered exports', () => {
  assert.equal(typeof tooling.assertTreeShaken, 'function');
  assert.doesNotThrow(() => tooling.assertTreeShaken(evidence, 'oxygen-button', options));
  assert.throws(() => tooling.assertTreeShaken([], '', options), /Missing.*ui.*entry/);
  assert.throws(() => tooling.assertTreeShaken([{ ...evidence[0], renderedExports: [] }], '', options), /Missing.*Button/);
  assert.throws(() => tooling.assertTreeShaken([{ ...evidence[0], renderedExports: ['Button', 'ColorPicker'] }], '', options), /Unexpected.*ColorPicker/);
});

test('minimal consumer rejects unrelated dependency code and retained JS despite narrowed exports', () => {
  assert.equal(typeof tooling.assertTreeShaken, 'function');
  for (const dependency of ['qrcode.react', 'react-day-picker', '@radix-ui/react-select']) {
    assert.throws(() => tooling.assertTreeShaken([...evidence, { id: `/node_modules/${dependency}/dist/index.js`, renderedExports: [] }], 'oxygen-button', options), /Unrelated module/);
  }
  for (const marker of ['oxygen-color-picker', 'oxygen-calendar', 'oxygen-qrcode']) {
    assert.throws(() => tooling.assertTreeShaken(evidence, `const x = '${marker}';`, options), /Unrelated JS/);
  }
  assert.doesNotThrow(() => tooling.assertTreeShaken([...evidence, { id: '/node_modules/@radix-ui/react-slot/dist/index.js', renderedExports: ['Slot'] }], 'oxygen-button', options));
});

test('single Pattern excludes sibling component implementations', () => {
  assert.equal(typeof tooling.assertTreeShaken, 'function');
  const patternOptions = { packageName: '@oxygen-design/patterns', exportName: 'EmptyState' };
  const modules = [{ id: '/node_modules/@oxygen-design/patterns/dist/index.js', renderedExports: ['EmptyState'] }];
  assert.doesNotThrow(() => tooling.assertTreeShaken(modules, 'oxygen-empty-state', patternOptions));
  for (const marker of ['oxygen-page-header', 'oxygen-app-shell', 'oxygen-status-message']) {
    assert.throws(() => tooling.assertTreeShaken(modules, marker, patternOptions), /Unrelated JS/);
  }
});

test('preserved modules prove selected implementation exists even when its reexport barrel disappears', () => {
  const selected = [{ id: '/node_modules/@oxygen-design/ui/dist/components/Button.js', renderedExports: ['Button'] }];
  assert.doesNotThrow(() => tooling.assertTreeShaken(selected, 'oxygen-button', options));
  // Button uses its own variant builder; its exported binding can remain internally referenced.
  assert.doesNotThrow(() => tooling.assertTreeShaken([{ ...selected[0], renderedExports: ['Button', 'buttonVariants'] }], 'oxygen-button', options));
  assert.throws(() => tooling.assertTreeShaken([...selected, {
    id: '/node_modules/@oxygen-design/ui/dist/components/ColorPicker.js', renderedExports: [],
  }], 'oxygen-button', options), /Unrelated module/);
  assert.throws(() => tooling.assertTreeShaken([{ ...selected[0], renderedExports: [] }], '', options), /Missing.*Button/);
});

test('CI cannot bypass fixed budgets with the local measurement switch', () => {
  assert.equal(typeof tooling.isMeasurementOnly, 'function');
  assert.equal(tooling.isMeasurementOnly({ OXYGEN_PACKAGE_MEASURE_ONLY: '1' }), true);
  assert.equal(tooling.isMeasurementOnly({ CI: 'true' }), false);
  assert.throws(() => tooling.isMeasurementOnly({ CI: 'true', OXYGEN_PACKAGE_MEASURE_ONLY: '1' }), /CI.*bypass/);
});

test('packed MIT metadata and license must match the repository license text', async () => {
  assert.equal(typeof tooling.verifyPackedLicense, 'function');
  const directory = await mkdtemp(join(tmpdir(), 'oxygen-license-test-'));
  try {
    const license = await readFile(new URL('../../LICENSE', import.meta.url), 'utf8');
    await writeFile(join(directory, 'LICENSE'), license);
    await writeFile(join(directory, 'package.json'), JSON.stringify({ license: 'MIT' }));
    await assert.doesNotReject(tooling.verifyPackedLicense(directory));
    await writeFile(join(directory, 'LICENSE'), 'incomplete license');
    await assert.rejects(tooling.verifyPackedLicense(directory), /license text/);
    await writeFile(join(directory, 'LICENSE'), license);
    await writeFile(join(directory, 'package.json'), JSON.stringify({ license: 'UNLICENSED' }));
    await assert.rejects(tooling.verifyPackedLicense(directory), /MIT metadata/);
  } finally { await rm(directory, { recursive: true, force: true }); }
});

test('budget command exits nonzero on a real oversized report', async () => {
  const root = await mkdtemp(join(tmpdir(), 'oxygen-budget-cli-'));
  try {
    await writeFile(join(root, 'report.json'), JSON.stringify({ package: sizes, consumer: sizes }));
    await writeFile(join(root, 'budgets.json'), JSON.stringify({ ui: { package: { ...limits, js: { raw: 1, gzip: 65 } }, consumer: limits } }));
    const command = spawnSync(process.execPath, ['scripts/package-budgets.mjs', join(root, 'report.json'), join(root, 'budgets.json'), 'ui'], { encoding: 'utf8' });
    assert.equal(command.status, 1);
    assert.match(command.stderr, /ui.package.*js.raw.*100.*1/);
    assert.equal(command.error, undefined);
    assert.ok(await readFile(join(root, 'report.json'), 'utf8'));
  } finally { await rm(root, { recursive: true, force: true }); }
});
