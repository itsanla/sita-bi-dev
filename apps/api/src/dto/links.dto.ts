import { z } from 'zod';

export const createLinkSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  url: z.url(),
  description: z.string().optional(),
});

export type CreateLinkDto = z.infer<typeof createLinkSchema>;

export const updateLinkSchema = createLinkSchema.partial();

export type UpdateLinkDto = z.infer<typeof updateLinkSchema>;
