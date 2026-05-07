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
    expect(contactSectionSource).toMatch(/aria-invalid\s*=\s*\{[^}]*fieldErrors\.email[^}]*\}/);
    expect(contactSectionSource).toContain('class="terminal-field"');
    expect(contactSectionSource).toContain('[ TRANSMIT ]');
    expect(contactSectionSource).toContain('TRANSMISSION_RECEIVED');
    expect(contactSectionSource).toContain('ERR // {errorMessage}');
  });

  it('includes the Calendly CRT modal trigger and overlay', () => {
    expect(contactSectionSource).toContain('[ SCHEDULE_SESSION ]');
    expect(contactSectionSource).toContain('isCalendlyReady');
    expect(contactSectionSource).toContain('openCalendlyModal');
    expect(contactSectionSource).toContain('closeCalendlyModal');
    expect(contactSectionSource).toContain('calendlyModalOpen');
    expect(contactSectionSource).toContain('calendly-modal-backdrop');
    expect(contactSectionSource).toContain('calendly-modal-panel');
    expect(contactSectionSource).toContain('[ CLOSE ]');
    expect(contactSectionSource).toContain('modal-title');
  });
});
