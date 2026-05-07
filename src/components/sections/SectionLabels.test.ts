import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const sectionFiles = [
  './About.svelte',
  './Services.svelte',
  './Portfolio.svelte',
  './Contact.svelte',
  './RssFeed.svelte',
] as const;

describe('Section labels', () => {
  it('uses BootLabel across section components', () => {
    for (const relativePath of sectionFiles) {
      const source = readFileSync(fileURLToPath(new URL(relativePath, import.meta.url)), 'utf8');
      expect(source).toContain('BootLabel');
    }
  });
});
