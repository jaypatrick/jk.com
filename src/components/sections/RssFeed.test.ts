import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const rssFeedPath = fileURLToPath(new URL('./RssFeed.svelte', import.meta.url));
const rssFeedSource = readFileSync(rssFeedPath, 'utf8');

describe('RssFeed section', () => {
  it('uses BootLabel with "WHAT I THINK" label', () => {
    expect(rssFeedSource).toContain('BootLabel');
    expect(rssFeedSource).toContain('"WHAT I THINK"');
  });

  it('renders accessible loading skeleton with live region', () => {
    expect(rssFeedSource).toContain('role="status"');
    expect(rssFeedSource).toContain('aria-label="Loading blog posts"');
    expect(rssFeedSource).toContain('aria-live="polite"');
    expect(rssFeedSource).toContain('animate-pulse');
  });

  it('renders an accessible error state with alert role', () => {
    expect(rssFeedSource).toContain('role="alert"');
    expect(rssFeedSource).toContain('error-box');
  });

  it('uses Portfolio-matched Phosphor glow-border iridescent feed cards', () => {
    expect(rssFeedSource).toContain('feed-card glow-border iridescent');
  });

  it('keeps only local layout and transform styles on feed-card so shared Phosphor utilities own the border glow', () => {
    expect(rssFeedSource).toContain('.feed-card {');
    expect(rssFeedSource).toContain('position: relative;');
    expect(rssFeedSource).toContain('background: var(--color-card, #111827);');
    expect(rssFeedSource).toContain('overflow: hidden;');
    expect(rssFeedSource).toContain('transition: transform 0.2s ease;');
    expect(rssFeedSource).toContain('.feed-card:hover {');
    expect(rssFeedSource).toContain('transform: translateY(-3px);');
    expect(rssFeedSource).not.toContain('border:');
    expect(rssFeedSource).not.toContain('box-shadow:');
    expect(rssFeedSource).not.toContain('border-color:');
  });

  it('uses Svelte fade transition on feed item reveal', () => {
    expect(rssFeedSource).toContain("from 'svelte/transition'");
    expect(rssFeedSource).toContain('in:fade');
  });

  it('derives formatted date strings from raw pubDate', () => {
    expect(rssFeedSource).toContain('formattedDate');
    expect(rssFeedSource).toContain('toLocaleDateString');
    expect(rssFeedSource).toContain("'Date unavailable'");
  });

  it('cancels in-flight fetch when feedUrl or maxItems props change', () => {
    // The cancelled flag prevents stale responses from updating state
    expect(rssFeedSource).toContain('cancelled');
    expect(rssFeedSource).toContain('cancelled = true');
  });

  it('fetches from the /api/rss endpoint with url and max params', () => {
    expect(rssFeedSource).toContain('/api/rss');
    expect(rssFeedSource).toContain("params.set('url'");
    expect(rssFeedSource).toContain("params.set('max'");
  });

  it('renders a view-all link to the external blog', () => {
    expect(rssFeedSource).toContain('View all posts →');
    expect(rssFeedSource).toContain('blog.jaysonknight.com');
  });

  it('renders empty-state fallback when no feed items are returned', () => {
    expect(rssFeedSource).toContain('No posts available right now');
    expect(rssFeedSource).toContain('visit the blog directly');
  });

  it('uses aria-labelledby for the section heading association', () => {
    expect(rssFeedSource).toContain('aria-labelledby="blog-feed-heading"');
    expect(rssFeedSource).toContain('id="blog-feed-heading"');
  });
});
