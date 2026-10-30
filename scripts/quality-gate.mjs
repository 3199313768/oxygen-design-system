import { readdir, readFile } from 'node:fs/promises';
import { basename, extname, join, relative } from 'node:path';
import process from 'node:process';

const repositoryRoot = process.cwd();
const testRoots = ['packages/ui/tests', 'packages/patterns/tests'];
const testExtensions = new Set(['.ts', '.tsx']);

async function collectFiles(directory, extensions) {
  const entries = await readdir(join(repositoryRoot, directory), { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...await collectFiles(path, extensions));
    } else if (extensions.has(extname(entry.name)) && !entry.name.endsWith('.d.ts')) {
      files.push(path);
    }
  }
  return files;
}

async function readFiles(files) {
  return Promise.all(files.map(async (file) => ({
    file,
    source: await readFile(join(repositoryRoot, file), 'utf8'),
  })));
}

async function coverageSurface() {
  const sourceFiles = (await collectFiles('packages/ui/src/components', new Set(['.tsx'])));
  const testFiles = (await Promise.all(testRoots.map((root) => collectFiles(root, testExtensions)))).flat();
  const testSource = (await readFiles(testFiles)).map(({ source }) => source).join('\n');
  const uncovered = sourceFiles.filter((file) => {
    const componentName = basename(file, '.tsx');
    return !new RegExp(`\\b${componentName}\\b`).test(testSource);
  });

  if (uncovered.length > 0) {
    console.error(`coverage surface missing tests for: ${uncovered.map((file) => relative(repositoryRoot, file)).join(', ')}`);
    process.exitCode = 1;
    return;
  }
  console.log(`coverage surface passed: ${sourceFiles.length} UI components are referenced by the test suites (static surface check; no line percentage claimed)`);
}

const command = process.argv[2] ?? 'coverage';
if (command === 'coverage') await coverageSurface();
else {
  console.error(`Unknown quality gate: ${command}`);
  process.exitCode = 1;
}
