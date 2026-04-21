import { describe, expect, it } from 'vitest';
import { generateFallbackOgPng } from './og-fallback';

describe('generateFallbackOgPng', () => {
  it('returns a Uint8Array starting with the PNG signature', async () => {
    const png = await generateFallbackOgPng();
    expect(Array.from(png.slice(0, 8))).toEqual([137, 80, 78, 71, 13, 10, 26, 10]);
  });

  it('returns a 1200x630 image larger than a 1x1 PNG', async () => {
    const png = await generateFallbackOgPng();
    const width = ((png[16] << 24) | (png[17] << 16) | (png[18] << 8) | png[19]) >>> 0;
    const height = ((png[20] << 24) | (png[21] << 16) | (png[22] << 8) | png[23]) >>> 0;

    expect(width).toBe(1200);
    expect(height).toBe(630);
    expect(png.byteLength).toBeGreaterThan(200);
  });

  it('returns a consistent result across calls', async () => {
    const [first, second] = await Promise.all([generateFallbackOgPng(), generateFallbackOgPng()]);
    expect(first).toEqual(second);
  });
});
