import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const blogPagePath = fileURLToPath(new URL('./index.astro', import.meta.url));
const blogPageSource = readFileSync(blogPagePath, 'utf8');

describe('/blog page', () => {
  it('links to blog.jaysonknight.com instead of Bloqr', () => {
    expect(blogPageSource).toContain('href="https://blog.jaysonknight.com/"');
    expect(blogPageSource).not.toContain('bloqr.jaysonknight.com');
    expect(blogPageSource).toContain('Read the Blog →');
  });

  it('includes an RSS feed section for recent posts', () => {
    expect(blogPageSource).toContain('<RssFeed client:load feedUrl="https://blog.jaysonknight.com/feed/" maxItems={10} />');
  });
});
