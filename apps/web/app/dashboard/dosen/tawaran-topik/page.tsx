'use client';

import { useEffect, useState, FormEvent } from 'react';
import request from '@/lib/api';

// --- Interfaces ---
interface TawaranTopik {
  id: number;
  judul_topik: string;
  deskripsi: string;
  kuota: number;
}

interface Application {
  id: number;
  status: string;
  mahasiswa: {
    user: {
      name: string;
      email: string;
    }
  };
  tawaranTopik: {
    judul_topik: string;
  };
}

// --- Child Components ---
function CreateTopikForm({ onTopicCreated }: { onTopicCreated: () => void }) {
  const [judul, setJudul] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [kuota, setKuota] = useState(1);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await request('/tawaran-topik', {
        method: 'POST',
        body: { judul_topik: judul, deskripsi, kuota: Number(kuota) },
      });
      alert('Topic created successfully!');
      setJudul('');
      setDeskripsi('');
      setKuota(1);
      onTopicCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create topic');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ border: '1px solid #ccc', padding: '1rem', marginTop: '1rem' }}>
      <h4>Create New Topic Offer</h4>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div><label>Judul Topik: </label><input type="text" value={judul} onChange={e => setJudul(e.target.value)} required /></div>
      <div><label>Deskripsi: </label><textarea value={deskripsi} onChange={e => setDeskripsi(e.target.value)} required /></div>
      <div><label>Kuota: </label><input type="number" value={kuota} onChange={e => setKuota(parseInt(e.target.value, 10))} min={1} required /></div>
      <button type="submit">Create Topic</button>
    </form>
  );
}

// --- Main Page Component ---
export default function TawaranTopikPage() {
  const [topics, setTopics] = useState<TawaranTopik[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [topicsRes, appsRes] = await Promise.all([
        request<{ data: { data: TawaranTopik[] } }>('/tawaran-topik'),
        request<{ data: { data: Application[] } }>('/tawaran-topik/applications'),
      ]);
      setTopics(topicsRes.data.data);
      setApplications(appsRes.data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApplication = async (appId: number, action: 'approve' | 'reject') => {
    if (!confirm(`Are you sure you want to ${action} this application?`)) return;

    try {
      await request(`/tawaran-topik/applications/${appId}/${action}`, { method: 'POST' });
      alert(`Application ${action}d successfully!`);
      fetchData(); // Refresh all data
    } catch (err) {
      alert(`Failed to ${action} application: ${err instanceof Error ? err.message : 'An unknown error occurred'}`);
    }
  };

  if (error) return <div style={{ color: 'red' }}>Error: {error}</div>;

  return (
    <div>
      <h2>My Topic Offers</h2>
      <button onClick={() => setShowCreateForm(!showCreateForm)}>
        {showCreateForm ? 'Cancel' : 'Create New Topic Offer'}
      </button>
      {showCreateForm && <CreateTopikForm onTopicCreated={() => { fetchData(); setShowCreateForm(false); }} />}
      
      {loading ? <p>Loading...</p> : (
        <table border={1} style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
          <thead><tr><th>ID</th><th>Judul Topik</th><th>Deskripsi</th><th>Kuota</th></tr></thead>
          <tbody>
            {topics.map((topic) => (
              <tr key={topic.id}><td>{topic.id}</td><td>{topic.judul_topik}</td><td>{topic.deskripsi}</td><td>{topic.kuota}</td></tr>
            ))}
          </tbody>
        </table>
      )}

      <h2 style={{ marginTop: '2rem' }}>Pending Applications</h2>
      {loading ? <p>Loading...</p> : (
        <table border={1} style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
          <thead><tr><th>App ID</th><th>Mahasiswa</th><th>Email</th><th>Topic</th><th>Actions</th></tr></thead>
          <tbody>
            {applications.map((app) => (
              <tr key={app.id}>
                <td>{app.id}</td>
                <td>{app.mahasiswa.user.name}</td>
                <td>{app.mahasiswa.user.email}</td>
                <td>{app.tawaranTopik.judul_topik}</td>
                <td>
                  <button onClick={() => handleApplication(app.id, 'approve')}>Approve</button>
                  <button onClick={() => handleApplication(app.id, 'reject')}>Reject</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
