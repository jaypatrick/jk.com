// Contact form API endpoint — powered by Hono + Zod 4
// Runs on Cloudflare Workers (workerd runtime)
import { Hono } from 'hono';
import type { APIRoute } from 'astro';
import { contactSchema } from '../../lib/schemas';

const app = new Hono<{ Bindings: CloudflareBindings }>();

app.post('/', async (c) => {
  // Rate limiting hint: add Cloudflare Rate Limiting rule in dashboard
  // or use the CACHE KV binding for simple token-bucket

  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ success: false, error: 'Invalid JSON body' }, 400);
  }

  // Validate with Zod 4
  const result = contactSchema.safeParse(body);
  if (!result.success) {
    const details = result.error.flatten().fieldErrors;
    return c.json(
      {
        success: false,
        error: 'Validation failed',
        details: Object.values(details).flat().filter(Boolean),
      },
      422
    );
  }

  const { name, email, company, message } = result.data;

  // Log to Cloudflare Analytics Engine
  try {
    const analytics = c.env.ANALYTICS;
    if (analytics) {
      analytics.writeDataPoint({
        blobs: [email, company ?? 'n/a', 'contact_form'],
        doubles: [1],
        indexes: ['contact_submission'],
      });
    }
  } catch {
    // Analytics failure is non-fatal
  }

  // TODO: Wire up email delivery (Resend, SendGrid, etc.)
  // For now, log the submission — in production add:
  //
  //   const resend = new Resend(c.env.RESEND_API_KEY);
  //   await resend.emails.send({
  //     from: 'contact@jaysonknight.com',
  //     to: 'jayson.knight@jaysonknight.com',
  //     subject: `Contact from ${name}`,
  //     text: `Name: ${name}\nEmail: ${email}\nCompany: ${company}\n\n${message}`,
  //   });

  console.info('[contact] New submission:', { name, email, company });

  return c.json({ success: true, message: 'Message received — I\'ll be in touch soon.' });
});

// Catch all other methods
app.all('/', (c) => c.json({ success: false, error: 'Method not allowed' }, 405));

// Astro APIRoute — delegate to Hono
export const POST: APIRoute = async ({ request, locals }) => {
  return app.fetch(request, (locals as App.Locals).runtime?.env);
};

export const ALL: APIRoute = async ({ request, locals }) => {
  return app.fetch(request, (locals as App.Locals).runtime?.env);
};
