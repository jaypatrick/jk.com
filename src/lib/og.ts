import satori from 'satori';
import { Resvg, initWasm } from '@resvg/resvg-wasm';

const OG_WIDTH = 1200;
const OG_HEIGHT = 630;
const OG_BACKGROUND = '#05050a';
const OG_ACCENT = '#00d4ff';

const SPACE_GROTESK_REGULAR =
  'https://unpkg.com/@fontsource/space-grotesk/files/space-grotesk-latin-400-normal.woff';
const SPACE_GROTESK_BOLD =
  'https://unpkg.com/@fontsource/space-grotesk/files/space-grotesk-latin-700-normal.woff';

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
  origin?: string;
}

let wasmInitializationPromise: Promise<void> | undefined;
let fontDataPromise: Promise<{ regular: ArrayBuffer; bold: ArrayBuffer }> | undefined;

const normalizePath = (path: string): string => {
  if (!path || path === '/') {
    return '/';
  }

  return path.startsWith('/') ? path : `/${path}`;
};

const fetchFontData = async (): Promise<{ regular: ArrayBuffer; bold: ArrayBuffer }> => {
  if (!fontDataPromise) {
    fontDataPromise = (async () => {
      const [regular, bold] = await Promise.all([
        fetch(SPACE_GROTESK_REGULAR).then(async (response) => {
          if (!response.ok) {
            throw new Error(`Failed to fetch Space Grotesk regular font: ${response.status}`);
          }
          return response.arrayBuffer();
        }),
        fetch(SPACE_GROTESK_BOLD).then(async (response) => {
          if (!response.ok) {
            throw new Error(`Failed to fetch Space Grotesk bold font: ${response.status}`);
          }
          return response.arrayBuffer();
        }),
      ]);

      return { regular, bold };
    })();
  }

  return fontDataPromise;
};

const ensureResvgInitialized = async (origin?: string): Promise<void> => {
  if (!wasmInitializationPromise) {
    const baseUrl = origin ?? 'https://jaysonknight.com';
    const wasmUrl = new URL('/resvg.wasm', baseUrl);
    wasmInitializationPromise = initWasm(fetch(wasmUrl));
  }

  await wasmInitializationPromise;
};

const createOgTree = ({
  title,
  description,
  path,
}: Omit<GenerateOgImageOptions, 'origin'>): SatoriLikeElement => ({
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
                children: `jaysonknight.com${path}`,
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
  origin,
}: GenerateOgImageOptions): Promise<Uint8Array> => {
  await ensureResvgInitialized(origin);
  const fonts = await fetchFontData();

  const svg = await satori(createOgTree({ title, description, path: normalizePath(path) }), {
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
    return resvg.render().asPng();
  } finally {
    resvg.free();
  }
};
