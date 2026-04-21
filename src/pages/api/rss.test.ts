import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GET, parseRssOrAtom } from './rss';

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

  it('returns feed items on success', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        `<?xml version="1.0"?>
        <rss><channel>
          <item>
            <title>Post One</title>
            <link>https://example.com/post-one</link>
            <pubDate>Mon, 20 Apr 2026 00:00:00 GMT</pubDate>
            <description><p>Hello world</p></description>
          </item>
        </channel></rss>`,
        { status: 200 }
      )
    );

    const response = await GET({
      request: new Request('https://example.com/api/rss?url=https%3A%2F%2Fexample.com%2Frss.xml&max=1'),
    } as Parameters<typeof GET>[0]);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toEqual({
      items: [
        {
          title: 'Post One',
          link: 'https://example.com/post-one',
          pubDate: 'Mon, 20 Apr 2026 00:00:00 GMT',
          description: 'Hello world',
        },
      ],
    });
    expect(fetchMock).toHaveBeenCalledWith(
      'https://example.com/rss.xml',
      expect.objectContaining({
        headers: expect.objectContaining({
          Accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml',
          'User-Agent': 'Mozilla/5.0 (compatible; JKcom-RSSBot/1.0; +https://jaysonknight.com)',
        }),
      })
    );
  });

  it('returns 502 when upstream content type is non-XML', async () => {
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
      error: 'Feed returned non-XML response (possible bot challenge or redirect)',
    });
  });
});
