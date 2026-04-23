import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const contactSectionPath = fileURLToPath(new URL('./Contact.svelte', import.meta.url));
const contactSectionSource = readFileSync(contactSectionPath, 'utf8');

describe('Contact section content', () => {
  it('implements interactive fast-track upgrades and improved form accessibility', () => {
    expect(contactSectionSource).toContain('Fast-Track Website Upgrades');
    expect(contactSectionSource).toContain('Visual Refresh Sprint');
    expect(contactSectionSource).toContain('Structural IA Overhaul');
    expect(contactSectionSource).toContain('Feature Expansion Build');
    expect(contactSectionSource).toContain('Technical Hardening Pass');
    expect(contactSectionSource).toContain('applyQuickStart');
    expect(contactSectionSource).toContain('aria-invalid={fieldErrors.email ? \'true\' : \'false\'}');
  });
});
