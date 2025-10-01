'use client';

import { useEffect, useState } from 'react';
import request from '@/lib/api';
import { useAuth } from '../../../../context/AuthContext';

// --- Interfaces ---
interface Registration {
  id: number;
  status_pembimbing_1: string;
  status_pembimbing_2: string;
  tugasAkhir: {
    judul: string;
    mahasiswa: {
      user: { name: string; };
    };
  };
}

// --- Main Page Component ---
export default function SidangApprovalsPage() {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await request<{ data: Registration[] }>('/pendaftaran-sidang/pending-approvals');
      setRegistrations(data.data);
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

  const handleApprove = async (id: number) => {
    if (!confirm('Are you sure you want to approve this registration?')) return;
    try {
      await request(`/pendaftaran-sidang/${id}/approve`, { method: 'POST' });
      alert('Registration approved!');
      fetchData(); // Refresh list
    } catch (err) {
      alert(`Error: ${err instanceof Error ? err.message : 'An unknown error occurred'}`);
    }
  };

  const handleReject = async (id: number) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;

    try {
      await request(`/pendaftaran-sidang/${id}/reject`, {
        method: 'POST',
        body: { catatan: reason },
      });
      alert('Registration rejected!');
      fetchData(); // Refresh list
    } catch (err) {
      alert(`Error: ${err instanceof Error ? err.message : 'An unknown error occurred'}`);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{ color: 'red' }}>Error: {error}</div>;

  return (
    <div>
      <h2>Pending Defense Registrations</h2>
      {registrations.length === 0 ? (
        <p>No pending approvals.</p>
      ) : (
        <table border={1} style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Student Name</th>
              <th>Thesis Title</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {registrations.map((reg) => (
              <tr key={reg.id}>
                <td>{reg.id}</td>
                <td>{reg.tugasAkhir.mahasiswa.user.name}</td>
                <td>{reg.tugasAkhir.judul}</td>
                <td>
                  <button onClick={() => handleApprove(reg.id)}>Approve</button>
                  <button onClick={() => handleReject(reg.id)}>Reject</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
