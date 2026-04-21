<script lang="ts">
  // Hero.svelte — "THIS. IS. JK.com" — full-screen hero with cyberpunk glitch
  // Svelte 5 runes API

  let mounted = $state(false);

  function openCalendlyPopup(e: MouseEvent) {
    e.preventDefault();
    const calendly = (window as Window & {
      Calendly?: { initPopupWidget?: (options: { url: string }) => void };
    }).Calendly;

    if (calendly?.initPopupWidget) {
      calendly.initPopupWidget({ url: 'https://calendly.com/jaysonknight' });
      return;
    }

    window.location.href = 'https://calendly.com/jaysonknight';
  }

  $effect(() => {
    // Small delay so CSS animation reads as intentional
    const t = setTimeout(() => { mounted = true; }, 100);
    return () => clearTimeout(t);
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

    <!-- Tag chip -->
    <div
      class="chip mb-8 mx-auto"
      style="opacity: {mounted ? 1 : 0}; transform: translateY({mounted ? 0 : -12}px); transition: all 0.6s ease 0.1s;"
    >
      <span style="color: var(--color-cyan); margin-right: 0.25rem;">▸</span>
      Charlotte, NC · Available for Consulting
    </div>

    <!-- Main heading — "THIS. IS. JK.com" with glitch treatment -->
    <div class="relative mb-4" aria-label="This is JK.com">
      <!-- Glitch layers (CSS only) -->
      <h1
        class="glitch-text relative text-7xl font-black tracking-tight text-white select-none sm:text-8xl lg:text-9xl"
        data-text="THIS. IS."
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

    <!-- Subtitle -->
    <p
      class="mt-6 text-xl font-light tracking-[0.3em] uppercase"
      style="
        color: var(--color-text-dim);
        opacity: {mounted ? 1 : 0};
        transition: opacity 0.8s ease 0.5s;
        font-family: var(--font-mono);
      "
    >
      Imagination&thinsp;|&thinsp;Unleashed
    </p>

    <!-- Role tags -->
    <div
      class="mt-8 flex flex-wrap justify-center gap-3"
      style="opacity: {mounted ? 1 : 0}; transition: opacity 0.8s ease 0.6s;"
    >
      {#each ['Azure Architect', 'AI Engineer', 'Cloudflare Specialist', 'Rust & WASM', 'Privacy & Security'] as tag}
        <span
          class="chip"
          style="background: rgba(0,212,255,0.08); border-color: rgba(0,212,255,0.3); color: var(--color-cyan);"
        >
          {tag}
        </span>
      {/each}
    </div>

    <!-- CTA buttons -->
    <div
      class="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
      style="opacity: {mounted ? 1 : 0}; transition: opacity 0.8s ease 0.75s;"
    >
      <a
        href="https://calendly.com/jaysonknight"
        onclick={openCalendlyPopup}
        class="btn btn-red"
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
  /* Glitch effect on main heading */
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
    color: var(--color-red);
    animation: glitch-2 8s steps(1) infinite;
    opacity: 0.4;
  }
</style>
