import { defineMiddleware, sequence } from 'astro:middleware';

// Security headers middleware — defense-in-depth CSP + hardening
const securityHeaders = defineMiddleware(async ({ url }, next) => {
  const response = await next();

  // Clone the response to add headers
  const newResponse = new Response(response.body, response);

  // Core security headers
  newResponse.headers.set('X-Content-Type-Options', 'nosniff');
  newResponse.headers.set('X-Frame-Options', 'DENY');
  newResponse.headers.set('X-XSS-Protection', '1; mode=block');
  newResponse.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  newResponse.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=()'
  );
  newResponse.headers.set(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains; preload'
  );

  // Content Security Policy
  // This complements the Astro 6 built-in CSP (astro.config.ts contentSecurityPolicy).
  // If CSP is not fully handled by Astro, this middleware ensures it's always set.
  const isHtml = (newResponse.headers.get('content-type') ?? '').includes('text/html');
  if (isHtml) {
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' data: https://fonts.gstatic.com",
      "img-src 'self' data: blob: https:",
      "connect-src 'self' https://cloudflareinsights.com https://static.cloudflareinsights.com",
      "media-src 'self'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "upgrade-insecure-requests",
    ].join('; ');

    // Only set if not already set by Astro's built-in CSP
    if (!newResponse.headers.has('content-security-policy')) {
      newResponse.headers.set('content-security-policy', csp);
    }
  }

  return newResponse;
});

// Route caching middleware — Cloudflare-native Cache-Control
const routeCache = defineMiddleware(async ({ request, url }, next) => {
  const response = await next();

  // Static content — cache aggressively at Cloudflare edge
  if (url.pathname.startsWith('/assets/') || url.pathname.startsWith('/_astro/')) {
    const cached = new Response(response.body, response);
    cached.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    return cached;
  }

  // Blog pages — cache with revalidation
  if (url.pathname.startsWith('/blog')) {
    const cached = new Response(response.body, response);
    cached.headers.set('Cache-Control', 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400');
    return cached;
  }

  // Homepage — short-lived edge cache
  if (url.pathname === '/') {
    const cached = new Response(response.body, response);
    cached.headers.set('Cache-Control', 'public, max-age=60, s-maxage=600, stale-while-revalidate=3600');
    return cached;
  }

  // API routes — no caching
  if (url.pathname.startsWith('/api/')) {
    const nocache = new Response(response.body, response);
    nocache.headers.set('Cache-Control', 'no-store, no-cache');
    return nocache;
  }

  return response;
});

export const onRequest = sequence(securityHeaders, routeCache);
