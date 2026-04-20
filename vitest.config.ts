import { defineConfig } from 'vitest/config';

export default defineConfig({
  // Bake in import.meta.env.SITE so og.ts resolves SITE_ORIGIN correctly in tests.
  define: {
    'import.meta.env.SITE': JSON.stringify('https://jaysonknight.com'),
  },
  test: {
    include: ['src/**/*.test.ts'],
  },
});
