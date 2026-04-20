import { defineConfig, fontProviders } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import svelte from '@astrojs/svelte';
import tailwindcss from '@tailwindcss/vite';
import emdash from 'emdash/astro';
import { d1, r2 } from '@emdash-cms/cloudflare';

// https://astro.build/config
export default defineConfig({
  output: 'server',

  adapter: cloudflare({
    // Astro 6 uses workerd runtime natively — no platformProxy config needed
    imageService: 'passthrough',
  }),

  integrations: [
    svelte(),
    emdash({
      database: d1({ binding: 'jk_emdash' }),
      storage: r2({ binding: 'jk_media' }),
    }),
  ],

  // Vite 8 with Rolldown (Rust compiler) — enabled by default in Astro 6
  vite: {
    plugins: [tailwindcss()],
    build: {
      rollupOptions: {},
    },
  },

  // Built-in Fonts API (stable in Astro 6)
  fonts: [
    {
      provider: fontProviders.google(),
      name: 'Space Grotesk',
      cssVariable: '--font-heading',
      weights: [300, 400, 500, 600, 700],
      styles: ['normal'],
    },
    {
      provider: fontProviders.google(),
      name: 'JetBrains Mono',
      cssVariable: '--font-mono',
      weights: [400, 500],
      styles: ['normal'],
      subsets: ['latin'],
    },
  ],

  // Content Security Policy (stable in Astro 6)
  // NOTE: verify exact API shape with `npx astro check` — the middleware fallback
  // in src/middleware.ts handles CSP if this config key differs in your version.
  // Uncomment and adjust once confirmed:
  //
  // contentSecurityPolicy: {
  //   mode: 'hash',
  //   directives: {
  //     'default-src': ["'self'"],
  //     'script-src': ["'self'", "'strict-dynamic'", 'https://static.cloudflareinsights.com'],
  //     'style-src': ["'self'", "'unsafe-inline'"],
  //     'img-src': ["'self'", 'data:', 'blob:', 'https:'],
  //     'font-src': ["'self'", 'data:', 'https://fonts.gstatic.com'],
  //     'connect-src': ["'self'", 'https://cloudflareinsights.com'],
  //     'frame-ancestors': ["'none'"],
  //     'base-uri': ["'self'"],
  //     'form-action': ["'self'"],
  //   },
  // },

  site: 'https://jaysonknight.com',
});
