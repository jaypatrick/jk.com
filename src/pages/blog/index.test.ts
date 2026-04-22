import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const blogPagePath = fileURLToPath(new URL('./index.astro', import.meta.url));
const blogPageSource = readFileSync(blogPagePath, 'utf8');

describe('/blog page', () => {
  it('links to blog.jaysonknight.com instead of Bloqr', () => {
    expect(blogPageSource).toMatch(/href="https:\/\/blog\.jaysonknight\.com\/"/);
    expect(blogPageSource).not.toContain('bloqr.jaysonknight.com');
    expect(blogPageSource).toMatch(/Read the Blog\s*→/);
  });

  it('includes an RSS feed section for recent posts', () => {
    expect(blogPageSource).toMatch(
      /<RssFeed\b(?=[^>]*\bclient:load\b)(?=[^>]*\bfeedUrl="https:\/\/blog\.jaysonknight\.com\/feed\/")(?=[^>]*\bmaxItems=\{10\})[^>]*\/>/
    );
  });
});
