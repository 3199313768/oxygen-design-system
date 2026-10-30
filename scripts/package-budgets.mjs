import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';

const root = fileURLToPath(new URL('..', import.meta.url));

async function artifactFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(entries.map(async (entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? artifactFiles(path) : [path];
  }));
  return files.flat();
}

export async function measureArtifacts(directory) {
  const sizes = { js: { raw: 0, gzip: 0 }, css: { raw: 0, gzip: 0 } };
  const counts = { js: 0, css: 0 };
  for (const path of await artifactFiles(directory)) {
    const category = /\.[cm]?js$/.test(path) ? 'js' : path.endsWith('.css') ? 'css' : null;
    if (!category) continue;
    const contents = await readFile(path);
    sizes[category].raw += contents.length;
    sizes[category].gzip += gzipSync(contents, { level: 9 }).length;
    counts[category] += 1;
  }
  for (const category of ['js', 'css']) {
    if (!counts[category] || !sizes[category].raw) {
      throw new Error(`Missing ${category.toUpperCase()} artifacts in ${directory}`);
    }
  }
  return sizes;
}

export function assertBudgets(actual, budgets, label) {
  for (const category of ['js', 'css']) {
    if (!actual?.[category] || !budgets?.[category]) {
      throw new Error(`Missing ${label}.${category} measurements or fixed budget`);
    }
    for (const encoding of ['raw', 'gzip']) {
      const value = actual[category][encoding];
      const limit = budgets[category][encoding];
      if (!Number.isSafeInteger(limit) || limit <= 0 || !Number.isSafeInteger(value) || value <= 0) {
        throw new Error(`Invalid ${label}.${category}.${encoding} measurement or fixed budget`);
      }
      if (value > limit) {
        throw new Error(`${label}.${category}.${encoding}: ${value} bytes exceeds ${limit} bytes`);
      }
    }
  }
}

export function assertTreeShaken(modules, javascript, { packageName, exportName }) {
  const entrySuffix = `/${packageName}/dist/index.js`;
  const entries = modules.filter(({ id }) => id.replaceAll('\\', '/').endsWith(entrySuffix));
  const selectedPath = packageName === '@oxygen-design/ui' ? `components/${exportName}.js` : `${exportName}.js`;
  const implementations = modules.filter(({ id }) => id.replaceAll('\\', '/').endsWith(`/${packageName}/dist/${selectedPath}`));
  if (!entries.length && !implementations.length) throw new Error(`Missing ${packageName} entry in rendered module evidence`);
  const exports = new Set([...entries, ...implementations].flatMap((entry) => entry.renderedExports));
  if (!exports.has(exportName)) throw new Error(`Missing rendered export ${exportName}`);
  const unexpected = [
    ...entries.flatMap((entry) => entry.renderedExports).filter((name) => name !== exportName),
    ...implementations.flatMap((entry) => entry.renderedExports)
      .filter((name) => name !== exportName && !(exportName === 'Button' && name === 'buttonVariants')),
  ];
  if (unexpected.length) throw new Error(`Unexpected rendered exports: ${unexpected.join(', ')}`);

  const forbiddenModules = [
    /\/(?:qrcode\.react|react-day-picker|date-fns|@date-fns)\//,
    /\/@radix-ui\/react-(?:alert-dialog|checkbox|dialog|dropdown-menu|label|navigation-menu|popover|radio-group|select|slider|switch|tabs|toast|tooltip)\//,
  ];
  if (packageName === '@oxygen-design/patterns') {
    forbiddenModules.push(/\/@oxygen-design\/ui\/dist\/.*\.[cm]?js$/);
  }
  for (const { id } of modules) {
    const normalized = id.replaceAll('\\', '/');
    const packagePath = normalized.split(`/${packageName}/dist/`)[1];
    const allowedFiles = ['index.js', selectedPath, ...(packageName === '@oxygen-design/ui' ? ['lib/cn.js'] : [])];
    if ((packagePath?.endsWith('.js') && !allowedFiles.includes(packagePath)) ||
      forbiddenModules.some((pattern) => pattern.test(normalized))) {
      throw new Error(`Unrelated module retained by ${exportName}: ${id}`);
    }
  }
  const markers = packageName === '@oxygen-design/ui'
    ? ['oxygen-color-picker', 'oxygen-calendar', 'oxygen-qrcode']
    : ['oxygen-page-header', 'oxygen-app-shell', 'oxygen-status-message'];
  for (const marker of markers) {
    if (javascript.includes(marker)) throw new Error(`Unrelated JS retained by ${exportName}: ${marker}`);
  }
}

export function assertPackageBudgets(report, budgets, name) {
  for (const category of ['package', 'consumer']) {
    assertBudgets(report[category], budgets[name]?.[category], `${name}.${category}`);
  }
}

export function isMeasurementOnly(env = process.env) {
  if (env.OXYGEN_PACKAGE_MEASURE_ONLY !== '1') return false;
  if (env.CI && env.CI !== 'false') throw new Error('CI cannot bypass fixed package budgets');
  return true;
}

export async function verifyPackedLicense(packageRoot) {
  const manifest = JSON.parse(await readFile(join(packageRoot, 'package.json'), 'utf8'));
  if (manifest.license !== 'MIT') throw new Error('Packed package must declare MIT metadata');
  const license = await readFile(join(packageRoot, 'LICENSE'), 'utf8');
  const expected = await readFile(join(root, 'LICENSE'), 'utf8');
  if (license !== expected) throw new Error('Packed license text must match the repository LICENSE');
}

// Reports survive failed gates so a failing CI run can show the actual baseline.
export async function verifyPackageArtifacts({ name, packageRoot, consumerRoot, exportName }) {
  const modules = JSON.parse(await readFile(join(consumerRoot, 'dist/package-modules.json'), 'utf8'));
  const report = {
    schemaVersion: 1,
    name,
    exportName,
    compression: 'gzip level 9, summed per emitted file; source maps excluded',
    css: 'Complete stylesheets; component CSS tree shaking is not claimed.',
    package: await measureArtifacts(join(packageRoot, 'dist')),
    consumer: await measureArtifacts(join(consumerRoot, 'dist')),
    modules,
  };
  const reportPath = join(root, 'output/package-budgets', `${name}.json`);
  await mkdir(dirname(reportPath), { recursive: true });
  await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`);
  console.log(`Package size report: ${reportPath}`);
  const javascript = (await Promise.all((await artifactFiles(join(consumerRoot, 'dist')))
    .filter((path) => /\.[cm]?js$/.test(path))
    .map((path) => readFile(path, 'utf8')))).join('\n');
  assertTreeShaken(modules, javascript, { packageName: `@oxygen-design/${name}`, exportName });
  if (!isMeasurementOnly()) {
    const budgets = JSON.parse(await readFile(join(root, 'scripts/package-budgets.json'), 'utf8'));
    assertPackageBudgets(report, budgets, name);
  }
  return report;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const [, , reportPath, budgetsPath, name] = process.argv;
    if (!reportPath || !budgetsPath || !name) throw new Error('Usage: node scripts/package-budgets.mjs report.json budgets.json ui|patterns');
    const report = JSON.parse(await readFile(reportPath, 'utf8'));
    const budgets = JSON.parse(await readFile(budgetsPath, 'utf8'));
    assertPackageBudgets(report, budgets, name);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
