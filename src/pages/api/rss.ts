import type { APIRoute } from 'astro';

export const prerender = false;

type FeedItem = {
  title: string;
  link: string;
  pubDate: string;
  description: string;
};

const extractTag = (block: string, tags: string[]): string => {
  for (const tag of tags) {
    const match = block.match(new RegExp(`<${tag}(?:\s[^>]*)?>([\s\S]*?)<\/${tag}>`, 'i'));
    if (match?.[1]) {
      return match[1].trim();
    }
  }

  return '';
};

const stripCdata = (value: string): string => value.replace(/^<!\[CDATA\[(.*)\]\]>$/s, '$1').trim();

const safeFromCodePoint = (codePoint: number): string => {
  if (codePoint >= 0 && codePoint <= 0x10ffff) {
    return String.fromCodePoint(codePoint);
  }
  return '\uFFFD';
};

const decodeXmlEntities = (value: string): string =>
  value
    .replace(/&#x([0-9a-f]+);/gi, (_match, hex: string) => safeFromCodePoint(Number.parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_match, dec: string) => safeFromCodePoint(Number.parseInt(dec, 10)))
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&');

/** Strips HTML tags, decodes entities, and normalises whitespace — without truncation. */
const cleanText = (value: string): string =>
  decodeXmlEntities(stripCdata(value))
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

/** Like cleanText but truncates to 200 characters with an ellipsis. */
const cleanDescription = (value: string): string => {
  const text = cleanText(value);

  if (text.length <= 200) {
    return text;
  }

  return `${text.slice(0, 200).trimEnd()}…`;
};

const extractLink = (block: string): string => {
  const atomHref =
    block.match(/<link\b[^>]*rel=["']alternate["'][^>]*href=["']([^"']+)["'][^>]*\/?>/i)?.[1] ??
    block.match(/<link\b[^>]*href=["']([^"']+)["'][^>]*\/?>/i)?.[1];
  if (atomHref) {
    return atomHref.trim();
  }

  return stripCdata(extractTag(block, ['link']));
};

export const parseRssOrAtom = (xml: string, max: number): FeedItem[] => {
  const entryRegex = /<entry\b[\s\S]*?<\/entry>/gi;
  const itemRegex = /<item\b[\s\S]*?<\/item>/gi;
  const blocks = xml.match(entryRegex) ?? xml.match(itemRegex) ?? [];

  return blocks.slice(0, max).map((block) => {
    const title = decodeXmlEntities(stripCdata(extractTag(block, ['title']))) || 'Untitled';
    const link = extractLink(block);
    const pubDate = stripCdata(extractTag(block, ['pubDate', 'published', 'updated']));
    const descriptionSource = extractTag(block, ['description', 'summary', 'content']);

    return {
      title,
      link,
      pubDate,
      description: cleanDescription(descriptionSource),
    };
  });
};

export const isValidFeedDocument = (xml: string): boolean => {
  const normalized = xml.trim();
  if (!normalized) {
    return false;
  }

  if (/^\s*(?:<\?xml[\s\S]*?\?>\s*)?(?:<!doctype\s+html|<html[\s>])/i.test(normalized)) {
    return false;
  }

  return /<rss[\s>]/i.test(normalized) || /<feed[\s>]/i.test(normalized) || /<channel[\s>]/i.test(normalized);
};

const sanitizeUrlForLog = (url: URL): string => {
  const safeUrl = new URL(url.toString());
  safeUrl.username = '';
  safeUrl.password = '';
  // Intentionally exclude query/hash values from logs to avoid leaking tokens.
  return `${safeUrl.origin}${safeUrl.pathname}`;
};

const getMax = (value: string | null): number => {
  const parsed = Number.parseInt(value ?? '5', 10);
  if (!Number.isFinite(parsed)) {
    return 5;
  }

  return Math.max(1, Math.min(parsed, 20));
};

/**
 * Wraps fetch with a timeout. Uses AbortSignal.timeout when available; otherwise
 * falls back to AbortController + setTimeout and always clears the timer in a
 * finally block so the event loop is never kept alive by a stale timer.
 */
const fetchWithTimeout = async (
  input: RequestInfo | URL,
  init: Omit<RequestInit, 'signal'> = {},
  timeoutMs = 8000
): Promise<Response> => {
  if (typeof AbortSignal.timeout === 'function') {
    return fetch(input, { ...init, signal: AbortSignal.timeout(timeoutMs) });
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
};

const parseWordPressPosts = (
  payload: unknown
): Array<{ title: string; link: string; pubDate: string; description: string }> | null => {
  if (!Array.isArray(payload)) {
    return null;
  }

  const items = payload
    .map((post) => {
      const source = typeof post === 'object' && post ? (post as Record<string, unknown>) : null;
      const link = typeof source?.link === 'string' ? source.link.trim() : '';
      const titleRendered =
        source?.title && typeof source.title === 'object'
          ? (source.title as Record<string, unknown>).rendered
          : undefined;
      const excerptRendered =
        source?.excerpt && typeof source.excerpt === 'object'
          ? (source.excerpt as Record<string, unknown>).rendered
          : undefined;
      const dateGmt = typeof source?.date_gmt === 'string' ? source.date_gmt.trim() : '';
      const date = typeof source?.date === 'string' ? source.date.trim() : '';
      // Use cleanText (no truncation) for titles so long titles are not silently cut off.
      const title = cleanText(typeof titleRendered === 'string' ? titleRendered : '') || 'Untitled';
      const pubDateSource = dateGmt ? `${dateGmt}Z` : date;
      const parsedPubDate = pubDateSource ? new Date(pubDateSource) : null;
      const pubDate = parsedPubDate && !Number.isNaN(parsedPubDate.getTime()) ? parsedPubDate.toUTCString() : pubDateSource;

      return {
        title,
        link,
        pubDate,
        description: cleanDescription(typeof excerptRendered === 'string' ? excerptRendered : ''),
      };
    })
    .filter((item) => item.link);

  return items;
};

const respondWithItems = (items: FeedItem[]): Response =>
  new Response(JSON.stringify({ items }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });

export const GET: APIRoute = async ({ request }) => {
  const requestUrl = new URL(request.url);
  const urlParam = requestUrl.searchParams.get('url')?.trim() ?? '';
  const feedUrl = urlParam || (import.meta.env.RSS_FEED_URL ?? '');
  const max = getMax(requestUrl.searchParams.get('max'));
  let parsedFeedUrl: URL;

  if (!feedUrl) {
    return new Response(JSON.stringify({ error: 'Missing RSS feed URL.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    parsedFeedUrl = new URL(feedUrl);
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid RSS feed URL.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  const sanitizedFeedUrl = sanitizeUrlForLog(parsedFeedUrl);
  const tryWordPressFallback = async (): Promise<FeedItem[] | null> => {
    try {
      const wpApiUrl = new URL('/wp-json/wp/v2/posts', `${parsedFeedUrl.origin}/`);
      wpApiUrl.searchParams.set('per_page', String(max));
      wpApiUrl.searchParams.set('_fields', 'link,title.rendered,excerpt.rendered,date,date_gmt');

      const response = await fetchWithTimeout(wpApiUrl, {
        headers: {
          Accept: 'application/json',
          'User-Agent': 'Mozilla/5.0 (compatible; JKcom-RSSBot/1.0; +https://jaysonknight.com)',
        },
        cache: 'no-store',
      });

      if (!response.ok) {
        return null;
      }

      const items = parseWordPressPosts(await response.json());
      return items?.slice(0, max) ?? null;
    } catch {
      return null;
    }
  };

  try {
    const response = await fetchWithTimeout(feedUrl, {
      headers: {
        Accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml, */*',
        'User-Agent': 'Mozilla/5.0 (compatible; JKcom-RSSBot/1.0; +https://jaysonknight.com)',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const fallbackItems = await tryWordPressFallback();
      if (fallbackItems) {
        return respondWithItems(fallbackItems);
      }
      console.error('[api/rss] Failed to fetch feed with non-OK status:', response.status, 'for URL:', sanitizedFeedUrl);
      return new Response(JSON.stringify({ error: `Failed to fetch feed (${response.status}).` }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const contentType = response.headers.get('Content-Type')?.toLowerCase() ?? '';
    const mimeType = contentType.split(';', 1)[0]?.trim() ?? '';
    if (mimeType === 'text/html') {
      const fallbackItems = await tryWordPressFallback();
      if (fallbackItems) {
        return respondWithItems(fallbackItems);
      }
      console.error('[api/rss] Feed returned text/html — likely bot challenge for URL:', sanitizedFeedUrl);
      return new Response(
        JSON.stringify({ error: 'Feed returned an HTML page instead of XML (possible bot challenge or redirect)' }),
        {
          status: 502,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const xml = await response.text();
    if (!isValidFeedDocument(xml)) {
      const fallbackItems = await tryWordPressFallback();
      if (fallbackItems) {
        return respondWithItems(fallbackItems);
      }
      console.error('[api/rss] Response body is not a valid RSS/Atom document for URL:', sanitizedFeedUrl);
      return new Response(JSON.stringify({ error: 'Feed URL did not return a valid RSS or Atom document' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const items = parseRssOrAtom(xml, max);
    if (items.length === 0) {
      const fallbackItems = await tryWordPressFallback();
      if (fallbackItems) {
        return respondWithItems(fallbackItems);
      }
    }

    return respondWithItems(items);
  } catch (error) {
    const fallbackItems = await tryWordPressFallback();
    if (fallbackItems) {
      return respondWithItems(fallbackItems);
    }
    const errorName = error instanceof Error ? error.name : 'UnknownError';
    const errorMessage =
      error instanceof Error
        ? error.message.replaceAll(parsedFeedUrl.href, sanitizedFeedUrl).replaceAll(feedUrl, sanitizedFeedUrl)
        : '';
    console.error('[api/rss] Unable to fetch RSS feed for URL:', sanitizedFeedUrl, 'error type:', errorName, errorMessage);
    return new Response(JSON.stringify({ error: 'Unable to fetch RSS feed.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};