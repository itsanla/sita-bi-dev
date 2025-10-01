"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

// --- Type Definitions ---
interface TaByStatus {
  status: string;
  jumlah: number;
}

interface StatistikData {
  totalMahasiswa: number;
  totalDosen: number;
  totalTugasAkhir: number;
  taLulus: number;
  taBimbingan: number;
  taByStatus: TaByStatus[];
}

// --- Stat Card Component ---
const StatCard = ({ title, value }: { title: string; value: string | number }) => (
  <div className="bg-white p-6 rounded-lg shadow-md">
    <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
    <p className="text-3xl font-bold mt-2">{value}</p>
  </div>
);

// --- Main Page Component ---
export default function LaporanPage() {
  const [stats, setStats] = useState<StatistikData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api<{ data: { data: StatistikData } }>("/laporan/statistik");
        setStats(response.data.data);
      } catch {
        setError("Gagal memuat data laporan statistik.");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500 p-4">{error}</div>;
  if (!stats) return <div>Tidak ada data untuk ditampilkan.</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Laporan & Statistik</h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard title="Total Mahasiswa" value={stats.totalMahasiswa} />
        <StatCard title="Total Dosen" value={stats.totalDosen} />
        <StatCard title="Total Tugas Akhir" value={stats.totalTugasAkhir} />
        <StatCard title="TA Lulus & Selesai" value={stats.taLulus} />
        <StatCard title="TA Dalam Bimbingan" value={stats.taBimbingan} />
      </div>

      {/* Details Table */}
      <div>
        <h2 className="text-xl font-bold mb-4">Rincian Status Tugas Akhir</h2>
        <div className="overflow-x-auto relative shadow-md sm:rounded-lg">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th scope="col" className="py-3 px-6">Status</th>
                <th scope="col" className="py-3 px-6">Jumlah</th>
              </tr>
            </thead>
            <tbody>
              {stats.taByStatus.map((item) => (
                <tr key={item.status} className="bg-white border-b">
                  <td className="py-4 px-6 font-medium text-gray-900 whitespace-nowrap">
                    {item.status.replace(/_/g, ' ')}
                  </td>
                  <td className="py-4 px-6">{item.jumlah}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
