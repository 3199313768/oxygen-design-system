import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFile, realpath } from 'node:fs/promises';
import { dirname, isAbsolute, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const publicPackages = new Set(['@oxygen-design/ui', '@oxygen-design/patterns']);

export async function publishNpmPlan(file, {
  dryRun = false,
  env = process.env,
  execute = (command, args) => spawnSync(command, args, { stdio: 'inherit', env }),
} = {}) {
  const input = JSON.parse(await readFile(file, 'utf8'));
  if (input.version !== 1 || !Array.isArray(input.plan) ||
    !input.plan.every(Array.isArray)) {
    throw new Error('Unsupported Changesets pack plan.');
  }
  const root = await realpath(dirname(resolve(file)));
  const releases = [];
  for (const entry of input.plan.flat()) {
    if (!entry || !publicPackages.has(entry.name)) {
      throw new Error('Pack plan contains an unexpected public package.');
    }
    if (entry.kind === 'tag-only') continue;
    if (entry.kind !== 'publish' || entry.access !== 'public' ||
      typeof entry.version !== 'string' || typeof entry.tag !== 'string' ||
      !/^[a-zA-Z0-9][a-zA-Z0-9._-]*$/.test(entry.tag)) {
      throw new Error(`Invalid public package release: ${entry.name}`);
    }
    const archivePath = entry.tarball?.path;
    if (typeof archivePath !== 'string' || isAbsolute(archivePath)) {
      throw new Error('Invalid archive path.');
    }
    const archive = resolve(root, archivePath);
    const location = relative(root, archive);
    if (location === '..' || location.startsWith(`..${sep}`) || isAbsolute(location)) {
      throw new Error('Archive path escapes the pack directory.');
    }
    const actual = await realpath(archive);
    const actualLocation = relative(root, actual);
    if (actualLocation === '..' || actualLocation.startsWith(`..${sep}`) || isAbsolute(actualLocation)) {
      throw new Error('Archive path resolves outside the pack directory.');
    }
    const integrity = `sha256-${createHash('sha256').update(await readFile(actual)).digest('base64')}`;
    if (integrity !== entry.tarball.integrity) {
      throw new Error(`Archive integrity mismatch: ${entry.name}`);
    }
    releases.push({ ...entry, archive: actual });
  }

  if (releases.length > 0 && !dryRun) {
    if (env.GITHUB_ACTIONS !== 'true' || !env.ACTIONS_ID_TOKEN_REQUEST_URL ||
      !env.ACTIONS_ID_TOKEN_REQUEST_TOKEN) {
      throw new Error('Live publishing requires GitHub Actions OIDC. Use --dry-run locally.');
    }
    if (env.NPM_TOKEN || env.NODE_AUTH_TOKEN) {
      throw new Error('Remove permanent npm tokens; this release uses OIDC only.');
    }
  }

  const published = [];
  for (const entry of releases) {
    const args = ['publish', entry.archive, '--access', 'public', '--tag', entry.tag,
      '--registry', 'https://registry.npmjs.org/', '--ignore-scripts',
      ...(dryRun ? ['--dry-run', '--provenance=false'] : ['--provenance'])];
    const result = execute('npm', args);
    if (result.error) throw result.error;
    if (result.status !== 0) {
      throw new Error(`npm publish failed for ${entry.name}@${entry.version}; stopping release.`);
    }
    published.push({ name: entry.name, version: entry.version });
  }
  return published;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const [file, option, ...extra] = process.argv.slice(2);
    if (!file || (option && option !== '--dry-run') || extra.length > 0) {
      throw new Error('Usage: node scripts/publish-npm.mjs <publish-plan.json> [--dry-run]');
    }
    const published = await publishNpmPlan(file, { dryRun: option === '--dry-run' });
    console.log(`${option ? 'Dry-run verified' : 'Published'} ${published.length} npm package(s).`);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
