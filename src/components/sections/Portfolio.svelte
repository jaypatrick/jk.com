<script lang="ts">
  // Portfolio.svelte — "CLIENTS I ADORE" + featured work
  // Svelte 5 + TailwindCSS v4

  // These are placeholder case studies — swap with actual client work
  const caseStudies = [
    {
      label: 'Azure Migration',
      title: 'Fortune 500 On-Prem → Azure',
      description:
        'Led architecture and phased migration of a 200-node on-premises data center to Azure Landing Zones. Achieved 40% cost reduction and 99.99% SLA on critical workloads.',
      tags: ['Azure', 'Landing Zones', 'AKS', 'Bicep', 'Cost Optimization'],
      stat: '40%',
      statLabel: 'Cost reduction',
    },
    {
      label: 'Zero Trust',
      title: 'Cloudflare ZeroTrust SASE Rollout',
      description:
        'Designed and deployed Cloudflare One (ZTNA/SASE) for a 1,200-seat professional services firm. Replaced legacy VPN, improved security posture, and cut remote access complexity.',
      tags: ['Cloudflare', 'Zero Trust', 'ZTNA', 'SASE', 'Access'],
      stat: '1,200',
      statLabel: 'Users secured',
    },
    {
      label: '.NET Modernization',
      title: '.NET Framework 4.x → .NET 9',
      description:
        'Modernized a 14-year-old enterprise LOB application — ported from .NET Framework 4.8 + WCF to .NET 9 minimal APIs, updated CI/CD pipeline to GitHub Actions + Azure DevOps.',
      tags: ['.NET 9', 'C#', 'Azure DevOps', 'Minimal APIs'],
      stat: '14yr',
      statLabel: 'Legacy app modernized',
    },
    {
      label: 'Privacy Engineering',
      title: 'Adblock Compiler (OSS)',
      description:
        'Built a compiler-as-a-service that processes ad-filter list DSLs (Adblock Plus, uBlock syntax) through a custom IR pipeline. Compiles to optimized DNS blocklists at edge speed.',
      tags: ['Rust', 'Compiler Theory', 'DNS', 'Cloudflare Workers', 'OSS'],
      stat: '∞',
      statLabel: 'Filter rules compiled',
      link: 'https://github.com/jaypatrick',
    },
  ];

  const clients = [
    'Paycom',
    'Microsoft',
    'Paylocity',
    'AvidXchange',
    'Care Innovations',
    'Sogeti',
    'Deloitte Consulting',
  ];
</script>

<section id="portfolio" class="section-pad" style="background: var(--color-surface);">
  <div class="section-container">

    <!-- Section label -->
    <div class="section-label animate-on-scroll">PORTFOLIO</div>

    <!-- Section heading -->
    <div class="mb-12 animate-on-scroll">
      <h2 class="text-4xl font-bold mb-4 lg:text-5xl" style="font-family: var(--font-heading);">
        Work That <span class="gradient-text">Ships</span>
      </h2>
      <p class="text-lg max-w-2xl" style="color: var(--color-text-dim);">
        A selection of projects — enterprise migrations, security deployments, and open-source
        work that reflects what I care about most.
      </p>
    </div>

    <!-- Case study cards -->
    <div class="grid grid-cols-1 gap-6 lg:grid-cols-2 mb-20">
      {#each caseStudies as study, i}
        <div
          class="glow-border rounded-xl p-7 flex flex-col gap-4 animate-on-scroll"
          style="background: var(--color-card); transition-delay: {i * 0.1}s;"
        >
          <!-- Label / stat row -->
          <div class="flex items-start justify-between">
            <span class="chip" style="color: var(--color-primary); border-color: rgba(0,120,212,0.3);">
              {study.label}
            </span>
            <div class="text-right">
              <div class="text-2xl font-bold gradient-text" style="font-family: var(--font-heading);">
                {study.stat}
              </div>
              <div class="text-xs" style="color: var(--color-text-ghost); font-family: var(--font-mono);">
                {study.statLabel}
              </div>
            </div>
          </div>

          <!-- Title -->
          <h3 class="text-xl font-bold" style="font-family: var(--font-heading);">
            {study.title}
          </h3>

          <!-- Description -->
          <p class="text-sm leading-relaxed flex-1" style="color: var(--color-text-dim);">
            {study.description}
          </p>

          <!-- Tags + link -->
          <div class="flex flex-wrap items-center gap-2 mt-auto">
            {#each study.tags as tag}
              <span
                class="text-xs px-2 py-0.5 rounded"
                style="background: rgba(0,212,255,0.07); color: var(--color-cyan-dim); border: 1px solid rgba(0,212,255,0.12); font-family: var(--font-mono);"
              >{tag}</span>
            {/each}
            {#if study.link}
              <a
                href={study.link}
                target="_blank"
                rel="noopener noreferrer"
                class="ml-auto text-xs"
                style="color: var(--color-cyan);"
              >
                View on GitHub →
              </a>
            {/if}
          </div>
        </div>
      {/each}
    </div>

    <!-- Clients I Adore -->
    <div class="animate-on-scroll">
      <div class="section-label mb-8" style="color: var(--color-cyan);">CLIENTS I ADORE</div>
      <div class="clients-marquee">
        <div class="clients-track">
          {#each [...clients, ...clients] as client}
            <div
              class="client-tile rounded-lg px-5 py-2.5 text-sm"
              style="background: var(--color-card); border: 1px solid var(--color-border); color: var(--color-cyan);"
            >
              {client}
            </div>
          {/each}
        </div>
      </div>
    </div>
  </div>
</section>

<style>
  .clients-marquee {
    overflow: hidden;
    border-radius: 0.85rem;
    padding: 1rem;
    background:
      radial-gradient(circle at 50% 0%, rgba(0, 212, 255, 0.12), transparent 55%),
      rgba(0, 212, 255, 0.03);
    border: 1px solid rgba(0, 212, 255, 0.2);
    box-shadow: inset 0 0 0 1px rgba(0, 212, 255, 0.08), 0 0 18px rgba(0, 212, 255, 0.08);
  }

  .clients-track {
    display: flex;
    width: max-content;
    gap: 0.75rem;
    animation: marquee-left 24s linear infinite;
    will-change: transform;
  }

  .clients-marquee:hover .clients-track {
    animation-play-state: paused;
  }

  .client-tile {
    flex: 0 0 auto;
    transition: filter 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
  }

  .client-tile:hover {
    border-color: rgba(0, 212, 255, 0.55);
    filter: brightness(1.08);
    box-shadow: 0 0 14px rgba(0, 212, 255, 0.2);
  }

  @keyframes marquee-left {
    from {
      transform: translateX(0);
    }
    to {
      transform: translateX(calc(-50% - 0.375rem));
    }
  }
</style>
