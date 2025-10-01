'use client';

import { ReactNode } from 'react';
import { useAuth } from '../../../context/AuthContext';
import Link from 'next/link';

export default function MahasiswaLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();

  const isMahasiswa = user?.roles.some(role => role.name === 'mahasiswa');
  if (!isMahasiswa) {
    return <div>Unauthorized: Mahasiswa access required.</div>;
  }

  return (
    <div>
      <header>
        <h1>Mahasiswa Dashboard</h1>
        <nav>
          <Link href="/dashboard/mahasiswa">Home</Link> | 
          <Link href="/dashboard/mahasiswa/tugas-akhir">Tugas Akhir</Link> | 
          <Link href="/dashboard/mahasiswa/bimbingan">Bimbingan</Link> | 
          <Link href="/dashboard/mahasiswa/sidang">Pendaftaran Sidang</Link>
        </nav>
        <span>Welcome, {user?.name}</span>
        <button onClick={logout}>Logout</button>
      </header>
      <main>{children}</main>
    </div>
  );
}
