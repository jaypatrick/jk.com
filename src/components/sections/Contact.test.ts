import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const contactSectionPath = fileURLToPath(new URL('./Contact.svelte', import.meta.url));
const contactSectionSource = readFileSync(contactSectionPath, 'utf8');

describe('Contact section content', () => {
  it('includes a website improvement ideas block with practical suggestions', () => {
    expect(contactSectionSource).toContain('Website Improvement Ideas');
    expect(contactSectionSource).toContain('Improve performance with image optimization');
    expect(contactSectionSource).toContain('Increase conversions with clearer CTAs above the fold');
    expect(contactSectionSource).toContain('Strengthen SEO by expanding long-tail service pages');
    expect(contactSectionSource).toContain('Add more trust signals: measurable outcomes');
  });
});
