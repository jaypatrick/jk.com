import { defineConfig } from 'vitest/config';
import astroConfig from './astro.config';
import { fileURLToPath } from 'node:url';

const site = astroConfig.site;
const resolvedSite = site ? JSON.stringify(site) : undefined;
const cloudflareWorkersStubPath = fileURLToPath(
  new URL('./src/test/cloudflare-workers.stub.ts', import.meta.url)
);

export default defineConfig({
  // Bake in import.meta.env.SITE so og.ts resolves SITE_ORIGIN correctly in tests.
  define: resolvedSite
    ? {
        'import.meta.env.SITE': resolvedSite,
      }
    : {},
  test: {
    include: ['src/**/*.test.ts'],
  },
  resolve: {
    alias: {
      'cloudflare:workers': cloudflareWorkersStubPath,
    },
  },
});
