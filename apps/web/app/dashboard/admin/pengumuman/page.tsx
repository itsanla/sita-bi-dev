"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import Link from "next/link";

type Pengumuman = {
  id: number;
  judul: string;
  isi: string;
  audiens: string;
  tanggal_dibuat: string;
};

export default function PengumumanPage() {
  const [pengumuman, setPengumuman] = useState<Pengumuman[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPengumuman = async () => {
      try {
        const response = await api<{ data: { data: Pengumuman[] } }>("/pengumuman/all");
        setPengumuman(response.data.data || []);
      } catch (err) {
        setError("Gagal memuat pengumuman");
      } finally {
        setLoading(false);
      }
    };

    fetchPengumuman();
  }, []);

  const handleDelete = async (id: number) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus pengumuman ini?")) {
      try {
        await api(`/pengumuman/${id}`, { method: 'DELETE' });
        setPengumuman(pengumuman.filter((p) => p.id !== id));
      } catch (err) {
        setError("Gagal menghapus pengumuman");
      }
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Manajemen Pengumuman</h1>
      <Link href="/dashboard/admin/pengumuman/create">
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4">
          Buat Pengumuman Baru
        </button>
      </Link>
      <div className="overflow-x-auto relative shadow-md sm:rounded-lg">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th scope="col" className="py-3 px-6">Judul</th>
              <th scope="col" className="py-3 px-6">Audiens</th>
              <th scope="col" className="py-3 px-6">Tanggal Dibuat</th>
              <th scope="col" className="py-3 px-6">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {pengumuman.map((p) => (
              <tr key={p.id} className="bg-white border-b">
                <td className="py-4 px-6 font-medium text-gray-900 whitespace-nowrap">{p.judul}</td>
                <td className="py-4 px-6">{p.audiens}</td>
                <td className="py-4 px-6">
                  {new Date(p.tanggal_dibuat).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                </td>
                <td className="py-4 px-6">
                  <Link href={`/dashboard/admin/pengumuman/edit/${p.id}`}>
                    <button className="font-medium text-blue-600 hover:underline mr-4">Edit</button>
                  </Link>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="font-medium text-red-600 hover:underline"
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
