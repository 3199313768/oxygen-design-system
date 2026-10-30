import ts from 'typescript';
import path from 'node:path';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { extractApi } from './docs-api.mjs';
import { loadDocs, storySource } from './docs-stories.mjs';
import { exampleSource } from '../apps/storybook/docs/source-code.mjs';

export function validateCoverage(families, docs, definitions) {
  const errors = [];
  const names = docs.map((doc) => doc.name);
  const extraEntries = families.some((family) => family.name === 'Form') ? ['FormItem', 'SpaceCompact'] : [];
  for (const name of [...families.map((family) => family.name), ...extraEntries]) {
    if (!names.includes(name)) errors.push(`${name}: 缺少组件文档`);
  }
  for (const doc of docs) {
    if (names.filter((name) => name === doc.name).length > 1) errors.push(`${doc.name}: 重复文档`);
    if (!definitions[doc.name]) errors.push(`${doc.name}: 缺少 Playground`);
  }
  return errors;
}

const root = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
export function checkDocs() {
  const docs = loadDocs();
  const definitions = JSON.parse(readFileSync(path.join(root, 'apps/storybook/docs/playgrounds.json'), 'utf8'));
  const api = extractApi(root);
  const generated = JSON.parse(readFileSync(path.join(root, 'apps/storybook/docs/api.generated.json'), 'utf8'));
  const expanded = generated.families.map((family) => ({ ...family, exports: family.exports.map((entry) => ({ ...entry, props: entry.props.map((index) => generated.properties[index]) })) }));
  const errors = validateCoverage(api, docs, definitions);
  if (JSON.stringify(api) !== JSON.stringify(expanded)) errors.push('API 数据已过期：运行 pnpm docs:generate。');
  const virtualFiles = new Map();
  for (const doc of docs) {
    for (const field of ['title', 'category', 'description', 'interaction', 'stateNotes']) {
      if (!doc[field]?.trim()) errors.push(`${doc.name}: 缺少 ${field}`);
    }
    for (const field of ['design', 'restrictions', 'accessibility']) {
      if (!doc[field]?.length || doc[field].some((item) => !item.trim())) errors.push(`${doc.name}: 缺少 ${field}`);
    }
    const definition = definitions[doc.name];
    if (!definition) continue;
    if (!Object.keys(definition.args).length || !Object.keys(definition.states).length) errors.push(`${doc.name}: 需要可编辑参数和状态示例`);
    const implementation = readFileSync(path.join(root, `apps/storybook/docs/examples/${doc.name}.tsx`), 'utf8');
    for (const [index, args] of [definition.args, ...Object.values(definition.states).map((state) => ({ ...definition.args, ...state }))].entries()) {
      virtualFiles.set(path.join(root, `apps/storybook/docs/examples/__verify_${doc.name}_${index}.tsx`), exampleSource(implementation, args));
    }
    const currentStory = readFileSync(path.join(root, `apps/storybook/stories/components/${doc.name}.stories.tsx`), 'utf8');
    if (currentStory !== storySource(doc, definition)) errors.push(`${doc.name}: Story 数据已过期：运行 pnpm docs:generate。`);
  }
  const options = {
    target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext, moduleResolution: ts.ModuleResolutionKind.Bundler,
    types: ['vite/client'], jsx: ts.JsxEmit.ReactJSX, strict: true, esModuleInterop: true, skipLibCheck: true, noEmit: true,
    paths: { '@oxygen-design/ui': [path.join(root, 'packages/ui/src/index.ts')], '@oxygen-design/patterns': [path.join(root, 'packages/patterns/src/index.ts')] },
  };
  const host = ts.createCompilerHost(options);
  const getSourceFile = host.getSourceFile.bind(host);
  host.getSourceFile = (file, version, onError, shouldCreateNewSourceFile) => virtualFiles.has(file)
    ? ts.createSourceFile(file, virtualFiles.get(file), version, true, ts.ScriptKind.TSX)
    : getSourceFile(file, version, onError, shouldCreateNewSourceFile);
  const program = ts.createProgram([...virtualFiles.keys()], options, host);
  const diagnostics = ts.getPreEmitDiagnostics(program);
  if (diagnostics.length) errors.push(ts.formatDiagnosticsWithColorAndContext(diagnostics, {
    getCanonicalFileName: (file) => path.relative(root, file), getCurrentDirectory: () => root, getNewLine: () => '\n',
  }));
  if (errors.length) throw new Error(errors.join('\n'));
  console.log(`Documentation checked: ${docs.length} component pages; ${virtualFiles.size} complete initial/state source examples compile.`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) checkDocs();
