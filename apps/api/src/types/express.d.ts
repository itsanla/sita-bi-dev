import { Role } from '../middlewares/auth.middleware';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
        role: Role;
        dosen?: {
          id: number;
          nidn: string;
        } | null;
        mahasiswa?: {
          id: number;
          nim: string;
        } | null;
        phone_number?: string;
      };
    }
  }
}

export {};
