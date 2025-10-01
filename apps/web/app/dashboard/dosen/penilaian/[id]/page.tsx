"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/api';

interface Nilai {
  id: number;
  aspek: string;
  skor: number;
  komentar: string | null;
  dosen: {
    user: {
      name: string;
    }
  }
}

interface SidangDetails {
  id: number;
  tugasAkhir: {
    judul: string;
    mahasiswa: {
      user: {
        name: string;
      }
    }
  };
  nilaiSidang: Nilai[];
}

export default function PenilaianDetailsPage() {
  const params = useParams();
  const id = params.id as string;
  const [sidang, setSidang] = useState<SidangDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      const fetchDetails = async () => {
        try {
          setLoading(true);
          const response = await api<{ data: { data: SidangDetails } }>(`/penilaian/sidang/${id}`);
          setSidang(response.data.data);
        } catch (err) {
          setError('Gagal memuat detail penilaian.');
        } finally {
          setLoading(false);
        }
      };
      fetchDetails();
    }
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!sidang) return <div>Data penilaian tidak ditemukan.</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Detail Penilaian Sidang</h1>
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold">{sidang.tugasAkhir.judul}</h2>
        <p className="text-gray-600">Mahasiswa: {sidang.tugasAkhir.mahasiswa.user.name}</p>
      </div>

      <h3 className="text-xl font-bold mb-4">Hasil Penilaian</h3>
      <div className="space-y-4">
        {sidang.nilaiSidang.length > 0 ? (
          sidang.nilaiSidang.map(nilai => (
            <div key={nilai.id} className="bg-white shadow-md rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold">{nilai.aspek}</p>
                  <p className="text-sm text-gray-500">Oleh: {nilai.dosen.user.name}</p>
                </div>
                <p className="text-lg font-bold text-blue-600">{nilai.skor}</p>
              </div>
              {nilai.komentar && (
                <p className="mt-2 text-sm text-gray-700 bg-gray-50 p-2 rounded">
                  <strong>Komentar:</strong> {nilai.komentar}
                </p>
              )}
            </div>
          ))
        ) : (
          <p>Belum ada penilaian yang masuk untuk sidang ini.</p>
        )}
      </div>
    </div>
  );
}