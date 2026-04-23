import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const contactSectionPath = fileURLToPath(new URL('./Contact.svelte', import.meta.url));
const contactSectionSource = readFileSync(contactSectionPath, 'utf8');

describe('Contact section content', () => {
  it('includes a state-of-the-art roadmap with visual, structural, feature, and technical improvements', () => {
    expect(contactSectionSource).toContain('State-of-the-Art Website Roadmap');
    expect(contactSectionSource).toContain('Visual:</strong>');
    expect(contactSectionSource).toContain('Structural:</strong>');
    expect(contactSectionSource).toContain('Features:</strong>');
    expect(contactSectionSource).toContain('Technical:</strong>');
  });
});
