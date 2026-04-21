import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { generateOgImage } from '../../../lib/og';
import { generateFallbackOgPng } from '../../../lib/og-fallback';
import { DEFAULT_OG_DESCRIPTION, DEFAULT_OG_TITLE } from '../../../lib/og-defaults';

const STATIC_OG_FALLBACK_PATH = '/og-fallback.png';
const OG_IMAGE_CACHE_CONTROL =
  'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800';

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

const getPagePath = (pathParam: string | undefined): string => {
  if (!pathParam) {
    return '/';
  }

  return `/${pathParam}`;
};

export const GET: APIRoute = async ({ params, request }) => {
  try {
    const url = new URL(request.url);
    const title = url.searchParams.get('title')?.trim() || DEFAULT_OG_TITLE;
    const description = url.searchParams.get('description')?.trim() || DEFAULT_OG_DESCRIPTION;
    const pagePath = getPagePath(params.path);
    const fetchAsset =
      typeof env?.ASSETS?.fetch === 'function'
        ? (assetUrl: string) => env.ASSETS.fetch(new Request(assetUrl))
        : undefined;

    const png = await generateOgImage({
      title,
      description,
      path: pagePath,
      assetOrigin: url.origin,
      fetchAsset,
    });
    return new Response(png as BodyInit, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': OG_IMAGE_CACHE_CONTROL,
      },
    });
  } catch (err) {
    console.error('[og] generateOgImage failed:', err);

    try {
      if (typeof env?.ASSETS?.fetch === 'function') {
        const fallbackUrl = new URL(STATIC_OG_FALLBACK_PATH, request.url).toString();
        const staticFallbackResponse = await env.ASSETS.fetch(new Request(fallbackUrl));

        if (staticFallbackResponse.ok) {
          return new Response(staticFallbackResponse.body, {
            status: 200,
            headers: {
              'Content-Type': 'image/png',
              'Cache-Control': OG_IMAGE_CACHE_CONTROL,
            },
          });
        }
      }
    } catch (fallbackErr) {
      console.error('[og] static fallback failed:', fallbackErr);
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
