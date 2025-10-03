import { z } from 'zod';
import { Prodi } from '@prisma/client';

export const loginSchema = z.object({
  identifier: z.string().min(1, 'Identifier tidak boleh kosong'),
  password: z.string().min(1, 'Password tidak boleh kosong'),
});

export type LoginDto = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  phone_number: z.string().min(1, 'Phone number is required'),
  nim: z.string().min(1, 'NIM is required'),
  prodi: z.enum([Prodi.D3, Prodi.D4]),
  kelas: z.string().min(1, 'Kelas is required'),
});

export type RegisterDto = z.infer<typeof registerSchema>;

export const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Token is required'),
});

export type VerifyEmailDto = z.infer<typeof verifyEmailSchema>;
