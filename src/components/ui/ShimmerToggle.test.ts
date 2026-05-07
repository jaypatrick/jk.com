import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const shimmerTogglePath = fileURLToPath(new URL('./ShimmerToggle.svelte', import.meta.url));
const shimmerToggleSource = readFileSync(shimmerTogglePath, 'utf8');

describe('ShimmerToggle component', () => {
  it('uses localStorage key "shimmer-paused" to persist shimmer preference', () => {
    expect(shimmerToggleSource).toContain("'shimmer-paused'");
    expect(shimmerToggleSource).toContain('localStorage.getItem');
    expect(shimmerToggleSource).toContain('localStorage.setItem');
  });

  it('reads initial shimmer state from localStorage on mount', () => {
    expect(shimmerToggleSource).toContain('onMount');
    expect(shimmerToggleSource).toContain("stored === 'true'");
  });

  it('updates data-shimmer-paused on the document root element', () => {
    expect(shimmerToggleSource).toContain('document.documentElement.dataset.shimmerPaused');
  });

  it('uses aria-pressed to reflect current toggle state', () => {
    expect(shimmerToggleSource).toContain('aria-pressed={paused}');
  });

  it('uses contextual aria-label for screen reader clarity', () => {
    expect(shimmerToggleSource).toContain('Enable shimmer animation');
    expect(shimmerToggleSource).toContain('Pause shimmer animation');
  });

  it('toggles the paused state and persists on click', () => {
    expect(shimmerToggleSource).toContain('function toggle');
    expect(shimmerToggleSource).toContain('paused = !paused');
  });

  it('renders Shimmer on / Shimmer off label text based on state', () => {
    expect(shimmerToggleSource).toContain('Shimmer off');
    expect(shimmerToggleSource).toContain('Shimmer on');
  });

  it('uses shimmer-toggle and chip CSS classes', () => {
    expect(shimmerToggleSource).toContain('shimmer-toggle chip');
  });

  it('uses different Unicode star icons for paused vs active states', () => {
    // Filled star when paused, open star when active
    expect(shimmerToggleSource).toContain('✦');
    expect(shimmerToggleSource).toContain('✧');
  });
});
