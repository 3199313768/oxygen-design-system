import { preview } from 'vite';

await preview({
  configFile: false,
  build: { outDir: 'apps/storybook/storybook-static' },
  preview: { host: '127.0.0.1', port: Number(process.env.OXYGEN_DOCS_PORT ?? 6016), strictPort: true },
});
