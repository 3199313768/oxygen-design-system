import { spawn } from 'node:child_process';
import { cp, mkdtemp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const temporaryRoot = await mkdtemp(join(tmpdir(), 'oxygen-workbench-'));
const consumerRoot = join(temporaryRoot, 'consumer');
const packRoot = join(temporaryRoot, 'pack');
let activeChild;
let interruptedSignal;

function interrupt(signal) {
  interruptedSignal = signal;
  if (!activeChild?.pid) return;
  try {
    if (process.platform === 'win32') activeChild.kill(signal);
    else process.kill(-activeChild.pid, signal);
  } catch (error) {
    if (error.code !== 'ESRCH') throw error;
  }
}

const onInterrupt = () => interrupt('SIGINT');
const onTerminate = () => interrupt('SIGTERM');
process.on('SIGINT', onInterrupt);
process.on('SIGTERM', onTerminate);

async function run(args, cwd = root, extraEnv = {}) {
  if (interruptedSignal) throw new Error(`Interrupted by ${interruptedSignal}`);
  await new Promise((resolve, reject) => {
    const child = spawn('pnpm', args, {
      cwd,
      env: { ...process.env, ...extraEnv },
      stdio: 'inherit',
      detached: process.platform !== 'win32',
    });
    activeChild = child;
    child.once('error', reject);
    child.once('close', (code, signal) => {
      activeChild = undefined;
      if (code === 0) resolve();
      else reject(new Error(`pnpm ${args.join(' ')} failed (${signal ?? code})`));
    });
  });
}

try {
  await run(['exec', 'tsc', '--project', 'tests/browser/tsconfig.json']);
  await mkdir(packRoot);
  await run(['build']);
  for (const name of ['ui', 'patterns']) {
    await run(['--dir', join(root, 'packages', name), 'pack', '--pack-destination', packRoot]);
  }
  const fixtureRoot = join(root, 'tests/workbench');
  await cp(fixtureRoot, consumerRoot, {
    recursive: true,
    filter: (source) => !relative(fixtureRoot, source).split(/[\\/]/).some(
      (part) => ['node_modules', 'dist', 'pnpm-lock.yaml'].includes(part),
    ),
  });
  const manifestPath = join(consumerRoot, 'package.json');
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  const tarballs = await readdir(packRoot);
  for (const name of ['ui', 'patterns']) {
    const tarball = tarballs.find((file) => file.startsWith(`oxygen-design-${name}-`) && file.endsWith('.tgz'));
    if (!tarball) throw new Error(`Missing ${name} tarball`);
    manifest.dependencies[`@oxygen-design/${name}`] = `file:${join(packRoot, tarball)}`;
  }
  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  await run(['install', '--prefer-offline', '--no-frozen-lockfile'], consumerRoot);
  await run(['typecheck'], consumerRoot);
  await run(['build'], consumerRoot);
  const previewEnv = { OXYGEN_CONSUMER_DIST: join(consumerRoot, 'dist') };
  if (process.argv.includes('--preview')) {
    console.log(`Open http://127.0.0.1:${process.env.OXYGEN_WORKBENCH_PORT ?? 4173} to use the packed consumer. Press Ctrl+C to stop.`);
    await run(['exec', 'node', 'scripts/serve-workbench.mjs'], root, previewEnv);
  } else {
    await run(['exec', 'playwright', 'test', ...process.argv.slice(2)], root, previewEnv);
    console.log('Verified complete consumer flows against installed UI and patterns tarballs.');
  }
} catch (error) {
  if (!interruptedSignal) throw error;
} finally {
  await rm(temporaryRoot, { recursive: true, force: true });
  process.off('SIGINT', onInterrupt);
  process.off('SIGTERM', onTerminate);
  if (interruptedSignal) process.exitCode = interruptedSignal === 'SIGINT' ? 130 : 143;
}
