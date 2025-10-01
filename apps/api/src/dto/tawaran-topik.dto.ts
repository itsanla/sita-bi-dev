import { z } from 'zod';

export const createTawaranTopikSchema = z.object({
  judul_topik: z.string().min(1, 'Judul topik cannot be empty'),
  deskripsi: z.string().min(1, 'Deskripsi cannot be empty'),
  kuota: z.number().int('Kuota must be an integer').min(1, 'Kuota must be at least 1'),
});

export type CreateTawaranTopikDto = z.infer<typeof createTawaranTopikSchema>;
