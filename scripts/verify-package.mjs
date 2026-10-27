import {
  cp,
  mkdtemp,
  mkdir,
  readFile,
  readdir,
  rm,
  writeFile,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, join, relative, resolve, sep } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const repositoryRoot = fileURLToPath(new URL('..', import.meta.url));
const packageRoot = resolve(repositoryRoot, 'packages/ui');
const fixtureRoot = resolve(repositoryRoot, 'tests/consumer');

function run(command, args, cwd, capture = false) {
  const result = spawnSync(command, args, {
    cwd,
    encoding: 'utf8',
    env: { ...process.env, CI: 'true' },
    stdio: capture ? ['ignore', 'pipe', 'pipe'] : 'inherit',
  });

  if (result.status !== 0) {
    if (capture) {
      process.stderr.write(result.stdout ?? '');
      process.stderr.write(result.stderr ?? '');
    }
    throw new Error(`${command} ${args.join(' ')} failed with status ${result.status}`);
  }

  return result.stdout ?? '';
}

function validateArchiveEntries(entries) {
  const required = [
    'package/dist/index.d.ts',
    'package/dist/index.js',
    'package/dist/styles.css',
    'package/dist/tokens.css',
    'package/package.json',
  ];

  for (const expected of required) {
    if (!entries.includes(expected)) {
      throw new Error(`Packed archive is missing ${expected}`);
    }
  }

  for (const entry of entries) {
    const name = basename(entry);
    const forbiddenPath =
      /(^|\/)(?:\.env(?:\.|$)|\.npmrc(?:\.|$)|tests?(?:\/|$)|storybook-static(?:\/|$))/i;
    const credentialLikeName = /(?:^|[._-])(?:auth|secret|token)(?:[._-]|$)/i;

    if (forbiddenPath.test(entry) || credentialLikeName.test(name)) {
      throw new Error(`Packed archive contains forbidden entry ${entry}`);
    }
  }
}

async function validateExtractedContents(extractRoot) {
  const files = await readdir(extractRoot, {
    recursive: true,
    withFileTypes: true,
  });

  const textExtensions = /\.(?:css|d\.ts|js|json|map|md)$/;
  for (const file of files) {
    if (!file.isFile() || !textExtensions.test(file.name)) continue;

    const contents = await readFile(join(file.parentPath, file.name), 'utf8');
    if (contents.includes(repositoryRoot) || /\/Users\/[^/]+\//.test(contents)) {
      throw new Error(`Packed file ${file.name} contains an absolute local path`);
    }
  }
}

function shouldCopyFixture(source) {
  const parts = relative(fixtureRoot, source).split(sep);
  return !parts.some((part) => part === 'dist' || part === 'node_modules') &&
    !parts.includes('pnpm-lock.yaml');
}

const temporaryRoot = await mkdtemp(join(tmpdir(), 'oxygen-ui-consumer-'));

try {
  const packRoot = join(temporaryRoot, 'pack');
  const extractRoot = join(temporaryRoot, 'extract');
  const consumerRoot = join(temporaryRoot, 'consumer');
  await mkdir(packRoot);
  await mkdir(extractRoot);

  run('pnpm', ['--dir', packageRoot, 'build'], repositoryRoot);
  run('pnpm', ['--dir', packageRoot, 'pack', '--pack-destination', packRoot], repositoryRoot);

  const tarballs = (await readdir(packRoot)).filter((file) => file.endsWith('.tgz'));
  if (tarballs.length !== 1) {
    throw new Error(`Expected one tarball, found ${tarballs.length}`);
  }

  const tarball = join(packRoot, tarballs[0]);
  const entries = run('tar', ['-tzf', tarball], repositoryRoot, true)
    .split('\n')
    .filter(Boolean);
  validateArchiveEntries(entries);

  run('tar', ['-xzf', tarball, '-C', extractRoot], repositoryRoot);
  await validateExtractedContents(extractRoot);

  await cp(fixtureRoot, consumerRoot, {
    filter: shouldCopyFixture,
    recursive: true,
  });

  const manifestPath = join(consumerRoot, 'package.json');
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  manifest.dependencies['@oxygen-design/ui'] = `file:${tarball}`;
  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

  run('pnpm', ['install', '--no-frozen-lockfile'], consumerRoot);
  run('pnpm', ['typecheck'], consumerRoot);
  run('pnpm', ['build'], consumerRoot);

  console.log('Verified @oxygen-design/ui from a packed tarball.');
} finally {
  await rm(temporaryRoot, { force: true, recursive: true });
}
