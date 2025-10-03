'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

type Pengumuman = {
  id: number;
  judul: string;
  isi: string;
  tanggal_dibuat: string;
};

export default function ViewPengumumanPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [pengumuman, setPengumuman] = useState<Pengumuman[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;

    let endpoint = '/pengumuman/public'; // Fallback endpoint

    if (user) {
      const role = user.roles[0]?.name;
      if (role === 'admin') {
        // Admin should manage announcements, not just view them.
        router.replace('/dashboard/admin/pengumuman');
        return;
      } else if (role === 'dosen') {
        endpoint = '/pengumuman/dosen';
      } else if (role === 'mahasiswa') {
        endpoint = '/pengumuman/mahasiswa';
      }
    }

    const fetchPengumuman = async () => {
      try {
        const response = await api<{ data: { data: Pengumuman[] } }>(endpoint);
        setPengumuman(response.data.data || []);
      } catch {
        setError('Gagal memuat pengumuman.');
      } finally {
        setLoading(false);
      }
    };

    fetchPengumuman();
  }, [user, authLoading, router]);

  if (loading || authLoading) return <div>Loading...</div>;
  if (error)
    return <div className="container mx-auto p-4 text-red-500">{error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Pengumuman</h1>
      <div className="space-y-6">
        {pengumuman.length > 0 ? (
          pengumuman.map((p) => (
            <div key={p.id} className="bg-white shadow-md rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-2">{p.judul}</h2>
              <p className="text-sm text-gray-500 mb-4">
                Dipublikasikan pada{' '}
                {new Date(p.tanggal_dibuat).toLocaleDateString('id-ID', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
              <div className="prose max-w-none">
                <p>{p.isi}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500">
            <p>Tidak ada pengumuman saat ini.</p>
          </div>
        )}
      </div>
    </div>
  );
}
