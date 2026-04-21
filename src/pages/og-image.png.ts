import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { generateOgImage } from '../lib/og';
import { generateFallbackOgPng } from '../lib/og-fallback';
import { DEFAULT_OG_DESCRIPTION, DEFAULT_OG_TITLE } from '../lib/og-defaults';

let fallbackOgPngPromise: Promise<Uint8Array> | undefined;

const getFallbackOgPng = (): Promise<Uint8Array> => {
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
    return new Response(Uint8Array.from(await getFallbackOgPng()), {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'no-store',
      },
    });
  }
};
