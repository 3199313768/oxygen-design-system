import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import hooks from 'eslint-plugin-react-hooks';
import a11y from 'eslint-plugin-jsx-a11y';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('.', import.meta.url));
const typescriptFiles = ['packages/*/{src,tests}/**/*.{ts,tsx}', 'tests/{browser,workbench}/**/*.{ts,tsx}', 'playwright.config.ts', 'playwright.docs.config.ts', 'playwright.foundation.config.ts', 'tests/{docs,foundation}/**/*.ts',
  'apps/storybook/docs/**/*.{ts,tsx}', 'apps/storybook/stories/components/**/*.tsx'];

export default tseslint.config(
  { ignores: ['**/node_modules/**', '**/dist/**', 'output/**', '**/storybook-static/**', 'apps/storybook/.storybook/**', 'apps/storybook/stories/*.stories.tsx'] },
  {
    files: ['*.mjs', 'scripts/**/*.mjs', 'tests/tooling/**/*.mjs', 'apps/storybook/docs/*.mjs'],
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
      'jsx-a11y/label-has-associated-control': ['error', { controlComponents: ['Checkbox', 'RadioGroupItem', 'Switch'] }],
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
);
