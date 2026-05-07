<script lang="ts">
  // Hero.svelte — "THIS. IS. JK.com" — full-screen hero
  // Phosphor: glitch text, TV-intro handoff, CRT typewriter subtitle
  // Svelte 5 runes API
  import { untrack } from 'svelte';
  import { openCalendlyPopup } from '$lib/calendly.ts';
  import { introState } from '$lib/intro-store.svelte.ts';

  let mounted = $state(false);
  const FULL_TEXT = 'Imagination | Unleashed';
  const TYPEWRITER_PRE_DELAY_MS = 400;
  const TYPEWRITER_BASE_DELAY_MS = 110;
  const TYPEWRITER_JITTER_MS = 40;
  const TYPEWRITER_MIN_DELAY_MS = 60;
  let displayedText = $state('');
  let cursorVisible = $state(false);
  let cursorBlinking = $state(false);
  let typingDone = false; // plain non-reactive internal flag — do not make the typewriter $effect depend on completion
  let typewriterStarted = false; // plain non-reactive guard — must NOT be $state
  let prefersReducedMotion = $state(false);

  $effect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const syncPreference = () => {
      prefersReducedMotion = mediaQuery.matches;
    };

    syncPreference();
    mediaQuery.addEventListener('change', syncPreference);
    return () => mediaQuery.removeEventListener('change', syncPreference);
  });

  // Hero mounts its content after TV intro completes (or immediately if skipped)
  $effect(() => {
    let mountDelay: ReturnType<typeof setTimeout> | undefined;

    function activate() {
      if (mounted) return;
      if (mountDelay !== undefined) clearTimeout(mountDelay);
      mountDelay = setTimeout(() => { mounted = true; }, 100);
    }

    if (introState.done) {
      activate();
    } else {
      document.addEventListener('tv-intro-done', activate, { once: true });
    }

    return () => {
      document.removeEventListener('tv-intro-done', activate);
      if (mountDelay !== undefined) clearTimeout(mountDelay);
    };
  });

  // Listen for the TV intro completion event, then start typewriter
  $effect(() => {
    let preDelay: ReturnType<typeof setTimeout> | undefined;
    let typingTick: ReturnType<typeof setTimeout> | undefined;

    function renderStaticLine() {
      displayedText = FULL_TEXT;
      cursorVisible = true;
      cursorBlinking = true;
      typingDone = true;
    }

    function typeNext(index: number) {
      const nextIndex = index + 1;
      displayedText = FULL_TEXT.slice(0, nextIndex);

      if (nextIndex >= FULL_TEXT.length) {
        typingDone = true;
        // Keep the cursor visible and blinking indefinitely after typing completes
        cursorVisible = true;
        cursorBlinking = true;
        return;
      }

      // Center a random delay adjustment in the [-TYPEWRITER_JITTER_MS, +TYPEWRITER_JITTER_MS] range.
      const jitter = (Math.random() * 2 - 1) * TYPEWRITER_JITTER_MS;
      typingTick = setTimeout(
        () => typeNext(nextIndex),
        Math.max(TYPEWRITER_MIN_DELAY_MS, TYPEWRITER_BASE_DELAY_MS + jitter)
      );
    }

    function startTypewriter() {
      if (typewriterStarted || typingDone) return;
      typewriterStarted = true;

      if (prefersReducedMotion) {
        renderStaticLine();
        return;
      }

      cursorVisible = true;
      cursorBlinking = true;

      preDelay = setTimeout(() => {
        cursorBlinking = false;
        typeNext(0);
      }, TYPEWRITER_PRE_DELAY_MS);
    }

    // Use untrack so reading introState.done does not subscribe this effect to it.
    // If introState is already done at mount, start immediately; otherwise the
    // tv-intro-done event listener handles the async case. Without untrack, when
    // introState.done flips to true the effect re-runs, its cleanup cancels the
    // in-progress typing timeouts, and typewriterStarted prevents a restart.
    if (untrack(() => introState.done)) {
      startTypewriter();
      return () => {
        if (preDelay !== undefined) clearTimeout(preDelay);
        if (typingTick !== undefined) clearTimeout(typingTick);
      };
    }

    const handler = () => startTypewriter();
    document.addEventListener('tv-intro-done', handler, { once: true });

    return () => {
      document.removeEventListener('tv-intro-done', handler);
      if (preDelay !== undefined) clearTimeout(preDelay);
      if (typingTick !== undefined) clearTimeout(typingTick);
    };
  });


</script>

<section
  id="home"
  class="relative flex min-h-screen flex-col items-center justify-center overflow-hidden"
  aria-label="Introduction"
>
  <!-- Background: deep gradient from near-black to dark blue -->
  <div
    class="absolute inset-0"
    style="background: radial-gradient(ellipse 80% 80% at 50% 0%, rgba(0,120,212,0.12) 0%, rgba(5,5,10,0) 70%), radial-gradient(ellipse 60% 40% at 80% 100%, rgba(0,212,255,0.06) 0%, transparent 60%);"
    aria-hidden="true"
  ></div>

  <!-- Horizontal scan accent lines -->
  <div class="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
    <div
      class="absolute left-0 right-0 h-px opacity-30"
      style="top: 30%; background: linear-gradient(to right, transparent, var(--color-cyan-dim), transparent);"
    ></div>
    <div
      class="absolute left-0 right-0 h-px opacity-15"
      style="top: 70%; background: linear-gradient(to right, transparent, var(--color-primary), transparent);"
    ></div>
  </div>

  <!-- Corner bracket decorations -->
  <div class="absolute inset-8 pointer-events-none" aria-hidden="true">
    <!-- TL -->
    <svg class="absolute top-0 left-0 w-12 h-12 opacity-30" viewBox="0 0 48 48" fill="none">
      <path d="M 0 24 L 0 0 L 24 0" stroke="var(--color-cyan)" stroke-width="1.5"/>
    </svg>
    <!-- TR -->
    <svg class="absolute top-0 right-0 w-12 h-12 opacity-30" viewBox="0 0 48 48" fill="none">
      <path d="M 24 0 L 48 0 L 48 24" stroke="var(--color-cyan)" stroke-width="1.5"/>
    </svg>
    <!-- BL -->
    <svg class="absolute bottom-0 left-0 w-12 h-12 opacity-30" viewBox="0 0 48 48" fill="none">
      <path d="M 0 24 L 0 48 L 24 48" stroke="var(--color-cyan)" stroke-width="1.5"/>
    </svg>
    <!-- BR -->
    <svg class="absolute bottom-0 right-0 w-12 h-12 opacity-30" viewBox="0 0 48 48" fill="none">
      <path d="M 24 48 L 48 48 L 48 24" stroke="var(--color-cyan)" stroke-width="1.5"/>
    </svg>
  </div>

  <!-- Content -->
  <div class="section-container relative z-10 text-center">

    <!-- Phosphor — terminal status readout -->
    <div
      class="status-readout mb-8 mx-auto"
      style="opacity: {mounted ? 1 : 0}; transform: translateY({mounted ? 0 : -12}px); transition: all 0.6s ease 0.1s;"
      aria-label="Online. Location: Charlotte, NC. Available for consulting."
    >
      <span class="status-dot" aria-hidden="true"></span>
      <span class="status-text status-online">ONLINE</span>
      <span class="status-sep" aria-hidden="true">//</span>
      <span class="status-text">LOCATION: CHARLOTTE, NC</span>
      <span class="status-sep" aria-hidden="true">//</span>
      <span class="status-text">STATUS: AVAILABLE</span>
    </div>

    <!-- Main heading — "THIS. IS. JK.com" with glitch treatment -->
    <div class="relative mb-4">
      <!-- Glitch layers (CSS only) -->
      <h1
        class="glitch-text relative text-7xl font-black tracking-tight text-white select-none sm:text-8xl lg:text-9xl"
        data-text="THIS. IS."
        aria-label="This. Is. JK.com"
        style="
          font-family: var(--font-heading);
          opacity: {mounted ? 1 : 0};
          transform: translateY({mounted ? 0 : 20}px);
          transition: all 0.7s ease 0.2s;
        "
      >
        THIS. IS.
      </h1>

      <div
        class="gradient-text text-glow text-7xl font-black tracking-tight sm:text-8xl lg:text-9xl"
        style="
          font-family: var(--font-heading);
          opacity: {mounted ? 1 : 0};
          transform: translateY({mounted ? 0 : 20}px);
          transition: all 0.7s ease 0.35s;
        "
        aria-hidden="true"
      >
        JK.com
      </div>
    </div>

    <!-- Phosphor — CRT typewriter subtitle -->
    <div class="mt-6 crt-subtitle-wrap">
      <span class="sr-only">Imagination | Unleashed</span>
      <p class="crt-line text-xl tracking-[0.3em] uppercase" class:done={typingDone} aria-hidden="true">
        {displayedText}<span
          class="crt-cursor"
          class:blink={cursorBlinking}
          class:hidden={!cursorVisible}
          aria-hidden="true"
        >█</span>
      </p>
    </div>

    <!-- Role tags -->
    <ul
      class="mt-8 flex flex-wrap justify-center gap-3"
      role="list"
      aria-label="Specializations"
      style="opacity: {mounted ? 1 : 0}; transition: opacity 0.8s ease 0.6s;"
    >
      {#each ['Azure Architect', 'AI Engineer', 'Cloudflare Specialist', 'Rust & WASM', 'Privacy & Security'] as tag}
        <li class="bracket-tag iridescent">
          <span class="bracket-open" aria-hidden="true">[</span>
          {tag}
          <span class="bracket-close" aria-hidden="true">]</span>
        </li>
      {/each}
    </ul>

    <!-- CTA buttons -->
    <div
      class="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
      style="opacity: {mounted ? 1 : 0}; transition: opacity 0.8s ease 0.75s;"
    >
      <a
        href="https://calendly.com/jaysonknight"
        onclick={openCalendlyPopup}
        class="btn btn-red iridescent"
        aria-label="Book a meeting via Calendly"
      >
        <span>📅</span>
        Book Me
      </a>
      <a href="#services" class="btn btn-outline">
        View Services
        <span aria-hidden="true">→</span>
      </a>
    </div>

    <!-- Scroll indicator -->
    <div
      class="absolute bottom-8 left-1/2 -translate-x-1/2"
      style="opacity: {mounted ? 0.5 : 0}; transition: opacity 1s ease 1.2s;"
      aria-hidden="true"
    >
      <div
        class="flex flex-col items-center gap-2"
        style="color: var(--color-text-ghost); font-family: var(--font-mono); font-size: 0.65rem; letter-spacing: 0.15em;"
      >
        <span>SCROLL</span>
        <div class="w-px h-8 animate-bounce" style="background: linear-gradient(to bottom, var(--color-cyan-dim), transparent);"></div>
      </div>
    </div>
  </div>
</section>

<style>
  /* Phosphor — glitch layers for main heading */
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

  /* CRT subtitle line */
  .crt-subtitle-wrap {
    min-height: 2em;
  }

  .crt-line {
    font-family: var(--font-mono);
    color: var(--color-cyan);
    text-shadow:
      0 0 4px #fff,
      0 0 8px var(--color-cyan),
      0 0 16px var(--color-cyan),
      0 0 32px rgba(0, 212, 255, 0.4);
    background: repeating-linear-gradient(
      0deg,
      transparent,
      transparent 2px,
      rgba(0, 0, 0, 0.06) 2px,
      rgba(0, 0, 0, 0.06) 4px
    );
    display: inline-block;
    padding: 0 0.125em;
    /* Compensate for letter-spacing trailing gap so centering is correct throughout typing */
    margin-right: -0.3em;
  }

  .crt-cursor {
    display: inline-block;
    opacity: 1;
    color: var(--color-cyan);
    text-shadow: 0 0 8px var(--color-cyan);
    transition: opacity 0.05s;
    margin-left: 1px;
  }

  .crt-cursor.blink {
    animation: cursor-blink 1.1s step-end infinite;
  }

  .crt-cursor.hidden {
    opacity: 0;
  }

  @keyframes cursor-blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
  }

  .crt-line.done {
    animation: phosphor-decay 2s ease forwards;
  }

  @keyframes phosphor-decay {
    0% { text-shadow: 0 0 4px #fff, 0 0 12px var(--color-cyan), 0 0 32px rgba(0,212,255,0.6), 0 0 60px rgba(0,212,255,0.3); }
    100% { text-shadow: 0 0 4px #fff, 0 0 8px var(--color-cyan), 0 0 16px rgba(0,212,255,0.4); }
  }

  /* Phosphor — terminal status readout chip */
  .status-readout {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    font-family: var(--font-mono);
    font-size: 0.7rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--color-text-ghost);
    padding: 0.35rem 0.85rem;
    border: 1px solid rgba(0, 212, 255, 0.15);
    border-radius: 3px;
    background: rgba(0, 212, 255, 0.03);
  }

  .status-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--color-cyan);
    box-shadow: 0 0 6px var(--color-cyan), 0 0 12px rgba(0, 212, 255, 0.4);
    flex-shrink: 0;
    animation: status-pulse 2s ease-in-out infinite;
  }

  .status-sep {
    opacity: 0.3;
    font-size: 0.6rem;
  }

  .status-text {
    color: var(--color-text-dim);  /* #94a3b8 — readable but not loud */
  }

  .status-online {
    color: var(--color-cyan);
    font-weight: 600;
  }

  @keyframes status-pulse {
    0%, 100% { opacity: 1; box-shadow: 0 0 6px var(--color-cyan), 0 0 12px rgba(0, 212, 255, 0.4); }
    50%       { opacity: 0.5; box-shadow: 0 0 3px var(--color-cyan); }
  }

  @media (prefers-reduced-motion: reduce) {
    .status-dot { animation: none; }
  }

  /* Phosphor — bracketed iridescent role tags */
  .bracket-tag {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    padding: 0.3rem 0.7rem;
    border-radius: 3px;
    border: 1px solid rgba(0, 212, 255, 0.2);
    background: rgba(0, 212, 255, 0.04);
    color: var(--color-cyan-dim);
    font-family: var(--font-mono);
    font-size: 0.72rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    transition: border-color 0.25s ease, color 0.25s ease, box-shadow 0.25s ease;
    cursor: default;
    position: relative;
    overflow: hidden;
  }

  .bracket-tag:hover {
    border-color: rgba(0, 212, 255, 0.5);
    color: var(--color-cyan);
    box-shadow: 0 0 10px rgba(0, 212, 255, 0.15);
  }

  .bracket-open,
  .bracket-close {
    color: var(--color-cyan);
    opacity: 0.5;
    font-weight: 300;
    font-size: 0.85em;
    transition: opacity 0.25s ease;
  }

  .bracket-tag:hover .bracket-open,
  .bracket-tag:hover .bracket-close {
    opacity: 1;
  }
</style>
