import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_OG_DESCRIPTION, DEFAULT_OG_TITLE } from '../../../lib/og-defaults';

const { generateOgImage, generateFallbackOgPng, assetsFetch, workersEnv } = vi.hoisted(() => ({
  generateOgImage: vi.fn(),
  generateFallbackOgPng: vi.fn(),
  assetsFetch: vi.fn(),
  workersEnv: {} as { ASSETS?: { fetch: (...args: unknown[]) => unknown } },
}));

vi.mock('../../../lib/og', () => ({
  generateOgImage,
}));
vi.mock('../../../lib/og-fallback', () => ({
  generateFallbackOgPng,
}));
vi.mock('cloudflare:workers', () => ({
  env: workersEnv,
}));

import { GET } from './[...path]';

describe('GET /api/og/[...path]', () => {
  beforeEach(() => {
    generateOgImage.mockReset();
    generateOgImage.mockResolvedValue(Uint8Array.from([1, 2, 3]));
    generateFallbackOgPng.mockReset();
    generateFallbackOgPng.mockResolvedValue(Uint8Array.from([7, 8, 9]));
    assetsFetch.mockReset();
    assetsFetch.mockResolvedValue(
      new Response(Uint8Array.from([4, 5, 6]), {
        headers: { 'Content-Type': 'image/png' },
      })
    );
    workersEnv.ASSETS = { fetch: assetsFetch };
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

  it('returns static fallback PNG when generation fails', async () => {
    generateOgImage.mockRejectedValue(new Error('boom'));

    const response = await GET({
      params: { path: 'blog/new-post' },
      request: new Request('https://example.com/api/og?title=Custom&description=Desc'),
    } as unknown as Parameters<typeof GET>[0]);
    const body = new Uint8Array(await response.arrayBuffer());

    expect(response.status).toBe(200);
    expect(Array.from(body)).toEqual([4, 5, 6]);
    expect(response.headers.get('Content-Type')).toBe('image/png');
    expect(response.headers.get('Cache-Control')).toBe(
      'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800'
    );
    expect(generateFallbackOgPng).not.toHaveBeenCalled();
  });

  it('returns generated fallback PNG when generation and static fallback fail', async () => {
    generateOgImage.mockRejectedValue(new Error('boom'));
    assetsFetch.mockResolvedValue(new Response('missing', { status: 404 }));

    const response = await GET({
      params: { path: 'blog/new-post' },
      request: new Request('https://example.com/api/og?title=Custom&description=Desc'),
    } as unknown as Parameters<typeof GET>[0]);
    const body = new Uint8Array(await response.arrayBuffer());

    expect(response.status).toBe(200);
    expect(Array.from(body)).toEqual([7, 8, 9]);
    expect(response.headers.get('Content-Type')).toBe('image/png');
    expect(response.headers.get('Cache-Control')).toBe(
      'public, max-age=60, s-maxage=300, stale-while-revalidate=600'
    );
    expect(generateFallbackOgPng).toHaveBeenCalledTimes(1);
  });

  it('falls back to internal asset fetch when ASSETS binding is unavailable', async () => {
    delete workersEnv.ASSETS;

    await GET({
      params: { path: 'blog/new-post' },
      request: new Request('https://example.com/api/og?title=Custom&description=Desc'),
    } as unknown as Parameters<typeof GET>[0]);

    expect(generateOgImage).toHaveBeenCalledWith(
      expect.objectContaining({
        fetchAsset: undefined,
      })
    );
  });
});
