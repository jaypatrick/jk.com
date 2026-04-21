import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GET, isValidFeedDocument, parseRssOrAtom } from './rss';

const GHOST_RSS_FIXTURE = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:content="http://purl.org/rss/1.1/content" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:media="http://search.yahoo.com/mrss/" version="2.0">
  <channel>
    <title><![CDATA[Jayson Knight's Blog]]></title>
    <description><![CDATA[Thoughts on Azure, AI, and Cloudflare]]></description>
    <link>https://blog.jaysonknight.com</link>
    <atom:link href="https://blog.jaysonknight.com/feed/" rel="self" type="application/rss+xml"/>
    <lastBuildDate>Mon, 20 Apr 2026 00:00:00 GMT</lastBuildDate>
    <ttl>60</ttl>
    <item>
      <title><![CDATA[Building AI Agents on Cloudflare Workers]]></title>
      <description><![CDATA[<p>A deep dive into building production-ready AI agents using Cloudflare Workers and Anthropic Claude.</p>]]></description>
      <link>https://blog.jaysonknight.com/ai-agents-cloudflare/</link>
      <guid isPermaLink="false">ghost-abc123</guid>
      <dc:creator><![CDATA[Jayson Knight]]></dc:creator>
      <pubDate>Mon, 20 Apr 2026 00:00:00 GMT</pubDate>
      <media:content url="https://blog.jaysonknight.com/content/images/cover.jpg" medium="image"/>
      <content:encoded><![CDATA[<p>Full post HTML content here.</p>]]></content:encoded>
    </item>
    <item>
      <title><![CDATA[Rust on the Edge: WASM Components with WASI]]></title>
      <description><![CDATA[<p>How to deploy Rust-compiled WASM components to Cloudflare using the WASI component model.</p>]]></description>
      <link>https://blog.jaysonknight.com/rust-wasm-cloudflare/</link>
      <guid isPermaLink="false">ghost-def456</guid>
      <dc:creator><![CDATA[Jayson Knight]]></dc:creator>
      <pubDate>Sun, 19 Apr 2026 00:00:00 GMT</pubDate>
      <content:encoded><![CDATA[<p>Rust WASM content.</p>]]></content:encoded>
    </item>
  </channel>
</rss>`;

describe('isValidFeedDocument', () => {
  it('returns true for an RSS root', () => {
    expect(isValidFeedDocument('<rss version="2.0"><channel></channel></rss>')).toBe(true);
  });

  it('returns true for an Atom root', () => {
    expect(isValidFeedDocument('<feed xmlns="http://www.w3.org/2005/Atom"></feed>')).toBe(true);
  });

  it('returns true for a channel root-like document', () => {
    expect(isValidFeedDocument('<channel><item></item></channel>')).toBe(true);
  });

  it('returns false for html content', () => {
    expect(isValidFeedDocument('<html><body>challenge</body></html>')).toBe(false);
  });

  it('returns false for empty content', () => {
    expect(isValidFeedDocument('')).toBe(false);
  });
});

describe('parseRssOrAtom', () => {
  it('parses RSS item entries and truncates descriptions', () => {
    const xml = `<?xml version="1.0"?>
      <rss><channel>
        <item>
          <title><![CDATA[Post One]]></title>
          <link>https://example.com/post-one</link>
          <pubDate>Mon, 20 Apr 2026 00:00:00 GMT</pubDate>
          <description><![CDATA[<p>${'A'.repeat(250)}</p>]]></description>
        </item>
      </channel></rss>`;

    const items = parseRssOrAtom(xml, 5);

    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({
      title: 'Post One',
      link: 'https://example.com/post-one',
      pubDate: 'Mon, 20 Apr 2026 00:00:00 GMT',
    });
    expect(items[0].description.length).toBeLessThanOrEqual(201);
    expect(items[0].description).toMatch(/…$/);
  });

  it('parses Atom entries including href links', () => {
    const xml = `<?xml version="1.0"?>
      <feed>
        <entry>
          <title>Atom Post</title>
          <link rel="alternate" href="https://example.com/atom-post" />
          <updated>2026-04-20T00:00:00Z</updated>
          <summary>Atom summary</summary>
        </entry>
      </feed>`;

    const items = parseRssOrAtom(xml, 5);

    expect(items).toEqual([
      {
        title: 'Atom Post',
        link: 'https://example.com/atom-post',
        pubDate: '2026-04-20T00:00:00Z',
        description: 'Atom summary',
      },
    ]);
  });

  it('parses Ghost-format RSS and does not use content:encoded as description', () => {
    const items = parseRssOrAtom(GHOST_RSS_FIXTURE, 5);

    expect(items).toHaveLength(2);
    expect(items[0].title).toBe('Building AI Agents on Cloudflare Workers');
    expect(items[0].link).toBe('https://blog.jaysonknight.com/ai-agents-cloudflare/');
    expect(items[0].description).toContain('A deep dive into building production-ready AI agents');
    expect(items[0].description).not.toContain('<p>');
    expect(items[0].description).not.toContain('Full post HTML');
    expect(items[1].title).toBe('Rust on the Edge: WASM Components with WASI');
  });

  it('returns empty array for empty RSS feed', () => {
    expect(parseRssOrAtom('<rss><channel></channel></rss>', 5)).toEqual([]);
  });

  it('uses Atom summary when description is missing', () => {
    const xml = `<?xml version="1.0"?>
      <feed>
        <entry>
          <title>Summary Only</title>
          <link href="https://example.com/summary-only" />
          <published>2026-04-20T00:00:00Z</published>
          <summary>Summary fallback text</summary>
        </entry>
      </feed>`;

    const items = parseRssOrAtom(xml, 5);

    expect(items).toEqual([
      {
        title: 'Summary Only',
        link: 'https://example.com/summary-only',
        pubDate: '2026-04-20T00:00:00Z',
        description: 'Summary fallback text',
      },
    ]);
  });

  it('extracts plain-text RSS link values', () => {
    const xml = `<?xml version="1.0"?>
      <rss><channel>
        <item>
          <title>Plain Link Post</title>
          <link>https://example.com/plain-link</link>
          <pubDate>Mon, 20 Apr 2026 00:00:00 GMT</pubDate>
          <description>Plain link item</description>
        </item>
      </channel></rss>`;

    const items = parseRssOrAtom(xml, 5);

    expect(items).toEqual([
      {
        title: 'Plain Link Post',
        link: 'https://example.com/plain-link',
        pubDate: 'Mon, 20 Apr 2026 00:00:00 GMT',
        description: 'Plain link item',
      },
    ]);
  });
});

describe('GET /api/rss', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('returns 400 when URL is missing', async () => {
    const response = await GET({ request: new Request('https://example.com/api/rss') } as Parameters<typeof GET>[0]);
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload).toEqual({ error: 'Missing RSS feed URL.' });
  });

  it('returns 400 for invalid URL', async () => {
    const response = await GET({
      request: new Request('https://example.com/api/rss?url=not-a-valid-url'),
    } as Parameters<typeof GET>[0]);
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload).toEqual({ error: 'Invalid RSS feed URL.' });
  });

  it('returns 502 when upstream returns text/html', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response('<html><body>challenge</body></html>', {
        status: 200,
        headers: { 'Content-Type': 'text/html; charset=UTF-8' },
      })
    );

    const response = await GET({
      request: new Request('https://example.com/api/rss?url=https%3A%2F%2Fexample.com%2Frss.xml'),
    } as Parameters<typeof GET>[0]);
    const payload = await response.json();

    expect(response.status).toBe(502);
    expect(payload).toEqual({
      error: 'Feed returned an HTML page instead of XML (possible bot challenge or redirect)',
    });
  });

  it('returns 502 when body is not a valid feed document', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response('<html><body>still not a feed</body></html>', {
        status: 200,
        headers: { 'Content-Type': 'application/xml' },
      })
    );

    const response = await GET({
      request: new Request('https://example.com/api/rss?url=https%3A%2F%2Fexample.com%2Frss.xml'),
    } as Parameters<typeof GET>[0]);
    const payload = await response.json();

    expect(response.status).toBe(502);
    expect(payload).toEqual({ error: 'Feed URL did not return a valid RSS or Atom document' });
  });

  it('returns 200 with parsed items on Ghost-format RSS success', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(GHOST_RSS_FIXTURE, {
        status: 200,
        headers: { 'Content-Type': 'application/octet-stream' },
      })
    );

    const response = await GET({
      request: new Request('https://example.com/api/rss?url=https%3A%2F%2Fblog.jaysonknight.com%2Ffeed%2F&max=5'),
    } as Parameters<typeof GET>[0]);
    const payload = (await response.json()) as { items: Array<{ title: string; link: string; description: string }> };

    expect(response.status).toBe(200);
    expect(payload.items).toHaveLength(2);
    expect(payload.items[0].title).toBe('Building AI Agents on Cloudflare Workers');
    expect(payload.items[0].link).toBe('https://blog.jaysonknight.com/ai-agents-cloudflare/');
    expect(payload.items[0].description).toContain('A deep dive into building production-ready AI agents');
    expect(payload.items[0].description).not.toContain('<p>');
    expect(payload.items[0].description).not.toContain('Full post HTML');
    expect(payload.items[1].title).toBe('Rust on the Edge: WASM Components with WASI');

    expect(fetchMock).toHaveBeenCalledWith(
      'https://blog.jaysonknight.com/feed/',
      expect.objectContaining({
        cache: 'no-store',
        signal: expect.any(AbortSignal),
        headers: expect.objectContaining({
          Accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml, */*',
          'User-Agent': 'Mozilla/5.0 (compatible; JKcom-RSSBot/1.0; +https://jaysonknight.com)',
        }),
      })
    );
  });

  it('returns 502 when upstream returns non-200', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('nope', { status: 503 }));

    const response = await GET({
      request: new Request('https://example.com/api/rss?url=https%3A%2F%2Fexample.com%2Frss.xml'),
    } as Parameters<typeof GET>[0]);
    const payload = await response.json();

    expect(response.status).toBe(502);
    expect(payload).toEqual({ error: 'Failed to fetch feed (503).' });
  });

  it('handles AbortError from upstream fetch timeout', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new DOMException('The operation was aborted due to timeout', 'AbortError'));

    const response = await GET({
      request: new Request('https://example.com/api/rss?url=https%3A%2F%2Fexample.com%2Frss.xml'),
    } as Parameters<typeof GET>[0]);
    const payload = await response.json();

    expect(response.status).toBe(500);
    expect(payload).toEqual({ error: 'Unable to fetch RSS feed.' });
  });

  it('returns empty items for valid feed with no entries', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response('<rss><channel><title>Empty</title></channel></rss>', {
        status: 200,
        headers: { 'Content-Type': 'application/xml' },
      })
    );

    const response = await GET({
      request: new Request('https://example.com/api/rss?url=https%3A%2F%2Fexample.com%2Fempty.xml'),
    } as Parameters<typeof GET>[0]);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toEqual({ items: [] });
  });
});
