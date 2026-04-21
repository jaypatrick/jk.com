<script lang="ts">
  type FeedItem = {
    title: string;
    link: string;
    pubDate: string;
    description: string;
  };

  let { feedUrl = '', maxItems = 5 }: { feedUrl?: string; maxItems?: number } = $props();

  let items = $state<FeedItem[]>([]);
  let loading = $state(true);
  let error = $state('');

  const formattedItems = $derived(
    items.map((item) => ({
      ...item,
      formattedDate: item.pubDate
        ? new Date(item.pubDate).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })
        : 'Date unavailable',
    }))
  );

  $effect(() => {
    feedUrl;
    maxItems;

    let cancelled = false;
    loading = true;
    error = '';
    items = [];

    const run = async () => {
      const params = new URLSearchParams();
      if (feedUrl) {
        params.set('url', feedUrl);
      }
      params.set('max', String(maxItems));

      try {
        const response = await fetch(`/api/rss?${params.toString()}`);
        const payload = (await response.json()) as { items?: FeedItem[]; error?: string };

        if (!response.ok) {
          throw new Error(payload.error ?? 'Failed to load feed.');
        }

        if (!cancelled) {
          items = payload.items ?? [];
        }
      } catch (err) {
        if (!cancelled) {
          error = err instanceof Error ? err.message : 'Failed to load feed.';
        }
      } finally {
        if (!cancelled) {
          loading = false;
        }
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  });
</script>

<section class="section-pad" style="background: var(--color-surface);">
  <div class="section-container">
    <div class="section-label animate-on-scroll">WHAT I THINK</div>
    <div class="mb-10 animate-on-scroll flex items-end justify-between gap-4 flex-wrap">
      <h2 class="text-4xl font-bold mb-0 lg:text-5xl" style="font-family: var(--font-heading);">
        Latest <span class="gradient-text">Thoughts</span>
      </h2>
      <a
        href="https://blog.jaysonknight.com/"
        target="_blank"
        rel="noopener noreferrer"
        style="color: var(--color-cyan); text-decoration: none; font-family: var(--font-heading);"
      >
        View all posts →
      </a>
    </div>

    {#if loading}
      <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {#each Array.from({ length: 3 }) as _, i}
          <div
            class="rounded-xl p-6 animate-pulse animate-on-scroll"
            style="background: var(--color-card); border: 1px solid var(--color-border); transition-delay: {i * 0.05}s;"
          >
            <div class="h-3 w-24 rounded mb-4" style="background: rgba(148,163,184,0.2);"></div>
            <div class="h-5 w-11/12 rounded mb-3" style="background: rgba(148,163,184,0.18);"></div>
            <div class="h-4 w-full rounded mb-2" style="background: rgba(148,163,184,0.15);"></div>
            <div class="h-4 w-10/12 rounded" style="background: rgba(148,163,184,0.15);"></div>
          </div>
        {/each}
      </div>
    {:else if error}
      <div
        class="rounded-xl p-6 animate-on-scroll"
        style="background: rgba(255,45,85,0.08); border: 1px solid rgba(255,45,85,0.3); color: var(--color-red);"
      >
        {error}
      </div>
    {:else}
      <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {#each formattedItems as item, i}
          <article
            class="glow-border rounded-xl p-6 flex flex-col animate-on-scroll"
            style="background: var(--color-card); transition-delay: {i * 0.05}s;"
          >
            <p class="text-xs mb-3 uppercase tracking-widest" style="color: var(--color-text-ghost); font-family: var(--font-mono);">
              {item.formattedDate}
            </p>
            <h3 class="text-xl font-bold mb-3" style="font-family: var(--font-heading);">
              <a href={item.link} target="_blank" rel="noopener noreferrer" style="color: var(--color-text); text-decoration: none;">
                {item.title}
              </a>
            </h3>
            <p class="text-sm leading-relaxed mb-5" style="color: var(--color-text-dim);">{item.description}</p>
            <a
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              class="mt-auto"
              style="color: var(--color-cyan); text-decoration: none; font-family: var(--font-heading);"
            >
              Read More →
            </a>
          </article>
        {/each}
      </div>
    {/if}
  </div>
</section>
