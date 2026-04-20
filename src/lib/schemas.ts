import { z } from 'zod';

// Contact form schema — used in both the Svelte component and Hono API
export const contactSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name is too long')
    .trim(),
  email: z.email('Please enter a valid email address').toLowerCase().trim(),
  company: z.string().max(100).trim().optional(),
  message: z
    .string()
    .min(10, 'Message must be at least 10 characters')
    .max(2000, 'Message is too long')
    .trim(),
  // Honeypot — should remain empty (bot detection)
  _honey: z.string().max(0, 'Bot detected').optional(),
});

export type ContactFormData = z.infer<typeof contactSchema>;

// API response types
export const apiResponseSchema = z.discriminatedUnion('success', [
  z.object({ success: z.literal(true), message: z.string() }),
  z.object({ success: z.literal(false), error: z.string(), details: z.array(z.string()).optional() }),
]);

export type ApiResponse = z.infer<typeof apiResponseSchema>;
