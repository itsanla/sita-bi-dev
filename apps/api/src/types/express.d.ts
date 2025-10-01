import { Role } from './roles';

interface DosenProfile {
  id: number;
  nidn: string;
  // Add other dosen properties if needed
}

interface MahasiswaProfile {
  id: number;
  nim: string;
  // Add other mahasiswa properties if needed
}

declare global {
  namespace Express {
    interface User {
      id: number;
      email: string;
      role: Role;
      dosen?: DosenProfile;
      mahasiswa?: MahasiswaProfile;
      // Add other user properties if needed
    }

    interface Request {
      user?: User;
    }
  }
}