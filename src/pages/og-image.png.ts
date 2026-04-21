import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { generateOgImage } from '../lib/og';
import { generateFallbackOgPng } from '../lib/og-fallback';
import { DEFAULT_OG_DESCRIPTION, DEFAULT_OG_TITLE } from '../lib/og-defaults';

const STATIC_OG_FALLBACK_PATH = '/og-fallback.png';

let fallbackOgPngPromise: Promise<Uint8Array<ArrayBuffer>> | undefined;

const getFallbackOgPng = (): Promise<Uint8Array<ArrayBuffer>> => {
  if (!fallbackOgPngPromise) {
    fallbackOgPngPromise = generateFallbackOgPng().catch((error) => {
      fallbackOgPngPromise = undefined;
      throw error;
    });
  }
  return fallbackOgPngPromise;
};

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
    console.error('[og-image.png] generateOgImage failed — serving solid-color fallback:', err);

    try {
      const fallbackUrl = new URL(STATIC_OG_FALLBACK_PATH, request.url).toString();
      const staticFallbackResponse =
        typeof env?.ASSETS?.fetch === 'function'
          ? await env.ASSETS.fetch(new Request(fallbackUrl))
          : await fetch(fallbackUrl);

      if (staticFallbackResponse.ok) {
        return new Response(staticFallbackResponse.body, {
          status: 200,
          headers: {
            'Content-Type': 'image/png',
            'Cache-Control':
              'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800',
          },
        });
      }
    } catch (staticFallbackError) {
      console.error('[og-image.png] static fallback failed:', staticFallbackError);
    }

    return new Response(await getFallbackOgPng(), {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'no-store',
      },
    });
  }
};
