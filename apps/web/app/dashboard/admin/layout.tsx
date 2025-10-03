'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import AdminHeader from './components/AdminHeader';
import Footer from '@/app/components/landing-page/Footer'; // Use the original footer
import {
  Home,
  Users,
  ClipboardList,
  FileText,
  Calendar,
  Link2,
  Megaphone,
  BookUser,
} from 'lucide-react';

const navItems = [
  { href: '/dashboard/admin', icon: Home, label: 'Dashboard' },
  { href: '/dashboard/admin/users', icon: Users, label: 'Kelola Pengguna' },
  {
    href: '/dashboard/admin/validasi-ta',
    icon: ClipboardList,
    label: 'Validasi TA',
  },
  { href: '/dashboard/admin/penugasan', icon: BookUser, label: 'Penugasan' },
  {
    href: '/dashboard/admin/jadwal-sidang',
    icon: Calendar,
    label: 'Jadwal Sidang',
  },
  { href: '/dashboard/admin/pengumuman', icon: Megaphone, label: 'Pengumuman' },
  { href: '/dashboard/admin/links', icon: Link2, label: 'Kelola Tautan' },
  { href: '/dashboard/admin/laporan', icon: FileText, label: 'Laporan' },
];

const NavLink = ({ item }: { item: (typeof navItems)[0] }) => {
  const pathname = usePathname();
  const isActive = pathname === item.href;

  return (
    <li>
      <Link
        href={item.href}
        className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-md transition-colors ${
          isActive
            ? 'bg-red-800 text-white shadow-sm'
            : 'text-gray-700 hover:bg-red-50 hover:text-red-800'
        }`}
      >
        <item.icon className="h-5 w-5" />
        <span>{item.label}</span>
      </Link>
    </li>
  );
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();

  if (!user?.roles?.some((role) => role.name === 'admin')) {
    return (
      <div className="flex h-screen items-center justify-center">
        Unauthorized Access
      </div>
    );
  }

  // Dummy function for footer, as it expects a function prop
  const scrollToSection = (id: string) => {
    console.log(
      `Scroll to ${id} requested, but not implemented in this layout.`,
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <AdminHeader />
      <div className="flex flex-1">
        {/* Sidebar Navigation */}
        <aside className="w-72 bg-white border-r border-gray-200/75 p-4">
          <nav>
            <ul className="space-y-1">
              {navItems.map((item) => (
                <NavLink key={item.href} item={item} />
              ))}
            </ul>
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-6 lg:p-10">{children}</main>
      </div>
      <Footer scrollToSection={scrollToSection} />
    </div>
  );
}
