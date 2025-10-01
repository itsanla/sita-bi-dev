"use client";

import { useEffect, useState, FormEvent } from "react";
import api from "@/lib/api";

// --- Type Definitions ---
interface UnassignedTA {
  id: number;
  judul: string;
  mahasiswa: {
    user: { name: string; };
    nim: string;
  };
}

interface Dosen {
  id: number;
  user: { name: string; };
}

// --- Modal Component ---
const AssignPembimbingModal = ({
  isOpen,
  onClose,
  onSave,
  tugasAkhir,
  dosenList,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  tugasAkhir: UnassignedTA | null;
  dosenList: Dosen[];
}) => {
  const [pembimbing1Id, setPembimbing1Id] = useState<number | string>("");
  const [pembimbing2Id, setPembimbing2Id] = useState<number | string>("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setPembimbing1Id("");
    setPembimbing2Id("");
    setError(null);
  }, [tugasAkhir, isOpen]);

  if (!isOpen || !tugasAkhir) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!pembimbing1Id) {
      setError("Pembimbing 1 harus dipilih.");
      return;
    }
    setSubmitting(true);
    setError(null);

    const assignmentData: { pembimbing1_id: number; pembimbing2_id?: number } = {
      pembimbing1_id: Number(pembimbing1Id),
    };

    if (pembimbing2Id) {
      assignmentData.pembimbing2_id = Number(pembimbing2Id);
    }

    try {
      await api(`/penugasan/${tugasAkhir.id}/assign`, { method: 'POST', body: assignmentData });
      onSave();
      onClose();
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Gagal menugaskan pembimbing.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg">
        <h2 className="text-xl font-bold mb-4">Tugaskan Pembimbing</h2>
        <p className="mb-6">Untuk: <span className="font-semibold">{tugasAkhir.mahasiswa.user.name} - {tugasAkhir.judul}</span></p>
        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Pembimbing 1</label>
            <select value={pembimbing1Id} onChange={e => setPembimbing1Id(Number(e.target.value))} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
              <option value="" disabled>Pilih Dosen</option>
              {dosenList.map(d => <option key={d.id} value={d.id}>{d.user.name}</option>)}
            </select>
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700">Pembimbing 2 (Opsional)</label>
            <select value={pembimbing2Id} onChange={e => setPembimbing2Id(Number(e.target.value))} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
              <option value="">Tidak Ada</option>
              {dosenList.map(d => <option key={d.id} value={d.id}>{d.user.name}</option>)}
            </select>
          </div>
          <div className="flex justify-end gap-4">
            <button type="button" onClick={onClose} className="bg-gray-200 py-2 px-4 rounded-lg">Batal</button>
            <button type="submit" disabled={submitting} className="bg-blue-600 text-white py-2 px-4 rounded-lg disabled:bg-blue-300">
              {submitting ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- Main Page Component ---
export default function PenugasanPage() {
  const [unassignedTAs, setUnassignedTAs] = useState<UnassignedTA[]>([]);
  const [dosenList, setDosenList] = useState<Dosen[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTA, setSelectedTA] = useState<UnassignedTA | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [taResponse, dosenResponse] = await Promise.all([
        api<{ data: { data: UnassignedTA[] } }>("/penugasan/unassigned"),
        api<{ data: { data: Dosen[] } }>("/users/dosen"),
      ]);
      setUnassignedTAs(taResponse.data.data || []);
      setDosenList(dosenResponse.data.data || []);
    } catch {
      setError("Gagal memuat data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (ta: UnassignedTA) => {
    setSelectedTA(ta);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedTA(null);
    setIsModalOpen(false);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500 p-4">{error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Penugasan Pembimbing</h1>
      <div className="overflow-x-auto relative shadow-md sm:rounded-lg">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th scope="col" className="py-3 px-6">Mahasiswa</th>
              <th scope="col" className="py-3 px-6">Judul Tugas Akhir</th>
              <th scope="col" className="py-3 px-6">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {unassignedTAs.length > 0 ? (
              unassignedTAs.map((ta) => (
                <tr key={ta.id} className="bg-white border-b">
                  <td className="py-4 px-6 font-medium">{ta.mahasiswa.user.name} ({ta.mahasiswa.nim})</td>
                  <td className="py-4 px-6">{ta.judul}</td>
                  <td className="py-4 px-6">
                    <button onClick={() => handleOpenModal(ta)} className="font-medium text-blue-600 hover:underline">Tugaskan Pembimbing</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="py-4 px-6 text-center text-gray-500">Tidak ada tugas akhir yang perlu ditugaskan.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <AssignPembimbingModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={fetchData}
        tugasAkhir={selectedTA}
        dosenList={dosenList}
      />
    </div>
  );
}
