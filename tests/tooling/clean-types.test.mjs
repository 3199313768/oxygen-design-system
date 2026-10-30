import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { cp, mkdir, mkdtemp, rm, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const root = fileURLToPath(new URL('../..', import.meta.url));

test('patterns and Storybook typechecks work before any package dist has been built', async () => {
  const temporaryRoot = await mkdtemp(join(tmpdir(), 'oxygen-clean-types-'));
  try {
    await cp(join(root, 'tsconfig.base.json'), join(temporaryRoot, 'tsconfig.base.json'));
    await symlink(join(root, 'node_modules'), join(temporaryRoot, 'node_modules'), 'dir');
    for (const name of ['ui', 'patterns']) {
      const target = join(temporaryRoot, 'packages', name);
      await mkdir(target, { recursive: true });
      for (const path of ['src', 'tests', 'package.json', 'tsconfig.json', 'vite.config.ts', 'vitest.config.ts',
        ...(name === 'patterns' ? ['tsconfig.build.json'] : [])]) {
        await cp(join(root, 'packages', name, path), join(target, path), { recursive: true });
      }
    }
    await symlink(join(root, 'packages/ui/node_modules'), join(temporaryRoot, 'packages/ui/node_modules'), 'dir');
    const scope = join(temporaryRoot, 'packages/patterns/node_modules/@oxygen-design');
    await mkdir(scope, { recursive: true });
    await symlink(join(temporaryRoot, 'packages/ui'), join(scope, 'ui'), 'dir');
    const result = spawnSync(process.execPath, [join(root, 'node_modules/typescript/bin/tsc'),
      '--project', join(temporaryRoot, 'packages/patterns/tsconfig.json')],
    { cwd: temporaryRoot, encoding: 'utf8', timeout: 60000 });
    assert.ifError(result.error);
    assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);

    const storybook = join(temporaryRoot, 'apps/storybook');
    await mkdir(storybook, { recursive: true });
    for (const path of ['.storybook', 'stories', 'docs', 'package.json', 'tsconfig.json']) {
      await cp(join(root, 'apps/storybook', path), join(storybook, path), { recursive: true });
    }
    const dependencies = join(storybook, 'node_modules');
    await mkdir(dependencies);
    for (const name of ['@storybook', 'storybook', 'react', 'react-dom']) {
      await symlink(join(root, 'apps/storybook/node_modules', name), join(dependencies, name), 'dir');
    }
    const storybookScope = join(dependencies, '@oxygen-design');
    await mkdir(storybookScope);
    for (const name of ['ui', 'patterns']) {
      await symlink(join(temporaryRoot, 'packages', name), join(storybookScope, name), 'dir');
    }
    const storybookResult = spawnSync(process.execPath, [join(root, 'node_modules/typescript/bin/tsc'),
      '--project', join(storybook, 'tsconfig.json')],
    { cwd: temporaryRoot, encoding: 'utf8', timeout: 60000 });
    assert.ifError(storybookResult.error);
    assert.equal(storybookResult.status, 0, `${storybookResult.stdout}\n${storybookResult.stderr}`);
  } finally {
    await rm(temporaryRoot, { force: true, recursive: true });
  }
});
