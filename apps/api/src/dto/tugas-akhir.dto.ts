import { z } from 'zod';

export const createTugasAkhirSchema = z.object({
  judul: z.string().min(1, 'Judul cannot be empty'),
  force: z.boolean().optional(),
});

export type CreateTugasAkhirDto = z.infer<typeof createTugasAkhirSchema>;

export const rejectTugasAkhirSchema = z.object({
  alasan_penolakan: z
    .string()
    .min(1, 'Alasan penolakan cannot be empty')
    .max(500, 'Alasan penolakan cannot exceed 500 characters'),
});

export type RejectTugasAkhirDto = z.infer<typeof rejectTugasAkhirSchema>;
