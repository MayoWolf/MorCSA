import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import esbuild from 'esbuild';

const htmlTemplate = await readFile('index.html', 'utf8');
const builtHtml = htmlTemplate.replace(
  '<script type="module" src="/src/main.tsx"></script>',
  [
    '<link rel="stylesheet" href="./assets/main.css" />',
    '    <script type="module" src="./assets/main.js"></script>',
  ].join('\n'),
);

await rm('dist', { recursive: true, force: true });
await mkdir('dist', { recursive: true });

await esbuild.build({
  entryPoints: ['src/main.tsx'],
  outdir: 'dist/assets',
  entryNames: '[name]',
  assetNames: '[name]',
  bundle: true,
  format: 'esm',
  minify: true,
  sourcemap: false,
  jsx: 'automatic',
  platform: 'browser',
  target: ['es2020'],
  loader: {
    '.css': 'css',
  },
  define: {
    'process.env.NODE_ENV': '"production"',
  },
});

await writeFile('dist/index.html', builtHtml);
