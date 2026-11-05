import { spawnSync } from 'node:child_process';
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { publint } from 'publint';
import { formatMessage } from 'publint/utils';
import {
  rewriteDeclarationSpecifiers,
  stripCssImports,
} from './finalize-package-dist.mjs';

const attw = fileURLToPath(new URL('../node_modules/@arethetypeswrong/cli/dist/index.js', import.meta.url));

async function filesIn(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? filesIn(path) : [path];
  }));
  return nested.flat();
}

export async function assertPackedModules(packageDir) {
  const dist = join(packageDir, 'dist');
  for (const file of await filesIn(dist)) {
    if (file.endsWith('.d.ts')) {
      const source = await readFile(file, 'utf8');
      if (source.includes('vitest') || source.includes('jest-dom')) {
        throw new Error(`${file} leaks test types`);
      }
      if (rewriteDeclarationSpecifiers(source) !== source) {
        throw new Error(`${file} has an extensionless relative type import`);
      }
    } else if (file.endsWith('.js')) {
      const source = await readFile(file, 'utf8');
      if (stripCssImports(source) !== source) {
        throw new Error(`${file} imports CSS; import the stylesheet from its export`);
      }
      if (rewriteDeclarationSpecifiers(source) !== source) {
        throw new Error(`${file} has an extensionless relative import`);
      }
    }
  }
}

export async function assertPublint(packageDir) {
  const { messages, pkg } = await publint({
    pkgDir: packageDir,
    level: 'error',
    pack: false,
  });
  if (!messages.length) return;
  const details = messages
    .map((message) => formatMessage(message, pkg, { color: false }))
    .filter(Boolean)
    .join('\n');
  throw new Error(`publint failed:\n${details}`);
}

export function assertAttw(tarball) {
  const result = spawnSync(process.execPath, [
    attw,
    tarball,
    '--entrypoints', '.',
    '--profile', 'esm-only',
    '--format', 'json',
  ], { encoding: 'utf8' });
  if (result.status !== 0) {
    throw new Error(`attw failed for ${tarball}:\n${result.stdout ?? ''}${result.stderr ?? ''}`);
  }
}

export async function writeNodeNextProbe(consumerRoot, source) {
  await writeFile(join(consumerRoot, 'nodenext-probe.tsx'), source);
  await writeFile(join(consumerRoot, 'tsconfig.nodenext.json'), `${JSON.stringify({
    compilerOptions: {
      module: 'NodeNext',
      moduleResolution: 'NodeNext',
      jsx: 'react-jsx',
      strict: true,
      noEmit: true,
      skipLibCheck: true,
      target: 'ES2022',
      lib: ['ES2022', 'DOM', 'DOM.Iterable'],
      types: [],
    },
    files: ['nodenext-probe.tsx'],
  }, null, 2)}\n`);
}
