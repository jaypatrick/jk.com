<script lang="ts">
  import { introState } from '$lib/intro-store.svelte.ts';

  type Phase = 'off' | 'power-on' | 'static' | 'emerge' | 'clear' | 'done';
  const POWER_ON_START_MS = 50;       // collapse to line immediately
  const POWER_ON_EXPAND_MS = 300;     // hold line for 250ms, then expand
  const STATIC_START_MS = 520;        // expand is 160ms CSS transition → static starts after expand completes
  const EMERGE_START_MS = 800;        // "THIS. IS. JK.com" emerges from static
  const CLEAR_START_MS = 1300;        // static fades out
  const DONE_START_MS = 1800;         // overlay removed, tv-intro-done fired
  const SWEEP_BAR_SPEED = 4;
  const SWEEP_BAR_HEIGHT = 40;
  const STATIC_RESOLUTION_SCALE = 2;

  let phase = $state<Phase>('off');
  let canvas = $state<HTMLCanvasElement | undefined>(undefined);
  let collapsedToLine = $state(false);
  let powerTransitionEnabled = $state(false);
  let powerOnPlayed = $state(false);

  function notifyDone() {
    if (introState.done) return;
    introState.done = true;
    document.dispatchEvent(new CustomEvent('tv-intro-done'));
  }

  function drawNoise(ctx: CanvasRenderingContext2D, imageData: ImageData, w: number, h: number, frame: number) {
    const data = imageData.data;
    const blockSize = 3;

    const barY = (frame * SWEEP_BAR_SPEED) % h;
    const barHeight = SWEEP_BAR_HEIGHT;

    for (let y = 0; y < h; y += blockSize) {
      for (let x = 0; x < w; x += blockSize) {
        const inBar = y >= barY && y < barY + barHeight;
        const brightness = Math.random() * 255;
        const alpha = inBar ? Math.random() * 60 + 180 : Math.random() * 120 + 80;
        const value = Math.min(255, inBar ? brightness * 1.3 : brightness);

        for (let dy = 0; dy < blockSize && y + dy < h; dy++) {
          for (let dx = 0; dx < blockSize && x + dx < w; dx++) {
            const idx = ((y + dy) * w + (x + dx)) * 4;
            data[idx] = value;
            data[idx + 1] = value;
            data[idx + 2] = value;
            data[idx + 3] = alpha;
          }
        }
      }
    }

    ctx.putImageData(imageData, 0, 0);
  }

  $effect(() => {
    if (typeof window === 'undefined') return;

    const cleanups: Array<() => void> = [];
    const timeouts: ReturnType<typeof setTimeout>[] = [];
    const originalOverflow = document.body.style.overflow;

    const schedule = (fn: () => void, delay: number) => {
      const id = setTimeout(fn, delay);
      timeouts.push(id);
      return id;
    };

    const finalizeImmediately = () => {
      phase = 'done';
      document.body.style.overflow = originalOverflow;
      notifyDone();
    };

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const seen = sessionStorage.getItem('tv-intro-seen');

    if (seen || reduceMotion) {
      finalizeImmediately();
      return;
    }

    document.body.style.overflow = 'hidden';

    schedule(() => {
      phase = 'power-on';
      powerOnPlayed = true;
      powerTransitionEnabled = false;
      collapsedToLine = true;
    }, POWER_ON_START_MS);

    schedule(() => {
      powerTransitionEnabled = true;
      collapsedToLine = false;
    }, POWER_ON_EXPAND_MS);

    schedule(() => {
      phase = 'static';
    }, STATIC_START_MS);

    schedule(() => {
      phase = 'emerge';
    }, EMERGE_START_MS);

    schedule(() => {
      phase = 'clear';
      document.body.style.overflow = originalOverflow;
    }, CLEAR_START_MS);

    schedule(() => {
      phase = 'done';
      sessionStorage.setItem('tv-intro-seen', '1');
      notifyDone();
    }, DONE_START_MS);

    cleanups.push(() => {
      timeouts.forEach((id) => clearTimeout(id));
      document.body.style.overflow = originalOverflow;
    });

    return () => {
      cleanups.forEach((run) => run());
    };
  });

  $effect(() => {
    if (typeof window === 'undefined') return;
    if (phase !== 'static' && phase !== 'emerge') return;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let rafId: number | undefined;
    let frame = 0;
    let noiseBuffer: ImageData | undefined;
    let resizeRafId: number | undefined;

    const resize = () => {
      const width = Math.max(1, Math.floor(window.innerWidth / STATIC_RESOLUTION_SCALE));
      const height = Math.max(1, Math.floor(window.innerHeight / STATIC_RESOLUTION_SCALE));

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        noiseBuffer = ctx.createImageData(width, height);
      }
    };

    const handleResize = () => {
      if (resizeRafId !== undefined) return;
      resizeRafId = requestAnimationFrame(() => {
        resizeRafId = undefined;
        resize();
      });
    };

    resize();

    const tick = () => {
      if (!noiseBuffer || noiseBuffer.width !== canvas.width || noiseBuffer.height !== canvas.height) {
        noiseBuffer = ctx.createImageData(canvas.width, canvas.height);
      }
      drawNoise(ctx, noiseBuffer, canvas.width, canvas.height, frame);
      frame += 1;
      rafId = requestAnimationFrame(tick);
    };

    tick();
    window.addEventListener('resize', handleResize);

    return () => {
      if (rafId !== undefined) {
        cancelAnimationFrame(rafId);
      }
      if (resizeRafId !== undefined) {
        cancelAnimationFrame(resizeRafId);
      }
      window.removeEventListener('resize', handleResize);
    };
  });
</script>

{#if phase !== 'done'}
  <div
    class="tv-intro-overlay"
    class:power-on-played={powerOnPlayed}
    class:power-transition={powerTransitionEnabled}
    class:clear={phase === 'clear'}
    style={`transform: scaleY(${collapsedToLine ? '0.004' : '1'});`}
    aria-hidden="true"
  >
    {#if phase === 'static' || phase === 'emerge' || phase === 'clear'}
      <canvas bind:this={canvas} class="noise-canvas"></canvas>
      <div class="scanlines"></div>
      <div class="scanline-flicker"></div>
    {/if}

    {#if phase === 'emerge' || phase === 'clear'}
      <div class="intro-text" class:revealed={phase === 'emerge' || phase === 'clear'}>
        <h1
          class="glitch-text relative text-7xl font-black tracking-tight text-white select-none sm:text-8xl lg:text-9xl"
          data-text="THIS. IS."
        >
          THIS. IS.
        </h1>
        <div
          class="gradient-text text-glow text-7xl font-black tracking-tight sm:text-8xl lg:text-9xl"
          style="font-family: var(--font-heading);"
        >
          JK.com
        </div>
      </div>
    {/if}
  </div>
{/if}

<style>
  .tv-intro-overlay {
    position: fixed;
    inset: 0;
    z-index: 9999;
    background: #000;
    transform-origin: center center;
    opacity: 1;
    transition: none;
  }

  .tv-intro-overlay.power-transition {
    transition: transform 160ms cubic-bezier(0.23, 1, 0.32, 1);
  }

  .tv-intro-overlay.clear {
    opacity: 0;
    transition: opacity 450ms ease, transform 160ms cubic-bezier(0.23, 1, 0.32, 1);
  }

  .tv-intro-overlay.power-on-played {
    background: #060606;
  }

  .noise-canvas,
  .scanlines,
  .scanline-flicker {
    position: absolute;
    inset: 0;
  }

  .noise-canvas {
    width: 100%;
    height: 100%;
    opacity: 1;
    image-rendering: pixelated;
  }

  .scanlines {
    background: repeating-linear-gradient(
      0deg,
      rgba(0, 0, 0, 0.5) 0,
      rgba(0, 0, 0, 0.5) 1px,
      transparent 1px,
      transparent 4px
    );
    opacity: 0.3;
    mix-blend-mode: screen;
  }

  .scanline-flicker {
    background: linear-gradient(
      to bottom,
      rgba(255, 255, 255, 0) 0%,
      rgba(255, 255, 255, 0.2) 35%,
      rgba(255, 255, 255, 0) 100%
    );
    opacity: 0.2;
    animation: scanline-sweep 240ms linear infinite;
    mix-blend-mode: screen;
  }

  .intro-text {
    position: absolute;
    inset: 0;
    display: grid;
    place-content: center;
    text-align: center;
    clip-path: inset(0 0 100% 0);
    opacity: 0;
    transition: clip-path 300ms ease, opacity 300ms ease;
  }

  .intro-text.revealed {
    clip-path: inset(0 0 0% 0);
    opacity: 1;
  }

  .glitch-text::before,
  .glitch-text::after {
    content: attr(data-text);
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    color: white;
    font-family: var(--font-heading);
    font-weight: 900;
  }

  .glitch-text::before {
    color: var(--color-cyan);
    animation: glitch-1 8s steps(1) infinite;
    opacity: 0.6;
  }

  .glitch-text::after {
    color: var(--color-pink);
    animation: glitch-2 8s steps(1) infinite;
    opacity: 0.4;
  }

  @keyframes scanline-sweep {
    0% {
      transform: translateY(-100%);
    }
    100% {
      transform: translateY(100%);
    }
  }

  @keyframes glitch-1 {
    0%,
    97%,
    100% {
      transform: translate(0);
      clip-path: inset(0 0 0 0);
    }
    98% {
      transform: translate(-2px, 1px);
      clip-path: inset(10% 0 65% 0);
    }
    99% {
      transform: translate(2px, -1px);
      clip-path: inset(60% 0 5% 0);
    }
  }

  @keyframes glitch-2 {
    0%,
    97%,
    100% {
      transform: translate(0);
      clip-path: inset(0 0 0 0);
    }
    98% {
      transform: translate(2px, -1px);
      clip-path: inset(20% 0 55% 0);
    }
    99% {
      transform: translate(-2px, 1px);
      clip-path: inset(50% 0 15% 0);
    }
  }
</style>
