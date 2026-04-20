import { defineConfig } from 'vitest/config';
import astroConfig from './astro.config';

const site = astroConfig.site;

export default defineConfig({
  // Bake in import.meta.env.SITE so og.ts resolves SITE_ORIGIN correctly in tests.
  define: {
    'import.meta.env.SITE': JSON.stringify(site),
  },
  test: {
    include: ['src/**/*.test.ts'],
  },
});
