import type { APIRoute } from 'astro';
import { generateOgImage } from '../../../lib/og';

const DEFAULT_TITLE = 'JK.com | Enterprise Cloud Consulting — Jayson Knight';
const DEFAULT_DESCRIPTION =
  'Jayson Knight — Solutions Architect specializing in Microsoft Azure, Cloudflare, and .NET. 20+ years building enterprise software that scales.';

const getPagePath = (pathParam: string | undefined): string => {
  if (!pathParam) {
    return '/';
  }

  return `/${pathParam}`;
};

export const GET: APIRoute = async ({ params, request }) => {
  const url = new URL(request.url);
  const title = url.searchParams.get('title')?.trim() || DEFAULT_TITLE;
  const description = url.searchParams.get('description')?.trim() || DEFAULT_DESCRIPTION;
  const pagePath = getPagePath(params.path);

  const png = await generateOgImage({
    title,
    description,
    path: pagePath,
    origin: url.origin,
  });

  return new Response(png, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control':
        'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800',
    },
  });
};
