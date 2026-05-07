<script lang="ts">
  // Contact.svelte — "TALK TO ME" section
  // Phosphor: terminal-style typography, monospace labels, iridescent contact panels

  import { onDestroy } from 'svelte';
  import { openCalendlyPopup } from '$lib/calendly.ts';
  import { contactSchema, type ContactFormData } from '../../lib/schemas';
  import BootLabel from '../ui/BootLabel.svelte';

  type FormState = 'idle' | 'submitting' | 'success' | 'error';

  let state = $state<FormState>('idle');
  let errorMessage = $state('');

  let form = $state<ContactFormData>({
    name: '',
    email: '',
    company: '',
    message: '',
    _honey: '',
  });

  let fieldErrors = $state<Partial<Record<keyof ContactFormData, string>>>({});
  let isCalendlyReady = $state(false);
  let calendlyInlineContainer = $state<HTMLDivElement | null>(null);
  let messageField = $state<HTMLTextAreaElement | null>(null);
  let calendlyModalOpen = $state(false);
  let modalRevealed = $state(false);
  let closeTimeout: ReturnType<typeof setTimeout> | undefined;
  let revealTimeout: ReturnType<typeof setTimeout> | undefined;
  let modalCloseBtn = $state<HTMLButtonElement | null>(null);
  let scheduleBtn = $state<HTMLButtonElement | null>(null);
  // Must match the CSS transition duration on .calendly-modal-panel
  const MODAL_CLOSE_TRANSITION_MS = 300;
  const calendlyEmbedUrl = 'https://calendly.com/jaysonknight?background_color=0d1117&text_color=e2e8f0&primary_color=00d4ff&hide_gdpr_banner=1';
  const quickStartItems = [
    {
      title: 'Visual Refresh Sprint',
      brief: 'I want a visual refresh sprint focused on hierarchy, spacing, motion polish, and premium UI consistency.',
    },
    {
      title: 'Structural IA Overhaul',
      brief: 'I want to restructure the site architecture so services, proof, and outcomes are easier to navigate and convert.',
    },
    {
      title: 'Feature Expansion Build',
      brief: 'I want to add interactive case studies, downloadable assets, and smarter intake flows for higher-quality leads.',
    },
    {
      title: 'Technical Hardening Pass',
      brief: 'I want Core Web Vitals optimization, accessibility QA automation, and schema/SEO technical hardening.',
    },
  ] as const;

  function applyQuickStart(brief: string) {
    form.message = brief;
    state = 'idle';
    errorMessage = '';
    fieldErrors.message = '';

    requestAnimationFrame(() => {
      messageField?.focus();
      messageField?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    fieldErrors = {};

    // Client-side Zod 4 validation
    const result = contactSchema.safeParse(form);
    if (!result.success) {
      const flat = result.error.flatten();
      fieldErrors = Object.fromEntries(
        Object.entries(flat.fieldErrors).map(([k, v]) => [k, v?.[0] ?? ''])
      ) as typeof fieldErrors;
      return;
    }

    state = 'submitting';

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result.data),
      });

      const json = await res.json() as { success: boolean; error?: string };

      if (json.success) {
        state = 'success';
        form = { name: '', email: '', company: '', message: '', _honey: '' };
      } else {
        errorMessage = json.error ?? 'Something went wrong. Please try again.';
        state = 'error';
      }
    } catch {
      errorMessage = 'Network error. Please try again or email directly.';
      state = 'error';
    }
  }

  $effect(() => {
    const calendly = (window as Window & { Calendly?: unknown }).Calendly;
    isCalendlyReady = Boolean(calendly);

    if (isCalendlyReady) {
      return;
    }

    const interval = window.setInterval(() => {
      isCalendlyReady = Boolean((window as Window & { Calendly?: unknown }).Calendly);
      if (isCalendlyReady) {
        window.clearInterval(interval);
      }
    }, 400);

    return () => window.clearInterval(interval);
  });

  function scheduleReveal() {
    if (revealTimeout !== undefined) clearTimeout(revealTimeout);
    modalRevealed = false;
    revealTimeout = setTimeout(() => {
      modalRevealed = true;
      revealTimeout = undefined;
    }, 50);
  }

  function openCalendlyModal() {
    if (closeTimeout !== undefined) {
      clearTimeout(closeTimeout);
      closeTimeout = undefined;
    }
    calendlyModalOpen = true;
    scheduleReveal();
  }

  function closeCalendlyModal() {
    if (revealTimeout !== undefined) {
      clearTimeout(revealTimeout);
      revealTimeout = undefined;
    }
    modalRevealed = false;
    if (closeTimeout !== undefined) clearTimeout(closeTimeout);
    closeTimeout = setTimeout(() => {
      calendlyModalOpen = false;
      closeTimeout = undefined;
      scheduleBtn?.focus();
    }, MODAL_CLOSE_TRANSITION_MS);
  }

  $effect(() => {
    if (!calendlyModalOpen || !isCalendlyReady || !calendlyInlineContainer) return;

    const calendly = (window as Window & {
      Calendly?: {
        initInlineWidget?: (options: { url: string; parentElement: HTMLDivElement }) => void;
      };
    }).Calendly;

    if (!calendly?.initInlineWidget) {
      return;
    }

    calendlyInlineContainer.innerHTML = '';
    calendly.initInlineWidget({
      url: calendlyEmbedUrl,
      parentElement: calendlyInlineContainer,
    });
  });

  // Document-level Escape handler while modal is open; works even after focus moves into the iframe
  $effect(() => {
    if (!calendlyModalOpen) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') closeCalendlyModal();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  });

  // Move focus to the close button when the modal opens so keyboard users can act immediately
  $effect(() => {
    if (!calendlyModalOpen) return;
    const rafId = requestAnimationFrame(() => { modalCloseBtn?.focus(); });
    return () => cancelAnimationFrame(rafId);
  });

  // Cancel any in-flight modal timeouts when the component is destroyed
  onDestroy(() => {
    if (closeTimeout !== undefined) clearTimeout(closeTimeout);
    if (revealTimeout !== undefined) clearTimeout(revealTimeout);
  });
</script>

<section id="contact" class="section-pad" style="background: var(--color-bg);">
  <div class="section-container">

    <!-- Section label -->
    <BootLabel label="CONTACT" class="animate-on-scroll" />

    <div class="grid grid-cols-1 gap-10 lg:grid-cols-2 items-start">

      <!-- Left: Info -->
      <div class="animate-on-scroll">
        <h2 class="text-4xl font-bold mb-6 lg:text-5xl" style="font-family: var(--font-heading);">
          Let's Build<br/>
          <span class="gradient-text">Something Great</span>
        </h2>

        <p class="text-lg mb-6" style="color: var(--color-text-dim); line-height: 1.8;">
          Whether you're planning a cloud migration, need an architecture review,
          or want to ship something that's never been built — I'm interested.
        </p>

        <div class="mb-6 iridescent rounded-xl p-5" style="background: var(--color-card); border: 1px solid var(--color-border);">
          <h3 class="text-sm font-mono uppercase tracking-widest mb-3" style="color: var(--color-cyan);">
            Fast-Track Website Upgrades
          </h3>
          <p class="text-sm mb-4" style="color: var(--color-text-dim); line-height: 1.65;">
            Choose one to prefill the contact form and launch immediately.
          </p>
          <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {#each quickStartItems as item}
              <button
                type="button"
                onclick={() => applyQuickStart(item.brief)}
                class="text-left rounded-lg p-3 transition-all hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                style="background: rgba(0,212,255,0.06); border: 1px solid rgba(0,212,255,0.2);"
              >
                <div class="text-xs font-mono uppercase tracking-widest mb-1" style="color: var(--color-cyan);">Quick Start</div>
                <div class="text-sm font-semibold" style="color: var(--color-text);">{item.title}</div>
              </button>
            {/each}
          </div>
        </div>

        <!-- Contact details -->
        <div class="space-y-6 mb-6">
          <a
            href="tel:+19807297877"
            class="flex items-center gap-4 group"
            style="text-decoration: none;"
          >
            <div
              class="w-12 h-12 rounded-lg flex items-center justify-center text-xl flex-shrink-0"
              style="background: rgba(0,212,255,0.08); border: 1px solid rgba(0,212,255,0.2);"
            >📞</div>
            <div>
              <div class="text-xs mb-0.5 font-mono uppercase tracking-widest" style="color: var(--color-text-ghost);">Phone</div>
              <div class="text-lg font-medium group-hover:text-cyan transition-colors" style="color: var(--color-text);">980.729.7877</div>
            </div>
          </a>

          <div class="flex items-center gap-4">
            <div
              class="w-12 h-12 rounded-lg flex items-center justify-center text-xl flex-shrink-0"
              style="background: rgba(0,212,255,0.08); border: 1px solid rgba(0,212,255,0.2);"
            >📍</div>
            <div>
              <div class="text-xs mb-0.5 font-mono uppercase tracking-widest" style="color: var(--color-text-ghost);">Location</div>
              <div class="text-lg font-medium" style="color: var(--color-text);">Charlotte, North Carolina</div>
            </div>
          </div>
        </div>

        <!-- Social / links -->
        <div class="flex flex-wrap gap-3">
          <a
            href="https://github.com/jaypatrick"
            target="_blank"
            rel="noopener noreferrer"
            class="btn btn-outline"
            style="padding: 0.5rem 1.25rem; font-size: 0.8rem;"
          >GitHub</a>
          <a
            href="https://www.linkedin.com/in/jaysonknight"
            target="_blank"
            rel="noopener noreferrer"
            class="btn btn-outline"
            style="padding: 0.5rem 1.25rem; font-size: 0.8rem;"
          >LinkedIn</a>
          <a
            href="/blog"
            class="btn btn-outline"
            style="padding: 0.5rem 1.25rem; font-size: 0.8rem;"
          >Blog</a>
          <a
            href="https://calendly.com/jaysonknight"
            onclick={openCalendlyPopup}
            class="btn btn-red iridescent"
            style="padding: 0.5rem 1.25rem; font-size: 0.8rem;"
          >📅 Book Me</a>
        </div>
      </div>

      <!-- Right: Contact form -->
      <div class="animate-on-scroll" style="transition-delay: 0.15s;">
        {#if state === 'success'}
          <div
            role="status"
            aria-live="polite"
            aria-atomic="true"
            class="rounded-xl p-8 text-center"
            style="background: rgba(0,212,255,0.05); border: 1px solid rgba(0,212,255,0.3);"
          >
            <div class="text-5xl mb-4">✅</div>
            <h3 class="text-xl font-bold mb-2" style="font-family: var(--font-heading);">TRANSMISSION_RECEIVED</h3>
            <p style="color: var(--color-text-dim);">Signal confirmed. Standing by for response.</p>
            <button
              class="btn btn-outline mt-6"
              onclick={() => { state = 'idle'; }}
            >
              Send Another
            </button>
          </div>
        {:else}
          <p id="contact-form-description" class="mb-4 text-sm" style="color: var(--color-text-dim);">
            Fill out the form below and I&apos;ll get back to you shortly.
          </p>
          <form
            onsubmit={handleSubmit}
            class="glow-border iridescent rounded-xl p-8 space-y-6"
            style="background: var(--color-card);"
            aria-describedby="contact-form-description"
            aria-label="Contact form"
            novalidate
          >
            <!-- Honeypot — hidden from real users -->
            <input
              type="text"
              name="_honey"
              bind:value={form._honey}
              tabindex="-1"
              autocomplete="off"
              aria-hidden="true"
              aria-label="Leave this field blank"
              style="position: absolute; left: -9999px; opacity: 0; height: 0;"
            />

            <!-- Phosphor — terminal-style monospace contact fields -->
            <!-- Name + Company row -->
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <!-- Name -->
              <div>
                <label for="contact-name" class="block text-xs font-mono uppercase tracking-widest mb-2" style="color: var(--color-text-dim);">
                  Name <span style="color: var(--color-red);">*</span>
                </label>
                <div class="terminal-field" class:terminal-field-error={Boolean(fieldErrors.name)}>
                  <span class="terminal-prompt" aria-hidden="true">&gt;</span>
                  <input
                    id="contact-name"
                    type="text"
                    bind:value={form.name}
                    required
                    autocomplete="name"
                    aria-invalid={fieldErrors.name ? 'true' : 'false'}
                    placeholder="Jane Smith"
                    class="terminal-input"
                  />
                </div>
                {#if fieldErrors.name}
                  <p role="alert" class="mt-1 text-xs" style="color: var(--color-red);">{fieldErrors.name}</p>
                {/if}
              </div>

              <!-- Company -->
              <div>
                <label for="contact-company" class="block text-xs font-mono uppercase tracking-widest mb-2" style="color: var(--color-text-dim);">
                  Company
                </label>
                <div class="terminal-field">
                  <span class="terminal-prompt" aria-hidden="true">&gt;</span>
                  <input
                    id="contact-company"
                    type="text"
                    bind:value={form.company}
                    autocomplete="organization"
                    placeholder="Acme Corp (optional)"
                    class="terminal-input"
                  />
                </div>
              </div>
            </div>

            <!-- Email -->
            <div>
              <label for="contact-email" class="block text-xs font-mono uppercase tracking-widest mb-2" style="color: var(--color-text-dim);">
                Email <span style="color: var(--color-red);">*</span>
              </label>
              <div class="terminal-field" class:terminal-field-error={Boolean(fieldErrors.email)}>
                <span class="terminal-prompt" aria-hidden="true">&gt;</span>
                <input
                  id="contact-email"
                  type="email"
                  bind:value={form.email}
                  required
                  autocomplete="email"
                  inputmode="email"
                  aria-invalid={fieldErrors.email ? 'true' : 'false'}
                  placeholder="jane@company.com"
                  class="terminal-input"
                />
              </div>
              {#if fieldErrors.email}
                <p role="alert" class="mt-1 text-xs" style="color: var(--color-red);">{fieldErrors.email}</p>
              {/if}
            </div>

            <!-- Message -->
            <div>
              <label for="contact-message" class="block text-xs font-mono uppercase tracking-widest mb-2" style="color: var(--color-text-dim);">
                Message <span style="color: var(--color-red);">*</span>
              </label>
              <div class="terminal-field terminal-field-multiline" class:terminal-field-error={Boolean(fieldErrors.message)}>
                <span class="terminal-prompt terminal-prompt-multiline" aria-hidden="true">&gt;</span>
                <textarea
                  id="contact-message"
                  bind:this={messageField}
                  bind:value={form.message}
                  required
                  rows={5}
                  aria-invalid={fieldErrors.message ? 'true' : 'false'}
                  placeholder="Tell me about your consulting or architecture design needs, timeline, and budget..."
                  class="terminal-input terminal-input-textarea"
                ></textarea>
              </div>
              {#if fieldErrors.message}
                <p role="alert" class="mt-1 text-xs" style="color: var(--color-red);">{fieldErrors.message}</p>
              {/if}
            </div>

            <!-- Error message -->
            {#if state === 'error'}
              <div
                role="alert"
                class="rounded-lg p-3 text-sm"
                style="background: rgba(255,45,85,0.08); border: 1px solid rgba(255,45,85,0.3); color: var(--color-red);"
              >
                ERR // {errorMessage}
              </div>
            {/if}

            <!-- Submit -->
            <button
              type="submit"
              disabled={state === 'submitting'}
              class="btn btn-primary w-full justify-center submit-cta"
              style="opacity: {state === 'submitting' ? 0.7 : 1}; cursor: {state === 'submitting' ? 'not-allowed' : 'pointer'};"
              aria-busy={state === 'submitting'}
            >
              {#if state === 'submitting'}
                <span class="animate-spin">⟳</span> TRANSMITTING...
              {:else}
                [ TRANSMIT ]
              {/if}
            </button>
          </form>
        {/if}
      </div>
    </div>

    {#if isCalendlyReady}
      <div class="mt-10 text-center animate-on-scroll">
        <p class="text-sm mb-4" style="color: var(--color-text-dim); font-family: var(--font-mono);">
          // Prefer to talk in real time?
        </p>
        <button
          class="btn btn-red iridescent"
          bind:this={scheduleBtn}
          onclick={openCalendlyModal}
          aria-label="Open booking calendar"
        >
          <span aria-hidden="true">📅</span>
          [ SCHEDULE_SESSION ]
        </button>
      </div>
    {/if}

    <!-- Phosphor — Calendly modal overlay with CRT power-on effect -->
    {#if calendlyModalOpen}
      <div
        class="calendly-modal-backdrop"
        role="dialog"
        aria-modal="true"
        aria-label="Book a session with Jayson Knight"
        onclick={(e) => { if (e.target === e.currentTarget) closeCalendlyModal(); }}
        tabindex="-1"
      >
        <div class="calendly-modal-panel" class:modal-revealed={modalRevealed}>
          <!-- Corner brackets — Phosphor motif -->
          <div class="modal-corners" aria-hidden="true">
            <svg class="corner tl" viewBox="0 0 32 32" fill="none"><path d="M0 16 L0 0 L16 0" stroke="var(--color-cyan)" stroke-width="1.5"/></svg>
            <svg class="corner tr" viewBox="0 0 32 32" fill="none"><path d="M16 0 L32 0 L32 16" stroke="var(--color-cyan)" stroke-width="1.5"/></svg>
            <svg class="corner bl" viewBox="0 0 32 32" fill="none"><path d="M0 16 L0 32 L16 32" stroke="var(--color-cyan)" stroke-width="1.5"/></svg>
            <svg class="corner br" viewBox="0 0 32 32" fill="none"><path d="M16 32 L32 32 L32 16" stroke="var(--color-cyan)" stroke-width="1.5"/></svg>
          </div>

          <!-- Modal header -->
          <div class="modal-header">
            <div class="modal-title">
              <span class="status-dot-small" aria-hidden="true"></span>
              SCHEDULE_SESSION
            </div>
            <button
              class="modal-close"
              bind:this={modalCloseBtn}
              onclick={closeCalendlyModal}
              aria-label="Close booking modal"
            >[ CLOSE ]</button>
          </div>

          <!-- Calendly embed -->
          <div
            bind:this={calendlyInlineContainer}
            class="calendly-embed-container"
            data-url={calendlyEmbedUrl}
          ></div>
        </div>
      </div>
    {/if}
  </div>
</section>

<style>
  .terminal-field {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 6px;
    padding: 0 0.75rem;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
  }

  .terminal-field:focus-within {
    border-color: var(--color-cyan);
    box-shadow: 0 0 0 1px var(--color-cyan), 0 0 8px rgba(0, 212, 255, 0.2);
  }

  .terminal-field-error {
    border-color: var(--color-red);
  }

  .terminal-prompt {
    color: var(--color-cyan);
    font-family: var(--font-mono);
    font-size: 0.85rem;
    user-select: none;
    flex-shrink: 0;
    opacity: 0.7;
  }

  .terminal-input {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    color: var(--color-text);
    font-family: var(--font-mono);
    font-size: 0.875rem;
    padding: 0.75rem 0;
    width: 100%;
  }

  .terminal-input::placeholder {
    color: var(--color-text-ghost);
    opacity: 0.6;
  }

  .terminal-field-multiline {
    align-items: flex-start;
    padding-top: 0.75rem;
  }

  .terminal-prompt-multiline {
    margin-top: 0.05rem;
  }

  .terminal-input-textarea {
    resize: vertical;
    min-height: 120px;
  }

  .submit-cta:hover:not(:disabled) {
    background: linear-gradient(135deg, var(--color-purple, #7b2ff7) 0%, var(--color-pink, #f72585) 100%);
    box-shadow: var(--glow-pink, 0 0 20px rgba(247, 37, 133, 0.4));
  }

  /* Phosphor — Calendly modal */
  .calendly-modal-backdrop {
    position: fixed;
    inset: 0;
    z-index: 8000;
    background: rgba(5, 5, 10, 0.85);
    backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    animation: modal-backdrop-in 250ms ease forwards;
  }

  .calendly-modal-panel {
    position: relative;
    width: 100%;
    max-width: 720px;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 8px;
    overflow: hidden;
    opacity: 0;
    transform: scaleY(0.015);
    transition: opacity 300ms ease, transform 300ms cubic-bezier(0.23, 1, 0.32, 1);
    box-shadow:
      0 0 0 1px rgba(0, 212, 255, 0.1),
      0 0 40px rgba(0, 212, 255, 0.08),
      0 24px 64px rgba(0, 0, 0, 0.6);
  }

  /* The CRT power-on expand: starts as a thin line, expands to full panel */
  .calendly-modal-panel.modal-revealed {
    opacity: 1;
    transform: scaleY(1);
  }

  .modal-corners {
    position: absolute;
    inset: 8px;
    pointer-events: none;
    z-index: 2;
  }

  .corner {
    position: absolute;
    width: 32px;
    height: 32px;
    opacity: 0.4;
  }
  .corner.tl { top: 0; left: 0; }
  .corner.tr { top: 0; right: 0; }
  .corner.bl { bottom: 0; left: 0; }
  .corner.br { bottom: 0; right: 0; }

  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem 1.25rem;
    border-bottom: 1px solid var(--color-border);
    background: var(--color-card);
  }

  .modal-title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-family: var(--font-mono);
    font-size: 0.7rem;
    letter-spacing: 0.12em;
    color: var(--color-cyan);
    text-transform: uppercase;
  }

  .status-dot-small {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: var(--color-cyan);
    box-shadow: 0 0 4px var(--color-cyan);
    animation: status-pulse 2s ease-in-out infinite;
  }

  .modal-close {
    font-family: var(--font-mono);
    font-size: 0.7rem;
    letter-spacing: 0.08em;
    color: var(--color-text-ghost);
    background: transparent;
    border: 1px solid var(--color-border);
    border-radius: 3px;
    padding: 0.25rem 0.6rem;
    cursor: pointer;
    transition: color 0.2s ease, border-color 0.2s ease;
  }

  .modal-close:hover {
    color: var(--color-cyan);
    border-color: var(--color-cyan-dim);
  }

  .calendly-embed-container {
    min-height: 580px;
    background: var(--color-surface);
  }

  @keyframes modal-backdrop-in {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  @keyframes status-pulse {
    0%, 100% { opacity: 1; box-shadow: 0 0 4px var(--color-cyan); }
    50%       { opacity: 0.5; box-shadow: none; }
  }

  @media (prefers-reduced-motion: reduce) {
    .calendly-modal-backdrop {
      animation: none;
    }
    .calendly-modal-panel,
    .calendly-modal-panel.modal-revealed {
      transition: none;
      opacity: 1;
      transform: scaleY(1);
    }
    .status-dot-small {
      animation: none;
    }
  }
</style>
