'use client';

import React, { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import request from '@/lib/api';
import { Save, ArrowLeft, Loader } from 'lucide-react';

const audienceOptions = [
  'guest',
  'registered_users',
  'all_users',
  'dosen',
  'mahasiswa',
];

export default function CreatePengumumanPage() {
  const [judul, setJudul] = useState('');
  const [isi, setIsi] = useState('');
  const [audiens, setAudiens] = useState('all_users');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await request('/pengumuman', {
        method: 'POST',
        body: { judul, isi, audiens },
      });
      alert('Pengumuman berhasil dibuat!');
      router.push('/dashboard/admin/pengumuman');
    } catch (err: any) {
      setError(err.message || 'Gagal membuat pengumuman');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Buat Pengumuman Baru</h1>
        <Link
          href="/dashboard/admin/pengumuman"
          className="flex items-center text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Kembali ke Daftar
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-8 space-y-6">
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        )}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Judul Pengumuman
          </label>
          <input
            type="text"
            id="title"
            value={judul}
            onChange={(e) => setJudul(e.target.value)}
            placeholder="Masukkan judul pengumuman..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-800"
            required
          />
        </div>

        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
            Isi Pengumuman
          </label>
          <textarea
            id="content"
            rows={10}
            value={isi}
            onChange={(e) => setIsi(e.target.value)}
            placeholder="Tulis isi pengumuman di sini..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-800"
            required
          ></textarea>
        </div>

        <div>
          <label htmlFor="audience" className="block text-sm font-medium text-gray-700 mb-1">
            Audiens
          </label>
          <select 
            id="audience" 
            value={audiens}
            onChange={(e) => setAudiens(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-800"
          >
            {audienceOptions.map(opt => (
              <option key={opt} value={opt} className="capitalize">
                {opt.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center bg-red-800 text-white px-6 py-3 rounded-lg hover:bg-red-900 transition-colors duration-200 disabled:bg-gray-400 shadow-sm"
          >
            {loading ? <Loader className="w-5 h-5 mr-2 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
            {loading ? 'Menerbitkan...' : 'Terbitkan Pengumuman'}
          </button>
        </div>
      </form>
    </div>
  );
}