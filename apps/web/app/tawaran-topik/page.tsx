'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { BookOpen, ChevronRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface Dosen {
  nama: string;
}

interface Topic {
  id: number;
  judul_topik: string;
  deskripsi: string;
  kuota: number;
  dosen: Dosen;
}

export default function TawaranTopikPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (authLoading) {
      return; // Wait for auth state to be loaded
    }

    if (!user) {
      setError('You must be logged in to view this page.');
      setLoading(false);
      // Optional: redirect to login
      // window.location.href = '/login';
      return;
    }

    const fetchTopics = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/tawaran-topik/available');

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch topics');
        }

        setTopics(data.data.topics);
      } catch (e) {
        const error = e as Error;
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTopics();
  }, [user, authLoading]);

  return (
    <div className="bg-gray-50 min-h-screen">
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-6 py-8">
          <h1 className="text-4xl font-extrabold text-gray-900">
            Tawaran Topik
          </h1>
          <p className="text-lg text-gray-600 mt-2">
            Temukan topik penelitian yang menarik dan sesuai dengan minat Anda.
          </p>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        {loading || authLoading ? (
          <div className="text-center">
            <p className="text-lg text-gray-500">Loading topics...</p>
          </div>
        ) : error ? (
          <div className="text-center py-16 px-6 bg-red-50 rounded-xl shadow-md border border-red-200">
            <AlertCircle size={64} className="mx-auto text-red-500 mb-6" />
            <h2 className="text-2xl font-bold text-red-800 mb-2">
              An Error Occurred
            </h2>
            <p className="text-red-600">{error}</p>
          </div>
        ) : topics.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {topics.map((topic) => (
              <div
                key={topic.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:-translate-y-2 transition-transform duration-300 group"
              >
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="p-3 bg-maroon-100 rounded-full">
                      <BookOpen className="text-maroon" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm text-gray-500">
                        Kuota: {topic.kuota} Mahasiswa
                      </p>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2 h-24">
                    {topic.judul_topik}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Dosen: {topic.dosen.nama}
                  </p>

                  <Link
                    href={`/tawaran-topik/${topic.id}`}
                    className="w-full bg-maroon text-white font-bold py-3 px-4 rounded-lg hover:bg-maroon-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <span>Lihat Detail & Ajukan</span>
                    <ChevronRight size={20} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 px-6 bg-white rounded-xl shadow-md">
            <BookOpen size={64} className="mx-auto text-gray-400 mb-6" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Belum Ada Topik Tersedia
            </h2>
            <p className="text-gray-500">
              Saat ini belum ada tawaran topik yang tersedia. Silakan cek
              kembali nanti.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
