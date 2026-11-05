import assert from 'node:assert/strict';
import test from 'node:test';
import {
  rewriteDeclarationSpecifiers,
  stripCssImports,
} from '../../scripts/finalize-package-dist.mjs';

test('adds .js to extensionless relative declaration specifiers', () => {
  const source = [
    "export { Button } from './components/Button';",
    "export type { ButtonProps } from './components/Button';",
    "import { cn } from '../lib/cn';",
    "export type { Variant } from 'class-variance-authority';",
    "type Local = import('./components/Button').ButtonProps;",
    "export { styles } from './styles.css';",
  ].join('\n');

  assert.equal(rewriteDeclarationSpecifiers(source), [
    "export { Button } from './components/Button.js';",
    "export type { ButtonProps } from './components/Button.js';",
    "import { cn } from '../lib/cn.js';",
    "export type { Variant } from 'class-variance-authority';",
    "type Local = import('./components/Button.js').ButtonProps;",
    "export { styles } from './styles.css';",
  ].join('\n'));
});

test('strips stylesheet imports from the JavaScript entry', () => {
  const source = `"use client";
"use client";
import './styles.css';
import "./styles/index.css";
/* empty css             */
export { Button } from './components/Button.js';
`;
  assert.equal(stripCssImports(source), `"use client";
export { Button } from './components/Button.js';
`);
});
