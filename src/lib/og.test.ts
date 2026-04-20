import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { initWasm, satori, resvgRender, resvgFree } = vi.hoisted(() => ({
  initWasm: vi.fn(),
  satori: vi.fn(async () => '<svg />'),
  resvgRender: vi.fn(() => ({
    asPng: () => Uint8Array.from([1, 2, 3]),
  })),
  resvgFree: vi.fn(),
}));

vi.mock('satori', () => ({
  default: satori,
}));

vi.mock('@resvg/resvg-wasm', () => ({
  initWasm,
  Resvg: class {
    render() {
      return resvgRender();
    }

    free() {
      resvgFree();
    }
  },
}));

const createFontResponse = (ok: boolean, bytes: number[] = [1, 2, 3]) => ({
  ok,
  status: ok ? 200 : 503,
  statusText: ok ? 'OK' : 'Service Unavailable',
  arrayBuffer: async () => Uint8Array.from(bytes).buffer,
});

const imageOptions = {
  title: 'OG title',
  description: 'OG description',
  path: '/blog/post',
};

describe('generateOgImage retry guards', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('retries resvg initialization after a transient failure', async () => {
    initWasm.mockRejectedValueOnce(new Error('init failed')).mockResolvedValue(undefined);
    // mockResolvedValue (not Once) covers the WASM fetch and all font fetches for
    // both generateOgImage calls without needing exact ordering.
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(createFontResponse(true, [1]))
    );

    const { generateOgImage } = await import('./og');

    await expect(generateOgImage(imageOptions)).rejects.toThrow('init failed');
    await expect(generateOgImage(imageOptions)).resolves.toEqual(Uint8Array.from([1, 2, 3]));

    expect(initWasm).toHaveBeenCalledTimes(2);
  });

  it('retries font fetch after a transient failure', async () => {
    initWasm.mockResolvedValue(undefined);
    // Fetch call ordering with the new same-origin asset approach:
    //   #1  WASM URL       — fetched once on first ensureResvgInitialized(); initWasm() is
    //                         mocked so it does not await this response, but fetch() is called.
    //   #2  regular font   — fails (triggers fontData retry guard)
    //   #3  bold font      — runs in parallel with #2 via Promise.all(); consumes a slot even
    //                         though Promise.all rejects on the regular-font failure
    //   #4  regular font   — second generateOgImage call, fontData cleared, retry succeeds
    //   #5  bold font      — second generateOgImage call, succeeds
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(createFontResponse(true))         // #1 WASM
      .mockResolvedValueOnce(createFontResponse(false))        // #2 regular font → fails
      .mockResolvedValueOnce(createFontResponse(true, [10]))   // #3 bold font (parallel)
      .mockResolvedValueOnce(createFontResponse(true, [11]))   // #4 regular font (retry)
      .mockResolvedValueOnce(createFontResponse(true, [12]));  // #5 bold font (retry)
    vi.stubGlobal('fetch', fetchMock);

    const { generateOgImage } = await import('./og');

    await expect(generateOgImage(imageOptions)).rejects.toThrow(
      'Failed to fetch Space Grotesk regular font'
    );
    await expect(generateOgImage(imageOptions)).resolves.toEqual(Uint8Array.from([1, 2, 3]));

    expect(fetchMock).toHaveBeenCalledTimes(5);
  });
});
