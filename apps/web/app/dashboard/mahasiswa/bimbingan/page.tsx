'use client';

import { useEffect, useState, FormEvent } from 'react';
import request from '@/lib/api';
import { useAuth } from '../../../../context/AuthContext';
import { Book, Plus, Send, CheckCircle, Clock, User, Mail, Shield, X, ThumbsUp } from 'lucide-react';

// --- Interfaces ---
interface TugasAkhir {
  id: number;
  judul: string;
  status: string;
  peranDosenTa: { peran: string; dosen: { user: { name: string } } }[];
}

interface Dosen {
  id: number;
  name: string;
  email: string;
  nidn: string;
}

interface PengajuanBimbingan {
  id: number;
  dosen_id: number;
  mahasiswa_id: number;
  status: string; 
  diinisiasi_oleh: 'mahasiswa' | 'dosen';
  dosen: {
    user: { name: string };
  };
}

// --- Main Page Component ---
export default function BimbinganPage() {
  const { user } = useAuth();
  const [tugasAkhir, setTugasAkhir] = useState<TugasAkhir | null>(null);
  const [availableDosen, setAvailableDosen] = useState<Dosen[]>([]);
  const [pengajuan, setPengajuan] = useState<PengajuanBimbingan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const taResponse = await request<{ data: TugasAkhir | null }>(
        '/bimbingan/sebagai-mahasiswa',
      );

      if (taResponse.data && taResponse.data.peranDosenTa.length > 0) {
        setTugasAkhir(taResponse.data);
      } else {
        setTugasAkhir(null);
        const pengajuanResponse = await request<{ data: PengajuanBimbingan[] }>(
          '/pengajuan/mahasiswa'
        );
        setPengajuan(pengajuanResponse.data || []);

        const dosenResponse = await request<{ data: { data: Dosen[] } }>(
          '/users/dosen'
        );
        setAvailableDosen(dosenResponse.data.data || []);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const handleAjukan = async (dosenId: number) => {
    if (!confirm('Are you sure you want to send a supervision request to this lecturer?')) return;
    try {
      await request('/pengajuan/mahasiswa', { 
        method: 'POST', 
        body: { dosenId }
      });
      alert('Request sent successfully!');
      fetchData();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleBatalkan = async (pengajuanId: number) => {
    if (!confirm('Are you sure you want to cancel this request?')) return;
     try {
      await request(`/pengajuan/${pengajuanId}/batalkan`, { method: 'POST' });
      alert('Request cancelled.');
      fetchData();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleTerima = async (pengajuanId: number) => {
    if (!confirm('Are you sure you want to accept this supervision offer?')) return;
    try {
      await request(`/pengajuan/${pengajuanId}/terima`, { method: 'POST' });
      alert('Offer accepted! You now have a supervisor.');
      fetchData();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleTolak = async (pengajuanId: number) => {
    if (!confirm('Are you sure you want to reject this offer?')) return;
    try {
      await request(`/pengajuan/${pengajuanId}/tolak`, { method: 'POST' });
      alert('Offer rejected.');
      fetchData();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  if (loading) return <div className="text-center p-8">Loading...</div>;
  if (error) return <div className="text-center p-8 text-red-600">Error: {error}</div>;

  if (tugasAkhir) {
    // This part of the UI should be the actual supervision log/timeline.
    // For now, we just show the assigned supervisor info.
    return (
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Proses Bimbingan</h1>
         <div>
            <h3 className="text-sm font-medium text-gray-500">Pembimbing</h3>
            <ul className="mt-2 space-y-2">
              {tugasAkhir.peranDosenTa?.length > 0 ? (
                tugasAkhir.peranDosenTa.map((p) => (
                  <li key={p.peran} className="flex items-center gap-3 text-gray-700">
                    <span className="font-semibold capitalize w-28">{p.peran}:</span>
                    <span>{p.dosen.user.name}</span>
                  </li>
                ))
              ) : (
                <li className="text-gray-500 italic">No supervisors assigned yet.</li>
              )}
            </ul>
          </div>
      </div>
    );
  } else {
    const outgoingRequests = pengajuan.filter(p => p.diinisiasi_oleh === 'mahasiswa');
    const incomingOffers = pengajuan.filter(p => p.diinisiasi_oleh === 'dosen');
    const canSendRequest = outgoingRequests.filter(p => p.status === 'MENUNGGU_PERSETUJUAN_DOSEN').length < 3;

    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Pencarian Pembimbing</h1>
          <p className="mt-2 text-gray-600">
            Anda belum memiliki pembimbing. Ajukan diri ke dosen atau terima tawaran yang masuk.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-2xl font-semibold text-gray-800">Dosen Tersedia</h2>
            <div className="space-y-4">
              {availableDosen.map(dosen => (
                <div key={dosen.id} className="bg-white p-4 rounded-lg shadow-sm border flex items-center justify-between">
                  <div>
                    <p className="font-bold text-lg text-gray-900">{dosen.name}</p>
                    <p className="text-sm text-gray-500">{dosen.email}</p>
                  </div>
                  <button
                    onClick={() => handleAjukan(dosen.id)}
                    disabled={!canSendRequest}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-red-800 text-white font-semibold rounded-lg hover:bg-red-900 transition-colors text-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    <Send size={14} />
                    Kirim Pengajuan
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Tawaran Masuk</h2>
              <div className="space-y-3">
                {incomingOffers.length > 0 ? (
                  incomingOffers.map(p => (
                    <div key={p.id} className="bg-white p-4 rounded-lg shadow-sm border border-blue-300">
                      <p className="text-sm text-gray-600">
                        <span className="font-bold text-blue-800">{p.dosen.user.name}</span> ingin menjadi pembimbing Anda.
                      </p>
                      <div className="flex gap-2 mt-3">
                        <button onClick={() => handleTerima(p.id)} className="w-full text-sm px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700">Terima</button>
                        <button onClick={() => handleTolak(p.id)} className="w-full text-sm px-3 py-1 bg-gray-200 text-gray-800 rounded hover:bg-gray-300">Tolak</button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-center text-gray-500 py-4">Tidak ada tawaran masuk.</p>
                )}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Pengajuan Terkirim ({outgoingRequests.length}/3)</h2>
              <div className="space-y-3">
                {outgoingRequests.length > 0 ? (
                  outgoingRequests.map(p => (
                    <div key={p.id} className="bg-white p-4 rounded-lg shadow-sm border flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-gray-800">{p.dosen.user.name}</p>
                        <p className="text-xs text-gray-500">Status: {p.status.replace(/_/g, ' ')}</p>
                      </div>
                      {p.status === 'MENUNGGU_PERSETUJUAN_DOSEN' && (
                        <button onClick={() => handleBatalkan(p.id)} className="text-xs text-red-600 hover:underline">Batalkan</button>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-center text-gray-500 py-4">Anda belum mengirim pengajuan.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}