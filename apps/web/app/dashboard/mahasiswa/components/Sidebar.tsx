'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  FileText,
  MessagesSquare,
  CalendarCheck2,
  Megaphone,
} from 'lucide-react';

// Define navigation items specifically for Mahasiswa
const navItems = [
  { href: '/dashboard/mahasiswa', icon: Home, label: 'Dashboard' },
  { href: '/dashboard/mahasiswa/tugas-akhir', icon: FileText, label: 'Tugas Akhir' },
  { href: '/dashboard/mahasiswa/bimbingan', icon: MessagesSquare, label: 'Bimbingan' },
  { href: '/dashboard/mahasiswa/jadwal-sidang', icon: CalendarCheck2, label: 'Jadwal Sidang' },
  { href: '/dashboard/mahasiswa/pengumuman', icon: Megaphone, label: 'Pengumuman' },
];

// Sub-component for individual navigation links
const NavLink = ({ item }: { item: typeof navItems[0] }) => {
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

// The main Sidebar component
export default function Sidebar() {
  return (
    <aside className="w-64 flex-shrink-0 bg-white border-r border-gray-200/75 p-4 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
        <div className="flex items-center justify-center h-16 border-b mb-4">
            <Link href="/" className="flex items-center gap-2 font-semibold">
                <Home className="h-6 w-6 text-red-800" />
                <span className="text-lg">SITA-BI</span>
            </Link>
        </div>
        <nav>
            <ul className="space-y-1">
            {navItems.map((item) => (
                <NavLink key={item.href} item={item} />
            ))}
            </ul>
        </nav>
    </aside>
  );
}
