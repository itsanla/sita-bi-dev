import { z } from 'zod';
import { AudiensPengumuman } from '@prisma/client';

export const createPengumumanSchema = z.object({
  judul: z.string().min(1, 'Judul cannot be empty'),
  isi: z.string().min(1, 'Isi cannot be empty'),
  audiens: z.enum(Object.values(AudiensPengumuman)),
});

export type CreatePengumumanDto = z.infer<typeof createPengumumanSchema>;

export const updatePengumumanSchema = createPengumumanSchema.partial();

export type UpdatePengumumanDto = z.infer<typeof updatePengumumanSchema>;
