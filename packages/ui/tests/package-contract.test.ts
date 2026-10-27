import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const packageRoot = process.cwd();

describe('@oxygen-design/ui package contract', () => {
  it('publishes only the ESM entry and two CSS exports', async () => {
    const manifest = JSON.parse(
      await readFile(resolve(packageRoot, 'package.json'), 'utf8'),
    ) as {
      exports: Record<string, unknown>;
      name: string;
      peerDependencies: Record<string, string>;
      publishConfig: { access: string; registry: string };
      version: string;
    };

    expect(manifest.name).toBe('@oxygen-design/ui');
    expect(manifest.version).toMatch(/^\d+\.\d+\.\d+$/);
    expect(Object.keys(manifest.exports)).toEqual([
      '.',
      './styles.css',
      './tokens.css',
    ]);
    expect(manifest.peerDependencies).toMatchObject({
      react: '>=18',
      'react-dom': '>=18',
    });
    expect(manifest.publishConfig).toEqual({
      access: 'restricted',
      registry: 'https://registry.npmjs.org/',
    });
  });
});
