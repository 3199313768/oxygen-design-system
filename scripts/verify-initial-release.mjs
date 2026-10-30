// Compatibility entry point: preview the current release plan, not only the first release.
import { cp, mkdir, mkdtemp, readFile, realpath, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, relative, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

function run(command, args, cwd) {
  const result = spawnSync(command, args, {
    cwd,
    encoding: 'utf8',
    env: { ...process.env, CI: 'true' },
    timeout: 30000,
  });
  if (result.error || result.status !== 0) {
    throw new Error(`${command} ${args.join(' ')} failed: ${result.error?.message ?? result.stderr ?? result.stdout}`);
  }
  return result.stdout;
}

export function assertReleaseVersions(plan, originals, versioned) {
  const releases = new Map(plan.releases.map((release) => [release.name, release]));
  const originalNames = new Set(originals.map((manifest) => manifest.name));
  for (const release of plan.releases) {
    if (!originalNames.has(release.name)) throw new Error(`Missing planned workspace package ${release.name}`);
  }
  for (const original of originals) {
    const actual = versioned.find((manifest) => manifest.name === original.name);
    if (!actual) throw new Error(`Missing versioned workspace package ${original.name}`);
    const release = releases.get(original.name);
    if (release && original.version !== release.oldVersion) {
      throw new Error(`${original.name}: release plan oldVersion does not match source version`);
    }
    const expected = release?.newVersion ?? original.version;
    if (actual.version !== expected) {
      throw new Error(`${original.name}: expected ${expected}, received ${actual.version}`);
    }
  }
}

export async function previewRelease({
  repositoryRoot = fileURLToPath(new URL('..', import.meta.url)),
  changesetBinary = resolve(repositoryRoot, 'node_modules/.bin/changeset'),
} = {}) {
  repositoryRoot = await realpath(repositoryRoot);
  const temporaryRoot = await mkdtemp(join(tmpdir(), 'oxygen-release-preview-'));
  try {
    // pnpm's public list command understands the actual workspace globs, exclusions
    // and package locations. It does not install or link any dependencies.
    const workspace = JSON.parse(run('pnpm', ['list', '--recursive', '--depth=-1', '--json'], repositoryRoot));
    const paths = [...new Set(['', ...workspace.map((entry) => relative(repositoryRoot, entry.path))])];
    if (paths.some((path) => path === '..' || path.startsWith('../'))) throw new Error('Workspace package is outside the repository');
    const originals = await Promise.all(paths.map(async (path) => JSON.parse(await readFile(join(repositoryRoot, path, 'package.json'), 'utf8'))));
    async function copyPath(path, optional = false) {
      const target = join(temporaryRoot, path);
      await mkdir(dirname(target), { recursive: true });
      try { await cp(join(repositoryRoot, path), target, { recursive: true }); }
      catch (error) { if (!optional || error.code !== 'ENOENT') throw error; }
    }
    await copyPath('.changeset');
    await copyPath('pnpm-workspace.yaml');
    for (const path of paths) {
      await copyPath(join(path, 'package.json'));
      await copyPath(join(path, 'CHANGELOG.md'), true);
    }

    const planPath = join(temporaryRoot, 'release-plan.json');
    // Changesets status needs the real Git base ref. Its only output is this
    // temporary JSON; all version/changelog/changeset writes happen in the copy.
    run(changesetBinary, ['status', '--output', planPath], repositoryRoot);
    const plan = JSON.parse(await readFile(planPath, 'utf8'));
    if (!plan.releases.length) {
      return { releases: [], dependencyUpdates: [], checkedPackages: originals.map((manifest) => manifest.name) };
    }
    const configPath = join(temporaryRoot, '.changeset/config.json');
    const config = JSON.parse(await readFile(configPath, 'utf8'));
    // A preview must not create commits or invoke detected formatting tools.
    await writeFile(configPath, `${JSON.stringify({ ...config, commit: false, format: false }, null, 2)}\n`);
    run(changesetBinary, ['version'], temporaryRoot);
    const versioned = await Promise.all(paths.map(async (path) => JSON.parse(await readFile(join(temporaryRoot, path, 'package.json'), 'utf8'))));
    assertReleaseVersions(plan, originals, versioned);

    const dependencyUpdates = [];
    for (const [index, original] of originals.entries()) {
      for (const field of ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies']) {
        for (const [dependency, previousRange] of Object.entries(original[field] ?? {})) {
          const nextRange = versioned[index][field]?.[dependency];
          if (nextRange === previousRange) continue;
          const release = plan.releases.find((entry) => entry.name === dependency);
          if (!release) throw new Error(`Unexpected dependency update: ${original.name} ${dependency}`);
          dependencyUpdates.push({ package: original.name, field, dependency, previousRange, nextRange, plannedVersion: release.newVersion });
        }
      }
    }
    return { releases: plan.releases, dependencyUpdates, checkedPackages: originals.map((manifest) => manifest.name) };
  } finally {
    await rm(temporaryRoot, { force: true, recursive: true });
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const result = await previewRelease();
    console.log(JSON.stringify({ status: 'verified', ...result }, null, 2));
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
