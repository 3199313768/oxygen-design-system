import { preview } from 'vite';

if (!process.env.OXYGEN_CONSUMER_DIST) {
  throw new Error('Run pnpm verify:workbench to serve the installed tarball consumer.');
}

await preview({
  configFile: false,
  build: { outDir: process.env.OXYGEN_CONSUMER_DIST },
  preview: { host: '127.0.0.1', port: Number(process.env.OXYGEN_WORKBENCH_PORT ?? 4173), strictPort: true },
});
