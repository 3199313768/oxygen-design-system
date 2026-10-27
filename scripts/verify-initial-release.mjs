import { cp, mkdir, mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const repositoryRoot = fileURLToPath(new URL('..', import.meta.url));
const temporaryRoot = await mkdtemp(join(tmpdir(), 'oxygen-initial-release-'));

async function copyPath(path) {
  const source = resolve(repositoryRoot, path);
  const target = resolve(temporaryRoot, path);
  await mkdir(dirname(target), { recursive: true });
  await cp(source, target, { recursive: true });
}

try {
  await Promise.all([
    copyPath('.changeset'),
    copyPath('apps/storybook/package.json'),
    copyPath('package.json'),
    copyPath('packages/ui/package.json'),
    copyPath('pnpm-workspace.yaml'),
  ]);

  const changesetBinary = resolve(repositoryRoot, 'node_modules/.bin/changeset');
  const result = spawnSync(changesetBinary, ['version'], {
    cwd: temporaryRoot,
    encoding: 'utf8',
    env: { ...process.env, CI: 'true' },
    stdio: 'pipe',
  });

  if (result.status !== 0) {
    process.stderr.write(result.stdout ?? '');
    process.stderr.write(result.stderr ?? '');
    throw new Error(`changeset version failed with status ${result.status}`);
  }

  const versionedManifest = JSON.parse(
    await readFile(resolve(temporaryRoot, 'packages/ui/package.json'), 'utf8'),
  );
  if (versionedManifest.version !== '0.1.0') {
    throw new Error(
      `Expected initial version 0.1.0, received ${versionedManifest.version}`,
    );
  }

  console.log('Verified initial changeset produces @oxygen-design/ui@0.1.0.');
} finally {
  await rm(temporaryRoot, { force: true, recursive: true });
}
