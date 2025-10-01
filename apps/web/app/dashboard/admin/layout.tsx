'use client';

import { ReactNode } from 'react';
import { useAuth } from '../../../context/AuthContext';
import Link from 'next/link';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();

  // Optional: Add a check to ensure only admins can see this layout
  const isAdmin = user?.roles.some(role => role.name === 'admin');
  if (!isAdmin) {
    return <div>Unauthorized</div>; // Or redirect
  }

  return (
    <div>
      <header>
        <h1>Admin Dashboard</h1>
        <nav>
          <Link href="/dashboard/admin">Home</Link> | 
          <Link href="/dashboard/admin/users">Manage Users</Link> | 
          {/* Add other admin links here */}
        </nav>
        <span>Welcome, {user?.name}</span>
        <button onClick={logout}>Logout</button>
      </header>
      <main>{children}</main>
    </div>
  );
}
