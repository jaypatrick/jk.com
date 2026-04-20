import { describe, expect, it, vi } from 'vitest';
import { ALL, POST } from './contact';

const getContext = (request: Request, env?: Partial<CloudflareBindings>) =>
  ({
    request,
    locals: {
      runtime: {
        env: env ?? {},
      },
    },
  }) as Parameters<typeof POST>[0];

describe('POST /api/contact', () => {
  it('returns 400 for invalid JSON body', async () => {
    const response = await POST(
      getContext(new Request('https://example.com/', { method: 'POST', body: '{invalid' }))
    );
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload).toEqual({ success: false, error: 'Invalid JSON body' });
  });

  it('returns 422 for validation errors', async () => {
    const response = await POST(
      getContext(
        new Request('https://example.com/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: 'A', email: 'invalid', message: 'short' }),
        })
      )
    );
    const payload = await response.json();

    expect(response.status).toBe(422);
    expect(payload.success).toBe(false);
    expect(payload.error).toBe('Validation failed');
    expect(payload.details).toEqual(expect.arrayContaining([expect.any(String)]));
  });

  it('returns 200 and logs analytics on valid payloads', async () => {
    const writeDataPoint = vi.fn();

    const response = await POST(
      getContext(
        new Request('https://example.com/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'Jayson Knight',
            email: 'jayson@example.com',
            company: 'JK',
            message: 'I would like to discuss a consulting engagement.',
          }),
        }),
        {
          ANALYTICS: { writeDataPoint } as unknown as AnalyticsEngineDataset,
        }
      )
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toEqual({
      success: true,
      message: "Message received — I'll be in touch soon.",
    });
    expect(writeDataPoint).toHaveBeenCalledWith({
      blobs: ['jayson@example.com', 'JK', 'contact_form'],
      doubles: [1],
      indexes: ['contact_submission'],
    });
  });
});

describe('ALL /api/contact', () => {
  it('returns 405 for unsupported methods', async () => {
    const response = await ALL(getContext(new Request('https://example.com/', { method: 'GET' })));
    const payload = await response.json();

    expect(response.status).toBe(405);
    expect(payload).toEqual({ success: false, error: 'Method not allowed' });
  });
});
