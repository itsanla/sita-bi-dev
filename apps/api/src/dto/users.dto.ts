import { z } from 'zod';
import { Prodi } from '@prisma/client';
import { Role } from '../types/roles';

const validRoles = [Role.kajur, Role.kaprodi_d3, Role.kaprodi_d4, Role.dosen];

export const createDosenSchema = z.object({
  name: z.string().min(1, 'Name cannot be empty'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  nidn: z.string().min(1, 'NIDN cannot be empty'),
  roles: z.array(z.nativeEnum(Role)).optional().refine(roles => {
    if (roles) {
      return roles.every(role => validRoles.includes(role));
    }
    return true;
  }, { message: `Invalid role(s). Valid roles are: ${validRoles.join(', ')}` }),
});

export type CreateDosenDto = z.infer<typeof createDosenSchema>;

export const updateDosenSchema = z.object({
  name: z.string().optional(),
  email: z.string().email('Invalid email format').optional(),
  password: z.string().min(8, 'Password must be at least 8 characters long').optional(),
  nidn: z.string().optional(),
  roles: z.array(z.nativeEnum(Role)).optional().refine(roles => {
    if (roles) {
      return roles.every(role => validRoles.includes(role));
    }
    return true;
  }, { message: `Invalid role(s). Valid roles are: ${validRoles.join(', ')}` }),
});

export type UpdateDosenDto = z.infer<typeof updateDosenSchema>;

export const updateMahasiswaSchema = z.object({
  name: z.string().optional(),
  email: z.string().email('Invalid email format').optional(),
  password: z.string().min(8, 'Password must be at least 8 characters long').optional(),
  nim: z.string().optional(),
  prodi: z.nativeEnum(Prodi).optional(),
  angkatan: z.string().optional(),
  kelas: z.string().optional(),
});

export type UpdateMahasiswaDto = z.infer<typeof updateMahasiswaSchema>;
