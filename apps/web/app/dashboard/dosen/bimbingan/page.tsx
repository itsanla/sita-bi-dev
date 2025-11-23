'use client';

import { useEffect, useState, FormEvent } from 'react';
import request from '@/lib/api';
import { useAuth } from '../../../../context/AuthContext';
import {
  Loader,
  Info,
  CalendarPlus,
  Send,
  CheckCircle,
  XCircle,
  BookOpen,
  MessageSquare,
  History,
  Calendar,
} from 'lucide-react';

// --- Interfaces ---
interface Catatan {
  id: number;
  catatan: string;
  author: { name: string };
  created_at: string;
}

interface Lampiran {
  id: number;
  file_path: string;
  original_name: string;
  created_at: string;
  uploader: { name: string };
}

interface HistoryPerubahan {
  id: number;
  status: string;
  alasan_perubahan: string | null;
  created_at: string;
}

interface BimbinganSession {
  id: number;
  status_bimbingan: string;
  tanggal_bimbingan: string;
  jam_bimbingan: string;
  catatan: Catatan[];
  lampiran: Lampiran[];
  historyPerubahan: HistoryPerubahan[];
}

interface TugasAkhir {
  id: number;
  judul: string;
  status: string;
  mahasiswa: {
    user: { name: string; email: string };
  };
  bimbinganTa: BimbinganSession[];
}

// --- Action Components ---
function ScheduleForm({
  tugasAkhirId,
  onActionSuccess,
}: {
  tugasAkhirId: number;
  onActionSuccess: () => void;
}) {
  const [tanggal, setTanggal] = useState('');
  const [jam, setJam] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await request(`/bimbingan/${tugasAkhirId}/jadwal`, {
        method: 'POST',
        body: { tanggal_bimbingan: tanggal, jam_bimbingan: jam },
      });
      alert('Schedule set successfully!');
      setTanggal('');
      setJam('');
      onActionSuccess();
    } catch (err) {
      alert(
        `Error: ${err instanceof Error ? err.message : 'An unknown error occurred'}`,
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-4 bg-gray-50 rounded-lg border border-gray-200 mt-4"
    >
      <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
        <CalendarPlus size={18} className="text-red-600" />
        Jadwalkan Sesi Baru
      </h4>
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Tanggal
          </label>
          <input
            type="date"
            value={tanggal}
            onChange={(e) => setTanggal(e.target.value)}
            className="px-3 py-2 border rounded-md text-sm"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Waktu
          </label>
          <input
            type="time"
            value={jam}
            onChange={(e) => setJam(e.target.value)}
            className="px-3 py-2 border rounded-md text-sm"
            required
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="px-4 py-2 bg-red-700 text-white rounded-md text-sm hover:bg-red-800 disabled:bg-gray-400 flex items-center"
        >
          {submitting ? (
            <Loader className="animate-spin mr-2" size={16} />
          ) : (
            'Simpan Jadwal'
          )}
        </button>
      </div>
    </form>
  );
}

function AddNoteForm({
  sessionId,
  onActionSuccess,
}: {
  sessionId: number;
  onActionSuccess: () => void;
}) {
  const [catatan, setCatatan] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await request('/bimbingan/catatan', {
        method: 'POST',
        body: { bimbingan_ta_id: sessionId, catatan },
      });
      setCatatan('');
      onActionSuccess();
    } catch (err) {
      alert(
        `Error: ${err instanceof Error ? err.message : 'An unknown error occurred'}`,
      );
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 mt-3">
      <input
        type="text"
        value={catatan}
        onChange={(e) => setCatatan(e.target.value)}
        placeholder="Tambah catatan..."
        className="flex-grow px-3 py-2 border rounded-md text-sm"
        required
      />
      <button
        type="submit"
        disabled={submitting}
        className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
      >
        {submitting ? (
          <Loader className="animate-spin" size={16} />
        ) : (
          <Send size={16} />
        )}
      </button>
    </form>
  );
}

// --- Main Page Component ---
export default function DosenBimbinganPage() {
  const { user } = useAuth();
  const [supervisedStudents, setSupervisedStudents] = useState<TugasAkhir[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await request<{ data: { data: TugasAkhir[] } }>(
        '/bimbingan/sebagai-dosen',
      );
      setSupervisedStudents(data.data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const handleSessionAction = async (
    sessionId: number,
    action: 'cancel' | 'selesaikan',
  ) => {
    if (!confirm(`Are you sure you want to ${action} this session?`)) return;
    try {
      await request(`/bimbingan/sesi/${sessionId}/${action}`, {
        method: 'POST',
      });
      alert(`Session ${action}ed successfully!`);
      fetchData();
    } catch (err) {
      alert(
        `Error: ${err instanceof Error ? err.message : 'An unknown error occurred'}`,
      );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-10">
        <Loader className="animate-spin text-maroon-700" size={32} />
        <span className="ml-4 text-lg text-gray-600">
          Memuat data bimbingan...
        </span>
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
    <div className="space-y-8 pb-20">
      <h1 className="text-3xl font-bold text-gray-800">Mahasiswa Bimbingan</h1>

      {supervisedStudents.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center text-gray-500 bg-white p-12 rounded-2xl shadow-lg">
          <Info size={48} className="mb-4 text-gray-400" />
          <h2 className="text-xl font-semibold">
            Tidak Ada Mahasiswa Bimbingan
          </h2>
          <p className="mt-1">
            Saat ini Anda tidak sedang membimbing mahasiswa manapun.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {supervisedStudents.map((ta) => (
            <div key={ta.id} className="bg-white p-6 rounded-2xl shadow-lg">
              <div className="mb-6 border-b pb-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  {ta.mahasiswa.user.name}
                </h2>
                <p className="text-md text-gray-600 mt-1">{ta.judul}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-sm font-medium text-gray-500">
                    Status TA:
                  </span>
                  <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs font-bold rounded-full">
                    {ta.status}
                  </span>
                </div>
              </div>

              <ScheduleForm tugasAkhirId={ta.id} onActionSuccess={fetchData} />

              <div className="mt-8">
                <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                  <BookOpen size={20} className="mr-2 text-gray-500" /> Riwayat
                  Sesi Bimbingan
                </h4>

                {ta.bimbinganTa.length > 0 ? (
                  <div className="space-y-4">
                    {ta.bimbinganTa.map((session) => (
                      <div
                        key={session.id}
                        className={`rounded-lg border overflow-hidden ${
                          session.status_bimbingan === 'selesai'
                            ? 'border-green-200 bg-green-50/30'
                            : session.status_bimbingan === 'dibatalkan'
                              ? 'border-red-200 bg-red-50/30'
                              : 'border-blue-200 bg-white'
                        }`}
                      >
                        {/* Session Header */}
                        <div
                          className={`px-4 py-3 flex justify-between items-center border-b ${
                            session.status_bimbingan === 'selesai'
                              ? 'bg-green-50'
                              : session.status_bimbingan === 'dibatalkan'
                                ? 'bg-red-50'
                                : 'bg-blue-50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`p-1.5 rounded-full ${
                                session.status_bimbingan === 'selesai'
                                  ? 'bg-green-200 text-green-700'
                                  : session.status_bimbingan === 'dibatalkan'
                                    ? 'bg-red-200 text-red-700'
                                    : 'bg-blue-200 text-blue-700'
                              }`}
                            >
                              <Calendar size={16} />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-gray-800">
                                {new Date(
                                  session.tanggal_bimbingan,
                                ).toLocaleDateString('id-ID')}{' '}
                                • {session.jam_bimbingan || '-'}
                              </p>
                            </div>
                          </div>
                          <span
                            className={`text-xs font-bold uppercase px-2 py-1 rounded ${
                              session.status_bimbingan === 'selesai'
                                ? 'bg-green-200 text-green-800'
                                : session.status_bimbingan === 'dibatalkan'
                                  ? 'bg-red-200 text-red-800'
                                  : 'bg-blue-200 text-blue-800'
                            }`}
                          >
                            {session.status_bimbingan}
                          </span>
                        </div>

                        <div className="p-4">
                          {/* Actions for Scheduled Sessions */}
                          {session.status_bimbingan === 'dijadwalkan' && (
                            <div className="flex items-center gap-3 mb-4 pb-4 border-b">
                              <button
                                onClick={() =>
                                  handleSessionAction(session.id, 'selesaikan')
                                }
                                className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded hover:bg-green-700 transition-colors"
                              >
                                <CheckCircle size={14} />
                                Tandai Selesai
                              </button>
                              <button
                                onClick={() =>
                                  handleSessionAction(session.id, 'cancel')
                                }
                                className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded hover:bg-red-700 transition-colors"
                              >
                                <XCircle size={14} />
                                Batalkan Sesi
                              </button>
                            </div>
                          )}

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Catatan Section */}
                            <div>
                              <h5 className="text-xs font-bold text-gray-500 uppercase mb-2 flex items-center gap-1">
                                <MessageSquare size={12} /> Diskusi & Catatan
                              </h5>
                              <div className="bg-gray-50 rounded border p-3 max-h-40 overflow-y-auto space-y-2">
                                {session.catatan.map((c) => (
                                  <div key={c.id} className="text-sm">
                                    <span className="font-bold text-gray-800 text-xs">
                                      {c.author.name}:{' '}
                                    </span>
                                    <span className="text-gray-600">
                                      {c.catatan}
                                    </span>
                                  </div>
                                ))}
                                {session.catatan.length === 0 && (
                                  <p className="text-xs text-gray-400 italic">
                                    Belum ada catatan.
                                  </p>
                                )}
                              </div>
                              <AddNoteForm
                                sessionId={session.id}
                                onActionSuccess={fetchData}
                              />
                            </div>

                            {/* Lampiran & History Section */}
                            <div className="space-y-4">
                              <div>
                                <h5 className="text-xs font-bold text-gray-500 uppercase mb-2">
                                  Lampiran
                                </h5>
                                {session.lampiran &&
                                session.lampiran.length > 0 ? (
                                  <ul className="space-y-1">
                                    {session.lampiran.map((f) => (
                                      <li
                                        key={f.id}
                                        className="text-xs text-blue-600 underline truncate"
                                      >
                                        {f.original_name}
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p className="text-xs text-gray-400 italic">
                                    Tidak ada lampiran.
                                  </p>
                                )}
                              </div>

                              {session.historyPerubahan &&
                                session.historyPerubahan.length > 0 && (
                                  <div>
                                    <h5 className="text-xs font-bold text-gray-500 uppercase mb-2 flex items-center gap-1">
                                      <History size={12} /> Log Aktivitas
                                    </h5>
                                    <div className="space-y-1">
                                      {session.historyPerubahan
                                        .slice(0, 3)
                                        .map((h) => (
                                          <p
                                            key={h.id}
                                            className="text-[10px] text-gray-500"
                                          >
                                            <span className="font-semibold">
                                              {h.status}
                                            </span>{' '}
                                            -{' '}
                                            {new Date(
                                              h.created_at,
                                            ).toLocaleDateString()}
                                          </p>
                                        ))}
                                    </div>
                                  </div>
                                )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed">
                    <p className="text-gray-500 text-sm">
                      Belum ada sesi bimbingan. Jadwalkan sesi baru di atas.
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
