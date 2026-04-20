import satori from 'satori';
import { Resvg, initWasm } from '@resvg/resvg-wasm';

// Serve the WASM binary and fonts from the same Cloudflare ASSETS origin rather
// than bundling WASM into the Worker script.  Bundling via the ?module Vite hint
// fails silently under Rolldown (Astro 6 / Vite 8), causing initWasm() to throw
// and the endpoint to return text/plain instead of image/png.
const SITE_ORIGIN = import.meta.env.SITE ?? 'https://jaysonknight.com';

const SPACE_GROTESK_REGULAR = `${SITE_ORIGIN}/fonts/space-grotesk-400.woff`;
const SPACE_GROTESK_BOLD = `${SITE_ORIGIN}/fonts/space-grotesk-700.woff`;
const RESVG_WASM_URL = `${SITE_ORIGIN}/wasm/resvg.wasm`;

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
}

let wasmInitialization: Promise<void> | undefined;
let fontData: Promise<{ regular: ArrayBuffer; bold: ArrayBuffer }> | undefined;

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

const fetchFontData = async (): Promise<{ regular: ArrayBuffer; bold: ArrayBuffer }> => {
  if (!fontData) {
    const pendingFontData = (async () => {
      const [regular, bold] = await Promise.all([
        fetchBinary(SPACE_GROTESK_REGULAR, 'Space Grotesk regular font'),
        fetchBinary(SPACE_GROTESK_BOLD, 'Space Grotesk bold font'),
      ]);

      return { regular, bold };
    })();

    fontData = pendingFontData;
    pendingFontData.catch(() => {
      if (fontData === pendingFontData) {
        fontData = undefined;
      }
    });
  }

  return fontData;
};

const ensureResvgInitialized = async (): Promise<void> => {
  if (!wasmInitialization) {
    // Pass the fetch() Promise directly — initWasm() will stream and compile the
    // WASM via WebAssembly.instantiateStreaming(), which is fully supported in the
    // Cloudflare Workers runtime and avoids any bundler-level WASM handling.
    const pendingWasmInitialization = (async () => {
      await initWasm(fetch(RESVG_WASM_URL));
    })();

    wasmInitialization = pendingWasmInitialization;
    pendingWasmInitialization.catch(() => {
      if (wasmInitialization === pendingWasmInitialization) {
        wasmInitialization = undefined;
      }
    });
  }

  await wasmInitialization;
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
}: GenerateOgImageOptions): Promise<Uint8Array> => {
  await ensureResvgInitialized();
  const fonts = await fetchFontData();
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
