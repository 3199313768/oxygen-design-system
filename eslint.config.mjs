import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import hooks from 'eslint-plugin-react-hooks';
import a11y from 'eslint-plugin-jsx-a11y';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('.', import.meta.url));
const typescriptFiles = ['packages/*/{src,tests}/**/*.{ts,tsx}', 'tests/{browser,workbench}/**/*.{ts,tsx}', 'playwright.config.ts'];

export default tseslint.config(
  { ignores: ['**/node_modules/**', '**/dist/**', 'output/**', 'apps/storybook/**'] },
  {
    files: ['*.mjs', 'scripts/**/*.mjs', 'tests/tooling/**/*.mjs'],
    extends: [js.configs.recommended],
    languageOptions: {
      globals: { process: 'readonly', console: 'readonly', Buffer: 'readonly', URL: 'readonly',
        fetch: 'readonly', AbortSignal: 'readonly', setTimeout: 'readonly', clearTimeout: 'readonly' },
    },
  },
  {
    files: typescriptFiles,
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: {
      globals: { document: 'readonly', window: 'readonly', console: 'readonly' },
    },
    plugins: { 'react-hooks': hooks, 'jsx-a11y': a11y },
    rules: {
      ...a11y.flatConfigs.recommended.rules,
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'error',
      'no-console': 'error',
      'no-restricted-syntax': ['error', {
        selector: 'JSXAttribute[name.name="dangerouslySetInnerHTML"]',
        message: 'Render safe React content instead of injecting raw HTML.',
      }],
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      '@typescript-eslint/no-empty-object-type': ['error', { allowInterfaces: 'with-single-extends' }],
      'jsx-a11y/label-has-associated-control': ['error', { controlComponents: ['Checkbox'] }],
      // Named scroll regions need keyboard access even though they are not controls.
      'jsx-a11y/no-noninteractive-tabindex': ['error', { roles: ['tabpanel', 'region'] }],
    },
  },
  {
    files: ['packages/*/{src,tests}/**/*.{ts,tsx}', 'tests/browser/**/*.ts', 'playwright.config.ts'],
    languageOptions: {
      parserOptions: { projectService: { allowDefaultProject: ['playwright.config.ts'] }, tsconfigRootDir: root },
    },
    rules: {
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': ['error', { checksVoidReturn: { attributes: false } }],
    },
  },
  {
    files: ['packages/ui/src/components/ColorPicker.tsx'],
    rules: {
      // Preserve the existing Field button ARIA contract during this tooling change.
      // Its value-control semantics need a separate accessibility/API migration.
      'jsx-a11y/role-supports-aria-props': 'off',
    },
  },
);
