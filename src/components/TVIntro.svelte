<script lang="ts">
  type IntroPhase = 'hidden' | 'active' | 'fading';

  let phase = $state<IntroPhase>('hidden');

  $effect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    if (sessionStorage.getItem('tv-intro-seen') === 'true') {
      return;
    }

    phase = 'active';

    const fadeTimer = window.setTimeout(() => {
      phase = 'fading';
    }, 450);

    const doneTimer = window.setTimeout(() => {
      phase = 'hidden';
      sessionStorage.setItem('tv-intro-seen', 'true');
    }, 900);

    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(doneTimer);
    };
  });
</script>

{#if phase !== 'hidden'}
  <div class="tv-intro-overlay" class:tv-intro-fade={phase === 'fading'} aria-hidden="true">
    <div class="tv-intro-noise"></div>
  </div>
{/if}

<style>
  .tv-intro-overlay {
    position: fixed;
    inset: 0;
    z-index: 60;
    pointer-events: none;
    background: #000;
    opacity: 1;
    transition: opacity 0.35s ease;
  }

  .tv-intro-fade {
    opacity: 0;
  }

  .tv-intro-noise {
    position: absolute;
    inset: 0;
    opacity: 0.4;
    background:
      repeating-linear-gradient(
        0deg,
        rgba(0, 212, 255, 0.09) 0px,
        rgba(0, 212, 255, 0.09) 1px,
        transparent 1px,
        transparent 3px
      ),
      url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='80' viewBox='0 0 120 80'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.25' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='120' height='80' filter='url(%23n)' opacity='0.7'/%3E%3C/svg%3E");
    background-size: auto, 120px 80px;
    animation: tv-noise 0.12s steps(2) infinite;
  }

  @keyframes tv-noise {
    0% {
      background-position: 0 0, 0 0;
    }
    50% {
      background-position: 0 0, -10px 6px;
    }
    100% {
      background-position: 0 0, 8px -4px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .tv-intro-noise {
      animation: none;
    }
  }
</style>
