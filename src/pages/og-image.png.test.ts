import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_OG_DESCRIPTION, DEFAULT_OG_TITLE } from '../lib/og-defaults';

const { generateOgImage } = vi.hoisted(() => ({
  generateOgImage: vi.fn(),
}));

vi.mock('../lib/og', () => ({
  generateOgImage,
}));

import { GET } from './og-image.png';

describe('GET /og-image.png', () => {
  const assetsFetch = vi.fn();

  beforeEach(() => {
    generateOgImage.mockReset();
    generateOgImage.mockResolvedValue(Uint8Array.from([1, 2, 3]));
    assetsFetch.mockReset();
    assetsFetch.mockResolvedValue(new Response(''));
  });

  it('generates the default OG image with correct defaults', async () => {
    const response = await GET({
      request: new Request('https://example.com/og-image.png'),
      locals: { runtime: { env: { ASSETS: { fetch: assetsFetch } } } },
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

  it('returns only the PNG Uint8Array view bytes', async () => {
    const backingBytes = Uint8Array.from([99, 1, 2, 3, 88]);
    generateOgImage.mockResolvedValue(backingBytes.subarray(1, 4));

    const response = await GET({
      request: new Request('https://example.com/og-image.png'),
      locals: { runtime: { env: { ASSETS: { fetch: assetsFetch } } } },
    } as unknown as Parameters<typeof GET>[0]);

    const body = new Uint8Array(await response.arrayBuffer());

    expect(body.byteLength).toBe(3);
    expect(Array.from(body)).toEqual([1, 2, 3]);
  });

  it('returns plain-text 500 response when generation fails', async () => {
    generateOgImage.mockRejectedValue(new Error('boom'));

    const response = await GET({
      request: new Request('https://example.com/og-image.png'),
      locals: { runtime: { env: { ASSETS: { fetch: assetsFetch } } } },
    } as unknown as Parameters<typeof GET>[0]);

    expect(response.status).toBe(500);
    expect(response.headers.get('Content-Type')).toBe('text/plain');
    expect(response.headers.get('Cache-Control')).toBe('no-store, no-cache');
    await expect(response.text()).resolves.toBe('OG image generation failed');
  });
});
