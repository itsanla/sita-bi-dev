'use client';
import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, Building, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface Sidang {
  id: number;
  tanggal: string;
  waktu_mulai: string;
  waktu_selesai: string;
  ruangan: { nama: string };
  pendaftaranSidang: {
    tugasAkhir: {
      judul: string;
      mahasiswa: { nama: string };
    };
  };
}

export default function JadwalSidangPage() {
  const [schedule, setSchedule] = useState<Sidang[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token, user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (authLoading) {
      return; // Wait for auth state
    }

    if (!token || !user) {
      setError('You must be logged in to view this page.');
      setLoading(false);
      return;
    }

    const endpoint = user.roles?.some((r) => r.name === 'mahasiswa')
      ? '/api/jadwal-sidang/for-mahasiswa'
      : '/api/jadwal-sidang/for-penguji';

    const fetchSchedule = async () => {
      setLoading(true);
      try {
        const response = await fetch(endpoint, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch schedule');
        }

        // The API returns a single object for mahasiswa, and an array for dosen/penguji
        const scheduleData = Array.isArray(data.data)
          ? data.data
          : data.data
            ? [data.data]
            : [];
        setSchedule(scheduleData);
      } catch (e) {
        const error = e as Error;
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, [token, user, authLoading]);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

  return (
    <div className="bg-gray-50 min-h-screen">
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-6 py-8">
          <h1 className="text-4xl font-extrabold text-gray-900">
            Jadwal Sidang
          </h1>
          <p className="text-lg text-gray-600 mt-2">
            Berikut adalah jadwal sidang yang akan datang.
          </p>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        {loading || authLoading ? (
          <div className="text-center">
            <p className="text-lg text-gray-500">Loading schedule...</p>
          </div>
        ) : error ? (
          <div className="text-center py-16 px-6 bg-red-50 rounded-xl shadow-md border border-red-200">
            <AlertCircle size={64} className="mx-auto text-red-500 mb-6" />
            <h2 className="text-2xl font-bold text-red-800 mb-2">
              An Error Occurred
            </h2>
            <p className="text-red-600">{error}</p>
          </div>
        ) : schedule.length > 0 ? (
          <div className="space-y-8">
            {schedule.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-maroon"
              >
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {item.pendaftaranSidang.tugasAkhir.judul}
                </h3>
                <div className="grid md:grid-cols-2 gap-4 text-gray-700">
                  <p className="flex items-center gap-2">
                    <User className="text-maroon" />{' '}
                    {item.pendaftaranSidang.tugasAkhir.mahasiswa.nama}
                  </p>
                  <p className="flex items-center gap-2">
                    <Calendar className="text-maroon" />{' '}
                    {formatDate(item.tanggal)}
                  </p>
                  <p className="flex items-center gap-2">
                    <Clock className="text-maroon" /> {item.waktu_mulai} -{' '}
                    {item.waktu_selesai}
                  </p>
                  <p className="flex items-center gap-2">
                    <Building className="text-maroon" /> {item.ruangan.nama}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 px-6 bg-white rounded-xl shadow-md">
            <Calendar size={64} className="mx-auto text-gray-400 mb-6" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Belum Ada Jadwal Sidang
            </h2>
            <p className="text-gray-500">
              Saat ini belum ada jadwal sidang yang ditetapkan untuk Anda.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
