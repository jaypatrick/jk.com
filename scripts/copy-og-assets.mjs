import { copyFileSync, mkdirSync } from 'node:fs';

try {
  mkdirSync('public/fonts', { recursive: true });
  copyFileSync(
    'node_modules/@fontsource/space-grotesk/files/space-grotesk-latin-400-normal.woff',
    'public/fonts/space-grotesk-400.woff'
  );
  copyFileSync(
    'node_modules/@fontsource/space-grotesk/files/space-grotesk-latin-700-normal.woff',
    'public/fonts/space-grotesk-700.woff'
  );

  // Ship the resvg WASM as a static asset so it is served by Cloudflare's ASSETS
  // binding rather than bundled into the Worker script. This sidesteps a Rolldown
  // (Vite 8 / Astro 6) limitation where the ?module WASM import hint does not
  // produce a valid WebAssembly.Module in the Cloudflare Workers runtime.
  mkdirSync('public/wasm', { recursive: true });
  copyFileSync(
    'node_modules/@resvg/resvg-wasm/index_bg.wasm',
    'public/wasm/resvg.wasm'
  );
} catch (error) {
  console.error('postinstall asset copy failed:', error);
  process.exit(1);
}
