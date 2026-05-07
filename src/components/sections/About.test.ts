import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const aboutPath = fileURLToPath(new URL('./About.svelte', import.meta.url));
const aboutSource = readFileSync(aboutPath, 'utf8');

describe('About section', () => {
  it('uses BootLabel with "WHO I AM" label', () => {
    expect(aboutSource).toContain('BootLabel');
    expect(aboutSource).toContain('WHO I AM');
  });

  it('implements expand/collapse expertise accordion with accessibility', () => {
    expect(aboutSource).toContain('expandedExpertiseIndex');
    expect(aboutSource).toContain('toggleExpertise');
    expect(aboutSource).toContain('aria-expanded');
    expect(aboutSource).toContain('aria-label');
    // Toggle indicator symbols
    expect(aboutSource).toContain('▴');
    expect(aboutSource).toContain('▾');
  });

  it('uses iridescent Phosphor cards for expertise entries', () => {
    expect(aboutSource).toContain('glow-border iridescent');
  });

  it('lists key expertise areas', () => {
    expect(aboutSource).toContain('AI Architecture & Agentic Systems');
    expect(aboutSource).toContain('AI Engineering');
    expect(aboutSource).toContain('Cloudflare Platform');
    expect(aboutSource).toContain('Rust & WebAssembly');
  });

  it('includes philosophy panel with core values', () => {
    expect(aboutSource).toContain('Why I Do It');
    expect(aboutSource).toContain('Technology should drive innovation');
    expect(aboutSource).toContain('Core philosophy');
  });

  it('includes a CTA link to the contact section', () => {
    expect(aboutSource).toContain('href="#contact"');
    expect(aboutSource).toContain('Talk To Me');
  });

  it('uses gradient-text for heading accent', () => {
    expect(aboutSource).toContain('gradient-text');
    expect(aboutSource).toContain('Human-scale delivery.');
  });

  it('uses animate-on-scroll for Phosphor reveal animations', () => {
    expect(aboutSource).toContain('animate-on-scroll');
  });
});
