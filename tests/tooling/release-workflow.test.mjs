import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

test('release workflow lists pending changesets without an empty since range', async () => {
  const source = await readFile(
    fileURLToPath(new URL('../../.github/workflows/release.yml', import.meta.url)),
    'utf8',
  );
  assert.equal(source.includes('--since'), false);
  assert.match(source, /pnpm changeset status --output output\/changesets\.json/);
  assert.match(source, /changesets\.length > 0/);
});
