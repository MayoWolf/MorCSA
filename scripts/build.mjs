import { mkdir, rm, writeFile } from 'node:fs/promises';
import esbuild from 'esbuild';

const builtHtml = `<!doctype html>
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

await esbuild.build({
  entryPoints: ['src/main.tsx'],
  outdir: 'dist/assets',
  entryNames: '[name]',
  assetNames: '[name]',
  bundle: true,
  format: 'iife',
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
