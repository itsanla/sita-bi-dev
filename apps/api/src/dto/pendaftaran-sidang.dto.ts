import { z } from 'zod';

export const rejectPendaftaranSchema = z.object({
  catatan: z.string().min(1, 'Catatan cannot be empty'),
});

export type RejectPendaftaranDto = z.infer<typeof rejectPendaftaranSchema>;
