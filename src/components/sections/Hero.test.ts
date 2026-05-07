import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const heroPath = fileURLToPath(new URL('./Hero.svelte', import.meta.url));
const heroSource = readFileSync(heroPath, 'utf8');

describe('Hero section', () => {
  it('implements Phosphor glitch-text treatment for main heading', () => {
    expect(heroSource).toContain('glitch-text');
    expect(heroSource).toContain('data-text="THIS. IS."');
    expect(heroSource).toContain('glitch-1');
    expect(heroSource).toContain('glitch-2');
    expect(heroSource).toContain('phosphor-decay');
    expect(heroSource).toContain('THIS. IS.');
    expect(heroSource).toContain('JK.com');
  });

  it('implements CRT typewriter subtitle with Phosphor cursor', () => {
    expect(heroSource).toContain('FULL_TEXT');
    expect(heroSource).toContain("'Imagination | Unleashed'");
    expect(heroSource).toContain('displayedText');
    expect(heroSource).toContain('cursorVisible');
    expect(heroSource).toContain('cursorBlinking');
    expect(heroSource).toContain('crt-line');
    expect(heroSource).toContain('crt-cursor');
    expect(heroSource).toContain('crt-subtitle-wrap');
    // Phosphor cursor block character
    expect(heroSource).toContain('█');
    // Screen-reader fallback text
    expect(heroSource).toContain('sr-only');
    expect(heroSource).toContain('Imagination | Unleashed');
  });

  it('integrates with TV intro sequencing via introState and tv-intro-done event', () => {
    expect(heroSource).toContain('introState');
    expect(heroSource).toContain("'tv-intro-done'");
    expect(heroSource).toContain('introState.done');
    expect(heroSource).toContain('mounted');
  });

  it('includes Phosphor terminal status-readout chip', () => {
    expect(heroSource).toContain('status-readout');
    expect(heroSource).toContain('status-dot');
    expect(heroSource).toContain('ONLINE');
    expect(heroSource).toContain('LOCATION: CHARLOTTE, NC');
    expect(heroSource).toContain('STATUS: AVAILABLE');
  });

  it('handles prefers-reduced-motion for typewriter', () => {
    expect(heroSource).toContain('prefersReducedMotion');
    expect(heroSource).toContain('renderStaticLine');
    expect(heroSource).toContain("'(prefers-reduced-motion: reduce)'");
  });

  it('integrates Calendly popup for the Book Me CTA', () => {
    expect(heroSource).toContain('openCalendlyPopup');
    expect(heroSource).toContain('Book Me');
    expect(heroSource).toContain('calendly.com/jaysonknight');
  });

  it('uses iridescent bracket-tag chips for role specializations', () => {
    expect(heroSource).toContain('bracket-tag iridescent');
    expect(heroSource).toContain('Azure Architect');
    expect(heroSource).toContain('AI Engineer');
    expect(heroSource).toContain('Cloudflare Specialist');
    expect(heroSource).toContain('Rust & WASM');
    expect(heroSource).toContain('Privacy & Security');
  });

  it('uses Phosphor corner bracket SVG decorations', () => {
    // All four corners TL, TR, BL, BR
    expect(heroSource).toMatch(/M 0 24 L 0 0 L 24 0/); // TL
    expect(heroSource).toMatch(/M 24 0 L 48 0 L 48 24/); // TR
    expect(heroSource).toMatch(/M 0 24 L 0 48 L 24 48/); // BL
    expect(heroSource).toMatch(/M 24 48 L 48 48 L 48 24/); // BR
  });
});
