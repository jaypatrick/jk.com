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
    const match = block.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, 'i'));
    if (match?.[1]) {
      return match[1].trim();
    }
  }

  return '';
};

const stripCdata = (value: string): string => value.replace(/^<!\[CDATA\[(.*)\]\]>$/s, '$1').trim();

const decodeXmlEntities = (value: string): string =>
  value
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&');

const cleanDescription = (value: string): string => {
  const text = decodeXmlEntities(stripCdata(value))
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

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

const getMax = (value: string | null): number => {
  const parsed = Number.parseInt(value ?? '5', 10);
  if (!Number.isFinite(parsed)) {
    return 5;
  }

  return Math.max(1, Math.min(parsed, 20));
};

export const GET: APIRoute = async ({ request }) => {
  const requestUrl = new URL(request.url);
  const urlParam = requestUrl.searchParams.get('url')?.trim() ?? '';
  const feedUrl = urlParam || (import.meta.env.RSS_FEED_URL ?? '');
  const max = getMax(requestUrl.searchParams.get('max'));

  if (!feedUrl) {
    return new Response(JSON.stringify({ error: 'Missing RSS feed URL.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    new URL(feedUrl);
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid RSS feed URL.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const response = await fetch(feedUrl, {
      headers: {
        Accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml',
      },
    });

    if (!response.ok) {
      return new Response(JSON.stringify({ error: `Failed to fetch feed (${response.status}).` }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const xml = await response.text();
    const items = parseRssOrAtom(xml, max);

    return new Response(JSON.stringify({ items }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify({ error: 'Unable to fetch RSS feed.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
