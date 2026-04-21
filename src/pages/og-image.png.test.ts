import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_OG_DESCRIPTION, DEFAULT_OG_TITLE } from '../lib/og-defaults';

const { generateOgImage, assetsFetch, workersEnv } = vi.hoisted(() => ({
  generateOgImage: vi.fn(),
  assetsFetch: vi.fn(),
  workersEnv: {} as { ASSETS?: { fetch: (...args: unknown[]) => unknown } },
}));

vi.mock('../lib/og', () => ({
  generateOgImage,
}));
vi.mock('cloudflare:workers', () => ({
  env: workersEnv,
}));

import { GET } from './og-image.png';

describe('GET /og-image.png', () => {
  beforeEach(() => {
    generateOgImage.mockReset();
    generateOgImage.mockResolvedValue(Uint8Array.from([1, 2, 3]));
    assetsFetch.mockReset();
    assetsFetch.mockResolvedValue(new Response(''));
    workersEnv.ASSETS = { fetch: assetsFetch };
  });

  it('generates the default OG image with correct defaults', async () => {
    const response = await GET({
      request: new Request('https://example.com/og-image.png'),
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
    } as unknown as Parameters<typeof GET>[0]);

    const body = new Uint8Array(await response.arrayBuffer());

    expect(body.byteLength).toBe(3);
    expect(Array.from(body)).toEqual([1, 2, 3]);
  });

  it('returns fallback PNG response when generation fails', async () => {
    generateOgImage.mockRejectedValue(new Error('boom'));

    const response = await GET({
      request: new Request('https://example.com/og-image.png'),
    } as unknown as Parameters<typeof GET>[0]);

    const body = new Uint8Array(await response.arrayBuffer());

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('image/png');
    expect(response.headers.get('Cache-Control')).toBe('no-store');
    expect(Array.from(body.slice(0, 8))).toEqual([137, 80, 78, 71, 13, 10, 26, 10]);
    expect(body.byteLength).toBeGreaterThan(200);
  });

  it('falls back to internal asset fetch when ASSETS binding is unavailable', async () => {
    delete workersEnv.ASSETS;

    await GET({
      request: new Request('https://example.com/og-image.png'),
    } as unknown as Parameters<typeof GET>[0]);

    expect(generateOgImage).toHaveBeenCalledWith(
      expect.objectContaining({
        fetchAsset: undefined,
      })
    );
  });
});
