import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import svelte from '@astrojs/svelte';
import tailwindcss from '@tailwindcss/vite';
import emdash from 'emdash/astro';

// https://astro.build/config
export default defineConfig({
  output: 'server',

  adapter: cloudflare({
    // Astro 6 uses workerd runtime natively — no platformProxy config needed
    imageService: 'passthrough',
    routes: {
      extend: {
        exclude: [{ pattern: '/_emdash/*' }],
      },
    },
  }),

  integrations: [
    svelte(),
    emdash({
      db: { binding: 'DB' },
      storage: { binding: 'MEDIA_BUCKET' },
    }),
  ],

  // Vite 8 with Rolldown (Rust compiler) — enabled by default in Astro 6
  vite: {
    plugins: [tailwindcss()],
    build: {
      // Rolldown is default in Vite 8; explicitly opt-in to native bundler
      rollupOptions: {},
    },
  },

  // Built-in Fonts API (stable in Astro 6)
  // Fonts are loaded via CSS custom properties and @font-face injection
  // Using Google Fonts via the built-in provider
  experimental: {
    fonts: [
      {
        provider: 'google',
        name: 'Space Grotesk',
        cssVariable: '--font-heading',
        weights: [300, 400, 500, 600, 700],
        styles: ['normal'],
      },
      {
        provider: 'google',
        name: 'JetBrains Mono',
        cssVariable: '--font-mono',
        weights: [400, 500],
        styles: ['normal'],
        subsets: ['latin'],
      },
    ],
  },

  // Astro Route Caching — set cache headers per page via middleware
  // See src/middleware.ts for per-route cache control

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

  // Live Content Collections (stable in Astro 6)
  // Used for dynamic data that updates without a rebuild

  site: 'https://jaysonknight.com',
});
