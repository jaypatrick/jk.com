<script lang="ts">
  // ShimmerToggle.svelte — user-controlled toggle for decorative CSS animations
  // Svelte 5 runes API: $state, $effect
  const STORAGE_KEY = 'reduce-motion';

  let paused = $state(false);

  function applyState(value: boolean) {
    if (value) {
      document.documentElement.dataset.reduceMotion = 'true';
    } else {
      delete document.documentElement.dataset.reduceMotion;
    }
  }

  $effect(() => {
    // Initialize from localStorage / OS preference on mount (no reactive reads of `paused`)
    const stored = localStorage.getItem(STORAGE_KEY);
    const initial = stored !== null
      ? stored === 'true'
      : window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    paused = initial;
    applyState(initial);

    // Sync state when preference changes in another tab
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        const updated = e.newValue === 'true';
        paused = updated;
        applyState(updated);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  });

  function toggle() {
    paused = !paused;
    localStorage.setItem(STORAGE_KEY, String(paused));
    applyState(paused);
  }
</script>

<button
  type="button"
  class="shimmer-toggle"
  aria-pressed={paused}
  aria-label={paused ? 'Resume decorative animations' : 'Pause decorative animations'}
  onclick={toggle}
  title={paused ? 'Resume decorative animations' : 'Pause decorative animations'}
>
  <span class="shimmer-toggle__icon" aria-hidden="true">{paused ? '✧' : '✦'}</span>
  <span class="shimmer-toggle__label">{paused ? 'Motion off' : 'Motion on'}</span>
</button>

<style>
  .shimmer-toggle {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.25rem 0.625rem;
    border-radius: 4px;
    border: 1px solid var(--color-border);
    background: transparent;
    color: var(--color-text-ghost);
    font-family: var(--font-mono);
    font-size: 0.7rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    cursor: pointer;
    transition: color 0.2s ease, border-color 0.2s ease, background 0.2s ease;
    line-height: 1;
  }

  .shimmer-toggle:hover,
  .shimmer-toggle:focus-visible {
    color: var(--color-cyan);
    border-color: var(--color-cyan-dim);
    background: rgba(0, 212, 255, 0.06);
    outline: none;
  }

  .shimmer-toggle:focus-visible {
    outline: 2px solid var(--color-cyan);
    outline-offset: 3px;
  }

  .shimmer-toggle[aria-pressed="true"] {
    color: var(--color-text-ghost);
    border-color: var(--color-border);
  }

  .shimmer-toggle__icon {
    font-size: 0.85rem;
    line-height: 1;
  }

  .shimmer-toggle__label {
    line-height: 1;
  }
</style>
