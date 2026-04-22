import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const blogPagePath = fileURLToPath(new URL('./index.astro', import.meta.url));
const blogPageSource = readFileSync(blogPagePath, 'utf8');
const normalizedBlogPageSource = blogPageSource.replace(/\s+/g, ' ');

describe('/blog page', () => {
  it('links to blog.jaysonknight.com instead of Bloqr', () => {
    expect(normalizedBlogPageSource).toMatch(/href="https:\/\/blog\.jaysonknight\.com\/"/);
    expect(blogPageSource).not.toContain('bloqr.jaysonknight.com');
    expect(normalizedBlogPageSource).toMatch(/Read the Blog\s*→/);
  });

  it('includes an RSS feed section for recent posts', () => {
    expect(normalizedBlogPageSource).toMatch(/<RssFeed\b[^>]*\bclient:load\b/);
    expect(normalizedBlogPageSource).toMatch(/\bfeedUrl="https:\/\/blog\.jaysonknight\.com\/feed\/"/);
    expect(normalizedBlogPageSource).toMatch(/\bmaxItems=\{10\}/);
  });
});
