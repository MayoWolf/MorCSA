import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import esbuild from 'esbuild';

const htmlTemplate = await readFile('index.html', 'utf8');
const devHtml = htmlTemplate.replace(
  '<script type="module" src="/src/main.tsx"></script>',
  [
    '<link rel="stylesheet" href="/assets/main.css" />',
    '    <script type="module" src="/assets/main.js"></script>',
  ].join('\n'),
);

await rm('dist', { recursive: true, force: true });
await mkdir('dist', { recursive: true });
await writeFile('dist/index.html', devHtml);

const ctx = await esbuild.context({
  entryPoints: ['src/main.tsx'],
  outdir: 'dist/assets',
  entryNames: '[name]',
  assetNames: '[name]',
  bundle: true,
  format: 'esm',
  sourcemap: true,
  jsx: 'automatic',
  platform: 'browser',
  target: ['es2020'],
  loader: {
    '.css': 'css',
  },
  define: {
    'process.env.NODE_ENV': '"development"',
  },
});

await ctx.watch();
const server = await ctx.serve({
  servedir: 'dist',
  host: '127.0.0.1',
  port: 4173,
});

console.log(`MorCSA dev server running at http://${server.host}:${server.port}`);

const close = async () => {
  await ctx.dispose();
  process.exit(0);
};

process.on('SIGINT', close);
process.on('SIGTERM', close);
