import type { Role } from '@repo/types';

declare namespace Express {
  export interface Request {
    user?: {
      id: number;
      email: string;
      role: Role;
      dosen?: {
        id: number;
        nidn: string;
      };
      mahasiswa?: {
        id: number;
        nim: string;
      };
    };
  }
}
