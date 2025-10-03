'use client';
import React, { useState, useEffect } from 'react';
import { Megaphone, AlertCircle } from 'lucide-react';

interface Pengumuman {
  id: number;
  judul: string;
  isi: string;
  createdAt: string;
}

export default function PengumumanPage() {
  const [announcements, setAnnouncements] = useState<Pengumuman[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/pengumuman/public');
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch announcements');
        }

        setAnnouncements(data.data.pengumumans);
      } catch (e) {
        const error = e as Error;
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-6 py-8">
          <h1 className="text-4xl font-extrabold text-gray-900">Pengumuman</h1>
          <p className="text-lg text-gray-600 mt-2">
            Informasi terbaru seputar kegiatan akademik.
          </p>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        {loading ? (
          <div className="text-center">
            <p className="text-lg text-gray-500">Loading announcements...</p>
          </div>
        ) : error ? (
          <div className="text-center py-16 px-6 bg-red-50 rounded-xl shadow-md border border-red-200">
            <AlertCircle size={64} className="mx-auto text-red-500 mb-6" />
            <h2 className="text-2xl font-bold text-red-800 mb-2">
              An Error Occurred
            </h2>
            <p className="text-red-600">{error}</p>
          </div>
        ) : announcements.length > 0 ? (
          <div className="space-y-6">
            {announcements.map((item) => (
              <div key={item.id} className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-2xl font-bold text-maroon mb-2">
                  {item.judul}
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  Dipublikasikan pada {formatDate(item.createdAt)}
                </p>
                <div className="prose max-w-none text-gray-700">
                  <p>{item.isi}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 px-6 bg-white rounded-xl shadow-md">
            <Megaphone size={64} className="mx-auto text-gray-400 mb-6" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Belum Ada Pengumuman
            </h2>
            <p className="text-gray-500">
              Saat ini belum ada pengumuman yang dipublikasikan.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
