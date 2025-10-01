import { z } from 'zod';

export const updateProfileSchema = z.object({
  name: z.string().optional(),
  password: z.string().min(8, 'Password must be at least 8 characters long').optional(),
});

export type UpdateProfileDto = z.infer<typeof updateProfileSchema>;
