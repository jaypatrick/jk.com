import { beforeEach, describe, expect, it, vi } from 'vitest';

const { generateOgImage } = vi.hoisted(() => ({
  generateOgImage: vi.fn(),
}));

vi.mock('../lib/og', () => ({
  generateOgImage,
}));

import { GET } from './og-image.png';

describe('GET /og-image.png', () => {
  beforeEach(() => {
    generateOgImage.mockReset();
    generateOgImage.mockResolvedValue(Uint8Array.from([1, 2, 3]));
  });

  it('generates the default OG image with correct defaults', async () => {
    const response = await GET({
      request: new Request('https://example.com/og-image.png'),
    } as unknown as Parameters<typeof GET>[0]);

    const body = new Uint8Array(await response.arrayBuffer());

    expect(generateOgImage).toHaveBeenCalledWith({
      title: 'JK.com | Enterprise Cloud Consulting — Jayson Knight',
      description:
        'Jayson Knight — Solutions Architect specializing in Microsoft Azure, Cloudflare, and .NET. 20+ years building enterprise software that scales.',
      path: '/',
      assetOrigin: 'https://example.com',
    });
    expect(Array.from(body)).toEqual([1, 2, 3]);
    expect(response.headers.get('Content-Type')).toBe('image/png');
    expect(response.headers.get('Cache-Control')).toBe(
      'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800'
    );
  });

  it('returns plain-text 500 response when generation fails', async () => {
    generateOgImage.mockRejectedValue(new Error('boom'));

    const response = await GET({
      request: new Request('https://example.com/og-image.png'),
    } as unknown as Parameters<typeof GET>[0]);

    expect(response.status).toBe(500);
    expect(response.headers.get('Content-Type')).toBe('text/plain');
  });
});
