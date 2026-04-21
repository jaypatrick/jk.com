<script lang="ts">
  // Contact.svelte — "TALK TO ME" section
  // Svelte 5 runes, form with client-side Zod validation + fetch to Hono API

  import { openCalendlyPopup } from '$lib/calendly.ts';
  import { contactSchema, type ContactFormData } from '../../lib/schemas';

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

  $effect(() => {
    if (!isCalendlyReady || !calendlyInlineContainer) {
      return;
    }

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
      url: 'https://calendly.com/jaysonknight',
      parentElement: calendlyInlineContainer,
    });
  });
</script>

<section id="contact" class="section-pad" style="background: var(--color-bg);">
  <div class="section-container">

    <!-- Section label -->
    <div class="section-label animate-on-scroll">CONTACT</div>

    <div class="grid grid-cols-1 gap-16 lg:grid-cols-2 items-start">

      <!-- Left: Info -->
      <div class="animate-on-scroll">
        <h2 class="text-4xl font-bold mb-6 lg:text-5xl" style="font-family: var(--font-heading);">
          Let's Build<br/>
          <span class="gradient-text">Something Great</span>
        </h2>

        <p class="text-lg mb-10" style="color: var(--color-text-dim); line-height: 1.8;">
          Whether you're planning a cloud migration, need an architecture review,
          or want to ship something that's never been built — I'm interested.
        </p>

        <!-- Contact details -->
        <div class="space-y-6 mb-10">
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
            href="https://calendly.com/jaysonknight"
            onclick={openCalendlyPopup}
            class="btn btn-red"
            style="padding: 0.5rem 1.25rem; font-size: 0.8rem;"
          >📅 Book Me</a>
          <a
            href="/blog"
            class="btn btn-outline"
            style="padding: 0.5rem 1.25rem; font-size: 0.8rem;"
          >Blog</a>
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
            <h3 class="text-xl font-bold mb-2" style="font-family: var(--font-heading);">Message Received</h3>
            <p style="color: var(--color-text-dim);">I'll be in touch soon. Thanks for reaching out.</p>
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
            class="glow-border rounded-xl p-8 space-y-6"
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

            <!-- Name + Company row -->
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <!-- Name -->
              <div>
                <label for="contact-name" class="block text-xs font-mono uppercase tracking-widest mb-2" style="color: var(--color-text-dim);">
                  Name <span style="color: var(--color-red);">*</span>
                </label>
                <input
                  id="contact-name"
                  type="text"
                  bind:value={form.name}
                  required
                  autocomplete="name"
                  placeholder="Jane Smith"
                  class="w-full rounded-lg px-4 py-3 text-sm transition-all"
                  style="background: var(--color-surface); border: 1px solid {fieldErrors.name ? 'var(--color-red)' : 'var(--color-border)'}; color: var(--color-text); outline: none;"
                  onfocus={(e) => { (e.currentTarget as HTMLInputElement).style.borderColor = 'var(--color-cyan)'; }}
                  onblur={(e) => { (e.currentTarget as HTMLInputElement).style.borderColor = fieldErrors.name ? 'var(--color-red)' : 'var(--color-border)'; }}
                />
                {#if fieldErrors.name}
                  <p role="alert" class="mt-1 text-xs" style="color: var(--color-red);">{fieldErrors.name}</p>
                {/if}
              </div>

              <!-- Company -->
              <div>
                <label for="contact-company" class="block text-xs font-mono uppercase tracking-widest mb-2" style="color: var(--color-text-dim);">
                  Company
                </label>
                <input
                  id="contact-company"
                  type="text"
                  bind:value={form.company}
                  autocomplete="organization"
                  placeholder="Acme Corp (optional)"
                  class="w-full rounded-lg px-4 py-3 text-sm transition-all"
                  style="background: var(--color-surface); border: 1px solid var(--color-border); color: var(--color-text); outline: none;"
                  onfocus={(e) => { (e.currentTarget as HTMLInputElement).style.borderColor = 'var(--color-cyan)'; }}
                  onblur={(e) => { (e.currentTarget as HTMLInputElement).style.borderColor = 'var(--color-border)'; }}
                />
              </div>
            </div>

            <!-- Email -->
            <div>
              <label for="contact-email" class="block text-xs font-mono uppercase tracking-widest mb-2" style="color: var(--color-text-dim);">
                Email <span style="color: var(--color-red);">*</span>
              </label>
              <input
                id="contact-email"
                type="email"
                bind:value={form.email}
                required
                autocomplete="email"
                placeholder="jane@company.com"
                class="w-full rounded-lg px-4 py-3 text-sm transition-all"
                style="background: var(--color-surface); border: 1px solid {fieldErrors.email ? 'var(--color-red)' : 'var(--color-border)'}; color: var(--color-text); outline: none;"
                onfocus={(e) => { (e.currentTarget as HTMLInputElement).style.borderColor = 'var(--color-cyan)'; }}
                onblur={(e) => { (e.currentTarget as HTMLInputElement).style.borderColor = fieldErrors.email ? 'var(--color-red)' : 'var(--color-border)'; }}
              />
              {#if fieldErrors.email}
                <p role="alert" class="mt-1 text-xs" style="color: var(--color-red);">{fieldErrors.email}</p>
              {/if}
            </div>

            <!-- Message -->
            <div>
              <label for="contact-message" class="block text-xs font-mono uppercase tracking-widest mb-2" style="color: var(--color-text-dim);">
                Message <span style="color: var(--color-red);">*</span>
              </label>
              <textarea
                id="contact-message"
                bind:value={form.message}
                required
                rows={5}
                placeholder="Tell me about your consulting or architecture design needs, timeline, and budget..."
                class="w-full rounded-lg px-4 py-3 text-sm resize-vertical transition-all"
                style="background: var(--color-surface); border: 1px solid {fieldErrors.message ? 'var(--color-red)' : 'var(--color-border)'}; color: var(--color-text); outline: none; min-height: 120px;"
                onfocus={(e) => { (e.currentTarget as HTMLTextAreaElement).style.borderColor = 'var(--color-cyan)'; }}
                onblur={(e) => { (e.currentTarget as HTMLTextAreaElement).style.borderColor = fieldErrors.message ? 'var(--color-red)' : 'var(--color-border)'; }}
              ></textarea>
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
                {errorMessage}
              </div>
            {/if}

            <!-- Submit -->
            <button
              type="submit"
              disabled={state === 'submitting'}
              class="btn btn-primary w-full justify-center"
              style="opacity: {state === 'submitting' ? 0.7 : 1}; cursor: {state === 'submitting' ? 'not-allowed' : 'pointer'};"
              aria-busy={state === 'submitting'}
            >
              {#if state === 'submitting'}
                <span class="animate-spin">⟳</span> Sending...
              {:else}
                Send Message →
              {/if}
            </button>
          </form>
        {/if}
      </div>
    </div>

    {#if isCalendlyReady}
      <div class="mt-16 animate-on-scroll visible">
        <div class="section-label mb-6" style="color: var(--color-cyan);">BOOK DIRECTLY</div>
        <div
          bind:this={calendlyInlineContainer}
          class="calendly-inline-widget rounded-xl"
          data-url="https://calendly.com/jaysonknight"
          style="min-width:320px;height:630px;background: var(--color-card); border: 1px solid var(--color-border);"
        ></div>
      </div>
    {/if}
  </div>
</section>
