'use client';

import { useEffect, useState, FormEvent } from 'react';
import request from '@/lib/api';
import { useAuth } from '../../../../context/AuthContext';

// --- Interfaces ---
interface TugasAkhir {
  id: number;
  judul: string;
  status: string;
  peranDosenTa: { peran: string; dosen: { user: { name: string } } }[];
}

interface TawaranTopik {
  id: number;
  judul_topik: string;
  deskripsi: string;
  dosenPencetus: { user: { name: string } };
}

// --- Main Page Component ---
export default function TugasAkhirPage() {
  const { user } = useAuth();
  const [tugasAkhir, setTugasAkhir] = useState<TugasAkhir | null>(null);
  const [availableTopics, setAvailableTopics] = useState<TawaranTopik[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [judulMandiri, setJudulMandiri] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      // Check for active TA first
      const taResponse = await request<{ status: string, data: TugasAkhir | null }>('/bimbingan/sebagai-mahasiswa');
      
      if (taResponse.data) {
        setTugasAkhir(taResponse.data);
      } else {
        // If no active TA, fetch available topics
        setTugasAkhir(null);
        try {
          const topicsResponse = await request<{ 
            status: string, 
            data: { data: TawaranTopik[] } 
          }>('/tawaran-topik/available');
          
          if (topicsResponse.data && Array.isArray(topicsResponse.data.data)) {
            setAvailableTopics(topicsResponse.data.data);
          } else {
            setAvailableTopics([]); // Fallback to empty array
          }
        } catch (topicsErr: unknown) {
          if (topicsErr instanceof Error) {
            setError(topicsErr.message || 'Failed to fetch available topics');
          } else {
            setError('An unknown error occurred while fetching topics.');
          }
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'Failed to fetch data');
      } else {
        setError('An unknown error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const handleApply = async (topicId: number) => {
    if (!confirm('Are you sure you want to apply for this topic?')) return;
    try {
      await request(`/tawaran-topik/${topicId}/apply`, { method: 'POST' });
      alert('Successfully applied for the topic! Please wait for lecturer approval.');
      fetchData(); // Refresh data
    } catch (err: unknown) {
      if (err instanceof Error) {
        alert(`Error applying: ${err.message}`);
      } else {
        alert('An unknown error occurred while applying.');
      }
    }
  };

  const handleMandiriSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!confirm('Are you sure you want to submit this title?')) return;
    try {
      await request('/tugas-akhir', { 
        method: 'POST',
        body: JSON.stringify({ judul: judulMandiri })
      });
      alert('Successfully submitted title for approval.');
      fetchData(); // Refresh data
    } catch (err: unknown) {
      if (err instanceof Error) {
        alert(`Error submitting title: ${err.message}`);
      } else {
        alert('An unknown error occurred while submitting title.');
      }
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{ color: 'red' }}>Error: {error}</div>;

  // --- Render Logic ---
  if (tugasAkhir) {
    // Render current TA status
    return (
      <div>
        <h2>My Final Project</h2>
        <p><strong>Title:</strong> {tugasAkhir.judul}</p>
        <p><strong>Status:</strong> {tugasAkhir.status}</p>
        <h4>Supervisors:</h4>
        <ul>
          {tugasAkhir.peranDosenTa && tugasAkhir.peranDosenTa.length > 0 ? (
            tugasAkhir.peranDosenTa.map(p => (
              <li key={p.peran}>{p.peran}: {p.dosen.user.name}</li>
            ))
          ) : (
            <li>Belum ada dosen pembimbing yang ditugaskan.</li>
          )}
        </ul>
      </div>
    );
  } else {
    // Render topic list and self-proposal form
    return (
      <div>
        <h2>Propose a Final Project</h2>
        <p>You do not have an active final project. You can apply for an existing topic or propose your own.</p>
        
        <hr style={{ margin: '2rem 0' }} />

        <h3>Propose Your Own Title</h3>
        <form onSubmit={handleMandiriSubmit}>
          <div>
            <label>Judul TA: </label>
            <input type="text" value={judulMandiri} onChange={e => setJudulMandiri(e.target.value)} required style={{ width: '400px' }}/>
          </div>
          <button type="submit">Submit for Approval</button>
        </form>

        <hr style={{ margin: '2rem 0' }} />

        <h3>Available Topics from Lecturers</h3>
        <table border={1} style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr><th>ID</th><th>Judul Topik</th><th>Deskripsi</th><th>Dosen</th><th>Action</th></tr>
          </thead>
          <tbody>
            {availableTopics.map(topic => (
              <tr key={topic.id}>
                <td>{topic.id}</td>
                <td>{topic.judul_topik}</td>
                <td>{topic.deskripsi}</td>
                <td>{topic.dosenPencetus.user.name}</td>
                <td><button onClick={() => handleApply(topic.id)}>Apply</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
}