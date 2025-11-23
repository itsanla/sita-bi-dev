'use client';

import React, { useState, useEffect, FormEvent } from 'react';
import request from '@/lib/api';
import { Search, UserPlus, Loader, Info, X } from 'lucide-react';

// --- Interfaces ---
interface TugasAkhir {
  id: number;
  judul: string;
  mahasiswa: {
    user: { name: string };
  };
}

interface Dosen {
  id: number;
  name: string;
  // We only need id and name for the select options
}

// --- Main Page Component ---
export default function PenugasanPage() {
  const [unassignedTAs, setUnassignedTAs] = useState<TugasAkhir[]>([]);
  const [allDosen, setAllDosen] = useState<Dosen[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTA, setSelectedTA] = useState<TugasAkhir | null>(null);
  const [pembimbing1Id, setPembimbing1Id] = useState<string>('');
  const [pembimbing2Id, setPembimbing2Id] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const [taRes, dosenRes] = await Promise.all([
        request<{ data: { data: TugasAkhir[] } }>('/penugasan/unassigned'),
        request<{ data: { data: Dosen[] } }>('/users/dosen'),
      ]);
      setUnassignedTAs(taRes.data.data || []);
      setAllDosen(dosenRes.data.data || []);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'Failed to fetch data');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (ta: TugasAkhir) => {
    setSelectedTA(ta);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTA(null);
    setPembimbing1Id('');
    setPembimbing2Id('');
  };

  const handleAssignSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedTA || !pembimbing1Id) {
      alert('Please select at least Supervisor 1.');
      return;
    }
    setIsSubmitting(true);
    try {
      await request(`/penugasan/${selectedTA.id}/assign`, {
        method: 'POST',
        body: JSON.stringify({
          pembimbing1Id: Number(pembimbing1Id),
          pembimbing2Id: pembimbing2Id ? Number(pembimbing2Id) : undefined,
        }),
      });
      alert('Supervisors assigned successfully!');
      handleCloseModal();
      fetchData();
    } catch (err: unknown) {
      if (err instanceof Error) {
        alert(`Error: ${err.message}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-10">
        <Loader className="animate-spin text-maroon-700" size={32} />
        <span className="ml-4 text-lg text-gray-600">Loading data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md">
        <p className="font-bold">Error</p>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Penugasan Dosen</h1>
      </div>

      <div className="mb-6 flex items-center">
        <div className="relative w-full max-w-md">
          <input
            type="text"
            placeholder="Cari mahasiswa atau judul TA..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-800"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Mahasiswa
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {unassignedTAs.length > 0 ? (
              unassignedTAs.map((ta) => (
                <tr key={ta.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {ta.mahasiswa.user.name}
                    </div>
                    <div className="text-sm text-gray-500 truncate max-w-md">
                      {ta.judul}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleOpenModal(ta)}
                      className="inline-flex items-center text-red-800 hover:text-red-900 font-semibold"
                    >
                      <UserPlus className="w-5 h-5 mr-1" />
                      Tugaskan Pembimbing
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={2} className="text-center py-10 text-gray-500">
                  <Info size={32} className="mx-auto mb-2" />
                  Tidak ada Tugas Akhir yang perlu penugasan saat ini.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Assignment Modal */}
      {isModalOpen && selectedTA ? (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">
                Tugaskan Pembimbing
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-500 hover:text-gray-800"
              >
                <X size={24} />
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-1">
              Mahasiswa:{' '}
              <span className="font-semibold">
                {selectedTA.mahasiswa.user.name}
              </span>
            </p>
            <p className="text-sm text-gray-600 mb-6">
              Judul: <span className="font-semibold">{selectedTA.judul}</span>
            </p>

            <form onSubmit={handleAssignSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="pembimbing1"
                  className="block text-sm font-medium text-gray-700"
                >
                  Pembimbing 1
                </label>
                <select
                  id="pembimbing1"
                  value={pembimbing1Id}
                  onChange={(e) => setPembimbing1Id(e.target.value)}
                  required
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-red-800 focus:border-red-800 sm:text-sm rounded-md"
                >
                  <option value="" disabled>
                    -- Pilih Dosen --
                  </option>
                  {allDosen.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="pembimbing2"
                  className="block text-sm font-medium text-gray-700"
                >
                  Pembimbing 2 (Opsional)
                </label>
                <select
                  id="pembimbing2"
                  value={pembimbing2Id}
                  onChange={(e) => setPembimbing2Id(e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-red-800 focus:border-red-800 sm:text-sm rounded-md"
                >
                  <option value="">-- Tidak Ada --</option>
                  {allDosen.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end pt-4 space-x-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-red-800 text-white px-4 py-2 rounded-md hover:bg-red-900 disabled:bg-gray-400"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Penugasan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
