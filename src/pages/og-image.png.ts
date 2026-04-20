import type { APIRoute } from 'astro';
import { generateOgImage } from '../lib/og';

const DEFAULT_TITLE = 'JK.com | Enterprise Cloud Consulting — Jayson Knight';
const DEFAULT_DESCRIPTION =
  'Jayson Knight — Solutions Architect specializing in Microsoft Azure, Cloudflare, and .NET. 20+ years building enterprise software that scales.';

export const GET: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url);

    const png = await generateOgImage({
      title: DEFAULT_TITLE,
      description: DEFAULT_DESCRIPTION,
      path: '/',
      assetOrigin: url.origin,
    });

    const pngBody = png.buffer instanceof ArrayBuffer ? png.buffer : png.slice().buffer;

    return new Response(pngBody, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control':
          'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800',
      },
    });
  } catch (err) {
    console.error('[og-image.png] generateOgImage failed:', err);
    return new Response('OG image generation failed', {
      status: 500,
      headers: {
        'Content-Type': 'text/plain',
        'Cache-Control': 'no-store, no-cache',
      },
    });
  }
};
