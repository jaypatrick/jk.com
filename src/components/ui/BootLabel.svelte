<script lang="ts">
  let { label, class: className = '' }: { label: string; class?: string } = $props();

  let rootEl = $state<HTMLDivElement | null>(null);
  let showInitializing = $state(false);
  let hasBooted = $state(false);

  $effect(() => {
    if (!rootEl) {
      return;
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      showInitializing = false;
      hasBooted = true;
      return;
    }

    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (!entry?.isIntersecting || hasBooted) {
          return;
        }

        hasBooted = true;
        showInitializing = true;

        timeoutId = window.setTimeout(() => {
          showInitializing = false;
        }, 600);
      },
      { threshold: 0.1 }
    );

    observer.observe(rootEl);

    return () => {
      observer.disconnect();
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  });
</script>

<div bind:this={rootEl} class={`section-label boot-label ${className}`.trim()}>
  <span class="boot-label-shell">
    <span class="boot-label-layer" class:is-active={showInitializing}>
      // INITIALIZING...
    </span>
    <span class="boot-label-layer" class:is-active={!showInitializing}>
      {label}
    </span>
  </span>
</div>

<style>
  .boot-label-shell {
    display: grid;
    min-height: 1em;
  }

  .boot-label-layer {
    grid-area: 1 / 1;
    opacity: 0;
    transition: opacity 0.2s ease;
  }

  .boot-label-layer.is-active {
    opacity: 1;
  }

  @media (prefers-reduced-motion: reduce) {
    .boot-label-layer {
      transition: none;
    }
  }
</style>
