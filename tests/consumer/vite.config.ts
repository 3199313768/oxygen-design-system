import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'oxygen-package-module-evidence',
      generateBundle(_options, bundle) {
        const modules = Object.values(bundle)
          .filter((output) => output.type === 'chunk')
          .flatMap((chunk) => Object.entries(chunk.modules).map(([id, module]) => ({
            id,
            renderedExports: module.renderedExports,
            renderedLength: module.renderedLength,
          })));
        this.emitFile({
          type: 'asset',
          fileName: 'package-modules.json',
          source: JSON.stringify(modules, null, 2),
        });
      },
    },
  ],
});
