import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const root = fileURLToPath(new URL('../..', import.meta.url));

test('coverage includes unimported source and rejects unmet thresholds', async () => {
  const report = await mkdtemp(join(tmpdir(), 'oxygen-coverage-gate-'));
  const probe = join(root, 'packages/patterns/src', `qualityCoverageProbe-${randomUUID()}.ts`);
  try {
    await writeFile(probe, 'export function uncovered(value: boolean) { return value ? 1 : 0; }\n', { flag: 'wx' });
    const result = spawnSync('pnpm', [
      '--filter', '@oxygen-design/patterns', 'exec', 'vitest', 'run', '--coverage',
      '--coverage.thresholds.branches=100', `--coverage.reportsDirectory=${report}`,
      '--fsModuleCache=false',
    ], { cwd: root, encoding: 'utf8', timeout: 60000 });
    assert.ifError(result.error);
    assert.notEqual(result.status, 0, 'Uncovered source must fail the configured coverage gate.');
    assert.match(`${result.stdout}\n${result.stderr}`, /Coverage for .*does not meet.*threshold/);
    const summary = JSON.parse(await readFile(join(report, 'coverage-summary.json'), 'utf8'));
    assert.ok(summary[probe], 'A source file never imported by a test must appear in the coverage report.');
    assert.equal(summary[probe].lines.covered, 0);
    assert.ok(summary[probe].lines.total > 0);
  } finally {
    await rm(probe, { force: true });
    await rm(report, { recursive: true, force: true });
  }
});
