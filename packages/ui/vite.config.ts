import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

const packageRoot = fileURLToPath(new URL('.', import.meta.url));
const packageManifest = JSON.parse(
  readFileSync(resolve(packageRoot, 'package.json'), 'utf8'),
) as { dependencies?: Record<string, string> };
const externalDependencies = [
  'react',
  'react-dom',
  'react/jsx-runtime',
  ...Object.keys(packageManifest.dependencies ?? {}),
];
const isExternalDependency = (id: string) =>
  externalDependencies.some(
    (dependency) => id === dependency || id.startsWith(`${dependency}/`),
  );

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    dts({
      include: ['src'],
      tsconfigPath: './tsconfig.json',
    }),
  ],
  build: {
    cssCodeSplit: false,
    lib: {
      entry: resolve(packageRoot, 'src/index.ts'),
      cssFileName: 'styles',
      fileName: 'index',
      formats: ['es'],
    },
    rollupOptions: {
      external: isExternalDependency,
      output: {
        preserveModules: true,
        preserveModulesRoot: resolve(packageRoot, 'src'),
        entryFileNames: '[name].js',
        banner: "'use client';",
      },
    },
    sourcemap: true,
  },
});
