import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const headerPath = fileURLToPath(new URL('./Header.svelte', import.meta.url));
const headerSource = readFileSync(headerPath, 'utf8');

describe('Header component', () => {
  it('defines navLinks with absolute /#section hrefs', () => {
    expect(headerSource).toContain("href: '/#home'");
    expect(headerSource).toContain("href: '/#about'");
    expect(headerSource).toContain("href: '/#services'");
    expect(headerSource).toContain("href: '/#portfolio'");
    expect(headerSource).toContain("href: '/blog'");
    expect(headerSource).toContain("href: '/#contact'");
  });

  it('implements isActiveLink to normalize /#id hrefs against #id activeHref', () => {
    expect(headerSource).toContain('isActiveLink');
    expect(headerSource).toContain('activeHref');
    // Normalisation: prepend "/" to bare hash hrefs for comparison
    expect(headerSource).toContain('`/${activeHref}`');
  });

  it('renders Phosphor nav-cursor blink on the active link', () => {
    expect(headerSource).toContain('nav-cursor');
    expect(headerSource).toContain('nav-cursor-blink');
    // Blinking underscore cursor character
    expect(headerSource).toContain('>_<');
  });

  it('sets aria-current="page" on the active nav link', () => {
    expect(headerSource).toContain("aria-current={isActiveLink(href) ? 'page' : undefined}");
  });

  it('includes a mobile menu with aria-expanded and aria-controls', () => {
    expect(headerSource).toContain('isMenuOpen');
    expect(headerSource).toContain('aria-expanded={isMenuOpen}');
    expect(headerSource).toContain('aria-controls="mobile-menu"');
    expect(headerSource).toContain('id="mobile-menu"');
  });

  it('uses aria-hidden on mobile menu when closed', () => {
    expect(headerSource).toContain('aria-hidden={!isMenuOpen}');
  });

  it('integrates Calendly Book Me CTA via openCalendlyPopup', () => {
    expect(headerSource).toContain('openCalendlyPopup');
    expect(headerSource).toContain('Book Me');
    expect(headerSource).toContain('calendly.com/jaysonknight');
  });

  it('uses IntersectionObserver with multi-threshold for active section tracking', () => {
    expect(headerSource).toContain('IntersectionObserver');
    expect(headerSource).toContain('threshold: [0, 0.25, 0.5, 0.75, 1]');
  });

  it('uses backdrop-filter for glassmorphism nav bar styling', () => {
    expect(headerSource).toContain('backdrop-filter');
  });

  it('respects reduced motion in nav-cursor via CSS media query', () => {
    expect(headerSource).toContain('prefers-reduced-motion: reduce');
    // Animation is suppressed and cursor stays visible
    expect(headerSource).toContain('animation: none');
  });
});
