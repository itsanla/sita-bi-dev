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
  Trash2,
} from 'lucide-react';

// --- Interfaces ---
interface Catatan {
  id: number;
  catatan: string;
  author: { name: string };
  created_at: string;
}

interface BimbinganSession {
  id: number;
  status_bimbingan: string;
  tanggal_bimbingan: string;
  jam_bimbingan: string;
  catatan: Catatan[];
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
      <h4 className="font-semibold text-gray-800 mb-2">Jadwalkan Sesi Baru</h4>
      <div className="flex flex-wrap items-center gap-4">
        <input
          type="date"
          value={tanggal}
          onChange={(e) => setTanggal(e.target.value)}
          className="input-styling"
          required
        />
        <input
          type="time"
          value={jam}
          onChange={(e) => setJam(e.target.value)}
          className="input-styling"
          required
        />
        <button
          type="submit"
          disabled={submitting}
          className="btn-primary inline-flex items-center"
        >
          {submitting ? (
            <Loader className="animate-spin mr-2" size={16} />
          ) : (
            <CalendarPlus size={16} className="mr-2" />
          )}
          Atur Jadwal
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
        className="input-styling flex-grow"
        required
      />
      <button type="submit" disabled={submitting} className="btn-secondary p-2">
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
    <div className="space-y-8">
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
        <div className="space-y-6">
          {supervisedStudents.map((ta) => (
            <div key={ta.id} className="bg-white p-6 rounded-2xl shadow-lg">
              <div className="mb-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  {ta.mahasiswa.user.name}
                </h2>
                <p className="text-md text-gray-600">{ta.judul}</p>
                <p className="text-sm font-medium text-gray-500 mt-1">
                  Status TA:{' '}
                  <span className="font-bold text-maroon-800">{ta.status}</span>
                </p>
              </div>

              <ScheduleForm tugasAkhirId={ta.id} onActionSuccess={fetchData} />

              <div className="mt-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-2 flex items-center">
                  <BookOpen size={20} className="mr-2" /> Sesi Bimbingan
                </h4>
                {ta.bimbinganTa.length > 0 ? (
                  <div className="space-y-4">
                    {ta.bimbinganTa.map((session) => (
                      <div
                        key={session.id}
                        className="bg-gray-50 p-4 rounded-lg border"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <p className="font-semibold text-gray-800">
                            Sesi ID: {session.id}
                          </p>
                          <span
                            className={`px-3 py-1 text-xs font-bold rounded-full ${session.status_bimbingan === 'DIJADWALKAN' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}
                          >
                            {session.status_bimbingan}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          Jadwal:{' '}
                          {new Date(session.tanggal_bimbingan).toLocaleString()}
                        </p>

                        <div className="flex items-center gap-2 mt-3">
                          <button
                            onClick={() =>
                              handleSessionAction(session.id, 'selesaikan')
                            }
                            className="btn-sm-success"
                          >
                            <CheckCircle size={14} className="mr-1" />{' '}
                            Selesaikan
                          </button>
                          <button
                            onClick={() =>
                              handleSessionAction(session.id, 'cancel')
                            }
                            className="btn-sm-danger"
                          >
                            <XCircle size={14} className="mr-1" /> Batalkan
                          </button>
                        </div>

                        <div className="mt-4 pt-3 border-t">
                          <h5 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                            <MessageSquare size={16} className="mr-2" /> Catatan
                          </h5>
                          <div className="space-y-2">
                            {session.catatan.map((c) => (
                              <div
                                key={c.id}
                                className="text-sm text-gray-800 bg-white p-2 rounded-md shadow-sm"
                              >
                                <strong>{c.author.name}:</strong> {c.catatan}
                              </div>
                            ))}
                            {session.catatan.length === 0 && (
                              <p className="text-xs text-gray-500">
                                Belum ada catatan.
                              </p>
                            )}
                          </div>
                          <AddNoteForm
                            sessionId={session.id}
                            onActionSuccess={fetchData}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 bg-gray-50 p-4 rounded-lg">
                    Belum ada sesi bimbingan yang dijadwalkan.
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Add some global styles for inputs and buttons to avoid repetition
// This can be in a global CSS file, but for this example, we'll just imagine it.
const globalStyles = `
  .input-styling {
    @apply mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-maroon-500 focus:border-maroon-500 sm:text-sm;
  }
  .btn-primary {
    @apply inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-maroon-700 hover:bg-maroon-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-maroon-500 disabled:bg-gray-400 transition;
  }
  .btn-secondary {
    @apply inline-flex items-center justify-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-maroon-500 disabled:bg-gray-300 transition;
  }
  .btn-sm-success {
    @apply inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition;
  }
  .btn-sm-danger {
    @apply inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition;
  }
`;

// You would typically add these classes to your tailwind.config.js or a global CSS file.
// For now, this comment serves as a reference for the class names used.
