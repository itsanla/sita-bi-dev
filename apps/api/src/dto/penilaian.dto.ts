import { z } from 'zod';

export const createPenilaianSchema = z.object({
  sidang_id: z.number().int('sidang_id must be an integer'),
  aspek: z.string().min(1, 'Aspek cannot be empty'),
  skor: z.number().min(0, 'Skor must be at least 0').max(100, 'Skor must be at most 100'),
  komentar: z.string().min(1, 'Komentar cannot be empty'),
});

export type CreatePenilaianDto = z.infer<typeof createPenilaianSchema>;
