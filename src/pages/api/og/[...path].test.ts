import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_OG_DESCRIPTION, DEFAULT_OG_TITLE } from '../../../lib/og-defaults';

const { generateOgImage, assetsFetch } = vi.hoisted(() => ({
  generateOgImage: vi.fn(),
  assetsFetch: vi.fn(),
}));

vi.mock('../../../lib/og', () => ({
  generateOgImage,
}));
vi.mock('cloudflare:workers', () => ({
  env: {
    ASSETS: {
      fetch: assetsFetch,
    },
  },
}));

import { GET } from './[...path]';

describe('GET /api/og/[...path]', () => {
  beforeEach(() => {
    generateOgImage.mockReset();
    generateOgImage.mockResolvedValue(Uint8Array.from([1, 2, 3]));
    assetsFetch.mockReset();
    assetsFetch.mockResolvedValue(new Response(''));
  });

  it('uses defaults when query params are missing', async () => {
    const response = await GET({
      params: {},
      request: new Request('https://example.com/api/og'),
    } as unknown as Parameters<typeof GET>[0]);
    const body = new Uint8Array(await response.arrayBuffer());

    expect(generateOgImage).toHaveBeenCalledWith(
      expect.objectContaining({
        title: DEFAULT_OG_TITLE,
        description: DEFAULT_OG_DESCRIPTION,
        path: '/',
        assetOrigin: 'https://example.com',
        fetchAsset: expect.any(Function),
      })
    );
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
    } as unknown as Parameters<typeof GET>[0]);

    expect(generateOgImage).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Custom',
        description: 'Desc',
        path: '/blog/new-post',
        assetOrigin: 'https://example.com',
        fetchAsset: expect.any(Function),
      })
    );
  });

  it('returns only the PNG Uint8Array view bytes', async () => {
    const backingBytes = Uint8Array.from([99, 1, 2, 3, 88]);
    generateOgImage.mockResolvedValue(backingBytes.subarray(1, 4));

    const response = await GET({
      params: { path: 'blog/new-post' },
      request: new Request('https://example.com/api/og?title=Custom&description=Desc'),
    } as unknown as Parameters<typeof GET>[0]);

    const body = new Uint8Array(await response.arrayBuffer());

    expect(body.byteLength).toBe(3);
    expect(Array.from(body)).toEqual([1, 2, 3]);
  });

  it('returns plain-text 500 response when generation fails', async () => {
    generateOgImage.mockRejectedValue(new Error('boom'));

    const response = await GET({
      params: { path: 'blog/new-post' },
      request: new Request('https://example.com/api/og?title=Custom&description=Desc'),
    } as unknown as Parameters<typeof GET>[0]);

    expect(response.status).toBe(500);
    expect(response.headers.get('Content-Type')).toBe('text/plain');
    expect(response.headers.get('Cache-Control')).toBe('no-store, no-cache');
    await expect(response.text()).resolves.toBe('OG image generation failed');
  });
});
