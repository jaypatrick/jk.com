/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

// Cloudflare Workers runtime bindings
// Run `npm run types` after updating wrangler.jsonc to regenerate this
interface CloudflareBindings {
  // D1 — EmDash blog database
  jk_emdash: D1Database;
  // R2 — EmDash media bucket
  jk_media: R2Bucket;
  // KV — edge cache
  CACHE: KVNamespace;
  // Analytics Engine — custom events
  ANALYTICS: AnalyticsEngineDataset;
  // Static assets
  ASSETS: Fetcher;
  // Vars
  ENVIRONMENT: string;
  SITE_URL: string;
}

declare namespace App {
  interface Locals extends CloudflareBindings {
    runtime: {
      env: CloudflareBindings;
      ctx: ExecutionContext;
      cf: CfProperties;
    };
  }
}

declare module '*.wasm?module' {
  const module: WebAssembly.Module;
  export default module;
}
