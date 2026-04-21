<script lang="ts">
  // Services.svelte — consulting services grid
  // Svelte 5 + TailwindCSS v4
  import { tick } from 'svelte';
  import { openCalendlyPopup } from '$lib/calendly.ts';

  type Service = {
    icon: string;
    title: string;
    description: string;
    tags: string[];
    bullets: string[];
  };

  const technicalServices: Service[] = [
    {
      icon: '☁️',
      title: 'Azure Solutions Architecture',
      description:
        'End-to-end Azure platform design: landing zones, AKS clusters, networking, identity (Entra ID / AAD), cost optimization, and FinOps. I speak fluent ARM, Bicep, and Terraform.',
      tags: ['Azure', 'AKS', 'Bicep', 'FinOps'],
      bullets: [
        'Landing zone design & implementation',
        'AKS cluster & node pool sizing',
        'FinOps dashboards & budget alerts',
      ],
    },
    {
      icon: '⚡',
      title: '.NET & TypeScript/Deno Modernization',
      description:
        'Migrate legacy .NET Framework apps to .NET 9/10, and build greenfield TypeScript services with Deno and Deno Deploy. Architect minimal APIs, Blazor frontends, Orleans distributed systems, and cloud-native patterns on Azure.',
      tags: ['.NET 9', 'C#', 'Deno', 'TypeScript'],
      bullets: [
        'Incremental migration planning for legacy .NET workloads',
        'TypeScript/Deno service design with Deno Deploy edge deployment',
        'Modern CI/CD pipelines for .NET and Deno services',
      ],
    },
    {
      icon: '🤖',
      title: 'AI Engineering & Agentic Systems',
      description:
        'End-to-end AI platform design using Anthropic Claude as the primary model. I design Agentic Development Environments (ADEs), orchestration agents, MCP servers, and AI gateways — all deployable to the Cloudflare edge.',
      tags: ['Anthropic Claude', 'MCP', 'AI Gateway', 'Agents'],
      bullets: [
        'Agentic Development Environment (ADE) design & implementation',
        'Orchestration agent pipelines and multi-agent coordination',
        'MCP server and AI gateway deployment on Cloudflare Workers',
      ],
    },
    {
      icon: '🦀',
      title: 'Rust & WebAssembly',
      description:
        'Deep Rust expertise across the full stack — standalone systems programming, server-side WASM with WASI/component model, and client-side WASM in both Rust and TypeScript.',
      tags: ['Rust', 'WASM', 'WASI', 'TypeScript'],
      bullets: [
        'Standalone Rust systems: CLIs, daemons, high-performance libs',
        'Server-side WASM components (WASI) for edge & serverless runtimes',
        'Client-side WASM modules in Rust and TypeScript for browser & Cloudflare Workers',
      ],
    },
    {
      icon: '🔶',
      title: 'Cloudflare Platform',
      description:
        'Full Cloudflare stack implementation: Workers, D1, R2, KV, Queues, Zero Trust / SASE, AI Gateway, MCP servers, and Vectorize. I\'m an expert-level practitioner — this entire site runs on Cloudflare.',
      tags: ['Workers', 'AI Gateway', 'MCP', 'Zero Trust'],
      bullets: [
        'Workers and Durable Objects architecture design',
        'AI Gateway and MCP server deployment at the edge',
        'Zero Trust rollout with staged policy enforcement',
      ],
    },
    {
      icon: '🔒',
      title: 'Privacy & Security Engineering',
      description:
        'Zero-trust architectures, DNS encryption (DoH/DoT), SASE deployment, security-first SDLC practices, and compliance-ready infrastructure design.',
      tags: ['Zero Trust', 'SASE', 'DNS', 'DoH/DoT'],
      bullets: [
        'Zero-trust policy modeling and implementation',
        'Security hardening with practical compliance controls',
        'Threat-informed architecture and segmentation',
      ],
    },
    {
      icon: '🌐',
      title: 'Enterprise Networking',
      description:
        'Hardware and software network architecture at enterprise scale — SD-WAN, BGP, UniFi/Ubiquiti deployments, Cloudflare Tunnel, and secure remote access.',
      tags: ['SD-WAN', 'UniFi', 'BGP', 'Tunnels'],
      bullets: [
        'SD-WAN and edge routing strategy',
        'BGP design for resilient hybrid connectivity',
        'Secure remote access with Cloudflare Tunnel',
      ],
    },
    {
      icon: '🛠️',
      title: 'Technical Advisory',
      description:
        'Architecture reviews, technology selection, team enablement, and fractional CTO services. I help engineering orgs ship better software, faster.',
      tags: ['Advisory', 'CTO', 'Code Review', 'Team'],
      bullets: [
        'Architecture reviews and modernization roadmaps',
        'Team enablement through pairing and standards',
        'Pragmatic technology selection for product velocity',
      ],
    },
  ];

  const creativeServices: Service[] = [
    {
      icon: '🎨',
      title: 'Digital Media & Web Design',
      description: 'Modern, performant web experiences with a strong visual identity. From brand design to full-stack Astro/Svelte builds.',
      tags: ['Astro', 'Svelte', 'Design', 'Brand'],
      bullets: [
        'Brand-aligned design systems and visual direction',
        'Performance-first Astro and Svelte implementation',
        'Conversion-focused UX and content structure',
      ],
    },
    {
      icon: '🔗',
      title: 'Microsoft 365 & Teams',
      description: 'M365 tenant architecture, Teams customization, SharePoint, and OneDrive deployment with governance best practices.',
      tags: ['M365', 'Teams', 'SharePoint'],
      bullets: [
        'Tenant architecture and governance guardrails',
        'Teams and SharePoint collaboration patterns',
        'Adoption and enablement plans for business teams',
      ],
    },
  ];

  let activeTab = $state<'technical' | 'creative'>('technical');
  let expandedTechnicalIndex = $state<number | null>(null);
  let expandedCreativeIndex = $state<number | null>(null);

  function toggleService(tab: 'technical' | 'creative', index: number) {
    if (tab === 'technical') {
      expandedTechnicalIndex = expandedTechnicalIndex === index ? null : index;
      return;
    }

    expandedCreativeIndex = expandedCreativeIndex === index ? null : index;
  }

  $effect(() => {
    activeTab;

    let cancelled = false;
    let observer: IntersectionObserver | undefined;

    tick().then(() => {
      if (cancelled) {
        return;
      }

      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('visible');
            }
          });
        },
        { threshold: 0.05, rootMargin: '0px 0px -20px 0px' }
      );

      document.querySelectorAll('#services .animate-on-scroll:not(.visible)').forEach((el) => {
        observer?.observe(el);
      });
    });

    return () => {
      cancelled = true;
      observer?.disconnect();
    };
  });
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
    <div class="flex gap-2 mb-10 animate-on-scroll" role="tablist" aria-label="Services categories">
      <button
        id="tab-technical"
        class="btn {activeTab === 'technical' ? 'btn-primary' : 'btn-outline'}"
        onclick={() => { activeTab = 'technical'; }}
        role="tab"
        aria-selected={activeTab === 'technical'}
        aria-controls="panel-technical"
      >
        Technical
      </button>
      <button
        id="tab-creative"
        class="btn {activeTab === 'creative' ? 'btn-primary' : 'btn-outline'}"
        onclick={() => { activeTab = 'creative'; }}
        role="tab"
        aria-selected={activeTab === 'creative'}
        aria-controls="panel-creative"
      >
        Creative &amp; Advisory
      </button>
    </div>

    <!-- Service cards -->
    {#if activeTab === 'technical'}
      <div role="tabpanel" id="panel-technical" aria-labelledby="tab-technical" class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {#each technicalServices as service, i}
          {@const isExpanded = expandedTechnicalIndex === i}
          <div
            class="glow-border rounded-xl p-6 flex flex-col animate-on-scroll cursor-pointer"
            style="background: var(--color-card); transition-delay: {i * 0.07}s; border-color: {isExpanded ? 'var(--color-cyan)' : undefined}; box-shadow: {isExpanded ? 'var(--glow-cyan)' : undefined};"
            role="button"
            tabindex="0"
            aria-expanded={isExpanded}
            aria-label={service.title}
            onclick={() => toggleService('technical', i)}
            onkeydown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleService('technical', i);
              }
            }}
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
            <div class="mt-4 text-xs" style="color: var(--color-cyan); font-family: var(--font-mono);">
              {isExpanded ? '▴ Details' : '▾ Details'}
            </div>
            {#if isExpanded}
              <div
                class="mt-4 rounded-lg p-4"
                style="background: rgba(0,212,255,0.06); border: 1px solid rgba(0,212,255,0.25);"
              >
                <div class="text-xs uppercase tracking-widest mb-2" style="color: var(--color-cyan); font-family: var(--font-mono);">
                  Learn More
                </div>
                <ul class="space-y-1.5">
                  {#each service.bullets as bullet}
                    <li class="text-sm flex gap-2" style="color: var(--color-text-dim);">
                      <span style="color: var(--color-cyan);">•</span>
                      <span>{bullet}</span>
                    </li>
                  {/each}
                </ul>
              </div>
            {/if}
          </div>
        {/each}
      </div>
    {:else}
      <div role="tabpanel" id="panel-creative" aria-labelledby="tab-creative" class="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {#each creativeServices as service, i}
          {@const isExpanded = expandedCreativeIndex === i}
          <div
            class="glow-border rounded-xl p-6 flex flex-col animate-on-scroll cursor-pointer"
            style="background: var(--color-card); transition-delay: {i * 0.1}s; border-color: {isExpanded ? 'var(--color-cyan)' : undefined}; box-shadow: {isExpanded ? 'var(--glow-cyan)' : undefined};"
            role="button"
            tabindex="0"
            aria-expanded={isExpanded}
            aria-label={service.title}
            onclick={() => toggleService('creative', i)}
            onkeydown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleService('creative', i);
              }
            }}
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
            <div class="mt-4 text-xs" style="color: var(--color-cyan); font-family: var(--font-mono);">
              {isExpanded ? '▴ Details' : '▾ Details'}
            </div>
            {#if isExpanded}
              <div
                class="mt-4 rounded-lg p-4"
                style="background: rgba(0,212,255,0.06); border: 1px solid rgba(0,212,255,0.25);"
              >
                <div class="text-xs uppercase tracking-widest mb-2" style="color: var(--color-cyan); font-family: var(--font-mono);">
                  Learn More
                </div>
                <ul class="space-y-1.5">
                  {#each service.bullets as bullet}
                    <li class="text-sm flex gap-2" style="color: var(--color-text-dim);">
                      <span style="color: var(--color-cyan);">•</span>
                      <span>{bullet}</span>
                    </li>
                  {/each}
                </ul>
              </div>
            {/if}
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
        onclick={openCalendlyPopup}
        class="btn btn-red"
        aria-label="Book a consultation via Calendly"
      >
        📅 Book a Consultation
      </a>
    </div>
  </div>
</section>
