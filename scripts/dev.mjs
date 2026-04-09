import { mkdir, rm, writeFile } from 'node:fs/promises';
import esbuild from 'esbuild';

const devHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta
      name="description"
      content="MorCSA is a game-style APCSA study site with mini questions, fill-in-the-blank code, explanations, and pixel-art mentors."
    />
    <title>MorCSA | APCSA Score-5 Quest</title>
    <link rel="stylesheet" href="./assets/main.css" />
    <script defer src="./assets/main.js"></script>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
`;

await rm('dist', { recursive: true, force: true });
await mkdir('dist', { recursive: true });
await writeFile('dist/index.html', devHtml);

const ctx = await esbuild.context({
  entryPoints: ['src/main.tsx'],
  outdir: 'dist/assets',
  entryNames: '[name]',
  assetNames: '[name]',
  bundle: true,
  format: 'iife',
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
const host = '127.0.0.1';
const port = 4173;
const server = await ctx.serve({
  servedir: 'dist',
  host,
  port,
});

console.log(`MorCSA dev server running at http://${host}:${port}`);

const close = async () => {
  await ctx.dispose();
  process.exit(0);
};

process.on('SIGINT', close);
process.on('SIGTERM', close);
