import { beforeEach, describe, expect, it, vi } from 'vitest';

const generateOgImage = vi.fn();

vi.mock('../../../lib/og', () => ({
  generateOgImage,
}));

import { GET } from './[...path]';

describe('GET /api/og/[...path]', () => {
  beforeEach(() => {
    generateOgImage.mockReset();
    generateOgImage.mockResolvedValue(Uint8Array.from([1, 2, 3]));
  });

  it('uses defaults when query params are missing', async () => {
    const response = await GET({
      params: {},
      request: new Request('https://example.com/api/og'),
    } as Parameters<typeof GET>[0]);
    const body = new Uint8Array(await response.arrayBuffer());

    expect(generateOgImage).toHaveBeenCalledWith({
      title: 'JK.com | Enterprise Cloud Consulting — Jayson Knight',
      description:
        'Jayson Knight — Solutions Architect specializing in Microsoft Azure, Cloudflare, and .NET. 20+ years building enterprise software that scales.',
      path: '/',
      origin: 'https://example.com',
    });
    expect(Array.from(body)).toEqual([1, 2, 3]);
    expect(response.headers.get('Content-Type')).toBe('image/png');
    expect(response.headers.get('Cache-Control')).toBe(
      'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800'
    );
  });

  it('trims custom query params and builds prefixed paths', async () => {
    await GET({
      params: { path: 'blog/new-post' },
      request: new Request('https://example.com/api/og?title=%20Custom%20&description=%20Desc%20'),
    } as Parameters<typeof GET>[0]);

    expect(generateOgImage).toHaveBeenCalledWith({
      title: 'Custom',
      description: 'Desc',
      path: '/blog/new-post',
      origin: 'https://example.com',
    });
  });
});
