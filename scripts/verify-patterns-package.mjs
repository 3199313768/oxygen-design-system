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
const uiPackageRoot = resolve(repositoryRoot, 'packages/ui');
const patternsPackageRoot = resolve(repositoryRoot, 'packages/patterns');
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

const temporaryRoot = await mkdtemp(join(tmpdir(), 'oxygen-patterns-consumer-'));

try {
  const packRoot = join(temporaryRoot, 'pack');
  const extractRoot = join(temporaryRoot, 'extract');
  const consumerRoot = join(temporaryRoot, 'consumer');
  await mkdir(packRoot);
  await mkdir(extractRoot);

  run('pnpm', ['--dir', uiPackageRoot, 'build'], repositoryRoot);
  run('pnpm', ['--dir', uiPackageRoot, 'pack', '--pack-destination', packRoot], repositoryRoot);
  run('pnpm', ['--dir', patternsPackageRoot, 'build'], repositoryRoot);
  run(
    'pnpm',
    ['--dir', patternsPackageRoot, 'pack', '--pack-destination', packRoot],
    repositoryRoot,
  );

  const tarballs = (await readdir(packRoot)).filter((file) => file.endsWith('.tgz'));
  const uiTarball = tarballs.find((file) => file.startsWith('oxygen-design-ui-'));
  const patternsTarball = tarballs.find((file) => file.startsWith('oxygen-design-patterns-'));
  if (!uiTarball || !patternsTarball) {
    throw new Error(`Expected UI and patterns tarballs, found ${tarballs.join(', ')}`);
  }

  const patternsTarballPath = join(packRoot, patternsTarball);
  const entries = run('tar', ['-tzf', patternsTarballPath], repositoryRoot, true)
    .split('\n')
    .filter(Boolean);
  validateArchiveEntries(entries);

  run('tar', ['-xzf', patternsTarballPath, '-C', extractRoot], repositoryRoot);
  await validateExtractedContents(extractRoot);

  await cp(fixtureRoot, consumerRoot, {
    filter: shouldCopyFixture,
    recursive: true,
  });

  const manifestPath = join(consumerRoot, 'package.json');
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  manifest.dependencies['@oxygen-design/ui'] = `file:${join(packRoot, uiTarball)}`;
  manifest.dependencies['@oxygen-design/patterns'] = `file:${patternsTarballPath}`;
  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

  const sourcePath = join(consumerRoot, 'src/main.tsx');
  let source = await readFile(sourcePath, 'utf8');
  source = source
    .replace(
      "import { Button } from '@oxygen-design/ui';",
      "import { Button } from '@oxygen-design/ui';\nimport { EmptyState, PageHeader } from '@oxygen-design/patterns';",
    )
    .replace(
      "import '@oxygen-design/ui/tokens.css';",
      "import '@oxygen-design/ui/tokens.css';\nimport '@oxygen-design/patterns/styles.css';",
    );
  source = source.replace(
    '<Button>消费验证</Button>',
    '<PageHeader actions={<Button>新建</Button>} title="消费验证" />\n      <EmptyState description="安装包可正常渲染。" title="暂无内容" />',
  );
  await writeFile(sourcePath, source);

  run('pnpm', ['install', '--prefer-offline', '--no-frozen-lockfile'], consumerRoot);
  run('pnpm', ['typecheck'], consumerRoot);
  run('pnpm', ['build'], consumerRoot);

  console.log('Verified @oxygen-design/patterns with its UI peer from packed tarballs.');
} finally {
  await rm(temporaryRoot, { force: true, recursive: true });
}
