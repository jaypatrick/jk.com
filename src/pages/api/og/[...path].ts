import type { APIRoute } from 'astro';
import { generateOgImage } from '../../../lib/og';
import { DEFAULT_OG_DESCRIPTION, DEFAULT_OG_TITLE } from '../../../lib/og-defaults';

const getPagePath = (pathParam: string | undefined): string => {
  if (!pathParam) {
    return '/';
  }

  return `/${pathParam}`;
};

export const GET: APIRoute = async ({ params, request, locals }) => {
  try {
    const url = new URL(request.url);
    const title = url.searchParams.get('title')?.trim() || DEFAULT_OG_TITLE;
    const description = url.searchParams.get('description')?.trim() || DEFAULT_OG_DESCRIPTION;
    const pagePath = getPagePath(params.path);

    const png = await generateOgImage({
      title,
      description,
      path: pagePath,
      assetOrigin: url.origin,
      fetchAsset: (assetUrl) => locals.runtime.env.ASSETS.fetch(new Request(assetUrl)),
    });
    return new Response(png, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control':
          'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800',
      },
    });
  } catch (err) {
    console.error('[og] generateOgImage failed:', err);
    return new Response('OG image generation failed', {
      status: 500,
      headers: {
        'Content-Type': 'text/plain',
        'Cache-Control': 'no-store, no-cache',
      },
    });
  }
};
