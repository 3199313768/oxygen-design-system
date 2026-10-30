import assert from 'node:assert/strict';
import test from 'node:test';
import { createGitHubReader, evaluateRequiredChecks } from '../../scripts/verify-merge-gate.mjs';

const required = ['check', 'browser'];

test('rejects missing browser checks even when unit checks are required', () => {
  assert.deepEqual(evaluateRequiredChecks(required, { contexts: ['check'], strict: true }, []),
    { missing: ['browser'], strict: true, passed: false });
});

test('rejects checks that do not require the branch to be up to date', () => {
  assert.equal(evaluateRequiredChecks(required, { contexts: required, strict: false }, []).passed, false);
});

test('accepts required checks enforced by an effective ruleset', () => {
  const result = evaluateRequiredChecks(required, null, [{
    type: 'required_status_checks',
    parameters: { required_status_checks: [{ context: 'check' }, { context: 'browser' }], strict_required_status_checks_policy: true },
  }]);
  assert.equal(result.passed, true);
});

test('accepts classic protection checks returned in the checks field', () => {
  assert.equal(evaluateRequiredChecks(required, { checks: required.map((context) => ({ context })), strict: true }, []).passed, true);
});

test('uses the authenticated gh CLI without needing an environment token', async () => {
  const calls = [];
  const get = createGitHubReader({ token: undefined, runGh: (args) => {
    calls.push(args);
    return { status: 0, stdout: 'HTTP/2.0 200 OK\r\nContent-Type: application/json\r\n\r\n{"private":false}' };
  } });
  assert.deepEqual(await get('repos/owner/repo'), { private: false });
  assert.ok(calls[0].includes('--include'));
  assert.ok(calls[0].includes('repos/owner/repo'));
});

test('accepts a missing optional classic protection but rejects inaccessible repository state', async () => {
  const get = createGitHubReader({ token: undefined, runGh: () => ({ status: 1,
    stdout: 'HTTP/2.0 404 Not Found\nContent-Type: application/json\n\n{"message":"Not Found"}' }) });
  assert.equal(await get('repos/owner/repo/branches/main/protection', true), null);
  await assert.rejects(get('repos/owner/repo'), /404/);
});

test('does not convert CLI authorization or transport failure into missing protection', async () => {
  const denied = createGitHubReader({ token: undefined, runGh: () => ({ status: 1,
    stdout: 'HTTP/2.0 403 Forbidden\n\n{"message":"Forbidden"}' }) });
  await assert.rejects(denied('repos/owner/repo/branches/main/protection', true), /403/);
  const disconnected = createGitHubReader({ token: undefined, runGh: () => ({ status: 1, stdout: '' }) });
  await assert.rejects(disconnected('repos/owner/repo'), /unverified/i);
});

test('uses a configured token through fetch without exposing it to the CLI', async () => {
  const get = createGitHubReader({ token: 'test-only-token',
    runGh: () => { throw new Error('CLI must not receive token-based requests'); },
    fetchImpl: async (_url, options) => {
      assert.equal(options.headers.Authorization, 'Bearer test-only-token');
      return { status: 200, ok: true, json: async () => ({ id: 1 }) };
    },
  });
  assert.deepEqual(await get('repos/owner/repo'), { id: 1 });
});
