<script lang="ts">
  // Services.svelte — consulting services grid
  // Svelte 5 + TailwindCSS v4

  const technicalServices = [
    {
      icon: '☁️',
      title: 'Azure Solutions Architecture',
      description:
        'End-to-end Azure platform design: landing zones, AKS clusters, networking, identity (Entra ID / AAD), cost optimization, and FinOps. I speak fluent ARM, Bicep, and Terraform.',
      tags: ['Azure', 'AKS', 'Bicep', 'FinOps'],
    },
    {
      icon: '⚡',
      title: '.NET Modernization',
      description:
        'Migrate legacy .NET Framework apps to .NET 9/10. Architect minimal APIs, Blazor frontends, Orleans distributed systems, and cloud-native patterns on Azure.',
      tags: ['.NET 9', 'C#', 'Blazor', 'Orleans'],
    },
    {
      icon: '🔶',
      title: 'Cloudflare Platform',
      description:
        'Full Cloudflare stack implementation: Workers, D1, R2, KV, Queues, Zero Trust / SASE. I\'m an expert-level practitioner — this entire site runs on Cloudflare.',
      tags: ['Workers', 'D1', 'R2', 'Zero Trust'],
    },
    {
      icon: '🔒',
      title: 'Privacy & Security Engineering',
      description:
        'Zero-trust architectures, DNS encryption (DoH/DoT), SASE deployment, security-first SDLC practices, and compliance-ready infrastructure design.',
      tags: ['Zero Trust', 'SASE', 'DNS', 'DoH/DoT'],
    },
    {
      icon: '🌐',
      title: 'Enterprise Networking',
      description:
        'Hardware and software network architecture at enterprise scale — SD-WAN, BGP, UniFi/Ubiquiti deployments, Cloudflare Tunnel, and secure remote access.',
      tags: ['SD-WAN', 'UniFi', 'BGP', 'Tunnels'],
    },
    {
      icon: '🛠️',
      title: 'Technical Advisory',
      description:
        'Architecture reviews, technology selection, team enablement, and fractional CTO services. I help engineering orgs ship better software, faster.',
      tags: ['Advisory', 'CTO', 'Code Review', 'Team'],
    },
  ];

  const creativeServices = [
    {
      icon: '🎨',
      title: 'Digital Media & Web Design',
      description: 'Modern, performant web experiences with a strong visual identity. From brand design to full-stack Astro/Svelte builds.',
      tags: ['Astro', 'Svelte', 'Design', 'Brand'],
    },
    {
      icon: '🔗',
      title: 'Microsoft 365 & Teams',
      description: 'M365 tenant architecture, Teams customization, SharePoint, and OneDrive deployment with governance best practices.',
      tags: ['M365', 'Teams', 'SharePoint'],
    },
  ];

  let activeTab = $state<'technical' | 'creative'>('technical');
</script>

<section id="services" class="section-pad" style="background: var(--color-bg);">
  <div class="section-container">

    <!-- Section label -->
    <div class="section-label animate-on-scroll">SERVICES</div>

    <!-- Section heading -->
    <div class="mb-12 animate-on-scroll">
      <h2 class="text-4xl font-bold mb-4 lg:text-5xl" style="font-family: var(--font-heading);">
        What I <span class="gradient-text">Build</span> &amp; <span class="gradient-text">Consult</span>
      </h2>
      <p class="text-lg max-w-2xl" style="color: var(--color-text-dim);">
        From greenfield cloud platforms to legacy modernization — I partner with teams
        to design, build, and operate infrastructure that lasts.
      </p>
    </div>

    <!-- Tab switcher -->
    <div class="flex gap-2 mb-10 animate-on-scroll">
      <button
        class="btn {activeTab === 'technical' ? 'btn-primary' : 'btn-outline'}"
        onclick={() => { activeTab = 'technical'; }}
        aria-pressed={activeTab === 'technical'}
      >
        Technical
      </button>
      <button
        class="btn {activeTab === 'creative' ? 'btn-primary' : 'btn-outline'}"
        onclick={() => { activeTab = 'creative'; }}
        aria-pressed={activeTab === 'creative'}
      >
        Creative &amp; Advisory
      </button>
    </div>

    <!-- Service cards -->
    {#if activeTab === 'technical'}
      <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {#each technicalServices as service, i}
          <div
            class="glow-border rounded-xl p-6 flex flex-col animate-on-scroll"
            style="background: var(--color-card); transition-delay: {i * 0.07}s;"
          >
            <div class="text-3xl mb-4" aria-hidden="true">{service.icon}</div>
            <h3 class="text-lg font-semibold mb-3" style="font-family: var(--font-heading); color: var(--color-text);">
              {service.title}
            </h3>
            <p class="text-sm leading-relaxed flex-1 mb-4" style="color: var(--color-text-dim);">
              {service.description}
            </p>
            <div class="flex flex-wrap gap-2 mt-auto">
              {#each service.tags as tag}
                <span
                  class="text-xs px-2 py-0.5 rounded"
                  style="background: rgba(0,212,255,0.08); color: var(--color-cyan-dim); border: 1px solid rgba(0,212,255,0.15); font-family: var(--font-mono);"
                >{tag}</span>
              {/each}
            </div>
          </div>
        {/each}
      </div>
    {:else}
      <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {#each creativeServices as service, i}
          <div
            class="glow-border rounded-xl p-6 flex flex-col animate-on-scroll"
            style="background: var(--color-card); transition-delay: {i * 0.1}s;"
          >
            <div class="text-3xl mb-4" aria-hidden="true">{service.icon}</div>
            <h3 class="text-lg font-semibold mb-3" style="font-family: var(--font-heading); color: var(--color-text);">
              {service.title}
            </h3>
            <p class="text-sm leading-relaxed flex-1 mb-4" style="color: var(--color-text-dim);">
              {service.description}
            </p>
            <div class="flex flex-wrap gap-2 mt-auto">
              {#each service.tags as tag}
                <span
                  class="text-xs px-2 py-0.5 rounded"
                  style="background: rgba(0,212,255,0.08); color: var(--color-cyan-dim); border: 1px solid rgba(0,212,255,0.15); font-family: var(--font-mono);"
                >{tag}</span>
              {/each}
            </div>
          </div>
        {/each}

        <!-- Labs callout -->
        <div
          class="rounded-xl p-6 sm:col-span-2 animate-on-scroll"
          style="background: linear-gradient(135deg, rgba(0,120,212,0.1) 0%, rgba(0,212,255,0.05) 100%); border: 1px solid rgba(0,120,212,0.25);"
        >
          <div class="text-3xl mb-3" aria-hidden="true">🧪</div>
          <h3 class="text-lg font-semibold mb-2" style="font-family: var(--font-heading);">Labs & Open Source</h3>
          <p class="text-sm mb-4" style="color: var(--color-text-dim);">
            Side projects include an Adblock Compiler (compiler-as-a-service for filter lists),
            privacy tooling, and experiments in compiler theory. Check the blog and GitHub.
          </p>
          <div class="flex flex-wrap gap-3">
            <a href="https://github.com/jaypatrick" target="_blank" rel="noopener noreferrer" class="btn btn-outline" style="padding: 0.5rem 1.25rem;">
              GitHub Repos →
            </a>
            <a href="/blog" class="btn btn-outline" style="padding: 0.5rem 1.25rem;">
              Blog →
            </a>
          </div>
        </div>
      </div>
    {/if}

    <!-- Book Me CTA -->
    <div class="mt-16 text-center animate-on-scroll">
      <p class="text-lg mb-6" style="color: var(--color-text-dim);">
        Ready to start something?
      </p>
      <a
        href="https://calendly.com/jaysonknight"
        target="_blank"
        rel="noopener noreferrer"
        class="btn btn-red"
      >
        📅 Book a Consultation
      </a>
    </div>
  </div>
</section>
