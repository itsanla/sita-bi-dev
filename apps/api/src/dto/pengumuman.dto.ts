import { z } from 'zod';
import { AudiensPengumuman } from '@repo/db';

export const createPengumumanSchema = z.object({
  judul: z.string().min(1, 'Judul cannot be empty'),
  isi: z.string().min(1, 'Isi cannot be empty'),
  audiens: z.enum([
    AudiensPengumuman.guest,
    AudiensPengumuman.registered_users,
    AudiensPengumuman.all_users,
    AudiensPengumuman.dosen,
    AudiensPengumuman.mahasiswa,
  ]),
});

export type CreatePengumumanDto = z.infer<typeof createPengumumanSchema>;

export const updatePengumumanSchema = createPengumumanSchema.partial();

export type UpdatePengumumanDto = z.infer<typeof updatePengumumanSchema>;
