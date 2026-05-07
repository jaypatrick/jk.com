import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const footerPath = fileURLToPath(new URL('./Footer.svelte', import.meta.url));
const footerSource = readFileSync(footerPath, 'utf8');

describe('Footer component', () => {
  it('imports and renders the ShimmerToggle component', () => {
    expect(footerSource).toContain("import ShimmerToggle from '../ui/ShimmerToggle.svelte'");
    expect(footerSource).toContain('<ShimmerToggle');
  });

  it('renders the Phosphor SYS: ONLINE status readout bar', () => {
    expect(footerSource).toContain('sys-status');
    expect(footerSource).toContain('SYS: ONLINE');
    expect(footerSource).toContain('NODE: CLT-01');
    expect(footerSource).toContain('STACK: ASTRO·SVELTE·CLOUDFLARE');
  });

  it('uses the Phosphor sys-dot pulsing indicator', () => {
    expect(footerSource).toContain('sys-dot');
    expect(footerSource).toContain('sys-pulse');
  });

  it('renders a dynamic BUILD date from PUBLIC_BUILD_DATE env var', () => {
    expect(footerSource).toContain('PUBLIC_BUILD_DATE');
    expect(footerSource).toContain('buildDate');
    expect(footerSource).toContain('BUILD:');
    expect(footerSource).toContain("'LOCAL'");
  });

  it('validates BUILD date format as YYYY-MM-DD before display', () => {
    expect(footerSource).toContain('/^\\d{4}-\\d{2}-\\d{2}$/');
  });

  it('includes footer navigation links', () => {
    expect(footerSource).toContain("href: '#about'");
    expect(footerSource).toContain("href: '#services'");
    expect(footerSource).toContain("href: '#contact'");
    expect(footerSource).toContain("href: '/blog'");
    expect(footerSource).toContain("href: '/privacy'");
  });

  it('includes social links to GitHub, LinkedIn, and Calendly', () => {
    expect(footerSource).toContain('https://github.com/jaypatrick');
    expect(footerSource).toContain('https://www.linkedin.com/in/jaysonknight');
    expect(footerSource).toContain('https://calendly.com/jaysonknight');
  });

  it('uses the Phosphor monospace footer utility bar comment', () => {
    expect(footerSource).toContain('Phosphor — monospace footer utility bar');
  });

  it('includes a "built with" tech stack block', () => {
    expect(footerSource).toContain('// built with');
    expect(footerSource).toContain('Astro 6');
    expect(footerSource).toContain('Svelte 5');
    expect(footerSource).toContain('Cloudflare');
  });

  it('disables sys-dot animation for reduced motion users', () => {
    expect(footerSource).toContain('prefers-reduced-motion: reduce');
    expect(footerSource).toContain('animation: none');
  });
});
