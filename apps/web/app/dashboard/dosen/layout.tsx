'use client';

import { ReactNode } from 'react';
import { useAuth } from '../../../context/AuthContext';
import Link from 'next/link';

export default function DosenLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();

  const isDosen = user?.roles.some(role => role.name === 'dosen');
  if (!isDosen) {
    return <div>Unauthorized: Dosen access required.</div>;
  }

  return (
    <div>
      <header>
        <h1>Dosen Dashboard</h1>
        <nav>
          <Link href="/dashboard/dosen">Home</Link> | 
          <Link href="/dashboard/dosen/bimbingan">Bimbingan</Link> | 
          <Link href="/dashboard/dosen/tawaran-topik">Tawaran Topik</Link> | 
          <Link href="/dashboard/dosen/sidang-approvals">Persetujuan Sidang</Link> | 
          <Link href="/dashboard/dosen/penilaian">Penilaian</Link>
        </nav>
        <span>Welcome, {user?.name}</span>
        <button onClick={logout}>Logout</button>
      </header>
      <main>{children}</main>
    </div>
  );
}
