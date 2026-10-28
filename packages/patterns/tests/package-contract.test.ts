import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const packageRoot = process.cwd();

describe('@oxygen-design/patterns package contract', () => {
  it('publishes the patterns entry and stylesheet with the UI peer dependency', async () => {
    const manifest = JSON.parse(
      await readFile(resolve(packageRoot, 'package.json'), 'utf8'),
    ) as {
      exports: Record<string, unknown>;
      files: string[];
      name: string;
      peerDependencies: Record<string, string>;
      publishConfig: { access: string; registry: string };
      version: string;
    };

    expect(manifest.name).toBe('@oxygen-design/patterns');
    expect(manifest.version).toMatch(/^\d+\.\d+\.\d+$/);
    expect(manifest.files).toEqual(['dist']);
    expect(Object.keys(manifest.exports)).toEqual(['.', './styles.css']);
    expect(manifest.exports['.']).toEqual({
      types: './dist/index.d.ts',
      import: './dist/index.js',
    });
    expect(manifest.exports['./styles.css']).toBe('./dist/styles.css');
    expect(manifest.peerDependencies).toEqual({
      '@oxygen-design/ui': '>=0.1.0 <1.0.0',
      react: '>=18',
      'react-dom': '>=18',
    });
    expect(manifest.publishConfig).toEqual({
      access: 'public',
      registry: 'https://registry.npmjs.org/',
    });
  });
});
