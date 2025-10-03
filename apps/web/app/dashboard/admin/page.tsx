import React from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Users,
  Megaphone,
  Calendar,
  ArrowRight,
  LucideIcon,
} from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
}

const StatCard = ({ title, value, icon: Icon }: StatCardProps) => (
  <div className="bg-white border border-gray-200/75 rounded-xl p-6 flex items-center shadow-sm">
    <div className="p-3 bg-maroon-50 rounded-lg mr-4">
      <Icon className="w-7 h-7 text-maroon-600" />
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  </div>
);

interface QuickAccessLinkProps {
  title: string;
  description: string;
  href: string;
}

const QuickAccessLink = ({
  title,
  description,
  href,
}: QuickAccessLinkProps) => (
  <Link
    href={href}
    className="group block p-6 bg-white rounded-xl border border-gray-200/75 hover:shadow-lg hover:border-maroon-300 transition-all duration-300 hover:-translate-y-1"
  >
    <h3 className="text-lg font-bold text-maroon-800 mb-2 group-hover:text-maroon-600 transition-colors">
      {title}
    </h3>
    <p className="text-gray-600 text-sm mb-4">{description}</p>
    <span className="font-semibold text-sm text-maroon-700 flex items-center group-hover:text-maroon-500 transition-colors">
      Lanjutkan{' '}
      <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
    </span>
  </Link>
);

export default function AdminDashboardPage() {
  return (
    <div className="container mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard Admin</h1>
        <p className="text-gray-500 mt-1">
          Selamat datang! Kelola semua aspek sistem dari satu tempat.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatCard title="Total Pengguna" value="1,250" icon={Users} />
        <StatCard title="Tugas Akhir Aktif" value="320" icon={BookOpen} />
        <StatCard title="Pengumuman Terbit" value="42" icon={Megaphone} />
        <StatCard title="Sidang Terjadwal" value="18" icon={Calendar} />
      </div>

      <div>
        <h2 className="text-xl font-semibold text-gray-700 mb-6">
          Akses Cepat
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <QuickAccessLink
            title="Buat Pengumuman Baru"
            description="Publikasikan informasi penting untuk semua pengguna."
            href="/dashboard/admin/pengumuman/create"
          />
          <QuickAccessLink
            title="Validasi Tugas Akhir"
            description="Tinjau dan setujui pengajuan tugas akhir mahasiswa."
            href="/dashboard/admin/validasi-ta"
          />
          <QuickAccessLink
            title="Jadwalkan Sidang"
            description="Atur dan publikasikan jadwal sidang baru."
            href="/dashboard/admin/jadwal-sidang"
          />
        </div>
      </div>
    </div>
  );
}
