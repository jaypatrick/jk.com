# jk.com

Personal site and blog for [Jayson Knight](https://jaysonknight.com), built on a modern edge-first stack.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Astro 6](https://astro.build) — server-rendered, edge-optimised |
| **UI Components** | [Svelte 5](https://svelte.dev) |
| **Styling** | [Tailwind CSS 4](https://tailwindcss.com) |
| **Language** | TypeScript 5 |
| **Runtime / Deploy** | [Cloudflare Workers](https://workers.cloudflare.com) (via `@astrojs/cloudflare`) |
| **CMS** | [EmDash](https://emdash.dev) — headless blog CMS for Astro |
| **Database** | Cloudflare D1 (SQLite at the edge) |
| **Media Storage** | Cloudflare R2 |
| **Edge Cache / Sessions** | Cloudflare KV |
| **Analytics** | Cloudflare Analytics Engine |
| **Build tooling** | Vite 8 w/ Rolldown (Rust compiler, default in Astro 6) |
| **Fonts** | Google Fonts via Astro's built-in Fonts API (Space Grotesk, JetBrains Mono) |
| **API layer** | [Hono](https://hono.dev) |
| **Validation** | [Zod 4](https://zod.dev) |
| **Syntax highlighting** | [Shiki 4](https://shiki.style) |

---

## Blog

The blog is powered by **EmDash**, a headless CMS built for Astro. Content is stored in a Cloudflare D1 database; media assets live in R2.

---

## Getting Started

```bash
# Install dependencies
npm install

# Start local dev server
npm run dev

# Build for production
npm run build

# Deploy to Cloudflare Workers
npm run deploy
```

> Requires Node ≥ 24 and a Cloudflare account with D1, R2, KV, and Analytics Engine resources provisioned. See `wrangler.jsonc` for binding names and `npm run db:create` to initialise the D1 database.

---

## Environment

Copy `.env.example` to `.env` and populate the required values. Secrets should be set via `wrangler secret put` for production deployments.