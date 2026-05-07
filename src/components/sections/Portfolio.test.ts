import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const portfolioPath = fileURLToPath(new URL('./Portfolio.svelte', import.meta.url));
const portfolioSource = readFileSync(portfolioPath, 'utf8');

describe('Portfolio section', () => {
  it('uses BootLabel with "PORTFOLIO" and "CLIENTS I ADORE" labels', () => {
    expect(portfolioSource).toContain('BootLabel');
    expect(portfolioSource).toContain('"PORTFOLIO"');
    expect(portfolioSource).toContain('"CLIENTS I ADORE"');
  });

  it('renders case study cards with Phosphor glow-border iridescent styling', () => {
    expect(portfolioSource).toContain('portfolio-card glow-border iridescent');
    // CSS custom property for staggered Phosphor signal-lock animation delay
    expect(portfolioSource).toContain('--signal-lock-delay');
  });

  it('includes key case studies', () => {
    expect(portfolioSource).toContain('Fortune 500 On-Prem → Azure');
    expect(portfolioSource).toContain('Cloudflare ZeroTrust SASE Rollout');
    expect(portfolioSource).toContain('.NET Framework 4.x → .NET 9');
    expect(portfolioSource).toContain('Adblock Compiler (OSS)');
  });

  it('uses aria-label on case study articles for accessibility', () => {
    expect(portfolioSource).toContain('aria-label={study.title}');
  });

  it('implements a client marquee with duplicated tiles for infinite scroll', () => {
    expect(portfolioSource).toContain('clients-marquee');
    expect(portfolioSource).toContain('clients-track');
    // Marquee aria label
    expect(portfolioSource).toContain('aria-label="Marquee of past clients"');
    // Second set of tiles is aria-hidden for screen readers
    expect(portfolioSource).toContain('aria-hidden="true"');
  });

  it('includes key client names in the marquee', () => {
    expect(portfolioSource).toContain('Microsoft');
    expect(portfolioSource).toContain('Deloitte Consulting');
    expect(portfolioSource).toContain('Paycom');
  });

  it('links to GitHub for OSS case studies', () => {
    expect(portfolioSource).toContain('View on GitHub →');
    expect(portfolioSource).toContain('https://github.com/jaypatrick');
  });

  it('uses animate-on-scroll for Phosphor reveal animations', () => {
    expect(portfolioSource).toContain('animate-on-scroll');
  });

  it('uses gradient-text for heading accent', () => {
    expect(portfolioSource).toContain('gradient-text');
    expect(portfolioSource).toContain('Ships');
  });
});
