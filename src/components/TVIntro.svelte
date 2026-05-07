<script lang="ts">
  import { introState } from '$lib/intro-store.svelte.ts';

  type Phase = 'off' | 'line' | 'power-on' | 'static' | 'emerge' | 'clear' | 'done';
  // Absolute intro timeline offsets in ms from animation start, not durations.
  const POWER_ON_START_MS   = 50;    // show the crt-power-line phase
  const LINE_HOLD_MS        = 550;   // absolute timestamp when the line phase ends and overlay power-on collapse begins
  const POWER_ON_EXPAND_MS  = 600;   // absolute timestamp when the overlay starts expanding to full screen
  const STATIC_START_MS     = 820;   // absolute timestamp when static noise begins
  const EMERGE_START_MS     = 1100;  // absolute timestamp when "THIS. IS. JK.com" emerges from static
  const CLEAR_START_MS      = 1600;  // absolute timestamp when the overlay clears/fades
  const DONE_START_MS       = 2100;  // absolute timestamp when the intro is complete
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
    document.documentElement.removeAttribute('data-phosphor-intro');
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
      phase = 'line';
    }, POWER_ON_START_MS);

    schedule(() => {
      phase = 'power-on';
      powerOnPlayed = true;
      powerTransitionEnabled = false;
      collapsedToLine = true;
    }, LINE_HOLD_MS);

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
    class:transparent={phase === 'line'}
    style={`transform: scaleY(${collapsedToLine ? '0.004' : '1'});`}
    aria-hidden="true"
  >
    {#if phase === 'static' || phase === 'emerge' || phase === 'clear'}
      <canvas bind:this={canvas} class="noise-canvas"></canvas>
      <div class="scanlines"></div>
      <div class="scanline-flicker"></div>
    {/if}
  </div>

  {#if phase === 'line'}
    <div class="crt-power-line" aria-hidden="true"></div>
  {/if}
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

  .tv-intro-overlay.transparent {
    background: transparent;
  }

  .crt-power-line {
    position: fixed;
    left: 0;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    height: 3px;
    z-index: 10000;
    background: linear-gradient(
      to right,
      transparent 0%,
      rgba(0, 212, 255, 0.3) 10%,
      rgba(255, 255, 255, 0.9) 30%,
      #fff 50%,
      rgba(255, 255, 255, 0.9) 70%,
      rgba(0, 212, 255, 0.3) 90%,
      transparent 100%
    );
    box-shadow:
      0 0 4px #fff,
      0 0 12px rgba(0, 212, 255, 0.8),
      0 0 24px rgba(0, 212, 255, 0.4),
      0 0 48px rgba(0, 212, 255, 0.2);
    animation: crt-line-flicker 80ms steps(1) infinite;
    pointer-events: none;
  }

  @keyframes crt-line-flicker {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.85; }
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

  @keyframes scanline-sweep {
    0% {
      transform: translateY(-100%);
    }
    100% {
      transform: translateY(100%);
    }
  }

</style>
