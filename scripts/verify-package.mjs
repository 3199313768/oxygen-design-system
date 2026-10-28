import {
  cp,
  mkdtemp,
  mkdir,
  readFile,
  readdir,
  rm,
  writeFile,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, join, relative, resolve, sep } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const repositoryRoot = fileURLToPath(new URL('..', import.meta.url));
const packageRoot = resolve(repositoryRoot, 'packages/ui');
const fixtureRoot = resolve(repositoryRoot, 'tests/consumer');
const requiredPublicExports = [
  'Accordion',
  'Alert',
  'AlertDialog',
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
  'DatePicker',
  'DateRangePicker',
  'Descriptions',
  'Divider',
  'Dialog',
  'DropdownMenu',
  'Field',
  'Form',
  'FormItem',
  'Image',
  'ImagePreview',
  'Input',
  'InputNumber',
  'Layout',
  'Label',
  'Message',
  'NavigationMenu',
  'Notification',
  'Pagination',
  'Popover',
  'Progress',
  'QRCode',
  'RadioGroup',
  'Result',
  'Select',
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

function collectNamedExports(source, scriptKind) {
  const sourceFile = ts.createSourceFile(
    'entry',
    source,
    ts.ScriptTarget.Latest,
    true,
    scriptKind,
  );
  const exports = new Set();

  for (const statement of sourceFile.statements) {
    if (ts.isExportDeclaration(statement) && statement.exportClause &&
      ts.isNamedExports(statement.exportClause)) {
      for (const element of statement.exportClause.elements) {
        exports.add(element.name.text);
      }
      continue;
    }

    const isExported = statement.modifiers?.some(
      (modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword,
    );
    if (!isExported) continue;

    if ('name' in statement && statement.name && ts.isIdentifier(statement.name)) {
      exports.add(statement.name.text);
    } else if (ts.isVariableStatement(statement)) {
      for (const declaration of statement.declarationList.declarations) {
        if (ts.isIdentifier(declaration.name)) exports.add(declaration.name.text);
      }
    }
  }

  return exports;
}

function collectImportSpecifiers(source) {
  const sourceFile = ts.createSourceFile(
    'entry.js',
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.JS,
  );
  return new Set(
    sourceFile.statements
      .filter(ts.isImportDeclaration)
      .map((statement) => statement.moduleSpecifier)
      .filter(ts.isStringLiteral)
      .map((specifier) => specifier.text),
  );
}

function run(command, args, cwd, capture = false) {
  const result = spawnSync(command, args, {
    cwd,
    encoding: 'utf8',
    env: { ...process.env, CI: 'true' },
    stdio: capture ? ['ignore', 'pipe', 'pipe'] : 'inherit',
  });

  if (result.status !== 0) {
    if (capture) {
      process.stderr.write(result.stdout ?? '');
      process.stderr.write(result.stderr ?? '');
    }
    throw new Error(`${command} ${args.join(' ')} failed with status ${result.status}`);
  }

  return result.stdout ?? '';
}

function validateArchiveEntries(entries) {
  const required = [
    'package/dist/index.d.ts',
    'package/dist/index.js',
    'package/dist/styles.css',
    'package/dist/tokens.css',
    'package/package.json',
  ];

  for (const expected of required) {
    if (!entries.includes(expected)) {
      throw new Error(`Packed archive is missing ${expected}`);
    }
  }

  for (const entry of entries) {
    const name = basename(entry);
    const forbiddenPath =
      /(^|\/)(?:\.env(?:\.|$)|\.npmrc(?:\.|$)|tests?(?:\/|$)|storybook-static(?:\/|$))/i;
    const credentialLikeName = /(?:^|[._-])(?:auth|secret|token)(?:[._-]|$)/i;

    if (forbiddenPath.test(entry) || credentialLikeName.test(name)) {
      throw new Error(`Packed archive contains forbidden entry ${entry}`);
    }
  }
}

async function validateExtractedContents(extractRoot) {
  const files = await readdir(extractRoot, {
    recursive: true,
    withFileTypes: true,
  });

  const textExtensions = /\.(?:css|d\.ts|js|json|map|md)$/;
  for (const file of files) {
    if (!file.isFile() || !textExtensions.test(file.name)) continue;

    const contents = await readFile(join(file.parentPath, file.name), 'utf8');
    if (contents.includes(repositoryRoot) || /\/Users\/[^/]+\//.test(contents)) {
      throw new Error(`Packed file ${file.name} contains an absolute local path`);
    }
  }
}

async function validatePublicSurface(extractRoot) {
  const packageDist = join(extractRoot, 'package', 'dist');
  const manifest = JSON.parse(
    await readFile(join(extractRoot, 'package', 'package.json'), 'utf8'),
  );
  const entry = await readFile(join(packageDist, 'index.js'), 'utf8');
  const declarations = await readFile(join(packageDist, 'index.d.ts'), 'utf8');
  const sourceMap = JSON.parse(await readFile(join(packageDist, 'index.js.map'), 'utf8'));
  const styles = await readFile(join(packageDist, 'styles.css'), 'utf8');
  const tokens = await readFile(join(packageDist, 'tokens.css'), 'utf8');

  if (JSON.stringify(manifest.exports) !== JSON.stringify({
    '.': { types: './dist/index.d.ts', import: './dist/index.js' },
    './styles.css': './dist/styles.css',
    './tokens.css': './dist/tokens.css',
  })) {
    throw new Error('Packed UI manifest has an unexpected export surface');
  }
  if (!styles.trim() || !tokens.trim()) {
    throw new Error('Packed UI archive contains an empty stylesheet');
  }

  const runtimeExports = collectNamedExports(entry, ts.ScriptKind.JS);
  const declarationExports = collectNamedExports(declarations, ts.ScriptKind.TS);
  for (const exportName of requiredPublicExports) {
    if (!runtimeExports.has(exportName)) {
      throw new Error(`Packed UI runtime is missing export ${exportName}`);
    }
    if (!declarationExports.has(exportName)) {
      throw new Error(`Packed UI declarations are missing export ${exportName}`);
    }
  }

  const importSpecifiers = collectImportSpecifiers(entry);
  for (const dependency of ['qrcode.react', 'react-day-picker']) {
    if (![...importSpecifiers].some(
      (specifier) => specifier === dependency || specifier.startsWith(`${dependency}/`),
    )) {
      throw new Error(`Packed UI entry bundled or omitted external dependency ${dependency}`);
    }
    if (sourceMap.sources.some((source) =>
      source.includes(`/node_modules/${dependency}/`))) {
      throw new Error(`Packed UI source map contains bundled dependency ${dependency}`);
    }
  }
}

function shouldCopyFixture(source) {
  const parts = relative(fixtureRoot, source).split(sep);
  return !parts.some((part) => part === 'dist' || part === 'node_modules') &&
    !parts.includes('pnpm-lock.yaml');
}

const temporaryRoot = await mkdtemp(join(tmpdir(), 'oxygen-ui-consumer-'));

try {
  const packRoot = join(temporaryRoot, 'pack');
  const extractRoot = join(temporaryRoot, 'extract');
  const consumerRoot = join(temporaryRoot, 'consumer');
  await mkdir(packRoot);
  await mkdir(extractRoot);

  run('pnpm', ['--dir', packageRoot, 'build'], repositoryRoot);
  run('pnpm', ['--dir', packageRoot, 'pack', '--pack-destination', packRoot], repositoryRoot);

  const tarballs = (await readdir(packRoot)).filter((file) => file.endsWith('.tgz'));
  if (tarballs.length !== 1) {
    throw new Error(`Expected one tarball, found ${tarballs.length}`);
  }

  const tarball = join(packRoot, tarballs[0]);
  const entries = run('tar', ['-tzf', tarball], repositoryRoot, true)
    .split('\n')
    .filter(Boolean);
  validateArchiveEntries(entries);

  run('tar', ['-xzf', tarball, '-C', extractRoot], repositoryRoot);
  await validateExtractedContents(extractRoot);
  await validatePublicSurface(extractRoot);

  await cp(fixtureRoot, consumerRoot, {
    filter: shouldCopyFixture,
    recursive: true,
  });

  const manifestPath = join(consumerRoot, 'package.json');
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  manifest.dependencies['@oxygen-design/ui'] = `file:${tarball}`;
  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

  run('pnpm', ['install', '--prefer-offline', '--no-frozen-lockfile'], consumerRoot);
  run('pnpm', ['typecheck'], consumerRoot);
  run('pnpm', ['build'], consumerRoot);

  console.log('Verified @oxygen-design/ui from a packed tarball.');
} finally {
  await rm(temporaryRoot, { force: true, recursive: true });
}
