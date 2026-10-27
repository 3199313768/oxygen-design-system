import { copyFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const packageRoot = process.cwd();

await copyFile(
  resolve(packageRoot, 'src/styles/tokens.css'),
  resolve(packageRoot, 'dist/tokens.css'),
);
