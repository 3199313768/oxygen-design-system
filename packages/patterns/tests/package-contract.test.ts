import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const packageRoot = process.cwd();

describe('@oxygen-design/patterns package contract', () => {
  it('publishes the patterns entry and stylesheet with the UI peer dependency', async () => {
    const manifest = JSON.parse(
      await readFile(resolve(packageRoot, 'package.json'), 'utf8'),
    ) as {
      description: string;
      exports: Record<string, unknown>;
      files: string[];
      keywords: string[];
      name: string;
      peerDependencies: Record<string, string>;
      publishConfig: { access: string; registry: string };
      version: string;
    };

    expect(manifest.name).toBe('@oxygen-design/patterns');
    expect(manifest.version).toMatch(/^\d+\.\d+\.\d+$/);
    expect(manifest.description).toBe(
      'Oxygen 通用页面组合：AppShell、EmptyState、PageHeader 和 StatusMessage。不包含具体业务的数据访问、路由或状态管理。',
    );
    expect(manifest.keywords).toEqual([
      'react',
      'design-system',
      'patterns',
      'typescript',
    ]);
    expect(manifest.files).toEqual(['dist', 'styles.css.d.ts']);
    expect(Object.keys(manifest.exports)).toEqual(['.', './styles.css']);
    expect(manifest.exports['.']).toEqual({
      types: './dist/index.d.ts',
      import: './dist/index.js',
    });
    expect(manifest.exports['./styles.css']).toEqual({
      types: './styles.css.d.ts',
      default: './dist/styles.css',
    });
    expect(manifest.peerDependencies).toEqual({
      '@oxygen-design/ui': '>=0.2.0 <1.0.0',
      react: '>=19',
      'react-dom': '>=19',
    });
    expect(manifest.publishConfig).toEqual({
      access: 'public',
      registry: 'https://registry.npmjs.org/',
    });
  });

  it('builds declarations from source without test types or the UI source alias', async () => {
    const [buildConfig, viteConfig] = await Promise.all([
      readFile(resolve(packageRoot, 'tsconfig.build.json'), 'utf8'),
      readFile(resolve(packageRoot, 'vite.config.ts'), 'utf8'),
    ]);
    expect(JSON.parse(buildConfig)).toMatchObject({
      compilerOptions: { paths: {}, types: [] },
      include: ['src'],
    });
    expect(viteConfig).toContain("tsconfigPath: './tsconfig.build.json'");
  });
});
