import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtemp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import test from 'node:test';
import { assertReleaseVersions, previewRelease } from '../../scripts/verify-initial-release.mjs';

const root = resolve(import.meta.dirname, '../..');
const changesetBinary = join(root, 'node_modules/.bin/changeset');

async function snapshot(directory) {
  const contents = {};
  for (const entry of await readdir(directory, { recursive: true, withFileTypes: true })) {
    if (!entry.isFile() || entry.parentPath.includes('/.git') || entry.name === '.git') continue;
    const path = join(entry.parentPath, entry.name);
    contents[path.slice(directory.length + 1)] = await readFile(path, 'utf8');
  }
  return contents;
}

async function fixture() {
  const directory = await mkdtemp(join(tmpdir(), 'oxygen-release-preview-test-'));
  for (const path of ['.changeset', 'packages/ui', 'packages/patterns', 'apps/internal']) {
    await mkdir(join(directory, path), { recursive: true });
  }
  await writeFile(join(directory, 'package.json'), JSON.stringify({ name: 'preview-fixture', private: true, packageManager: 'pnpm@11.9.0' }));
  await writeFile(join(directory, 'pnpm-workspace.yaml'), 'packages:\n  - packages/*\n  - apps/*\n');
  await writeFile(join(directory, 'pnpm-lock.yaml'), "lockfileVersion: '9.0'\n");
  await writeFile(join(directory, 'packages/ui/package.json'), JSON.stringify({ name: '@fixture/ui', version: '1.2.3' }));
  await writeFile(join(directory, 'packages/patterns/package.json'), JSON.stringify({ name: '@fixture/patterns', version: '3.4.5', peerDependencies: { '@fixture/ui': '~1.2.3' } }));
  await writeFile(join(directory, 'apps/internal/package.json'), JSON.stringify({ name: '@fixture/internal', version: '9.8.7', private: true, dependencies: { '@fixture/ui': 'workspace:*' } }));
  await writeFile(join(directory, 'packages/ui/CHANGELOG.md'), '# Prior releases\n');
  await writeFile(join(directory, '.changeset/config.json'), JSON.stringify({ changelog: false, commit: false, fixed: [], linked: [], access: 'public', baseBranch: 'main', updateInternalDependencies: 'patch', ignore: ['@fixture/internal'] }));
  await writeFile(join(directory, '.changeset/next.md'), '---\n"@fixture/ui": minor\n"@fixture/patterns": patch\n---\n\nFixture release.\n');
  for (const args of [['init', '--initial-branch=main'], ['add', '.'], ['-c', 'user.name=Preview Fixture', '-c', 'user.email=fixture@example.invalid', 'commit', '--no-gpg-sign', '-m', 'temporary fixture']]) {
    const result = spawnSync('git', args, { cwd: directory, encoding: 'utf8' });
    assert.equal(result.status, 0, result.stderr);
  }
  return directory;
}

test('previews all workspace releases and peer updates without changing source manifests, changesets, lock or changelog', async () => {
  const directory = await fixture();
  try {
    const before = await snapshot(directory);
    const result = await previewRelease({ repositoryRoot: directory, changesetBinary });
    assert.deepEqual(result.checkedPackages.sort(), ['@fixture/internal', '@fixture/patterns', '@fixture/ui', 'preview-fixture'].sort());
    assert.equal(result.releases.find((release) => release.name === '@fixture/ui').newVersion, '1.3.0');
    assert.equal(result.releases.filter((release) => release.type !== 'none').length, 2);
    assert.ok(result.releases.find((release) => release.name === '@fixture/patterns').newVersion !== '3.4.5');
    assert.deepEqual(result.dependencyUpdates.find((entry) => entry.package === '@fixture/patterns'), {
      package: '@fixture/patterns', field: 'peerDependencies', dependency: '@fixture/ui', previousRange: '~1.2.3', nextRange: '~1.3.0', plannedVersion: '1.3.0',
    });
    assert.deepEqual(await snapshot(directory), before);
  } finally { await rm(directory, { recursive: true, force: true }); }
});

test('release plan verification rejects a missing planned package or incorrect resulting version', async () => {
  const plan = { releases: [{ name: '@fixture/ui', oldVersion: '1.2.3', newVersion: '1.3.0' }] };
  assert.throws(() => assertReleaseVersions(plan, [{ name: '@fixture/ui', version: '1.2.3' }], []), /Missing.*@fixture\/ui/);
  assert.throws(() => assertReleaseVersions(plan, [{ name: '@fixture/ui', version: '1.2.3' }], [{ name: '@fixture/ui', version: '1.2.4' }]), /1.3.0.*1.2.4/);
  assert.throws(() => assertReleaseVersions(plan, [{ name: '@fixture/ui', version: '1.0.0' }], [{ name: '@fixture/ui', version: '1.3.0' }]), /oldVersion/);
});

test('a workspace without pending changesets is a read-only no-op', async () => {
  const directory = await fixture();
  try {
    await rm(join(directory, '.changeset/next.md'));
    const before = await snapshot(directory);
    const result = await previewRelease({ repositoryRoot: directory, changesetBinary });
    assert.deepEqual(result.releases, []);
    assert.deepEqual(result.dependencyUpdates, []);
    assert.deepEqual(await snapshot(directory), before);
  } finally { await rm(directory, { recursive: true, force: true }); }
});
