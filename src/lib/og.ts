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
const OG_TEXT = '#e2e8f0';
const OG_TEXT_DIM = '#94a3b8';
const OG_TEXT_GHOST = '#475569';
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
  fetchAsset?: (url: string) => Promise<Response>;
}

const wasmInitializationByOrigin = new Map<string, Promise<void>>();
const fontDataByOrigin = new Map<string, Promise<{ regular: ArrayBuffer; bold: ArrayBuffer }>>();

const normalizePath = (path: string): string => {
  if (!path || path === '/') {
    return '/';
  }

  return path.startsWith('/') ? path : `/${path}`;
};

const fetchBinary = async (
  url: string,
  label: string,
  fetcher: (url: string) => Promise<Response>
): Promise<ArrayBuffer> => {
  const response = await fetcher(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${label}: ${response.status} ${response.statusText}`);
  }

  return response.arrayBuffer();
};

const resolveSiteOrigin = (assetOrigin: string | undefined): string => {
  const candidateOrigin = assetOrigin || DEFAULT_SITE_ORIGIN;

  try {
    return new URL(candidateOrigin).origin;
  } catch {
    throw new Error(`Invalid OG asset origin: ${candidateOrigin}`);
  }
};

const fetchFontData = async (
  siteOrigin: string,
  fetcher: (url: string) => Promise<Response>
): Promise<{ regular: ArrayBuffer; bold: ArrayBuffer }> => {
  const existingFontData = fontDataByOrigin.get(siteOrigin);
  if (existingFontData) {
    return existingFontData;
  }

  const spaceGroteskRegularUrl = `${siteOrigin}/fonts/space-grotesk-400.woff`;
  const spaceGroteskBoldUrl = `${siteOrigin}/fonts/space-grotesk-700.woff`;
  const pendingFontData = (async () => {
    const [regular, bold] = await Promise.all([
      fetchBinary(spaceGroteskRegularUrl, 'Space Grotesk regular font', fetcher),
      fetchBinary(spaceGroteskBoldUrl, 'Space Grotesk bold font', fetcher),
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

const ensureResvgInitialized = async (
  siteOrigin: string,
  fetcher: (url: string) => Promise<Response>
): Promise<void> => {
  const existingWasmInitialization = wasmInitializationByOrigin.get(siteOrigin);
  if (existingWasmInitialization) {
    await existingWasmInitialization;
    return;
  }

  const resvgWasmUrl = `${siteOrigin}/wasm/resvg.wasm`;
  const pendingWasmInitialization = (async () => {
    const wasmBuffer = await fetchBinary(resvgWasmUrl, 'resvg WASM', fetcher);
    await initWasm(wasmBuffer);
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
      color: OG_TEXT,
      fontFamily: '"Space Grotesk"',
      padding: '58px 64px',
      boxSizing: 'border-box',
      // Phosphor grid overlay: subtle cyan grid lines
      backgroundImage: `linear-gradient(rgba(0,212,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.03) 1px, transparent 1px)`,
      backgroundSize: '48px 48px',
    },
    children: [
      {
        // Phosphor accent bar — cyan glow left edge
        type: 'div',
        props: {
          style: {
            width: '4px',
            height: '80%',
            backgroundColor: OG_ACCENT,
            borderRadius: '2px',
            marginRight: '32px',
            boxShadow: `0 0 12px ${OG_ACCENT}, 0 0 24px rgba(0,212,255,0.3)`,
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
              // Phosphor terminal-style site label + tagline row
              type: 'div',
              props: {
                style: {
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                },
                children: [
                  {
                    type: 'div',
                    props: {
                      style: {
                        color: OG_TEXT_GHOST,
                        fontSize: 22,
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        fontFamily: '"Space Grotesk"',
                      },
                      children: 'JK.com',
                    },
                  },
                  {
                    // Separator
                    type: 'div',
                    props: {
                      style: {
                        color: OG_TEXT_GHOST,
                        fontSize: 18,
                        opacity: 0.4,
                      },
                      children: '//',
                    },
                  },
                  {
                    // Phosphor tagline: IMAGINATION | UNLEASHED
                    type: 'div',
                    props: {
                      style: {
                        color: OG_ACCENT,
                        fontSize: 16,
                        letterSpacing: '0.18em',
                        textTransform: 'uppercase',
                        fontFamily: '"Space Grotesk"',
                      },
                      children: 'IMAGINATION | UNLEASHED',
                    },
                  },
                ],
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
                        color: OG_TEXT,
                        fontSize: 62,
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
                        color: OG_TEXT_DIM,
                        fontSize: 32,
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
              // Phosphor footer: URL in cyan
              type: 'div',
              props: {
                style: {
                  color: OG_ACCENT,
                  fontSize: 24,
                  lineHeight: 1.2,
                  letterSpacing: '0.04em',
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
  fetchAsset,
}: GenerateOgImageOptions): Promise<Uint8Array> => {
  const siteOrigin = resolveSiteOrigin(assetOrigin);
  const fetcher = fetchAsset ?? fetch;

  await ensureResvgInitialized(siteOrigin, fetcher);
  const fonts = await fetchFontData(siteOrigin, fetcher);
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
