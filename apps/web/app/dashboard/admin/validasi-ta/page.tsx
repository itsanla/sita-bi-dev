"use client";

import { useEffect, useState, FormEvent } from "react";
import api from "@/lib/api";

// --- Type Definitions ---
interface TugasAkhir {
  id: number;
  judul: string;
  mahasiswa: {
    user: { name: string; };
    nim: string;
  };
  tanggal_pengajuan: string;
}

interface KemiripanResult {
  similarTo: string;
  score: number;
}

// --- Modal Components ---
const RejectModal = ({ isOpen, onClose, onSubmit }: { isOpen: boolean; onClose: () => void; onSubmit: (alasan: string) => void; }) => {
  const [alasan, setAlasan] = useState("");
  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(alasan);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <h3 className="text-lg font-bold mb-4">Alasan Penolakan</h3>
        <textarea value={alasan} onChange={e => setAlasan(e.target.value)} required className="w-full p-2 border rounded-md" rows={4}></textarea>
        <div className="flex justify-end gap-4 mt-4">
          <button type="button" onClick={onClose} className="bg-gray-200 py-2 px-4 rounded-lg">Batal</button>
          <button type="submit" className="bg-red-600 text-white py-2 px-4 rounded-lg">Tolak</button>
        </div>
      </form>
    </div>
  );
};

const KemiripanModal = ({ isOpen, onClose, result }: { isOpen: boolean; onClose: () => void; result: KemiripanResult[] | null; }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
        <h3 className="text-lg font-bold mb-4">Hasil Pengecekan Kemiripan</h3>
        {result ? (
          <ul className="list-disc list-inside">
            {result.map((r, i) => <li key={i}>Dokumen mirip dengan <strong>{r.similarTo}</strong> (skor: {r.score.toFixed(2)})</li>)}
          </ul>
        ) : <p>Tidak ditemukan kemiripan signifikan atau data tidak tersedia.</p>}
        <div className="flex justify-end mt-4">
          <button onClick={onClose} className="bg-gray-200 py-2 px-4 rounded-lg">Tutup</button>
        </div>
      </div>
    </div>
  );
};

// --- Main Page Component ---
export default function ValidasiTaPage() {
  const [tas, setTas] = useState<TugasAkhir[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTA, setSelectedTA] = useState<TugasAkhir | null>(null);
  const [isRejectModalOpen, setRejectModalOpen] = useState(false);
  const [isKemiripanModalOpen, setKemiripanModalOpen] = useState(false);
  const [kemiripanResult, setKemiripanResult] = useState<KemiripanResult[] | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await api<{ data: { data: TugasAkhir[] } }>("/tugas-akhir/validasi");
      setTas(response.data.data || []);
    } catch { setError("Gagal memuat data."); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleApprove = async (id: number) => {
    if (!window.confirm("Apakah Anda yakin ingin menyetujui tugas akhir ini?")) return;
    try {
      await api(`/tugas-akhir/${id}/approve`, { method: 'PATCH' });
      fetchData();
    } catch { alert("Gagal menyetujui."); }
  };

  const handleReject = async (alasan: string) => {
    if (!selectedTA) return;
    try {
      await api(`/tugas-akhir/${selectedTA.id}/reject`, { method: 'PATCH', body: { alasan_penolakan: alasan } });
      setRejectModalOpen(false);
      fetchData();
    } catch { alert("Gagal menolak."); }
  };

  const handleCekKemiripan = async (id: number) => {
    try {
      const response = await api<{ data: { data: KemiripanResult[] } }>(`/tugas-akhir/${id}/cek-kemiripan`, { method: 'POST' });
      setKemiripanResult(response.data.data);
      setKemiripanModalOpen(true);
    } catch { alert("Gagal mengecek kemiripan."); }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500 p-4">{error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Validasi Pengajuan Tugas Akhir</h1>
      <div className="overflow-x-auto relative shadow-md sm:rounded-lg">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th className="py-3 px-6">Mahasiswa</th>
              <th className="py-3 px-6">Judul</th>
              <th className="py-3 px-6">Tanggal Pengajuan</th>
              <th className="py-3 px-6">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {tas.length > 0 ? tas.map((ta) => (
              <tr key={ta.id} className="bg-white border-b">
                <td className="py-4 px-6 font-medium">{ta.mahasiswa.user.name} ({ta.mahasiswa.nim})</td>
                <td className="py-4 px-6">{ta.judul}</td>
                <td className="py-4 px-6">{new Date(ta.tanggal_pengajuan).toLocaleDateString('id-ID')}</td>
                <td className="py-4 px-6 flex gap-2">
                  <button onClick={() => handleApprove(ta.id)} className="font-medium text-green-600 hover:underline">Setujui</button>
                  <button onClick={() => { setSelectedTA(ta); setRejectModalOpen(true); }} className="font-medium text-red-600 hover:underline">Tolak</button>
                  <button onClick={() => handleCekKemiripan(ta.id)} className="font-medium text-blue-600 hover:underline">Cek Kemiripan</button>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={4} className="py-4 px-6 text-center">Tidak ada pengajuan yang perlu divalidasi.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <RejectModal isOpen={isRejectModalOpen} onClose={() => setRejectModalOpen(false)} onSubmit={handleReject} />
      <KemiripanModal isOpen={isKemiripanModalOpen} onClose={() => setKemiripanModalOpen(false)} result={kemiripanResult} />
    </div>
  );
}
