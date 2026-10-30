import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, mkdtemp, readFile, realpath, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { publishNpmPlan } from '../../scripts/publish-npm.mjs';

const oidc = {
  GITHUB_ACTIONS: 'true',
  ACTIONS_ID_TOKEN_REQUEST_URL: 'https://token.actions.githubusercontent.com/example',
  ACTIONS_ID_TOKEN_REQUEST_TOKEN: 'test-only-request-token',
};

async function fixture(t) {
  const root = await realpath(await mkdtemp(join(tmpdir(), 'oxygen-publish-test-')));
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(join(root, 'packages'));
  const entries = [];
  for (const name of ['ui', 'patterns']) {
    const data = Buffer.from(`test archive for ${name}`);
    const path = `packages/oxygen-design-${name}-0.1.0.tgz`;
    await writeFile(join(root, path), data);
    entries.push({ kind: 'publish', name: `@oxygen-design/${name}`, version: '0.1.0',
      access: 'public', tag: 'latest', tarball: { path,
        integrity: `sha256-${createHash('sha256').update(data).digest('base64')}` } });
  }
  const file = join(root, 'publish-plan.json');
  const plan = { version: 1, plan: entries.map((entry) => [entry]) };
  await writeFile(file, JSON.stringify(plan));
  return { root, file, plan };
}

test('validates every archive before publishing any package', async (t) => {
  const { root, file } = await fixture(t);
  await writeFile(join(root, 'packages/oxygen-design-patterns-0.1.0.tgz'), 'corrupted');
  await assert.rejects(publishNpmPlan(file, { env: oidc,
    execute: () => assert.fail('must not publish an unverified release') }), /integrity/i);
});

test('rejects archives outside the pack directory', async (t) => {
  const { file, plan } = await fixture(t);
  plan.plan[0][0].tarball.path = '../outside.tgz';
  await writeFile(file, JSON.stringify(plan));
  await assert.rejects(publishNpmPlan(file, { env: oidc }), /archive path/i);
});

test('rejects a plan that could publish a private workspace package', async (t) => {
  const { file, plan } = await fixture(t);
  plan.plan[0][0].name = '@oxygen-design/storybook';
  await writeFile(file, JSON.stringify(plan));
  await assert.rejects(publishNpmPlan(file, { env: oidc }), /public package/i);
});

test('requires GitHub Actions OIDC before live publication', async (t) => {
  const { file } = await fixture(t);
  await assert.rejects(publishNpmPlan(file, { env: {},
    execute: () => assert.fail('must not contact npm without OIDC') }), /OIDC/);
});

test('rejects permanent npm tokens instead of silently falling back to them', async (t) => {
  const { file } = await fixture(t);
  await assert.rejects(publishNpmPlan(file, { env: { ...oidc, NPM_TOKEN: 'test-only-token' },
    execute: () => assert.fail('must not publish with permanent credentials') }), /token/i);
});

test('dry run checks the exact packed archives without credentials or provenance requests', async (t) => {
  const { file, root } = await fixture(t);
  const invocations = [];
  const result = await publishNpmPlan(file, { dryRun: true, env: {}, execute: (command, args) => {
    invocations.push({ command, args });
    return { status: 0 };
  } });
  assert.deepEqual(result, [
    { name: '@oxygen-design/ui', version: '0.1.0' },
    { name: '@oxygen-design/patterns', version: '0.1.0' },
  ]);
  assert.deepEqual(invocations[0], { command: 'npm', args: ['publish',
    join(root, 'packages/oxygen-design-ui-0.1.0.tgz'), '--access', 'public', '--tag', 'latest',
    '--registry', 'https://registry.npmjs.org/', '--ignore-scripts', '--dry-run', '--provenance=false'] });
});

test('a failed npm publish stops before publishing dependent packages', async (t) => {
  const { file } = await fixture(t);
  let attempts = 0;
  await assert.rejects(publishNpmPlan(file, { env: oidc, execute: () => {
    attempts++;
    return { status: 1 };
  } }), /@oxygen-design\/ui/);
  assert.equal(attempts, 1);
});

test('live publication requests provenance and never adds dry-run flags', async (t) => {
  const { file } = await fixture(t);
  const invocations = [];
  await publishNpmPlan(file, { env: oidc, execute: (_command, args) => {
    invocations.push(args);
    return { status: 0 };
  } });
  assert.equal(invocations.length, 2);
  assert.ok(invocations.every((args) => args.includes('--provenance') && !args.includes('--dry-run')));
});

test('an already-published tag-only plan needs no registry writes', async (t) => {
  const { file } = await fixture(t);
  const plan = JSON.parse(await readFile(file, 'utf8'));
  plan.plan = [[{ kind: 'tag-only', name: '@oxygen-design/ui', version: '0.1.0' }]];
  await writeFile(file, JSON.stringify(plan));
  assert.deepEqual(await publishNpmPlan(file, { env: {},
    execute: () => assert.fail('must not republish an existing version') }), []);
});
