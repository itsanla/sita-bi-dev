// apps/web/types/index.ts

export interface User {
  id: string;
  nama: string;
  email: string;
  nim?: string;
  nidn?: string;
  roles: { id: number; name: string }[];
}

export interface ApiResponse<T = null> {
  status: 'sukses' | 'gagal';
  message: string;
  data: T;
}
