import assert from 'node:assert/strict';
import test from 'node:test';
import { evaluateRequiredChecks } from '../../scripts/verify-merge-gate.mjs';

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
