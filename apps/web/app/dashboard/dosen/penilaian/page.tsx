'use client';

import { useEffect, useState, FormEvent } from 'react';
import request from '@/lib/api';
import { useAuth } from '../../../../context/AuthContext';

// --- Interfaces ---
interface Nilai {
  id: number;
  aspek: string;
  skor: number;
}

interface Sidang {
  id: number;
  tugasAkhir: {
    judul: string;
    mahasiswa: { user: { name: string } };
  };
  jadwalSidang: { tanggal: string; waktu_mulai: string; ruangan: { nama_ruangan: string } }[];
  nilaiSidang: Nilai[];
}

// --- Child Components ---
function PenilaianForm({ sidangId, onScoringSuccess }: { sidangId: number, onScoringSuccess: () => void }) {
  const [aspek, setAspek] = useState('');
  const [skor, setSkor] = useState(80);
  const [komentar, setKomentar] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await request('/penilaian', {
        method: 'POST',
        body: { sidang_id: sidangId, aspek, skor: Number(skor), komentar },
      });
      alert('Score submitted successfully!');
      setAspek('');
      setSkor(80);
      setKomentar('');
      onScoringSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit score');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ border: '1px solid #ddd', padding: '1rem', marginTop: '1rem' }}>
      <h4>Submit New Score</h4>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div><label>Aspek Penilaian: </label><input type="text" value={aspek} onChange={e => setAspek(e.target.value)} required /></div>
      <div><label>Skor (0-100): </label><input type="number" value={skor} onChange={e => setSkor(Number(e.target.value))} required /></div>
      <div><label>Komentar: </label><textarea value={komentar} onChange={e => setKomentar(e.target.value)} required /></div>
      <button type="submit">Submit Score</button>
    </form>
  );
}

// --- Main Page Component ---
export default function PenilaianPage() {
  const { user } = useAuth();
  const [assignedSidang, setAssignedSidang] = useState<Sidang[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await request<{ data: { data: Sidang[] } }>('/jadwal-sidang/for-penguji');
      setAssignedSidang(data.data.data);
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

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{ color: 'red' }}>Error: {error}</div>;

  return (
    <div>
      <h2>Assigned Defenses for Scoring</h2>
      {assignedSidang.length === 0 ? (
        <p>You have no defenses to score at the moment.</p>
      ) : (
        assignedSidang.map(sidang => (
          <div key={sidang.id} style={{ border: '1px solid #ccc', padding: '1rem', marginBottom: '1rem' }}>
            <h3>{sidang.tugasAkhir.mahasiswa.user.name} - {sidang.tugasAkhir.judul}</h3>
            {sidang.jadwalSidang[0] && (
              <p><strong>Schedule:</strong> {new Date(sidang.jadwalSidang[0].tanggal).toLocaleDateString()} at {sidang.jadwalSidang[0].waktu_mulai} in {sidang.jadwalSidang[0].ruangan.nama_ruangan}</p>
            )}
            
            <h4>Scores You&apos;ve Given:</h4>
            {sidang.nilaiSidang.length > 0 ? (
              <ul>
                {sidang.nilaiSidang.map(n => <li key={n.id}>{n.aspek}: {n.skor}</li>)}
              </ul>
            ) : <p>No scores submitted yet.</p>}

            <PenilaianForm sidangId={sidang.id} onScoringSuccess={fetchData} />
          </div>
        ))
      )}
    </div>
  );
}
