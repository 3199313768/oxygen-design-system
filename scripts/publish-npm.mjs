import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFile, realpath } from 'node:fs/promises';
import { dirname, isAbsolute, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

function compareVersions(left, right) {
  const parse = (version) => {
    const parts = version.split('.').map(Number);
    if (parts.length !== 3 || parts.some((part) => !Number.isInteger(part))) {
      throw new Error(`Unsupported version: ${version}`);
    }
    return parts;
  };
  const a = parse(left);
  const b = parse(right);
  for (let index = 0; index < 3; index += 1) {
    if (a[index] !== b[index]) return a[index] - b[index];
  }
  return 0;
}

function satisfiesRange(version, range) {
  const match = /^>=(\d+\.\d+\.\d+)(?:\s+<(\d+\.\d+\.\d+))?$/.exec(range);
  if (!match) throw new Error(`Unsupported peer range: ${range}`);
  if (compareVersions(version, match[1]) < 0) return false;
  if (match[2] && compareVersions(version, match[2]) >= 0) return false;
  return true;
}

function readPackedManifest(archive) {
  const result = spawnSync('tar', ['-xOzf', archive, 'package/package.json'], { encoding: 'utf8' });
  if (result.status !== 0 || !result.stdout) return null;
  try {
    return JSON.parse(result.stdout);
  } catch {
    return null;
  }
}

function publishedVersion(name, env) {
  const result = spawnSync('npm', [
    'view', name, 'version', '--registry', 'https://registry.npmjs.org/',
  ], { encoding: 'utf8', env });
  if (result.status !== 0) {
    throw new Error(`Cannot resolve the published version of ${name}.`);
  }
  return result.stdout.trim();
}

async function assertPatternsUiPeer(releases, { resolvePublishedVersion, env }) {
  const patterns = releases.find((entry) => entry.name === '@oxygen-design/patterns');
  if (!patterns) return;
  const range = readPackedManifest(patterns.archive)?.peerDependencies?.['@oxygen-design/ui'];
  if (typeof range !== 'string') return;
  const ui = releases.find((entry) => entry.name === '@oxygen-design/ui');
  if (ui) {
    if (!satisfiesRange(ui.version, range)) {
      throw new Error(`@oxygen-design/patterns@${patterns.version} requires @oxygen-design/ui ${range}; this plan publishes ${ui.version}.`);
    }
    return;
  }
  const published = await resolvePublishedVersion('@oxygen-design/ui', env);
  if (!satisfiesRange(published, range)) {
    throw new Error(`@oxygen-design/patterns@${patterns.version} requires @oxygen-design/ui ${range}. Publish @oxygen-design/ui in the same plan; registry latest is ${published}.`);
  }
}

const publicPackages = new Set(['@oxygen-design/ui', '@oxygen-design/patterns']);

export async function publishNpmPlan(file, {
  dryRun = false,
  env = process.env,
  execute = (command, args) => spawnSync(command, args, { stdio: 'inherit', env }),
  resolvePublishedVersion = publishedVersion,
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

  await assertPatternsUiPeer(releases, { resolvePublishedVersion, env });

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
