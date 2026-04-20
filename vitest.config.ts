import { defineConfig } from 'vitest/config';
import astroConfig from './astro.config';

const site = astroConfig.site;
const resolvedSite = site ? JSON.stringify(String(site)) : undefined;

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
});
