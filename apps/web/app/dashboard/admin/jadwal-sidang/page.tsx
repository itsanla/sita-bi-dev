"use client";

import { useEffect, useState, FormEvent } from "react";
import api from "@/lib/api";

// --- Type Definitions ---
interface TugasAkhir {
  judul: string;
  mahasiswa: {
    user: {
      name: string;
    };
  };
}

interface ApprovedRegistration {
  id: number;
  tugas_akhir: TugasAkhir;
  created_at: string;
}

interface Ruangan {
  id: number;
  nama_ruangan: string;
}

interface Dosen {
  id: number;
  user: {
    name: string;
  };
}

// --- Modal Component ---
const JadwalSidangModal = ({
  isOpen,
  onClose,
  registration,
  ruanganList,
  dosenList,
  onJadwalCreated,
}: {
  isOpen: boolean;
  onClose: () => void;
  registration: ApprovedRegistration | null;
  ruanganList: Ruangan[];
  dosenList: Dosen[];
  onJadwalCreated: () => void;
}) => {
  const [tanggal, setTanggal] = useState("");
  const [waktuMulai, setWaktuMulai] = useState("");
  const [waktuSelesai, setWaktuSelesai] = useState("");
  const [ruanganId, setRuanganId] = useState<number | string>("");
  const [pengujiIds, setPengujiIds] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Reset form when registration changes
    setTanggal("");
    setWaktuMulai("");
    setWaktuSelesai("");
    setRuanganId("");
    setPengujiIds([]);
    setError(null);
  }, [registration]);

  if (!isOpen || !registration) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!ruanganId || pengujiIds.length === 0) {
      setError("Ruangan dan minimal 1 penguji harus dipilih.");
      return;
    }
    setSubmitting(true);
    setError(null);

    try {
      await api("/jadwal-sidang", {
        method: 'POST',
        body: {
          pendaftaranSidangId: registration.id,
          tanggal,
          waktu_mulai: waktuMulai,
          waktu_selesai: waktuSelesai,
          ruangan_id: Number(ruanganId),
          pengujiIds,
        }
      });
      onJadwalCreated(); // Callback to refresh the list
      onClose(); // Close modal on success
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error?.response?.data?.message || "Gagal membuat jadwal. Periksa kembali isian Anda.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl">
        <h2 className="text-xl font-bold mb-4">Buat Jadwal Sidang</h2>
        <p className="mb-2">Mahasiswa: <span className="font-semibold">{registration.tugas_akhir.mahasiswa.user.name}</span></p>
        <p className="mb-6">Judul: <span className="font-semibold">{registration.tugas_akhir.judul}</span></p>
        
        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Tanggal Sidang</label>
              <input type="date" value={tanggal} onChange={e => setTanggal(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Ruangan</label>
              <select value={ruanganId} onChange={e => setRuanganId(Number(e.target.value))} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                <option value="" disabled>Pilih Ruangan</option>
                {ruanganList.map(r => <option key={r.id} value={r.id}>{r.nama_ruangan}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Waktu Mulai</label>
              <input type="time" value={waktuMulai} onChange={e => setWaktuMulai(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Waktu Selesai</label>
              <input type="time" value={waktuSelesai} onChange={e => setWaktuSelesai(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
            </div>
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700">Dosen Penguji</label>
            <select 
              multiple 
              value={pengujiIds.map(String)} 
              onChange={e => setPengujiIds(Array.from(e.target.selectedOptions, option => Number(option.value)))} 
              required 
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm h-40"
            >
              {dosenList.map(d => <option key={d.id} value={d.id}>{d.user.name}</option>)}
            </select>
            <p className="text-xs text-gray-500 mt-1">Tahan Ctrl (atau Cmd di Mac) untuk memilih lebih dari satu.</p>
          </div>
          <div className="flex justify-end gap-4">
            <button type="button" onClick={onClose} className="bg-gray-200 py-2 px-4 rounded-lg">Batal</button>
            <button type="submit" disabled={submitting} className="bg-blue-600 text-white py-2 px-4 rounded-lg disabled:bg-blue-300">
              {submitting ? 'Menyimpan...' : 'Simpan Jadwal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- Main Page Component ---
export default function JadwalSidangPage() {
  const [registrations, setRegistrations] = useState<ApprovedRegistration[]>([]);
  const [ruanganList, setRuanganList] = useState<Ruangan[]>([]);
  const [dosenList, setDosenList] = useState<Dosen[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRegistration, setSelectedRegistration] = useState<ApprovedRegistration | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [regResponse, ruanganResponse, dosenResponse] = await Promise.all([
        api<{ data: { data: { data: ApprovedRegistration[] } } }>("/jadwal-sidang/approved-registrations"),
        api<{ data: { data: Ruangan[] } }>("/ruangan"),
        api<{ data: { data: { data: Dosen[] } } }>("/users/dosen"),
      ]);
      setRegistrations(regResponse.data.data.data || []);
      setRuanganList(ruanganResponse.data.data || []);
      setDosenList(dosenResponse.data.data.data || []);
    } catch {
      setError("Gagal memuat data. Pastikan Anda memiliki hak akses yang sesuai.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (reg: ApprovedRegistration) => {
    setSelectedRegistration(reg);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedRegistration(null);
    setIsModalOpen(false);
  };

  const handleJadwalCreated = () => {
    fetchData(); // Refresh data after a new schedule is created
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500 p-4">{error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Manajemen Jadwal Sidang</h1>
      <p className="mb-6">Daftar pengajuan sidang yang telah disetujui dan siap untuk dijadwalkan.</p>
      
      <div className="overflow-x-auto relative shadow-md sm:rounded-lg">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th scope="col" className="py-3 px-6">Nama Mahasiswa</th>
              <th scope="col" className="py-3 px-6">Judul Tugas Akhir</th>
              <th scope="col" className="py-3 px-6">Tanggal Pengajuan</th>
              <th scope="col" className="py-3 px-6">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {registrations.length > 0 ? (
              registrations.map((reg) => (
                <tr key={reg.id} className="bg-white border-b">
                  <td className="py-4 px-6 font-medium text-gray-900 whitespace-nowrap">
                    {reg.tugas_akhir.mahasiswa.user.name}
                  </td>
                  <td className="py-4 px-6">{reg.tugas_akhir.judul}</td>
                  <td className="py-4 px-6">
                    {new Date(reg.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </td>
                  <td className="py-4 px-6">
                    <button 
                      onClick={() => handleOpenModal(reg)} 
                      className="font-medium text-blue-600 hover:underline"
                    >
                      Buat Jadwal
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="py-4 px-6 text-center text-gray-500">
                  Tidak ada pendaftaran yang perlu dijadwalkan saat ini.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <JadwalSidangModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        registration={selectedRegistration}
        ruanganList={ruanganList}
        dosenList={dosenList}
        onJadwalCreated={handleJadwalCreated}
      />
    </div>
  );
}
