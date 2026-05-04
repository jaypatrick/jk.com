<script lang="ts">
  // ShimmerToggle.svelte — user-controlled toggle for the iridescent shimmer animation
  // Svelte 5 runes: $state + onMount for one-time initialization
  import { onMount } from 'svelte';

  let paused = $state(false);

  onMount(() => {
    try {
      const stored = localStorage.getItem('shimmer-paused');
      paused = stored === 'true';
    } catch (_) {}
    document.documentElement.dataset.shimmerPaused = String(paused);
  });

  function toggle() {
    paused = !paused;
    document.documentElement.dataset.shimmerPaused = String(paused);
    try {
      localStorage.setItem('shimmer-paused', String(paused));
    } catch (_) {}
  }
</script>

<button
  class="shimmer-toggle chip"
  aria-pressed={paused}
  aria-label={paused ? 'Enable shimmer animation' : 'Pause shimmer animation'}
  onclick={toggle}
  title="Toggle shimmer effect"
>
  <span aria-hidden="true">{paused ? '✦' : '✧'}</span>
  {paused ? 'Shimmer off' : 'Shimmer on'}
</button>

<style>
  .shimmer-toggle {
    cursor: pointer;
    border: none;
    background: rgba(0, 212, 255, 0.05);
    transition: background var(--duration-normal) ease, color var(--duration-normal) ease;
  }

  .shimmer-toggle:hover {
    background: rgba(0, 212, 255, 0.12);
  }

  .shimmer-toggle[aria-pressed="true"] {
    color: var(--color-text-ghost);
    border: 1px solid var(--color-border);
    background: transparent;
  }
</style>
