import { readdir, readFile } from 'node:fs/promises';
import { basename, extname, join, relative } from 'node:path';
import process from 'node:process';

import * as ts from 'typescript';

const repositoryRoot = process.cwd();
const sourceRoots = ['packages/ui/src', 'packages/patterns/src'];
const testRoots = ['packages/ui/tests', 'packages/patterns/tests'];
const sourceExtensions = new Set(['.ts', '.tsx']);
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

function lineNumber(source, offset) {
  return source.slice(0, offset).split('\n').length;
}

async function readFiles(files) {
  return Promise.all(files.map(async (file) => ({
    file,
    source: await readFile(join(repositoryRoot, file), 'utf8'),
  })));
}

async function lint() {
  const files = (await Promise.all(sourceRoots.map((root) => collectFiles(root, sourceExtensions)))).flat();
  const contents = await readFiles(files);
  const failures = [];
  const rules = [
    ['explicit any', /\bany\b/g],
    ['ts suppression', /@ts-(?:ignore|expect-error)/g],
    ['console usage', /\bconsole\.(?:log|debug|info|warn|error)\s*\(/g],
    ['raw HTML injection', /dangerouslySetInnerHTML/g],
  ];

  for (const { file, source } of contents) {
    const parsed = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true);
    for (const diagnostic of parsed.parseDiagnostics) {
      failures.push(`${file}:${diagnostic.start ? lineNumber(source, diagnostic.start) : 1} syntax error: ${ts.flattenDiagnosticMessageText(diagnostic.messageText, ' ')}`);
    }
    for (const [label, pattern] of rules) {
      for (const match of source.matchAll(pattern)) {
        failures.push(`${file}:${lineNumber(source, match.index ?? 0)} ${label}`);
      }
    }
  }

  if (failures.length > 0) {
    console.error(failures.join('\n'));
    process.exitCode = 1;
    return;
  }
  console.log(`lint passed: parsed ${files.length} TypeScript source files with no policy violations`);
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

const command = process.argv[2] ?? 'lint';
if (command === 'lint') await lint();
else if (command === 'coverage') await coverageSurface();
else {
  console.error(`Unknown quality gate: ${command}`);
  process.exitCode = 1;
}
