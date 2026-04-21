<script lang="ts">
  // Header.svelte — site navigation
  // Svelte 5 runes: $state, $effect
  import { openCalendlyPopup } from '$lib/calendly.ts';

  let isMenuOpen = $state(false);
  let isScrolled = $state(false);
  let activeHref = $state('');

  const navLinks = [
    { href: '#home', label: 'Home' },
    { href: '#about', label: 'About' },
    { href: '#services', label: 'Services' },
    { href: '#portfolio', label: 'Portfolio' },
    { href: '/blog', label: 'Blog' },
    { href: '#contact', label: 'Contact' },
  ];

  $effect(() => {
    const onScroll = () => {
      isScrolled = window.scrollY > 20;
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  });

  $effect(() => {
    const setTopState = () => {
      if (window.scrollY <= 80) {
        activeHref = '#home';
      }
    };

    if (window.location.pathname.startsWith('/blog')) {
      activeHref = '/blog';
      return;
    }

    setTopState();

    const ids = ['about', 'services', 'portfolio', 'contact'];
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter((section): section is HTMLElement => Boolean(section));

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visibleEntries[0]) {
          activeHref = `#${(visibleEntries[0].target as HTMLElement).id}`;
          return;
        }

        setTopState();
      },
      { rootMargin: '-40% 0px -40% 0px', threshold: [0, 0.25, 0.5, 0.75, 1] }
    );

    sections.forEach((section) => observer.observe(section));
    window.addEventListener('scroll', setTopState, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', setTopState);
    };
  });

  function closeMenu() {
    isMenuOpen = false;
  }

</script>

<header
  class="fixed top-0 left-0 right-0 z-40 transition-all duration-300"
  style="
    height: var(--header-height);
    background: {isScrolled ? 'rgba(5,5,10,0.92)' : 'rgba(5,5,10,0.7)'};
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-bottom: 1px solid {isScrolled ? 'var(--color-border)' : 'transparent'};
    box-shadow: {isScrolled ? '0 1px 20px rgba(0,0,0,0.4)' : 'none'};
  "
  role="banner"
>
  <div class="section-container h-full flex items-center justify-between">

    <!-- Logo -->
    <a
      href="/"
      class="flex items-center gap-3 group"
      style="text-decoration: none;"
      aria-label="JK.com home"
    >
      <img
        src="/favicon.svg"
        alt="JK logo"
        width="36"
        height="36"
        class="transition-transform duration-300 group-hover:scale-110"
      />
      <div>
        <span
          class="font-black text-lg tracking-tight"
          style="font-family: var(--font-heading); color: var(--color-text);"
        >JK<span class="gradient-text">.com</span></span>
      </div>
    </a>

    <!-- Desktop nav -->
    <nav aria-label="Main navigation" class="hidden md:flex items-center gap-8">
      {#each navLinks as { href, label }}
        <a
          {href}
          class="text-sm font-medium transition-colors duration-200 hover:text-cyan relative group"
          style="color: {activeHref === href ? 'var(--color-text)' : 'var(--color-text-dim)'}; text-decoration: none; font-family: var(--font-heading);"
          aria-current={activeHref === href ? 'page' : undefined}
        >
          {label}
          <span
            class="absolute -bottom-1 left-0 h-px transition-all duration-300"
            style="
              background: var(--color-cyan);
              width: {activeHref === href ? '100%' : '0'};
            "
            class:group-hover:w-full={activeHref !== href}
            aria-hidden="true"
          ></span>
        </a>
      {/each}

      <a
        href="https://calendly.com/jaysonknight"
        onclick={openCalendlyPopup}
        class="btn btn-red"
        style="padding: 0.4rem 1rem; font-size: 0.8rem;"
        aria-label="Book a meeting via Calendly"
      >
        Book Me
      </a>
    </nav>

    <!-- Mobile menu button -->
    <button
      class="md:hidden flex flex-col gap-1.5 p-2 rounded"
      onclick={() => { isMenuOpen = !isMenuOpen; }}
      aria-expanded={isMenuOpen}
      aria-controls="mobile-menu"
      aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
      style="background: transparent; border: 1px solid var(--color-border);"
    >
      <span
        class="block w-5 h-px transition-all duration-300"
        style="background: var(--color-text); transform: {isMenuOpen ? 'translateY(5px) rotate(45deg)' : 'none'};"
      ></span>
      <span
        class="block w-5 h-px transition-all duration-300"
        style="background: var(--color-text); opacity: {isMenuOpen ? 0 : 1};"
      ></span>
      <span
        class="block w-5 h-px transition-all duration-300"
        style="background: var(--color-text); transform: {isMenuOpen ? 'translateY(-5px) rotate(-45deg)' : 'none'};"
      ></span>
    </button>
  </div>
</header>

<!-- Mobile menu -->
<div
  id="mobile-menu"
  class="fixed inset-x-0 z-30 md:hidden transition-all duration-300 overflow-hidden"
  style="
    top: var(--header-height);
    max-height: {isMenuOpen ? '100vh' : '0'};
    background: rgba(5,5,10,0.98);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--color-border);
  "
  aria-hidden={!isMenuOpen}
>
  <nav class="section-container py-6 flex flex-col gap-4" aria-label="Mobile navigation">
    {#each navLinks as { href, label }}
      <a
        {href}
        onclick={closeMenu}
        class="text-lg font-medium py-2 transition-colors"
        style="color: {activeHref === href ? 'var(--color-cyan)' : 'var(--color-text-dim)'}; text-decoration: none; border-bottom: 1px solid var(--color-border);"
        aria-current={activeHref === href ? 'page' : undefined}
      >
        {label}
      </a>
    {/each}
    <a
      href="https://calendly.com/jaysonknight"
      onclick={(e) => {
        closeMenu();
        openCalendlyPopup(e);
      }}
      class="btn btn-red mt-2 justify-center"
      aria-label="Book a meeting via Calendly"
    >
      📅 Book Me
    </a>
  </nav>
</div>

<!-- Header spacer — prevents content from hiding behind fixed header -->
<div style="height: var(--header-height);" aria-hidden="true"></div>
