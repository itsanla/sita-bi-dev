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
  bimbinganTa: BimbinganSession[];
}

// --- Main Page Component ---
export default function BimbinganPage() {
  const { user } = useAuth();
  const [tugasAkhir, setTugasAkhir] = useState<TugasAkhir | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [note, setNote] = useState('');
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await request<{ status: string, data: TugasAkhir | null }>('/bimbingan/sebagai-mahasiswa');
      setTugasAkhir(response.data);
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

  const handleNoteSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedSessionId) {
      alert('Please select a session to add a note to.');
      return;
    }
    try {
      await request('/bimbingan/catatan', {
        method: 'POST',
        body: JSON.stringify({ bimbingan_ta_id: selectedSessionId, catatan: note }),
      });
      alert('Note added successfully!');
      setNote('');
      setSelectedSessionId(null);
      fetchData(); // Refresh data
    } catch (err) {
      alert(`Error adding note: ${err instanceof Error ? err.message : 'An unknown error occurred'}`);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{ color: 'red' }}>Error: {error}</div>;
  if (!tugasAkhir) return <div>No active final project found.</div>;

  return (
    <div>
      <h2>Supervision Log for: {tugasAkhir.judul}</h2>

      <div style={{ marginTop: '2rem' }}>
        <h3>Add a New Note</h3>
        <form onSubmit={handleNoteSubmit}>
          <div>
            <label>Select Session: </label>
            <select 
              value={selectedSessionId || ''} 
              onChange={e => setSelectedSessionId(Number(e.target.value))}
              required
            >
              <option value="" disabled>-- Select a session --</option>
              {tugasAkhir.bimbinganTa.map(session => (
                <option key={session.id} value={session.id}>
                  Session ID: {session.id} ({new Date(session.tanggal_bimbingan).toLocaleDateString()})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label>Note: </label>
            <textarea 
              value={note} 
              onChange={e => setNote(e.target.value)} 
              required 
              style={{ width: '100%', minHeight: '80px' }}
            />
          </div>
          <button type="submit">Add Note</button>
        </form>
      </div>

      <hr style={{ margin: '2rem 0' }} />

      <h3>Supervision History</h3>
      {tugasAkhir.bimbinganTa.map(session => (
        <div key={session.id} style={{ border: '1px solid #ccc', padding: '1rem', marginBottom: '1rem' }}>
          <h4>Session ID: {session.id}</h4>
          <p><strong>Date:</strong> {new Date(session.tanggal_bimbingan).toLocaleString()}</p>
          <p><strong>Status:</strong> {session.status_bimbingan}</p>
          <h5>Notes:</h5>
          <ul style={{ listStyle: 'none', paddingLeft: '1rem' }}>
            {session.catatan.map(c => (
              <li key={c.id} style={{ borderBottom: '1px solid #eee', padding: '0.5rem 0'}}>
                <strong>{c.author.name}:</strong> {c.catatan} 
                <em style={{ fontSize: '0.8em', color: '#555' }}> ({new Date(c.created_at).toLocaleString()})</em>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
