'use client';

import { useEffect, useState } from 'react';
import request from '@/lib/api';
import { useAuth } from '../../../../context/AuthContext';

// --- Interfaces ---
interface PengajuanBimbingan {
  id: number;
  status: string;
  diinisiasi_oleh: 'mahasiswa' | 'dosen';
  mahasiswa: {
    user: { name: string; email: string };
    nim: string;
  };
  // We only need student info for the lecturer's view
}

// --- Main Page Component ---
export default function PengajuanBimbinganPage() {
  const { user } = useAuth();
  const [proposals, setProposals] = useState<PengajuanBimbingan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await request<{ data: PengajuanBimbingan[] }>(
        '/pengajuan/dosen',
      );
      setProposals(response.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch proposals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  // --- Handlers ---
  const handleAccept = async (pengajuanId: number) => {
    if (!confirm('Are you sure you want to accept this student for supervision?')) return;
    try {
      await request(`/pengajuan/${pengajuanId}/terima`, { method: 'POST' });
      alert('Student accepted successfully!');
      fetchData();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleReject = async (pengajuanId: number) => {
    if (!confirm('Are you sure you want to reject this student?')) return;
    try {
      await request(`/pengajuan/${pengajuanId}/tolak`, { method: 'POST' });
      alert('Student rejected.');
      fetchData();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleCancel = async (pengajuanId: number) => {
    if (!confirm('Are you sure you want to cancel this offer?')) return;
    try {
      await request(`/pengajuan/${pengajuanId}/batalkan`, { method: 'POST' });
      alert('Offer cancelled.');
      fetchData();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  if (loading) return <div className="text-center p-8">Loading...</div>;
  if (error) return <div className="text-center p-8 text-red-600">Error: {error}</div>;

  const incomingRequests = proposals.filter(p => p.diinisiasi_oleh === 'mahasiswa' && p.status === 'MENUNGGU_PERSETUJUAN_DOSEN');
  const sentOffers = proposals.filter(p => p.diinisiasi_oleh === 'dosen');

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-800">Supervision Proposals</h1>
      
      {/* Incoming Requests from Students */}
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Incoming Student Requests</h2>
        <div className="space-y-4">
          {incomingRequests.length > 0 ? (
            incomingRequests.map(p => (
              <div key={p.id} className="p-4 border rounded-lg flex justify-between items-center">
                <div>
                  <p className="font-bold text-gray-900">{p.mahasiswa.user.name}</p>
                  <p className="text-sm text-gray-500">NIM: {p.mahasiswa.nim}</p>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => handleAccept(p.id)} className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700">Accept</button>
                  <button onClick={() => handleReject(p.id)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300">Reject</button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 py-6">No incoming requests from students.</p>
          )}
        </div>
      </div>

      {/* Offers Sent to Students */}
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">My Sent Offers</h2>
        <div className="space-y-4">
          {sentOffers.length > 0 ? (
            sentOffers.map(p => (
              <div key={p.id} className="p-4 border rounded-lg flex justify-between items-center">
                <div>
                  <p className="font-bold text-gray-900">{p.mahasiswa.user.name}</p>
                  <p className="text-sm text-gray-500">Status: <span className="font-medium">{p.status.replace(/_/g, ' ')}</span></p>
                </div>
                {p.status === 'MENUNGGU_PERSETUJUAN_MAHASISWA' && (
                  <button onClick={() => handleCancel(p.id)} className="px-4 py-2 text-sm font-medium text-red-600 bg-red-100 rounded-lg hover:bg-red-200">Cancel Offer</button>
                )}
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 py-6">You have not sent any offers.</p>
          )}
        </div>
      </div>
    </div>
  );
}
