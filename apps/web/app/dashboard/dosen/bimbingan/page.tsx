'use client';

import { useEffect, useState, FormEvent } from 'react';
import request from '@/lib/api';
import { useAuth } from '../../../../context/AuthContext';

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
    user: { name: string; email: string; };
  };
  bimbinganTa: BimbinganSession[];
}

// --- Action Components ---
function ScheduleForm({ tugasAkhirId, onActionSuccess }: { tugasAkhirId: number, onActionSuccess: () => void }) {
  const [tanggal, setTanggal] = useState('');
  const [jam, setJam] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await request(`/bimbingan/${tugasAkhirId}/jadwal`, {
        method: 'POST',
        body: { tanggal_bimbingan: tanggal, jam_bimbingan: jam },
      });
      alert('Schedule set successfully!');
      onActionSuccess();
    } catch (err) {
      alert(`Error: ${err instanceof Error ? err.message : 'An unknown error occurred'}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '1rem', alignItems: 'center'}}>
      <input type="date" value={tanggal} onChange={e => setTanggal(e.target.value)} required />
      <input type="time" value={jam} onChange={e => setJam(e.target.value)} required />
      <button type="submit">Set Schedule</button>
    </form>
  );
}

function AddNoteForm({ sessionId, onActionSuccess }: { sessionId: number, onActionSuccess: () => void }) {
    const [catatan, setCatatan] = useState('');
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        try {
            await request('/bimbingan/catatan', {
                method: 'POST',
                body: { bimbingan_ta_id: sessionId, catatan },
            });
            alert('Note added!');
            setCatatan('');
            onActionSuccess();
        } catch (err) {
            alert(`Error: ${err instanceof Error ? err.message : 'An unknown error occurred'}`);
        }
    };
    return (
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.5rem'}}>
            <input type="text" value={catatan} onChange={e => setCatatan(e.target.value)} placeholder="Add a note..." required />
            <button type="submit">Save Note</button>
        </form>
    );
}

// --- Main Page Component ---
export default function DosenBimbinganPage() {
  const { user } = useAuth();
  const [supervisedStudents, setSupervisedStudents] = useState<TugasAkhir[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await request<{ data: { data: TugasAkhir[] } }>('/bimbingan/sebagai-dosen');
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

  const handleSessionAction = async (sessionId: number, action: 'cancel' | 'selesaikan') => {
    if (!confirm(`Are you sure you want to ${action} this session?`)) return;
    try {
        await request(`/bimbingan/sesi/${sessionId}/${action}`, { method: 'POST' });
        alert(`Session ${action}d successfully!`);
        fetchData();
    } catch (err) {
        alert(`Error: ${err instanceof Error ? err.message : 'An unknown error occurred'}`);
    }
  }

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{ color: 'red' }}>Error: {error}</div>;

  return (
    <div>
      <h2>My Supervised Students</h2>
      {supervisedStudents.length === 0 ? (
        <p>You are not currently supervising any students.</p>
      ) : (
        supervisedStudents.map(ta => (
          <div key={ta.id} style={{ border: '1px solid #ccc', padding: '1rem', marginBottom: '1rem' }}>
            <h3>{ta.mahasiswa.user.name} - {ta.judul}</h3>
            <p><strong>Status TA:</strong> {ta.status}</p>
            
            <h4>Schedule New Session:</h4>
            <ScheduleForm tugasAkhirId={ta.id} onActionSuccess={fetchData} />

            <h4 style={{marginTop: '1rem'}}>Supervision Sessions:</h4>
            {ta.bimbinganTa.length > 0 ? (
              <ul style={{ listStyle: 'none', paddingLeft: '0' }}>
                {ta.bimbinganTa.map(session => (
                  <li key={session.id} style={{ border: '1px solid #eee', padding: '1rem', marginTop: '0.5rem'}}>
                    <p><strong>Session ID {session.id} - Status: {session.status_bimbingan}</strong></p>
                    <p>Scheduled for: {new Date(session.tanggal_bimbingan).toLocaleString()}</p>
                    <div>
                      <button onClick={() => handleSessionAction(session.id, 'selesaikan')}>Mark as Complete</button>
                      <button onClick={() => handleSessionAction(session.id, 'cancel')}>Cancel</button>
                    </div>
                    <div>
                      <strong>Notes:</strong>
                      <ul style={{ listStyle: 'disc', paddingLeft: '2rem' }}>
                        {session.catatan.map(c => (
                          <li key={c.id}>{c.author.name}: {c.catatan}</li>
                        ))}
                      </ul>
                      <AddNoteForm sessionId={session.id} onActionSuccess={fetchData} />
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No supervision sessions scheduled yet.</p>
            )}
          </div>
        ))
      )}
    </div>
  );
}
