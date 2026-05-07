import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const bootLabelPath = fileURLToPath(new URL('./BootLabel.svelte', import.meta.url));
const bootLabelSource = readFileSync(bootLabelPath, 'utf8');

describe('BootLabel component', () => {
  it('shows "// INITIALIZING..." placeholder during boot phase', () => {
    expect(bootLabelSource).toContain('// INITIALIZING...');
    expect(bootLabelSource).toContain('showInitializing');
  });

  it('uses IntersectionObserver to trigger boot animation on scroll-in', () => {
    expect(bootLabelSource).toContain('IntersectionObserver');
    expect(bootLabelSource).toContain('isIntersecting');
    expect(bootLabelSource).toContain('hasBooted');
    expect(bootLabelSource).toContain('threshold: 0.1');
  });

  it('transitions from INITIALIZING to the real label after a timeout', () => {
    expect(bootLabelSource).toContain('setTimeout');
    expect(bootLabelSource).toContain('showInitializing = false');
    // 600 ms hold duration
    expect(bootLabelSource).toContain('600');
  });

  it('uses overlapping boot-label-layer elements for cross-fade', () => {
    expect(bootLabelSource).toContain('boot-label-shell');
    expect(bootLabelSource).toContain('boot-label-layer');
    expect(bootLabelSource).toContain('is-active');
  });

  it('toggles aria-hidden on each layer for screen reader correctness', () => {
    expect(bootLabelSource).toContain('aria-hidden={!showInitializing}');
    expect(bootLabelSource).toContain('aria-hidden={showInitializing}');
  });

  it('skips animation and shows label immediately for reduced-motion users', () => {
    expect(bootLabelSource).toContain("'(prefers-reduced-motion: reduce)'");
    expect(bootLabelSource).toContain('showInitializing = false');
    expect(bootLabelSource).toContain('hasBooted = true');
  });

  it('cleans up the observer and timeout on teardown', () => {
    expect(bootLabelSource).toContain('observer.disconnect()');
    expect(bootLabelSource).toContain('clearTimeout');
  });

  it('accepts a label prop and an optional class prop', () => {
    expect(bootLabelSource).toContain('label: string');
    expect(bootLabelSource).toContain('class?: string');
  });

  it('applies the section-label boot-label base classes on the root element', () => {
    expect(bootLabelSource).toContain('section-label boot-label');
  });
});
