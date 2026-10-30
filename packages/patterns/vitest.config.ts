import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const packageRoot = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@oxygen-design/ui': resolve(packageRoot, '../ui/src/index.ts'),
    },
  },
  test: {
    fsModuleCachePath: './node_modules/.vitest-cache',
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.d.ts', 'src/index.ts'],
      reportsDirectory: '../../output/coverage/patterns',
      reporter: ['text', 'html', 'json-summary', 'lcov'],
      thresholds: { statements: 100, branches: 77, functions: 100, lines: 100 },
    },
  },
});
