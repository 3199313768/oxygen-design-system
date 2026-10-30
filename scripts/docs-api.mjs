import ts from 'typescript';
import path from 'node:path';
import { existsSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// Resolve through the compiler rather than parsing Props with regular expressions:
// this includes mapped CVA variants, Radix aliases, generic tables and compound parts.
export function extractApi(root) {
  root = path.resolve(root);
  const entries = ['ui', 'patterns'].map((pkg) => path.join(root, `packages/${pkg}/src/index.ts`)).filter(existsSync);
  const program = ts.createProgram(entries, {
    target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler, jsx: ts.JsxEmit.ReactJSX,
    esModuleInterop: true, skipLibCheck: true, strict: true,
  });
  const unresolved = program.getSemanticDiagnostics().filter((diagnostic) => diagnostic.code === 2307 || diagnostic.code === 7016);
  if (unresolved.length) throw new Error(unresolved.map((diagnostic) => ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')).join('\n'));
  const checker = program.getTypeChecker();
  const format = ts.TypeFormatFlags.NoTruncation | ts.TypeFormatFlags.UseAliasDefinedOutsideCurrentScope;
  const clean = (text) => text.replaceAll(root + '/', '').replace(/import\("[^"\n]*node_modules\/[^"\n]*"\)\./g, '').replace(/import\("[^"\n]*\/([^/"\n]+)"\)\./g, '$1.');
  const families = [];
  const sharedTypes = [];
  for (const entry of entries) {
    const source = program.getSourceFile(entry);
    const module = entry.includes('/patterns/') ? '@oxygen-design/patterns' : '@oxygen-design/ui';
    const groups = new Map();
    for (const statement of source.statements) {
      if (!ts.isExportDeclaration(statement) || !statement.moduleSpecifier || !statement.exportClause || !ts.isNamedExports(statement.exportClause)) continue;
      const specifier = statement.moduleSpecifier.text;
      if (!groups.has(specifier)) groups.set(specifier, []);
      groups.get(specifier).push(...statement.exportClause.elements);
    }
    for (const [specifier, exports] of groups) {
      if (specifier.endsWith('/shared')) {
        for (const node of exports) {
          const symbol = checker.getAliasedSymbol(checker.getSymbolAtLocation(node.name));
          sharedTypes.push({ name: node.name.text, declaration: clean((symbol.declarations ?? []).map((decl) => decl.getText()).join('\n')) });
        }
        continue;
      }
      const name = specifier.split('/').at(-1);
      const family = { name, module, exports: [], types: [] };
      const defaults = new Map();
      const exportedSymbols = exports.map((node) => ({ node, symbol: checker.getAliasedSymbol(checker.getSymbolAtLocation(node.name)) }));
      const declarationFiles = new Set(exportedSymbols.flatMap(({ symbol }) => (symbol.declarations ?? []).map((decl) => decl.getSourceFile())));
      for (const file of declarationFiles) {
        if (!file.fileName.startsWith(root + '/packages/')) continue;
        const visit = (node) => {
          if (ts.isBindingElement(node) && node.initializer && ts.isIdentifier(node.name)) defaults.set(node.name.text, clean(node.initializer.getText(file)));
          // CVA's implicit defaults are part of the public visual contract.
          if (ts.isPropertyAssignment(node) && node.name.getText(file) === 'defaultVariants' && ts.isObjectLiteralExpression(node.initializer)) {
            for (const prop of node.initializer.properties) if (ts.isPropertyAssignment(prop)) defaults.set(prop.name.getText(file), prop.initializer.getText(file));
          }
          ts.forEachChild(node, visit);
        };
        visit(file);
      }
      for (const { node, symbol } of exportedSymbols) {
        const displayName = node.name.text;
        const decl = symbol.valueDeclaration ?? symbol.declarations?.[0];
        if (!decl) continue;
        const type = checker.getTypeOfSymbolAtLocation(symbol, decl);
        const signatures = checker.getSignaturesOfType(type, ts.SignatureKind.Call);
        if (!(symbol.flags & ts.SymbolFlags.Value) || !signatures.length) {
          if (symbol.declarations?.some((d) => ts.isTypeAliasDeclaration(d) || ts.isInterfaceDeclaration(d))) {
            family.types.push({ name: displayName, declaration: clean(symbol.declarations.map((d) => d.getText()).join('\n')) });
          }
          continue;
        }
        const first = signatures[0].getParameters()[0];
        if (!first) continue;
        const propsType = checker.getTypeOfSymbolAtLocation(first, first.valueDeclaration ?? decl);
        const props = checker.getPropertiesOfType(propsType).filter((p) => p.name !== 'key').map((prop) => {
          const propDecl = prop.valueDeclaration ?? prop.declarations?.[0] ?? decl;
          const local = propDecl.getSourceFile().fileName.startsWith(root + '/packages/');
          const native = /node_modules\/.*@types\/react\//.test(propDecl.getSourceFile().fileName);
          return {
            name: prop.name,
            type: clean(checker.typeToString(checker.getTypeOfSymbolAtLocation(prop, propDecl), propDecl, format)),
            required: !(prop.flags & ts.SymbolFlags.Optional),
            defaultValue: defaults.get(prop.name) ?? '—',
            description: ts.displayPartsToString(prop.getDocumentationComment(checker)),
            source: local ? path.relative(root, propDecl.getSourceFile().fileName) : native ? 'React 原生属性' : 'Radix / 底层库',
            inherited: native,
          };
        }).sort((a, b) => Number(a.inherited) - Number(b.inherited) || a.name.localeCompare(b.name));
        family.exports.push({ name: displayName, props });
        // Public namespace members such as Form.Item and Typography.Title.
        for (const member of checker.getPropertiesOfType(type)) {
          if (!/^[A-Z]/.test(member.name)) continue;
          const memberType = checker.getTypeOfSymbolAtLocation(member, member.valueDeclaration ?? decl);
          if (!checker.getSignaturesOfType(memberType, ts.SignatureKind.Call).length) continue;
          family.types.push({ name: `${displayName}.${member.name}`, declaration: clean(checker.typeToString(memberType, decl, format)) });
        }
      }
      if (family.exports.length || name === 'Icons') families.push(family);
    }
  }
  for (const family of families) {
    const references = family.exports.flatMap((entry) => entry.props.map((prop) => prop.type)).join(' ');
    for (const type of sharedTypes) {
      if (new RegExp(`\\b${type.name}\\b`).test(references) && !family.types.some((existing) => existing.name === type.name)) family.types.push(type);
    }
  }
  return families;
}

const root = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const families = extractApi(root);
  const properties = [];
  const indices = new Map();
  const compact = families.map((family) => ({ ...family, exports: family.exports.map((entry) => ({ ...entry, props: entry.props.map((prop) => {
    const key = JSON.stringify(prop);
    if (!indices.has(key)) { indices.set(key, properties.length); properties.push(prop); }
    return indices.get(key);
  }) })) }));
  writeFileSync(path.join(root, 'apps/storybook/docs/api.generated.json'), JSON.stringify({ properties, families: compact }) + '\n');
  console.log(`Generated source API: ${families.length} families, ${families.reduce((n, f) => n + f.exports.length, 0)} component exports.`);
}
