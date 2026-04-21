import { describe, expect, it } from 'vitest';
import { generateFallbackOgPng } from './og-fallback';

describe('generateFallbackOgPng', () => {
  it('returns a Uint8Array starting with the PNG signature', async () => {
    const png = await generateFallbackOgPng();
    expect(Array.from(png.slice(0, 8))).toEqual([137, 80, 78, 71, 13, 10, 26, 10]);
  });

  it('returns an image larger than a 1x1 PNG', async () => {
    const png = await generateFallbackOgPng();
    expect(png.byteLength).toBeGreaterThan(200);
  });

  it('returns a consistent result across calls', async () => {
    const [first, second] = await Promise.all([generateFallbackOgPng(), generateFallbackOgPng()]);
    expect(first).toEqual(second);
  });
});
