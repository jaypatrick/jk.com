import satori from 'satori';
import { Resvg, initWasm } from '@resvg/resvg-wasm';

// Serve the WASM binary and fonts from the same Cloudflare ASSETS origin rather
// than bundling WASM into the Worker script.  Bundling via the ?module Vite hint
// fails silently under Rolldown (Astro 6 / Vite 8), causing initWasm() to throw
// and the endpoint to return text/plain instead of image/png.
const DEFAULT_SITE_ORIGIN = import.meta.env.SITE ?? 'https://jaysonknight.com';

const OG_WIDTH = 1200;
const OG_HEIGHT = 630;
const OG_BACKGROUND = '#05050a';
const OG_ACCENT = '#00d4ff';
const OG_SITE_LABEL = 'jaysonknight.com';

interface SatoriLikeElement {
  type: string;
  props: {
    style?: Record<string, string | number>;
    children?: Array<SatoriLikeElement | string> | SatoriLikeElement | string;
  };
}

export interface GenerateOgImageOptions {
  title: string;
  description: string;
  path: string;
  assetOrigin?: string;
}

const wasmInitializationByOrigin = new Map<string, Promise<void>>();
const fontDataByOrigin = new Map<string, Promise<{ regular: ArrayBuffer; bold: ArrayBuffer }>>();

const normalizePath = (path: string): string => {
  if (!path || path === '/') {
    return '/';
  }

  return path.startsWith('/') ? path : `/${path}`;
};

const fetchBinary = async (url: string, label: string): Promise<ArrayBuffer> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${label}: ${response.status} ${response.statusText}`);
  }

  return response.arrayBuffer();
};

const resolveSiteOrigin = (assetOrigin: string | undefined): string =>
  (assetOrigin || DEFAULT_SITE_ORIGIN).replace(/\/+$/, '');

const fetchFontData = async (siteOrigin: string): Promise<{ regular: ArrayBuffer; bold: ArrayBuffer }> => {
  const existingFontData = fontDataByOrigin.get(siteOrigin);
  if (existingFontData) {
    return existingFontData;
  }

  const spaceGroteskRegularUrl = `${siteOrigin}/fonts/space-grotesk-400.woff`;
  const spaceGroteskBoldUrl = `${siteOrigin}/fonts/space-grotesk-700.woff`;
  const pendingFontData = (async () => {
    const [regular, bold] = await Promise.all([
      fetchBinary(spaceGroteskRegularUrl, 'Space Grotesk regular font'),
      fetchBinary(spaceGroteskBoldUrl, 'Space Grotesk bold font'),
    ]);

    return { regular, bold };
  })();

  fontDataByOrigin.set(siteOrigin, pendingFontData);
  pendingFontData.catch(() => {
    if (fontDataByOrigin.get(siteOrigin) === pendingFontData) {
      fontDataByOrigin.delete(siteOrigin);
    }
  });

  return pendingFontData;
};

const ensureResvgInitialized = async (siteOrigin: string): Promise<void> => {
  const existingWasmInitialization = wasmInitializationByOrigin.get(siteOrigin);
  if (existingWasmInitialization) {
    await existingWasmInitialization;
    return;
  }

  const resvgWasmUrl = `${siteOrigin}/wasm/resvg.wasm`;
  // Pass the fetch() Promise directly — initWasm() will stream and compile the
  // WASM via WebAssembly.instantiateStreaming(), which is fully supported in the
  // Cloudflare Workers runtime and avoids any bundler-level WASM handling.
  const pendingWasmInitialization = (async () => {
    await initWasm(fetch(resvgWasmUrl));
  })();

  wasmInitializationByOrigin.set(siteOrigin, pendingWasmInitialization);
  pendingWasmInitialization.catch(() => {
    if (wasmInitializationByOrigin.get(siteOrigin) === pendingWasmInitialization) {
      wasmInitializationByOrigin.delete(siteOrigin);
    }
  });

  await pendingWasmInitialization;
};

const createOgTree = ({
  title,
  description,
  path,
}: GenerateOgImageOptions): SatoriLikeElement => ({
  type: 'div',
  props: {
    style: {
      width: `${OG_WIDTH}px`,
      height: `${OG_HEIGHT}px`,
      display: 'flex',
      backgroundColor: OG_BACKGROUND,
      color: '#ffffff',
      fontFamily: '"Space Grotesk"',
      padding: '58px 64px',
      boxSizing: 'border-box',
    },
    children: [
      {
        type: 'div',
        props: {
          style: {
            width: '4px',
            height: '80%',
            backgroundColor: OG_ACCENT,
            borderRadius: '2px',
            marginRight: '32px',
          },
        },
      },
      {
        type: 'div',
        props: {
          style: {
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            height: '100%',
            flex: 1,
          },
          children: [
            {
              type: 'div',
              props: {
                style: {
                  color: '#9ca3af',
                  fontSize: 24,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                },
                children: 'JK.com',
              },
            },
            {
              type: 'div',
              props: {
                style: {
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '20px',
                },
                children: [
                  {
                    type: 'div',
                    props: {
                      style: {
                        color: '#ffffff',
                        fontSize: 66,
                        lineHeight: 1.1,
                        fontWeight: 700,
                        maxWidth: '980px',
                      },
                      children: title,
                    },
                  },
                  {
                    type: 'div',
                    props: {
                      style: {
                        color: '#888888',
                        fontSize: 34,
                        lineHeight: 1.3,
                        maxWidth: '920px',
                      },
                      children: description,
                    },
                  },
                ],
              },
            },
            {
              type: 'div',
              props: {
                style: {
                  color: OG_ACCENT,
                  fontSize: 27,
                  lineHeight: 1.2,
                },
                children: `${OG_SITE_LABEL}${path}`,
              },
            },
          ],
        },
      },
    ],
  },
});

export const generateOgImage = async ({
  title,
  description,
  path,
  assetOrigin,
}: GenerateOgImageOptions): Promise<Uint8Array> => {
  const siteOrigin = resolveSiteOrigin(assetOrigin);

  await ensureResvgInitialized(siteOrigin);
  const fonts = await fetchFontData(siteOrigin);
  const tree = createOgTree({ title, description, path: normalizePath(path) });

  const svg = await satori(tree as Parameters<typeof satori>[0], {
    width: OG_WIDTH,
    height: OG_HEIGHT,
    fonts: [
      { name: 'Space Grotesk', data: fonts.regular, weight: 400, style: 'normal' },
      { name: 'Space Grotesk', data: fonts.bold, weight: 700, style: 'normal' },
    ],
  });

  const resvg = new Resvg(svg, {
    fitTo: {
      mode: 'width',
      value: OG_WIDTH,
    },
  });

  try {
    return Uint8Array.from(resvg.render().asPng());
  } finally {
    resvg.free();
  }
};
