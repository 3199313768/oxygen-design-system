import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

const packageRoot = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  plugins: [
    react(),
    dts({
      include: ['src'],
      tsconfigPath: './tsconfig.build.json',
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
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        '@oxygen-design/ui',
      ],
    },
    sourcemap: true,
  },
});
