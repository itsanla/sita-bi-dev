import { z } from 'zod';
import { Prodi } from '@prisma/client';

export const loginSchema = z.object({
  identifier: z.string().min(1, 'Identifier tidak boleh kosong'),
  password: z.string().min(1, 'Password tidak boleh kosong'),
});

export type LoginDto = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  nim: z.string().min(1, 'NIM is required'),
  prodi: z.nativeEnum(Prodi),
  angkatan: z.string().min(4, 'Angkatan is required'),
  kelas: z.string().min(1, 'Kelas is required'),
});

export type RegisterDto = z.infer<typeof registerSchema>;

export const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Token is required'),
});

export type VerifyEmailDto = z.infer<typeof verifyEmailSchema>;
