<script lang="ts">
  const year = new Date().getFullYear();

  const links = [
    { href: '#about', label: 'About' },
    { href: '#services', label: 'Services' },
    { href: '#portfolio', label: 'Portfolio' },
    { href: '/blog', label: 'Blog' },
    { href: '#contact', label: 'Contact' },
    { href: '/privacy', label: 'Privacy' },
  ];

  const social = [
    { href: 'https://github.com/jaypatrick', label: 'GitHub', icon: '⌥' },
    { href: 'https://www.linkedin.com/in/jaysonknight', label: 'LinkedIn', icon: '𝕃' },
    { href: 'https://calendly.com/jaysonknight', label: 'Book Me', icon: '📅' },
  ];
</script>

<footer role="contentinfo" style="background: var(--color-surface); border-top: 1px solid var(--color-border);">
  <div class="section-container py-12">
    <div class="grid grid-cols-1 gap-10 md:grid-cols-3 items-start mb-10">

      <!-- Brand column -->
      <div>
        <a href="/" aria-label="JK.com — home" style="text-decoration: none;">
          <div
            class="font-black text-2xl mb-3"
            style="font-family: var(--font-heading);"
          >
            JK<span class="gradient-text">.com</span>
          </div>
        </a>
        <p class="text-sm mb-4" style="color: var(--color-text-ghost); line-height: 1.7;">
          Jayson Knight — Enterprise Cloud Architect.<br/>
          Azure · Cloudflare · .NET · Privacy
        </p>
        <p class="text-sm" style="color: var(--color-text-ghost);">
          Charlotte, North Carolina
        </p>
        <a
          href="tel:+19807297877"
          class="text-sm transition-colors"
          style="color: var(--color-cyan-dim); text-decoration: none;"
        >
          980.729.7877
        </a>
      </div>

      <!-- Navigation -->
      <div>
        <h3
          class="text-xs font-mono uppercase tracking-widest mb-4"
          style="color: var(--color-text-ghost);"
        >Navigation</h3>
        <nav aria-label="Footer navigation">
          <ul class="space-y-2">
            {#each links as { href, label }}
              <li>
                <a
                  {href}
                  class="text-sm transition-colors hover:text-cyan"
                  style="color: var(--color-text-dim); text-decoration: none;"
                >{label}</a>
              </li>
            {/each}
          </ul>
        </nav>
      </div>

      <!-- Contact / social -->
      <div>
        <h3
          class="text-xs font-mono uppercase tracking-widest mb-4"
          style="color: var(--color-text-ghost);"
        >Connect</h3>
        <div class="space-y-3 mb-6">
          {#each social as { href, label, icon }}
            <a
              {href}
              target="_blank"
              rel="noopener noreferrer"
              class="flex items-center gap-3 text-sm transition-colors hover:text-cyan"
              style="color: var(--color-text-dim); text-decoration: none;"
            >
              <span
                class="w-8 h-8 rounded-lg flex items-center justify-center text-xs"
                style="background: rgba(0,212,255,0.08); border: 1px solid rgba(0,212,255,0.15);"
                aria-hidden="true"
              >{icon}</span>
              {label}
            </a>
          {/each}
        </div>

        <!-- Built with -->
        <div
          class="text-xs rounded-lg p-3"
          style="background: var(--color-card); border: 1px solid var(--color-border); font-family: var(--font-mono); color: var(--color-text-ghost); line-height: 1.8;"
        >
          <span style="color: var(--color-cyan-dim);">// built with</span><br/>
          Astro 6 · Svelte 5 · Cloudflare<br/>
          EmDash · Hono · TailwindCSS v4
        </div>
      </div>
    </div>

    <!-- Bottom bar -->
    <div
      class="flex flex-col items-center justify-between gap-4 pt-8 text-xs sm:flex-row"
      style="border-top: 1px solid var(--color-border); color: var(--color-text-ghost); font-family: var(--font-mono);"
    >
      <span>© {year} Jayson Knight · JK.com · All rights reserved</span>
      <span style="color: var(--color-cyan-dim);">
        Powered by Cloudflare Workers
        <span style="color: var(--color-border);">·</span>
        Charlotte, NC
      </span>
    </div>
  </div>
</footer>
