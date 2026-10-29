import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import * as publicEntry from '../src';
import { defaultLocale } from '../src/components/ConfigProvider';

const packageRoot = process.cwd();

describe('@oxygen-design/ui package contract', () => {
  it('marks client component package entries explicitly', async () => {
    const [uiSource, patternsSource] = await Promise.all([
      readFile(resolve(packageRoot, 'src/index.ts'), 'utf8'),
      readFile(resolve(packageRoot, '../patterns/src/index.ts'), 'utf8'),
    ]);
    expect(uiSource.startsWith("'use client';")).toBe(true);
    expect(patternsSource.startsWith("'use client';")).toBe(true);
  });
  it('keeps Storybook build separate from the package build', async () => {
    const rootManifest = JSON.parse(
      await readFile(resolve(packageRoot, '../../package.json'), 'utf8'),
    ) as { scripts: Record<string, string> };

    expect(rootManifest.scripts['storybook:build-only']).toBe(
      'pnpm --filter @oxygen-design/storybook build-storybook',
    );
    expect(rootManifest.scripts['storybook:build']).toBe(
      'pnpm build && pnpm storybook:build-only',
    );
    expect(rootManifest.scripts.verify).toContain('pnpm storybook:build-only');
    expect(rootManifest.scripts.lint).toBe('node scripts/quality-gate.mjs lint');
    expect(rootManifest.scripts['test:coverage']).toBe('node scripts/quality-gate.mjs coverage');
  });
  it('does not expose page patterns from the base entry', async () => {
    expect(publicEntry).not.toHaveProperty('AppShell');
    expect(publicEntry).not.toHaveProperty('PageHeader');
    expect(publicEntry).not.toHaveProperty('EmptyState');
    expect(publicEntry).not.toHaveProperty('StatusMessage');
  });

  it('exposes the categorized base component primitives', () => {
    const requiredExports = [
      'Alert',
      'AlertDialog',
      'Accordion',
      'Badge',
      'Breadcrumb',
      'Button',
      'Calendar',
      'Card',
      'Cascader',
      'Checkbox',
      'Collapsible',
      'ColorPicker',
      'Combobox',
      'ConfigProvider',
      'DateRangePicker',
      'Divider',
      'DatePicker',
      'Descriptions',
      'Dialog',
      'DropdownMenu',
      'Form',
      'FormItem',
      'Field',
      'Image',
      'ImagePreview',
      'Input',
      'InputNumber',
      'Label',
      'Layout',
      'Message',
      'NavigationMenu',
      'Notification',
      'Pagination',
      'Popover',
      'Progress',
      'QRCode',
      'RadioGroup',
      'Select',
      'Result',
      'Sheet',
      'Skeleton',
      'Slider',
      'Space',
      'SpaceCompact',
      'Spin',
      'Statistic',
      'Steps',
      'Switch',
      'Table',
      'Tabs',
      'Tag',
      'TagInput',
      'Textarea',
      'TimePicker',
      'Timeline',
      'Toast',
      'ToastProvider',
      'Tooltip',
      'Transfer',
      'Tree',
      'TreeSelect',
      'Typography',
      'Upload',
    ];

    for (const exportName of requiredExports) {
      expect(publicEntry[exportName as keyof typeof publicEntry]).toBeDefined();
    }
  });

  it('publishes only the ESM entry and two CSS exports', async () => {
    const manifest = JSON.parse(
      await readFile(resolve(packageRoot, 'package.json'), 'utf8'),
    ) as {
      exports: Record<string, unknown>;
      name: string;
      peerDependencies: Record<string, string>;
      dependencies: Record<string, string>;
      publishConfig: { access: string; registry: string };
      version: string;
      files: string[];
    };

    expect(manifest.name).toBe('@oxygen-design/ui');
    expect(manifest.version).toMatch(/^\d+\.\d+\.\d+$/);
    expect(manifest.files).toEqual(['dist']);
    expect(Object.keys(manifest.exports)).toEqual([
      '.',
      './styles.css',
      './tokens.css',
    ]);
    expect(manifest.exports['.']).toEqual({
      types: './dist/index.d.ts',
      import: './dist/index.js',
    });
    expect(manifest.exports['./styles.css']).toBe('./dist/styles.css');
    expect(manifest.exports['./tokens.css']).toBe('./dist/tokens.css');
    expect(manifest.peerDependencies).toMatchObject({
      react: '>=18',
      'react-dom': '>=18',
    });
    expect(manifest.publishConfig).toEqual({
      access: 'public',
      registry: 'https://registry.npmjs.org/',
    });
    expect(manifest.dependencies).toEqual(
      expect.objectContaining({
        '@radix-ui/react-navigation-menu': expect.any(String),
        'qrcode.react': expect.any(String),
        'react-day-picker': expect.any(String),
      }),
    );
  });

  it('exposes locale fallbacks for new generic labels', () => {
    expect(defaultLocale.common).toEqual(
      expect.objectContaining({
        browse: expect.any(String),
        clear: expect.any(String),
        collapse: expect.any(String),
        expand: expect.any(String),
        remove: expect.any(String),
        upload: expect.any(String),
      }),
    );
  });
});
