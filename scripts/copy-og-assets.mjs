import { copyFileSync, mkdirSync } from 'node:fs';

try {
  mkdirSync('public/fonts', { recursive: true });
  copyFileSync('node_modules/@resvg/resvg-wasm/index_bg.wasm', 'public/resvg.wasm');
  copyFileSync(
    'node_modules/@fontsource/space-grotesk/files/space-grotesk-latin-400-normal.woff',
    'public/fonts/space-grotesk-400.woff'
  );
  copyFileSync(
    'node_modules/@fontsource/space-grotesk/files/space-grotesk-latin-700-normal.woff',
    'public/fonts/space-grotesk-700.woff'
  );
} catch (error) {
  console.error('postinstall asset copy failed:', error);
  process.exit(1);
}
