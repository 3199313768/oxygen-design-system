import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: {
    fsModuleCachePath: './node_modules/.vitest-cache',
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.d.ts', 'src/index.ts'],
      reportsDirectory: '../../output/coverage/ui',
      reporter: ['text', 'html', 'json-summary', 'lcov'],
      thresholds: { statements: 90, branches: 82, functions: 90, lines: 93 },
    },
  },
});
