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

vi.mock('@resvg/resvg-wasm/index_bg.wasm?module', () => ({
  default: {},
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
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(createFontResponse(false))
      .mockResolvedValueOnce(createFontResponse(true, [10]))
      .mockResolvedValueOnce(createFontResponse(true, [11]))
      .mockResolvedValueOnce(createFontResponse(true, [12]));
    vi.stubGlobal('fetch', fetchMock);

    const { generateOgImage } = await import('./og');

    await expect(generateOgImage(imageOptions)).rejects.toThrow(
      'Failed to fetch Space Grotesk regular font'
    );
    await expect(generateOgImage(imageOptions)).resolves.toEqual(Uint8Array.from([1, 2, 3]));

    expect(fetchMock).toHaveBeenCalledTimes(4);
  });
});
