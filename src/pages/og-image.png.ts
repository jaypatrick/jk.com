import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { generateOgImage } from '../lib/og';
import { DEFAULT_OG_DESCRIPTION, DEFAULT_OG_TITLE } from '../lib/og-defaults';

// 1x1 transparent PNG fallback to preserve a valid image response for crawlers.
const FALLBACK_OG_PNG = Uint8Array.from([
  137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82, 0, 0, 0, 1, 0, 0, 0, 1, 8,
  6, 0, 0, 0, 31, 21, 196, 137, 0, 0, 0, 13, 73, 68, 65, 84, 120, 156, 99, 248, 255, 255, 63,
  0, 5, 254, 2, 254, 220, 204, 89, 224, 0, 0, 0, 0, 73, 69, 78, 68, 174, 66, 96, 130,
]);

export const GET: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const fetchAsset =
      typeof env?.ASSETS?.fetch === 'function'
        ? (assetUrl: string) => env.ASSETS.fetch(new Request(assetUrl))
        : undefined;

    const png = await generateOgImage({
      title: DEFAULT_OG_TITLE,
      description: DEFAULT_OG_DESCRIPTION,
      path: '/',
      assetOrigin: url.origin,
      fetchAsset,
    });

    return new Response(png as BodyInit, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control':
          'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800',
      },
    });
  } catch (err) {
    console.error('[og-image.png] generateOgImage failed:', err);
    return new Response(FALLBACK_OG_PNG, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'no-store',
      },
    });
  }
};
