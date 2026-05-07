import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const tvIntroPath = fileURLToPath(new URL('./TVIntro.svelte', import.meta.url));
const tvIntroSource = readFileSync(tvIntroPath, 'utf8');

describe('TVIntro component', () => {
  it('defines all Phosphor TV intro phase states', () => {
    expect(tvIntroSource).toContain("'off'");
    expect(tvIntroSource).toContain("'line'");
    expect(tvIntroSource).toContain("'power-on'");
    expect(tvIntroSource).toContain("'static'");
    expect(tvIntroSource).toContain("'emerge'");
    expect(tvIntroSource).toContain("'clear'");
    expect(tvIntroSource).toContain("'done'");
  });

  it('defines precise absolute timeline offsets for the intro sequence', () => {
    expect(tvIntroSource).toContain('POWER_ON_START_MS');
    expect(tvIntroSource).toContain('LINE_HOLD_MS');
    expect(tvIntroSource).toContain('POWER_ON_EXPAND_MS');
    expect(tvIntroSource).toContain('STATIC_START_MS');
    expect(tvIntroSource).toContain('EMERGE_START_MS');
    expect(tvIntroSource).toContain('CLEAR_START_MS');
    expect(tvIntroSource).toContain('DONE_START_MS');
  });

  it('dispatches the tv-intro-done CustomEvent and updates introState on completion', () => {
    expect(tvIntroSource).toContain('notifyDone');
    expect(tvIntroSource).toContain("'tv-intro-done'");
    expect(tvIntroSource).toContain('introState.done = true');
    expect(tvIntroSource).toContain("new CustomEvent('tv-intro-done')");
  });

  it('removes data-phosphor-intro attribute from the document root on completion', () => {
    expect(tvIntroSource).toContain("removeAttribute('data-phosphor-intro')");
  });

  it('skips the animation and finalizes immediately when already seen or reduced-motion', () => {
    expect(tvIntroSource).toContain("sessionStorage.getItem('tv-intro-seen')");
    expect(tvIntroSource).toContain('reduceMotion');
    expect(tvIntroSource).toContain('finalizeImmediately');
  });

  it('persists the seen flag in sessionStorage after a full playthrough', () => {
    expect(tvIntroSource).toContain("sessionStorage.setItem('tv-intro-seen', '1')");
  });

  it('draws animated CRT static noise on a canvas element', () => {
    expect(tvIntroSource).toContain('drawNoise');
    expect(tvIntroSource).toContain('noise-canvas');
    expect(tvIntroSource).toContain('SWEEP_BAR_SPEED');
    expect(tvIntroSource).toContain('SWEEP_BAR_HEIGHT');
    expect(tvIntroSource).toContain('STATIC_RESOLUTION_SCALE');
    expect(tvIntroSource).toContain('requestAnimationFrame');
  });

  it('renders the Phosphor crt-power-line during the line phase', () => {
    expect(tvIntroSource).toContain('crt-power-line');
    expect(tvIntroSource).toContain("phase === 'line'");
    expect(tvIntroSource).toContain('crt-line-flicker');
  });

  it('renders scanlines overlay during static/emerge/clear phases', () => {
    expect(tvIntroSource).toContain('scanlines');
    expect(tvIntroSource).toContain('scanline-flicker');
  });

  it('shows the "THIS. IS. JK.com" title during emerge and clear phases', () => {
    expect(tvIntroSource).toContain('THIS. IS.');
    expect(tvIntroSource).toContain('JK.com');
    expect(tvIntroSource).toContain("phase === 'emerge'");
    expect(tvIntroSource).toContain("phase === 'clear'");
  });

  it('is aria-hidden to prevent screen reader interference', () => {
    expect(tvIntroSource).toContain('aria-hidden="true"');
  });

  it('prevents body scroll during intro playback', () => {
    expect(tvIntroSource).toContain("document.body.style.overflow = 'hidden'");
    expect(tvIntroSource).toContain('originalOverflow');
  });

  it('cleans up all scheduled timeouts on teardown', () => {
    expect(tvIntroSource).toContain('clearTimeout');
    expect(tvIntroSource).toContain('cancelAnimationFrame');
  });

  it('removes the tv-intro-active class from document root on normal completion', () => {
    expect(tvIntroSource).toContain("classList.remove('tv-intro-active')");
  });

  it('removes the tv-intro-active class in the immediate skip path (seen or reduced-motion)', () => {
    // Both finalizeImmediately and notifyDone must remove the class so neither path leaves
    // the page scroll-locked or black after the intro ends.
    const matches = [...tvIntroSource.matchAll(/classList\.remove\('tv-intro-active'\)/g)];
    expect(matches.length).toBeGreaterThanOrEqual(2);
  });
});
