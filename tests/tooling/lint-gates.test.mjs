import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { ESLint } from 'eslint';

const cwd = fileURLToPath(new URL('../..', import.meta.url));
const eslint = new ESLint({ cwd });
const filePath = 'packages/ui/src/components/Button.tsx';

const violations = [
  ['conditional Hooks', 'react-hooks/rules-of-hooks', `
    import { useState } from 'react';
    export function Example({ enabled }: { enabled: boolean }) {
      if (enabled) useState(0);
      return null;
    }
  `],
  ['missing effect dependencies', 'react-hooks/exhaustive-deps', `
    import { useEffect } from 'react';
    export function Example({ value }: { value: string }) {
      useEffect(() => { document.title = value; }, []);
      return null;
    }
  `],
  ['unhandled Promises', '@typescript-eslint/no-floating-promises', `
    export function save() { Promise.resolve(1); }
  `],
  ['images without alternatives', 'jsx-a11y/alt-text', `
    export function Example() { return <img src="/sample.png" />; }
  `],
  ['explicit any', '@typescript-eslint/no-explicit-any', `
    export function identity(value: any) { return value; }
  `],
  ['raw HTML injection', 'no-restricted-syntax', `
    export function Example() { return <div dangerouslySetInnerHTML={{ __html: '<b>unsafe</b>' }} />; }
  `],
];

for (const [label, ruleId, source] of violations) {
  test(`lint rejects ${label}`, async () => {
    const [result] = await eslint.lintText(source, { filePath });
    assert.ok(result.messages.some((message) => message.ruleId === ruleId && message.severity === 2),
      `Expected error ${ruleId}; got ${JSON.stringify(result.messages)}`);
  });
}

test('lint accepts valid Hook dependencies and an explicitly handled Promise', async () => {
  const [result] = await eslint.lintText(`
    import { useEffect } from 'react';
    export function Example({ value }: { value: string }) {
      useEffect(() => { document.title = value; }, [value]);
      void Promise.resolve(value).catch(() => undefined);
      return <img src="/sample.png" alt="演示" />;
    }
  `, { filePath });
  assert.equal(result.errorCount, 0, JSON.stringify(result.messages));
  assert.equal(result.warningCount, 0, JSON.stringify(result.messages));
});

test('lint does not mistake comments and strings for executable policy violations', async () => {
  const [result] = await eslint.lintText(`
    // any console.log @ts-ignore dangerouslySetInnerHTML
    export const explanation = 'any console.log @ts-ignore dangerouslySetInnerHTML';
  `, { filePath });
  assert.equal(result.errorCount, 0, JSON.stringify(result.messages));
});

test('the public lint command returns a failing exit code for a real Hook violation', () => {
  const result = spawnSync('pnpm', ['lint', '--stdin', '--stdin-filename', filePath], {
    cwd,
    input: violations[0][2],
    encoding: 'utf8',
    timeout: 30000,
  });
  assert.ifError(result.error);
  assert.notEqual(result.status, 0);
  assert.match(`${result.stdout}\n${result.stderr}`, /react-hooks\/rules-of-hooks/);
});
