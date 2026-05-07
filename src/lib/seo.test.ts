import { describe, expect, it } from 'vitest';
import { DEFAULT_OG_DESCRIPTION, DEFAULT_OG_TITLE } from './og-defaults';
import { buildSeoMetadata } from './seo';

describe('buildSeoMetadata', () => {
  const site = new URL('https://jaysonknight.com');

  it('builds route-aware OG image URLs using page metadata', () => {
    const seo = buildSeoMetadata({
      site,
      pathname: '/blog',
      title: 'Blog | JK.com — Jayson Knight',
      description: 'Thoughts on Azure and Cloudflare.',
    });

    expect(seo.canonicalUrl).toBe('https://jaysonknight.com/blog');
    expect(seo.ogImageUrl).toBe(
      'https://jaysonknight.com/api/og/blog?title=Blog+%7C+JK.com+%E2%80%94+Jayson+Knight&description=Thoughts+on+Azure+and+Cloudflare.'
    );
    expect(seo.ogImageAlt).toBe('Blog | JK.com — Jayson Knight — social preview image');
    expect(seo.author).toBe('Jayson Knight');
  });

  it('uses defaults when title and description are not provided', () => {
    const seo = buildSeoMetadata({
      site,
      pathname: '/privacy',
    });

    expect(seo.title).toBe(DEFAULT_OG_TITLE);
    expect(seo.description).toBe(DEFAULT_OG_DESCRIPTION);
    expect(seo.ogImageUrl).toBe(
      'https://jaysonknight.com/api/og/privacy?title=JK.com+%7C+Unbounded+%7C+Imagination+%E2%80%94+Jayson+Knight&description=Jayson+Knight+%E2%80%94+AI+Architect+%26+Engineer+specializing+in+agentic+systems%2C+multi-agent+orchestration%2C+MCP+servers%2C+and+ADEs.+Building+on+Anthropic+Claude%2C+Microsoft+Azure%2C+and+the+Cloudflare+edge.+Creator+of+Bloqr%2C+an+AI-native+publishing+platform.+20%2B+years+of+enterprise+software.+Charlotte%2C+NC.'
    );
    expect(seo.ogImageAlt).toBe(`${DEFAULT_OG_TITLE} — social preview image`);
    expect(seo.author).toBe('Jayson Knight');
  });

  it('uses explicit OG image when provided', () => {
    const seo = buildSeoMetadata({
      site,
      pathname: '/',
      ogImage: '/custom-og.png',
    });

    expect(seo.ogImageUrl).toBe('https://jaysonknight.com/custom-og.png');
  });

  it('builds root OG image URLs without a route segment for the home page', () => {
    const seo = buildSeoMetadata({
      site,
      pathname: '/',
      title: 'JK.com — Jayson Knight',
      description: 'Home page overview.',
    });

    expect(seo.canonicalUrl).toBe('https://jaysonknight.com/');
    expect(seo.ogImageUrl).toBe(
      'https://jaysonknight.com/api/og?title=JK.com+%E2%80%94+Jayson+Knight&description=Home+page+overview.'
    );
  });

  it('builds nested route OG image URLs using the full pathname', () => {
    const seo = buildSeoMetadata({
      site,
      pathname: '/blog/new-post',
      title: 'New Post | JK.com — Jayson Knight',
      description: 'Deep dive into nested route metadata.',
    });

    expect(seo.canonicalUrl).toBe('https://jaysonknight.com/blog/new-post');
    expect(seo.ogImageUrl).toBe(
      'https://jaysonknight.com/api/og/blog/new-post?title=New+Post+%7C+JK.com+%E2%80%94+Jayson+Knight&description=Deep+dive+into+nested+route+metadata.'
    );
  });
});
