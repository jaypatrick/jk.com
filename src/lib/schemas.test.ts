import { describe, expect, it } from 'vitest';
import { apiResponseSchema, contactSchema } from './schemas';

describe('contactSchema', () => {
  it('parses and normalizes valid payloads', () => {
    const parsed = contactSchema.parse({
      name: '  Jayson Knight  ',
      email: '  TEST@EXAMPLE.COM  ',
      company: '  JK  ',
      message: '  This is a valid contact message.  ',
    });

    expect(parsed).toEqual({
      name: 'Jayson Knight',
      email: 'test@example.com',
      company: 'JK',
      message: 'This is a valid contact message.',
    });
  });

  it('rejects populated honeypot field', () => {
    const result = contactSchema.safeParse({
      name: 'Jayson Knight',
      email: 'test@example.com',
      message: 'This is a valid contact message.',
      _honey: 'bot',
    });

    expect(result.success).toBe(false);
  });
});

describe('apiResponseSchema', () => {
  it('accepts success and error responses', () => {
    expect(
      apiResponseSchema.parse({
        success: true,
        message: 'ok',
      })
    ).toEqual({ success: true, message: 'ok' });

    expect(
      apiResponseSchema.parse({
        success: false,
        error: 'Validation failed',
        details: ['Name must be at least 2 characters'],
      })
    ).toEqual({
      success: false,
      error: 'Validation failed',
      details: ['Name must be at least 2 characters'],
    });
  });
});
