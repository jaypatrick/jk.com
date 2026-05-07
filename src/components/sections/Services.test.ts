import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const servicesPath = fileURLToPath(new URL('./Services.svelte', import.meta.url));
const servicesSource = readFileSync(servicesPath, 'utf8');

describe('Services section', () => {
  it('uses BootLabel with "SERVICES" label', () => {
    expect(servicesSource).toContain('BootLabel');
    expect(servicesSource).toContain('"SERVICES"');
  });

  it('implements accessible tab switcher for Technical / Creative categories', () => {
    expect(servicesSource).toContain('role="tablist"');
    expect(servicesSource).toContain('aria-label="Services categories"');
    expect(servicesSource).toContain('role="tab"');
    expect(servicesSource).toContain('aria-selected');
    expect(servicesSource).toContain('aria-controls');
    expect(servicesSource).toContain('activeTab');
    expect(servicesSource).toContain('tab-technical');
    expect(servicesSource).toContain('tab-creative');
  });

  it('keeps both tabpanels mounted and uses hidden attribute for inactive panel', () => {
    expect(servicesSource).toContain('role="tabpanel"');
    expect(servicesSource).toContain('id="panel-technical"');
    expect(servicesSource).toContain('id="panel-creative"');
    expect(servicesSource).toContain('hidden={activeTab !==');
    // Inactive cards should not receive focus
    expect(servicesSource).toContain("tabindex={activeTab === 'technical' ? 0 : -1}");
    expect(servicesSource).toContain("tabindex={activeTab === 'creative' ? 0 : -1}");
  });

  it('implements expand/collapse service cards with accessibility', () => {
    expect(servicesSource).toContain('expandedTechnicalIndex');
    expect(servicesSource).toContain('expandedCreativeIndex');
    expect(servicesSource).toContain('toggleService');
    expect(servicesSource).toContain('aria-expanded');
    // Expand/collapse indicator text
    expect(servicesSource).toContain('▴ Details');
    expect(servicesSource).toContain('▾ Details');
  });

  it('lists key technical services', () => {
    expect(servicesSource).toContain('Azure Solutions Architecture');
    expect(servicesSource).toContain('AI Architecture & Agentic Systems');
    expect(servicesSource).toContain('Rust & WebAssembly');
    expect(servicesSource).toContain('Cloudflare Platform');
    expect(servicesSource).toContain('Privacy & Security Engineering');
    expect(servicesSource).toContain('Technical Advisory & Fractional CTO');
  });

  it('lists key creative services', () => {
    expect(servicesSource).toContain('Digital Media & Web Design');
    expect(servicesSource).toContain('Microsoft 365 & Teams');
  });

  it('uses iridescent Phosphor cards', () => {
    expect(servicesSource).toContain('glow-border iridescent');
  });

  it('includes Labs & Open Source callout card', () => {
    expect(servicesSource).toContain('Labs & Open Source');
    expect(servicesSource).toContain('GitHub Repos →');
  });

  it('integrates Calendly Book Me CTA via openCalendlyPopup', () => {
    expect(servicesSource).toContain('openCalendlyPopup');
    expect(servicesSource).toContain('Book Me');
  });
});
