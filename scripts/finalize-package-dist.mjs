import { copyFile, readFile, readdir, writeFile } from 'node:fs/promises';
import { extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

function relativeSpecifier(literal, sourceFile) {
  const text = literal.text;
  if (!text.startsWith('.') || extname(text)) return null;
  return {
    start: literal.getStart(sourceFile) + 1,
    end: literal.end - 1,
    text: `${text}.js`,
  };
}

export function rewriteDeclarationSpecifiers(source) {
  const sourceFile = ts.createSourceFile(
    'declaration.d.ts',
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );
  const replacements = [];

  function visit(node) {
    if (
      (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
      node.moduleSpecifier &&
      ts.isStringLiteral(node.moduleSpecifier)
    ) {
      const replacement = relativeSpecifier(node.moduleSpecifier, sourceFile);
      if (replacement) replacements.push(replacement);
    } else if (
      ts.isImportTypeNode(node) &&
      ts.isLiteralTypeNode(node.argument) &&
      ts.isStringLiteral(node.argument.literal)
    ) {
      const replacement = relativeSpecifier(node.argument.literal, sourceFile);
      if (replacement) replacements.push(replacement);
    }
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  let next = source;
  for (const replacement of replacements.sort((left, right) => right.start - left.start)) {
    next = next.slice(0, replacement.start) + replacement.text + next.slice(replacement.end);
  }
  return next;
}

export function stripCssImports(source) {
  return source
    .replace(/^[ \t]*import\s+['"][^'"]+\.css['"];?[ \t]*\r?\n?/gm, '')
    .replace(/^[ \t]*\/\* empty css[\s\S]*?\*\/[ \t]*\r?\n?/gm, '')
    .replace(/^(['"])use client\1;\r?\n\1use client\1;\r?\n/, '$1use client$1;\n');
}

async function filesIn(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? filesIn(path) : [path];
  }));
  return nested.flat();
}

export async function finalizePackageDist(packageRoot) {
  const dist = join(packageRoot, 'dist');
  try {
    await copyFile(join(packageRoot, 'src/styles/tokens.css'), join(dist, 'tokens.css'));
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }

  for (const file of await filesIn(dist)) {
    if (file.endsWith('.d.ts')) {
      const source = await readFile(file, 'utf8');
      const next = rewriteDeclarationSpecifiers(stripCssImports(source));
      if (next !== source) await writeFile(file, next);
    } else if (file.endsWith('.js')) {
      const source = await readFile(file, 'utf8');
      const next = stripCssImports(source);
      if (next !== source) await writeFile(file, next);
    }
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await finalizePackageDist(process.cwd());
}
