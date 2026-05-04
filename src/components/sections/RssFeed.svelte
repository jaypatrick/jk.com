<script lang="ts">
  import { fade } from 'svelte/transition';

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
        console.error('[RssFeed] Failed to load feed:', err);
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

<section id="blog-feed" class="section-pad" aria-labelledby="blog-feed-heading" style="background: var(--color-surface);">
  <div class="section-container">
    <div class="section-label animate-on-scroll">WHAT I THINK</div>
    <div class="mb-10 animate-on-scroll flex items-end justify-between gap-4 flex-wrap">
      <h2 id="blog-feed-heading" class="text-4xl font-bold mb-0 lg:text-5xl" style="font-family: var(--font-heading);">
        Latest <span class="gradient-text">Thoughts</span>
      </h2>
      <a
        href="https://blog.jaysonknight.com/"
        target="_blank"
        rel="noopener noreferrer"
        class="view-all-link"
      >
        View all posts →
      </a>
    </div>

    {#if loading}
      <div role="status" aria-label="Loading blog posts" aria-live="polite">
        <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {#each Array.from({ length: 3 }) as _, i}
            <div
              class="skeleton-card rounded-xl p-6 animate-pulse"
              style="transition-delay: {i * 0.05}s;"
            >
              <div class="h-3 w-24 rounded mb-4" style="background: rgba(0,212,255,0.1);"></div>
              <div class="h-5 w-11/12 rounded mb-3" style="background: rgba(0,212,255,0.08);"></div>
              <div class="h-4 w-full rounded mb-2" style="background: rgba(0,212,255,0.06);"></div>
              <div class="h-4 w-10/12 rounded" style="background: rgba(0,212,255,0.06);"></div>
            </div>
          {/each}
        </div>
      </div>
    {:else if error}
      <div role="alert" class="error-box rounded-xl p-6">
        ⚠ {error}
      </div>
    {:else}
      {#if formattedItems.length > 0}
        <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {#each formattedItems as item, i}
            <article
              class="feed-card iridescent rounded-xl p-6 flex flex-col"
              in:fade={{ duration: 400, delay: i * 80 }}
            >
              <!-- Top accent bar -->
              <div class="feed-card-accent" aria-hidden="true"></div>

              <p class="feed-date">
                // {item.formattedDate}
              </p>

              <h3 class="feed-title">
                <a href={item.link} target="_blank" rel="noopener noreferrer" class="feed-title-link">
                  {item.title}
                </a>
              </h3>

              <p class="feed-desc">{item.description}</p>

              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                class="feed-read-more mt-auto"
                aria-label={'Read more: ' + item.title}
              >
                <span class="feed-read-more-arrow">▶</span> Read More
              </a>
            </article>
          {/each}
        </div>
      {:else}
        <div class="flex flex-col gap-4" in:fade={{ duration: 300 }}>
          <p class="text-sm md:text-base" style="color: var(--color-text-dim);">
            No posts available right now. Check back soon or
            <a href="https://blog.jaysonknight.com/" target="_blank" rel="noopener noreferrer" style="color: var(--color-cyan); text-decoration: underline;">
              visit the blog directly
            </a>.
          </p>
        </div>
      {/if}
    {/if}
  </div>
</section>

<style>
  /* ── Card shell ─────────────────────────────────────── */
  .feed-card {
    position: relative;
    background: var(--color-card, #111827);
    border: 1px solid rgba(0, 212, 255, 0.18);
    box-shadow:
      inset 0 0 0 1px rgba(0, 212, 255, 0.06),
      0 0 12px rgba(0, 212, 255, 0.06);
    overflow: hidden;
    transition:
      border-color 0.25s ease,
      box-shadow 0.25s ease,
      transform 0.2s ease;
  }

  .feed-card:hover {
    border-color: rgba(0, 212, 255, 0.55);
    box-shadow:
      inset 0 0 0 1px rgba(0, 212, 255, 0.12),
      0 0 28px rgba(0, 212, 255, 0.18),
      0 0 60px rgba(0, 212, 255, 0.06);
    transform: translateY(-3px);
  }

  /* Cyan top-edge scanline accent */
  .feed-card-accent {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(0, 212, 255, 0.7) 30%,
      rgba(0, 245, 255, 1) 50%,
      rgba(0, 212, 255, 0.7) 70%,
      transparent 100%
    );
    opacity: 0.6;
    transition: opacity 0.25s ease;
  }

  .feed-card:hover .feed-card-accent {
    opacity: 1;
  }

  /* ── Date stamp ─────────────────────────────────────── */
  .feed-date {
    font-family: var(--font-mono, 'JetBrains Mono', monospace);
    font-size: 0.7rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--color-cyan-dim, #0099cc);
    margin-bottom: 0.75rem;
    margin-top: 0.5rem;
  }

  /* ── Title ──────────────────────────────────────────── */
  .feed-title {
    font-family: var(--font-heading, 'Space Grotesk', system-ui, sans-serif);
    font-size: 1.15rem;
    font-weight: 700;
    line-height: 1.25;
    margin-bottom: 0.75rem;
  }

  .feed-title-link {
    color: var(--color-text, #e2e8f0);
    text-decoration: none;
    transition: color 0.2s ease;
  }

  .feed-title-link:hover {
    color: var(--color-cyan, #00d4ff);
  }

  /* ── Description ────────────────────────────────────── */
  .feed-desc {
    font-size: 0.875rem;
    line-height: 1.65;
    color: var(--color-text-dim, #94a3b8);
    margin-bottom: 1.25rem;
    flex: 1;
  }

  /* ── Read More CTA ──────────────────────────────────── */
  .feed-read-more {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    font-family: var(--font-mono, monospace);
    font-size: 0.75rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--color-cyan, #00d4ff);
    text-decoration: none;
    transition: color 0.2s ease, gap 0.2s ease;
  }

  .feed-read-more:hover {
    color: var(--color-pink, #f72585);
    gap: 0.65rem;
  }

  .feed-read-more-arrow {
    font-size: 0.6rem;
    transition: transform 0.2s ease;
  }

  .feed-read-more:hover .feed-read-more-arrow {
    transform: translateX(3px);
  }

  /* ── Skeleton ───────────────────────────────────────── */
  .skeleton-card {
    background: var(--color-card, #111827);
    border: 1px solid rgba(0, 212, 255, 0.1);
  }

  /* ── Error ──────────────────────────────────────────── */
  .error-box {
    background: rgba(255, 45, 85, 0.08);
    border: 1px solid rgba(255, 45, 85, 0.3);
    color: var(--color-red, #ff2d55);
    font-family: var(--font-mono, monospace);
    font-size: 0.875rem;
    font-weight: 700;
  }

  /* ── View all link ──────────────────────────────────── */
  .view-all-link {
    font-family: var(--font-mono, monospace);
    font-size: 0.8rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--color-cyan, #00d4ff);
    text-decoration: none;
    transition: color 0.2s ease;
  }

  .view-all-link:hover {
    color: var(--color-cyan-glow, #00f5ff);
  }
</style>
