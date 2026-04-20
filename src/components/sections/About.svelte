<script lang="ts">
  // About.svelte — "WHO I AM" section
  // Svelte 5, TailwindCSS v4

  const expertise = [
    { label: 'Azure Solutions Architecture', detail: 'Landing zones, AKS, App Services, Azure Networking & VWAN' },
    { label: '.NET Development', detail: '.NET 9/10, C#, ASP.NET Core, Blazor, Minimal APIs, Orleans' },
    { label: 'Cloudflare Platform', detail: 'Workers, D1, R2, KV, Zero Trust / SASE, Tunnels, Pages' },
    { label: 'Enterprise Networking', detail: 'SD-WAN, BGP, UniFi, Zero Trust network architecture' },
    { label: 'Privacy & Security', detail: 'DNS encryption, ad-block compiler, zero-trust architectures, SASE' },
    { label: 'Compiler Theory', detail: 'LLVM, filter list DSLs, custom parsers & IR pipelines — it\'s a passion' },
  ];

  const philosophy = [
    'Technology should drive innovation',
    'Embracing technology should be painless',
    'Great teams build great products',
    'Software should anticipate your needs',
    'Infrastructure should anticipate needs',
  ];
</script>

<section id="about" class="section-pad" style="background: var(--color-surface);">
  <div class="section-container">

    <!-- Section label -->
    <div class="section-label animate-on-scroll">WHO I AM</div>

    <!-- Two-column layout -->
    <div class="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:gap-24 items-start">

      <!-- Left: What I Do -->
      <div class="animate-on-scroll">
        <h2 class="text-4xl font-bold mb-6 lg:text-5xl" style="font-family: var(--font-heading);">
          Enterprise-grade solutions.<br/>
          <span class="gradient-text">Human-scale delivery.</span>
        </h2>

        <p class="text-lg mb-8" style="color: var(--color-text-dim); line-height: 1.8;">
          Twenty-plus years of building software across enterprise stacks — from
          legacy monoliths to bleeding-edge Cloudflare Workers. I specialize in
          translating complex business requirements into elegant, scalable architectures
          on Microsoft Azure and the Cloudflare platform.
        </p>

        <!-- What I Do list -->
        <div class="space-y-3 mb-10">
          {#each [
            'Enterprise Solutions Architecture & Implementation',
            'Software Design, Development & Deployment',
            'Technology & Cloud Consulting',
            'Enterprise Network Architecture',
            'Digital Media & Web Design',
          ] as item}
            <div class="flex items-start gap-3">
              <span
                class="mt-1 flex-shrink-0 w-5 h-5 rounded-sm flex items-center justify-center text-xs"
                style="background: rgba(0,212,255,0.1); color: var(--color-cyan); border: 1px solid rgba(0,212,255,0.2);"
              >▸</span>
              <span style="color: var(--color-text-dim);">{item}</span>
            </div>
          {/each}
        </div>

        <!-- CTA -->
        <a href="#contact" class="btn btn-outline">
          Talk To Me
          <span aria-hidden="true">→</span>
        </a>
      </div>

      <!-- Right: Expertise grid + philosophy -->
      <div class="animate-on-scroll" style="transition-delay: 0.15s;">

        <!-- Expertise cards -->
        <div class="grid grid-cols-1 gap-3 mb-12 sm:grid-cols-2">
          {#each expertise as { label, detail }}
            <div
              class="glow-border rounded-lg p-4"
              style="background: var(--color-card);"
            >
              <h3
                class="text-sm font-semibold mb-1"
                style="color: var(--color-cyan); font-family: var(--font-mono);"
              >{label}</h3>
              <p class="text-xs leading-relaxed" style="color: var(--color-text-ghost);">{detail}</p>
            </div>
          {/each}
        </div>

        <!-- Philosophy -->
        <div
          class="rounded-xl p-6"
          style="background: rgba(0,120,212,0.05); border: 1px solid rgba(0,120,212,0.2);"
        >
          <h3
            class="text-xs font-semibold mb-4 tracking-widest uppercase"
            style="color: var(--color-primary); font-family: var(--font-mono);"
          >
            Why I Do It
          </h3>
          <ul class="space-y-2">
            {#each philosophy as item}
              <li class="flex items-center gap-3 text-sm" style="color: var(--color-text-dim);">
                <span class="w-1.5 h-1.5 rounded-full flex-shrink-0" style="background: var(--color-cyan);"></span>
                {item}
              </li>
            {/each}
          </ul>
        </div>
      </div>
    </div>
  </div>
</section>
